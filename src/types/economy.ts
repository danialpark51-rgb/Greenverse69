// Greenverse Batch 5: Green Economy & Opportunity Ecosystem Types

// 1. GREEN GIGS
export type GigCategory =
  | 'tree_planting_restoration'
  | 'environmental_research'
  | 'sustainability_consulting'
  | 'wildlife_biodiversity'
  | 'waste_recycling'
  | 'climate_action'
  | 'renewable_energy'
  | 'gis_mapping'
  | 'environmental_education'
  | 'community_outreach';

export type GigCompensationType = 'paid' | 'unpaid_stipend' | 'volunteer';
export type GigJobType = 'contract' | 'full_time' | 'part_time' | 'internship' | 'volunteer';
export type GigLocationType = 'remote' | 'on_site' | 'hybrid';
export type GigStatus = 'open' | 'in_review' | 'filled' | 'closed';
export type GigApplicationStatus = 'submitted' | 'reviewing' | 'shortlisted' | 'accepted' | 'rejected' | 'withdrawn';

export interface GreenGig {
  id: string;
  employer_id: string | null;
  employer_name: string;
  employer_avatar_url?: string;
  title: string;
  category: GigCategory;
  compensation_type: GigCompensationType;
  compensation_amount: number;
  compensation_currency: string;
  compensation_frequency: 'hourly' | 'monthly' | 'project' | 'one_time';
  job_type: GigJobType;
  location_type: GigLocationType;
  location_name?: string;
  deadline?: string;
  status: GigStatus;
  description: string;
  responsibilities: string[];
  requirements: string[];
  required_skills: string[];
  project_id?: string | null;
  applications_count: number;
  is_bookmarked?: boolean;
  created_at: string;
}

export interface GigApplication {
  id: string;
  gig_id: string;
  applicant_id: string;
  applicant_name: string;
  applicant_email: string;
  experience_summary: string;
  portfolio_url?: string;
  skills: string[];
  cover_note?: string;
  status: GigApplicationStatus;
  created_at: string;
}

// 2. GREEN BOUNTIES
export type BountyCategory =
  | 'litter_cleanup'
  | 'tree_planting'
  | 'biodiversity_survey'
  | 'garden_maintenance'
  | 'energy_audit'
  | 'recycling_drive';

export type BountyRewardType = 'green_points' | 'badge' | 'certificate' | 'voucher';
export type BountyStatus = 'active' | 'paused' | 'completed' | 'expired';
export type BountySubmissionStatus = 'under_review' | 'approved' | 'rejected';

export interface GreenBounty {
  id: string;
  creator_id?: string | null;
  creator_name: string;
  title: string;
  category: BountyCategory;
  description: string;
  instructions: string;
  verification_requirements: string;
  reward_type: BountyRewardType;
  reward_value: number;
  reward_label: string;
  spots_available: number;
  spots_claimed: number;
  spots_completed: number;
  deadline?: string;
  status: BountyStatus;
  location_name?: string;
  latitude?: number | null;
  longitude?: number | null;
  project_id?: string | null;
  is_claimed_by_user?: boolean;
  user_submission?: BountySubmission | null;
  created_at: string;
}

export interface BountySubmission {
  id: string;
  bounty_id: string;
  user_id: string;
  user_name: string;
  evidence_text: string;
  evidence_url?: string;
  location_evidence?: string;
  status: BountySubmissionStatus;
  reviewer_id?: string | null;
  reviewer_notes?: string;
  reviewed_at?: string;
  reward_issued: boolean;
  submitted_at: string;
}

// 3. GREEN OPPORTUNITIES
export type OpportunityType =
  | 'internship'
  | 'scholarship'
  | 'fellowship'
  | 'grant'
  | 'volunteer'
  | 'competition'
  | 'training'
  | 'workshop'
  | 'research';

export interface GreenOpportunity {
  id: string;
  creator_id?: string | null;
  title: string;
  opportunity_type: OpportunityType;
  organization_name: string;
  organization_website?: string;
  description: string;
  eligibility: string;
  application_instructions: string;
  external_link?: string;
  location_type: GigLocationType;
  location_name?: string;
  required_skills: string[];
  deadline?: string;
  funding_or_stipend?: string;
  status: 'open' | 'closed' | 'upcoming';
  bookmarks_count: number;
  is_bookmarked?: boolean;
  user_application_status?: 'interested' | 'applied' | 'interviewing' | 'accepted' | 'declined' | null;
  created_at: string;
}

// 4. GREEN WALLET & AUDITABLE LEDGER
export interface UserWallet {
  user_id: string;
  green_points_balance: number;
  total_points_earned: number;
  total_points_redeemed: number;
  pending_points: number;
  currency: string;
  is_locked: boolean;
  last_activity_at: string;
}

