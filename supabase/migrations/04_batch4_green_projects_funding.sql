-- =========================================================================
-- GREENVERSE DATABASE MIGRATION — BATCH 4: GREEN PROJECTS & FUNDING ECOSYSTEM
-- =========================================================================

-- 1. Projects Core Table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  community_id UUID,
  squad_id UUID,
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  subtitle TEXT,
  description TEXT NOT NULL,
  cover_image_url TEXT,
  problem_statement TEXT,
  proposed_solution TEXT,
  objectives TEXT[] DEFAULT '{}',
  category TEXT NOT NULL CHECK (category IN (
    'tree_planting', 'forest_restoration', 'biodiversity',
    'recycling', 'water_conservation', 'urban_greening',
    'climate_action', 'clean_energy'
  )),
  project_type TEXT NOT NULL DEFAULT 'community' CHECK (project_type IN (
    'community', 'institutional', 'grassroots', 'research'
  )),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN (
    'draft', 'pending_review', 'active', 'paused', 'completed', 'rejected', 'archived'
  )),
  verification_status TEXT NOT NULL DEFAULT 'unverified' CHECK (verification_status IN (
    'unverified', 'submitted_for_review', 'reviewed', 'verified', 'flagged'
  )),
  location_name TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  country TEXT DEFAULT 'USA',
  region TEXT,
  start_date DATE,
  end_date DATE,
  estimated_timeline TEXT,
  currency TEXT DEFAULT 'USD',
  estimated_budget NUMERIC DEFAULT 0,
  funding_target NUMERIC DEFAULT 0,
  current_funding_raised NUMERIC DEFAULT 0,
  pledged_amount NUMERIC DEFAULT 0,
  supporters_count INTEGER DEFAULT 0,
  volunteers_needed INTEGER DEFAULT 0,
  volunteers_registered INTEGER DEFAULT 0,
  expected_outcomes TEXT[] DEFAULT '{}',
  resource_requirements TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Project Members & Roles
CREATE TABLE IF NOT EXISTS public.project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT,
  role TEXT NOT NULL DEFAULT 'contributor' CHECK (role IN (
    'lead_organizer', 'project_manager', 'field_lead', 'financial_controller', 'contributor', 'volunteer'
  )),
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (project_id, user_id)
);

-- 3. Funding Campaigns
CREATE TABLE IF NOT EXISTS public.funding_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  budget_purpose TEXT,
  funding_goal NUMERIC NOT NULL DEFAULT 0,
  amount_raised NUMERIC DEFAULT 0,
  pledged_amount NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  start_date DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN (
    'draft', 'active', 'goal_reached', 'completed', 'closed'
  )),
  supporters_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Contribution Tiers
CREATE TABLE IF NOT EXISTS public.funding_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.funding_campaigns(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  description TEXT,
  benefits TEXT[] DEFAULT '{}',
  backers_count INTEGER DEFAULT 0
);

-- 5. Project Pledges (Honest Tracking: Non-Financial & Financial Pledges)
CREATE TABLE IF NOT EXISTS public.project_pledges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.funding_campaigns(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  tier_id UUID REFERENCES public.funding_tiers(id) ON DELETE SET NULL,
  pledge_type TEXT NOT NULL DEFAULT 'financial_pledge' CHECK (pledge_type IN (
    'financial_pledge', 'in_kind_pledge', 'seedling_pledge', 'volunteer_hours_pledge'
  )),
  amount NUMERIC NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pledged' CHECK (status IN (
    'pledged', 'confirmed', 'fulfilled', 'cancelled'
  )),
  supporter_name TEXT NOT NULL,
  supporter_email TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Budget Items & Allocation (Transparency Dashboard)
CREATE TABLE IF NOT EXISTS public.project_budget_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  allocated_amount NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Project Spending Records (Transparency Dashboard)
CREATE TABLE IF NOT EXISTS public.project_spending_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  spent_date DATE DEFAULT CURRENT_DATE,
  vendor_or_payee TEXT NOT NULL,
  description TEXT NOT NULL,
  receipt_url TEXT,
  recorded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  recorded_by_name TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Volunteer Roles & Recruitment
