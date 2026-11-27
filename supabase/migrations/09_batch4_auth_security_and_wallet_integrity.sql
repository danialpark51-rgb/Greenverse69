-- ==============================================================================
-- GREENVERSE MIGRATION 09: BATCH 4 - AUTHENTICATION, SECURITY & WALLET INTEGRITY
-- ==============================================================================
-- Description:
--   1. Automatic wallet creation on user registration (handle_new_user trigger upgrade)
--   2. Wallet backfill for any existing auth.users without a user_wallets row
--   3. Secure RPC: get_or_create_user_wallet() (SECURITY DEFINER)
--   4. Secure RPC: redeem_wallet_points() (atomic, server-side balance validation, debit transaction)
--   5. Secure RPC: review_bounty_submission() (bounty creator/admin authorization, points awarding)
--   6. RLS hardening on bounty_submissions (UPDATE policy for creator/admin)
--   7. RLS hardening on verification_queue_items (SELECT/UPDATE policies for reviewer/admin)
--   8. Hardening on green_change_records (add recorded_by UUID, enforce ownership on INSERT)
-- ==============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 1: UPGRADE handle_new_user TO AUTO-CREATE WALLET WITH WELCOME BONUS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
    -- 1. Create or update profile
    INSERT INTO public.profiles (
        id, full_name, email, role, avatar_url, organization, created_at, updated_at
    )
    VALUES (
        NEW.id,
        COALESCE(
            NULLIF(NEW.raw_user_meta_data->>'full_name', ''),
            NULLIF(NEW.raw_user_meta_data->>'name', ''),
            NULLIF(split_part(NEW.email, '@', 1), ''),
            'Citizen Forester'
        ),
        NEW.email,
        'Citizen Forester',
        COALESCE(
            NULLIF(NEW.raw_user_meta_data->>'avatar_url', ''),
            NULLIF(NEW.raw_user_meta_data->>'picture', ''),
            ''
        ),
        COALESCE(NULLIF(NEW.raw_user_meta_data->>'organization', ''), ''),
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email        = COALESCE(EXCLUDED.email, public.profiles.email),
        full_name    = COALESCE(NULLIF(public.profiles.full_name, ''), EXCLUDED.full_name),
        avatar_url   = COALESCE(NULLIF(public.profiles.avatar_url, ''), EXCLUDED.avatar_url),
        organization = COALESCE(NULLIF(public.profiles.organization, ''), EXCLUDED.organization),
        updated_at   = NOW();

    -- 2. Initialize green wallet with 100 welcome bonus points
    INSERT INTO public.user_wallets (
        user_id,
        green_points_balance,
        total_points_earned,
        total_points_redeemed,
        pending_points,
        currency,
        is_locked,
        last_activity_at,
        created_at
    )
    VALUES (
        NEW.id,
        100,
        100,
        0,
        0,
        'VERD_PTS',
        FALSE,
        NOW(),
        NOW()
    )
    ON CONFLICT (user_id) DO NOTHING;

    -- 3. Record welcome bonus transaction in wallet_transactions
    INSERT INTO public.wallet_transactions (
        user_id,
        transaction_type,
        amount,
        status,
        reference_id,
        reference_type,
        description,
        balance_after,
        audit_hash,
        created_at
    )
    SELECT
        NEW.id,
        'welcome_bonus',
        100,
        'completed',
        NEW.id::text,
        'signup',
        'Welcome to Greenverse: Starter Forest Stewardship Points',
        100,
        encode(sha256((NEW.id::text || 'welcome_bonus' || NOW()::text)::bytea), 'hex'),
        NOW()
    WHERE NOT EXISTS (
        SELECT 1 FROM public.wallet_transactions
        WHERE user_id = NEW.id AND transaction_type = 'welcome_bonus'
    );

    -- 4. Initialize personal impact metrics baseline
    INSERT INTO public.personal_impact_metrics (
        user_id,
        trees_planted_total,
        trees_verified,
        green_points_earned,
        last_synced_at
    )
    VALUES (
        NEW.id,
        0,
        0,
        100,
        NOW()
    )
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 2: BACKFILL WALLETS FOR EXISTING AUTH USERS
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO public.user_wallets (
    user_id,
    green_points_balance,
    total_points_earned,
    total_points_redeemed,
    currency,
    is_locked,
    last_activity_at,
    created_at
)
SELECT
    u.id,
    100,
    100,
    0,
    'VERD_PTS',
    FALSE,
    NOW(),
    NOW()
FROM auth.users u
LEFT JOIN public.user_wallets w ON w.user_id = u.id
WHERE w.user_id IS NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 3: SECURE RPC: get_or_create_user_wallet()
-- ─────────────────────────────────────────────────────────────────────────────
-- Allows authenticated users to safely retrieve or lazily initialize their wallet
-- without granting direct client INSERT/UPDATE permissions on user_wallets.

CREATE OR REPLACE FUNCTION public.get_or_create_user_wallet()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_user_id UUID;
    v_wallet public.user_wallets%ROWTYPE;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Authentication required');
    END IF;

    -- Ensure wallet exists
    INSERT INTO public.user_wallets (
        user_id,
        green_points_balance,
        total_points_earned,
        total_points_redeemed,
        currency,
        is_locked,
        last_activity_at,
        created_at
    )
    VALUES (
        v_user_id,
        100,
        100,
        0,
        'VERD_PTS',
        FALSE,
        NOW(),
        NOW()
    )
    ON CONFLICT (user_id) DO NOTHING;

    SELECT * INTO v_wallet FROM public.user_wallets WHERE user_id = v_user_id;

    RETURN jsonb_build_object(
        'success', true,
        'wallet', row_to_json(v_wallet)
    );
END;
$$;

REVOKE ALL ON FUNCTION public.get_or_create_user_wallet() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_or_create_user_wallet() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_or_create_user_wallet() TO authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 4: SECURE RPC: redeem_wallet_points()
-- ─────────────────────────────────────────────────────────────────────────────
-- Atomically validates balance, locks wallet row, performs debit,
-- records transaction, and registers redemption record.

CREATE OR REPLACE FUNCTION public.redeem_wallet_points(
    p_reward_item_id TEXT,
    p_reward_name TEXT,
    p_category TEXT,
    p_points_cost INT,
    p_fulfillment_details TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_user_id UUID;
    v_wallet public.user_wallets%ROWTYPE;
    v_new_balance INT;
    v_tx_id UUID;
    v_redemption_id UUID;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Authentication required to redeem points');
    END IF;

    IF p_points_cost <= 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid points cost parameter');
    END IF;

    -- Ensure wallet exists
    INSERT INTO public.user_wallets (user_id, green_points_balance, total_points_earned, total_points_redeemed)
    VALUES (v_user_id, 100, 100, 0)
    ON CONFLICT (user_id) DO NOTHING;

    -- Row-lock wallet to prevent race condition or duplicate spending
    SELECT * INTO v_wallet FROM public.user_wallets WHERE user_id = v_user_id FOR UPDATE;

    IF v_wallet.is_locked THEN
        RETURN jsonb_build_object('success', false, 'error', 'Account wallet is locked for review');
    END IF;

    IF v_wallet.green_points_balance < p_points_cost THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Insufficient points balance',
            'current_balance', v_wallet.green_points_balance,
            'required_points', p_points_cost
        );
    END IF;

    v_new_balance := v_wallet.green_points_balance - p_points_cost;

    -- Update wallet balance atomically
    UPDATE public.user_wallets SET
        green_points_balance = v_new_balance,
        total_points_redeemed = total_points_redeemed + p_points_cost,
        last_activity_at = NOW()
    WHERE user_id = v_user_id;

    -- Record atomic debit transaction in auditable ledger
    INSERT INTO public.wallet_transactions (
        user_id,
        transaction_type,
        amount,
        status,
        reference_id,
        reference_type,
        description,
        balance_after,
        audit_hash,
        created_at
    ) VALUES (
        v_user_id,
        'redemption',
        -p_points_cost,
        'completed',
        p_reward_item_id,
        'redemption',
        'Redeemed: ' || p_reward_name,
        v_new_balance,
        encode(sha256((v_user_id::text || p_reward_item_id || NOW()::text)::bytea), 'hex'),
        NOW()
    ) RETURNING id INTO v_tx_id;

    -- Create redemption order record
    INSERT INTO public.wallet_redemptions (
        user_id,
        reward_item_id,
        reward_name,
        category,
        points_cost,
        status,
        fulfillment_details,
        created_at
    ) VALUES (
        v_user_id,
        p_reward_item_id,
        p_reward_name,
        p_category,
        p_points_cost,
        'processing',
        p_fulfillment_details,
        NOW()
    ) RETURNING id INTO v_redemption_id;

    RETURN jsonb_build_object(
        'success', true,
        'new_balance', v_new_balance,
        'points_redeemed', p_points_cost,
        'transaction_id', v_tx_id,
        'redemption_id', v_redemption_id
    );
END;
$$;

REVOKE ALL ON FUNCTION public.redeem_wallet_points(TEXT, TEXT, TEXT, INT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.redeem_wallet_points(TEXT, TEXT, TEXT, INT, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.redeem_wallet_points(TEXT, TEXT, TEXT, INT, TEXT) TO authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 5: SECURE RPC: review_bounty_submission()
-- ─────────────────────────────────────────────────────────────────────────────
-- Validates reviewer authorization (must be creator of bounty or admin),
-- updates submission status, awards reward points to submitter's wallet,
-- and increments spots_completed.

CREATE OR REPLACE FUNCTION public.review_bounty_submission(
    p_submission_id UUID,
    p_decision TEXT, -- 'approved' or 'rejected'
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_reviewer_id UUID;
    v_sub public.bounty_submissions%ROWTYPE;
    v_bounty public.bounties%ROWTYPE;
    v_is_authorized BOOLEAN := FALSE;
    v_new_balance INT;
    v_wallet public.user_wallets%ROWTYPE;
    v_tx_id UUID;
BEGIN
    v_reviewer_id := auth.uid();
    IF v_reviewer_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Authentication required to review bounties');
    END IF;

    IF p_decision NOT IN ('approved', 'rejected') THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid decision: must be approved or rejected');
    END IF;

    -- Fetch submission
    SELECT * INTO v_sub FROM public.bounty_submissions WHERE id = p_submission_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Submission not found');
    END IF;

    IF v_sub.status = 'approved' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Submission has already been approved');
    END IF;

    -- Fetch bounty
    SELECT * INTO v_bounty FROM public.bounties WHERE id = v_sub.bounty_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Associated bounty not found');
    END IF;

    -- Check authorization: must be creator of the bounty OR an admin/moderator
    IF v_bounty.creator_id = v_reviewer_id THEN
        v_is_authorized := TRUE;
    ELSE
        SELECT EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = v_reviewer_id AND role IN ('Admin', 'Moderator', 'Lead Forester')
        ) INTO v_is_authorized;
    END IF;

    IF NOT v_is_authorized THEN
        RETURN jsonb_build_object('success', false, 'error', 'Permission denied: only bounty creator or moderator can review submissions');
    END IF;

    -- Update submission
    UPDATE public.bounty_submissions SET
        status = p_decision,
        reviewer_id = v_reviewer_id,
        reviewer_notes = p_notes,
        reviewed_at = NOW(),
        reward_issued = CASE WHEN p_decision = 'approved' THEN TRUE ELSE reward_issued END
    WHERE id = p_submission_id;

    -- If approved and reward was not previously issued, award points
    IF p_decision = 'approved' AND NOT v_sub.reward_issued THEN
        -- Increment spots completed
        UPDATE public.bounties SET
            spots_completed = COALESCE(spots_completed, 0) + 1
        WHERE id = v_sub.bounty_id;

        -- Ensure recipient wallet exists
        INSERT INTO public.user_wallets (user_id, green_points_balance, total_points_earned, total_points_redeemed)
        VALUES (v_sub.user_id, 100, 100, 0)
        ON CONFLICT (user_id) DO NOTHING;

        -- Lock recipient wallet
        SELECT * INTO v_wallet FROM public.user_wallets WHERE user_id = v_sub.user_id FOR UPDATE;

        v_new_balance := v_wallet.green_points_balance + v_bounty.reward_value;

        UPDATE public.user_wallets SET
            green_points_balance = v_new_balance,
            total_points_earned = total_points_earned + v_bounty.reward_value,
            last_activity_at = NOW()
        WHERE user_id = v_sub.user_id;

        -- Record transaction
        INSERT INTO public.wallet_transactions (
            user_id,
            transaction_type,
            amount,
            status,
            reference_id,
            reference_type,
            description,
            balance_after,
            audit_hash,
            created_at
        ) VALUES (
            v_sub.user_id,
            'bounty_reward',
            v_bounty.reward_value,
            'completed',
            v_sub.id::text,
            'bounty',
            'Bounty completion reward: ' || v_bounty.title,
            v_new_balance,
            encode(sha256((v_sub.user_id::text || v_bounty.id::text || NOW()::text)::bytea), 'hex'),
            NOW()
        ) RETURNING id INTO v_tx_id;

        -- Update reputation
        UPDATE public.user_reputations SET
            bounties_completed = bounties_completed + 1,
            reputation_score = reputation_score + 15
        WHERE user_id = v_sub.user_id;

        -- Update personal impact metrics
        UPDATE public.personal_impact_metrics SET
            bounties_completed = bounties_completed + 1,
            green_points_earned = green_points_earned + v_bounty.reward_value,
            last_synced_at = NOW()
        WHERE user_id = v_sub.user_id;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'decision', p_decision,
        'reward_awarded', (p_decision = 'approved' AND NOT v_sub.reward_issued),
        'reward_amount', CASE WHEN p_decision = 'approved' THEN v_bounty.reward_value ELSE 0 END
    );
END;
$$;

REVOKE ALL ON FUNCTION public.review_bounty_submission(UUID, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.review_bounty_submission(UUID, TEXT, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.review_bounty_submission(UUID, TEXT, TEXT) TO authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 6: RLS POLICIES HARDENING
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Bounty Submissions UPDATE policy (bounty creator can update submissions)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'bounty_submissions'
          AND policyname = 'Bounty creators update submissions'
    ) THEN
        CREATE POLICY "Bounty creators update submissions"
            ON public.bounty_submissions FOR UPDATE
            TO authenticated
            USING (
                auth.uid() = (SELECT creator_id FROM public.bounties WHERE id = bounty_id LIMIT 1)
                OR EXISTS (
                    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'Moderator', 'Lead Forester')
                )
            );
    END IF;
END $$;

-- 2. Verification Queue Reviewer Access
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'verification_queue_items'
          AND policyname = 'Reviewers inspect queue'
    ) THEN
        CREATE POLICY "Reviewers inspect queue"
            ON public.verification_queue_items FOR SELECT
            TO authenticated
            USING (
                auth.uid() = submitter_id
                OR EXISTS (
                    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'Moderator', 'Lead Forester')
                )
            );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'verification_queue_items'
          AND policyname = 'Reviewers update queue'
    ) THEN
        CREATE POLICY "Reviewers update queue"
            ON public.verification_queue_items FOR UPDATE
            TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'Moderator', 'Lead Forester')
                )
            );
    END IF;
END $$;

-- 3. Green Change Records recorded_by hardening
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'green_change_records'
          AND column_name = 'recorded_by'
    ) THEN
        ALTER TABLE public.green_change_records
            ADD COLUMN recorded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
END $$;

DROP POLICY IF EXISTS "Authenticated submit change records" ON public.green_change_records;
CREATE POLICY "Authenticated submit change records"
    ON public.green_change_records FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = recorded_by OR recorded_by IS NULL);
