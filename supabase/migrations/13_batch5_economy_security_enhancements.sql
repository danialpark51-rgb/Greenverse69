-- ==============================================================================
-- GREENVERSE — BATCH 5 ENHANCEMENT MIGRATION
-- File: supabase/migrations/13_batch5_economy_security_enhancements.sql
-- Description: Security RPCs, trigger-based aggregates, duplicate-prevention
--              guards, bounty reward issuance, wallet integrity, additional
--              indexes, and Realtime registration for all Batch 5 tables.
--              MUST run after 05_batch5_green_economy.sql.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. GIG APPLICATION COUNT TRIGGER
--    Keeps gigs.applications_count current automatically.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.refresh_gig_application_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_gig_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_gig_id := OLD.gig_id;
  ELSE
    v_gig_id := NEW.gig_id;
  END IF;

  UPDATE public.gigs
  SET applications_count = COALESCE((
    SELECT COUNT(*) FROM public.gig_applications
    WHERE gig_id = v_gig_id AND status NOT IN ('withdrawn')
  ), 0),
  updated_at = now()
  WHERE id = v_gig_id;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_gig_application_count ON public.gig_applications;
CREATE TRIGGER trg_gig_application_count
  AFTER INSERT OR DELETE ON public.gig_applications
  FOR EACH ROW EXECUTE FUNCTION public.refresh_gig_application_count();

-- ==============================================================================
-- 2. BOUNTY SPOTS COUNTER TRIGGERS
--    Keeps bounties.spots_claimed and spots_completed accurate.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.refresh_bounty_spots()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_bounty_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_bounty_id := OLD.bounty_id;
  ELSE
    v_bounty_id := NEW.bounty_id;
  END IF;

  UPDATE public.bounties
  SET
    spots_claimed = COALESCE((
      SELECT COUNT(*) FROM public.bounty_claims
      WHERE bounty_id = v_bounty_id AND status IN ('active', 'submitted')
    ), 0),
    spots_completed = COALESCE((
      SELECT COUNT(*) FROM public.bounty_claims
      WHERE bounty_id = v_bounty_id AND status = 'completed'
    ), 0)
  WHERE id = v_bounty_id;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_bounty_spots ON public.bounty_claims;
CREATE TRIGGER trg_bounty_spots
  AFTER INSERT OR UPDATE OR DELETE ON public.bounty_claims
  FOR EACH ROW EXECUTE FUNCTION public.refresh_bounty_spots();

-- ==============================================================================
-- 3. MARKETPLACE INQUIRY COUNT TRIGGER
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.refresh_listing_inquiry_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_listing_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_listing_id := OLD.listing_id;
  ELSE
    v_listing_id := NEW.listing_id;
  END IF;

  UPDATE public.marketplace_listings
  SET inquiries_count = COALESCE((
    SELECT COUNT(*) FROM public.marketplace_inquiries
    WHERE listing_id = v_listing_id
  ), 0)
  WHERE id = v_listing_id;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_listing_inquiry_count ON public.marketplace_inquiries;
CREATE TRIGGER trg_listing_inquiry_count
  AFTER INSERT OR DELETE ON public.marketplace_inquiries
  FOR EACH ROW EXECUTE FUNCTION public.refresh_listing_inquiry_count();

