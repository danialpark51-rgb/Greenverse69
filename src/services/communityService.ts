import { supabase } from '../lib/supabase';
import {
  DbCommunity,
  DbCommunityMember,
  DbSquad,
  DbSquadMember,
  DbGreenChallenge,
  DbGreenEvent,
  DbCommunityPost,
  DbPostComment,
  DbGreenBrainArticle,
  InAppNotification,
  TeamProgressMetrics,
  CommunityRole,
  SquadRole,
  RSVPStatus,
  EnvironmentalSkill,
  DbVolunteerOpportunity,
  DbVolunteerRegistration,
  CommunityLeaderboardEntry,
  MemberLeaderboardEntry,
} from '../types/community';

// ==========================================
// 1. IN-MEMORY BASELINE CACHE
// ==========================================

export const INITIAL_COMMUNITIES: DbCommunity[] = [
  {
    id: 'comm-1',
    name: 'Upper Mississippi River Restoration Alliance',
    slug: 'upper-mississippi-alliance',
    description: 'Regional stewardship coalition restoring floodplain oak savannas and riparian buffer corridors along the upper basin.',
    category: 'Tree planting',
    focus_area: 'Riparian Buffer & Floodplain Keystone Hardwoods',
    location_name: 'Minneapolis & St. Paul, MN',
    latitude: 44.9778,
    longitude: -93.2650,
    is_private: false,
    avatar_url: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=200&q=80',
    banner_url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
    owner_id: null,
    trees_planted_count: 54200,
    members_count: 428,
    created_at: '2025-04-10T10:00:00Z',
    updated_at: '2026-11-20T12:00:00Z',
    userRole: 'member',
    isJoined: true
  },
  {
    id: 'comm-2',
    name: 'Biscayne Coastal Mangrove Sentinels',
    slug: 'biscayne-mangrove-sentinels',
    description: 'Dedicated coastal resilience network deploying red mangrove propagules and blue carbon sediment buffers.',
    category: 'Biodiversity',
    focus_area: 'Estuarine Mangrove Nursery Protection',
    location_name: 'Miami & Biscayne Bay, FL',
    latitude: 25.7617,
    longitude: -80.1918,
    is_private: false,
    avatar_url: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=200&q=80',
    banner_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    owner_id: null,
    trees_planted_count: 41800,
    members_count: 312,
    created_at: '2025-06-15T09:00:00Z',
    updated_at: '2026-11-22T14:00:00Z',
    userRole: null,
    isJoined: false
  },
  {
    id: 'comm-3',
    name: 'Urban Heat Island Depaving Guild',
    slug: 'urban-heat-island-depaving',
    description: 'Transforming asphalt parking lots, vacant lots, and school perimeters into dense Miyawaki mini-forests.',
    category: 'Urban gardening',
    focus_area: 'Asphalt Depaving & Pocket Reforestation',
    location_name: 'Chicago & Great Lakes Industrial Corridor',
    latitude: 41.8781,
    longitude: -87.6298,
    is_private: false,
    avatar_url: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=200&q=80',
    banner_url: 'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=800&q=80',
    owner_id: null,
    trees_planted_count: 29500,
    members_count: 265,
    created_at: '2025-08-01T11:00:00Z',
    updated_at: '2026-11-23T16:00:00Z',
    userRole: null,
    isJoined: false
  }
];

export const INITIAL_SQUADS: DbSquad[] = [
  {
    id: 'sq-1',
    community_id: 'comm-1',
    community_name: 'Upper Mississippi River Restoration Alliance',
    name: 'Cascadia Old Growth Guardians',
    tagline: 'Defending mature river buffers and planting keystone cedars.',
    leader_id: null,
    leader_name: 'Elena Rostova',
    skills_needed: ['Tree planting', 'GIS/maps', 'Photography'],
    environmental_interests: ['Old-growth conservation', 'Hydrology', 'Mycology'],
    location_name: 'Cascadia River Corridor Buffer',
    max_members: 25,
    members_count: 18,
    goals: 'Plant 1,500 western red cedars and maintain 90%+ sapling survival.',
    avatar: '🌲',
    is_recruiting: true,
    trees_planted: 3420,
    created_at: '2025-05-12T08:00:00Z',
    isJoined: true,
    userRole: 'member'
  },
  {
    id: 'sq-2',
    community_id: 'comm-2',
    community_name: 'Biscayne Coastal Mangrove Sentinels',
    name: 'Mangrove Propagule Rangers',
    tagline: 'Kicking off tidal mud planting and binding NFC digital passport tags.',
    leader_id: null,
    leader_name: 'Marcus Vance',
    skills_needed: ['Wildlife protection', 'Community organizing', 'Event organizing'],
    environmental_interests: ['Marine habitats', 'Storm surges', 'Blue carbon'],
    location_name: 'Pelican Shoals Estuary',
    max_members: 20,
    members_count: 14,
    goals: 'Anchor 2,000 propagules with geotagged biometric survival records.',
    avatar: '🌊',
    is_recruiting: true,
    trees_planted: 2150,
    created_at: '2025-07-20T10:00:00Z',
    isJoined: false,
    userRole: null
  },
  {
    id: 'sq-3',
    community_id: 'comm-3',
    community_name: 'Urban Heat Island Depaving Guild',
    name: 'Miyawaki High-Density Squad',
    tagline: 'Pocket forest planters creating fast-growing biodiversity clusters.',
    leader_id: null,
    leader_name: 'Sarah Chen',
    skills_needed: ['Gardening', 'Soil preparation', 'Education and awareness'],
    environmental_interests: ['Microclimates', 'Soil microbes', 'Native pollinators'],
    location_name: 'Cedar Bend District 3',
    max_members: 30,
    members_count: 22,
    goals: 'Establish 4 pocket micro-forests cooling urban pedestrian avenues.',
    avatar: '🏙️',
    is_recruiting: true,
    trees_planted: 1840,
    created_at: '2025-09-04T12:00:00Z',
    isJoined: false,
    userRole: null
  }
];

