import { supabase } from '../lib/supabase';
import {
  TreeProtectionReport,
  TreeProtectionUpdate,
  VerificationQueueItem,
  VerificationQueueStatus,
  RewardRule,
  UserAchievement,
  GreenChangeRecord,
  PersonalImpactMetrics,
  EnvironmentalStatistics
} from '../types/impact';
import { awardWalletPoints } from './economyService';

// ==============================================================================
// INITIAL SEED DATA
// ==============================================================================

export const INITIAL_PROTECTION_REPORTS: TreeProtectionReport[] = [
  {
    id: 'prot-1',
    tree_id: null,
    reporter_id: 'demo-user',
    reporter_name: 'Elena Rostova',
    reporter_email: 'elena@example.org',
    tree_species: 'Ancient Oregon White Oak (Quercus garryana)',
    threat_category: 'construction_threat',
    severity: 'critical',
    urgency: 'urgent',
    location_name: 'Oak Creek Corridor, Lot 14',
    latitude: 45.4921,
    longitude: -122.6642,
    description: 'Heavy excavation equipment staged within 2 meters of the critical root protection zone of a 180-year-old landmark heritage oak.',
    photo_urls: [
      'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=600&auto=format&fit=crop&q=80'
    ],
    status: 'action_needed',
    assigned_responder_id: null,
    assigned_responder_name: 'ArborShield Rapid Patrol',
    responder_notes: 'Preliminary site inspection scheduled. Requested temporary orange safety fencing along outer canopy drip line.',
    is_heritage: true,
    created_at: '2026-11-15T09:00:00Z',
    updated_at: '2026-11-18T14:30:00Z'
  },
  {
    id: 'prot-2',
    tree_id: null,
    reporter_id: 'user-77',
    reporter_name: 'Marcus Vance',
    tree_species: 'Western Red Cedar (Thuja plicata)',
    threat_category: 'root_damage',
    severity: 'high',
    urgency: 'routine',
    location_name: 'Tributary Trailhead, Post 8',
    latitude: 45.5100,
    longitude: -122.6850,
    description: 'Severe soil erosion and trenching exposing major structural anchor roots after recent flash floods.',
    photo_urls: [
      'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&auto=format&fit=crop&q=80'
    ],
    status: 'in_progress',
    assigned_responder_name: 'Watershed Squad 3',
    responder_notes: 'Applied geotextile erosion barrier and layered 10 cubic yards of local forest mulch.',
    is_heritage: false,
    created_at: '2026-11-10T11:20:00Z',
    updated_at: '2026-11-12T16:00:00Z'
  },
  {
    id: 'prot-3',
    tree_id: null,
    reporter_id: 'user-88',
    reporter_name: 'Sarah Jenkins',
    tree_species: 'Heritage Douglas Fir',
    threat_category: 'heritage_nomination',
    severity: 'low',
    urgency: 'routine',
    location_name: 'Fairview Ridgeline Park',
    latitude: 45.5350,
    longitude: -122.6420,
    description: 'Nomination for official municipal Landmark Canopy status. DBH exceeds 162 cm with healthy crown density.',
    photo_urls: [
      'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=600&auto=format&fit=crop&q=80'
    ],
    status: 'under_review',
    assigned_responder_name: 'Urban Canopy Registry',
    is_heritage: true,
    created_at: '2026-11-02T13:45:00Z',
    updated_at: '2026-11-04T10:00:00Z'
  }
];

