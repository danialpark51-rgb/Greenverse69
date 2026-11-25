// Greenverse Batch 4: Green Projects & Funding Ecosystem Service Layer
import { supabase } from '../lib/supabase';
import {
  Project,
  ProjectCategory,
  ProjectStatus,
  VerificationStatus,
  ProjectMember,
  FundingCampaign,
  FundingTier,
  ProjectPledge,
  BudgetItem,
  SpendingRecord,
  VolunteerRole,
  VolunteerApplication,
  ResourceRequest,
  ResourcePledge,
  ProjectMilestone,
  ProjectUpdate,
  ImpactEstimate,
  ProjectVerificationRecord,
  ProjectReport
} from '../types/project';

// Seeded local fallback storage to ensure offline/development resilience
export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    owner_id: 'org-1',
    owner_name: 'Pacific Northwest Rewilding Trust',
    title: 'Skykomish River Riparian Canopy & Salmon Shade Corridor',
    slug: 'skykomish-riparian-canopy',
    subtitle: 'Restoring 12,000 native western redcedars and sitka spruces to stabilize thermal buffers for spawning salmon.',
    description: 'This initiative addresses critical thermal stress in the Upper Skykomish watershed. Industrial logging and development have reduced bank shade by 43%, causing summer water temperatures to exceed salmon survival thresholds. By establishing a dense 50-meter riparian canopy of climate-resilient conifers and live willow stakes, we create contiguous shade cover while rebuilding bank root matrices.',
    problem_statement: 'Summer water temperatures in the Skykomish River Basin regularly exceed 21°C due to degraded shoreline canopies, causing severe mortality in returning Chinook and Coho salmon runs.',
    proposed_solution: 'Plant 12,000 containerized native trees and install 5,000 bio-engineered live fascines with automated root-zone moisture sensors to guarantee 88%+ long-term survival.',
    objectives: [
      'Replant 4.2 linear kilometers of riverbank with climate-hardy native conifers',
      'Deploy 25 real-time water temperature and soil hydrology telemetry probes',
      'Mobilize 150 local community volunteers across 6 planting drives',
      'Achieve minimum 85% canopy survival benchmark by year three'
    ],
    category: 'forest_restoration',
    project_type: 'institutional',
    status: 'active',
    verification_status: 'verified',
    location_name: 'Skykomish River Sector 4, Gold Bar, WA',
    latitude: 47.8598,
    longitude: -121.6968,
    country: 'USA',
    region: 'Pacific Northwest',
    start_date: '2026-10-01',
    end_date: '2027-05-30',
    estimated_timeline: '8 Months Planting & 24 Months Auditing',
    currency: 'USD',
    estimated_budget: 75000,
    funding_target: 60000,
    current_funding_raised: 42500,
    pledged_amount: 8200,
    supporters_count: 148,
    volunteers_needed: 40,
    volunteers_registered: 28,
    cover_image_url: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1200&q=80',
    expected_outcomes: [
      '12,000 verified trees cataloged on Greenverse Passport ledger',
      'Average summer water temperature drop of 1.4°C over 4km stretch',
      '180 tons estimated annual CO2 sequestration at canopy maturity'
    ],
    resource_requirements: [
      '200 Planting shovels and forestry hoes',
      'Organic pine-bark mulch (80 cubic yards)',
      'High-clearance utility trailers for seedling transport',
      'Arborist field safety gear & first aid kits'
    ],
    created_at: '2026-10-15T10:00:00Z',
    updated_at: '2026-11-20T14:30:00Z',
    is_bookmarked: false,
    user_role: 'contributor'
  },
  {
    id: 'proj-2',
    owner_id: 'org-2',
    owner_name: 'Biscayne Bay Estuary Conservation Squad',
    title: 'Biscayne Coastal Mangrove Salinity Buffer & Oyster Reef',
    slug: 'biscayne-mangrove-salinity-buffer',
    subtitle: 'Planting 8,500 red mangrove propagules and deploying biodegradable oyster shell substrates for tidal wave dissipation.',
    description: 'Rising storm surge velocities and hypersalinity in Biscayne Bay threaten vital nursery zones for manatees and game fish. This project deploys an innovative combination of recycled oyster shell substrate beds and hand-anchored red mangrove propagules with QR-coded digital passports to track root elongation and sediment accretion.',
    problem_statement: 'Coastal seawalls and dredging have destroyed 65% of native mangrove fringes, eliminating natural wave dampening and critical marine nursery habitats.',
    proposed_solution: 'Install 8,500 red mangrove seedlings anchored in biodegradable coir mats alongside 400 linear meters of oyster shell cultch to stimulate natural reef formation.',
    objectives: [
      'Establish 3.5 hectares of stabilized mangrove tidal nursery',
      'Engage marine biology students and citizen scientists in weekly salinity logging',
      'Protect 1.2 miles of vulnerable shoreline from hurricane wave energy'
    ],
    category: 'biodiversity',
    project_type: 'community',
    status: 'active',
    verification_status: 'reviewed',
    location_name: 'Pelican Shoals Estuary, Key Biscayne, FL',
    latitude: 25.6987,
    longitude: -80.1611,
    country: 'USA',
    region: 'Southeast',
    start_date: '2026-11-01',
    end_date: '2027-04-15',
    estimated_timeline: '6 Months Field Staging & 12 Months Monitoring',
    currency: 'USD',
    estimated_budget: 45000,
    funding_target: 35000,
    current_funding_raised: 19800,
    pledged_amount: 4500,
    supporters_count: 92,
    volunteers_needed: 25,
    volunteers_registered: 19,
    cover_image_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
    expected_outcomes: [
      '8,500 mangrove trees tagged with QR passports',
      '40% wave energy attenuation recorded by wave telemetry loggers',
      '3.5 hectares of nursery zone safeguarded'
    ],
    resource_requirements: [
      'Shallow-draft skiff or canoe for propagule transport',
      'Heavy-duty neoprene wading boots and gloves',
      'Recycled oyster shell mesh sacks'
    ],
    created_at: '2026-11-01T08:00:00Z',
    updated_at: '2026-11-22T09:15:00Z',
    is_bookmarked: true,
    user_role: null
  },
  {
    id: 'proj-3',
    owner_id: 'org-3',
    owner_name: 'Urban Heat Island Depaving Guild',
    title: 'Twin Cities Asphalt Depaving & Miyawaki Pocket Forest',
    slug: 'twin-cities-miyawaki-forest',
    subtitle: 'Transforming 18,000 sq ft of abandoned asphalt parking lot into a dense, 30-species ultra-fast cooling biodiverse mini-forest.',
    description: 'This initiative targets a severe urban heat island in the Cedar Bend industrial district where surface temperatures reach 44°C during heat waves. By excavating compacted concrete and restoring living organic soil via mycorrhizal inoculation, we plant an ultra-dense Miyawaki pocket forest with 3,000 native saplings.',
    problem_statement: 'Impervious asphalt surfaces prevent groundwater infiltration and radiate intense heat into neighboring residential corridors.',
    proposed_solution: 'Depave 18,000 sq ft of asphalt, incorporate 120 tons of composted biomass, and plant 30 native tree species at 3 saplings per square meter.',
    objectives: [
      'Excavate and recycle 18,000 square feet of asphalt and base gravel',
      'Plant 3,000 native canopy and understory saplings using Miyawaki technique',
      'Lower ambient neighborhood summer temperatures by 3.2°C within 3 years'
    ],
    category: 'urban_greening',
    project_type: 'grassroots',
    status: 'active',
    verification_status: 'verified',
    location_name: 'Cedar Bend District, Minneapolis, MN',
    latitude: 44.9778,
    longitude: -93.2650,
    country: 'USA',
    region: 'Midwest',
    start_date: '2026-09-15',
    end_date: '2027-06-30',
    estimated_timeline: '9 Months Intensive Implementation',
    currency: 'USD',
    estimated_budget: 32000,
    funding_target: 28000,
    current_funding_raised: 28000,
    pledged_amount: 1500,
    supporters_count: 215,
    volunteers_needed: 60,
    volunteers_registered: 58,
    cover_image_url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80',
    expected_outcomes: [
      'Complete elimination of 18,000 sq ft impervious heat sink',
      'Infiltration of 420,000 gallons of stormwater runoff annually',
      '3,000 thriving trees with 96% target survival rate'
    ],
    resource_requirements: [
      'Concrete saw and skid-steer loader access',
      'Broadforks and manual aerators',
      'Mycorrhizal fungus inoculum powder'
    ],
    created_at: '2026-09-20T12:00:00Z',
    updated_at: '2026-11-24T16:00:00Z',
    is_bookmarked: false,
    user_role: 'lead_organizer'
  }
];

