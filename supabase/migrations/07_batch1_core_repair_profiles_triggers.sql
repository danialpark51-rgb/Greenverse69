-- ==============================================================================
-- GREENVERSE — BATCH 1 CORE DATABASE REPAIR
-- File: supabase/migrations/07_batch1_core_repair_profiles_triggers.sql
-- Description:
--   Additive, forward-only, idempotent migration.
--   Safe to apply on a fresh database (after migrations 01–06) or on an
--   existing database that has already applied 01–06.
--
--   Fixes addressed:
--   1. Creates public.profiles with correct schema if it does not exist.
--   2. Adds any missing columns to an existing public.profiles table.
--   3. Applies least-privilege column-level GRANTs (role + email protected).
--   4. Establishes BEFORE INSERT / BEFORE UPDATE integrity triggers that
--      correctly distinguish service_role from authenticated/anon using
--      request.jwt.claim.role, with NULLIF guards on empty-string returns.
--   5. Auto-creates profile rows on new user signup via auth.users trigger,
--      covering email/password, magic link, and all Supabase OAuth providers.
--   6. Syncs profile.email when user changes email through Supabase Auth.
--   7. Backfills existing auth.users rows that have no profile row yet.
--   8. Replaces sync_tree_planting_impact() with the corrected version
--      (uses NEW.user_id; dynamic EXECUTE; RAISE WARNING on missing table;
--      documents duplicate-counting protection model explicitly).
--   9. Idempotently re-attaches the tree trigger.
--  10. Creates the public_profiles security-barrier view using
--      CREATE OR REPLACE VIEW (no CASCADE DROP) so no dependent objects
--      are silently removed.
-- ==============================================================================


-- ==============================================================================
-- SECTION 1: PROFILES TABLE
-- Creates if missing; adds any missing columns on an existing table.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
    id           UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name    TEXT,
    email        TEXT,
    avatar_url   TEXT,
    organization TEXT,
    role         TEXT        NOT NULL DEFAULT 'Citizen Forester',
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add any columns that may be missing if the table already existed with an older schema
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'full_name') THEN
        ALTER TABLE public.profiles ADD COLUMN full_name TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'email') THEN
        ALTER TABLE public.profiles ADD COLUMN email TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'avatar_url') THEN
        ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'organization') THEN
        ALTER TABLE public.profiles ADD COLUMN organization TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE public.profiles ADD COLUMN role TEXT NOT NULL DEFAULT 'Citizen Forester';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'updated_at') THEN
        ALTER TABLE public.profiles ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
    END IF;
END;
$$;

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_profiles_organization ON public.profiles(organization);
CREATE INDEX IF NOT EXISTS idx_profiles_role         ON public.profiles(role);


-- ==============================================================================
-- SECTION 2: ROW LEVEL SECURITY
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies to ensure idempotency
DROP POLICY IF EXISTS "Users can read own profile"   ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Authenticated users read only their own profile (email stays private)
CREATE POLICY "Users can read own profile"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- Authenticated users update only their own profile
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING     (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Authenticated users insert only their own profile
CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);


-- ==============================================================================
-- SECTION 3: COLUMN-LEVEL GRANTS (LEAST-PRIVILEGE)
-- ==============================================================================

-- Start clean — revoke all client-role privileges then re-grant narrowly
REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.profiles FROM authenticated;

-- SELECT is constrained further by RLS policies above
GRANT SELECT ON public.profiles TO authenticated;

-- INSERT: clients may only supply non-privileged fields.
-- role, email, created_at, updated_at are intentionally excluded.
-- The BEFORE INSERT trigger (SECURITY DEFINER, running as postgres) fills in role + email.
GRANT INSERT (id, full_name, avatar_url, organization) ON public.profiles TO authenticated;

-- UPDATE: only safe mutable user fields.
-- role, email, id, and timestamps are protected by the BEFORE UPDATE trigger.
GRANT UPDATE (full_name, avatar_url, organization) ON public.profiles TO authenticated;


-- ==============================================================================
-- SECTION 4: PROFILE INTEGRITY TRIGGERS
-- Prevents role escalation and email tampering by authenticated/anon callers.
-- Uses request.jwt.claim.role to identify caller type.
-- Service_role / postgres internal triggers will have an empty / missing claim.
-- ==============================================================================