export const INITIAL_VERIFICATION_QUEUE: VerificationQueueItem[] = [
  {
    id: 'verif-1',
    submission_type: 'tree_planting',
    reference_id: 'tree-cedar-104',
    submitter_id: 'demo-user',
    submitter_name: 'Elena Rostova',
    title: 'Native Red Cedar Sapling Planting (#TR-8821)',
    description: 'Planting of 2-year containerized sapling in riparian buffer zone. Mulched and staked according to Greenverse standards.',
    evidence_urls: [
      'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80'
    ],
    location_name: 'Cedar Creek Sector 4',
    latitude: 45.5152,
    longitude: -122.6784,
    status: 'under_review',
    reward_points: 100,
    reward_issued: false,
    submitted_at: '2026-11-20T10:15:00Z'
  },
  {
    id: 'verif-2',
    submission_type: 'bounty_completion',
    reference_id: 'bounty-1',
    submitter_id: 'user-44',
    submitter_name: 'Carlos Mendez',
    title: 'Creek Bank Litter Hotspot Cleanup (Zone 4)',
    description: 'Removed 6.5 kg of debris and plastics. Delivered to recycling center with receipt photo.',
    evidence_urls: [
      'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=600&auto=format&fit=crop&q=80'
    ],
    location_name: 'Cedar Creek Tributary',
    latitude: 45.5140,
    longitude: -122.6790,
    status: 'submitted',
    reward_points: 80,
    reward_issued: false,
    submitted_at: '2026-11-22T14:40:00Z'
  },
  {
    id: 'verif-3',
    submission_type: 'tree_care',
    reference_id: 'care-task-902',
    submitter_id: 'user-55',
    submitter_name: 'Aiden Brooks',
    title: 'Deep Root Seasonal Irrigation & Mycorrhizal Drench',
    description: 'Completed 20-liter drench on 5 juvenile maples during late summer dry spell.',
    evidence_urls: [
      'https://images.unsplash.com/photo-1592417817098-8f3d6910985b?w=600&auto=format&fit=crop&q=80'
    ],
    location_name: 'North Park Perimeter',
    status: 'submitted',
    reward_points: 40,
    reward_issued: false,
    submitted_at: '2026-11-23T08:30:00Z'
  }
];

export const INITIAL_CHANGE_RECORDS: GreenChangeRecord[] = [
  {
    id: 'change-1',
    site_name: 'Cedar Creek Riparian Reforestation Corridor',
    location_name: 'Willamette Watershed, OR',
    latitude: 45.5152,
    longitude: -122.6784,
    project_id: 'proj-1',
    baseline_date: '2024-03-15',
    latest_date: '2026-10-30',
    baseline_photo_url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&auto=format&fit=crop&q=80',
    latest_photo_url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&auto=format&fit=crop&q=80',
    baseline_canopy_pct: 12.4,
    latest_canopy_pct: 44.8,
    trees_planted_count: 850,
    vegetation_increase_pct: 261.3,
    notes: 'Degraded cattle grazing creek bank restored with native willow live stakes, red cedar, and red alder. Stream temperature reduced by 1.8°C.',
    data_source: 'ground_photogrammetry',
    time_horizon_period: 'annual',
    created_at: '2026-11-01T12:00:00Z',
    updated_at: '2026-11-01T12:00:00Z'
  },
  {
    id: 'change-2',
    site_name: 'East District Urban Canopy Pocket Forest',
    location_name: 'Portland Metro Core',
    latitude: 45.5230,
    longitude: -122.6570,
    baseline_date: '2025-04-10',
    latest_date: '2026-11-15',
    baseline_photo_url: 'https://images.unsplash.com/photo-1518457607834-6e8d80c183c5?w=800&auto=format&fit=crop&q=80',
    latest_photo_url: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=800&auto=format&fit=crop&q=80',
    baseline_canopy_pct: 4.1,
    latest_canopy_pct: 28.5,
    trees_planted_count: 320,
    vegetation_increase_pct: 595.1,
    notes: 'Miyawaki-method micro-forest established on former asphalt runoff parcel. High biodiversity bird and insect activity documented.',
    data_source: 'community_audit',
    time_horizon_period: 'seasonal',
    created_at: '2026-11-05T15:00:00Z',
    updated_at: '2026-11-05T15:00:00Z'
  }
];

