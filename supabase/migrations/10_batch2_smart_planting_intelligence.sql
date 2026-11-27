-- ==============================================================================
-- GREENVERSE — BATCH 2: SMART PLANTING INTELLIGENCE & MY PLANTS PERSISTENCE
-- File: supabase/migrations/10_batch2_smart_planting_intelligence.sql
-- Description: Extends planting intelligence with user plants, diagnoses,
--              care plans, favorites, and planting calendar events with strict RLS.
-- ==============================================================================

-- 1. USER PLANTS (Saved plant collection)
CREATE TABLE IF NOT EXISTS public.user_plants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    common_name TEXT NOT NULL,
    scientific_name TEXT,
    family TEXT,
    category TEXT DEFAULT 'Perennial',
    location_type TEXT DEFAULT 'Outdoor' CHECK (location_type IN ('Indoor', 'Outdoor', 'Balcony', 'Greenhouse', 'Garden Bed')),
    photo_url TEXT,
    perenual_species_id TEXT,
    planting_date DATE DEFAULT CURRENT_DATE,
    care_status TEXT DEFAULT 'Healthy' CHECK (care_status IN ('Healthy', 'Needs Attention', 'Critical', 'Dormant', 'Harvested')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for speedy user-filtered retrieval
CREATE INDEX IF NOT EXISTS idx_user_plants_user_id ON public.user_plants(user_id);

-- 2. PLANT FAVORITES
CREATE TABLE IF NOT EXISTS public.plant_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    species_id TEXT NOT NULL,
    common_name TEXT NOT NULL,
    scientific_name TEXT,
    thumbnail_url TEXT,
    source TEXT DEFAULT 'perenual' CHECK (source IN ('perenual', 'native_catalog', 'custom')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, species_id)
);

CREATE INDEX IF NOT EXISTS idx_plant_favorites_user_id ON public.plant_favorites(user_id);

-- 3. PLANT CARE PLANS
CREATE TABLE IF NOT EXISTS public.plant_care_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plant_id UUID REFERENCES public.user_plants(id) ON DELETE CASCADE,
    plant_name TEXT NOT NULL,
    scientific_name TEXT,
    watering_schedule JSONB NOT NULL DEFAULT '{}'::jsonb,
    sunlight_guidance JSONB NOT NULL DEFAULT '{}'::jsonb,
    soil_fertilizer_guidance JSONB NOT NULL DEFAULT '{}'::jsonb,
    seasonal_tasks JSONB NOT NULL DEFAULT '{}'::jsonb,
    care_summary TEXT,
    full_plan_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_plant_care_plans_user_id ON public.plant_care_plans(user_id);

-- 4. PLANT DIAGNOSES (Historical AI Disease & Health Evaluations)
CREATE TABLE IF NOT EXISTS public.plant_diagnoses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plant_id UUID REFERENCES public.user_plants(id) ON DELETE SET NULL,
    plant_name TEXT NOT NULL,
    photo_url TEXT,
    symptoms JSONB DEFAULT '[]'::jsonb,
    observations TEXT,
    primary_issue TEXT NOT NULL,
    category TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'Mild' CHECK (severity IN ('Mild', 'Moderate', 'Severe')),
    confidence TEXT NOT NULL DEFAULT 'Moderate' CHECK (confidence IN ('High', 'Moderate', 'Low')),
    treatment_recommendations JSONB DEFAULT '[]'::jsonb,
    prevention_advice JSONB DEFAULT '[]'::jsonb,
    full_diagnosis_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'monitoring')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_plant_diagnoses_user_id ON public.plant_diagnoses(user_id);

-- 5. PLANTING CALENDAR EVENTS (Interactive User Event Planner)
CREATE TABLE IF NOT EXISTS public.planting_calendar_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plant_id UUID REFERENCES public.user_plants(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    event_category TEXT NOT NULL CHECK (event_category IN ('Sowing', 'Seed Starting', 'Planting', 'Transplanting', 'Watering', 'Fertilizing', 'Pruning', 'Harvesting', 'Pest Check', 'Custom')),
    event_date DATE NOT NULL,
    notes TEXT,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    reminder_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_calendar_events_user_date ON public.planting_calendar_events(user_id, event_date);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Strict user-isolation: users can ONLY access and modify their own records.
-- ==============================================================================

ALTER TABLE public.user_plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plant_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plant_care_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plant_diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planting_calendar_events ENABLE ROW LEVEL SECURITY;

-- Policies for user_plants
DROP POLICY IF EXISTS "Users can manage own plants" ON public.user_plants;
CREATE POLICY "Users can manage own plants" ON public.user_plants
    FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policies for plant_favorites
DROP POLICY IF EXISTS "Users can manage own favorites" ON public.plant_favorites;
CREATE POLICY "Users can manage own favorites" ON public.plant_favorites
    FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policies for plant_care_plans
DROP POLICY IF EXISTS "Users can manage own care plans" ON public.plant_care_plans;
CREATE POLICY "Users can manage own care plans" ON public.plant_care_plans
    FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policies for plant_diagnoses
DROP POLICY IF EXISTS "Users can manage own diagnoses" ON public.plant_diagnoses;
CREATE POLICY "Users can manage own diagnoses" ON public.plant_diagnoses
    FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policies for planting_calendar_events
DROP POLICY IF EXISTS "Users can manage own calendar events" ON public.planting_calendar_events;
CREATE POLICY "Users can manage own calendar events" ON public.planting_calendar_events
    FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_plants TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.plant_favorites TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.plant_care_plans TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.plant_diagnoses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.planting_calendar_events TO authenticated;
