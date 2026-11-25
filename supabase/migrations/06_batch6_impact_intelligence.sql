-- ==============================================================================
-- GREENVERSE MIGRATION 06: BATCH 6 - IMPACT & INTELLIGENCE
-- ==============================================================================

-- 1. TREE PROTECTOR & CANOPY DEFENSE RECORDS
CREATE TABLE IF NOT EXISTS public.tree_protection_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tree_id UUID REFERENCES public.trees(id) ON DELETE SET NULL,
    reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reporter_name TEXT NOT NULL,
    reporter_email TEXT,
    tree_species TEXT,
    threat_category TEXT NOT NULL, -- 'unauthorized_cutting', 'root_damage', 'trunk_branch_damage', 'construction_threat', 'barrier_needed', 'disease_infestation', 'heritage_nomination', 'expert_needed'
    severity TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    urgency TEXT NOT NULL DEFAULT 'routine', -- 'routine', 'urgent', 'emergency'
    location_name TEXT NOT NULL,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    description TEXT NOT NULL,
    photo_urls TEXT[] DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'submitted', -- 'submitted', 'under_review', 'action_needed', 'in_progress', 'resolved', 'closed'
    assigned_responder_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    assigned_responder_name TEXT,
    responder_notes TEXT,
    is_heritage BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tree_protection_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES public.tree_protection_reports(id) ON DELETE CASCADE,
    responder_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    responder_name TEXT NOT NULL,
    update_text TEXT NOT NULL,
    evidence_url TEXT,
    status_change_to TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CENTRALIZED GREEN VERIFICATION ENGINE
CREATE TABLE IF NOT EXISTS public.verification_queue_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_type TEXT NOT NULL, -- 'tree_planting', 'tree_care', 'project_milestone', 'bounty_completion', 'green_event', 'tree_protection'
    reference_id TEXT NOT NULL, -- ID of the underlying tree, bounty submission, etc.
    submitter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    submitter_name TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    evidence_urls TEXT[] DEFAULT '{}',
    location_name TEXT,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    status TEXT NOT NULL DEFAULT 'submitted', -- 'submitted', 'under_review', 'approved', 'rejected', 'needs_more_evidence'
    reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewer_name TEXT,
    reviewer_notes TEXT,
    reward_points INT DEFAULT 0,
    reward_issued BOOLEAN DEFAULT FALSE,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ
);

-- 3. GREEN REWARDS ENGINE & CONFIGURABLE RULES
CREATE TABLE IF NOT EXISTS public.reward_rules (
    id TEXT PRIMARY KEY,
    action_key TEXT UNIQUE NOT NULL, -- 'verified_tree_planting', 'verified_tree_care', 'approved_bounty', 'green_event_rsvp', 'project_milestone', 'tree_protection_report', 'volunteer_shift', 'community_challenge'
    action_name TEXT NOT NULL,
    points_reward INT NOT NULL DEFAULT 50,
    reputation_points INT NOT NULL DEFAULT 10,
    badge_key TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    max_claims_per_user INT DEFAULT 0, -- 0 for unlimited
    verification_required BOOLEAN DEFAULT TRUE
);

-- Seed baseline reward rules
INSERT INTO public.reward_rules (id, action_key, action_name, points_reward, reputation_points, badge_key, is_active, verification_required)
VALUES
    ('rule-tree-planting', 'verified_tree_planting', 'Verified Native Tree Planting', 100, 25, 'first_tree', true, true),
    ('rule-tree-care', 'verified_tree_care', 'Logged & Verified Juvenile Tree Care Task', 40, 10, 'tree_carer', true, true),
    ('rule-bounty', 'approved_bounty', 'Completed Ecological Restoration Bounty', 80, 20, 'bounty_hunter', true, true),
    ('rule-event', 'green_event_rsvp', 'Attended Community Environmental Drive', 50, 15, 'community_guardian', true, false),
    ('rule-protection', 'tree_protection_report', 'Verified Threat or Heritage Tree Report', 60, 15, 'tree_protector', true, true),
    ('rule-volunteer', 'volunteer_shift', 'Verified Environmental Volunteer Shift (per hour)', 20, 5, 'active_volunteer', true, true)
ON CONFLICT (id) DO NOTHING;

-- 4. GREEN ACHIEVEMENTS & MILESTONES
CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_key TEXT NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL, -- 'tree_planting', 'tree_care', 'biodiversity', 'community', 'teamwork', 'volunteering', 'projects', 'events', 'bounties', 'tree_protection', 'consistency', 'skills'
    tier TEXT NOT NULL DEFAULT 'beginner', -- 'beginner', 'intermediate', 'advanced', 'special'
    badge_icon TEXT NOT NULL DEFAULT 'Award',
    description TEXT NOT NULL,
    criteria_description TEXT NOT NULL,
    progress_current INT DEFAULT 0,
    progress_target INT NOT NULL DEFAULT 1,
    is_unlocked BOOLEAN DEFAULT FALSE,
    unlocked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, achievement_key)
);

