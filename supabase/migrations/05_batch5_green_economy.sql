-- ==============================================================================
-- GREENVERSE MIGRATION 05: BATCH 5 - GREEN ECONOMY & OPPORTUNITY ECOSYSTEM
-- ==============================================================================

-- 1. GREEN GIGS & EMPLOYMENT
CREATE TABLE IF NOT EXISTS public.gigs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    employer_name TEXT NOT NULL,
    employer_avatar_url TEXT,
    title TEXT NOT NULL,
    category TEXT NOT NULL, -- 'tree_planting_restoration', 'environmental_research', 'sustainability_consulting', 'wildlife_biodiversity', 'waste_recycling', 'climate_action', 'renewable_energy', 'gis_mapping', 'environmental_education', 'community_outreach'
    compensation_type TEXT NOT NULL, -- 'paid', 'unpaid_stipend', 'volunteer'
    compensation_amount NUMERIC(12, 2) DEFAULT 0,
    compensation_currency TEXT DEFAULT 'USD',
    compensation_frequency TEXT DEFAULT 'project', -- 'hourly', 'monthly', 'project', 'one_time'
    job_type TEXT NOT NULL, -- 'contract', 'full_time', 'part_time', 'internship', 'volunteer'
    location_type TEXT NOT NULL DEFAULT 'on_site', -- 'remote', 'on_site', 'hybrid'
    location_name TEXT,
    deadline TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'open', -- 'open', 'in_review', 'filled', 'closed'
    description TEXT NOT NULL,
    responsibilities TEXT[] DEFAULT '{}',
    requirements TEXT[] DEFAULT '{}',
    required_skills TEXT[] DEFAULT '{}',
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    applications_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.gig_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gig_id UUID NOT NULL REFERENCES public.gigs(id) ON DELETE CASCADE,
    applicant_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    applicant_name TEXT NOT NULL,
    applicant_email TEXT NOT NULL,
    experience_summary TEXT NOT NULL,
    portfolio_url TEXT,
    skills TEXT[] DEFAULT '{}',
    cover_note TEXT,
    status TEXT NOT NULL DEFAULT 'submitted', -- 'submitted', 'reviewing', 'shortlisted', 'accepted', 'rejected', 'withdrawn'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(gig_id, applicant_id)
);

CREATE TABLE IF NOT EXISTS public.gig_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gig_id UUID NOT NULL REFERENCES public.gigs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(gig_id, user_id)
);

