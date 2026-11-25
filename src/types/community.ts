// Greenverse Batch 3: Community & Squad Network Domain Types

export type CommunityCategory =
  | 'Local neighborhood'
  | 'School and college'
  | 'Corporate'
  | 'Tree planting'
  | 'Biodiversity'
  | 'Waste management'
  | 'Climate action'
  | 'Water conservation'
  | 'Urban gardening';

export type CommunityRole = 'owner' | 'admin' | 'moderator' | 'member';
export type SquadRole = 'leader' | 'scout' | 'planter' | 'researcher' | 'member';

export type EnvironmentalSkill =
  | 'Tree planting'
  | 'Gardening'
  | 'Soil preparation'
  | 'Wildlife protection'
  | 'Waste recycling'
  | 'Event organizing'
  | 'Photography'
  | 'Community organizing'
  | 'Environmental research'
  | 'GIS/maps'
  | 'Education and awareness';

export interface DbCommunity {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: CommunityCategory;
  focus_area: string;
  location_name: string;
  latitude: number | null;
  longitude: number | null;
  is_private: boolean;
  avatar_url: string | null;
  banner_url: string | null;
  owner_id: string | null;
  trees_planted_count: number;
  members_count: number;
  created_at: string;
  updated_at: string;
  // Computed client-side
  userRole?: CommunityRole | null;
  isJoined?: boolean;
}

export interface DbCommunityMember {
  id: string;
  community_id: string;
  user_id: string;
  role: CommunityRole;
  joined_at: string;
  user_name?: string;
  user_email?: string;
}

export interface DbSquad {
  id: string;
  community_id: string | null;
  community_name?: string;
  name: string;
  tagline: string;
  leader_id: string | null;
  leader_name?: string;
  skills_needed: EnvironmentalSkill[];
  environmental_interests: string[];
  location_name: string;
  max_members: number;
  members_count: number;
  goals: string;
  avatar: string;
  is_recruiting: boolean;
  trees_planted: number;
  created_at: string;
  // Computed client-side
  isJoined?: boolean;
  userRole?: SquadRole | null;
}

export interface DbSquadMember {
  id: string;
  squad_id: string;
  user_id: string;
  role: SquadRole;
  skills: EnvironmentalSkill[];
  joined_at: string;
  user_name?: string;
}

export type ChallengeDifficulty = 'Beginner' | 'Intermediate' | 'Advanced' | 'Master';
export type ChallengeStatus = 'in_progress' | 'completed' | 'abandoned';

export interface DbGreenChallenge {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: ChallengeDifficulty;
  duration_days: number;
  target_metric: string;
  target_value: number;
  reward_points: number;
  reward_badge: string;
  start_date: string;
  end_date: string | null;
  is_team_challenge: boolean;
  community_id: string | null;
  community_name?: string;
  creator_id: string | null;
  participants_count: number;
  created_at: string;
  // User progress
  userParticipation?: {
    status: ChallengeStatus;
    current_progress: number;
    joined_at: string;
  } | null;
}

export type EventStatus = 'upcoming' | 'active' | 'completed' | 'cancelled';
export type RSVPStatus = 'going' | 'interested' | 'cancelled' | 'attended';

export interface DbGreenEvent {
  id: string;
  community_id: string | null;
  community_name?: string;
  squad_id: string | null;
  squad_name?: string;
  organizer_id: string | null;
  organizer_name: string;
  title: string;
  description: string;
  category: string;
  event_date: string;
  start_time: string;
  end_time: string | null;
  location_name: string;
  latitude: number | null;
  longitude: number | null;
  max_participants: number;
  current_rsvp_count: number;
  status: EventStatus;
  created_at: string;
  // Computed & UI helpers
  userRsvp?: RSVPStatus | null;
  user_rsvp_status?: string | null;
  event_type?: string;
  cover_image?: string;
  target_trees?: number;
  current_participants_count?: number;
  requirements?: string[];
}

export type PostType =
  | 'general'
  | 'tree_progress'
  | 'challenge_completed'
  | 'event_update'
  | 'achievement'
  | 'question'
  | 'field_update';

export interface DbPostComment {
  id: string;
  post_id: string;
  author_id: string;
  author_name: string;
  author_avatar?: string | null;
  content: string;
  created_at: string;
}

export interface DbCommunityPost {
  id: string;
  community_id: string;
  community_name?: string;
  author_id: string;
  author_name: string;
  author_avatar: string | null;
  title: string | null;
  content: string;
  media_url: string | null;
  post_type: PostType;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  // Client state
  isLiked?: boolean;
  user_has_liked?: boolean;
  comments?: DbPostComment[];
}

export interface DbGreenBrainArticle {
  id: string;
  author_id: string | null;
  author_name: string;
  title: string;
  category: string;
  content: string;
  summary: string | null;
  is_verified: boolean;
  upvotes_count: number;
  tags: string[];
  created_at: string;
  updated_at: string;
  // Client state
  isUpvoted?: boolean;
  isBookmarked?: boolean;
  user_has_upvoted?: boolean;
  user_has_bookmarked?: boolean;
}

export interface InAppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'community' | 'squad' | 'challenge' | 'event' | 'comment';
  link_url?: string;
  is_read: boolean;
  created_at: string;
}

export interface TeamProgressMetrics {
  totalTreesPlanted: number;
  totalTreesAdopted: number;
  activeSquadsCount: number;
  activeMembersCount: number;
  challengesCompletedCount: number;
  eventsHostedCount: number;
  collectiveSurvivalRate: number;
  total_trees_planted: number;
  total_trees_adopted: number;
  survival_rate: number;
  co2_offset_kg: number;
  topSquads: Array<{
    name: string;
    chapter: string;
    treesPlanted: number;
    membersCount: number;
    badge: string;
  }>;
  recentMilestones: Array<{
    id: string;
    title: string;
    date: string;
    category: string;
    icon: string;
  }>;
}

// Aliases for component convenience
export type GreenEvent = DbGreenEvent;
export type CommunityPost = DbCommunityPost;
export type PostComment = DbPostComment;
export type GreenBrainArticle = DbGreenBrainArticle;
export type EventRSVP = RSVPStatus;
export type TeamMetrics = TeamProgressMetrics;
export interface SquadLeaderboardEntry {
  squad_id: string;
  squad_name: string;
  trees_planted: number;
  challenges_won: number;
  score: number;
  rank: number;
}