export interface WalletTransaction {
  id: string;
  user_id: string;
  transaction_type: 'bounty_reward' | 'tree_planting' | 'challenge_reward' | 'redemption' | 'welcome_bonus' | 'adjustment';
  amount: number;
  status: 'pending' | 'approved' | 'completed' | 'reversed';
  reference_id?: string;
  reference_type?: string;
  description: string;
  balance_after: number;
  audit_hash?: string;
  created_at: string;
}

export interface WalletRedemptionOption {
  id: string;
  name: string;
  category: 'restoration_sponsorship' | 'eco_merchandise' | 'certificate_plaque' | 'workshop_ticket';
  points_cost: number;
  description: string;
  fulfillment_type: 'digital_certificate' | 'tree_planted' | 'physical_delivery' | 'ticket_pass';
  available: boolean;
}

// 5. SKILLS PROFILE & MATCHING
export interface UserSkillProfile {
  user_id: string;
  full_name: string;
  headline?: string;
  bio?: string;
  experience_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  availability: 'full_time' | 'part_time' | 'weekends' | 'flexible';
  preferred_job_type: 'remote' | 'on_site' | 'hybrid';
  skills: string[];
  interests: string[];
  certifications: string[];
  location_city?: string;
  location_country?: string;
  is_public: boolean;
  updated_at: string;
}

export interface SkillMatchResult {
  target_id: string;
  target_title: string;
  target_type: 'gig' | 'bounty' | 'opportunity';
  match_percentage: number;
  matched_skills: string[];
  missing_skills: string[];
  matching_reasons: string[];
  recommendation: string;
}

// 6. GREEN REPUTATION & CONTRIBUTION SYSTEM
export interface UserReputation {
  user_id: string;
  reputation_score: number;
  reputation_tier: 'Seedling Contributor' | 'Forest Steward' | 'Canopy Guardian' | 'Planetary Ambassador';
  trees_planted_verified: number;
  bounties_completed: number;
  challenges_won: number;
  volunteer_hours_logged: number;
  projects_supported: number;
  last_calculated_at: string;
}

export interface ReputationActivityLog {
  id: string;
  user_id: string;
  activity_type: 'tree_verification' | 'bounty_approval' | 'volunteer_shift' | 'community_challenge';
  title: string;
  score_awarded: number;
  is_verified: boolean;
  verification_source?: string;
  created_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_key: string;
  badge_name: string;
  badge_icon: string;
  badge_description: string;
  awarded_at: string;
}

// 7. GREEN MARKETPLACE
export type MarketplaceCategory =
  | 'plants_seedlings'
  | 'seeds_bulbs'
  | 'eco_products'
  | 'gardening_tools'
  | 'recycled_materials'
  | 'services'
  | 'equipment_sharing'
  | 'community_exchange';

export type MarketplaceListingType = 'for_sale' | 'free' | 'exchange' | 'donation';
export type MarketplaceItemCondition = 'new' | 'like_new' | 'good' | 'fair';
export type MarketplaceListingStatus = 'available' | 'reserved' | 'completed' | 'archived';

export interface MarketplaceListing {
  id: string;
  seller_id: string | null;
  seller_name: string;
  title: string;
  category: MarketplaceCategory;
  listing_type: MarketplaceListingType;
  item_condition: MarketplaceItemCondition;
  price: number;
  currency: string;
  exchange_preference?: string;
  description: string;
  image_url?: string;
  location_region?: string;
  status: MarketplaceListingStatus;
  bookmarks_count: number;
  inquiries_count: number;
  is_bookmarked?: boolean;
  created_at: string;
  updated_at: string;
}

export interface MarketplaceInquiry {
  id: string;
  listing_id: string;
  buyer_id: string | null;
  buyer_name: string;
  message: string;
  preferred_contact?: string;
  status: 'pending' | 'replied' | 'closed';
  created_at: string;
}

// 8. GREEN EXPERT FINDER
export type ExpertSpecialization =
  | 'arborist'
  | 'botanist'
  | 'ecologist'
  | 'sustainability_consultant'
  | 'gis_remote_sensing'
  | 'waste_recycling'
  | 'climate_resilience'
  | 'biodiversity_specialist';

export interface GreenExpertProfile {
  id: string;
  user_id?: string | null;
  full_name: string;
  title: string;
  specialization: ExpertSpecialization;
  bio: string;
  years_experience: number;
  certifications: string[];
  hourly_rate: number;
  currency: string;
  availability: 'consultation_available' | 'limited' | 'unavailable';
  location_name?: string;
  remote_available: boolean;
  verification_status: 'unverified' | 'under_review' | 'verified';
  rating: number;
  reviews_count: number;
  is_bookmarked?: boolean;
  created_at: string;
}

export interface ExpertInquiry {
  id: string;
  expert_id: string;
  sender_id?: string | null;
  sender_name: string;
  sender_email: string;
  topic: string;
  message: string;
  preferred_date?: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  created_at: string;
}