-- ── BEFORE UPDATE: block role / email / id mutation by clients ────────────────
CREATE OR REPLACE FUNCTION public.enforce_profile_update_integrity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_caller_role TEXT;
BEGIN
    -- current_setting(..., true) returns NULL if the setting is not present.
    -- COALESCE converts NULL → ''.
    -- NULLIF converts '' → NULL.
    -- Result: v_caller_role is NULL for postgres/service_role calls;
    --         it is 'authenticated' or 'anon' for PostgREST client calls.
    v_caller_role := NULLIF(
        COALESCE(current_setting('request.jwt.claim.role', true), ''),
        ''
    );

    IF v_caller_role IN ('authenticated', 'anon') THEN
        IF NEW.role IS DISTINCT FROM OLD.role THEN
            RAISE EXCEPTION '[Greenverse] Security: role changes are prohibited via client calls.';
        END IF;

        IF NEW.email IS DISTINCT FROM OLD.email THEN
            RAISE EXCEPTION '[Greenverse] Security: profile email is managed by Supabase Auth and cannot be changed here.';
        END IF;

        IF NEW.id IS DISTINCT FROM OLD.id THEN
            RAISE EXCEPTION '[Greenverse] Security: profile id cannot be changed.';
        END IF;
    END IF;

    -- Auto-stamp updated_at on every successful update
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_profile_update_integrity ON public.profiles;
CREATE TRIGGER trg_enforce_profile_update_integrity
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_profile_update_integrity();


-- ── BEFORE INSERT: harden client-side lazy inserts ───────────────────────────
-- handle_new_user() (service_role SECURITY DEFINER) is excluded from these
-- guards because v_caller_role is NULL for postgres-originated calls.
-- It populates role and email directly and is unaffected by this trigger.
CREATE OR REPLACE FUNCTION public.enforce_profile_insert_integrity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_caller_role    TEXT;
    v_email_from_jwt TEXT;
    v_email_from_auth TEXT;
BEGIN
    v_caller_role := NULLIF(
        COALESCE(current_setting('request.jwt.claim.role', true), ''),
        ''
    );

    IF v_caller_role IN ('authenticated', 'anon') THEN
        -- Enforce id == session user; prevents inserting rows for other users
        IF auth.uid() IS NOT NULL THEN
            NEW.id := auth.uid();
        END IF;

        -- Force non-privileged role; client cannot self-assign 'admin' etc.
        NEW.role := 'Citizen Forester';

        -- Populate email from the most authoritative source available.
        -- NULLIF('', '') converts an empty JWT claim to NULL before COALESCE,
        -- ensuring the auth.users subquery is used when the JWT claim is absent.
        v_email_from_jwt  := NULLIF(
            COALESCE(current_setting('request.jwt.claim.email', true), ''),
            ''
        );
        v_email_from_auth := (SELECT email FROM auth.users WHERE id = NEW.id);

        NEW.email := COALESCE(v_email_from_jwt, v_email_from_auth, NEW.email);
    END IF;

    NEW.created_at := COALESCE(NEW.created_at, NOW());
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_profile_insert_integrity ON public.profiles;
CREATE TRIGGER trg_enforce_profile_insert_integrity
    BEFORE INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_profile_insert_integrity();


