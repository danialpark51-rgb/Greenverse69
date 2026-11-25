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
-- ROW LEVEL SECURITY (RLS) & GRANTS
-- ==============================================================================
ALTER TABLE public.tree_protection_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tree_protection_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_queue_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.green_change_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_impact_metrics ENABLE ROW LEVEL SECURITY;

DO $$ 
DECLARE
    tbl text;
    tables text[] := ARRAY[
        'tree_protection_reports', 'tree_protection_updates', 'verification_queue_items',
        'reward_rules', 'user_achievements', 'green_change_records', 'personal_impact_metrics'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables LOOP
        EXECUTE format('DROP POLICY IF EXISTS "allow_all_ops_%s" ON public.%I', tbl, tbl);
        EXECUTE format('CREATE POLICY "allow_all_ops_%s" ON public.%I FOR ALL TO public USING (true) WITH CHECK (true)', tbl, tbl);
    END LOOP;
END $$;

GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
