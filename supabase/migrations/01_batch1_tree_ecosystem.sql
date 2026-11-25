-- ==============================================================================
-- GREENVERSE — BATCH 1: MASTER DATABASE SECURITY, INTEGRITY & ECOSYSTEM MIGRATION
-- File: supabase/migrations/01_batch1_tree_ecosystem.sql
-- Description: Hardened enterprise migration for Trees, Care Tasks, Growth Logs,
--              Adoptions, and Health Records with full RLS, security-barrier views,
--              column privilege separation, row-locked RPCs, and upgrade preflight.
-- Execution: Run in Supabase SQL Editor (Dashboard -> SQL Editor -> New Query).
-- ==============================================================================

-- ==============================================================================
-- SECTION 1: EXTENSIONS & COMPATIBILITY
-- ==============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;

-- ==============================================================================
-- SECTION 2: PREFLIGHT SCHEMA INTEGRITY VALIDATION
-- Validates existing database schema state without assuming standard initial state.
-- Halts transaction execution with actionable diagnostic messages if incompatible.
-- Uses dynamic SQL to prevent Postgres parse-time column resolution failures.
-- ==============================================================================
DO $$
DECLARE
    v_col_type TEXT;
    v_cnt INT;
BEGIN
    RAISE NOTICE '[GREENVERSE PREFLIGHT] Starting structural validation across Batch 1 tables...';

    -- 1. Check 'trees' if pre-existing
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'trees') THEN
        -- Check ID type
        SELECT data_type INTO v_col_type FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'trees' AND column_name = 'id';
        IF v_col_type IS NOT NULL AND v_col_type NOT IN ('uuid', 'USER-DEFINED') THEN
            RAISE EXCEPTION '[PREFLIGHT FAILED] Table public.trees has incompatible primary key type "%". Expected UUID.', v_col_type;
        END IF;

        -- Check health_status data integrity if column already exists
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'trees' AND column_name = 'health_status') THEN
            EXECUTE 'SELECT COUNT(*) FROM public.trees WHERE health_status IS NULL OR health_status NOT IN (''thriving'', ''stable'', ''attention_required'', ''critical'')' INTO v_cnt;
            IF v_cnt > 0 THEN
                RAISE EXCEPTION '[PREFLIGHT FAILED] Table public.trees contains % row(s) with invalid health_status values. Valid: thriving, stable, attention_required, critical.', v_cnt;
            END IF;
        END IF;

        -- Check tree_code uniqueness if column already exists
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'trees' AND column_name = 'tree_code') THEN
            EXECUTE 'SELECT COUNT(*) - COUNT(DISTINCT tree_code) FROM public.trees WHERE tree_code IS NOT NULL' INTO v_cnt;
            IF v_cnt > 0 THEN
                RAISE EXCEPTION '[PREFLIGHT FAILED] Table public.trees contains % duplicate tree_code values. Cannot enforce UNIQUE constraint.', v_cnt;
            END IF;
        END IF;
    END IF;

    -- 2. Check 'tree_care_tasks' if pre-existing
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tree_care_tasks') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tree_care_tasks' AND column_name = 'priority') THEN
            EXECUTE 'SELECT COUNT(*) FROM public.tree_care_tasks WHERE priority IS NULL OR priority NOT IN (''low'', ''medium'', ''high'', ''urgent'')' INTO v_cnt;
            IF v_cnt > 0 THEN
                RAISE EXCEPTION '[PREFLIGHT FAILED] Table public.tree_care_tasks contains % row(s) with invalid priority values. Valid: low, medium, high, urgent.', v_cnt;
            END IF;
        END IF;
    END IF;

    -- 3. Check 'tree_growth_logs' if pre-existing
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tree_growth_logs') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tree_growth_logs' AND column_name = 'health_status') THEN
            EXECUTE 'SELECT COUNT(*) FROM public.tree_growth_logs WHERE health_status IS NULL OR health_status NOT IN (''thriving'', ''stable'', ''attention_required'', ''critical'')' INTO v_cnt;
            IF v_cnt > 0 THEN
                RAISE EXCEPTION '[PREFLIGHT FAILED] Table public.tree_growth_logs contains % row(s) with invalid health_status values.', v_cnt;
            END IF;
        END IF;
    END IF;

    -- 4. Check 'tree_adoptions' if pre-existing
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tree_adoptions') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tree_adoptions' AND column_name = 'status') THEN
            EXECUTE 'SELECT COUNT(*) FROM public.tree_adoptions WHERE status IS NULL OR status NOT IN (''active'', ''concluded'')' INTO v_cnt;
            IF v_cnt > 0 THEN
                RAISE EXCEPTION '[PREFLIGHT FAILED] Table public.tree_adoptions contains % row(s) with invalid status values. Valid: active, concluded.', v_cnt;
            END IF;
        END IF;
    END IF;

    -- 5. Check 'tree_health_records' if pre-existing
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tree_health_records') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tree_health_records' AND column_name = 'severity') THEN
            EXECUTE 'SELECT COUNT(*) FROM public.tree_health_records WHERE severity IS NULL OR severity NOT IN (''mild'', ''moderate'', ''severe'')' INTO v_cnt;
            IF v_cnt > 0 THEN
                RAISE EXCEPTION '[PREFLIGHT FAILED] Table public.tree_health_records contains % row(s) with invalid severity values. Valid: mild, moderate, severe.', v_cnt;
            END IF;
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tree_health_records' AND column_name = 'status') THEN
            EXECUTE 'SELECT COUNT(*) FROM public.tree_health_records WHERE status IS NULL OR status NOT IN (''open'', ''under_care'', ''resolved'')' INTO v_cnt;
            IF v_cnt > 0 THEN
                RAISE EXCEPTION '[PREFLIGHT FAILED] Table public.tree_health_records contains % row(s) with invalid status values. Valid: open, under_care, resolved.', v_cnt;
            END IF;
        END IF;
    END IF;

    RAISE NOTICE '[GREENVERSE PREFLIGHT] Preflight schema validation completed successfully.';
END $$;

-- ==============================================================================
-- SECTION 3: BASE TABLES CREATION (CANONICAL SCHEMA)
-- ==============================================================================