export const INITIAL_CAMPAIGNS: FundingCampaign[] = [
  {
    id: 'camp-1',
    project_id: 'proj-1',
    title: 'Upper Skykomish Riparian Reforestation Drive',
    description: 'Direct community sponsorship of native bare-root conifer bundles, organic mycorrhizal tablets, and solar-powered stream telemetry beacons.',
    budget_purpose: 'Direct seedling acquisition, contractor root-barrier excavation, and long-term volunteer maintenance stipends.',
    funding_goal: 60000,
    amount_raised: 42500,
    pledged_amount: 8200,
    currency: 'USD',
    start_date: '2026-10-15',
    end_date: '2027-03-31',
    status: 'active',
    supporters_count: 148,
    tiers: [
      {
        id: 'tier-1',
        campaign_id: 'camp-1',
        title: 'Sapling Seedling Guardian',
        amount: 25,
        description: 'Funds 5 containerized western redcedar saplings + protective vole guards.',
        benefits: ['Digital Tree Passport NFC tag link', 'Annual survival audit report'],
        backers_count: 64
      },
      {
        id: 'tier-2',
        campaign_id: 'camp-1',
        title: 'Riparian Buffer Cohort',
        amount: 100,
        description: 'Sponsors 25 native trees and a soil moisture telemetry probe.',
        benefits: ['GPS marker on Greenverse Live Map', 'Live data telemetry access', 'Volunteer drive VIP badge'],
        backers_count: 42
      },
      {
        id: 'tier-3',
        campaign_id: 'camp-1',
        title: 'Keystone Watershed Steward',
        amount: 500,
        description: 'Underwrites 100 linear feet of bio-engineered riverbank fascine live stakes.',
        benefits: ['Permanent wooden plaque at trailhead', 'Quarterly arborist drone flyover report', 'Corporate/Family dedication'],
        backers_count: 12
      }
    ],
    created_at: '2026-10-15T10:00:00Z',
    updated_at: '2026-11-20T14:30:00Z'
  },
  {
    id: 'camp-2',
    project_id: 'proj-2',
    title: 'Biscayne Mangrove Nursery Crowdfund',
    description: 'Community-backed seedling procurement and biodegradable coir mat installation across Pelican Shoals tidal flats.',
    budget_purpose: 'Boat rental, coir anchoring mats, oyster shell cultch transport, and water quality testing reagents.',
    funding_goal: 35000,
    amount_raised: 19800,
    pledged_amount: 4500,
    currency: 'USD',
    start_date: '2026-11-01',
    end_date: '2027-02-28',
    status: 'active',
    supporters_count: 92,
    tiers: [
      {
        id: 'tier-2-1',
        campaign_id: 'camp-2',
        title: 'Propagule Planter',
        amount: 20,
        description: 'Sponsors 10 red mangrove propagules and geotextile anchor pegs.',
        benefits: ['Digital certificate', 'NFC verification badge'],
        backers_count: 51
      },
      {
        id: 'tier-2-2',
        campaign_id: 'camp-2',
        title: 'Oyster Reef Foundation',
        amount: 150,
        description: 'Funds 10 meters of recycled oyster shell cultch beds.',
        benefits: ['Named reef marker', 'Marine biologist survey log access'],
        backers_count: 18
      }
    ],
    created_at: '2026-11-01T08:00:00Z',
    updated_at: '2026-11-22T09:15:00Z'
  }
];