export const INITIAL_ACHIEVEMENTS: UserAchievement[] = [
  {
    id: 'ach-1',
    user_id: 'demo-user',
    achievement_key: 'first_tree',
    title: 'First Seed of Hope',
    category: 'tree_planting',
    tier: 'beginner',
    badge_icon: 'Sprout',
    description: 'Plant and register your very first tree with geotagged proof in the Greenverse.',
    criteria_description: 'Register 1 tree in the Tree Passport registry',
    progress_current: 7,
    progress_target: 1,
    is_unlocked: true,
    unlocked_at: '2026-11-05T10:00:00Z'
  },
  {
    id: 'ach-2',
    user_id: 'demo-user',
    achievement_key: 'grove_guardian',
    title: 'Grove Guardian',
    category: 'tree_planting',
    tier: 'intermediate',
    badge_icon: 'TreeDeciduous',
    description: 'Plant or adopt at least 10 native trees in active community restoration projects.',
    criteria_description: 'Reach 10 verified planted trees',
    progress_current: 7,
    progress_target: 10,
    is_unlocked: false
  },
  {
    id: 'ach-3',
    user_id: 'demo-user',
    achievement_key: 'canopy_veteran',
    title: 'Canopy Veteran',
    category: 'tree_care',
    tier: 'advanced',
    badge_icon: 'ShieldCheck',
    description: 'Log 15 verified tree care visits maintaining survival across drought periods.',
    criteria_description: 'Complete 15 verified tree care tasks',
    progress_current: 12,
    progress_target: 15,
    is_unlocked: false
  },
  {
    id: 'ach-4',
    user_id: 'demo-user',
    achievement_key: 'bounty_crusader',
    title: 'Restoration Bounty Crusader',
    category: 'bounties',
    tier: 'intermediate',
    badge_icon: 'Award',
    description: 'Complete 3 community restoration bounties with verified photographic evidence.',
    criteria_description: 'Achieve 3 approved bounty completions',
    progress_current: 3,
    progress_target: 3,
    is_unlocked: true,
    unlocked_at: '2026-11-18T12:00:00Z'
  },
  {
    id: 'ach-5',
    user_id: 'demo-user',
    achievement_key: 'sentinel_protector',
    title: 'Canopy Sentinel',
    category: 'tree_protection',
    tier: 'special',
    badge_icon: 'ShieldAlert',
    description: 'Report and verify a threatened or heritage tree, facilitating on-site protective action.',
    criteria_description: 'Log 1 tree protection report reaching in-progress or resolved status',
    progress_current: 1,
    progress_target: 1,
    is_unlocked: true,
    unlocked_at: '2026-11-20T14:00:00Z'
  },
  {
    id: 'ach-6',
    user_id: 'demo-user',
    achievement_key: 'biodiversity_champion',
    title: 'Biodiversity Scout',
    category: 'biodiversity',
    tier: 'beginner',
    badge_icon: 'Sparkles',
    description: 'Conduct and document pollinator or avian interactions around restored native canopies.',
    criteria_description: 'Log 1 verified biodiversity survey bounty',
    progress_current: 1,
    progress_target: 1,
    is_unlocked: true,
    unlocked_at: '2026-11-14T16:00:00Z'
  }
];

// In-Memory Fallback State
let localProtectionReports: TreeProtectionReport[] = [...INITIAL_PROTECTION_REPORTS];
let localProtectionUpdates: TreeProtectionUpdate[] = [];
let localVerificationQueue: VerificationQueueItem[] = [...INITIAL_VERIFICATION_QUEUE];
let localChangeRecords: GreenChangeRecord[] = [...INITIAL_CHANGE_RECORDS];
let localAchievements: UserAchievement[] = [...INITIAL_ACHIEVEMENTS];

// ==============================================================================
// 1. PERSONAL IMPACT DASHBOARD SERVICE
// ==============================================================================

export async function fetchPersonalImpactMetrics(userId: string = 'demo-user'): Promise<PersonalImpactMetrics> {
  try {
    const { data, error } = await supabase
      .from('personal_impact_metrics')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (!error && data) return data as PersonalImpactMetrics;
  } catch {
    // fallback
  }

  return {
    user_id: userId,
    trees_planted_total: 9,
    trees_verified: 7,
    trees_reported: 2,
    trees_under_care: 5,
    survival_rate_pct: 91.4,
    projects_participated: 4,
    volunteer_hours: 26.5,
    bounties_completed: 3,
    challenges_won: 2,
    events_attended: 4,
    protections_logged: 2,
    green_points_earned: 490,
    co2_sequestered_kg: 742.0, // calculated from verified surviving trees * 22 kg * active years
    last_synced_at: new Date().toISOString()
  };
}

export async function fetchEnvironmentalStatistics(): Promise<EnvironmentalStatistics> {
  return {
    global_trees_registered: 381240,
    global_trees_verified: 342910,
    average_survival_rate_pct: 88.6,
    active_restoration_hectares: 248.5,
    total_co2_sequestered_tonnes: 44340,
    total_volunteer_hours_community: 18450,
    monthly_trends: [
      { month: 'Jun 26', planted_count: 2410, verified_count: 2280, survival_rate: 94.6 },
      { month: 'Jul 26', planted_count: 3120, verified_count: 2980, survival_rate: 95.5 },
      { month: 'Aug 26', planted_count: 1850, verified_count: 1720, survival_rate: 93.0 },
      { month: 'Sep 26', planted_count: 4200, verified_count: 3890, survival_rate: 92.6 },
      { month: 'Oct 26', planted_count: 5890, verified_count: 5410, survival_rate: 91.8 },
      { month: 'Nov 26', planted_count: 4620, verified_count: 4290, survival_rate: 93.2 }
    ],
    native_species_distribution: [
      { species_name: 'Western Red Cedar', count: 112000, percentage: 29.4, category: 'Conifer' },
      { species_name: 'Douglas Fir', count: 98400, percentage: 25.8, category: 'Conifer' },
      { species_name: 'Oregon White Oak', count: 68200, percentage: 17.9, category: 'Hardwood' },
      { species_name: 'Red Alder', count: 54100, percentage: 14.2, category: 'Riparian' },
      { species_name: 'Bigleaf Maple', count: 48540, percentage: 12.7, category: 'Hardwood' }
    ],
    water_conserved_litres_annual: 12400000 // based on mulch & micro-drip efficiency models
  };
}