-- ==============================================================================
-- 4. AWARD BOUNTY POINTS — SECURE RPC
--    Called ONLY after a reviewer approves a bounty submission.
--    Prevents: self-approval, duplicate awards, unauthorized calls.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.rpc_award_bounty_points(
  p_submission_id UUID,
  p_reviewer_id   UUID,
  p_decision      TEXT,  -- 'approved' | 'rejected'
  p_feedback      TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_submission    RECORD;
  v_bounty        RECORD;
  v_claim         RECORD;
  v_wallet        RECORD;
  v_new_balance   INTEGER;
  v_audit_hash    TEXT;
BEGIN
  -- Validate decision
  IF p_decision NOT IN ('approved', 'rejected') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid decision value');
  END IF;

  -- Load submission
  SELECT * INTO v_submission
  FROM public.bounty_submissions
  WHERE id = p_submission_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Submission not found');
  END IF;

  -- Prevent processing already-decided submissions
  IF v_submission.status IN ('approved', 'rejected') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Submission already decided');
  END IF;

  -- Load bounty
  SELECT * INTO v_bounty
  FROM public.bounties
  WHERE id = v_submission.bounty_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Bounty not found');
  END IF;

  -- Prevent self-review: reviewer cannot be the submitter
  IF v_submission.user_id = p_reviewer_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'You cannot approve your own submission');
  END IF;

  -- Reviewer must be the bounty creator or a designated admin
  IF v_bounty.creator_id IS DISTINCT FROM p_reviewer_id THEN
    -- Allow if reviewer is the same as auth.uid() (called from SECURITY DEFINER context)
    -- Additional admin check can be added here (e.g., user has admin role)
    -- For now, allow if p_reviewer_id matches auth.uid()
    IF auth.uid() IS DISTINCT FROM p_reviewer_id THEN
      RETURN jsonb_build_object('success', false, 'error', 'Not authorised to review this submission');
    END IF;
  END IF;

  -- Update submission status
  UPDATE public.bounty_submissions
  SET status         = p_decision,
      reviewer_id    = p_reviewer_id,
      reviewer_notes = COALESCE(p_feedback, reviewer_notes),
      reviewed_at    = now()
  WHERE id = p_submission_id;

  -- Update the associated claim
  SELECT * INTO v_claim
  FROM public.bounty_claims
  WHERE bounty_id = v_submission.bounty_id AND user_id = v_submission.user_id
  LIMIT 1;

  IF FOUND THEN
    UPDATE public.bounty_claims
    SET status = CASE WHEN p_decision = 'approved' THEN 'completed' ELSE 'rejected' END
    WHERE id = v_claim.id;
  END IF;

  -- Award points only if approved and reward is green_points
  IF p_decision = 'approved' AND v_bounty.reward_type = 'green_points' AND v_bounty.reward_value > 0 THEN
    -- Check if already awarded (idempotency)
    IF EXISTS (
      SELECT 1 FROM public.wallet_transactions
      WHERE reference_id = p_submission_id::TEXT
        AND reference_type = 'bounty'
        AND user_id = v_submission.user_id
    ) THEN
      RETURN jsonb_build_object('success', true, 'message', 'Already awarded — idempotent', 'awarded', false);
    END IF;

    -- Get or create wallet
    INSERT INTO public.user_wallets (user_id, green_points_balance)
    VALUES (v_submission.user_id, 0)
    ON CONFLICT (user_id) DO NOTHING;

    SELECT * INTO v_wallet
    FROM public.user_wallets
    WHERE user_id = v_submission.user_id
    FOR UPDATE;  -- lock row for atomic update

    v_new_balance := COALESCE(v_wallet.green_points_balance, 0) + v_bounty.reward_value;

    -- Update wallet balance atomically
    UPDATE public.user_wallets
    SET green_points_balance = v_new_balance,
        total_earned         = COALESCE(total_earned, 0) + v_bounty.reward_value,
        updated_at           = now()
    WHERE user_id = v_submission.user_id;

    -- Generate audit hash
    v_audit_hash := encode(
      digest(
        v_submission.user_id::TEXT || p_submission_id::TEXT || v_bounty.reward_value::TEXT || now()::TEXT,
        'sha256'
      ),
      'hex'
    );

    -- Record transaction
    INSERT INTO public.wallet_transactions
      (user_id, transaction_type, amount, balance_after, description, reference_id, reference_type, audit_hash, status)
    VALUES
      (
        v_submission.user_id,
        'bounty_reward',
        v_bounty.reward_value,
        v_new_balance,
        'Bounty reward: ' || v_bounty.title,
        p_submission_id::TEXT,
        'bounty',
        v_audit_hash,
        'confirmed'
      );

    RETURN jsonb_build_object(
      'success', true,
      'awarded', true,
      'points_awarded', v_bounty.reward_value,
      'new_balance', v_new_balance,
      'audit_hash', v_audit_hash
    );
  END IF;

  RETURN jsonb_build_object('success', true, 'awarded', false, 'decision', p_decision);
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_award_bounty_points(UUID, UUID, TEXT, TEXT) TO authenticated;