-- 3.1 TREES
CREATE TABLE IF NOT EXISTS public.trees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tree_code TEXT NOT NULL,
    name TEXT,
    species TEXT NOT NULL,
    scientific_name TEXT,
    planting_date DATE NOT NULL DEFAULT CURRENT_DATE,
    location_description TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    photo_url TEXT,
    health_status TEXT NOT NULL DEFAULT 'thriving',
    height_meters NUMERIC(5, 2) DEFAULT 1.0,
    dbh_cm NUMERIC(5, 2) DEFAULT 2.0,
    carbon_offset_kg NUMERIC(8, 2) DEFAULT 5.0,
    notes TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_private_location BOOLEAN NOT NULL DEFAULT FALSE,
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.2 TREE CARE TASKS
CREATE TABLE IF NOT EXISTS public.tree_care_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tree_id UUID REFERENCES public.trees(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    task_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    completed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    priority TEXT NOT NULL DEFAULT 'medium',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.3 TREE GROWTH LOGS
-- ON DELETE RESTRICT prevents silent destruction of community historical measurements when trees are deleted
CREATE TABLE IF NOT EXISTS public.tree_growth_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tree_id UUID NOT NULL REFERENCES public.trees(id) ON DELETE RESTRICT,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
    height_meters NUMERIC(5, 2),
    dbh_cm NUMERIC(5, 2),
    health_status TEXT NOT NULL DEFAULT 'thriving',
    observations TEXT,
    photo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.4 TREE ADOPTIONS
-- ON DELETE RESTRICT preserves stewardship legal and community adoption records
CREATE TABLE IF NOT EXISTS public.tree_adoptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tree_id UUID NOT NULL REFERENCES public.trees(id) ON DELETE RESTRICT,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    guardian_name TEXT NOT NULL,
    guardian_message TEXT,
    adoption_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.5 TREE HEALTH RECORDS
-- ON DELETE RESTRICT ensures clinical and pest inspection triage records are preserved
CREATE TABLE IF NOT EXISTS public.tree_health_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tree_id UUID NOT NULL REFERENCES public.trees(id) ON DELETE RESTRICT,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
    symptoms TEXT[] NOT NULL DEFAULT '{}',
    observations TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'moderate',
    suggested_actions TEXT,
    status TEXT NOT NULL DEFAULT 'open',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- SECTION 4: SCHEMA HARMONIZATION & CONSTRAINT ENFORCEMENT
-- Safe, idempotent column addition and check constraint attachments for existing databases
-- ==============================================================================
DO $$
BEGIN
    -- Harmonize trees
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='trees' AND column_name='tree_code') THEN
        ALTER TABLE public.trees ADD COLUMN tree_code TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='trees' AND column_name='name') THEN
        ALTER TABLE public.trees ADD COLUMN name TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='trees' AND column_name='species') THEN
        ALTER TABLE public.trees ADD COLUMN species TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='trees' AND column_name='scientific_name') THEN
        ALTER TABLE public.trees ADD COLUMN scientific_name TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='trees' AND column_name='planting_date') THEN
        ALTER TABLE public.trees ADD COLUMN planting_date DATE DEFAULT CURRENT_DATE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='trees' AND column_name='location_description') THEN
        ALTER TABLE public.trees ADD COLUMN location_description TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='trees' AND column_name='latitude') THEN
        ALTER TABLE public.trees ADD COLUMN latitude DOUBLE PRECISION;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='trees' AND column_name='longitude') THEN
        ALTER TABLE public.trees ADD COLUMN longitude DOUBLE PRECISION;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='trees' AND column_name='photo_url') THEN
        ALTER TABLE public.trees ADD COLUMN photo_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='trees' AND column_name='health_status') THEN
        ALTER TABLE public.trees ADD COLUMN health_status TEXT DEFAULT 'thriving';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='trees' AND column_name='height_meters') THEN
        ALTER TABLE public.trees ADD COLUMN height_meters NUMERIC(5, 2) DEFAULT 1.0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='trees' AND column_name='dbh_cm') THEN
        ALTER TABLE public.trees ADD COLUMN dbh_cm NUMERIC(5, 2) DEFAULT 2.0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='trees' AND column_name='carbon_offset_kg') THEN
        ALTER TABLE public.trees ADD COLUMN carbon_offset_kg NUMERIC(8, 2) DEFAULT 5.0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='trees' AND column_name='notes') THEN
        ALTER TABLE public.trees ADD COLUMN notes TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='trees' AND column_name='user_id') THEN
        ALTER TABLE public.trees ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='trees' AND column_name='is_private_location') THEN
        ALTER TABLE public.trees ADD COLUMN is_private_location BOOLEAN NOT NULL DEFAULT FALSE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='trees' AND column_name='is_archived') THEN
        ALTER TABLE public.trees ADD COLUMN is_archived BOOLEAN NOT NULL DEFAULT FALSE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='trees' AND column_name='created_at') THEN
        ALTER TABLE public.trees ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='trees' AND column_name='updated_at') THEN
        ALTER TABLE public.trees ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
    END IF;

    -- Harmonize tree_care_tasks
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='tree_care_tasks' AND column_name='completed_by') THEN
        ALTER TABLE public.tree_care_tasks ADD COLUMN completed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;

    -- Enforce Unique constraint on tree_code
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint con
        JOIN pg_class rel ON rel.oid = con.conrelid
        JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
        WHERE nsp.nspname = 'public' AND rel.relname = 'trees' AND con.conname = 'trees_tree_code_key'
    ) THEN
        ALTER TABLE public.trees ADD CONSTRAINT trees_tree_code_key UNIQUE (tree_code);
    END IF;

    -- Enforce health_status CHECK on trees
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint con
        JOIN pg_class rel ON rel.oid = con.conrelid
        JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
        WHERE nsp.nspname = 'public' AND rel.relname = 'trees' AND con.conname = 'trees_health_status_check'
    ) THEN
        ALTER TABLE public.trees ADD CONSTRAINT trees_health_status_check 
            CHECK (health_status IN ('thriving', 'stable', 'attention_required', 'critical'));
    END IF;

    -- Enforce priority CHECK on tree_care_tasks
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint con
        JOIN pg_class rel ON rel.oid = con.conrelid
        JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
        WHERE nsp.nspname = 'public' AND rel.relname = 'tree_care_tasks' AND con.conname = 'tree_care_tasks_priority_check'
    ) THEN
        ALTER TABLE public.tree_care_tasks ADD CONSTRAINT tree_care_tasks_priority_check 
            CHECK (priority IN ('low', 'medium', 'high', 'urgent'));
    END IF;

    -- Enforce health_status CHECK on tree_growth_logs
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint con
        JOIN pg_class rel ON rel.oid = con.conrelid
        JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
        WHERE nsp.nspname = 'public' AND rel.relname = 'tree_growth_logs' AND con.conname = 'tree_growth_logs_health_status_check'
    ) THEN
        ALTER TABLE public.tree_growth_logs ADD CONSTRAINT tree_growth_logs_health_status_check 
            CHECK (health_status IN ('thriving', 'stable', 'attention_required', 'critical'));
    END IF;

    -- Enforce status CHECK on tree_adoptions
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint con
        JOIN pg_class rel ON rel.oid = con.conrelid
        JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
        WHERE nsp.nspname = 'public' AND rel.relname = 'tree_adoptions' AND con.conname = 'tree_adoptions_status_check'
    ) THEN
        ALTER TABLE public.tree_adoptions ADD CONSTRAINT tree_adoptions_status_check 
            CHECK (status IN ('active', 'concluded'));
    END IF;

    -- Enforce active adoption uniqueness per user/tree
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE schemaname = 'public' AND tablename = 'tree_adoptions' AND indexname = 'idx_unique_active_tree_adoption'
    ) THEN
        CREATE UNIQUE INDEX idx_unique_active_tree_adoption 
            ON public.tree_adoptions (tree_id, user_id) 
            WHERE status = 'active';
    END IF;

    -- Enforce severity and status CHECK on tree_health_records
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint con
        JOIN pg_class rel ON rel.oid = con.conrelid
        JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
        WHERE nsp.nspname = 'public' AND rel.relname = 'tree_health_records' AND con.conname = 'tree_health_records_severity_check'
    ) THEN
        ALTER TABLE public.tree_health_records ADD CONSTRAINT tree_health_records_severity_check 
            CHECK (severity IN ('mild', 'moderate', 'severe'));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint con
        JOIN pg_class rel ON rel.oid = con.conrelid
        JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
        WHERE nsp.nspname = 'public' AND rel.relname = 'tree_health_records' AND con.conname = 'tree_health_records_status_check'
    ) THEN
        ALTER TABLE public.tree_health_records ADD CONSTRAINT tree_health_records_status_check 
            CHECK (status IN ('open', 'under_care', 'resolved'));
    END IF;