export const INITIAL_BUDGET_ITEMS: Record<string, BudgetItem[]> = {
  'proj-1': [
    { id: 'b-1', project_id: 'proj-1', category: 'Saplings & Bare-Root Seedlings', allocated_amount: 28000, notes: '12,000 nursery-certified conifers', created_at: '2026-10-15T10:00:00Z' },
    { id: 'b-2', project_id: 'proj-1', category: 'Soil Amendments & Mycorrhizae', allocated_amount: 8500, notes: 'Organic pine-bark mulch & compost', created_at: '2026-10-15T10:00:00Z' },
    { id: 'b-3', project_id: 'proj-1', category: 'Tools, Guards & Irrigation', allocated_amount: 12500, notes: 'Heavy-duty tree tubes & planting tools', created_at: '2026-10-15T10:00:00Z' },
    { id: 'b-4', project_id: 'proj-1', category: 'Telemetry & Stream Sensors', allocated_amount: 6000, notes: 'Solar moisture & temperature dataloggers', created_at: '2026-10-15T10:00:00Z' },
    { id: 'b-5', project_id: 'proj-1', category: 'Volunteer Logistics & Safety', allocated_amount: 5000, notes: 'Safety gear, hydration, emergency kit', created_at: '2026-10-15T10:00:00Z' }
  ]
};

export const INITIAL_SPENDING_RECORDS: Record<string, SpendingRecord[]> = {
  'proj-1': [
    {
      id: 'sp-1',
      project_id: 'proj-1',
      category: 'Saplings & Bare-Root Seedlings',
      amount: 14200,
      spent_date: '2026-10-22',
      vendor_or_payee: 'Cascadia Native Plant Nursery Co.',
      description: 'First delivery of 6,000 western redcedar & sitka spruce plugs (Batch A)',
      receipt_url: 'https://example.com/receipts/inv-4821.pdf',
      recorded_by_name: 'Marcus Vance, Financial Controller',
      is_verified: true,
      created_at: '2026-10-23T11:00:00Z'
    },
    {
      id: 'sp-2',
      project_id: 'proj-1',
      category: 'Tools, Guards & Irrigation',
      amount: 4850,
      spent_date: '2026-11-04',
      vendor_or_payee: 'Pacific Forestry Supply House',
      description: '2,500 biodegradable tree protectors and wooden stake fasteners',
      receipt_url: 'https://example.com/receipts/inv-5102.pdf',
      recorded_by_name: 'Elena Rostova, Project Manager',
      is_verified: true,
      created_at: '2026-11-05T09:30:00Z'
    },
    {
      id: 'sp-3',
      project_id: 'proj-1',
      category: 'Telemetry & Stream Sensors',
      amount: 3200,
      spent_date: '2026-11-12',
      vendor_or_payee: 'EcoTelemetry Solutions Ltd.',
      description: '10 LoRaWAN solar-powered water temperature probes and gateway hub',
      receipt_url: 'https://example.com/receipts/inv-5290.pdf',
      recorded_by_name: 'Sarah Chen, Field Lead',
      is_verified: true,
      created_at: '2026-11-13T15:20:00Z'
    }
  ]
};

