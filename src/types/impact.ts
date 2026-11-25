// Greenverse Batch 6: Impact & Intelligence Domain Types

// 1. TREE PROTECTOR TYPES
export type ThreatCategory =
  | 'unauthorized_cutting'
  | 'root_damage'
  | 'trunk_branch_damage'
  | 'construction_threat'
  | 'barrier_needed'
  | 'disease_infestation'
  | 'heritage_nomination'
  | 'expert_needed';

export type ThreatSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ThreatUrgency = 'routine' | 'urgent' | 'emergency';
export type ProtectionStatus = 'submitted' | 'under_review' | 'action_needed' | 'in_progress' | 'resolved' | 'closed';

export interface TreeProtectionReport {
  id: string;
  tree_id?: string | null;
  reporter_id?: string | null;
  reporter_name: string;
  reporter_email?: string;
  tree_species?: string;
  threat_category: ThreatCategory;
  severity: ThreatSeverity;
  urgency: ThreatUrgency;
  location_name: string;
  latitude: number;
  longitude: number;
  description: string;
  photo_urls: string[];
  status: ProtectionStatus;
  assigned_responder_id?: string | null;
  assigned_responder_name?: string;
  responder_notes?: string;
  is_heritage?: boolean;
  created_at: string;
  updated_at: string;
}

export interface TreeProtectionUpdate {
  id: string;
  report_id: string;
  responder_id?: string | null;
  responder_name: string;
  update_text: string;
  evidence_url?: string;
  status_change_to?: ProtectionStatus;
  created_at: string;
}

// 2. GREEN VERIFICATION ENGINE
export type VerificationSubmissionType =
  | 'tree_planting'
  | 'tree_care'
  | 'project_milestone'
  | 'bounty_completion'
  | 'green_event'
  | 'tree_protection';

export type VerificationQueueStatus =
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'needs_more_evidence';

export interface VerificationQueueItem {
  id: string;
  submission_type: VerificationSubmissionType;
  reference_id: string;
  submitter_id?: string | null;
  submitter_name: string;
  title: string;
  description: string;
  evidence_urls: string[];
  location_name?: string;
  latitude?: number | null;
  longitude?: number | null;
  status: VerificationQueueStatus;
  reviewer_id?: string | null;
  reviewer_name?: string;
  reviewer_notes?: string;
  reward_points: number;
  reward_issued: boolean;
  submitted_at: string;
  reviewed_at?: string;
}

// 3. GREEN REWARDS ENGINE
export interface RewardRule {
  id: string;
  action_key: string;
  action_name: string;
  points_reward: number;
  reputation_points: number;
  badge_key?: string;
  is_active: boolean;
  max_claims_per_user: number;
  verification_required: boolean;
}

// 4. GREEN ACHIEVEMENTS
export type AchievementCategory =
  | 'tree_planting'
  | 'tree_care'
  | 'biodiversity'
  | 'community'
  | 'teamwork'
  | 'volunteering'
  | 'projects'
  | 'events'
  | 'bounties'
  | 'tree_protection'
  | 'consistency'
  | 'skills';

export type AchievementTier = 'beginner' | 'intermediate' | 'advanced' | 'special';

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_key: string;
  title: string;
  category: AchievementCategory;
  tier: AchievementTier;
  badge_icon: string;
  description: string;
  criteria_description: string;
  progress_current: number;
  progress_target: number;
  is_unlocked: boolean;
  unlocked_at?: string;
}

// 5. GREEN CHANGE MONITOR
export type ChangeDataSource = 'ground_photogrammetry' | 'community_audit' | 'drone_lidar' | 'sentinel_composite';
export type TimeHorizonPeriod = 'monthly' | 'seasonal' | 'annual';

export interface GreenChangeRecord {
  id: string;
  site_name: string;
  location_name: string;
  latitude: number;
  longitude: number;
  project_id?: string | null;
  baseline_date: string;
  latest_date: string;
  baseline_photo_url: string;
  latest_photo_url: string;
  baseline_canopy_pct: number;
  latest_canopy_pct: number;
  trees_planted_count: number;
  vegetation_increase_pct: number;
  notes: string;
  data_source: ChangeDataSource;
  time_horizon_period: TimeHorizonPeriod;
  created_at: string;
  updated_at: string;
}

// 6. GREEN IMPACT DASHBOARD & METRICS
export interface PersonalImpactMetrics {
  user_id: string;
  trees_planted_total: number;
  trees_verified: number;
  trees_reported: number;
  trees_under_care: number;
  survival_rate_pct: number;
  projects_participated: number;
  volunteer_hours: number;
  bounties_completed: number;
  challenges_won: number;
  events_attended: number;
  protections_logged: number;
  green_points_earned: number;
  co2_sequestered_kg: number;
  last_synced_at: string;
}

// 7. ENVIRONMENTAL STATISTICS
export interface EnvironmentalStatistics {
  global_trees_registered: number;
  global_trees_verified: number;
  average_survival_rate_pct: number;
  active_restoration_hectares: number;
  total_co2_sequestered_tonnes: number;
  total_volunteer_hours_community: number;
  monthly_trends: Array<{
    month: string;
    planted_count: number;
    verified_count: number;
    survival_rate: number;
  }>;
  native_species_distribution: Array<{
    species_name: string;
    count: number;
    percentage: number;
    category: string;
  }>;
  water_conserved_litres_annual: number;
}