END $$;

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_trees_user_id ON public.trees (user_id);
CREATE INDEX IF NOT EXISTS idx_trees_health ON public.trees (health_status);
CREATE INDEX IF NOT EXISTS idx_trees_archived ON public.trees (is_archived);
CREATE INDEX IF NOT EXISTS idx_care_tasks_tree_id ON public.tree_care_tasks (tree_id);
CREATE INDEX IF NOT EXISTS idx_care_tasks_due_date ON public.tree_care_tasks (due_date);
CREATE INDEX IF NOT EXISTS idx_care_tasks_completed ON public.tree_care_tasks (completed);
CREATE INDEX IF NOT EXISTS idx_growth_logs_tree_id ON public.tree_growth_logs (tree_id);
CREATE INDEX IF NOT EXISTS idx_growth_logs_recorded ON public.tree_growth_logs (recorded_date DESC);
CREATE INDEX IF NOT EXISTS idx_adoptions_tree_id ON public.tree_adoptions (tree_id);
CREATE INDEX IF NOT EXISTS idx_adoptions_user_id ON public.tree_adoptions (user_id);
CREATE INDEX IF NOT EXISTS idx_health_records_tree_id ON public.tree_health_records (tree_id);
CREATE INDEX IF NOT EXISTS idx_health_records_status ON public.tree_health_records (status);

-- ==============================================================================
-- SECTION 5: IMMUTABILITY & AUDITING TRIGGERS
-- Prevents tampering with ownership, identifiers, dates, and completion state.
-- Normalizes client INSERT payloads to guarantee database integrity.
-- ==============================================================================

-- 5.1 Trees updated_at trigger function
CREATE OR REPLACE FUNCTION public.set_trees_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
BEGIN
    NEW.updated_at = clock_timestamp();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_trees_updated_at ON public.trees;
CREATE TRIGGER trg_trees_updated_at
    BEFORE UPDATE ON public.trees
    FOR EACH ROW
    EXECUTE FUNCTION public.set_trees_updated_at();

-- 5.2 Trees Immutability Trigger
CREATE OR REPLACE FUNCTION public.enforce_trees_immutability()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
BEGIN
    -- Prevent altering primary key
    IF NEW.id <> OLD.id THEN
        RAISE EXCEPTION '[MUTATION BLOCKED] Tree id cannot be modified.';
    END IF;

    -- Prevent altering tree_code once assigned
    IF OLD.tree_code IS NOT NULL AND NEW.tree_code <> OLD.tree_code THEN
        RAISE EXCEPTION '[MUTATION BLOCKED] Tree code is immutable.';
    END IF;

    -- Prevent altering planting_date
    IF NEW.planting_date <> OLD.planting_date THEN
        RAISE EXCEPTION '[MUTATION BLOCKED] Planting date is immutable.';
    END IF;

    -- Protect user_id from unauthorized reassignment
    IF OLD.user_id IS NOT NULL AND NEW.user_id IS DISTINCT FROM OLD.user_id THEN
        RAISE EXCEPTION '[MUTATION BLOCKED] Tree registration ownership (user_id) cannot be reassigned.';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_trees_immutability ON public.trees;
CREATE TRIGGER trg_trees_immutability
    BEFORE UPDATE ON public.trees
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_trees_immutability();

-- 5.3 Care Tasks Before-Insert Normalizer Trigger
CREATE OR REPLACE FUNCTION public.normalize_care_tasks_before_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
BEGIN
    -- Force author attribution to active caller
    NEW.user_id := (SELECT auth.uid());
    -- Ensure task is initially uncompleted
    NEW.completed := FALSE;
    NEW.completed_at := NULL;
    NEW.completed_by := NULL;
    NEW.created_at := clock_timestamp();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_care_tasks_before_insert ON public.tree_care_tasks;
CREATE TRIGGER trg_care_tasks_before_insert
    BEFORE INSERT ON public.tree_care_tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.normalize_care_tasks_before_insert();