export const INITIAL_VOLUNTEER_ROLES: Record<string, VolunteerRole[]> = {
  'proj-1': [
    {
      id: 'vrole-1',
      project_id: 'proj-1',
      title: 'Riparian Planting Crew Member',
      description: 'Work along designated sector banks digging planting pockets, installing mycorrhizal tablets, and placing protective browse guards.',
      required_skills: ['Tree planting', 'Gardening', 'Physical stamina'],
      spots_needed: 25,
      spots_filled: 18,
      time_commitment: '4 hours on Saturday mornings',
      location_type: 'on_site',
      created_at: '2026-10-18T10:00:00Z'
    },
    {
      id: 'vrole-2',
      project_id: 'proj-1',
      title: 'Hydrology & Soil Data Collector',
      description: 'Calibrate water temperature probes and take weekly soil moisture readings using the Greenverse mobile telemetry checklist.',
      required_skills: ['Environmental research', 'GIS/maps', 'Attention to detail'],
      spots_needed: 6,
      spots_filled: 4,
      time_commitment: '2 hours weekly (flexible weekday or weekend)',
      location_type: 'hybrid',
      created_at: '2026-10-18T10:00:00Z'
    },
    {
      id: 'vrole-3',
      project_id: 'proj-1',
      title: 'Community Field Event Coordinator',
      description: 'Check in registered volunteers, hand out sanitized gear and safety vests, and coordinate hydration and snack stations.',
      required_skills: ['Event organizing', 'Community organizing'],
      spots_needed: 5,
      spots_filled: 4,
      time_commitment: '5 hours during monthly planting rallies',
      location_type: 'on_site',
      created_at: '2026-10-20T14:00:00Z'
    }
  ]
};

export const INITIAL_RESOURCE_REQUESTS: Record<string, ResourceRequest[]> = {
  'proj-1': [
    {
      id: 'res-1',
      project_id: 'proj-1',
      resource_type: 'tools',
      title: 'Heavy-Duty Planting Shovels & Pulaskis',
      quantity_needed: 40,
      quantity_fulfilled: 28,
      urgency: 'high',
      status: 'partially_fulfilled',
      created_at: '2026-10-20T10:00:00Z'
    },
    {
      id: 'res-2',
      project_id: 'proj-1',
      resource_type: 'transport',
      title: 'Enclosed Utility Trailer (14ft+) for Seedling Plugs',
      quantity_needed: 2,
      quantity_fulfilled: 2,
      urgency: 'medium',
      status: 'fulfilled',
      created_at: '2026-10-21T11:00:00Z'
    },
    {
      id: 'res-3',
      project_id: 'proj-1',
      resource_type: 'materials',
      title: 'Aged Bark Mulch for Weed Suppression (Bales/Yards)',
      quantity_needed: 50,
      quantity_fulfilled: 20,
      urgency: 'medium',
      status: 'open',
      created_at: '2026-10-25T09:00:00Z'
    }
  ]
};

export const INITIAL_MILESTONES: Record<string, ProjectMilestone[]> = {
  'proj-1': [
    {
      id: 'm-1',
      project_id: 'proj-1',
      title: 'Site Preparation & Non-Native Blackberry Clearing',
      description: 'Manual removal of invasive Himalayan blackberry thickets across 4.2 riverbank kilometers.',
      due_date: '2026-11-15',
      responsible_member_name: 'Elena Rostova',
      target_percentage: 100,
      current_progress_percentage: 100,
      status: 'completed',
      completion_date: '2026-11-12',
      evidence_url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80',
      created_at: '2026-10-15T10:00:00Z'
    },
    {
      id: 'm-2',
      project_id: 'proj-1',
      title: 'Phase 1 Planting: 6,000 Native Conifers Installed',
      description: 'First major volunteer sprint planting containerized redcedars and sitka spruce along Sector 4.',
      due_date: '2026-12-15',
      responsible_member_name: 'Marcus Vance',
      target_percentage: 100,
      current_progress_percentage: 75,
      status: 'in_progress',
      created_at: '2026-10-15T10:00:00Z'
    },
    {
      id: 'm-3',
      project_id: 'proj-1',
      title: 'Telemetry Beacon Grid Activation',
      description: 'Deploy 25 solar water temperature and soil hydrology sensors with live Greenverse map feeds.',
      due_date: '2027-01-20',
      responsible_member_name: 'Sarah Chen',
      target_percentage: 100,
      current_progress_percentage: 40,
      status: 'in_progress',
      created_at: '2026-10-15T10:00:00Z'
    },
    {
      id: 'm-4',
      project_id: 'proj-1',
      title: 'Phase 2 Live Willow Staking & Buffer Mulching',
      description: 'Install 5,000 dormant live willow stakes and 80 yards of organic mulch rings.',
      due_date: '2027-03-30',
      responsible_member_name: 'Elena Rostova',
      target_percentage: 100,
      current_progress_percentage: 0,
      status: 'pending',
      created_at: '2026-10-15T10:00:00Z'
    }
  ]
};

export const INITIAL_UPDATES: Record<string, ProjectUpdate[]> = {
  'proj-1': [
    {
      id: 'upd-1',
      project_id: 'proj-1',
      author_name: 'Elena Rostova, Project Manager',
      title: 'Phase 1 Milestone Complete: Blackberry Clearing Complete!',
      content: 'Over 4.2 km of dense Himalayan blackberry have been manually cleared without chemical herbicides. Root beds were immediately mulched to prepare soil microbiology for incoming redcedar plugs next Saturday.',
      update_type: 'milestone',
      media_url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
      created_at: '2026-11-14T17:30:00Z'
    },
    {
      id: 'upd-2',
      project_id: 'proj-1',
      author_name: 'Marcus Vance, Financial Controller',
      title: 'Financial Transparency Audit: Batch A Saplings Delivered',
      content: 'We have published the receipt and inspection log for the first 6,000 nursery plugs ($14,200). 100% of community pledges received have been verified against nursery manifests.',
      update_type: 'financial',
      created_at: '2026-11-20T11:00:00Z'
    }
  ]
};

