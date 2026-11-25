-- ==============================================================================
-- GREENVERSE — BATCH 2: SMART PLANTING INTELLIGENCE MIGRATION
-- Run this script in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. SITE ASSESSMENTS TABLE
CREATE TABLE IF NOT EXISTS public.site_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    site_name TEXT NOT NULL,
    location_name TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    space_sqm NUMERIC(10, 2) NOT NULL DEFAULT 50.0,
    sunlight TEXT NOT NULL DEFAULT 'Full Sun',
    soil_type TEXT NOT NULL DEFAULT 'Loam',
    soil_condition TEXT NOT NULL DEFAULT 'Well Drained',
    water_availability TEXT NOT NULL DEFAULT 'Automated Irrigation',
    infrastructure_notes TEXT,
    suitability_score NUMERIC(5, 2) NOT NULL DEFAULT 85.0,
    assessment_result JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. GREEN DEFICIT EVALUATIONS TABLE
CREATE TABLE IF NOT EXISTS public.green_deficit_evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    area_name TEXT NOT NULL,
    total_area_sqm NUMERIC(12, 2) NOT NULL,
    existing_canopy_pct NUMERIC(5, 2) NOT NULL,
    target_canopy_pct NUMERIC(5, 2) NOT NULL DEFAULT 30.0,
    deficit_score NUMERIC(5, 2) NOT NULL,
    priority_level TEXT NOT NULL DEFAULT 'Moderate',
    recommendations JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. PLANTING PLANS TABLE (Covers Spacing, Seasonal Calendar, Biodiversity & Risk Plans)
CREATE TABLE IF NOT EXISTS public.planting_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    plan_name TEXT NOT NULL,
    location_name TEXT NOT NULL,
    selected_species JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_area_sqm NUMERIC(10, 2) NOT NULL DEFAULT 100.0,
    total_plants INTEGER NOT NULL DEFAULT 10,
    layout_type TEXT NOT NULL DEFAULT 'Square Grid',
    biodiversity_score NUMERIC(5, 2) NOT NULL DEFAULT 75.0,
    climate_suitability_score NUMERIC(5, 2) NOT NULL DEFAULT 85.0,
    risk_score NUMERIC(5, 2) NOT NULL DEFAULT 20.0,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. SAVED SPECIES MATCHES TABLE
CREATE TABLE IF NOT EXISTS public.saved_species_matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    species_id TEXT NOT NULL,
    species_name TEXT NOT NULL,
    match_score NUMERIC(5, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.site_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.green_deficit_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planting_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_species_matches ENABLE ROW LEVEL SECURITY;

-- 7. RLS POLICIES FOR SITE ASSESSMENTS
DROP POLICY IF EXISTS "Public can view all site assessments" ON public.site_assessments;
CREATE POLICY "Public can view all site assessments" ON public.site_assessments
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert site assessments" ON public.site_assessments;
CREATE POLICY "Authenticated users can insert site assessments" ON public.site_assessments
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Anon can insert site assessments" ON public.site_assessments;
CREATE POLICY "Anon can insert site assessments" ON public.site_assessments
    FOR INSERT TO anon WITH CHECK (user_id IS NULL);

-- 8. RLS POLICIES FOR GREEN DEFICIT EVALUATIONS
DROP POLICY IF EXISTS "Public can view green deficit evaluations" ON public.green_deficit_evaluations;
CREATE POLICY "Public can view green deficit evaluations" ON public.green_deficit_evaluations
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert green deficit evaluations" ON public.green_deficit_evaluations;
CREATE POLICY "Authenticated users can insert green deficit evaluations" ON public.green_deficit_evaluations
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Anon can insert green deficit evaluations" ON public.green_deficit_evaluations;
CREATE POLICY "Anon can insert green deficit evaluations" ON public.green_deficit_evaluations
    FOR INSERT TO anon WITH CHECK (user_id IS NULL);

-- 9. RLS POLICIES FOR PLANTING PLANS
DROP POLICY IF EXISTS "Public can view planting plans" ON public.planting_plans;
CREATE POLICY "Public can view planting plans" ON public.planting_plans
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert planting plans" ON public.planting_plans;
CREATE POLICY "Authenticated users can insert planting plans" ON public.planting_plans
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can update own planting plans" ON public.planting_plans;
CREATE POLICY "Users can update own planting plans" ON public.planting_plans
    FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- 10. RLS POLICIES FOR SAVED SPECIES MATCHES
DROP POLICY IF EXISTS "Users can manage own saved species" ON public.saved_species_matches;
CREATE POLICY "Users can manage own saved species" ON public.saved_species_matches
    FOR ALL TO authenticated USING (auth.uid() = user_id);

-- 11. GRANT ROLES
GRANT SELECT, INSERT, UPDATE ON public.site_assessments TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.green_deficit_evaluations TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.planting_plans TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_species_matches TO authenticated;