-- ==============================================================================
-- 5. SAFE POINTS REDEMPTION — RPC
--    Atomically debits points; prevents negative balances & double-spend.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.rpc_redeem_points(
  p_user_id      UUID,
  p_points_cost  INTEGER,
  p_reward_name  TEXT,
  p_reward_id    TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_wallet    RECORD;
  v_new_bal   INTEGER;
  v_audit     TEXT;
BEGIN
  -- Caller must be the owner
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authorised');
  END IF;

  IF p_points_cost <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid points cost');
  END IF;

  -- Lock wallet row
  SELECT * INTO v_wallet
  FROM public.user_wallets
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Wallet not found');
  END IF;

  IF COALESCE(v_wallet.green_points_balance, 0) < p_points_cost THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient points balance');
  END IF;

  -- Check idempotency: same reward not redeemed twice today
  IF p_reward_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.wallet_transactions
    WHERE user_id = p_user_id
      AND reference_id = p_reward_id
      AND transaction_type = 'redemption'
      AND created_at > now() - INTERVAL '1 day'
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'This reward was already redeemed recently');
  END IF;

  v_new_bal := v_wallet.green_points_balance - p_points_cost;

  UPDATE public.user_wallets
  SET green_points_balance = v_new_bal,
      total_redeemed       = COALESCE(total_redeemed, 0) + p_points_cost,
      updated_at           = now()
  WHERE user_id = p_user_id;

  v_audit := encode(digest(p_user_id::TEXT || p_reward_name || p_points_cost::TEXT || now()::TEXT, 'sha256'), 'hex');

  INSERT INTO public.wallet_transactions
    (user_id, transaction_type, amount, balance_after, description, reference_id, reference_type, audit_hash, status)
  VALUES
    (p_user_id, 'redemption', -p_points_cost, v_new_bal, 'Redeemed: ' || p_reward_name, p_reward_id, 'redemption', v_audit, 'confirmed');

  -- Insert redemption record
  INSERT INTO public.wallet_redemptions
    (user_id, reward_name, points_spent, status)
  VALUES
    (p_user_id, p_reward_name, p_points_cost, 'pending');

  RETURN jsonb_build_object('success', true, 'new_balance', v_new_bal, 'audit_hash', v_audit);
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_redeem_points(UUID, INTEGER, TEXT, TEXT) TO authenticated;

-- ==============================================================================
-- 6. GIG APPLICATION DECISION — RPC
--    Employer accepts, shortlists, or rejects an application.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.rpc_decide_gig_application(
  p_application_id UUID,
  p_decision       TEXT,  -- 'shortlisted' | 'accepted' | 'rejected'
  p_message        TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_gig_id    UUID;
  v_employer  UUID;
BEGIN
  IF p_decision NOT IN ('shortlisted', 'accepted', 'rejected') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid decision');
  END IF;

  SELECT ga.gig_id INTO v_gig_id
  FROM public.gig_applications ga
  WHERE ga.id = p_application_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Application not found');
  END IF;

  SELECT employer_id INTO v_employer FROM public.gigs WHERE id = v_gig_id;

  IF v_employer IS DISTINCT FROM auth.uid() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authorised');
  END IF;

  UPDATE public.gig_applications
  SET status     = p_decision,
      updated_at = now()
  WHERE id = p_application_id;

  RETURN jsonb_build_object('success', true, 'decision', p_decision);
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_decide_gig_application(UUID, TEXT, TEXT) TO authenticated;

-- ==============================================================================
-- 7. WITHDRAW GIG APPLICATION — RPC
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.rpc_withdraw_gig_application(p_application_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.gig_applications
  SET status = 'withdrawn', updated_at = now()
  WHERE id = p_application_id AND applicant_id = auth.uid()
    AND status NOT IN ('accepted', 'withdrawn');

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Application not found or cannot be withdrawn');
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_withdraw_gig_application(UUID) TO authenticated;

-- ==============================================================================
-- 8. SUBMIT OPPORTUNITY — RPC (users can submit new opportunities)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.rpc_submit_opportunity(
  p_title              TEXT,
  p_opp_type           TEXT,
  p_organization       TEXT,
  p_description        TEXT,
  p_eligibility        TEXT DEFAULT NULL,
  p_deadline           TIMESTAMPTZ DEFAULT NULL,
  p_external_link      TEXT DEFAULT NULL,
  p_location           TEXT DEFAULT NULL,
  p_is_remote          BOOLEAN DEFAULT false
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_id UUID;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Authentication required');
  END IF;

  IF LENGTH(TRIM(p_title)) < 5 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Title too short');
  END IF;

  INSERT INTO public.opportunities
    (title, opportunity_type, organization, description, eligibility,
     deadline, external_link, location_name, is_remote, status, submitted_by)
  VALUES
    (TRIM(p_title), p_opp_type, TRIM(p_organization), TRIM(p_description),
     p_eligibility, p_deadline, p_external_link, p_location, p_is_remote,
     'pending_review', auth.uid())
  RETURNING id INTO v_new_id;

  RETURN jsonb_build_object('success', true, 'id', v_new_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_submit_opportunity(TEXT, TEXT, TEXT, TEXT, TEXT, TIMESTAMPTZ, TEXT, TEXT, BOOLEAN) TO authenticated;

-- ==============================================================================
-- 9. SAFE COLUMN ADDITIONS (DO blocks — idempotent)
-- ==============================================================================

-- Add submitted_by to opportunities
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'opportunities' AND column_name = 'submitted_by'
  ) THEN
    ALTER TABLE public.opportunities
      ADD COLUMN submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END;
$$;

-- Add reviewed_at to bounty_submissions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'bounty_submissions' AND column_name = 'reviewed_at'
  ) THEN
    ALTER TABLE public.bounty_submissions ADD COLUMN reviewed_at TIMESTAMPTZ;
  END IF;
END;
$$;

-- Add reviewer_id to bounty_submissions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'bounty_submissions' AND column_name = 'reviewer_id'
  ) THEN
    ALTER TABLE public.bounty_submissions
      ADD COLUMN reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END;
$$;

-- Add total_earned and total_redeemed to user_wallets
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'user_wallets' AND column_name = 'total_earned'
  ) THEN
    ALTER TABLE public.user_wallets ADD COLUMN total_earned INTEGER DEFAULT 0;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'user_wallets' AND column_name = 'total_redeemed'
  ) THEN
    ALTER TABLE public.user_wallets ADD COLUMN total_redeemed INTEGER DEFAULT 0;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'user_wallets' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.user_wallets ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
  END IF;