CREATE TABLE IF NOT EXISTS public.project_volunteer_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  required_skills TEXT[] DEFAULT '{}',
  spots_needed INTEGER NOT NULL DEFAULT 5,
  spots_filled INTEGER DEFAULT 0,
  time_commitment TEXT,
  location_type TEXT NOT NULL DEFAULT 'on_site' CHECK (location_type IN ('on_site', 'remote', 'hybrid')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Volunteer Applications
CREATE TABLE IF NOT EXISTS public.volunteer_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES public.project_volunteer_roles(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  applicant_name TEXT NOT NULL,
  applicant_email TEXT,
  skills TEXT[] DEFAULT '{}',
  availability TEXT,
  motivation TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined', 'completed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (role_id, user_id)
);

-- 10. Resource Requests & Offers
CREATE TABLE IF NOT EXISTS public.project_resource_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL CHECK (resource_type IN (
    'tools', 'plants_seedlings', 'equipment', 'transport', 'materials', 'expertise'
  )),
  title TEXT NOT NULL,
  quantity_needed INTEGER NOT NULL DEFAULT 1,
  quantity_fulfilled INTEGER DEFAULT 0,
  urgency TEXT DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high', 'critical')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'partially_fulfilled', 'fulfilled', 'closed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.project_resource_pledges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.project_resource_requests(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  donor_name TEXT NOT NULL,
  quantity_offered INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  status TEXT DEFAULT 'offered' CHECK (status IN ('offered', 'accepted', 'delivered')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 11. Project Milestones & Progress
CREATE TABLE IF NOT EXISTS public.project_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  responsible_member_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  responsible_member_name TEXT,
  target_percentage INTEGER DEFAULT 100,
  current_progress_percentage INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue')),
  evidence_url TEXT,
  completion_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 12. Project Updates
CREATE TABLE IF NOT EXISTS public.project_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  media_url TEXT,
  update_type TEXT NOT NULL DEFAULT 'general' CHECK (update_type IN ('milestone', 'field_work', 'financial', 'general')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 13. Project Impact Estimates
CREATE TABLE IF NOT EXISTS public.project_impact_estimates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  trees_planned INTEGER DEFAULT 0,
  tree_survival_rate_pct NUMERIC DEFAULT 85,
  planting_area_sqm NUMERIC DEFAULT 0,
  restored_greenspace_sqm NUMERIC DEFAULT 0,
  waste_diverted_kg NUMERIC DEFAULT 0,
  water_conserved_liters NUMERIC DEFAULT 0,
  estimated_annual_co2_kg NUMERIC DEFAULT 0,
  methodology_notes TEXT,
  time_horizon_years INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 14. Project Trust & Verification
CREATE TABLE IF NOT EXISTS public.project_verification_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewer_name TEXT,
  status TEXT NOT NULL CHECK (status IN ('unverified', 'submitted_for_review', 'reviewed', 'verified', 'flagged')),
  checklist_items JSONB DEFAULT '[]',
  decision_notes TEXT,
  reviewed_at TIMESTAMPTZ DEFAULT now()
);

-- 15. Project Reports & Moderation
CREATE TABLE IF NOT EXISTS public.project_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reason TEXT NOT NULL CHECK (reason IN (
    'misleading_claims', 'inaccurate_location', 'financial_concern', 'inappropriate_content', 'other'
  )),
  details TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'reviewed', 'dismissed', 'action_taken')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 16. Project Bookmarks
CREATE TABLE IF NOT EXISTS public.project_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (project_id, user_id)
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funding_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funding_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_pledges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_spending_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_volunteer_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_resource_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_resource_pledges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_impact_estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_verification_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_bookmarks ENABLE ROW LEVEL SECURITY;

-- Grants & Permissive Policies
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