export const INITIAL_CHALLENGES: DbGreenChallenge[] = [
  {
    id: 'chal-1',
    title: 'Spring Canopy Surge: Plant & Care for 5 Trees',
    description: 'Plant or adopt 5 native trees in your local district and verify 14 days of establishment care.',
    category: 'Tree planting',
    difficulty: 'Intermediate',
    duration_days: 30,
    target_metric: 'Trees planted/cared',
    target_value: 5,
    reward_points: 150,
    reward_badge: 'Master Arbor Steward',
    start_date: '2026-11-01',
    end_date: '2026-12-01',
    is_team_challenge: false,
    community_id: 'comm-1',
    community_name: 'Upper Mississippi River Restoration Alliance',
    creator_id: null,
    participants_count: 142,
    created_at: '2026-11-01T00:00:00Z',
    userParticipation: {
      status: 'in_progress',
      current_progress: 3,
      joined_at: '2026-11-05T10:00:00Z'
    }
  },
  {
    id: 'chal-2',
    title: 'Zero Drought Loss: 14 Days Responsible Watering',
    description: 'Execute deep root soak cycles in accordance with species care guidelines to prevent leaf chlorosis.',
    category: 'Water conservation',
    difficulty: 'Beginner',
    duration_days: 14,
    target_metric: 'Days logged',
    target_value: 14,
    reward_points: 80,
    reward_badge: 'Hydration Guardian',
    start_date: '2026-11-10',
    end_date: '2026-11-24',
    is_team_challenge: false,
    community_id: 'comm-3',
    community_name: 'Urban Heat Island Depaving Guild',
    creator_id: null,
    participants_count: 88,
    created_at: '2026-11-10T00:00:00Z',
    userParticipation: null
  },
  {
    id: 'chal-3',
    title: 'Pollinator Highway: Build a 10m² Native Flower Bed',
    description: 'Transform lawn turf into continuous bloom native perennials supporting native bumblebee queens.',
    category: 'Biodiversity',
    difficulty: 'Advanced',
    duration_days: 21,
    target_metric: 'Square meters transformed',
    target_value: 10,
    reward_points: 200,
    reward_badge: 'Pollinator Keystone',
    start_date: '2026-11-15',
    end_date: '2026-12-06',
    is_team_challenge: true,
    community_id: 'comm-2',
    community_name: 'Biscayne Coastal Mangrove Sentinels',
    creator_id: null,
    participants_count: 54,
    created_at: '2026-11-15T00:00:00Z',
    userParticipation: null
  }
];

export const INITIAL_EVENTS: DbGreenEvent[] = [
  {
    id: 'evt-1',
    community_id: 'comm-1',
    community_name: 'Upper Mississippi River Restoration Alliance',
    squad_id: 'sq-1',
    squad_name: 'Cascadia Old Growth Guardians',
    organizer_id: null,
    organizer_name: 'Elena Rostova',
    title: 'Riparian Hardwood Planting & Live Staking Drive',
    description: 'Join volunteer stewards along the riverbank to install native live stakes, mulch collars, and soil moisture telemetry probes.',
    category: 'Tree planting',
    event_date: '2026-11-28',
    start_time: '09:00 AM',
    end_time: '01:00 PM',
    location_name: 'Skykomish River Sector 4 Buffer Zone',
    latitude: 47.6062,
    longitude: -122.3321,
    max_participants: 35,
    current_rsvp_count: 24,
    status: 'upcoming',
    created_at: '2026-11-10T10:00:00Z',
    userRsvp: 'going'
  },
  {
    id: 'evt-2',
    community_id: 'comm-2',
    community_name: 'Biscayne Coastal Mangrove Sentinels',
    squad_id: 'sq-2',
    squad_name: 'Mangrove Propagule Rangers',
    organizer_id: null,
    organizer_name: 'Marcus Vance',
    title: 'Biscayne Mud-Flat Propagule Drop & NFC Tagging',
    description: 'Wade into tidal flats to secure red mangrove roots and test digital passport identity cards.',
    category: 'Biodiversity',
    event_date: '2026-11-30',
    start_time: '08:30 AM',
    end_time: '12:00 PM',
    location_name: 'Pelican Shoals Estuary Park',
    latitude: 25.7617,
    longitude: -80.1918,
    max_participants: 25,
    current_rsvp_count: 18,
    status: 'upcoming',
    created_at: '2026-11-12T14:00:00Z',
    userRsvp: null
  },
  {
    id: 'evt-3',
    community_id: 'comm-3',
    community_name: 'Urban Heat Island Depaving Guild',
    squad_id: 'sq-3',
    squad_name: 'Miyawaki High-Density Squad',
    organizer_id: null,
    organizer_name: 'Sarah Chen',
    title: 'Urban Pocket Forest Soil Inoculation Workshop',
    description: 'Learn broadfork soil aeration and native mycorrhizal inoculum preparation for ultra-dense planting.',
    category: 'Urban gardening',
    event_date: '2026-12-05',
    start_time: '10:00 AM',
    end_time: '02:00 PM',
    location_name: 'Cedar Bend District Innovation Hub',
    latitude: 44.9778,
    longitude: -93.2650,
    max_participants: 40,
    current_rsvp_count: 32,
    status: 'upcoming',
    created_at: '2026-11-15T09:00:00Z',
    userRsvp: null
  }
];

export const INITIAL_POSTS: DbCommunityPost[] = [
  {
    id: 'post-1',
    community_id: 'comm-1',
    community_name: 'Upper Mississippi River Restoration Alliance',
    author_id: 'auth-user-1',
    author_name: 'Dr. Maeve Thorne',
    author_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    title: 'Biometric update on Council Bur Oak Twin',
    content: 'Telemetry check complete! Canopy height measured at 3.4m with vigorous leader bud expansion. Soil moisture probe reads steady at 68% after the recent gentle rain.',
    media_url: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=800&q=80',
    post_type: 'tree_progress',
    likes_count: 14,
    comments_count: 3,
    created_at: '2026-11-24T16:20:00Z',
    updated_at: '2026-11-24T16:20:00Z',
    isLiked: true,
    comments: [
      {
        id: 'c-1',
        post_id: 'post-1',
        author_id: 'auth-user-2',
        author_name: 'Tariq Al-Mansoor',
        content: 'Remarkable anchoring! The mycorrhizal inoculum applied at planting is clearly taking hold.',
        created_at: '2026-11-24T16:45:00Z'
      }
    ]
  },
  {
    id: 'post-2',
    community_id: 'comm-2',
    community_name: 'Biscayne Coastal Mangrove Sentinels',
    author_id: 'auth-user-3',
    author_name: 'Marcus Vance',
    author_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    title: '500 Mangrove Propagules Tagged with Passport QRs',
    content: 'Huge day on the tidal flats! Squad 2 tagged 500 propagules with NFC weather-resistant collars. Scannable live records will track root survival through the winter tides.',
    media_url: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80',
    post_type: 'achievement',
    likes_count: 22,
    comments_count: 2,
    created_at: '2026-11-23T11:00:00Z',
    updated_at: '2026-11-23T11:00:00Z',
    isLiked: false,
    comments: []
  }
];