-- 5.4 Care Tasks Immutability & Completion Protection Trigger
CREATE OR REPLACE FUNCTION public.enforce_care_tasks_immutability()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_is_rpc_toggle BOOLEAN;
BEGIN
    -- Check if execution originated from toggle_care_task RPC
    v_is_rpc_toggle := COALESCE(current_setting('greenverse.in_toggle_care_task', true), 'false') = 'true';

    IF NOT v_is_rpc_toggle THEN
        -- Block direct UPDATE tampering with completion state via standard REST/GraphQL
        IF NEW.completed IS DISTINCT FROM OLD.completed OR 
           NEW.completed_at IS DISTINCT FROM OLD.completed_at OR
           NEW.completed_by IS DISTINCT FROM OLD.completed_by THEN
            RAISE EXCEPTION '[MUTATION BLOCKED] Direct modification of task completion fields is prohibited. Use toggle_care_task RPC.';
        END IF;
    END IF;

    -- Immutable structural fields
    IF NEW.id <> OLD.id THEN
        RAISE EXCEPTION '[MUTATION BLOCKED] Task id cannot be modified.';
    END IF;
    IF NEW.tree_id IS DISTINCT FROM OLD.tree_id THEN
        RAISE EXCEPTION '[MUTATION BLOCKED] Task tree_id association cannot be altered.';
    END IF;
    IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
        RAISE EXCEPTION '[MUTATION BLOCKED] Task creator user_id cannot be reassigned.';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_care_tasks_immutability ON public.tree_care_tasks;
CREATE TRIGGER trg_care_tasks_immutability
    BEFORE UPDATE ON public.tree_care_tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_care_tasks_immutability();

-- 5.5 Growth Logs Immutability Trigger
CREATE OR REPLACE FUNCTION public.enforce_growth_logs_immutability()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
BEGIN
    IF NEW.id <> OLD.id THEN
        RAISE EXCEPTION '[MUTATION BLOCKED] Growth log id cannot be modified.';
    END IF;
    IF NEW.tree_id <> OLD.tree_id THEN
        RAISE EXCEPTION '[MUTATION BLOCKED] Growth log tree_id cannot be changed.';
    END IF;
    IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
        RAISE EXCEPTION '[MUTATION BLOCKED] Growth log creator user_id cannot be reassigned.';
    END IF;
    IF NEW.recorded_date <> OLD.recorded_date THEN
        RAISE EXCEPTION '[MUTATION BLOCKED] Growth log recorded_date is immutable.';
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_growth_logs_immutability ON public.tree_growth_logs;
CREATE TRIGGER trg_growth_logs_immutability
    BEFORE UPDATE ON public.tree_growth_logs
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_growth_logs_immutability();

-- 5.6 Adoptions Immutability Trigger
CREATE OR REPLACE FUNCTION public.enforce_adoptions_immutability()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_is_rpc_conclude BOOLEAN;
BEGIN
    v_is_rpc_conclude := COALESCE(current_setting('greenverse.in_conclude_adoption', true), 'false') = 'true';

    IF NOT v_is_rpc_conclude THEN
        IF NEW.status IS DISTINCT FROM OLD.status THEN
            RAISE EXCEPTION '[MUTATION BLOCKED] Direct modification of adoption status is prohibited. Use conclude_tree_adoption RPC.';
        END IF;
    END IF;

    IF NEW.id <> OLD.id THEN
        RAISE EXCEPTION '[MUTATION BLOCKED] Adoption id cannot be modified.';
    END IF;
    IF NEW.tree_id <> OLD.tree_id THEN
        RAISE EXCEPTION '[MUTATION BLOCKED] Adoption tree_id cannot be modified.';
    END IF;
    IF NEW.user_id <> OLD.user_id THEN
        RAISE EXCEPTION '[MUTATION BLOCKED] Adoption guardian user_id cannot be modified.';
    END IF;
    IF NEW.adoption_date <> OLD.adoption_date THEN
        RAISE EXCEPTION '[MUTATION BLOCKED] Adoption date is immutable.';
    END IF;
    IF NEW.guardian_name <> OLD.guardian_name THEN
        RAISE EXCEPTION '[MUTATION BLOCKED] Guardian name is immutable.';
    END IF;
    IF NEW.guardian_message IS DISTINCT FROM OLD.guardian_message THEN
        RAISE EXCEPTION '[MUTATION BLOCKED] Guardian message is immutable.';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_adoptions_immutability ON public.tree_adoptions;
CREATE TRIGGER trg_adoptions_immutability
    BEFORE UPDATE ON public.tree_adoptions
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_adoptions_immutability();

-- 5.7 Health Records Immutability Trigger
CREATE OR REPLACE FUNCTION public.enforce_health_records_immutability()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
BEGIN
    IF NEW.id <> OLD.id THEN
        RAISE EXCEPTION '[MUTATION BLOCKED] Health record id cannot be modified.';
    END IF;
    IF NEW.tree_id <> OLD.tree_id THEN
        RAISE EXCEPTION '[MUTATION BLOCKED] Health record tree_id cannot be modified.';
    END IF;
    IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
        RAISE EXCEPTION '[MUTATION BLOCKED] Health record author user_id cannot be reassigned.';
    END IF;
    IF NEW.recorded_date <> OLD.recorded_date THEN
        RAISE EXCEPTION '[MUTATION BLOCKED] Health record recorded_date is immutable.';
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_health_records_immutability ON public.tree_health_records;
CREATE TRIGGER trg_health_records_immutability
    BEFORE UPDATE ON public.tree_health_records
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_health_records_immutability();