-- 5. GREEN CHANGE MONITOR & BEFORE/AFTER TIMELINES
CREATE TABLE IF NOT EXISTS public.green_change_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_name TEXT NOT NULL,
    location_name TEXT NOT NULL,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    baseline_date DATE NOT NULL,
    latest_date DATE NOT NULL,
    baseline_photo_url TEXT NOT NULL,
    latest_photo_url TEXT NOT NULL,
    baseline_canopy_pct NUMERIC(5, 2) DEFAULT 0,
    latest_canopy_pct NUMERIC(5, 2) DEFAULT 0,
    trees_planted_count INT DEFAULT 0,
    vegetation_increase_pct NUMERIC(5, 2) DEFAULT 0,
    notes TEXT NOT NULL,
    data_source TEXT NOT NULL DEFAULT 'ground_photogrammetry', -- 'ground_photogrammetry', 'community_audit', 'drone_lidar', 'sentinel_composite'
    time_horizon_period TEXT NOT NULL DEFAULT 'seasonal', -- 'monthly', 'seasonal', 'annual'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. AGGREGATED PERSONAL IMPACT METRICS
CREATE TABLE IF NOT EXISTS public.personal_impact_metrics (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    trees_planted_total INT DEFAULT 0,
    trees_verified INT DEFAULT 0,
    trees_reported INT DEFAULT 0,
    trees_under_care INT DEFAULT 0,
    survival_rate_pct NUMERIC(5, 2) DEFAULT 88.5,
    projects_participated INT DEFAULT 0,
    volunteer_hours NUMERIC(8, 2) DEFAULT 0,
    bounties_completed INT DEFAULT 0,
    challenges_won INT DEFAULT 0,
    events_attended INT DEFAULT 0,
    protections_logged INT DEFAULT 0,
    green_points_earned INT DEFAULT 0,
    co2_sequestered_kg NUMERIC(12, 2) DEFAULT 0,
    last_synced_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY — BATCH 6
-- ==============================================================================
ALTER TABLE public.tree_protection_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tree_protection_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_queue_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.green_change_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_impact_metrics ENABLE ROW LEVEL SECURITY;

-- ── Tree Protection Reports ───────────────────────────────
-- Public can read all reports (community transparency)
CREATE POLICY "Public read protection reports"
  ON public.tree_protection_reports FOR SELECT USING (true);

CREATE POLICY "Authenticated submit protection reports"
  ON public.tree_protection_reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Reporters update own reports"
  ON public.tree_protection_reports FOR UPDATE
  TO authenticated
  USING (auth.uid() = reporter_id);

-- ── Tree Protection Updates ───────────────────────────────
CREATE POLICY "Public read protection updates"
  ON public.tree_protection_updates FOR SELECT USING (true);

CREATE POLICY "Authenticated post protection updates"
  ON public.tree_protection_updates FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = responder_id);

-- ── Verification Queue ─────────────────────────────────────
-- Users can read and submit their own items
CREATE POLICY "Users read own verification items"
  ON public.verification_queue_items FOR SELECT
  TO authenticated
  USING (auth.uid() = submitter_id);

CREATE POLICY "Authenticated submit for verification"
  ON public.verification_queue_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = submitter_id);

-- ── Reward Rules ──────────────────────────────────────────
-- Public can read active reward rules (transparency)
CREATE POLICY "Public read reward rules"
  ON public.reward_rules FOR SELECT USING (is_active = true);

-- ── User Achievements ─────────────────────────────────────
CREATE POLICY "Users read own achievements"
  ON public.user_achievements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Achievements are only created/updated by service_role backend
-- No direct user inserts permitted

-- ── Green Change Records ──────────────────────────────────
CREATE POLICY "Public read change records"
  ON public.green_change_records FOR SELECT USING (true);

CREATE POLICY "Authenticated submit change records"
  ON public.green_change_records FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ── Personal Impact Metrics ───────────────────────────────
-- Users can only read their own metrics; mutations via service_role
CREATE POLICY "Users read own impact metrics"
  ON public.personal_impact_metrics FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- ── GRANTS — Batch 6 tables ───────────────────────────────
-- anon: limited public read
GRANT SELECT ON public.tree_protection_reports TO anon;
GRANT SELECT ON public.tree_protection_updates TO anon;
GRANT SELECT ON public.reward_rules TO anon;
GRANT SELECT ON public.green_change_records TO anon;
-- anon has NO access to: verification queue, achievements, personal metrics