export const INITIAL_IMPACT_ESTIMATES: Record<string, ImpactEstimate> = {
  'proj-1': {
    id: 'imp-1',
    project_id: 'proj-1',
    trees_planned: 12000,
    tree_survival_rate_pct: 88,
    planting_area_sqm: 42000,
    restored_greenspace_sqm: 35000,
    waste_diverted_kg: 850,
    water_conserved_liters: 1250000,
    estimated_annual_co2_kg: 232000,
    methodology_notes: 'Calculated using USDA Forest Service i-Tree Eco growth equations for Western Redcedar & Sitka Spruce in King County, WA. Assumes 88% survival rate based on automated drip irrigation telemetry.',
    time_horizon_years: 10,
    created_at: '2026-10-15T10:00:00Z'
  }
};

// In-memory runtime state
let localProjects = [...INITIAL_PROJECTS];
let localCampaigns = [...INITIAL_CAMPAIGNS];
let localBudgetItems = { ...INITIAL_BUDGET_ITEMS };
let localSpendingRecords = { ...INITIAL_SPENDING_RECORDS };
let localVolunteerRoles = { ...INITIAL_VOLUNTEER_ROLES };
let localVolunteerApps: VolunteerApplication[] = [];
let localResourceRequests = { ...INITIAL_RESOURCE_REQUESTS };
let localResourcePledges: ResourcePledge[] = [];
let localMilestones = { ...INITIAL_MILESTONES };
let localUpdates = { ...INITIAL_UPDATES };
let localImpactEstimates = { ...INITIAL_IMPACT_ESTIMATES };
let localReports: ProjectReport[] = [];
let localPledges: ProjectPledge[] = [];

// ==========================================
// FEATURE 1 & 2: PROJECTS SERVICE
// ==========================================

export async function fetchProjects(options?: {
  search?: string;
  category?: string;
  status?: string;
  project_type?: string;
  funding_status?: string;
  userId?: string;
}): Promise<{ data: Project[]; fromSupabase: boolean }> {
  try {
    let q = supabase.from('projects').select('*').order('created_at', { ascending: false });
    if (options?.category && options.category !== 'all') {
      q = q.eq('category', options.category);
    }
    if (options?.status && options.status !== 'all') {
      q = q.eq('status', options.status);
    }
    const { data, error } = await q;
    if (!error && data && data.length > 0) {
      return { data: data as Project[], fromSupabase: true };
    }
  } catch (err) {
    console.warn('[Greenverse Projects] Supabase query notice, using local cache:', err);
  }

  let list = [...localProjects];
  if (options?.category && options.category !== 'all') {
    list = list.filter((p) => p.category === options.category);
  }
  if (options?.status && options.status !== 'all') {
    list = list.filter((p) => p.status === options.status);
  }
  if (options?.project_type && options.project_type !== 'all') {
    list = list.filter((p) => p.project_type === options.project_type);
  }
  if (options?.search) {
    const s = options.search.toLowerCase();
    list = list.filter(
      (p) =>
        p.title.toLowerCase().includes(s) ||
        p.description.toLowerCase().includes(s) ||
        p.location_name.toLowerCase().includes(s) ||
        (p.owner_name && p.owner_name.toLowerCase().includes(s))
    );
  }
  return { data: list, fromSupabase: false };
}

export async function fetchProjectById(id: string): Promise<Project | null> {
  try {
    const { data, error } = await supabase.from('projects').select('*').eq('id', id).single();
    if (!error && data) {
      return data as Project;
    }
  } catch (err) {
    console.warn('[Greenverse Projects] single fetch notice:', err);
  }
  return localProjects.find((p) => p.id === id) || null;
}