// ==============================================================================
// 2. GREEN VERIFICATION ENGINE SERVICE
// ==============================================================================

export async function fetchVerificationQueue(typeFilter?: string): Promise<VerificationQueueItem[]> {
  try {
    let query = supabase.from('verification_queue_items').select('*').order('submitted_at', { ascending: false });
    if (typeFilter && typeFilter !== 'all') {
      query = query.eq('submission_type', typeFilter);
    }
    const { data, error } = await query;
    if (!error && data && data.length > 0) return data as VerificationQueueItem[];
  } catch {
    // fallback
  }

  let results = [...localVerificationQueue];
  if (typeFilter && typeFilter !== 'all') {
    results = results.filter(v => v.submission_type === typeFilter);
  }
  return results;
}

export async function reviewVerificationItem(
  itemId: string,
  decision: 'approved' | 'rejected' | 'needs_more_evidence',
  notes: string,
  reviewerId: string = 'reviewer-admin',
  reviewerName: string = 'Verification Officer'
): Promise<boolean> {
  const item = localVerificationQueue.find(v => v.id === itemId);
  if (!item) return false;

  item.status = decision;
  item.reviewer_id = reviewerId;
  item.reviewer_name = reviewerName;
  item.reviewer_notes = notes;
  item.reviewed_at = new Date().toISOString();

  // If approved and rewards have not yet been granted, issue points through secure ledger
  if (decision === 'approved' && !item.reward_issued && item.reward_points > 0) {
    item.reward_issued = true;
    await awardWalletPoints(
      item.submitter_id || 'demo-user',
      item.reward_points,
      `Verified ${item.submission_type.replace(/_/g, ' ')}: ${item.title}`,
      item.id,
      item.submission_type
    );
  }

  try {
    await supabase.from('verification_queue_items').update({
      status: decision,
      reviewer_id: reviewerId,
      reviewer_name: reviewerName,
      reviewer_notes: notes,
      reward_issued: item.reward_issued,
      reviewed_at: item.reviewed_at
    }).eq('id', itemId);
  } catch {
    // fallback
  }

  return true;
}

export async function submitVerificationItem(item: Partial<VerificationQueueItem>, userId?: string, userName?: string): Promise<VerificationQueueItem> {
  const newItem: VerificationQueueItem = {
    id: `verif-${Date.now()}`,
    submission_type: item.submission_type || 'tree_planting',
    reference_id: item.reference_id || `ref-${Date.now()}`,
    submitter_id: userId || 'demo-user',
    submitter_name: userName || 'Field Volunteer',
    title: item.title || 'Ecological Field Action',
    description: item.description || '',
    evidence_urls: item.evidence_urls || [],
    location_name: item.location_name || '',
    latitude: item.latitude || null,
    longitude: item.longitude || null,
    status: 'submitted',
    reward_points: item.reward_points || 50,
    reward_issued: false,
    submitted_at: new Date().toISOString()
  };

  localVerificationQueue.unshift(newItem);

  try {
    await supabase.from('verification_queue_items').insert([newItem]);
  } catch {
    // fallback
  }

  return newItem;
}

// ==============================================================================
// 3. TREE PROTECTOR SERVICE
// ==============================================================================

export async function fetchProtectionReports(category?: string): Promise<TreeProtectionReport[]> {
  try {
    let query = supabase.from('tree_protection_reports').select('*').order('created_at', { ascending: false });
    if (category && category !== 'all') {
      query = query.eq('threat_category', category);
    }
    const { data, error } = await query;
    if (!error && data && data.length > 0) return data as TreeProtectionReport[];
  } catch {
    // fallback
  }

  let list = [...localProtectionReports];
  if (category && category !== 'all') {
    list = list.filter(r => r.threat_category === category);
  }
  return list;
}

