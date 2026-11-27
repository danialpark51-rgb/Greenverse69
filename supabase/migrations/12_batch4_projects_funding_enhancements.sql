-- ==============================================================================
-- GREENVERSE — BATCH 4 ENHANCEMENT MIGRATION
-- File: supabase/migrations/12_batch4_projects_funding_enhancements.sql
-- Description: Additive triggers, RPCs, security hardening, and indexes for
--              the Green Projects & Funding ecosystem. Safe to run on a fresh
--              Supabase project AFTER migration 04_batch4_green_projects_funding.sql.
-- ==============================================================================

-- Defensive: ensure pg extensions are present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. SECURE search_path ON ALL SECURITY DEFINER FUNCTIONS
-- ==============================================================================

-- ==============================================================================
-- 2. PLEDGE AGGREGATE TRIGGER
--    Keeps projects.pledged_amount and projects.supporters_count up-to-date
--    automatically whenever a pledge is inserted, updated, or deleted.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.refresh_project_pledge_totals()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_project_id UUID;
BEGIN
  -- Determine which project to refresh
  IF TG_OP = 'DELETE' THEN
    v_project_id := OLD.project_id;
  ELSE
    v_project_id := NEW.project_id;
  END IF;

  -- Recalculate pledged_amount (sum of active, non-cancelled financial pledges)
  UPDATE public.projects
  SET
    pledged_amount   = COALESCE((
      SELECT SUM(amount)
      FROM   public.project_pledges
      WHERE  project_id  = v_project_id
        AND  pledge_type = 'financial_pledge'
        AND  status      NOT IN ('cancelled', 'failed')
    ), 0),
    supporters_count = COALESCE((
      SELECT COUNT(DISTINCT COALESCE(user_id::TEXT, supporter_email))
      FROM   public.project_pledges
      WHERE  project_id = v_project_id
        AND  status     NOT IN ('cancelled', 'failed')
    ), 0),
    updated_at = now()
  WHERE id = v_project_id;

  RETURN NULL; -- AFTER trigger, return value ignored
END;
$$;

-- Drop existing trigger if present, then recreate
DROP TRIGGER IF EXISTS trg_pledge_totals ON public.project_pledges;
CREATE TRIGGER trg_pledge_totals
  AFTER INSERT OR UPDATE OR DELETE ON public.project_pledges
  FOR EACH ROW EXECUTE FUNCTION public.refresh_project_pledge_totals();

-- ==============================================================================
-- 3. CAMPAIGN AGGREGATE TRIGGER
--    Mirrors the totals into funding_campaigns.pledged_amount and supporters_count.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.refresh_campaign_pledge_totals()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_campaign_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_campaign_id := OLD.campaign_id;
  ELSE
    v_campaign_id := NEW.campaign_id;
  END IF;

  IF v_campaign_id IS NULL THEN
    RETURN NULL;
  END IF;

  UPDATE public.funding_campaigns
  SET
    pledged_amount   = COALESCE((
      SELECT SUM(amount)
      FROM   public.project_pledges
      WHERE  campaign_id = v_campaign_id
        AND  pledge_type = 'financial_pledge'
        AND  status      NOT IN ('cancelled', 'failed')
    ), 0),
    supporters_count = COALESCE((
      SELECT COUNT(DISTINCT COALESCE(user_id::TEXT, supporter_email))
      FROM   public.project_pledges
      WHERE  campaign_id = v_campaign_id
        AND  status      NOT IN ('cancelled', 'failed')
    ), 0),
    updated_at = now()
  WHERE id = v_campaign_id;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_campaign_pledge_totals ON public.project_pledges;
CREATE TRIGGER trg_campaign_pledge_totals
  AFTER INSERT OR UPDATE OR DELETE ON public.project_pledges
  FOR EACH ROW EXECUTE FUNCTION public.refresh_campaign_pledge_totals();

-- ==============================================================================
-- 4. VOLUNTEER APPLICATION COUNT TRIGGER
--    Keeps project_volunteer_roles.applicants_count in sync.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.refresh_role_applicant_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_role_id := OLD.role_id;
  ELSE
    v_role_id := NEW.role_id;
  END IF;

  IF v_role_id IS NULL THEN
    RETURN NULL;
  END IF;

  UPDATE public.project_volunteer_roles
  SET applicants_count = COALESCE((
    SELECT COUNT(*) FROM public.volunteer_applications
    WHERE role_id = v_role_id AND status NOT IN ('withdrawn', 'rejected')
  ), 0)
  WHERE id = v_role_id;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_volunteer_applicant_count ON public.volunteer_applications;
CREATE TRIGGER trg_volunteer_applicant_count
  AFTER INSERT OR UPDATE OR DELETE ON public.volunteer_applications
  FOR EACH ROW EXECUTE FUNCTION public.refresh_role_applicant_count();