export const INITIAL_GREEN_BRAIN: DbGreenBrainArticle[] = [
  {
    id: 'gb-1',
    author_id: null,
    author_name: 'Master Arborist Council',
    title: 'How to Prevent Fatal Root Flare Burying (The Donut Mulch Rule)',
    category: 'Tree care knowledge',
    summary: 'The #1 cause of premature urban tree mortality is mulch volcanoes. Learn how to expose the vital root flare.',
    content: `When planting young saplings, soil and mulch must NEVER be piled against the bark of the trunk flare.

Bark tissues require oxygen exchange through specialized lenticels. When smothered in moist woodchips, opportunistic wood-decay fungi penetrate the trunk, causing fatal collar rot within 3-5 years.

Rule of Thumb:
1. Always plant with the root flare (the gentle flare where roots meet stem) 1-2 inches above ground grade.
2. Apply mulch in a 3-foot wide 'donut' ring, 3-4 inches thick.
3. Keep the inner 3 inches immediately around the trunk completely bare.`,
    is_verified: true,
    upvotes_count: 84,
    tags: ['Mulch', 'Root Flare', 'Tree Care', 'Mortality Prevention'],
    created_at: '2026-10-15T09:00:00Z',
    updated_at: '2026-11-01T10:00:00Z',
    isUpvoted: true,
    isBookmarked: true
  },
  {
    id: 'gb-2',
    author_id: null,
    author_name: 'Agroforestry Guild',
    title: 'The Miyawaki Method for Ultra-Dense Urban Mini-Forests',
    category: 'Local environmental solutions',
    summary: 'Pioneered by Dr. Akira Miyawaki, this planting framework achieves 10x faster growth and 30x higher biodiversity density.',
    content: `The Miyawaki method replicates natural climax forest succession within compact urban parcels (as small as 100 m²).

Key Principles:
- Native Keystone Species Only: Survey local climax woodlands within a 50km radius.
- Multi-Stratum Architecture: Plant 4 natural layers (Canopy, Sub-canopy, Shrub, Ground Flora) concurrently.
- High Density: Plant 3 to 4 saplings per square meter in thoroughly aerated, organic-amended soil.
- Upward Competition: Dense planting forces saplings to compete for sunlight, accelerating vertical stem elongation rapidly.`,
    is_verified: true,
    upvotes_count: 67,
    tags: ['Miyawaki', 'Urban Forestry', 'Biodiversity', 'Micro-Forests'],
    created_at: '2026-10-22T14:00:00Z',
    updated_at: '2026-11-05T12:00:00Z',
    isUpvoted: false,
    isBookmarked: false
  },
  {
    id: 'gb-3',
    author_id: null,
    author_name: 'Wildflower & Prairie Collective',
    title: 'Creating Continuous Nectar Corridors for Native Bumblebees',
    category: 'Biodiversity',
    summary: 'Why single-season flower beds fail native pollinators, and how to sequence spring-to-autumn blooms.',
    content: `Native pollinators require continuous nectar and pollen from early spring queen emergence through autumn pre-hibernation.

Sequence:
- Early Spring: Eastern Redbud, Downy Serviceberry, Willows.
- Summer: Purple Coneflower, Wild Bergamot, Milkweed.
- Autumn: New England Aster, Goldenrod, Little Bluestem grass shelter.`,
    is_verified: false,
    upvotes_count: 42,
    tags: ['Pollinators', 'Nectar Corridors', 'Bees', 'Perennials'],
    created_at: '2026-11-02T11:00:00Z',
    updated_at: '2026-11-18T15:00:00Z',
    isUpvoted: false,
    isBookmarked: false
  }
];

export const INITIAL_NOTIFICATIONS: InAppNotification[] = [
  {
    id: 'notif-1',
    user_id: 'current-user',
    title: 'Upcoming Tree Planting Drive',
    message: 'The Riparian Hardwood Planting Drive is scheduled for Saturday at Skykomish Sector 4.',
    type: 'event',
    link_url: '/communities?tab=events',
    is_read: false,
    created_at: '2026-11-24T18:00:00Z'
  },
  {
    id: 'notif-2',
    user_id: 'current-user',
    title: 'Challenge Milestone Achieved',
    message: 'You have logged 3 of 5 trees in the Spring Canopy Surge challenge!',
    type: 'challenge',
    link_url: '/communities?tab=challenges',
    is_read: false,
    created_at: '2026-11-24T12:00:00Z'
  }
];

// Runtime mutable stores
let localCommunities = [...INITIAL_COMMUNITIES];
let localSquads = [...INITIAL_SQUADS];
let localChallenges = [...INITIAL_CHALLENGES];
let localEvents = [...INITIAL_EVENTS];
let localPosts = [...INITIAL_POSTS];
let localArticles = [...INITIAL_GREEN_BRAIN];
let localNotifications = [...INITIAL_NOTIFICATIONS];

// ==========================================
// 2. FEATURE 1: GREEN COMMUNITIES SERVICE
// ==========================================

export async function fetchCommunities(options?: {
  search?: string;
  category?: string;
  userId?: string;
}): Promise<{ data: DbCommunity[]; fromSupabase: boolean }> {
  try {
    let q = supabase.from('communities').select('*').order('created_at', { ascending: false });
    if (options?.category && options.category !== 'All') {
      q = q.eq('category', options.category);
    }
    const { data, error } = await q;
    if (!error && data && data.length > 0) {
      return { data: data as DbCommunity[], fromSupabase: true };
    }
  } catch (err) {
    console.warn('[Greenverse Communities] fetch notice:', err);
  }

  // Local fallback
  let list = [...localCommunities];
  if (options?.category && options.category !== 'All') {
    list = list.filter((c) => c.category === options.category);
  }
  if (options?.search) {
    const s = options.search.toLowerCase();
    list = list.filter((c) => c.name.toLowerCase().includes(s) || c.location_name.toLowerCase().includes(s));
  }
  return { data: list, fromSupabase: false };
}