-- ==============================================================================
-- SECTION 5: PUBLIC PROFILES VIEW
-- Exposes only non-sensitive display fields to anon + authenticated.
-- security_barrier = true prevents predicate pushdown leaks (explained below).
-- View owner = postgres (security_invoker = false, the PG default) so anon
-- users can read the sanitized subset even though the base table denies anon.
--
-- SECURITY MODEL (explicit):
-- ─────────────────────────────────────────────────────────────────────────────
-- • public.profiles has RLS enabled.
--   anon has NO SELECT policy on the base table → cannot read it directly.
-- • public.public_profiles runs as view owner (postgres), which DOES have
--   full access to public.profiles. The view itself queries the base table
--   and returns only the 6 whitelisted columns.
-- • GRANT SELECT ON public.public_profiles TO anon grants anon the right
--   to query the view, NOT the base table. anon still cannot query
--   public.profiles directly (RLS continues to block it).
-- • security_barrier = true instructs the PostgreSQL query planner to
--   evaluate the view's WHERE conditions (the row filter from the view's
--   SELECT) BEFORE applying any user-supplied filters. This prevents a
--   timing or leakage attack where a user function supplied in a WHERE
--   clause could be evaluated against base-table rows not intended for
--   the caller. It is NOT a replacement for RLS on the base table; it
--   is a defence-in-depth measure against predicate pushdown side-channels.
-- • email and updated_at are NOT projected; they cannot be retrieved even
--   via SELECT *.
-- • role and organization are intentionally public: Greenverse arborists
--   represent civic alliances on community leaderboards and tree passports.
-- ─────────────────────────────────────────────────────────────────────────────
--
-- DEPENDENCY SAFETY:
-- ─────────────────────────────────────────────────────────────────────────────
-- Search of migrations 01–06 and all src/ files confirms that NO object
-- depends on public.public_profiles (no other view, function, or frontend
-- query references it). The view was first introduced by this migration (07).
-- Therefore CREATE OR REPLACE VIEW is used instead of DROP...CASCADE, which
-- is preserved as a commented alternative for future reference only.
--
-- If you have added dependent views manually in the Supabase Dashboard,
-- STOP and inspect Dashboard → Database → Views before running this migration.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW public.public_profiles
WITH (security_barrier = true)
AS
SELECT
    id,
    full_name,
    avatar_url,
    organization,  -- intentionally public (see security model above)
    role,          -- intentionally public (see security model above)
    created_at
FROM public.profiles;

-- Allow anon + authenticated to query the view
GRANT SELECT ON public.public_profiles TO anon, authenticated;