-- ==============================================================================
-- 5. PROJECT UPDATED_AT TRIGGER
--    Auto-bumps projects.updated_at on any column change.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.set_projects_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_projects_updated_at ON public.projects;
CREATE TRIGGER trg_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.set_projects_updated_at();

-- ==============================================================================
-- 6. SUBMIT PROJECT FOR REVIEW — RPC
--    Authenticated users can submit their own project for review.
--    Transitions: draft | active → submitted_for_review (verification_status only).
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.rpc_submit_project_for_review(p_project_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner_id UUID;
  v_current_status TEXT;
  v_current_verification TEXT;
BEGIN
  SELECT owner_id, status, verification_status
  INTO v_owner_id, v_current_status, v_current_verification
  FROM public.projects
  WHERE id = p_project_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Project not found');
  END IF;

  IF v_owner_id IS DISTINCT FROM auth.uid() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authorised');
  END IF;

  IF v_current_verification IN ('submitted_for_review', 'reviewed', 'verified') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Already submitted or verified');
  END IF;

  UPDATE public.projects
  SET verification_status = 'submitted_for_review',
      updated_at          = now()
  WHERE id = p_project_id;

  -- Insert a verification record for audit trail
  INSERT INTO public.project_verification_records
    (project_id, verification_type, status, submitted_by, evidence_description)
  VALUES
    (p_project_id, 'initial_review', 'pending', auth.uid(), 'Owner submitted project for community verification review.');

  RETURN jsonb_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_submit_project_for_review(UUID) TO authenticated;

-- ==============================================================================
-- 7. CANCEL PLEDGE — RPC
--    Lets a user cancel their own pledge. Trigger will recalculate totals.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.rpc_cancel_pledge(p_pledge_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.project_pledges
  SET status = 'cancelled', updated_at = now()
  WHERE id = p_pledge_id
    AND user_id = auth.uid()
    AND status NOT IN ('cancelled', 'failed');

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Pledge not found or already cancelled');
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_cancel_pledge(UUID) TO authenticated;

-- ==============================================================================
-- 8. ACCEPT / DECLINE VOLUNTEER APPLICATION — RPC
--    Project owner updates application status and optionally sets a message.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.rpc_decide_volunteer_application(
  p_application_id UUID,
  p_decision        TEXT,  -- 'accepted' | 'rejected'
  p_message         TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_project_id UUID;
BEGIN
  IF p_decision NOT IN ('accepted', 'rejected') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid decision value');
  END IF;

  SELECT pr.id INTO v_project_id
  FROM public.volunteer_applications va
  JOIN public.project_volunteer_roles pvr ON va.role_id = pvr.id
  JOIN public.projects pr ON pvr.project_id = pr.id
  WHERE va.id = p_application_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Application not found');
  END IF;

  -- Only the project owner can decide
  IF (SELECT owner_id FROM public.projects WHERE id = v_project_id) IS DISTINCT FROM auth.uid() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authorised');
  END IF;

  UPDATE public.volunteer_applications
  SET status     = p_decision,
      notes      = COALESCE(p_message, notes),
      updated_at = now()
  WHERE id = p_application_id;

  RETURN jsonb_build_object('success', true, 'decision', p_decision);
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_decide_volunteer_application(UUID, TEXT, TEXT) TO authenticated;

-- ==============================================================================
-- 9. MARK MILESTONE COMPLETE — RPC
--    Project owner marks a milestone complete and sets evidence URL.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.rpc_complete_milestone(
  p_milestone_id UUID,
  p_evidence_url TEXT DEFAULT NULL,
  p_notes        TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_project_id UUID;
BEGIN
  SELECT project_id INTO v_project_id
  FROM public.project_milestones
  WHERE id = p_milestone_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Milestone not found');
  END IF;

  IF (SELECT owner_id FROM public.projects WHERE id = v_project_id) IS DISTINCT FROM auth.uid() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authorised');
  END IF;

  UPDATE public.project_milestones
  SET status           = 'completed',
      completion_date  = now(),
      progress_percent = 100,
      evidence_url     = COALESCE(p_evidence_url, evidence_url),
      notes            = COALESCE(p_notes, notes),
      updated_at       = now()
  WHERE id = p_milestone_id;

  RETURN jsonb_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_complete_milestone(UUID, TEXT, TEXT) TO authenticated;

-- ==============================================================================
-- 10. GET PROJECT SUMMARY — RPC
--     Returns a lightweight project summary including live pledge/funding totals.
--     Useful for dashboard widgets without loading the full project detail.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.rpc_get_project_summary(p_project_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_proj RECORD;
  v_milestone_count INTEGER;
  v_milestone_done  INTEGER;
  v_volunteer_count INTEGER;
BEGIN
  SELECT p.*, pr.full_name AS owner_display_name
  INTO v_proj
  FROM public.projects p
  LEFT JOIN public.profiles pr ON pr.id = p.owner_id
  WHERE p.id = p_project_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Project not found');
  END IF;

  SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'completed')
  INTO v_milestone_count, v_milestone_done
  FROM public.project_milestones
  WHERE project_id = p_project_id;

  SELECT COUNT(*) INTO v_volunteer_count
  FROM public.volunteer_applications
  WHERE status = 'accepted'
    AND role_id IN (
      SELECT id FROM public.project_volunteer_roles WHERE project_id = p_project_id
    );

  RETURN jsonb_build_object(
    'id',                    v_proj.id,
    'title',                 v_proj.title,
    'status',                v_proj.status,
    'verification_status',   v_proj.verification_status,
    'funding_target',        v_proj.funding_target,
    'current_funding_raised',v_proj.current_funding_raised,
    'pledged_amount',        v_proj.pledged_amount,
    'supporters_count',      v_proj.supporters_count,
    'milestones_total',      v_milestone_count,
    'milestones_done',       v_milestone_done,
    'volunteers_accepted',   v_volunteer_count,
    'owner_display_name',    v_proj.owner_display_name
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_get_project_summary(UUID) TO authenticated, anon;

-- ==============================================================================
-- 11. ADDITIONAL PERFORMANCE INDEXES (additive, safe)
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_projects_verification   ON public.projects(verification_status);
CREATE INDEX IF NOT EXISTS idx_projects_country        ON public.projects(country);
CREATE INDEX IF NOT EXISTS idx_projects_created_at     ON public.projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_funding_campaigns_proj  ON public.funding_campaigns(project_id);
CREATE INDEX IF NOT EXISTS idx_project_pledges_camp    ON public.project_pledges(campaign_id);
CREATE INDEX IF NOT EXISTS idx_project_pledges_status  ON public.project_pledges(status);
CREATE INDEX IF NOT EXISTS idx_vol_apps_role           ON public.volunteer_applications(role_id);
CREATE INDEX IF NOT EXISTS idx_vol_apps_status         ON public.volunteer_applications(status);
CREATE INDEX IF NOT EXISTS idx_project_milestones_stat ON public.project_milestones(status);
CREATE INDEX IF NOT EXISTS idx_budget_items_proj       ON public.project_budget_items(project_id);
CREATE INDEX IF NOT EXISTS idx_spending_records_proj   ON public.project_spending_records(project_id);
CREATE INDEX IF NOT EXISTS idx_impact_estimates_proj   ON public.project_impact_estimates(project_id);
CREATE INDEX IF NOT EXISTS idx_verification_proj       ON public.project_verification_records(project_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user          ON public.project_bookmarks(user_id);

-- ==============================================================================
-- 12. OPTIONAL: SAFE COLUMN ADDITIONS (guarded with DO blocks)
-- ==============================================================================

-- Add notes column to volunteer_applications if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'volunteer_applications'
      AND column_name  = 'notes'
  ) THEN
    ALTER TABLE public.volunteer_applications ADD COLUMN notes TEXT;
  END IF;
END;
$$;

-- Add updated_at to volunteer_applications if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'volunteer_applications'
      AND column_name  = 'updated_at'
  ) THEN
    ALTER TABLE public.volunteer_applications ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
  END IF;
END;
$$;

-- Add updated_at to project_milestones if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'project_milestones'
      AND column_name  = 'updated_at'
  ) THEN
    ALTER TABLE public.project_milestones ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
  END IF;
END;
$$;

-- Add applicants_count to project_volunteer_roles if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'project_volunteer_roles'
      AND column_name  = 'applicants_count'
  ) THEN
    ALTER TABLE public.project_volunteer_roles ADD COLUMN applicants_count INTEGER DEFAULT 0;
  END IF;
END;
$$;

-- Add submitted_by to project_verification_records if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'project_verification_records'
      AND column_name  = 'submitted_by'
  ) THEN
    ALTER TABLE public.project_verification_records
      ADD COLUMN submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END;
$$;

-- ==============================================================================
-- 13. REALTIME PUBLICATION — Batch 4 tables
-- ==============================================================================

DO $$
DECLARE
  v_tables TEXT[] := ARRAY[
    'projects',
    'funding_campaigns',
    'project_pledges',
    'project_milestones',
    'project_updates',
    'project_verification_records',
    'volunteer_applications'
  ];
  v_tbl TEXT;
BEGIN
  FOREACH v_tbl IN ARRAY v_tables LOOP
    BEGIN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', v_tbl);
    EXCEPTION
      WHEN duplicate_object THEN NULL;  -- already in publication
      WHEN undefined_object THEN NULL;  -- supabase_realtime not configured
    END;
  END LOOP;
END;
$$;

-- ==============================================================================
-- END OF MIGRATION 12
-- ==============================================================================