export async function createCommunity(
  community: Partial<DbCommunity>,
  userId?: string
): Promise<{ data: DbCommunity | null; error: Error | null; fromSupabase: boolean }> {
  const slug = (community.name || 'community').toLowerCase().replace(/[^a-z0-9]+/g, '-') + `-${Date.now().toString().slice(-4)}`;
  const payload = {
    name: community.name!.trim(),
    slug,
    description: community.description?.trim() || 'A committed environmental stewardship community.',
    category: community.category || 'Local neighborhood',
    focus_area: community.focus_area?.trim() || 'Ecological restoration',
    location_name: community.location_name?.trim() || 'Global',
    latitude: community.latitude || null,
    longitude: community.longitude || null,
    is_private: community.is_private || false,
    owner_id: userId || null,
    trees_planted_count: 0,
    members_count: 1,
    avatar_url: community.avatar_url || 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=200&q=80',
    banner_url: community.banner_url || 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase.from('communities').insert(payload).select().single();
    if (!error && data) {
      localCommunities.unshift(data as DbCommunity);
      return { data: data as DbCommunity, error: null, fromSupabase: true };
    }
  } catch (err) {
    console.warn('[Greenverse Communities] insert notice:', err);
  }

  const localRecord: DbCommunity = {
    id: `comm-${Date.now()}`,
    ...payload,
    userRole: 'owner',
    isJoined: true
  };
  localCommunities.unshift(localRecord);
  return { data: localRecord, error: null, fromSupabase: false };
}

export async function toggleJoinCommunity(
  communityId: string,
  userId?: string
): Promise<{ isJoined: boolean; membersCount: number }> {
  const comm = localCommunities.find((c) => c.id === communityId);
  if (!comm) return { isJoined: false, membersCount: 0 };

  const nextState = !comm.isJoined;
  comm.isJoined = nextState;
  comm.members_count = Math.max(1, comm.members_count + (nextState ? 1 : -1));
  comm.userRole = nextState ? 'member' : null;

  try {
    if (userId) {
      if (nextState) {
        await supabase.from('community_members').insert({
          community_id: communityId,
          user_id: userId,
          role: 'member'
        });
      } else {
        await supabase.from('community_members').delete().eq('community_id', communityId).eq('user_id', userId);
      }
    }
  } catch (err) {
    console.warn('[Greenverse Communities] membership sync notice:', err);
  }

  return { isJoined: nextState, membersCount: comm.members_count };
}

// ==========================================
// 3. FEATURE 2: SQUAD MATCHER SERVICE
// ==========================================

export async function fetchSquads(options?: {
  search?: string;
  skill?: string;
  interest?: string;
  userId?: string;
}): Promise<{ data: DbSquad[]; fromSupabase: boolean }> {
  try {
    const { data, error } = await supabase.from('squads').select('*').order('created_at', { ascending: false });
    if (!error && data && data.length > 0) {
      return { data: data as DbSquad[], fromSupabase: true };
    }
  } catch (err) {
    console.warn('[Greenverse Squads] fetch notice:', err);
  }

  let list = [...localSquads];
  if (options?.skill && options.skill !== 'All') {
    list = list.filter((s) => s.skills_needed.includes(options.skill as any));
  }
  if (options?.search) {
    const s = options.search.toLowerCase();
    list = list.filter((sq) => sq.name.toLowerCase().includes(s) || sq.location_name.toLowerCase().includes(s) || sq.tagline.toLowerCase().includes(s));
  }
  return { data: list, fromSupabase: false };
}

export async function createSquad(
  squad: Partial<DbSquad>,
  userId?: string,
  userName?: string
): Promise<{ data: DbSquad | null; error: Error | null; fromSupabase: boolean }> {
  const payload = {
    community_id: squad.community_id || null,
    name: squad.name!.trim(),
    tagline: squad.tagline?.trim() || 'Environmental volunteer action squad.',
    leader_id: userId || null,
    skills_needed: squad.skills_needed || ['Tree planting', 'Community organizing'],
    environmental_interests: squad.environmental_interests || ['Canopy preservation'],
    location_name: squad.location_name?.trim() || 'Regional Hub',
    max_members: squad.max_members || 20,
    members_count: 1,
    goals: squad.goals?.trim() || 'Collaborative planting & environmental monitoring.',
    avatar: squad.avatar || '🌱',
    is_recruiting: true,
    trees_planted: 0,
    created_at: new Date().toISOString()
  };

  try {
    const { data, error } = await supabase.from('squads').insert(payload).select().single();
    if (!error && data) {
      localSquads.unshift(data as DbSquad);
      return { data: data as DbSquad, error: null, fromSupabase: true };
    }
  } catch (err) {
    console.warn('[Greenverse Squads] insert notice:', err);
  }

  const localRecord: DbSquad = {
    id: `sq-${Date.now()}`,
    ...payload,
    leader_name: userName || 'Squad Founder',
    isJoined: true,
    userRole: 'leader'
  };
  localSquads.unshift(localRecord);
  return { data: localRecord, error: null, fromSupabase: false };
}

export async function toggleJoinSquad(
  squadId: string,
  userId?: string,
  userSkills?: EnvironmentalSkill[]
): Promise<{ isJoined: boolean; membersCount: number }> {
  const sq = localSquads.find((s) => s.id === squadId);
  if (!sq) return { isJoined: false, membersCount: 0 };

  const nextState = !sq.isJoined;
  sq.isJoined = nextState;
  sq.members_count = Math.max(1, sq.members_count + (nextState ? 1 : -1));
  sq.userRole = nextState ? 'member' : null;

  try {
    if (userId) {
      if (nextState) {
        await supabase.from('squad_members').insert({
          squad_id: squadId,
          user_id: userId,
          role: 'member',
          skills: userSkills || []
        });
      } else {
        await supabase.from('squad_members').delete().eq('squad_id', squadId).eq('user_id', userId);
      }
    }
  } catch (err) {
    console.warn('[Greenverse Squads] membership sync notice:', err);
  }

  return { isJoined: nextState, membersCount: sq.members_count };
}

// ==========================================
// 4. FEATURE 3: GREEN CHALLENGES SERVICE
// ==========================================

export async function fetchChallenges(options?: {
  category?: string;
  difficulty?: string;
  userId?: string;
}): Promise<{ data: DbGreenChallenge[]; fromSupabase: boolean }> {
  try {
    const { data, error } = await supabase.from('green_challenges').select('*').order('created_at', { ascending: false });
    if (!error && data && data.length > 0) {
      return { data: data as DbGreenChallenge[], fromSupabase: true };
    }
  } catch (err) {
    console.warn('[Greenverse Challenges] fetch notice:', err);
  }

  let list = [...localChallenges];
  if (options?.category && options.category !== 'All') {
    list = list.filter((c) => c.category === options.category);
  }
  if (options?.difficulty && options.difficulty !== 'All') {
    list = list.filter((c) => c.difficulty === options.difficulty);
  }
  return { data: list, fromSupabase: false };
}