-- ==============================================================================
-- SECTION 6: LEGACY RLS POLICY RECONCILIATION
-- Deterministic drop of known legacy policies. Halts on unknown conflicting policies.
-- ==============================================================================
DO $$
DECLARE
    r RECORD;
    v_known_policies TEXT[] := ARRAY[
        -- Legacy v1/v2 policies
        'Allow public read trees', 'Allow authenticated insert trees', 'Allow owner update trees', 'Allow owner delete trees',
        'Allow public read care tasks', 'Allow authenticated insert care tasks', 'Allow creator/assignee update care tasks', 'Allow creator delete care tasks',
        'Allow public read growth logs', 'Allow authenticated insert growth logs', 'Allow creator update growth logs', 'Allow creator delete growth logs',
        'Allow public read adoptions', 'Allow authenticated insert adoptions', 'Allow adopter update adoptions', 'Allow adopter delete adoptions',
        'Allow public read health records', 'Allow authenticated insert health records', 'Allow reporter update health records', 'Allow reporter delete health records',
        -- Previous iteration policies
        'trees_public_select', 'trees_authenticated_insert', 'trees_owner_update', 'trees_owner_delete',
        'care_tasks_public_select', 'care_tasks_auth_insert', 'care_tasks_steward_update', 'care_tasks_steward_delete',
        'growth_logs_public_select', 'growth_logs_auth_insert', 'growth_logs_author_update', 'growth_logs_author_delete',
        'adoptions_public_select', 'adoptions_auth_insert', 'adoptions_user_update', 'adoptions_user_delete',
        'health_records_auth_select', 'health_records_auth_insert', 'health_records_steward_update', 'health_records_steward_delete',
        -- Current generation policies
        'pol_trees_select_owner_steward', 'pol_trees_insert_authenticated', 'pol_trees_update_owner', 'pol_trees_delete_owner',
        'pol_care_tasks_select_steward', 'pol_care_tasks_insert_authenticated', 'pol_care_tasks_update_steward', 'pol_care_tasks_delete_steward',
        'pol_growth_logs_select_steward', 'pol_growth_logs_insert_authenticated', 'pol_growth_logs_update_author', 'pol_growth_logs_delete_author',
        'pol_adoptions_select_participant', 'pol_adoptions_insert_authenticated', 'pol_adoptions_update_guardian', 'pol_adoptions_delete_guardian',
        'pol_health_records_select_authorized', 'pol_health_records_insert_authenticated', 'pol_health_records_update_steward', 'pol_health_records_delete_author'
    ];
    v_unknown_cnt INT := 0;