-- ==============================================================================
-- SECTION 6: AUTH.USERS → PROFILES SIGNUP TRIGGER
-- Runs AFTER INSERT on auth.users as SECURITY DEFINER (postgres role).
-- Covers email/password, magic link, and all OAuth providers (Google, GitHub,
-- Apple, etc.). OAuth metadata keys covered: full_name, name, avatar_url,
-- picture, organization.
-- ON CONFLICT (id) DO UPDATE preserves existing role; never downgrades admin.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
    INSERT INTO public.profiles (
        id, full_name, email, role, avatar_url, organization, created_at, updated_at
    )
    VALUES (
        NEW.id,
        -- OAuth providers vary: Google uses 'full_name' or 'name'; GitHub uses 'name'
        COALESCE(
            NULLIF(NEW.raw_user_meta_data->>'full_name', ''),
            NULLIF(NEW.raw_user_meta_data->>'name', ''),
            NULLIF(split_part(NEW.email, '@', 1), ''),
            'Citizen Forester'
        ),
        NEW.email,
        'Citizen Forester',
        -- Google/GitHub use 'avatar_url'; raw Google token uses 'picture'
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
        -- Sync email from auth (always authoritative)
        email        = COALESCE(EXCLUDED.email, public.profiles.email),
        -- Preserve user-entered name over OAuth default; fill blank with OAuth value
        full_name    = COALESCE(NULLIF(public.profiles.full_name, ''), EXCLUDED.full_name),
        -- Preserve non-empty avatar; fill blank with OAuth value
        avatar_url   = COALESCE(NULLIF(public.profiles.avatar_url, ''), EXCLUDED.avatar_url),
        -- Preserve user-entered org; fill blank with OAuth value
        organization = COALESCE(NULLIF(public.profiles.organization, ''), EXCLUDED.organization),
        -- role is intentionally NOT updated: never downgrade an existing admin/moderator
        updated_at   = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();


-- ==============================================================================
-- SECTION 7: AUTH EMAIL CHANGE → PROFILE EMAIL SYNC TRIGGER
-- When a user verifies a new email through Supabase Auth, the change is
-- mirrored here. Runs as SECURITY DEFINER (postgres), so the
-- enforce_profile_update_integrity() BEFORE UPDATE trigger sees
-- v_caller_role = NULL and skips the email-change guard.
-- Guard: AND NEW.email IS NOT NULL prevents writing NULL during intermediate
-- Supabase Auth email-change confirmation states.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_user_email_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
    IF NEW.email IS DISTINCT FROM OLD.email AND NEW.email IS NOT NULL THEN
        UPDATE public.profiles
        SET    email      = NEW.email,
               updated_at = NOW()
        WHERE  id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_email_updated ON auth.users;
CREATE TRIGGER on_auth_user_email_updated
    AFTER UPDATE OF email ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_user_email_change();


-- ==============================================================================
-- SECTION 8: BACKFILL EXISTING USERS
-- Creates profile rows for any auth.users who signed up before this migration.
-- ON CONFLICT (id) DO NOTHING: existing profile rows are never modified.
-- This runs once at migration time under postgres privileges; not client-visible.
-- ==============================================================================

INSERT INTO public.profiles (
    id, full_name, email, role, avatar_url, organization, created_at, updated_at
)
SELECT
    au.id,
    COALESCE(
        NULLIF(au.raw_user_meta_data->>'full_name', ''),
        NULLIF(au.raw_user_meta_data->>'name', ''),
        NULLIF(split_part(au.email, '@', 1), ''),
        'Citizen Forester'
    ),
    au.email,
    'Citizen Forester',
    COALESCE(
        NULLIF(au.raw_user_meta_data->>'avatar_url', ''),
        NULLIF(au.raw_user_meta_data->>'picture', ''),
        ''
    ),
    COALESCE(NULLIF(au.raw_user_meta_data->>'organization', ''), ''),
    au.created_at,
    NOW()
FROM auth.users au
ON CONFLICT (id) DO NOTHING;


-- ==============================================================================
-- SECTION 9: TREE PLANTING IMPACT TRIGGER (REPAIR)
-- Replaces the version in migration 06 that referenced NEW.planted_by.
-- Canonical ownership column is trees.user_id (UUID, nullable ON DELETE SET NULL).
--
-- DUPLICATE-COUNTING PROTECTION MODEL (explicit):
-- ─────────────────────────────────────────────────────────────────────────────
-- Layer 1 — Trigger fires ONLY on INSERT, never on UPDATE or DELETE.
--   Guard: IF TG_OP = 'INSERT' AND NEW.user_id IS NOT NULL
--   An UPDATE to an existing tree row (health status, coordinates, notes, etc.)
--   does not fire this trigger. The trg_trees_immutability trigger in migration 01
--   also blocks planting_date, tree_code, user_id, and id from being changed.
--
-- Layer 2 — trees.tree_code has a UNIQUE constraint (trees_tree_code_key).
--   Enforced in migration 01 (line 268). The frontend generates a GV-TR-XXXXX
--   code per registration attempt. If a network retry re-submits the same
--   payload, the second INSERT fails with a unique_violation at the DB layer,
--   BEFORE the trigger fires. The impact counter is therefore incremented at
--   most once per tree_code.
--   NOTE: If trees_tree_code_key is somehow absent (pre-existing schema),
--   this migration emits a WARNING and continues rather than blocking
--   tree registration. This is a monitoring notice; migration 01 must be
--   confirmed applied to the target database to ensure this constraint is live.
--
-- Layer 3 — personal_impact_metrics.user_id is PRIMARY KEY (UNIQUE NOT NULL).
--   ON CONFLICT (user_id) DO UPDATE atomically increments the existing counters.
--   Two concurrent INSERTs by the same user cannot both create a row; PostgreSQL
--   serializes the conflict and the second one enters the DO UPDATE path.
--
-- WHAT THIS DOES NOT PROTECT AGAINST:
--   • A user intentionally submitting two trees with distinct species, locations,
--     and tree_codes on the same day. These are treated as two legitimate
--     planting events and both increment the counter. This is correct behaviour.
--   • Admin or service_role bulk imports that bypass the trigger AFTER INSERT
--     (e.g. pg_restore, COPY). Those paths would need separate reconciliation.
-- ─────────────────────────────────────────────────────────────────────────────
--
-- SCHEMA COMPATIBILITY (verified against migration 06):
--   personal_impact_metrics columns used: user_id UUID PRIMARY KEY,
--   trees_planted_total INT DEFAULT 0, co2_sequestered_kg NUMERIC(12,2) DEFAULT 0,
--   last_synced_at TIMESTAMPTZ DEFAULT NOW().
--   ON CONFLICT (user_id) is valid: user_id is PRIMARY KEY → implicit UNIQUE.
--   Trigger is AFTER INSERT on public.trees; trees.user_id is UUID, nullable.
--   Both tables are in the same transaction; if the metric update fails,
--   the tree INSERT is rolled back automatically.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.sync_tree_planting_impact()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
    -- Layer 1: Only increment on INSERT; never on UPDATE or DELETE
    IF TG_OP = 'INSERT' AND NEW.user_id IS NOT NULL THEN

        -- Warn if the trees_tree_code_key unique constraint is absent (should not
        -- happen if migration 01 was applied correctly, but caught here defensively).
        IF NOT EXISTS (
            SELECT 1
            FROM   pg_constraint con
            JOIN   pg_class       rel ON rel.oid = con.conrelid
            JOIN   pg_namespace   nsp ON nsp.oid = rel.relnamespace
            WHERE  nsp.nspname = 'public'
            AND    rel.relname = 'trees'
            AND    con.conname = 'trees_tree_code_key'
        ) THEN
            RAISE WARNING
                '[Greenverse] UNIQUE constraint trees_tree_code_key is missing on '
                'public.trees. Duplicate tree submissions may not be detected reliably. '
                'Confirm migration 01_batch1_tree_ecosystem.sql was applied successfully.';
        END IF;

        -- Defensive check: only run metric upsert if personal_impact_metrics exists.
        -- Uses dynamic SQL to avoid parse-time failure if the table is absent
        -- (e.g. migration 06 not yet applied). Tree INSERT is never blocked.
        IF EXISTS (
            SELECT 1
            FROM   information_schema.tables
            WHERE  table_schema = 'public'
            AND    table_name   = 'personal_impact_metrics'
        ) THEN
            -- Table-qualified target (public.personal_impact_metrics) prevents
            -- ambiguity in the ON CONFLICT ... DO UPDATE SET clause.
            EXECUTE $sql$
                INSERT INTO public.personal_impact_metrics
                    (user_id, trees_planted_total, co2_sequestered_kg, last_synced_at)
                VALUES
                    ($1, 1, 21.77, NOW())
                ON CONFLICT (user_id) DO UPDATE SET
                    trees_planted_total = public.personal_impact_metrics.trees_planted_total + 1,
                    co2_sequestered_kg  = public.personal_impact_metrics.co2_sequestered_kg  + 21.77,
                    last_synced_at      = NOW()
            $sql$ USING NEW.user_id;
        ELSE
            -- Visible in Supabase Dashboard → Logs → Postgres
            -- This is a monitoring notice, not an error; tree registration continues.
            RAISE WARNING
                '[Greenverse] personal_impact_metrics table not found; '
                'skipped impact metric sync for user_id=%. '
                'Confirm migration 06_batch6_impact_intelligence.sql was applied.', NEW.user_id;
        END IF;

    END IF;

    RETURN NEW;
END;
$$;

-- Idempotently attach the trigger to public.trees if it exists.
-- DROP TRIGGER IF EXISTS + CREATE is used instead of CREATE OR REPLACE TRIGGER
-- because CREATE OR REPLACE TRIGGER requires PostgreSQL 14+; DROP+CREATE is
-- compatible with the full range of Supabase-hosted PostgreSQL versions.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM   information_schema.tables
        WHERE  table_schema = 'public'
        AND    table_name   = 'trees'
    ) THEN
        DROP TRIGGER IF EXISTS trg_sync_tree_planting_impact ON public.trees;
        CREATE TRIGGER trg_sync_tree_planting_impact
            AFTER INSERT ON public.trees
            FOR EACH ROW
            EXECUTE FUNCTION public.sync_tree_planting_impact();
    ELSE
        RAISE WARNING
            '[Greenverse] public.trees table not found; '
            'skipped trg_sync_tree_planting_impact attachment. '
            'Confirm migration 01_batch1_tree_ecosystem.sql was applied.';
    END IF;
END;
$$;