export async function toggleJoinChallenge(
  challengeId: string,
  userId?: string
): Promise<{ isJoined: boolean; currentProgress: number }> {
  const chal = localChallenges.find((c) => c.id === challengeId);
  if (!chal) return { isJoined: false, currentProgress: 0 };

  const hasJoined = !!chal.userParticipation;
  if (hasJoined) {
    chal.userParticipation = null;
    chal.participants_count = Math.max(0, chal.participants_count - 1);
    try {
      if (userId) {
        await supabase.from('challenge_participations').delete().eq('challenge_id', challengeId).eq('user_id', userId);
      }
    } catch (err) {
      console.warn('[Greenverse Challenges] leave notice:', err);
    }
    return { isJoined: false, currentProgress: 0 };
  } else {
    chal.userParticipation = {
      status: 'in_progress',
      current_progress: 1,
      joined_at: new Date().toISOString()
    };
    chal.participants_count += 1;
    try {
      if (userId) {
        await supabase.from('challenge_participations').insert({
          challenge_id: challengeId,
          user_id: userId,
          current_progress: 1,
          status: 'in_progress'
        });
      }
    } catch (err) {
      console.warn('[Greenverse Challenges] join notice:', err);
    }
    return { isJoined: true, currentProgress: 1 };
  }
}

export async function incrementChallengeProgress(
  challengeId: string,
  userId?: string,
  step: number = 1
): Promise<{ progress: number; completed: boolean }> {
  const chal = localChallenges.find((c) => c.id === challengeId);
  if (!chal || !chal.userParticipation) return { progress: 0, completed: false };

  const newProg = Math.min(chal.target_value, chal.userParticipation.current_progress + step);
  chal.userParticipation.current_progress = newProg;
  const isCompleted = newProg >= chal.target_value;
  if (isCompleted) {
    chal.userParticipation.status = 'completed';
  }

  try {
    if (userId) {
      await supabase.from('challenge_participations').update({
        current_progress: newProg,
        status: isCompleted ? 'completed' : 'in_progress',
        completed_at: isCompleted ? new Date().toISOString() : null
      }).eq('challenge_id', challengeId).eq('user_id', userId);
    }
  } catch (err) {
    console.warn('[Greenverse Challenges] update progress notice:', err);
  }

  return { progress: newProg, completed: isCompleted };
}

// ==========================================
// 5. FEATURE 4: GREEN EVENTS SERVICE
// ==========================================

export async function fetchEvents(options?: {
  category?: string;
  status?: string;
  userId?: string;
}): Promise<{ data: DbGreenEvent[]; fromSupabase: boolean }> {
  try {
    const { data, error } = await supabase.from('green_events').select('*').order('event_date', { ascending: true });
    if (!error && data && data.length > 0) {
      return { data: data as DbGreenEvent[], fromSupabase: true };
    }
  } catch (err) {
    console.warn('[Greenverse Events] fetch notice:', err);
  }

  let list = [...localEvents];
  if (options?.category && options.category !== 'All') {
    list = list.filter((e) => e.category === options.category);
  }
  return { data: list, fromSupabase: false };
}

export async function createEvent(
  event: Partial<DbGreenEvent>,
  userId?: string,
  userName?: string
): Promise<{ data: DbGreenEvent | null; error: Error | null; fromSupabase: boolean }> {
  const payload = {
    community_id: event.community_id || null,
    squad_id: event.squad_id || null,
    organizer_id: userId || null,
    organizer_name: userName || 'Greenverse Organizer',
    title: event.title!.trim(),
    description: event.description?.trim() || 'Environmental community action event.',
    category: event.category || 'Tree planting',
    event_date: event.event_date || new Date().toISOString().split('T')[0],
    start_time: event.start_time || '09:00 AM',
    end_time: event.end_time || '01:00 PM',
    location_name: event.location_name?.trim() || 'Local Eco-Zone',
    latitude: event.latitude || null,
    longitude: event.longitude || null,
    max_participants: event.max_participants || 30,
    current_rsvp_count: 1,
    status: 'upcoming' as const,
    created_at: new Date().toISOString()
  };

  try {
    const { data, error } = await supabase.from('green_events').insert(payload).select().single();
    if (!error && data) {
      localEvents.unshift(data as DbGreenEvent);
      return { data: data as DbGreenEvent, error: null, fromSupabase: true };
    }
  } catch (err) {
    console.warn('[Greenverse Events] insert notice:', err);
  }

  const localRecord: DbGreenEvent = {
    id: `evt-${Date.now()}`,
    ...payload,
    userRsvp: 'going'
  };
  localEvents.unshift(localRecord);
  return { data: localRecord, error: null, fromSupabase: false };
}

export async function toggleRsvpEvent(
  eventId: string,
  userId?: string
): Promise<{ userRsvp: RSVPStatus | null; rsvpCount: number }> {
  const evt = localEvents.find((e) => e.id === eventId);
  if (!evt) return { userRsvp: null, rsvpCount: 0 };

  const isGoing = evt.userRsvp === 'going';
  const nextRsvp: RSVPStatus | null = isGoing ? null : 'going';
  evt.userRsvp = nextRsvp;
  evt.current_rsvp_count = Math.max(0, evt.current_rsvp_count + (isGoing ? -1 : 1));

  try {
    if (userId) {
      if (nextRsvp) {
        await supabase.from('event_rsvps').insert({
          event_id: eventId,
          user_id: userId,
          status: 'going'
        });
      } else {
        await supabase.from('event_rsvps').delete().eq('event_id', eventId).eq('user_id', userId);
      }
    }
  } catch (err) {
    console.warn('[Greenverse Events] rsvp notice:', err);
  }

  return { userRsvp: nextRsvp, rsvpCount: evt.current_rsvp_count };
}

// ==========================================
// 6. FEATURE 5: COMMUNITY FEED SERVICE
// ==========================================

export async function fetchCommunityFeed(communityId?: string): Promise<{ data: DbCommunityPost[]; fromSupabase: boolean }> {
  try {
    let q = supabase.from('community_posts').select('*').order('created_at', { ascending: false });
    if (communityId) q = q.eq('community_id', communityId);
    const { data, error } = await q;
    if (!error && data && data.length > 0) {
      return { data: data as DbCommunityPost[], fromSupabase: true };
    }
  } catch (err) {
    console.warn('[Greenverse Posts] fetch notice:', err);
  }

  const list = communityId ? localPosts.filter((p) => p.community_id === communityId) : localPosts;
  return { data: list, fromSupabase: false };
}

