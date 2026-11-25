// Greenverse Batch 4: Green Projects & Funding Ecosystem Domain Types

export type ProjectCategory =
  | 'tree_planting'
  | 'forest_restoration'
  | 'biodiversity'
  | 'recycling'
  | 'water_conservation'
  | 'urban_greening'
  | 'climate_action'
  | 'clean_energy';

export type ProjectType = 'community' | 'institutional' | 'grassroots' | 'research';

export type ProjectStatus =
  | 'draft'
  | 'pending_review'
  | 'active'
  | 'paused'
  | 'completed'
  | 'rejected'
  | 'archived';

export type VerificationStatus =
  | 'unverified'
  | 'submitted_for_review'
  | 'reviewed'
  | 'verified'
  | 'flagged';

export interface DbProject {
  id: string;
  owner_id: string | null;
  owner_name?: string;
  community_id?: string | null;
  squad_id?: string | null;
  title: string;
  slug?: string;
  subtitle?: string;
  description: string;
  cover_image_url?: string;
  problem_statement?: string;
  proposed_solution?: string;
  objectives: string[];
  category: ProjectCategory;
  project_type: ProjectType;
  status: ProjectStatus;
  verification_status: VerificationStatus;
  location_name: string;
  latitude?: number | null;
  longitude?: number | null;
  country?: string;
  region?: string;
  start_date?: string;
  end_date?: string;
  estimated_timeline?: string;
  currency: string;
  estimated_budget: number;
  funding_target: number;
  current_funding_raised: number;
  pledged_amount: number;
  supporters_count: number;
  volunteers_needed: number;
  volunteers_registered: number;
  expected_outcomes: string[];
  resource_requirements: string[];
  created_at: string;
  updated_at: string;

  // Client computed properties
  is_bookmarked?: boolean;
  user_role?: 'lead_organizer' | 'project_manager' | 'field_lead' | 'financial_controller' | 'contributor' | 'volunteer' | null;
}

export type Project = DbProject;

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  user_name: string;
  role: 'lead_organizer' | 'project_manager' | 'field_lead' | 'financial_controller' | 'contributor' | 'volunteer';
  joined_at: string;
}

export interface FundingCampaign {
  id: string;
  project_id: string;
  creator_id?: string | null;
  title: string;
  description?: string;
  budget_purpose?: string;
  funding_goal: number;
  amount_raised: number;
  pledged_amount: number;
  currency: string;
  start_date?: string;
  end_date?: string;
  status: 'draft' | 'active' | 'goal_reached' | 'completed' | 'closed';
  supporters_count: number;
  tiers?: FundingTier[];
  created_at: string;
  updated_at: string;
}

export interface FundingTier {
  id: string;
  campaign_id: string;
  title: string;
  amount: number;
  description?: string;
  benefits: string[];
  backers_count: number;
}

export interface ProjectPledge {
  id: string;
  project_id: string;
  campaign_id?: string | null;
  user_id?: string | null;
  tier_id?: string | null;
  pledge_type: 'financial_pledge' | 'in_kind_pledge' | 'seedling_pledge' | 'volunteer_hours_pledge';
  amount: number;
  currency: string;
  status: 'pledged' | 'confirmed' | 'fulfilled' | 'cancelled';
  supporter_name: string;
  supporter_email?: string;
  is_anonymous: boolean;
  notes?: string;
  created_at: string;
}

export interface BudgetItem {
  id: string;
  project_id: string;
  category: string;
  allocated_amount: number;
  notes?: string;
  created_at: string;
}

export interface SpendingRecord {
  id: string;
  project_id: string;
  category: string;
  amount: number;
  spent_date: string;
  vendor_or_payee: string;
  description: string;
  receipt_url?: string;
  recorded_by?: string | null;
  recorded_by_name?: string;
  is_verified: boolean;
  created_at: string;
}

export interface VolunteerRole {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  required_skills: string[];
  spots_needed: number;
  spots_filled: number;
  time_commitment?: string;
  location_type: 'on_site' | 'remote' | 'hybrid';
  created_at: string;
}

export interface VolunteerApplication {
  id: string;
  role_id: string;
  project_id: string;
  user_id: string;
  applicant_name: string;
  applicant_email?: string;
  skills: string[];
  availability?: string;
  motivation?: string;
  status: 'pending' | 'approved' | 'declined' | 'completed';
  created_at: string;
}

export interface ResourceRequest {
  id: string;
  project_id: string;
  resource_type: 'tools' | 'plants_seedlings' | 'equipment' | 'transport' | 'materials' | 'expertise';
  title: string;
  quantity_needed: number;
  quantity_fulfilled: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'partially_fulfilled' | 'fulfilled' | 'closed';
  created_at: string;
}

export interface ResourcePledge {
  id: string;
  request_id: string;
  user_id?: string | null;
  donor_name: string;
  quantity_offered: number;
  notes?: string;
  status: 'offered' | 'accepted' | 'delivered';
  created_at: string;
}

export interface ProjectMilestone {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  due_date: string;
  responsible_member_id?: string | null;
  responsible_member_name?: string;
  target_percentage: number;
  current_progress_percentage: number;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  evidence_url?: string;
  completion_date?: string;
  created_at: string;
}

export interface ProjectUpdate {
  id: string;
  project_id: string;
  author_id?: string | null;
  author_name?: string;
  title: string;
  content: string;
  media_url?: string;
  update_type: 'milestone' | 'field_work' | 'financial' | 'general';
  created_at: string;
}

export interface ImpactEstimate {
  id: string;
  project_id: string;
  trees_planned: number;
  tree_survival_rate_pct: number;
  planting_area_sqm: number;
  restored_greenspace_sqm: number;
  waste_diverted_kg: number;
  water_conserved_liters: number;
  estimated_annual_co2_kg: number;
  methodology_notes?: string;
  time_horizon_years: number;
  created_at: string;
}

export interface ProjectVerificationRecord {
  id: string;
  project_id: string;
  reviewer_id?: string | null;
  reviewer_name?: string;
  status: VerificationStatus;
  checklist_items: Array<{
    item: string;
    verified: boolean;
    notes?: string;
  }>;
  decision_notes?: string;
  reviewed_at: string;
}

export interface ProjectReport {
  id: string;
  project_id: string;
  reporter_id?: string | null;
  reason: 'misleading_claims' | 'inaccurate_location' | 'financial_concern' | 'inappropriate_content' | 'other';
  details: string;
  status: 'open' | 'reviewed' | 'dismissed' | 'action_taken';
  created_at: string;
}
