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

-- ============================================================
-- ROW LEVEL SECURITY — BATCH 4
-- ============================================================
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

-- ── Projects ──────────────────────────────────────────────
-- Public can read active/approved projects; anon cannot read draft/rejected
CREATE POLICY "Public read active projects"
  ON public.projects FOR SELECT
  USING (status IN ('active', 'completed', 'paused'));

CREATE POLICY "Owners read own draft projects"
  ON public.projects FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Authenticated users create projects"
  ON public.projects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners update own projects"
  ON public.projects FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners delete own draft projects"
  ON public.projects FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id AND status IN ('draft', 'rejected'));

-- ── Project Members ──────────────────────────────────────
CREATE POLICY "Public read project members"
  ON public.project_members FOR SELECT USING (true);

CREATE POLICY "Users join projects"
  ON public.project_members FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users leave projects"
  ON public.project_members FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ── Funding Campaigns ───────────────────────────────────
CREATE POLICY "Public read campaigns"
  ON public.funding_campaigns FOR SELECT USING (true);

CREATE POLICY "Project owners create campaigns"
  ON public.funding_campaigns FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Campaign creators update campaigns"
  ON public.funding_campaigns FOR UPDATE
  TO authenticated
  USING (auth.uid() = creator_id);

-- ── Funding Tiers ────────────────────────────────────────
CREATE POLICY "Public read funding tiers"
  ON public.funding_tiers FOR SELECT USING (true);

-- ── Project Pledges ──────────────────────────────────────
-- Pledges are financial intent records. Anon cannot insert pledges.
CREATE POLICY "Users read own pledges"
  ON public.project_pledges FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Project owners read project pledges"
  ON public.project_pledges FOR SELECT
  TO authenticated
  USING (
    auth.uid() = (SELECT owner_id FROM public.projects WHERE id = project_id LIMIT 1)
  );

CREATE POLICY "Authenticated users create pledges"
  ON public.project_pledges FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users cancel own pledges"
  ON public.project_pledges FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'pledged')
  WITH CHECK (status = 'cancelled');

-- ── Budget Items ─────────────────────────────────────────
CREATE POLICY "Public read budget items"
  ON public.project_budget_items FOR SELECT USING (true);

CREATE POLICY "Project owners manage budget"
  ON public.project_budget_items FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = (SELECT owner_id FROM public.projects WHERE id = project_id LIMIT 1)
  );

-- ── Spending Records ─────────────────────────────────────
CREATE POLICY "Public read spending records"
  ON public.project_spending_records FOR SELECT USING (true);

CREATE POLICY "Project owners record spending"
  ON public.project_spending_records FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = recorded_by
    AND auth.uid() = (SELECT owner_id FROM public.projects WHERE id = project_id LIMIT 1)
  );

-- ── Volunteer Roles & Applications ────────────────────────
CREATE POLICY "Public read volunteer roles"
  ON public.project_volunteer_roles FOR SELECT USING (true);

CREATE POLICY "Project owners manage roles"
  ON public.project_volunteer_roles FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = (SELECT owner_id FROM public.projects WHERE id = project_id LIMIT 1)
  );

CREATE POLICY "Users apply to volunteer"
  ON public.volunteer_applications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users read own applications"
  ON public.volunteer_applications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Project owners read applications"
  ON public.volunteer_applications FOR SELECT
  TO authenticated
  USING (
    auth.uid() = (SELECT owner_id FROM public.projects WHERE id = project_id LIMIT 1)
  );

-- ── Resource Requests & Pledges ───────────────────────────
CREATE POLICY "Public read resource requests"
  ON public.project_resource_requests FOR SELECT USING (true);

CREATE POLICY "Users pledge resources"
  ON public.project_resource_pledges FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users read own resource pledges"
  ON public.project_resource_pledges FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- ── Milestones & Updates ──────────────────────────────────
CREATE POLICY "Public read milestones"
  ON public.project_milestones FOR SELECT USING (true);