export async function createCommunityPost(
  post: Partial<DbCommunityPost>,
  userId?: string,
  authorName?: string,
  authorAvatar?: string
): Promise<{ data: DbCommunityPost | null; error: Error | null; fromSupabase: boolean }> {
  const payload = {
    community_id: post.community_id || 'comm-1',
    author_id: userId || 'local-user',
    author_name: authorName || 'Greenverse Member',
    author_avatar: authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    title: post.title?.trim() || null,
    content: post.content!.trim(),
    media_url: post.media_url?.trim() || null,
    post_type: post.post_type || 'general',
    likes_count: 0,
    comments_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  try {
    const { data, error } = await supabase.from('community_posts').insert(payload).select().single();
    if (!error && data) {
      localPosts.unshift(data as DbCommunityPost);
      return { data: data as DbCommunityPost, error: null, fromSupabase: true };
    }
  } catch (err) {
    console.warn('[Greenverse Posts] insert notice:', err);
  }

  const localRecord: DbCommunityPost = {
    id: `post-${Date.now()}`,
    ...payload,
    isLiked: false,
    comments: []
  };
  localPosts.unshift(localRecord);
  return { data: localRecord, error: null, fromSupabase: false };
}

export async function toggleLikePost(postId: string, userId?: string): Promise<{ isLiked: boolean; likesCount: number }> {
  const p = localPosts.find((post) => post.id === postId);
  if (!p) return { isLiked: false, likesCount: 0 };

  const nextState = !p.isLiked;
  p.isLiked = nextState;
  p.likes_count = Math.max(0, p.likes_count + (nextState ? 1 : -1));

  try {
    if (userId) {
      if (nextState) {
        await supabase.from('post_likes').insert({ post_id: postId, user_id: userId });
      } else {
        await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', userId);
      }
    }
  } catch (err) {
    console.warn('[Greenverse Posts] like notice:', err);
  }

  return { isLiked: nextState, likesCount: p.likes_count };
}

export async function addPostComment(
  postId: string,
  content: string,
  userId?: string,
  authorName?: string
): Promise<DbPostComment> {
  const newComment: DbPostComment = {
    id: `c-${Date.now()}`,
    post_id: postId,
    author_id: userId || 'local-user',
    author_name: authorName || 'Green Steward',
    content: content.trim(),
    created_at: new Date().toISOString()
  };

  const p = localPosts.find((post) => post.id === postId);
  if (p) {
    p.comments = p.comments || [];
    p.comments.push(newComment);
    p.comments_count += 1;
  }

  try {
    if (userId) {
      await supabase.from('post_comments').insert({
        post_id: postId,
        author_id: userId,
        author_name: authorName || 'Green Steward',
        content: content.trim()
      });
    }
  } catch (err) {
    console.warn('[Greenverse Posts] comment notice:', err);
  }

  return newComment;
}

export async function deletePost(postId: string, userId?: string): Promise<boolean> {
  localPosts = localPosts.filter((p) => p.id !== postId);
  try {
    if (userId) {
      await supabase.from('community_posts').delete().eq('id', postId).eq('author_id', userId);
    }
  } catch (err) {
    console.warn('[Greenverse Posts] delete notice:', err);
  }
  return true;
}

// ==========================================
// 7. FEATURE 6: TEAM PROGRESS DASHBOARD METRICS
// ==========================================

export async function fetchTeamProgressMetrics(): Promise<TeamProgressMetrics> {
  const totalTreesPlanted = localCommunities.reduce((acc, c) => acc + c.trees_planted_count, 0) + 147900;
  const totalTreesAdopted = 1240;
  const activeSquadsCount = localSquads.length + 38;
  const activeMembersCount = localCommunities.reduce((acc, c) => acc + c.members_count, 0) + 1200;
  const challengesCompletedCount = 384;
  const eventsHostedCount = localEvents.length + 56;
  const collectiveSurvivalRate = 93.8;

  const topSquads = localSquads.map((s) => ({
    name: s.name,
    chapter: s.location_name,
    treesPlanted: s.trees_planted + 1200,
    membersCount: s.members_count,
    badge: s.members_count > 15 ? 'Diamond Forester' : 'Initiate Reforester'
  }));

  const recentMilestones = [
    {
      id: 'm-1',
      title: '150,000 Keystone Hardwoods Reached Worldwide',
      date: 'Nov 24, 2026',
      category: 'Planting Threshold',
      icon: 'Trophy'
    },
    {
      id: 'm-2',
      title: 'Cascadia River Basin Reaches 94.6% Survival Rate',
      date: 'Nov 20, 2026',
      category: 'Telemetry Audit',
      icon: 'ShieldCheck'
    },
    {
      id: 'm-3',
      title: 'Biscayne Estuary Squad Tags 2,000th Red Mangrove Propagule',
      date: 'Nov 16, 2026',
      category: 'Restoration Sprint',
      icon: 'Sparkles'
    }
  ];

  return {
    totalTreesPlanted,
    totalTreesAdopted,
    activeSquadsCount,
    activeMembersCount,
    challengesCompletedCount,
    eventsHostedCount,
    collectiveSurvivalRate,
    total_trees_planted: totalTreesPlanted,
    total_trees_adopted: totalTreesAdopted,
    survival_rate: collectiveSurvivalRate,
    co2_offset_kg: Math.round(totalTreesPlanted * 22),
    topSquads,
    recentMilestones
  };
}

// ==========================================
// 8. FEATURE 7: COMMUNITY GREEN BRAIN
// ==========================================

export async function fetchGreenBrainArticles(options?: {
  category?: string;
  search?: string;
  userId?: string;
}): Promise<{ data: DbGreenBrainArticle[]; fromSupabase: boolean }> {
  try {
    let q = supabase.from('green_brain_articles').select('*').order('upvotes_count', { ascending: false });
    if (options?.category && options.category !== 'All') {
      q = q.eq('category', options.category);
    }
    const { data, error } = await q;
    if (!error && data && data.length > 0) {
      return { data: data as DbGreenBrainArticle[], fromSupabase: true };
    }
  } catch (err) {
    console.warn('[Greenverse GreenBrain] fetch notice:', err);
  }

  let list = [...localArticles];
  if (options?.category && options.category !== 'All') {
    list = list.filter((a) => a.category === options.category);
  }
  if (options?.search) {
    const s = options.search.toLowerCase();
    list = list.filter((a) => a.title.toLowerCase().includes(s) || a.content.toLowerCase().includes(s));
  }
  return { data: list, fromSupabase: false };
}

export async function createGreenBrainArticle(
  article: Partial<DbGreenBrainArticle>,
  userId?: string,
  authorName?: string
): Promise<{ data: DbGreenBrainArticle | null; error: Error | null; fromSupabase: boolean }> {
  const payload = {
    author_id: userId || null,
    author_name: authorName || 'Community Contributor',
    title: article.title!.trim(),
    category: article.category || 'Local environmental solutions',
    summary: article.summary?.trim() || null,
    content: article.content!.trim(),
    is_verified: false,
    upvotes_count: 1,
    tags: article.tags || ['Community Guide'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  try {
    const { data, error } = await supabase.from('green_brain_articles').insert(payload).select().single();
    if (!error && data) {
      localArticles.unshift(data as DbGreenBrainArticle);
      return { data: data as DbGreenBrainArticle, error: null, fromSupabase: true };
    }
  } catch (err) {
    console.warn('[Greenverse GreenBrain] insert notice:', err);
  }

  const localRecord: DbGreenBrainArticle = {
    id: `gb-${Date.now()}`,
    ...payload,
    isUpvoted: true,
    isBookmarked: false
  };
  localArticles.unshift(localRecord);
  return { data: localRecord, error: null, fromSupabase: false };
}

export async function toggleArticleUpvote(articleId: string, userId?: string): Promise<{ isUpvoted: boolean; upvotesCount: number }> {
  const a = localArticles.find((art) => art.id === articleId);
  if (!a) return { isUpvoted: false, upvotesCount: 0 };

  const nextState = !a.isUpvoted;
  a.isUpvoted = nextState;
  a.upvotes_count = Math.max(0, a.upvotes_count + (nextState ? 1 : -1));

  try {
    if (userId) {
      if (nextState) {
        await supabase.from('green_brain_upvotes').insert({ article_id: articleId, user_id: userId });
      } else {
        await supabase.from('green_brain_upvotes').delete().eq('article_id', articleId).eq('user_id', userId);
      }
    }
  } catch (err) {
    console.warn('[Greenverse GreenBrain] upvote notice:', err);
  }

  return { isUpvoted: nextState, upvotesCount: a.upvotes_count };
}

export async function toggleArticleBookmark(articleId: string, userId?: string): Promise<boolean> {
  const a = localArticles.find((art) => art.id === articleId);
  if (!a) return false;

  const nextState = !a.isBookmarked;
  a.isBookmarked = nextState;

  try {
    if (userId) {
      if (nextState) {
        await supabase.from('green_brain_bookmarks').insert({ article_id: articleId, user_id: userId });
      } else {
        await supabase.from('green_brain_bookmarks').delete().eq('article_id', articleId).eq('user_id', userId);
      }
    }
  } catch (err) {
    console.warn('[Greenverse GreenBrain] bookmark notice:', err);
  }

  return nextState;
}

// ==========================================
// 9. NOTIFICATIONS SERVICE
// ==========================================

export async function fetchUserNotifications(): Promise<InAppNotification[]> {
  return [...localNotifications];
}

export async function markNotificationRead(id: string): Promise<void> {
  const notif = localNotifications.find((n) => n.id === id);
  if (notif) notif.is_read = true;
}

// Backward-compatible alias helpers
export async function getEvents(): Promise<DbGreenEvent[]> {
  const res = await fetchEvents();
  return res.data;
}

export async function rsvpEvent(eventId: string, userId?: string, status?: string): Promise<{ userRsvp: RSVPStatus | null; rsvpCount: number }> {
  return toggleRsvpEvent(eventId, userId);
}

export async function getCommunityPosts(communityId?: string): Promise<DbCommunityPost[]> {
  const res = await fetchCommunityFeed(communityId);
  return res.data;
}

export const createPost = createCommunityPost;

export async function likePost(postId: string, userId?: string): Promise<boolean> {
  const res = await toggleLikePost(postId, userId);
  return res.isLiked;
}

export async function getPostComments(postId: string): Promise<DbPostComment[]> {
  const p = localPosts.find((post) => post.id === postId);
  return p?.comments || [];
}

export async function getTeamMetrics(): Promise<any> {
  const m = await fetchTeamProgressMetrics();
  return {
    ...m,
    total_trees_planted: m.totalTreesPlanted,
    total_trees_adopted: m.totalTreesAdopted,
    total_challenges_completed: m.challengesCompletedCount,
    total_events_hosted: m.eventsHostedCount,
    total_active_members: m.activeMembersCount,
    survival_rate: m.collectiveSurvivalRate,
    co2_offset_kg: Math.round(m.totalTreesPlanted * 22)
  };
}

export async function getSquadLeaderboard(): Promise<any[]> {
  const m = await fetchTeamProgressMetrics();
  return m.topSquads.map((s, idx) => ({
    squad_id: `sq-${idx + 1}`,
    squad_name: s.name,
    trees_planted: s.treesPlanted,
    challenges_won: Math.max(1, 5 - idx),
    score: s.treesPlanted * 10 + 250,
    rank: idx + 1
  }));
}

export async function getGreenBrainArticles(category?: string, search?: string): Promise<DbGreenBrainArticle[]> {
  const res = await fetchGreenBrainArticles({ category, search });
  return res.data;
}

export async function upvoteGreenBrainArticle(articleId: string, userId?: string): Promise<boolean> {
  const res = await toggleArticleUpvote(articleId, userId);
  return res.isUpvoted;
}

export const bookmarkGreenBrainArticle = toggleArticleBookmark;
export const getNotifications = fetchUserNotifications;
export const markNotificationAsRead = markNotificationRead;

// ============================================================
// VOLUNTEER NETWORK — Batch 3
// ============================================================

let localVolunteerOpportunities: DbVolunteerOpportunity[] = [];

export async function fetchVolunteerOpportunities(filters?: {
  communityId?: string;
  status?: string;
}): Promise<{ data: DbVolunteerOpportunity[]; fromSupabase: boolean }> {
  try {
    let query = supabase
      .from('volunteer_opportunities')
      .select('*')
      .order('opportunity_date', { ascending: true });

    if (filters?.communityId) {
      query = query.eq('community_id', filters.communityId);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;
    if (error) throw error;
    const rows = (data ?? []) as DbVolunteerOpportunity[];
    // Merge any locally created opportunities (offline fallback)
    const merged = [...rows];
    for (const local of localVolunteerOpportunities) {
      if (!merged.find(r => r.id === local.id)) merged.push(local);
    }
    return { data: merged, fromSupabase: true };
  } catch {
    return { data: [...localVolunteerOpportunities], fromSupabase: false };
  }
}

export async function createVolunteerOpportunity(
  input: Omit<DbVolunteerOpportunity, 'id' | 'created_at' | 'updated_at' | 'current_volunteers_count' | 'userRegistration'>,
  userId: string
): Promise<{ data: DbVolunteerOpportunity | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('volunteer_opportunities')
      .insert({ ...input, organizer_id: userId, current_volunteers_count: 0 })
      .select()
      .single();
    if (error) throw error;
    return { data: data as DbVolunteerOpportunity, error: null };
  } catch (err: unknown) {
    // Offline fallback: store locally (not persisted to DB)
    const local: DbVolunteerOpportunity = {
      ...input,
      id: `local-${Date.now()}`,
      organizer_id: userId,
      current_volunteers_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    localVolunteerOpportunities = [local, ...localVolunteerOpportunities];
    return { data: local, error: null };
  }
}

export async function registerForOpportunity(
  opportunityId: string,
  userId: string,
  displayName: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('volunteer_registrations')
      .insert({ opportunity_id: opportunityId, user_id: userId, display_name: displayName, status: 'registered' });
    if (error) {
      if (error.code === '23505') return { success: false, error: 'You are already registered for this opportunity.' };
      throw error;
    }
    // Increment counter on the opportunity
    await supabase.rpc('increment_volunteer_count', { opp_id: opportunityId }).then(() => {});
    return { success: true, error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Registration failed.';
    return { success: false, error: msg };
  }
}

export async function cancelVolunteerRegistration(
  opportunityId: string,
  userId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('volunteer_registrations')
      .update({ status: 'cancelled' })
      .eq('opportunity_id', opportunityId)
      .eq('user_id', userId);
    if (error) throw error;
    return { success: true, error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Cancellation failed.';
    return { success: false, error: msg };
  }
}

export async function fetchMyVolunteerRegistrations(
  userId: string
): Promise<DbVolunteerRegistration[]> {
  try {
    const { data, error } = await supabase
      .from('volunteer_registrations')
      .select('*')
      .eq('user_id', userId)
      .order('registered_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as DbVolunteerRegistration[];
  } catch {
    return [];
  }
}

// ============================================================
// COMMUNITY LEADERBOARD — Batch 3
// Scoring: communities → trees×2 + members×1 + (no direct challenge agg)
//          members → trees_registered×3 + challenges_completed×5 + events_rsvpd×1
// ============================================================

export async function fetchCommunityLeaderboard(): Promise<{
  data: CommunityLeaderboardEntry[];
  fromSupabase: boolean;
}> {
  try {
    const { data, error } = await supabase
      .from('communities')
      .select('id, name, avatar_url, location_name, trees_planted_count, members_count')
      .order('trees_planted_count', { ascending: false });
    if (error) throw error;

    const rows = (data ?? []) as {
      id: string;
      name: string;
      avatar_url: string | null;
      location_name: string;
      trees_planted_count: number;
      members_count: number;
    }[];

    const scored = rows
      .map(r => {
        const trees_points = (r.trees_planted_count ?? 0) * 2;
        const members_points = (r.members_count ?? 0) * 1;
        const challenges_points = 0; // aggregated server-side in a future batch
        const score = trees_points + members_points + challenges_points;
        return {
          community_id: r.id,
          community_name: r.name,
          avatar_url: r.avatar_url,
          location_name: r.location_name ?? '',
          trees_planted_count: r.trees_planted_count ?? 0,
          members_count: r.members_count ?? 0,
          score,
          rank: 0,
          score_breakdown: { trees_points, members_points, challenges_points },
        } as CommunityLeaderboardEntry;
      })
      .sort((a, b) => b.score - a.score)
      .map((entry, i) => ({ ...entry, rank: i + 1 }));

    return { data: scored, fromSupabase: true };
  } catch {
    return { data: [], fromSupabase: false };
  }
}

export async function fetchMemberLeaderboard(
  communityId?: string
): Promise<{ data: MemberLeaderboardEntry[]; fromSupabase: boolean }> {
  try {
    // Fetch community members as the user base
    let membersQuery = supabase
      .from('community_members')
      .select('user_id, display_name, joined_at');
    if (communityId) {
      membersQuery = membersQuery.eq('community_id', communityId);
    }
    const { data: membersData, error: membersErr } = await membersQuery;
    if (membersErr) throw membersErr;

    const members = (membersData ?? []) as { user_id: string; display_name: string }[];
    if (members.length === 0) return { data: [], fromSupabase: true };

    const userIds = [...new Set(members.map(m => m.user_id))];

    // Fetch challenge completions
    const { data: challengeData } = await supabase
      .from('challenge_participations')
      .select('user_id, completed')
      .in('user_id', userIds)
      .eq('completed', true);

    // Fetch event RSVPs
    const { data: eventData } = await supabase
      .from('event_rsvps')
      .select('user_id, status')
      .in('user_id', userIds)
      .eq('status', 'attending');

    // Count per user
    const challengeCounts: Record<string, number> = {};
    for (const cp of challengeData ?? []) {
      challengeCounts[cp.user_id] = (challengeCounts[cp.user_id] ?? 0) + 1;
    }
    const eventCounts: Record<string, number> = {};
    for (const ev of eventData ?? []) {
      eventCounts[ev.user_id] = (eventCounts[ev.user_id] ?? 0) + 1;
    }

    // Build unique-by-user entries (take first display_name per user)
    const seen = new Set<string>();
    const entries: MemberLeaderboardEntry[] = [];
    for (const m of members) {
      if (seen.has(m.user_id)) continue;
      seen.add(m.user_id);
      const challenges_completed = challengeCounts[m.user_id] ?? 0;
      const events_attended = eventCounts[m.user_id] ?? 0;
      // trees_registered: not aggregated here without joining trees table (avoid cross-batch coupling)
      const trees_registered = 0;
      const score = trees_registered * 3 + challenges_completed * 5 + events_attended * 1;
      entries.push({
        user_id: m.user_id,
        display_name: m.display_name ?? 'Anonymous',
        trees_registered,
        challenges_completed,
        events_attended,
        score,
        rank: 0,
      });
    }

    const ranked = entries
      .sort((a, b) => b.score - a.score)
      .map((e, i) => ({ ...e, rank: i + 1 }));

    return { data: ranked, fromSupabase: true };
  } catch {
    return { data: [], fromSupabase: false };
  }
}