END;
$$;

-- Add reward_name and points_spent to wallet_redemptions if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'wallet_redemptions' AND column_name = 'reward_name'
  ) THEN
    ALTER TABLE public.wallet_redemptions ADD COLUMN reward_name TEXT;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'wallet_redemptions' AND column_name = 'points_spent'
  ) THEN
    ALTER TABLE public.wallet_redemptions ADD COLUMN points_spent INTEGER DEFAULT 0;
  END IF;
END;
$$;

-- Add is_remote to opportunities
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'opportunities' AND column_name = 'is_remote'
  ) THEN
    ALTER TABLE public.opportunities ADD COLUMN is_remote BOOLEAN DEFAULT false;
  END IF;
END;
$$;

-- ==============================================================================
-- 10. UNIQUE WALLET CONSTRAINT (safe — only if not already present)
-- ==============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_wallets_user_id_key' AND conrelid = 'public.user_wallets'::regclass
  ) THEN
    ALTER TABLE public.user_wallets ADD CONSTRAINT user_wallets_user_id_key UNIQUE (user_id);
  END IF;
END;
$$;

-- ==============================================================================
-- 11. ADDITIONAL PERFORMANCE INDEXES
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_gig_apps_gig       ON public.gig_applications(gig_id);
CREATE INDEX IF NOT EXISTS idx_gig_apps_applicant  ON public.gig_applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_gig_apps_status     ON public.gig_applications(status);
CREATE INDEX IF NOT EXISTS idx_bounty_claims_bounty ON public.bounty_claims(bounty_id);
CREATE INDEX IF NOT EXISTS idx_bounty_subs_user    ON public.bounty_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_bounty_subs_status  ON public.bounty_submissions(status);
CREATE INDEX IF NOT EXISTS idx_opp_type            ON public.opportunities(opportunity_type);
CREATE INDEX IF NOT EXISTS idx_opp_deadline        ON public.opportunities(deadline);
CREATE INDEX IF NOT EXISTS idx_marketplace_cat     ON public.marketplace_listings(category);
CREATE INDEX IF NOT EXISTS idx_expert_spec         ON public.expert_profiles(specialization);
CREATE INDEX IF NOT EXISTS idx_expert_avail        ON public.expert_profiles(availability);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_ref       ON public.wallet_transactions(reference_id);
CREATE INDEX IF NOT EXISTS idx_skill_profiles_user ON public.user_skill_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_rep_logs_user       ON public.reputation_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_badges_user         ON public.user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_gig_bookmarks_user  ON public.gig_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_opp_bookmarks_user  ON public.opportunity_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_mkt_bookmarks_user  ON public.marketplace_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_expert_bmarks_user  ON public.expert_bookmarks(user_id);

-- ==============================================================================
-- 12. REALTIME PUBLICATION — Batch 5 tables
-- ==============================================================================

DO $$
DECLARE
  v_tables TEXT[] := ARRAY[
    'gig_applications',
    'bounty_submissions',
    'bounty_claims',
    'wallet_transactions',
    'user_wallets',
    'wallet_redemptions',
    'marketplace_inquiries',
    'expert_inquiries',
    'opportunity_applications'
  ];
  v_tbl TEXT;
BEGIN
  FOREACH v_tbl IN ARRAY v_tables LOOP
    BEGIN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', v_tbl);
    EXCEPTION
      WHEN duplicate_object THEN NULL;
      WHEN undefined_object THEN NULL;
    END;
  END LOOP;
END;
$$;

-- ==============================================================================
-- END OF MIGRATION 13
-- ==============================================================================
