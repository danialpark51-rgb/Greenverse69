-- ==============================================================================
-- GREENVERSE — BATCH 1: COMPLETE TREE ECOSYSTEM MIGRATION
-- Run this script in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ==============================================================================

-- 1. EXTENSIONS & SCHEMAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENSURE 'trees' TABLE SCHEMA & POLICIES
CREATE TABLE IF NOT EXISTS public.trees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tree_code TEXT UNIQUE NOT NULL,
    name TEXT,
    species TEXT NOT NULL,
    scientific_name TEXT,
    planting_date DATE NOT NULL DEFAULT CURRENT_DATE,
    location_description TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    photo_url TEXT,
    health_status TEXT NOT NULL DEFAULT 'thriving' CHECK (health_status IN ('thriving', 'stable', 'attention_required', 'critical')),
    height_meters NUMERIC(5, 2) DEFAULT 1.0,
    dbh_cm NUMERIC(5, 2) DEFAULT 2.0,
    carbon_offset_kg NUMERIC(8, 2) DEFAULT 5.0,
    notes TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- If table already exists, add missing columns safely
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='trees' AND column_name='tree_code') THEN
        ALTER TABLE public.trees ADD COLUMN tree_code TEXT UNIQUE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='trees' AND column_name='location_description') THEN
        ALTER TABLE public.trees ADD COLUMN location_description TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='trees' AND column_name='photo_url') THEN
        ALTER TABLE public.trees ADD COLUMN photo_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='trees' AND column_name='health_status') THEN
        ALTER TABLE public.trees ADD COLUMN health_status TEXT DEFAULT 'thriving';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='trees' AND column_name='carbon_offset_kg') THEN
        ALTER TABLE public.trees ADD COLUMN carbon_offset_kg NUMERIC(8,2) DEFAULT 5.0;
    END IF;
END $$;

-- 3. ENSURE 'tree_care_tasks' TABLE SCHEMA
CREATE TABLE IF NOT EXISTS public.tree_care_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tree_id UUID REFERENCES public.trees(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    task_type TEXT NOT NULL DEFAULT 'Watering' CHECK (task_type IN ('Watering', 'Mulching', 'Pruning', 'Inspection', 'Sensor Check', 'Fertilization')),
    title TEXT NOT NULL,
    description TEXT,
    due_date DATE NOT NULL DEFAULT CURRENT_DATE,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. CREATE 'tree_growth_logs' (GROWTH JOURNAL)
CREATE TABLE IF NOT EXISTS public.tree_growth_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tree_id UUID NOT NULL REFERENCES public.trees(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
    height_meters NUMERIC(5, 2),
    dbh_cm NUMERIC(5, 2),
    health_status TEXT DEFAULT 'thriving' CHECK (health_status IN ('thriving', 'stable', 'attention_required', 'critical')),
    observations TEXT,
    photo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. CREATE 'tree_adoptions' (GUARDIANSHIP / ADOPT-A-TREE)
CREATE TABLE IF NOT EXISTS public.tree_adoptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tree_id UUID NOT NULL REFERENCES public.trees(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    guardian_name TEXT NOT NULL,
    guardian_message TEXT,
    adoption_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'concluded')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Prevent duplicate active adoptions by the same user for the same tree
    CONSTRAINT unique_active_user_tree_adoption UNIQUE (tree_id, user_id)
);

-- 6. CREATE 'tree_health_records' (HEALTH OBSERVATIONS & TRIAGE)
CREATE TABLE IF NOT EXISTS public.tree_health_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tree_id UUID NOT NULL REFERENCES public.trees(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
    symptoms TEXT[] NOT NULL DEFAULT '{}',
    observations TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'mild' CHECK (severity IN ('mild', 'moderate', 'severe')),
    suggested_actions TEXT,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'under_care', 'resolved')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. GRANT PERMISSIONS TO 'anon' AND 'authenticated' ROLES
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT INSERT ON public.trees TO anon; -- Allow unauthenticated registration if guest mode is permitted

-- 8. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.trees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tree_care_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tree_growth_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tree_adoptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tree_health_records ENABLE ROW LEVEL SECURITY;

-- Trees: Public read access
DROP POLICY IF EXISTS "Public read access for trees" ON public.trees;
CREATE POLICY "Public read access for trees" ON public.trees
    FOR SELECT USING (true);

-- Trees: Authenticated users can insert their own trees
DROP POLICY IF EXISTS "Authenticated users can create trees" ON public.trees;
CREATE POLICY "Authenticated users can create trees" ON public.trees
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Trees: Owners can update their trees
DROP POLICY IF EXISTS "Users can update their own trees" ON public.trees;
CREATE POLICY "Users can update their own trees" ON public.trees
    FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Tree Care Tasks: Users can view all care tasks
DROP POLICY IF EXISTS "Public read access for tree care tasks" ON public.tree_care_tasks;
CREATE POLICY "Public read access for tree care tasks" ON public.tree_care_tasks
    FOR SELECT USING (true);

-- Tree Care Tasks: Authenticated users can insert tasks
DROP POLICY IF EXISTS "Authenticated users can create care tasks" ON public.tree_care_tasks;
CREATE POLICY "Authenticated users can create care tasks" ON public.tree_care_tasks
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Tree Care Tasks: Users can update tasks (mark complete)
DROP POLICY IF EXISTS "Users can update care tasks" ON public.tree_care_tasks;
CREATE POLICY "Users can update care tasks" ON public.tree_care_tasks
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Tree Growth Logs: Public read access
DROP POLICY IF EXISTS "Public read access for growth logs" ON public.tree_growth_logs;
CREATE POLICY "Public read access for growth logs" ON public.tree_growth_logs
    FOR SELECT USING (true);

-- Tree Growth Logs: Authenticated insert
DROP POLICY IF EXISTS "Authenticated users can insert growth logs" ON public.tree_growth_logs;
CREATE POLICY "Authenticated users can insert growth logs" ON public.tree_growth_logs
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Tree Adoptions: Public read access
DROP POLICY IF EXISTS "Public read access for tree adoptions" ON public.tree_adoptions;
CREATE POLICY "Public read access for tree adoptions" ON public.tree_adoptions
    FOR SELECT USING (true);

-- Tree Adoptions: Authenticated insert with self user_id
DROP POLICY IF EXISTS "Authenticated users can adopt trees" ON public.tree_adoptions;
CREATE POLICY "Authenticated users can adopt trees" ON public.tree_adoptions
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Tree Health Records: Public read access
DROP POLICY IF EXISTS "Public read access for health records" ON public.tree_health_records;
CREATE POLICY "Public read access for health records" ON public.tree_health_records
    FOR SELECT USING (true);

-- Tree Health Records: Authenticated insert
DROP POLICY IF EXISTS "Authenticated users can record health" ON public.tree_health_records;
CREATE POLICY "Authenticated users can record health" ON public.tree_health_records
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- ==============================================================================
-- END OF MIGRATION
-- ==============================================================================