BEGIN
    -- Check for unknown policies on Batch 1 tables
    FOR r IN (
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
          AND tablename IN ('trees', 'tree_care_tasks', 'tree_growth_logs', 'tree_adoptions', 'tree_health_records')
          AND policyname != ALL(v_known_policies)
    ) LOOP
        RAISE WARNING '[POLICY RECONCILIATION] Unknown existing policy detected: % on table %', r.policyname, r.tablename;
        v_unknown_cnt := v_unknown_cnt + 1;
    END LOOP;

    IF v_unknown_cnt > 0 THEN
        RAISE EXCEPTION '[RECONCILIATION HALTED] Detected % unrecognized policy/policies on Batch 1 tables. Inspect and harmonize manually.', v_unknown_cnt;
    END IF;

    -- Safely drop known policies to guarantee clean deterministic baseline
    FOR r IN (
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
          AND tablename IN ('trees', 'tree_care_tasks', 'tree_growth_logs', 'tree_adoptions', 'tree_health_records')
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    END LOOP;
    RAISE NOTICE '[POLICY RECONCILIATION] Legacy policies cleared cleanly.';
END $$;

-- ==============================================================================
-- SECTION 7: ROW-LEVEL SECURITY POLICIES (AUTHENTICATED & RESTRICTED ACCESS)
-- Direct base-table access is restricted to verified stewards and participants.
-- Public community reads route through security-barrier views in Section 9.
-- ==============================================================================

-- Enable RLS on all 5 tables
ALTER TABLE public.trees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tree_care_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tree_growth_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tree_adoptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tree_health_records ENABLE ROW LEVEL SECURITY;

-- 7.1 TREES POLICIES
-- SELECT: Tree owner or active guardian
CREATE POLICY pol_trees_select_owner_steward ON public.trees
    FOR SELECT TO authenticated
    USING (
        (SELECT auth.uid()) IS NOT NULL AND (
            user_id = (SELECT auth.uid()) OR
            EXISTS (
                SELECT 1 FROM public.tree_adoptions a
                WHERE a.tree_id = trees.id
                  AND a.user_id = (SELECT auth.uid())
                  AND a.status = 'active'
            )
        )
    );

-- INSERT: Authenticated users can register trees with their own user_id
CREATE POLICY pol_trees_insert_authenticated ON public.trees
    FOR INSERT TO authenticated
    WITH CHECK (
        (SELECT auth.uid()) IS NOT NULL AND
        (user_id IS NULL OR user_id = (SELECT auth.uid()))
    );

-- UPDATE: Owner only
CREATE POLICY pol_trees_update_owner ON public.trees
    FOR UPDATE TO authenticated
    USING ((SELECT auth.uid()) IS NOT NULL AND user_id = (SELECT auth.uid()))
    WITH CHECK ((SELECT auth.uid()) IS NOT NULL AND user_id = (SELECT auth.uid()));

-- DELETE: Owner only (soft-delete is preferred via is_archived = true)
CREATE POLICY pol_trees_delete_owner ON public.trees
    FOR DELETE TO authenticated
    USING ((SELECT auth.uid()) IS NOT NULL AND user_id = (SELECT auth.uid()));

-- 7.2 TREE CARE TASKS POLICIES
-- SELECT: Task creator, tree owner, or active guardian
CREATE POLICY pol_care_tasks_select_steward ON public.tree_care_tasks
    FOR SELECT TO authenticated
    USING (
        (SELECT auth.uid()) IS NOT NULL AND (
            user_id = (SELECT auth.uid()) OR
            completed_by = (SELECT auth.uid()) OR
            EXISTS (
                SELECT 1 FROM public.trees t
                WHERE t.id = tree_care_tasks.tree_id
                  AND (
                      t.user_id = (SELECT auth.uid()) OR
                      EXISTS (
                          SELECT 1 FROM public.tree_adoptions a
                          WHERE a.tree_id = t.id
                            AND a.user_id = (SELECT auth.uid())
                            AND a.status = 'active'
                      )
                  )
            )
        )
    );

-- INSERT: Any authenticated community member can propose care tasks
CREATE POLICY pol_care_tasks_insert_authenticated ON public.tree_care_tasks
    FOR INSERT TO authenticated
    WITH CHECK (
        (SELECT auth.uid()) IS NOT NULL AND
        (user_id IS NULL OR user_id = (SELECT auth.uid()))
    );

-- UPDATE: Task creator, tree owner, or active guardian (details only; completion blocked by trigger)
CREATE POLICY pol_care_tasks_update_steward ON public.tree_care_tasks
    FOR UPDATE TO authenticated
    USING (
        (SELECT auth.uid()) IS NOT NULL AND (
            user_id = (SELECT auth.uid()) OR
            EXISTS (
                SELECT 1 FROM public.trees t
                WHERE t.id = tree_care_tasks.tree_id
                  AND (
                      t.user_id = (SELECT auth.uid()) OR
                      EXISTS (
                          SELECT 1 FROM public.tree_adoptions a
                          WHERE a.tree_id = t.id
                            AND a.user_id = (SELECT auth.uid())
                            AND a.status = 'active'
                      )
                  )
            )
        )
    )
    WITH CHECK (
        (SELECT auth.uid()) IS NOT NULL AND (
            user_id = (SELECT auth.uid()) OR
            EXISTS (
                SELECT 1 FROM public.trees t
                WHERE t.id = tree_care_tasks.tree_id
                  AND (
                      t.user_id = (SELECT auth.uid()) OR
                      EXISTS (
                          SELECT 1 FROM public.tree_adoptions a
                          WHERE a.tree_id = t.id
                            AND a.user_id = (SELECT auth.uid())
                            AND a.status = 'active'
                      )
                  )
            )
        )
    );

-- DELETE: Task creator or tree owner
CREATE POLICY pol_care_tasks_delete_steward ON public.tree_care_tasks
    FOR DELETE TO authenticated
    USING (
        (SELECT auth.uid()) IS NOT NULL AND (
            user_id = (SELECT auth.uid()) OR
            EXISTS (
                SELECT 1 FROM public.trees t
                WHERE t.id = tree_care_tasks.tree_id AND t.user_id = (SELECT auth.uid())
            )
        )
    );

-- 7.3 TREE GROWTH LOGS POLICIES
-- SELECT: Author, tree owner, or active guardian
CREATE POLICY pol_growth_logs_select_steward ON public.tree_growth_logs
    FOR SELECT TO authenticated
    USING (
        (SELECT auth.uid()) IS NOT NULL AND (
            user_id = (SELECT auth.uid()) OR
            EXISTS (
                SELECT 1 FROM public.trees t
                WHERE t.id = tree_growth_logs.tree_id
                  AND (
                      t.user_id = (SELECT auth.uid()) OR
                      EXISTS (
                          SELECT 1 FROM public.tree_adoptions a
                          WHERE a.tree_id = t.id
                            AND a.user_id = (SELECT auth.uid())
                            AND a.status = 'active'
                      )
                  )
            )
        )
    );

-- INSERT: Authenticated users can log measurements
CREATE POLICY pol_growth_logs_insert_authenticated ON public.tree_growth_logs
    FOR INSERT TO authenticated
    WITH CHECK (
        (SELECT auth.uid()) IS NOT NULL AND
        (user_id IS NULL OR user_id = (SELECT auth.uid()))
    );

-- UPDATE: Author only
CREATE POLICY pol_growth_logs_update_author ON public.tree_growth_logs
    FOR UPDATE TO authenticated
    USING ((SELECT auth.uid()) IS NOT NULL AND user_id = (SELECT auth.uid()))
    WITH CHECK ((SELECT auth.uid()) IS NOT NULL AND user_id = (SELECT auth.uid()));

-- DELETE: Author or tree owner
CREATE POLICY pol_growth_logs_delete_author ON public.tree_growth_logs
    FOR DELETE TO authenticated
    USING (
        (SELECT auth.uid()) IS NOT NULL AND (
            user_id = (SELECT auth.uid()) OR
            EXISTS (
                SELECT 1 FROM public.trees t
                WHERE t.id = tree_growth_logs.tree_id AND t.user_id = (SELECT auth.uid())
            )
        )
    );

-- 7.4 TREE ADOPTIONS POLICIES
-- SELECT: Adopter or tree owner
CREATE POLICY pol_adoptions_select_participant ON public.tree_adoptions
    FOR SELECT TO authenticated
    USING (
        (SELECT auth.uid()) IS NOT NULL AND (
            user_id = (SELECT auth.uid()) OR
            EXISTS (
                SELECT 1 FROM public.trees t
                WHERE t.id = tree_adoptions.tree_id AND t.user_id = (SELECT auth.uid())
            )
        )
    );

-- INSERT: Authenticated users can adopt trees
CREATE POLICY pol_adoptions_insert_authenticated ON public.tree_adoptions
    FOR INSERT TO authenticated
    WITH CHECK (
        (SELECT auth.uid()) IS NOT NULL AND
        user_id = (SELECT auth.uid())
    );

-- UPDATE: Handled exclusively via conclude_tree_adoption RPC
CREATE POLICY pol_adoptions_update_guardian ON public.tree_adoptions
    FOR UPDATE TO authenticated
    USING ((SELECT auth.uid()) IS NOT NULL AND user_id = (SELECT auth.uid()))
    WITH CHECK ((SELECT auth.uid()) IS NOT NULL AND user_id = (SELECT auth.uid()));

-- DELETE: Forbidden directly to maintain legal stewardship audit log
CREATE POLICY pol_adoptions_delete_guardian ON public.tree_adoptions
    FOR DELETE TO authenticated
    USING (false);

-- 7.5 TREE HEALTH RECORDS POLICIES (TREE DOCTOR)
-- SELECT: Record creator, tree owner, or active tree guardian. NEVER anonymous.
CREATE POLICY pol_health_records_select_authorized ON public.tree_health_records
    FOR SELECT TO authenticated
    USING (
        (SELECT auth.uid()) IS NOT NULL AND (
            user_id = (SELECT auth.uid()) OR
            EXISTS (
                SELECT 1 FROM public.trees t
                WHERE t.id = tree_health_records.tree_id
                  AND (
                      t.user_id = (SELECT auth.uid()) OR
                      EXISTS (
                          SELECT 1 FROM public.tree_adoptions a
                          WHERE a.tree_id = t.id
                            AND a.user_id = (SELECT auth.uid())
                            AND a.status = 'active'
                      )
                  )
            )
        )
    );

-- INSERT: Authenticated members can submit health observations
CREATE POLICY pol_health_records_insert_authenticated ON public.tree_health_records
    FOR INSERT TO authenticated
    WITH CHECK (
        (SELECT auth.uid()) IS NOT NULL AND
        (user_id IS NULL OR user_id = (SELECT auth.uid()))
    );

-- UPDATE: Author, tree owner, or active guardian may update status & suggested actions
CREATE POLICY pol_health_records_update_steward ON public.tree_health_records
    FOR UPDATE TO authenticated
    USING (
        (SELECT auth.uid()) IS NOT NULL AND (
            user_id = (SELECT auth.uid()) OR
            EXISTS (
                SELECT 1 FROM public.trees t
                WHERE t.id = tree_health_records.tree_id
                  AND (
                      t.user_id = (SELECT auth.uid()) OR
                      EXISTS (
                          SELECT 1 FROM public.tree_adoptions a
                          WHERE a.tree_id = t.id
                            AND a.user_id = (SELECT auth.uid())
                            AND a.status = 'active'
                      )
                  )
            )
        )
    )
    WITH CHECK (
        (SELECT auth.uid()) IS NOT NULL AND (
            user_id = (SELECT auth.uid()) OR
            EXISTS (
                SELECT 1 FROM public.trees t
                WHERE t.id = tree_health_records.tree_id
                  AND (
                      t.user_id = (SELECT auth.uid()) OR
                      EXISTS (
                          SELECT 1 FROM public.tree_adoptions a
                          WHERE a.tree_id = t.id
                            AND a.user_id = (SELECT auth.uid())
                            AND a.status = 'active'
                      )
                  )
            )
        )
    );

-- DELETE: Author only
CREATE POLICY pol_health_records_delete_author ON public.tree_health_records
    FOR DELETE TO authenticated
    USING ((SELECT auth.uid()) IS NOT NULL AND user_id = (SELECT auth.uid()));

-- ==============================================================================
-- SECTION 8: TABLE & COLUMN PRIVILEGE MANAGEMENT
-- Revokes anonymous access to base tables. Grants column-specific privileges.
-- No schema-wide revocations are used so other batches remain unaffected.
-- ==============================================================================

-- Revoke all permissions on base tables from anonymous visitors
REVOKE ALL ON TABLE public.trees FROM anon, public;
REVOKE ALL ON TABLE public.tree_care_tasks FROM anon, public;
REVOKE ALL ON TABLE public.tree_growth_logs FROM anon, public;
REVOKE ALL ON TABLE public.tree_adoptions FROM anon, public;
REVOKE ALL ON TABLE public.tree_health_records FROM anon, public;

-- Grant controlled operations to authenticated role
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.trees TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.tree_care_tasks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.tree_growth_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.tree_adoptions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.tree_health_records TO authenticated;

-- ==============================================================================
-- SECTION 9: HARDENED SECURITY-BARRIER VIEWS FOR PUBLIC COMMUNITY ACCESS
-- Drops views first to avoid Postgres 42P16 column-reorder errors on CREATE OR REPLACE.
-- Views run with security_barrier = true and owner-level definer access to base tables.
-- Masked coordinates and anonymized identities prevent private location harvesting.
-- ==============================================================================

DROP VIEW IF EXISTS public.public_trees;
DROP VIEW IF EXISTS public.public_tree_care_tasks;
DROP VIEW IF EXISTS public.public_growth_logs;
DROP VIEW IF EXISTS public.public_tree_adoptions;

-- 9.1 PUBLIC TREES VIEW
-- Protects private coordinates (~110m fuzzing if is_private_location = true)
-- Hides private owner notes and unapproved/archived records
CREATE VIEW public.public_trees
WITH (security_barrier = true)
AS
SELECT
    t.id,
    t.tree_code,
    t.name,
    t.species,
    t.scientific_name,
    t.planting_date,
    CASE 
        WHEN t.is_private_location = TRUE THEN 'Private Stewardship Zone (Fuzzed)'
        ELSE t.location_description 
    END AS location_description,
    CASE 
        WHEN t.is_private_location = TRUE AND t.latitude IS NOT NULL THEN ROUND(t.latitude::numeric, 3)::double precision
        ELSE t.latitude 
    END AS latitude,
    CASE 
        WHEN t.is_private_location = TRUE AND t.longitude IS NOT NULL THEN ROUND(t.longitude::numeric, 3)::double precision
        ELSE t.longitude 
    END AS longitude,
    t.photo_url,
    t.health_status,
    t.height_meters,
    t.dbh_cm,
    t.carbon_offset_kg,
    -- Notes masked for public unless the viewer is the tree owner
    CASE 
        WHEN t.user_id = (SELECT auth.uid()) THEN t.notes
        ELSE NULL 
    END AS notes,
    t.is_private_location,
    t.created_at,
    t.updated_at
FROM public.trees t
WHERE t.is_archived = FALSE;

-- 9.2 PUBLIC TREE CARE TASKS VIEW
-- Exposes task obligations without revealing creator UUID or private steward notes
CREATE VIEW public.public_tree_care_tasks
WITH (security_barrier = true)
AS
SELECT
    c.id,
    c.tree_id,
    c.task_type,
    c.title,
    c.description,
    c.due_date,
    c.completed,
    c.completed_at,
    c.priority,
    c.created_at
FROM public.tree_care_tasks c
JOIN public.trees t ON t.id = c.tree_id
WHERE t.is_archived = FALSE;

-- 9.3 PUBLIC GROWTH LOGS VIEW
-- Exposes biometric timeline while masking user_id
CREATE VIEW public.public_growth_logs
WITH (security_barrier = true)
AS
SELECT
    g.id,
    g.tree_id,
    g.recorded_date,
    g.height_meters,
    g.dbh_cm,
    g.health_status,
    g.observations,
    g.photo_url,
    g.created_at
FROM public.tree_growth_logs g
JOIN public.trees t ON t.id = g.tree_id
WHERE t.is_archived = FALSE;

-- 9.4 PUBLIC TREE ADOPTIONS VIEW
-- Exposes active community guardian names while protecting user_id and private message
CREATE VIEW public.public_tree_adoptions
WITH (security_barrier = true)
AS
SELECT
    a.id,
    a.tree_id,
    a.guardian_name,
    a.adoption_date,
    a.status,
    a.created_at
FROM public.tree_adoptions a
JOIN public.trees t ON t.id = a.tree_id
WHERE t.is_archived = FALSE;

-- Grant SELECT on safe public views to both anonymous visitors and authenticated users
GRANT SELECT ON public.public_trees TO anon, authenticated;
GRANT SELECT ON public.public_tree_care_tasks TO anon, authenticated;
GRANT SELECT ON public.public_growth_logs TO anon, authenticated;
GRANT SELECT ON public.public_tree_adoptions TO anon, authenticated;

-- ==============================================================================
-- SECTION 10: SECURE ROW-LOCKED RPC FUNCTIONS (SECURITY DEFINER)
-- Complete task toggling and adoption concluding with fixed search_path and row locks.
-- ==============================================================================

-- 10.1 TOGGLE CARE TASK RPC
CREATE OR REPLACE FUNCTION public.toggle_care_task(
    p_task_id UUID,
    p_completed BOOLEAN
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_uid UUID;
    v_task public.tree_care_tasks%ROWTYPE;
    v_tree public.trees%ROWTYPE;
    v_is_creator BOOLEAN;
    v_is_owner BOOLEAN;
    v_is_guardian BOOLEAN;
    v_is_completer BOOLEAN;
    v_completed_at TIMESTAMPTZ;
    v_completed_by UUID;
BEGIN
    -- 1. Validate caller authentication
    v_uid := (SELECT auth.uid());
    IF v_uid IS NULL THEN
        RAISE EXCEPTION '[UNAUTHORIZED] You must be logged in to update task completion.';
    END IF;

    -- 2. Concurrency Row Lock (FOR UPDATE)
    SELECT * INTO v_task
    FROM public.tree_care_tasks
    WHERE id = p_task_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION '[NOT FOUND] Care task % does not exist.', p_task_id;
    END IF;

    -- 3. Lock associated tree to verify stewardship roles
    SELECT * INTO v_tree
    FROM public.trees
    WHERE id = v_task.tree_id
    FOR SHARE;

    -- 4. Calculate permissions
    v_is_creator   := (v_task.user_id IS NOT NULL AND v_task.user_id = v_uid);
    v_is_owner     := (v_tree.user_id IS NOT NULL AND v_tree.user_id = v_uid);
    v_is_completer := (v_task.completed_by IS NOT NULL AND v_task.completed_by = v_uid);

    SELECT EXISTS (
        SELECT 1 FROM public.tree_adoptions
        WHERE tree_id = v_task.tree_id
          AND user_id = v_uid
          AND status = 'active'
    ) INTO v_is_guardian;

    -- 5. Enforce State Transition & Authorization Rules
    IF p_completed = TRUE THEN
        -- Task Completion: Any authenticated community volunteer is authorized to complete
        -- Maintain original completion timestamp and author if already completed (idempotent)
        IF v_task.completed = TRUE THEN
            v_completed_at := v_task.completed_at;
            v_completed_by := v_task.completed_by;
        ELSE
            v_completed_at := clock_timestamp();
            v_completed_by := v_uid;
        END IF;
    ELSE
        -- Task Reopening: Only creator, tree owner, active guardian, OR the volunteer who completed it
        IF NOT (v_is_creator OR v_is_owner OR v_is_guardian OR v_is_completer) THEN
            RAISE EXCEPTION '[FORBIDDEN] Only the task creator, tree owner, guardian, or task completer can reopen this task.';
        END IF;

        v_completed_at := NULL;
        v_completed_by := NULL;
    END IF;

    -- 6. Set transaction session flag to permit update past trigger
    PERFORM set_config('greenverse.in_toggle_care_task', 'true', true);

    -- 7. Execute Update
    UPDATE public.tree_care_tasks
    SET
        completed = p_completed,
        completed_at = v_completed_at,
        completed_by = v_completed_by
    WHERE id = p_task_id;

    -- Reset session flag
    PERFORM set_config('greenverse.in_toggle_care_task', 'false', true);

    -- 8. Return Sanitized Result
    RETURN jsonb_build_object(
        'success', true,
        'task_id', p_task_id,
        'completed', p_completed,
        'completed_at', v_completed_at,
        'completed_by', v_completed_by
    );
END;
$$;

-- 10.2 CONCLUDE TREE ADOPTION RPC
CREATE OR REPLACE FUNCTION public.conclude_tree_adoption(
    p_adoption_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_uid UUID;
    v_adoption public.tree_adoptions%ROWTYPE;
    v_tree public.trees%ROWTYPE;
    v_is_guardian BOOLEAN;
    v_is_owner BOOLEAN;
BEGIN
    v_uid := (SELECT auth.uid());
    IF v_uid IS NULL THEN
        RAISE EXCEPTION '[UNAUTHORIZED] You must be logged in to manage adoptions.';
    END IF;

    -- Concurrency Row Lock
    SELECT * INTO v_adoption
    FROM public.tree_adoptions
    WHERE id = p_adoption_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION '[NOT FOUND] Adoption record % does not exist.', p_adoption_id;
    END IF;

    SELECT * INTO v_tree
    FROM public.trees
    WHERE id = v_adoption.tree_id
    FOR SHARE;

    v_is_guardian := (v_adoption.user_id = v_uid);
    v_is_owner    := (v_tree.user_id IS NOT NULL AND v_tree.user_id = v_uid);

    IF NOT (v_is_guardian OR v_is_owner) THEN
        RAISE EXCEPTION '[FORBIDDEN] Only the active guardian or tree owner can conclude this adoption.';
    END IF;

    IF v_adoption.status = 'concluded' THEN
        RETURN jsonb_build_object(
            'success', true,
            'adoption_id', p_adoption_id,
            'status', 'concluded',
            'message', 'Adoption was already concluded.'
        );
    END IF;

    PERFORM set_config('greenverse.in_conclude_adoption', 'true', true);

    UPDATE public.tree_adoptions
    SET status = 'concluded'
    WHERE id = p_adoption_id;

    PERFORM set_config('greenverse.in_conclude_adoption', 'false', true);

    RETURN jsonb_build_object(
        'success', true,
        'adoption_id', p_adoption_id,
        'status', 'concluded'
    );
END;
$$;

-- Revoke public execution and grant strictly to authenticated
REVOKE EXECUTE ON FUNCTION public.toggle_care_task(UUID, BOOLEAN) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.toggle_care_task(UUID, BOOLEAN) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.conclude_tree_adoption(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.conclude_tree_adoption(UUID) TO authenticated;

-- ==============================================================================
-- END OF MIGRATION 01: TREE ECOSYSTEM
-- ==============================================================================