export async function createProtectionReport(
  report: Partial<TreeProtectionReport>,
  userId?: string,
  userName?: string
): Promise<TreeProtectionReport> {
  const newReport: TreeProtectionReport = {
    id: `prot-${Date.now()}`,
    tree_id: report.tree_id || null,
    reporter_id: userId || 'demo-user',
    reporter_name: userName || 'Canopy Sentinel',
    reporter_email: report.reporter_email || '',
    tree_species: report.tree_species || 'Indigenous Mature Tree',
    threat_category: report.threat_category || 'construction_threat',
    severity: report.severity || 'medium',
    urgency: report.urgency || 'routine',
    location_name: report.location_name || 'Designated Canopy Zone',
    latitude: report.latitude || 45.5152,
    longitude: report.longitude || -122.6784,
    description: report.description || '',
    photo_urls: report.photo_urls || [],
    status: 'submitted',
    is_heritage: !!report.is_heritage,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  localProtectionReports.unshift(newReport);

  try {
    await supabase.from('tree_protection_reports').insert([newReport]);
  } catch {
    // fallback
  }

  return newReport;
}

export async function addProtectionUpdate(
  reportId: string,
  updateText: string,
  newStatus?: any,
  evidenceUrl?: string,
  responderName: string = 'Canopy Response Officer'
): Promise<boolean> {
  const report = localProtectionReports.find(r => r.id === reportId);
  if (!report) return false;

  if (newStatus) {
    report.status = newStatus;
  }
  report.updated_at = new Date().toISOString();
  if (!report.responder_notes) {
    report.responder_notes = updateText;
  } else {
    report.responder_notes += `\n[${new Date().toLocaleDateString()}] ${updateText}`;
  }

  const update: TreeProtectionUpdate = {
    id: `prup-${Date.now()}`,
    report_id: reportId,
    responder_name: responderName,
    update_text: updateText,
    evidence_url: evidenceUrl,
    status_change_to: newStatus,
    created_at: new Date().toISOString()
  };

  localProtectionUpdates.push(update);

  try {
    await supabase.from('tree_protection_reports').update({
      status: report.status,
      responder_notes: report.responder_notes,
      updated_at: report.updated_at
    }).eq('id', reportId);
    await supabase.from('tree_protection_updates').insert([update]);
  } catch {
    // fallback
  }

  return true;
}

// ==============================================================================
// 4. GREEN ACHIEVEMENTS SERVICE
// ==============================================================================

export async function fetchUserAchievements(userId: string = 'demo-user'): Promise<UserAchievement[]> {
  try {
    const { data, error } = await supabase.from('user_achievements').select('*').eq('user_id', userId);
    if (!error && data && data.length > 0) return data as UserAchievement[];
  } catch {
    // fallback
  }

  return localAchievements.filter(a => a.user_id === userId || userId === 'demo-user');
}

// ==============================================================================
// 5. GREEN CHANGE MONITOR SERVICE
// ==============================================================================

export async function fetchGreenChangeRecords(): Promise<GreenChangeRecord[]> {
  try {
    const { data, error } = await supabase.from('green_change_records').select('*').order('created_at', { ascending: false });
    if (!error && data && data.length > 0) return data as GreenChangeRecord[];
  } catch {
    // fallback
  }

  return [...localChangeRecords];
}

export async function createGreenChangeRecord(record: Partial<GreenChangeRecord>): Promise<GreenChangeRecord> {
  const newRecord: GreenChangeRecord = {
    id: `change-${Date.now()}`,
    site_name: record.site_name || 'Restoration Corridor',
    location_name: record.location_name || 'Regional Planting Zone',
    latitude: record.latitude || 45.5152,
    longitude: record.longitude || -122.6784,
    project_id: record.project_id || null,
    baseline_date: record.baseline_date || '2024-01-01',
    latest_date: record.latest_date || new Date().toISOString().split('T')[0],
    baseline_photo_url: record.baseline_photo_url || 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800',
    latest_photo_url: record.latest_photo_url || 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800',
    baseline_canopy_pct: Number(record.baseline_canopy_pct) || 10,
    latest_canopy_pct: Number(record.latest_canopy_pct) || 35,
    trees_planted_count: Number(record.trees_planted_count) || 200,
    vegetation_increase_pct: Number(record.vegetation_increase_pct) || 250,
    notes: record.notes || 'Documented vegetative cover growth over monitoring timeframe.',
    data_source: record.data_source || 'ground_photogrammetry',
    time_horizon_period: record.time_horizon_period || 'seasonal',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  localChangeRecords.unshift(newRecord);

  try {
    await supabase.from('green_change_records').insert([newRecord]);
  } catch {
    // fallback
  }

  return newRecord;
}