-- authenticated: targeted DML; RLS enforces row-level rules
GRANT SELECT, INSERT, UPDATE ON public.tree_protection_reports TO authenticated;
GRANT SELECT, INSERT ON public.tree_protection_updates TO authenticated;
GRANT SELECT, INSERT ON public.verification_queue_items TO authenticated;
GRANT SELECT ON public.reward_rules TO authenticated;
GRANT SELECT ON public.user_achievements TO authenticated;
GRANT SELECT, INSERT ON public.green_change_records TO authenticated;
GRANT SELECT ON public.personal_impact_metrics TO authenticated;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_protection_reports_reporter ON public.tree_protection_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_protection_reports_status ON public.tree_protection_reports(status);
CREATE INDEX IF NOT EXISTS idx_verification_queue_submitter ON public.verification_queue_items(submitter_id);
CREATE INDEX IF NOT EXISTS idx_verification_queue_status ON public.verification_queue_items(status);
CREATE INDEX IF NOT EXISTS idx_achievements_user ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_key ON public.user_achievements(achievement_key);
CREATE INDEX IF NOT EXISTS idx_change_records_location ON public.green_change_records(latitude, longitude);

-- ── Trigger: Sync personal_impact_metrics when trees are added ────────────────
-- This trigger updates the personal impact metrics table whenever a tree
-- is registered in the trees table (from Batch 1). It runs as SECURITY DEFINER
-- to allow the update from the anon role if needed.
CREATE OR REPLACE FUNCTION public.sync_tree_planting_impact()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF NEW.planted_by IS NOT NULL THEN
    INSERT INTO public.personal_impact_metrics (user_id, trees_planted_total, co2_sequestered_kg, last_synced_at)
    VALUES (NEW.planted_by, 1, 21.77, NOW())
    ON CONFLICT (user_id) DO UPDATE SET
      trees_planted_total = personal_impact_metrics.trees_planted_total + 1,
      -- Avg CO2 sequestration: ~21.77 kg/year for a typical broadleaf tree (FAO estimate)
      co2_sequestered_kg = personal_impact_metrics.co2_sequestered_kg + 21.77,
      last_synced_at = NOW();
  END IF;
  RETURN NEW;
END;
$$;

-- Only create the trigger if the trees table exists (Batch 1 prerequisite)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'trees') THEN
    DROP TRIGGER IF EXISTS trg_sync_tree_planting_impact ON public.trees;
    CREATE TRIGGER trg_sync_tree_planting_impact
      AFTER INSERT ON public.trees
      FOR EACH ROW
      EXECUTE FUNCTION public.sync_tree_planting_impact();
  END IF;
END $$;

-- ── Function: Award green points (called by service_role only) ─────────────────
-- This is intentionally NOT exposed to anon or authenticated directly.
-- Frontend calls should go through a Supabase Edge Function or RPC
-- that validates the action before calling this function as service_role.
CREATE OR REPLACE FUNCTION public.award_green_points(
  p_user_id UUID,
  p_action_key TEXT,
  p_description TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_rule public.reward_rules%ROWTYPE;
  v_wallet public.user_wallets%ROWTYPE;
  v_new_balance INT;
  v_tx_id UUID;
BEGIN
  -- Get active reward rule
  SELECT * INTO v_rule FROM public.reward_rules
  WHERE action_key = p_action_key AND is_active = TRUE LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Reward rule not found or inactive');
  END IF;

  -- Get or create wallet
  INSERT INTO public.user_wallets (user_id, green_points_balance, total_points_earned)
  VALUES (p_user_id, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT * INTO v_wallet FROM public.user_wallets WHERE user_id = p_user_id FOR UPDATE;

  v_new_balance := v_wallet.green_points_balance + v_rule.points_reward;

  -- Update wallet
  UPDATE public.user_wallets SET
    green_points_balance = v_new_balance,
    total_points_earned = total_points_earned + v_rule.points_reward,
    last_transaction_at = NOW()
  WHERE user_id = p_user_id;

  -- Record transaction
  INSERT INTO public.wallet_transactions (
    user_id, transaction_type, amount, balance_after, description, status, audit_hash
  ) VALUES (
    p_user_id,
    'reward_credit',
    v_rule.points_reward,
    v_new_balance,
    COALESCE(p_description, v_rule.action_name),
    'confirmed',
    encode(sha256((p_user_id::text || p_action_key || NOW()::text)::bytea), 'hex')
  ) RETURNING id INTO v_tx_id;

  -- Update personal impact metrics
  UPDATE public.personal_impact_metrics SET
    green_points_earned = green_points_earned + v_rule.points_reward,
    last_synced_at = NOW()
  WHERE user_id = p_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'points_awarded', v_rule.points_reward,
    'new_balance', v_new_balance,
    'transaction_id', v_tx_id
  );
END;
$$;

-- Revoke direct access to award_green_points from anon and authenticated
-- Only service_role (backend) can call it
REVOKE ALL ON FUNCTION public.award_green_points(UUID, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.award_green_points(UUID, TEXT, TEXT) FROM anon;
REVOKE ALL ON FUNCTION public.award_green_points(UUID, TEXT, TEXT) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.award_green_points(UUID, TEXT, TEXT) TO service_role;