-- 2. GREEN BOUNTIES & VERIFIED TASKS
CREATE TABLE IF NOT EXISTS public.bounties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    creator_name TEXT NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL, -- 'litter_cleanup', 'tree_planting', 'biodiversity_survey', 'garden_maintenance', 'energy_audit', 'recycling_drive'
    description TEXT NOT NULL,
    instructions TEXT NOT NULL,
    verification_requirements TEXT NOT NULL,
    reward_type TEXT NOT NULL DEFAULT 'green_points', -- 'green_points', 'badge', 'certificate', 'voucher'
    reward_value INT NOT NULL DEFAULT 50, -- Green Points or token points
    reward_label TEXT DEFAULT '50 Green Points',
    spots_available INT DEFAULT 10,
    spots_claimed INT DEFAULT 0,
    spots_completed INT DEFAULT 0,
    deadline TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'paused', 'completed', 'expired'
    location_name TEXT,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.bounty_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bounty_id UUID NOT NULL REFERENCES public.bounties(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'claimed', -- 'claimed', 'submitted', 'completed', 'abandoned'
    claimed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(bounty_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.bounty_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bounty_id UUID NOT NULL REFERENCES public.bounties(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    evidence_text TEXT NOT NULL,
    evidence_url TEXT,
    location_evidence TEXT,
    status TEXT NOT NULL DEFAULT 'under_review', -- 'under_review', 'approved', 'rejected'
    reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewer_notes TEXT,
    reviewed_at TIMESTAMPTZ,
    reward_issued BOOLEAN DEFAULT FALSE,
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. GREEN OPPORTUNITIES & PROGRAMS
CREATE TABLE IF NOT EXISTS public.opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    opportunity_type TEXT NOT NULL, -- 'internship', 'scholarship', 'fellowship', 'grant', 'volunteer', 'competition', 'training', 'workshop', 'research'
    organization_name TEXT NOT NULL,
    organization_website TEXT,
    description TEXT NOT NULL,
    eligibility TEXT NOT NULL,
    application_instructions TEXT NOT NULL,
    external_link TEXT,
    location_type TEXT NOT NULL DEFAULT 'remote', -- 'remote', 'on_site', 'hybrid'
    location_name TEXT,
    required_skills TEXT[] DEFAULT '{}',
    deadline TIMESTAMPTZ,
    funding_or_stipend TEXT,
    status TEXT NOT NULL DEFAULT 'open', -- 'open', 'closed', 'upcoming'
    bookmarks_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.opportunity_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'interested', -- 'interested', 'applied', 'interviewing', 'accepted', 'declined'
    notes TEXT,
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(opportunity_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.opportunity_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(opportunity_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.opportunity_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
    reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    details TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. GREEN WALLET & AUDITABLE LEDGER
CREATE TABLE IF NOT EXISTS public.user_wallets (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    green_points_balance INT NOT NULL DEFAULT 100,
    total_points_earned INT NOT NULL DEFAULT 100,
    total_points_redeemed INT NOT NULL DEFAULT 0,
    pending_points INT NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'VERD_PTS',
    is_locked BOOLEAN DEFAULT FALSE,
    last_activity_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL, -- 'bounty_reward', 'tree_planting', 'challenge_reward', 'redemption', 'welcome_bonus', 'adjustment'
    amount INT NOT NULL, -- positive for credits, negative for debits
    status TEXT NOT NULL DEFAULT 'completed', -- 'pending', 'approved', 'completed', 'reversed'
    reference_id TEXT, -- e.g. bounty ID or task ID
    reference_type TEXT, -- 'bounty', 'tree', 'challenge', 'redemption'
    description TEXT NOT NULL,
    balance_after INT NOT NULL,
    audit_hash TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.wallet_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reward_item_id TEXT NOT NULL,
    reward_name TEXT NOT NULL,
    category TEXT NOT NULL, -- 'restoration_sponsorship', 'eco_merchandise', 'certificate_plaque', 'workshop_ticket'
    points_cost INT NOT NULL,
    status TEXT NOT NULL DEFAULT 'processing', -- 'processing', 'fulfilled', 'cancelled'
    fulfillment_details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SKILLS PROFILE & MATCHING
CREATE TABLE IF NOT EXISTS public.user_skill_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    headline TEXT,
    bio TEXT,
    experience_level TEXT DEFAULT 'intermediate', -- 'beginner', 'intermediate', 'advanced', 'expert'
    availability TEXT DEFAULT 'flexible', -- 'full_time', 'part_time', 'weekends', 'flexible'
    preferred_job_type TEXT DEFAULT 'remote', -- 'remote', 'on_site', 'hybrid'
    skills TEXT[] DEFAULT '{}',
    interests TEXT[] DEFAULT '{}',
    certifications TEXT[] DEFAULT '{}',
    location_city TEXT,
    location_country TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. GREEN REPUTATION & CONTRIBUTION SYSTEM
CREATE TABLE IF NOT EXISTS public.user_reputations (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    reputation_score INT NOT NULL DEFAULT 50,
    reputation_tier TEXT NOT NULL DEFAULT 'Seedling Contributor', -- 'Seedling Contributor', 'Forest Steward', 'Canopy Guardian', 'Planetary Ambassador'
    trees_planted_verified INT DEFAULT 0,
    bounties_completed INT DEFAULT 0,
    challenges_won INT DEFAULT 0,
    volunteer_hours_logged NUMERIC(8, 2) DEFAULT 0,
    projects_supported INT DEFAULT 0,
    last_calculated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reputation_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL, -- 'tree_verification', 'bounty_approval', 'volunteer_shift', 'community_challenge'
    title TEXT NOT NULL,
    score_awarded INT NOT NULL DEFAULT 10,
    is_verified BOOLEAN DEFAULT TRUE,
    verification_source TEXT, -- 'satellite_mrv', 'lead_organizer', 'bounty_reviewer', 'qr_checkin'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_key TEXT NOT NULL,
    badge_name TEXT NOT NULL,
    badge_icon TEXT NOT NULL,
    badge_description TEXT NOT NULL,
    awarded_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, badge_key)
);

-- 7. GREEN MARKETPLACE
CREATE TABLE IF NOT EXISTS public.marketplace_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    seller_name TEXT NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL, -- 'plants_seedlings', 'seeds_bulbs', 'eco_products', 'gardening_tools', 'recycled_materials', 'services', 'equipment_sharing', 'community_exchange'
    listing_type TEXT NOT NULL DEFAULT 'for_sale', -- 'for_sale', 'free', 'exchange', 'donation'
    item_condition TEXT NOT NULL DEFAULT 'new', -- 'new', 'like_new', 'good', 'fair'
    price NUMERIC(10, 2) DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    exchange_preference TEXT,
    description TEXT NOT NULL,
    image_url TEXT,
    location_region TEXT,
    status TEXT NOT NULL DEFAULT 'available', -- 'available', 'reserved', 'completed', 'archived'
    bookmarks_count INT DEFAULT 0,
    inquiries_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.marketplace_inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    buyer_name TEXT NOT NULL,
    message TEXT NOT NULL,
    preferred_contact TEXT, -- e.g. 'greenverse_chat', 'email' (without exposing private phone)
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'replied', 'closed'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.marketplace_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(listing_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.marketplace_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
    reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    details TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. GREEN EXPERT FINDER
CREATE TABLE IF NOT EXISTS public.expert_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    title TEXT NOT NULL, -- e.g. 'Certified Senior Arborist & Urban Forestry Specialist'
    specialization TEXT NOT NULL, -- 'arborist', 'botanist', 'ecologist', 'sustainability_consultant', 'gis_remote_sensing', 'waste_recycling', 'climate_resilience', 'biodiversity_specialist'
    bio TEXT NOT NULL,
    years_experience INT NOT NULL DEFAULT 5,
    certifications TEXT[] DEFAULT '{}',
    hourly_rate NUMERIC(10, 2) DEFAULT 0, -- 0 indicates pro-bono / community consultation
    currency TEXT DEFAULT 'USD',
    availability TEXT DEFAULT 'consultation_available', -- 'consultation_available', 'limited', 'unavailable'
    location_name TEXT,
    remote_available BOOLEAN DEFAULT TRUE,
    verification_status TEXT NOT NULL DEFAULT 'unverified', -- 'unverified', 'under_review', 'verified'
    rating NUMERIC(3, 2) DEFAULT 4.9,
    reviews_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.expert_inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expert_id UUID NOT NULL REFERENCES public.expert_profiles(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    sender_name TEXT NOT NULL,
    sender_email TEXT NOT NULL,
    topic TEXT NOT NULL,
    message TEXT NOT NULL,
    preferred_date TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'declined', 'completed'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.expert_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expert_id UUID NOT NULL REFERENCES public.expert_profiles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(expert_id, user_id)
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) & GRANTS
-- ==============================================================================
ALTER TABLE public.gigs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gig_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gig_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bounties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bounty_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bounty_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skill_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reputations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reputation_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expert_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expert_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expert_bookmarks ENABLE ROW LEVEL SECURITY;

-- Permissive development policies (standard across Greenverse)
DO $$ 
DECLARE
    tbl text;
    tables text[] := ARRAY[
        'gigs', 'gig_applications', 'gig_bookmarks', 'bounties', 'bounty_claims', 'bounty_submissions',
        'opportunities', 'opportunity_applications', 'opportunity_bookmarks', 'opportunity_reports',
        'user_wallets', 'wallet_transactions', 'wallet_redemptions', 'user_skill_profiles',
        'user_reputations', 'reputation_activity_logs', 'user_badges', 'marketplace_listings',
        'marketplace_inquiries', 'marketplace_bookmarks', 'marketplace_reports', 'expert_profiles',
        'expert_inquiries', 'expert_bookmarks'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables LOOP
        EXECUTE format('DROP POLICY IF EXISTS "allow_all_ops_%s" ON public.%I', tbl, tbl);
        EXECUTE format('CREATE POLICY "allow_all_ops_%s" ON public.%I FOR ALL TO public USING (true) WITH CHECK (true)', tbl, tbl);
    END LOOP;
END $$;

GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