export async function createProject(
  project: Partial<Project>,
  userId?: string,
  userName?: string
): Promise<{ data: Project | null; error: Error | null; fromSupabase: boolean }> {
  const payload: Project = {
    id: `proj-${Date.now()}`,
    owner_id: userId || null,
    owner_name: userName || 'Environmental Organizer',
    community_id: project.community_id || null,
    squad_id: project.squad_id || null,
    title: project.title!.trim(),
    slug: project.title!.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    subtitle: project.subtitle?.trim() || 'Community-led ecological initiative',
    description: project.description!.trim(),
    problem_statement: project.problem_statement?.trim() || '',
    proposed_solution: project.proposed_solution?.trim() || '',
    objectives: project.objectives || ['Establish native planting zone', 'Engage community volunteers'],
    category: project.category || 'tree_planting',
    project_type: project.project_type || 'community',
    status: project.status || 'draft',
    verification_status: 'unverified',
    location_name: project.location_name?.trim() || 'Designated Eco-Zone',
    latitude: project.latitude ?? 47.6062,
    longitude: project.longitude ?? -122.3321,
    country: project.country || 'USA',
    region: project.region || 'Regional Chapter',
    start_date: project.start_date || new Date().toISOString().split('T')[0],
    end_date: project.end_date || new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
    estimated_timeline: project.estimated_timeline || '6 Months Initial Implementation',
    currency: project.currency || 'USD',
    estimated_budget: project.estimated_budget || 25000,
    funding_target: project.funding_target || 20000,
    current_funding_raised: 0,
    pledged_amount: 0,
    supporters_count: 0,
    volunteers_needed: project.volunteers_needed || 20,
    volunteers_registered: 0,
    cover_image_url: project.cover_image_url || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
    expected_outcomes: project.expected_outcomes || ['Verified tree passports cataloged', 'Enhanced local canopy coverage'],
    resource_requirements: project.resource_requirements || ['Gardening spades and gloves', 'Mulch and compost'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_bookmarked: false,
    user_role: 'lead_organizer'
  };

  try {
    const { data, error } = await supabase.from('projects').insert(payload).select().single();
    if (!error && data) {
      localProjects.unshift(data as Project);
      return { data: data as Project, error: null, fromSupabase: true };
    }
  } catch (err) {
    console.warn('[Greenverse Projects] Supabase insert notice, saved to local cache:', err);
  }

  localProjects.unshift(payload);
  return { data: payload, error: null, fromSupabase: false };
}

export async function updateProject(
  id: string,
  updates: Partial<Project>,
  userId?: string
): Promise<{ data: Project | null; error: Error | null }> {
  const index = localProjects.findIndex((p) => p.id === id);
  if (index === -1) return { data: null, error: new Error('Project not found') };

  const updated = {
    ...localProjects[index],
    ...updates,
    updated_at: new Date().toISOString()
  };
  localProjects[index] = updated;

  try {
    await supabase.from('projects').update(updates).eq('id', id);
  } catch (err) {
    console.warn('[Greenverse Projects] update notice:', err);
  }

  return { data: updated, error: null };
}

export async function toggleBookmarkProject(projectId: string, userId?: string): Promise<boolean> {
  const p = localProjects.find((proj) => proj.id === projectId);
  if (!p) return false;
  p.is_bookmarked = !p.is_bookmarked;

  try {
    if (userId) {
      if (p.is_bookmarked) {
        await supabase.from('project_bookmarks').insert({ project_id: projectId, user_id: userId });
      } else {
        await supabase.from('project_bookmarks').delete().eq('project_id', projectId).eq('user_id', userId);
      }
    }
  } catch (err) {
    console.warn('[Greenverse Bookmarks] sync notice:', err);
  }

  return !!p.is_bookmarked;
}

// ==========================================
// FEATURE 3: FUNDING CAMPAIGNS & PLEDGES
// ==========================================

export async function fetchProjectCampaign(projectId: string): Promise<FundingCampaign | null> {
  try {
    const { data, error } = await supabase.from('funding_campaigns').select('*').eq('project_id', projectId).single();
    if (!error && data) {
      return data as FundingCampaign;
    }
  } catch (err) {
    console.warn('[Greenverse Campaigns] fetch notice:', err);
  }
  return localCampaigns.find((c) => c.project_id === projectId) || null;
}

export async function createPledge(
  pledge: Partial<ProjectPledge>,
  userId?: string
): Promise<ProjectPledge> {
  const newPledge: ProjectPledge = {
    id: `pledge-${Date.now()}`,
    project_id: pledge.project_id!,
    campaign_id: pledge.campaign_id || null,
    user_id: userId || null,
    tier_id: pledge.tier_id || null,
    pledge_type: pledge.pledge_type || 'financial_pledge',
    amount: Number(pledge.amount) || 0,
    currency: pledge.currency || 'USD',
    status: 'pledged',
    supporter_name: pledge.supporter_name || 'Anonymous Steward',
    supporter_email: pledge.supporter_email || '',
    is_anonymous: pledge.is_anonymous || false,
    notes: pledge.notes || '',
    created_at: new Date().toISOString()
  };

  localPledges.unshift(newPledge);

  // Update project and campaign counts honestly (labeled as pledged amount)
  const proj = localProjects.find((p) => p.id === pledge.project_id);
  if (proj) {
    proj.pledged_amount += newPledge.amount;
    proj.supporters_count += 1;
  }

  const camp = localCampaigns.find((c) => c.project_id === pledge.project_id);
  if (camp) {
    camp.pledged_amount += newPledge.amount;
    camp.supporters_count += 1;
  }

  try {
    await supabase.from('project_pledges').insert(newPledge);
  } catch (err) {
    console.warn('[Greenverse Pledges] Supabase insert notice:', err);
  }

  return newPledge;
}

// ==========================================
// FEATURE 4: TRANSPARENCY DASHBOARD & SPENDING
// ==========================================

export async function fetchBudgetAndSpending(projectId: string): Promise<{
  budgetItems: BudgetItem[];
  spendingRecords: SpendingRecord[];
}> {
  try {
    const [bRes, sRes] = await Promise.all([
      supabase.from('project_budget_items').select('*').eq('project_id', projectId),
      supabase.from('project_spending_records').select('*').eq('project_id', projectId).order('spent_date', { ascending: false })
    ]);
    if (!bRes.error && bRes.data && bRes.data.length > 0) {
      return {
        budgetItems: bRes.data as BudgetItem[],
        spendingRecords: (sRes.data || []) as SpendingRecord[]
      };
    }
  } catch (err) {
    console.warn('[Greenverse Transparency] fetch notice:', err);
  }

  return {
    budgetItems: localBudgetItems[projectId] || [],
    spendingRecords: localSpendingRecords[projectId] || []
  };
}

export async function addSpendingRecord(
  spending: Partial<SpendingRecord>,
  userId?: string,
  userName?: string
): Promise<SpendingRecord> {
  const newRecord: SpendingRecord = {
    id: `sp-${Date.now()}`,
    project_id: spending.project_id!,
    category: spending.category || 'General Operations',
    amount: Number(spending.amount) || 0,
    spent_date: spending.spent_date || new Date().toISOString().split('T')[0],
    vendor_or_payee: spending.vendor_or_payee!.trim(),
    description: spending.description!.trim(),
    receipt_url: spending.receipt_url || undefined,
    recorded_by: userId || null,
    recorded_by_name: userName || 'Project Controller',
    is_verified: false, // Spending records are unverified until a project financial controller reviews them
    created_at: new Date().toISOString()
  };

  if (!localSpendingRecords[spending.project_id!]) {
    localSpendingRecords[spending.project_id!] = [];
  }
  localSpendingRecords[spending.project_id!].unshift(newRecord);

  try {
    await supabase.from('project_spending_records').insert(newRecord);
  } catch (err) {
    console.warn('[Greenverse Spending] insert notice:', err);
  }

  return newRecord;
}

// ==========================================
// FEATURE 5: VOLUNTEER & RESOURCE MATCHER
// ==========================================

export async function fetchVolunteerRoles(projectId: string): Promise<VolunteerRole[]> {
  try {
    const { data, error } = await supabase.from('project_volunteer_roles').select('*').eq('project_id', projectId);
    if (!error && data && data.length > 0) return data as VolunteerRole[];
  } catch (err) {
    console.warn('[Greenverse Volunteer] roles fetch notice:', err);
  }
  return localVolunteerRoles[projectId] || [];
}

export async function applyVolunteerRole(
  app: Partial<VolunteerApplication>,
  userId?: string,
  userName?: string
): Promise<VolunteerApplication> {
  const newApp: VolunteerApplication = {
    id: `vapp-${Date.now()}`,
    role_id: app.role_id!,
    project_id: app.project_id!,
    user_id: userId || 'anonymous-volunteer',
    applicant_name: userName || 'Anonymous',
    applicant_email: app.applicant_email || '',
    skills: app.skills || [],
    availability: app.availability || 'Weekends',
    motivation: app.motivation || 'Committed to environmental restoration',
    status: 'pending', // Applications start as pending; project owners approve/decline
    created_at: new Date().toISOString()
  };

  localVolunteerApps.push(newApp);

  // Update role spots filled count
  const roles = localVolunteerRoles[app.project_id!] || [];
  const r = roles.find((role) => role.id === app.role_id);
  if (r) {
    r.spots_filled += 1;
  }

  // Update project volunteer count
  const p = localProjects.find((proj) => proj.id === app.project_id);
  if (p) {
    p.volunteers_registered += 1;
  }

  try {
    await supabase.from('volunteer_applications').insert(newApp);
  } catch (err) {
    console.warn('[Greenverse Volunteer] apply notice:', err);
  }

  return newApp;
}

export async function fetchResourceRequests(projectId: string): Promise<ResourceRequest[]> {
  try {
    const { data, error } = await supabase.from('project_resource_requests').select('*').eq('project_id', projectId);
    if (!error && data && data.length > 0) return data as ResourceRequest[];
  } catch (err) {
    console.warn('[Greenverse Resources] fetch notice:', err);
  }
  return localResourceRequests[projectId] || [];
}

export async function pledgeResource(
  pledge: Partial<ResourcePledge>,
  userId?: string
): Promise<ResourcePledge> {
  const newPledge: ResourcePledge = {
    id: `res-pledge-${Date.now()}`,
    request_id: pledge.request_id!,
    user_id: userId || null,
    donor_name: pledge.donor_name || 'Community Donor',
    quantity_offered: Number(pledge.quantity_offered) || 1,
    notes: pledge.notes || '',
    status: 'offered',
    created_at: new Date().toISOString()
  };

  localResourcePledges.push(newPledge);

  // Update fulfilled count on request
  for (const projId of Object.keys(localResourceRequests)) {
    const req = localResourceRequests[projId].find((r) => r.id === pledge.request_id);
    if (req) {
      req.quantity_fulfilled += newPledge.quantity_offered;
      if (req.quantity_fulfilled >= req.quantity_needed) {
        req.status = 'fulfilled';
      } else {
        req.status = 'partially_fulfilled';
      }
      break;
    }
  }

  try {
    await supabase.from('project_resource_pledges').insert(newPledge);
  } catch (err) {
    console.warn('[Greenverse Resources] pledge notice:', err);
  }

  return newPledge;
}

// ==========================================
// FEATURE 6: MILESTONE & PROGRESS TRACKER
// ==========================================

export async function fetchMilestones(projectId: string): Promise<ProjectMilestone[]> {
  try {
    const { data, error } = await supabase.from('project_milestones').select('*').eq('project_id', projectId).order('due_date', { ascending: true });
    if (!error && data && data.length > 0) return data as ProjectMilestone[];
  } catch (err) {
    console.warn('[Greenverse Milestones] fetch notice:', err);
  }
  return localMilestones[projectId] || [];
}

export async function updateMilestoneProgress(
  milestoneId: string,
  projectId: string,
  percentage: number,
  evidenceUrl?: string
): Promise<ProjectMilestone | null> {
  const list = localMilestones[projectId] || [];
  const m = list.find((item) => item.id === milestoneId);
  if (!m) return null;

  m.current_progress_percentage = Math.min(100, Math.max(0, percentage));
  if (m.current_progress_percentage >= 100) {
    m.status = 'completed';
    m.completion_date = new Date().toISOString().split('T')[0];
  } else if (m.current_progress_percentage > 0) {
    m.status = 'in_progress';
  }
  if (evidenceUrl) {
    m.evidence_url = evidenceUrl;
  }

  try {
    await supabase.from('project_milestones').update({
      current_progress_percentage: m.current_progress_percentage,
      status: m.status,
      completion_date: m.completion_date,
      evidence_url: m.evidence_url
    }).eq('id', milestoneId);
  } catch (err) {
    console.warn('[Greenverse Milestones] update notice:', err);
  }

  return m;
}

export async function fetchProjectUpdates(projectId: string): Promise<ProjectUpdate[]> {
  try {
    const { data, error } = await supabase.from('project_updates').select('*').eq('project_id', projectId).order('created_at', { ascending: false });
    if (!error && data && data.length > 0) return data as ProjectUpdate[];
  } catch (err) {
    console.warn('[Greenverse Updates] fetch notice:', err);
  }
  return localUpdates[projectId] || [];
}

export async function createProjectUpdate(
  update: Partial<ProjectUpdate>,
  userId?: string,
  authorName?: string
): Promise<ProjectUpdate> {
  const newUpd: ProjectUpdate = {
    id: `upd-${Date.now()}`,
    project_id: update.project_id!,
    author_id: userId || null,
    author_name: authorName || 'Project Steward',
    title: update.title!.trim(),
    content: update.content!.trim(),
    media_url: update.media_url || undefined,
    update_type: update.update_type || 'general',
    created_at: new Date().toISOString()
  };

  if (!localUpdates[update.project_id!]) {
    localUpdates[update.project_id!] = [];
  }
  localUpdates[update.project_id!].unshift(newUpd);

  try {
    await supabase.from('project_updates').insert(newUpd);
  } catch (err) {
    console.warn('[Greenverse Updates] insert notice:', err);
  }

  return newUpd;
}

// ==========================================
// FEATURE 7: PROJECT IMPACT ESTIMATOR
// ==========================================

export async function fetchImpactEstimate(projectId: string): Promise<ImpactEstimate | null> {
  try {
    const { data, error } = await supabase.from('project_impact_estimates').select('*').eq('project_id', projectId).single();
    if (!error && data) return data as ImpactEstimate;
  } catch (err) {
    console.warn('[Greenverse Impact] fetch notice:', err);
  }
  return localImpactEstimates[projectId] || null;
}

export async function saveImpactEstimate(estimate: Partial<ImpactEstimate>): Promise<ImpactEstimate> {
  const newEst: ImpactEstimate = {
    id: `imp-${Date.now()}`,
    project_id: estimate.project_id!,
    trees_planned: Number(estimate.trees_planned) || 0,
    tree_survival_rate_pct: Number(estimate.tree_survival_rate_pct) || 85,
    planting_area_sqm: Number(estimate.planting_area_sqm) || 0,
    restored_greenspace_sqm: Number(estimate.restored_greenspace_sqm) || 0,
    waste_diverted_kg: Number(estimate.waste_diverted_kg) || 0,
    water_conserved_liters: Number(estimate.water_conserved_liters) || 0,
    estimated_annual_co2_kg: Number(estimate.estimated_annual_co2_kg) || 0,
    methodology_notes: estimate.methodology_notes || 'Calculation based on standard ecological allometric biomass formulas. Note: Estimated impact is not verified impact.',
    time_horizon_years: Number(estimate.time_horizon_years) || 5,
    created_at: new Date().toISOString()
  };

  localImpactEstimates[estimate.project_id!] = newEst;

  try {
    await supabase.from('project_impact_estimates').upsert(newEst);
  } catch (err) {
    console.warn('[Greenverse Impact] upsert notice:', err);
  }

  return newEst;
}

// ==========================================
// FEATURE 8: TRUST, VERIFICATION & REPORTING
// ==========================================

export async function submitForReview(projectId: string): Promise<boolean> {
  const p = localProjects.find((proj) => proj.id === projectId);
  if (!p) return false;
  p.verification_status = 'submitted_for_review';
  p.status = 'pending_review';

  try {
    await supabase.from('projects').update({
      verification_status: 'submitted_for_review',
      status: 'pending_review'
    }).eq('id', projectId);
  } catch (err) {
    console.warn('[Greenverse Verification] submit notice:', err);
  }

  return true;
}

export async function reportProject(
  report: Partial<ProjectReport>,
  userId?: string
): Promise<ProjectReport> {
  const newReport: ProjectReport = {
    id: `rep-${Date.now()}`,
    project_id: report.project_id!,
    reporter_id: userId || null,
    reason: report.reason || 'misleading_claims',
    details: report.details!.trim(),
    status: 'open',
    created_at: new Date().toISOString()
  };

  localReports.push(newReport);

  try {
    await supabase.from('project_reports').insert(newReport);
  } catch (err) {
    console.warn('[Greenverse Reports] insert notice:', err);
  }

  return newReport;
}