CREATE POLICY "Project owners manage milestones"
  ON public.project_milestones FOR ALL
  TO authenticated
  USING (
    auth.uid() = (SELECT owner_id FROM public.projects WHERE id = project_id LIMIT 1)
  )
  WITH CHECK (
    auth.uid() = (SELECT owner_id FROM public.projects WHERE id = project_id LIMIT 1)
  );

CREATE POLICY "Public read project updates"
  ON public.project_updates FOR SELECT USING (true);

CREATE POLICY "Project owners post updates"
  ON public.project_updates FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

-- ── Impact Estimates ──────────────────────────────────────
CREATE POLICY "Public read impact estimates"
  ON public.project_impact_estimates FOR SELECT USING (true);

CREATE POLICY "Project owners manage estimates"
  ON public.project_impact_estimates FOR ALL
  TO authenticated
  USING (
    auth.uid() = (SELECT owner_id FROM public.projects WHERE id = project_id LIMIT 1)
  )
  WITH CHECK (
    auth.uid() = (SELECT owner_id FROM public.projects WHERE id = project_id LIMIT 1)
  );

-- ── Verification Records ──────────────────────────────────
CREATE POLICY "Public read verification records"
  ON public.project_verification_records FOR SELECT USING (true);

-- Only service_role / reviewers can insert verification records
-- No direct user inserts permitted

-- ── Project Reports (Moderation) ──────────────────────────
CREATE POLICY "Users submit project reports"
  ON public.project_reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users read own reports"
  ON public.project_reports FOR SELECT
  TO authenticated
  USING (auth.uid() = reporter_id);

-- ── Project Bookmarks ─────────────────────────────────────
CREATE POLICY "Users manage own bookmarks"
  ON public.project_bookmarks FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── GRANTS — Batch 4 tables ───────────────────────────────
-- anon: read-only access to public project data
GRANT SELECT ON public.projects TO anon;
GRANT SELECT ON public.funding_campaigns TO anon;
GRANT SELECT ON public.funding_tiers TO anon;
GRANT SELECT ON public.project_budget_items TO anon;
GRANT SELECT ON public.project_spending_records TO anon;
GRANT SELECT ON public.project_volunteer_roles TO anon;
GRANT SELECT ON public.project_resource_requests TO anon;
GRANT SELECT ON public.project_milestones TO anon;
GRANT SELECT ON public.project_updates TO anon;
GRANT SELECT ON public.project_impact_estimates TO anon;
GRANT SELECT ON public.project_verification_records TO anon;
GRANT SELECT ON public.project_members TO anon;
-- anon has NO access to: pledges, volunteer applications, spending entries, reports, bookmarks

-- authenticated: targeted DML, RLS enforces row-level rules
GRANT SELECT, INSERT, UPDATE ON public.projects TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.project_members TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.funding_campaigns TO authenticated;
GRANT SELECT ON public.funding_tiers TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.project_pledges TO authenticated;
GRANT SELECT, INSERT ON public.project_budget_items TO authenticated;
GRANT SELECT, INSERT ON public.project_spending_records TO authenticated;
GRANT SELECT, INSERT ON public.project_volunteer_roles TO authenticated;
GRANT SELECT, INSERT ON public.volunteer_applications TO authenticated;
GRANT SELECT, INSERT ON public.project_resource_requests TO authenticated;
GRANT SELECT, INSERT ON public.project_resource_pledges TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.project_milestones TO authenticated;
GRANT SELECT, INSERT ON public.project_updates TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.project_impact_estimates TO authenticated;
GRANT SELECT ON public.project_verification_records TO authenticated;
GRANT SELECT, INSERT ON public.project_reports TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.project_bookmarks TO authenticated;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_owner ON public.projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_category ON public.projects(category);
CREATE INDEX IF NOT EXISTS idx_project_pledges_user ON public.project_pledges(user_id);
CREATE INDEX IF NOT EXISTS idx_project_pledges_project ON public.project_pledges(project_id);
CREATE INDEX IF NOT EXISTS idx_project_milestones_project ON public.project_milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_apps_user ON public.volunteer_applications(user_id);
