import { supabase } from '../lib/supabase';
import {
  GreenGig,
  GigApplication,
  GreenBounty,
  BountySubmission,
  GreenOpportunity,
  UserWallet,
  WalletTransaction,
  WalletRedemptionOption,
  UserSkillProfile,
  SkillMatchResult,
  UserReputation,
  ReputationActivityLog,
  UserBadge,
  MarketplaceListing,
  MarketplaceInquiry,
  GreenExpertProfile,
  ExpertInquiry
} from '../types/economy';

// ==============================================================================
// INITIAL SEED DATA (Used as offline cache & demo baseline)
// ==============================================================================

export const INITIAL_GIGS: GreenGig[] = [
  {
    id: 'gig-1',
    employer_id: null,
    employer_name: 'Pacific Riparian Reforestation Trust',
    title: 'Lead Native Canopy Arborist & Survival Surveyor',
    category: 'tree_planting_restoration',
    compensation_type: 'paid',
    compensation_amount: 38,
    compensation_currency: 'USD',
    compensation_frequency: 'hourly',
    job_type: 'contract',
    location_type: 'on_site',
    location_name: 'Willamette Watershed, OR',
    deadline: '2027-02-15T00:00:00Z',
    status: 'open',
    description: 'We are seeking an experienced arborist to lead a 4-month field project monitoring 12,000 riparian hardwood saplings and verifying biometric growth logs.',
    responsibilities: [
      'Conduct survival and DBH audits across 8 designated planting zones.',
      'Calibrate LoRaWAN soil moisture probes and inspect drip lines.',
      'Train squad volunteers on non-invasive crown pruning and mulch layering.'
    ],
    requirements: [
      'ISA Certified Arborist credential or 3+ years field restoration experience.',
      'Comfortable operating in backcountry riparian wetlands.',
      'Familiarity with mobile GIS or GPS waypoint logging.'
    ],
    required_skills: ['Tree planting', 'Soil preparation', 'GIS & mapping', 'Field leadership'],
    applications_count: 5,
    is_bookmarked: false,
    created_at: '2026-11-01T10:00:00Z'
  },
  {
    id: 'gig-2',
    employer_id: null,
    employer_name: 'Metro Eco-Data Labs',
    title: 'Urban Heat Island Remote Sensing & GIS Analyst',
    category: 'gis_mapping',
    compensation_type: 'paid',
    compensation_amount: 3200,
    compensation_currency: 'USD',
    compensation_frequency: 'monthly',
    job_type: 'contract',
    location_type: 'remote',
    location_name: 'Remote / Global',
    deadline: '2027-01-30T00:00:00Z',
    status: 'open',
    description: 'Perform multispectral analysis using Sentinel-2 and Landsat thermal infrared passes to detect high-priority urban planting corridors.',
    responsibilities: [
      'Generate normalized difference vegetation index (NDVI) raster overlays.',
      'Produce surface temperature gradient maps for municipal canopy planning.',
      'Publish OpenStreetMap compatible geojson planting boundaries.'
    ],
    requirements: [
      'Proficiency in QGIS, ArcGIS Pro, or Python GDAL/rasterio.',
      'Understanding of urban climate micro-meteorology.',
      'Portfolio demonstrating spatial heat island studies.'
    ],
    required_skills: ['GIS & mapping', 'Environmental science', 'Data collection'],
    applications_count: 8,
    is_bookmarked: true,
    created_at: '2026-11-05T14:30:00Z'
  },
  {
    id: 'gig-3',
    employer_id: null,
    employer_name: 'Community Regenerative Compost Alliance',
    title: 'Neighborhood Soil & Compost Master Coordinator',
    category: 'waste_recycling',
    compensation_type: 'unpaid_stipend',
    compensation_amount: 600,
    compensation_currency: 'USD',
    compensation_frequency: 'monthly',
    job_type: 'part_time',
    location_type: 'hybrid',
    location_name: 'East District Community Hub',
    deadline: '2027-03-01T00:00:00Z',
    status: 'open',
    description: 'Coordinate volunteer compost intake, monitor thermophilic decomposition batches, and distribute bio-rich humus to local urban farms.',
    responsibilities: [
      'Manage weekly compost drop-off sessions with community households.',
      'Measure core temperature, pH, and aeration cycles.',
      'Conduct soil quality tests for heavy metals and nitrogen ratios.'
    ],
    requirements: [
      'Passion for circular waste reduction and urban permaculture.',
      'Good organizational and volunteer communication skills.',
      'Able to lift 15-20 kg bags occasionally.'
    ],
    required_skills: ['Soil preparation', 'Community outreach', 'Education & training'],
    applications_count: 3,
    is_bookmarked: false,
    created_at: '2026-11-10T09:15:00Z'
  }
];

export const INITIAL_BOUNTIES: GreenBounty[] = [
  {
    id: 'bounty-1',
    creator_id: null,
    creator_name: 'CleanWaters Watershed Squad',
    title: 'Litter Hotspot Cleanup & Stream Audit (Zone 4)',
    category: 'litter_cleanup',
    description: 'Locate, collect, and sort at least 5 kg of plastic and debris from the creek bank. Submit before/after photos and geotagged bag inventory.',
    instructions: '1. Use protective gloves. 2. Collect debris into marked recycling and waste bags. 3. Weigh bags or count items. 4. Take geotagged before/after photos. 5. Dispose at municipal transfer point or green bin.',
    verification_requirements: '2 clear photos (before & after cleanup) with visible surroundings, plus bag count or estimated weight in kg.',
    reward_type: 'green_points',
    reward_value: 80,
    reward_label: '80 Green Points',
    spots_available: 15,
    spots_claimed: 6,
    spots_completed: 4,
    deadline: '2027-01-15T00:00:00Z',
    status: 'active',
    location_name: 'Cedar Creek Tributary, Section B',
    latitude: 45.5152,
    longitude: -122.6784,
    is_claimed_by_user: false,
    created_at: '2026-11-12T08:00:00Z'
  },
  {
    id: 'bounty-2',
    creator_id: null,
    creator_name: 'Urban Pollinator Network',
    title: 'Native Pollinator Flora & Insect Census',
    category: 'biodiversity_survey',
    description: 'Conduct a 30-minute observational survey of flowering native plants in your local park. Record at least 3 distinct native bee or butterfly visits.',
    instructions: '1. Choose a sunny day between 10am and 3pm. 2. Sit by a native floral patch for 30 minutes. 3. Document species using Greenverse visual identifier or camera. 4. Note plant species and pollinator interactions.',
    verification_requirements: 'At least 3 timestamped photos showing pollinators on flowers, and plant species names.',
    reward_type: 'green_points',
    reward_value: 60,
    reward_label: '60 Green Points',
    spots_available: 25,
    spots_claimed: 12,
    spots_completed: 9,
    deadline: '2027-02-28T00:00:00Z',
    status: 'active',
    location_name: 'Any Public Park or Protected Greenspace',
    is_claimed_by_user: false,
    created_at: '2026-11-14T11:20:00Z'
  },
  {
    id: 'bounty-3',
    creator_id: null,
    creator_name: 'ArborShield Forest Guard',
    title: 'Post-Winter Sapling Mulch & Stake Inspection',
    category: 'tree_planting',
    description: 'Inspect 5 previously planted juvenile trees. Verify stakes are secure, remove encroaching weeds, and apply a 5 cm organic mulch collar (avoiding trunk collar).',
    instructions: '1. Locate registered Greenverse trees via Green Map. 2. Weed a 1m circle around trunk. 3. Replenish woodchip mulch. 4. Check for rodent damage or broken ties.',
    verification_requirements: 'Photo of mulched tree base with passport code or marker visible.',
    reward_type: 'green_points',
    reward_value: 120,
    reward_label: '120 Green Points + Plaque Credit',
    spots_available: 10,
    spots_claimed: 3,
    spots_completed: 2,
    deadline: '2027-03-15T00:00:00Z',
    status: 'active',
    location_name: 'Oak Creek Plantation Belt',
    latitude: 45.4800,
    longitude: -122.6500,
    is_claimed_by_user: false,
    created_at: '2026-11-15T16:45:00Z'
  }
];

export const INITIAL_OPPORTUNITIES: GreenOpportunity[] = [
  {
    id: 'opp-1',
    creator_id: null,
    title: 'Planetary Canopy Fellowship 2027',
    opportunity_type: 'fellowship',
    organization_name: 'Global Agroforestry & Biosphere Institute',
    organization_website: 'https://example.org/fellowship',
    description: 'A 9-month fully funded fellowship program for early-career researchers and forest activists focusing on drought-resilient hardwood hybridization.',
    eligibility: 'Applicants with demonstrable involvement in environmental restoration, biology, or community ecology. No formal PhD required.',
    application_instructions: 'Submit a 500-word proposal detailing a community agroforestry pilot, CV, and 2 letters of environmental endorsement.',
    external_link: 'https://example.org/apply-fellowship',
    location_type: 'hybrid',
    location_name: 'Geneva & Regional Research Stations',
    required_skills: ['Environmental science', 'GIS & mapping', 'Community outreach'],
    deadline: '2027-03-31T00:00:00Z',
    funding_or_stipend: '$28,000 Annual Living Grant + Field Travel',
    status: 'open',
    bookmarks_count: 34,
    is_bookmarked: false,
    created_at: '2026-10-20T12:00:00Z'
  },
  {
    id: 'opp-2',
    creator_id: null,
    title: 'Urban Micro-Forestry Seedling Grant',
    opportunity_type: 'grant',
    organization_name: 'Metropolitan Climate Action Foundation',
    organization_website: 'https://example.org/grants',
    description: 'Direct community grants supplying up to 250 native saplings, organic soil amendments, and automated drip irrigation timers for school and community gardens.',
    eligibility: 'Registered non-profits, student climate clubs, neighborhood associations, and Greenverse squads.',
    application_instructions: 'Complete the spatial site assessment on Greenverse and attach the planting boundary export.',
    external_link: 'https://example.org/seedling-grant',
    location_type: 'on_site',
    location_name: 'North American Municipalities',
    required_skills: ['Tree planting', 'Soil preparation', 'Project management'],
    deadline: '2027-02-20T00:00:00Z',
    funding_or_stipend: 'Up to $4,500 in physical restoration supplies',
    status: 'open',
    bookmarks_count: 51,
    is_bookmarked: true,
    created_at: '2026-10-25T08:30:00Z'
  },
  {
    id: 'opp-3',
    creator_id: null,
    title: 'Biodiversity Monitoring & IoT Field Internship',
    opportunity_type: 'internship',
    organization_name: 'TerraSense Bio-Acoustics Lab',
    organization_website: 'https://example.org/internships',
    description: '3-month summer placement deploying audio acoustic bio-recorders in old-growth corridors to catalog endangered avian and bat migration patterns.',
    eligibility: 'Enrolled undergraduate or graduate students in environmental studies, wildlife biology, computer science, or electrical engineering.',
    application_instructions: 'Apply online with academic transcript and a brief summary of outdoor field experience.',
    external_link: 'https://example.org/intern-apply',
    location_type: 'hybrid',
    location_name: 'Cascade Mountain Bio-Preserve',
    required_skills: ['Data collection', 'Photography', 'Environmental science'],
    deadline: '2027-04-15T00:00:00Z',
    funding_or_stipend: '$22.50 / hour + Field Housing',
    status: 'open',
    bookmarks_count: 19,
    is_bookmarked: false,
    created_at: '2026-11-02T15:00:00Z'
  }
];

export const INITIAL_REDEMPTIONS: WalletRedemptionOption[] = [
  {
    id: 'red-1',
    name: 'Sponsor 5 Mangrove Saplings in Coastal Delta',
    category: 'restoration_sponsorship',
    points_cost: 150,
    description: 'Dedicate 5 mangrove seedlings planted by vetted community restoration squads with geotagged photo proof and survival tracking.',
    fulfillment_type: 'tree_planted',
    available: true
  },
  {
    id: 'red-2',
    name: 'Greenverse Engraved NFC Tree Steward Plaque',
    category: 'certificate_plaque',
    points_cost: 250,
    description: 'Weatherproof recycled anodized aluminum plaque with laser-etched QR and NFC chip to affix to your adopted community tree.',
    fulfillment_type: 'physical_delivery',
    available: true
  },
  {
    id: 'red-3',
    name: 'Native Wildflower & Pollinator Seed Pack',
    category: 'eco_merchandise',
    points_cost: 180,
    description: 'Organic non-GMO native seed mix containing 12 high-nectar perennial species certified free of neonicotinoids.',
    fulfillment_type: 'physical_delivery',
    available: true
  },
  {
    id: 'red-4',
    name: 'Virtual Global Planetary Agroforestry Workshop Pass',
    category: 'workshop_ticket',
    points_cost: 300,
    description: 'Live interactive 4-session masterclass led by senior permaculture engineers on soil regeneration and mycelial networks.',
    fulfillment_type: 'ticket_pass',
    available: true
  }
];

export const INITIAL_MARKETPLACE: MarketplaceListing[] = [
  {
    id: 'item-1',
    seller_id: null,
    seller_name: 'Cascadia Heritage Nursery',
    title: 'Certified Western Red Cedar Saplings (Bare Root, Pack of 5)',
    category: 'plants_seedlings',
    listing_type: 'for_sale',
    item_condition: 'new',
    price: 32.00,
    currency: 'USD',
    description: '2-year-old vigorous bare-root Thuja plicata saplings, mycorrhizal inoculated, ready for late autumn and early spring riparian restoration.',
    image_url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80',
    location_region: 'Pacific Northwest / Clackamas County',
    status: 'available',
    bookmarks_count: 14,
    inquiries_count: 3,
    is_bookmarked: false,
    created_at: '2026-11-08T11:00:00Z',
    updated_at: '2026-11-08T11:00:00Z'
  },
  {
    id: 'item-2',
    seller_id: null,
    seller_name: 'Urban Permaculture Collective',
    title: 'Heavy Duty Ergonomic Planting Mattock & Shovel Set',
    category: 'gardening_tools',
    listing_type: 'for_sale',
    item_condition: 'like_new',
    price: 45.00,
    currency: 'USD',
    description: 'Forged carbon steel head with ash hardwood handle. Perfect for breaking compacted clay and rocky urban soils without wrist strain.',
    image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&auto=format&fit=crop&q=80',
    location_region: 'East District Hub',
    status: 'available',
    bookmarks_count: 7,
    inquiries_count: 1,
    is_bookmarked: true,
    created_at: '2026-11-12T14:20:00Z',
    updated_at: '2026-11-12T14:20:00Z'
  },
  {
    id: 'item-3',
    seller_id: null,
    seller_name: 'Elena Rostova',
    title: 'Heirloom Milkweed & Coneflower Seeds for Pollinators',
    category: 'seeds_bulbs',
    listing_type: 'free',
    item_condition: 'new',
    price: 0,
    currency: 'USD',
    description: 'Over 500 open-pollinated monarch butterfly friendly seeds harvested organically from our certified backyard wildlife sanctuary. Free for community planters!',
    image_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
    location_region: 'South Valley Neighborhood',
    status: 'available',
    bookmarks_count: 26,
    inquiries_count: 9,
    is_bookmarked: false,
    created_at: '2026-11-15T09:40:00Z',
    updated_at: '2026-11-15T09:40:00Z'
  },
  {
    id: 'item-4',
    seller_id: null,
    seller_name: 'Metro Tool Share Depot',
    title: 'Gas-Powered Hydraulic Tree Post Hole Digger / Auger',
    category: 'equipment_sharing',
    listing_type: 'exchange',
    item_condition: 'good',
    price: 0,
    currency: 'USD',
    exchange_preference: 'Borrow for weekend planting in exchange for 2 bags of compost or volunteer labor',
    description: 'Community-owned two-person auger with 6-inch and 8-inch bits. Ideal for mass sapling planting drives. Training provided before checkout.',
    image_url: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=600&auto=format&fit=crop&q=80',
    location_region: 'Central Community Depot',
    status: 'available',
    bookmarks_count: 18,
    inquiries_count: 4,
    is_bookmarked: false,
    created_at: '2026-11-16T17:10:00Z',
    updated_at: '2026-11-16T17:10:00Z'
  }
];

export const INITIAL_EXPERTS: GreenExpertProfile[] = [
  {
    id: 'exp-1',
    user_id: null,
    full_name: 'Dr. Marcus Vance, Ph.D.',
    title: 'Senior Urban Forestry & Arboriculture Pathologist',
    specialization: 'arborist',
    bio: '22 years specializing in temperate hardwood decline, microbial fungal inoculation, and municipal canopy resilience against severe drought stress.',
    years_experience: 22,
    certifications: ['ISA Board Certified Master Arborist (BCMA)', 'ASCA Registered Consulting Arborist'],
    hourly_rate: 85,
    currency: 'USD',
    availability: 'consultation_available',
    location_name: 'Portland, OR & Remote Consultation',
    remote_available: true,
    verification_status: 'verified',
    rating: 4.96,
    reviews_count: 42,
    is_bookmarked: false,
    created_at: '2026-10-01T00:00:00Z'
  },
  {
    id: 'exp-2',
    user_id: null,
    full_name: 'Sarita Chen, M.Sc.',
    title: 'Riparian Wetland Restoration & Soil Biologist',
    specialization: 'ecologist',
    bio: 'Designs bio-engineered stream embankments, willow live-staking corridors, and native sedge filtration systems for agricultural runoff buffering.',
    years_experience: 14,
    certifications: ['Society for Ecological Restoration (CERP)', 'Certified Wetland Specialist (PWS)'],
    hourly_rate: 65,
    currency: 'USD',
    availability: 'consultation_available',
    location_name: 'Vancouver, BC / Remote',
    remote_available: true,
    verification_status: 'verified',
    rating: 4.92,
    reviews_count: 28,
    is_bookmarked: true,
    created_at: '2026-10-15T00:00:00Z'
  },
  {
    id: 'exp-3',
    user_id: null,
    full_name: 'Devon Gallagher',
    title: 'GIS Remote Sensing & Canopy Carbon Modeler',
    specialization: 'gis_remote_sensing',
    bio: 'Transforms drone LiDAR and multi-spectral satellite passes into centimeter-accurate biometric point clouds to verify carbon biomass gains.',
    years_experience: 8,
    certifications: ['GISP Certified Professional', 'FAA Part 107 Remote Pilot'],
    hourly_rate: 0, // Pro-bono community support
    currency: 'USD',
    availability: 'limited',
    location_name: 'Seattle, WA / Fully Remote',
    remote_available: true,
    verification_status: 'verified',
    rating: 5.0,
    reviews_count: 17,
    is_bookmarked: false,
    created_at: '2026-11-01T00:00:00Z'
  }
];

// In-Memory Fallback State (Simulates real database writes when offline or unmigrated)
let localGigs: GreenGig[] = [...INITIAL_GIGS];
let localGigApplications: GigApplication[] = [];
let localBounties: GreenBounty[] = [...INITIAL_BOUNTIES];
let localBountySubmissions: BountySubmission[] = [];
let localOpportunities: GreenOpportunity[] = [...INITIAL_OPPORTUNITIES];
let localMarketplace: MarketplaceListing[] = [...INITIAL_MARKETPLACE];
let localMarketplaceInquiries: MarketplaceInquiry[] = [];
let localExperts: GreenExpertProfile[] = [...INITIAL_EXPERTS];
let localExpertInquiries: ExpertInquiry[] = [];

let localWallets: Record<string, UserWallet> = {
  'demo-user': {
    user_id: 'demo-user',
    green_points_balance: 340,
    total_points_earned: 490,
    total_points_redeemed: 150,
    pending_points: 60,
    currency: 'VERD_PTS',
    is_locked: false,
    last_activity_at: new Date().toISOString()
  }
};

let localTransactions: WalletTransaction[] = [
  {
    id: 'tx-1',
    user_id: 'demo-user',
    transaction_type: 'welcome_bonus',
    amount: 100,
    status: 'completed',
    reference_id: 'reg-welcome',
    reference_type: 'onboarding',
    description: 'Welcome Bonus for joining Greenverse environmental action',
    balance_after: 100,
    audit_hash: '0x8f2d...3a1c',
    created_at: '2026-11-01T12:00:00Z'
  },
  {
    id: 'tx-2',
    user_id: 'demo-user',
    transaction_type: 'tree_planting',
    amount: 150,
    status: 'completed',
    reference_id: 'tree-cedar-104',
    reference_type: 'tree',
    description: 'Verified registration and planting of Western Red Cedar #TR-8821',
    balance_after: 250,
    audit_hash: '0x4c9e...77ab',
    created_at: '2026-11-10T15:30:00Z'
  },
  {
    id: 'tx-3',
    user_id: 'demo-user',
    transaction_type: 'bounty_reward',
    amount: 90,
    status: 'completed',
    reference_id: 'bounty-1',
    reference_type: 'bounty',
    description: 'Approved completion of Creek Litter Hotspot Cleanup (Zone 4)',
    balance_after: 340,
    audit_hash: '0x1a8b...99cd',
    created_at: '2026-11-18T10:15:00Z'
  }
];

let localSkillProfiles: Record<string, UserSkillProfile> = {
  'demo-user': {
    user_id: 'demo-user',
    full_name: 'Greenverse Pioneer',
    headline: 'Ecology Enthusiast & Urban Forest Volunteer',
    bio: 'Passionate about restoring riparian tree buffers, community composting, and documenting local biodiversity hotspots.',
    experience_level: 'intermediate',
    availability: 'weekends',
    preferred_job_type: 'hybrid',
    skills: ['Tree planting', 'Soil preparation', 'GIS & mapping', 'Community outreach', 'Photography'],
    interests: ['Urban Forestry', 'Wetland Restoration', 'Soil Micro-Biology', 'Permaculture'],
    certifications: ['Greenverse Verified Planter', 'Leave No Trace Awareness'],
    location_city: 'Portland',
    location_country: 'United States',
    is_public: true,
    updated_at: new Date().toISOString()
  }
};

let localReputations: Record<string, UserReputation> = {
  'demo-user': {
    user_id: 'demo-user',
    reputation_score: 88,
    reputation_tier: 'Forest Steward',
    trees_planted_verified: 7,
    bounties_completed: 3,
    challenges_won: 2,
    volunteer_hours_logged: 24.5,
    projects_supported: 4,
    last_calculated_at: new Date().toISOString()
  }
};

let localReputationLogs: ReputationActivityLog[] = [
  {
    id: 'rep-1',
    user_id: 'demo-user',
    activity_type: 'tree_verification',
    title: 'Multi-spectral Satellite verification of juvenile Western Red Cedar #TR-8821',
    score_awarded: 25,
    is_verified: true,
    verification_source: 'satellite_mrv',
    created_at: '2026-11-10T16:00:00Z'
  },
  {
    id: 'rep-2',
    user_id: 'demo-user',
    activity_type: 'bounty_approval',
    title: 'Completed Creek Stream Bank Cleanup (Zone 4) audit approved by squad lead',
    score_awarded: 20,
    is_verified: true,
    verification_source: 'bounty_reviewer',
    created_at: '2026-11-18T11:00:00Z'
  },
  {
    id: 'rep-3',
    user_id: 'demo-user',
    activity_type: 'volunteer_shift',
    title: 'Logged 4.5 hours of volunteer soil preparation at East District Community Hub',
    score_awarded: 15,
    is_verified: true,
    verification_source: 'lead_organizer',
    created_at: '2026-11-20T17:30:00Z'
  }
];

let localBadges: UserBadge[] = [
  {
    id: 'badge-1',
    user_id: 'demo-user',
    badge_key: 'first_tree',
    badge_name: 'Planetary Planter',
    badge_icon: 'Sprout',
    badge_description: 'Planted and verified your first registered tree in the Greenverse ecosystem.',
    awarded_at: '2026-11-05T09:00:00Z'
  },
  {
    id: 'badge-2',
    user_id: 'demo-user',
    badge_key: 'bounty_hunter',
    badge_name: 'Bounty Crusader',
    badge_icon: 'ShieldCheck',
    badge_description: 'Completed 3 field restoration bounties with verified photographic evidence.',
    awarded_at: '2026-11-18T12:00:00Z'
  },
  {
    id: 'badge-3',
    user_id: 'demo-user',
    badge_key: 'community_guardian',
    badge_name: 'Community Guardian',
    badge_icon: 'Award',
    badge_description: 'Logged over 20 volunteer hours across accredited environmental squads.',
    awarded_at: '2026-11-21T18:00:00Z'
  }
];

// ==============================================================================
// 1. GREEN GIGS SERVICE
// ==============================================================================

export async function fetchGigs(options?: {
  search?: string;
  category?: string;
  compensationType?: string;
  jobType?: string;
  locationType?: string;
}): Promise<GreenGig[]> {
  try {
    let query = supabase.from('gigs').select('*').order('created_at', { ascending: false });

    if (options?.category && options.category !== 'all') {
      query = query.eq('category', options.category);
    }
    if (options?.compensationType && options.compensationType !== 'all') {
      query = query.eq('compensation_type', options.compensationType);
    }
    if (options?.jobType && options.jobType !== 'all') {
      query = query.eq('job_type', options.jobType);
    }
    if (options?.locationType && options.locationType !== 'all') {
      query = query.eq('location_type', options.locationType);
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      throw error || new Error('No DB data');
    }

    let results = data as GreenGig[];
    if (options?.search) {
      const term = options.search.toLowerCase();
      results = results.filter(
        g => g.title.toLowerCase().includes(term) || g.description.toLowerCase().includes(term) || g.employer_name.toLowerCase().includes(term)
      );
    }
    return results;
  } catch {
    // Fallback to local cache
    let results = [...localGigs];
    if (options?.category && options.category !== 'all') {
      results = results.filter(g => g.category === options.category);
    }
    if (options?.compensationType && options.compensationType !== 'all') {
      results = results.filter(g => g.compensation_type === options.compensationType);
    }
    if (options?.jobType && options.jobType !== 'all') {
      results = results.filter(g => g.job_type === options.jobType);
    }
    if (options?.locationType && options.locationType !== 'all') {
      results = results.filter(g => g.location_type === options.locationType);
    }
    if (options?.search) {
      const term = options.search.toLowerCase();
      results = results.filter(
        g => g.title.toLowerCase().includes(term) || g.description.toLowerCase().includes(term) || g.employer_name.toLowerCase().includes(term)
      );
    }
    return results;
  }
}

export async function createGig(gig: Partial<GreenGig>, userId?: string, userName?: string): Promise<GreenGig> {
  const newGig: GreenGig = {
    id: `gig-${Date.now()}`,
    employer_id: userId || null,
    employer_name: userName || 'Environmental Organizer',
    title: gig.title || 'Untitled Gig',
    category: gig.category || 'tree_planting_restoration',
    compensation_type: gig.compensation_type || 'paid',
    compensation_amount: Number(gig.compensation_amount) || 0,
    compensation_currency: gig.compensation_currency || 'USD',
    compensation_frequency: gig.compensation_frequency || 'project',
    job_type: gig.job_type || 'contract',
    location_type: gig.location_type || 'on_site',
    location_name: gig.location_name || '',
    deadline: gig.deadline,
    status: 'open',
    description: gig.description || '',
    responsibilities: gig.responsibilities || [],
    requirements: gig.requirements || [],
    required_skills: gig.required_skills || [],
    project_id: gig.project_id || null,
    applications_count: 0,
    created_at: new Date().toISOString()
  };

  try {
    const { data, error } = await supabase.from('gigs').insert([newGig]).select().single();
    if (!error && data) {
      localGigs.unshift(data);
      return data;
    }
  } catch {
    // continue to local fallback
  }

  localGigs.unshift(newGig);
  return newGig;
}

export async function applyForGig(
  gigId: string,
  application: {
    applicant_name: string;
    applicant_email: string;
    experience_summary: string;
    portfolio_url?: string;
    skills: string[];
    cover_note?: string;
  },
  userId?: string
): Promise<GigApplication> {
  const newApp: GigApplication = {
    id: `app-${Date.now()}`,
    gig_id: gigId,
    applicant_id: userId || `anon-${Date.now()}`,
    applicant_name: application.applicant_name,
    applicant_email: application.applicant_email,
    experience_summary: application.experience_summary,
    portfolio_url: application.portfolio_url,
    skills: application.skills,
    cover_note: application.cover_note,
    status: 'submitted',
    created_at: new Date().toISOString()
  };

  try {
    await supabase.from('gig_applications').insert([newApp]);
  } catch {
    // local fallback
  }

  localGigApplications.push(newApp);
  const gigIndex = localGigs.findIndex(g => g.id === gigId);
  if (gigIndex >= 0) {
    localGigs[gigIndex].applications_count = (localGigs[gigIndex].applications_count || 0) + 1;
  }
  return newApp;
}

export async function toggleBookmarkGig(gigId: string): Promise<boolean> {
  const gig = localGigs.find(g => g.id === gigId);
  if (gig) {
    gig.is_bookmarked = !gig.is_bookmarked;
    return gig.is_bookmarked;
  }
  return false;
}

// ==============================================================================
// 2. GREEN BOUNTIES SERVICE
// ==============================================================================

export async function fetchBounties(category?: string): Promise<GreenBounty[]> {
  try {
    let query = supabase.from('bounties').select('*').order('created_at', { ascending: false });
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    const { data, error } = await query;
    if (error || !data || data.length === 0) throw error;
    return data as GreenBounty[];
  } catch {
    let results = [...localBounties];
    if (category && category !== 'all') {
      results = results.filter(b => b.category === category);
    }
    return results;
  }
}

export async function claimBounty(bountyId: string, userId?: string, userName?: string): Promise<boolean> {
  const bounty = localBounties.find(b => b.id === bountyId);
  if (!bounty) return false;

  bounty.spots_claimed = (bounty.spots_claimed || 0) + 1;
  bounty.is_claimed_by_user = true;

  try {
    await supabase.from('bounty_claims').insert([
      {
        bounty_id: bountyId,
        user_id: userId,
        user_name: userName || 'Volunteer'
      }
    ]);
  } catch {
    // fallback
  }
  return true;
}

export async function submitBountyEvidence(
  bountyId: string,
  evidence: {
    evidence_text: string;
    evidence_url?: string;
    location_evidence?: string;
  },
  userId?: string,
  userName?: string
): Promise<BountySubmission> {
  const submission: BountySubmission = {
    id: `sub-${Date.now()}`,
    bounty_id: bountyId,
    user_id: userId || 'demo-user',
    user_name: userName || 'Field Volunteer',
    evidence_text: evidence.evidence_text,
    evidence_url: evidence.evidence_url,
    location_evidence: evidence.location_evidence,
    status: 'under_review',
    reward_issued: false,
    submitted_at: new Date().toISOString()
  };

  try {
    await supabase.from('bounty_submissions').insert([submission]);
  } catch {
    // fallback
  }

  localBountySubmissions.push(submission);
  const bounty = localBounties.find(b => b.id === bountyId);
  if (bounty) {
    bounty.user_submission = submission;
  }
  return submission;
}

export async function reviewBountySubmission(
  submissionId: string,
  decision: 'approved' | 'rejected',
  notes: string,
  reviewerId?: string
): Promise<boolean> {
  const sub = localBountySubmissions.find(s => s.id === submissionId);
  if (!sub) return false;

  sub.status = decision;
  sub.reviewer_notes = notes;
  sub.reviewer_id = reviewerId || 'admin';
  sub.reviewed_at = new Date().toISOString();

  if (decision === 'approved' && !sub.reward_issued) {
    sub.reward_issued = true;
    const bounty = localBounties.find(b => b.id === sub.bounty_id);
    if (bounty) {
      bounty.spots_completed = (bounty.spots_completed || 0) + 1;
      // Award Green Points into user wallet
      await awardWalletPoints(sub.user_id, bounty.reward_value, `Bounty reward: ${bounty.title}`, bounty.id, 'bounty');
    }
  }
  return true;
}

// ==============================================================================
// 3. GREEN OPPORTUNITIES SERVICE
// ==============================================================================

export async function fetchOpportunities(type?: string, search?: string): Promise<GreenOpportunity[]> {
  try {
    let query = supabase.from('opportunities').select('*').order('created_at', { ascending: false });
    if (type && type !== 'all') {
      query = query.eq('opportunity_type', type);
    }
    const { data, error } = await query;
    if (error || !data || data.length === 0) throw error;
    let list = data as GreenOpportunity[];
    if (search) {
      const term = search.toLowerCase();
      list = list.filter(o => o.title.toLowerCase().includes(term) || o.organization_name.toLowerCase().includes(term) || o.description.toLowerCase().includes(term));
    }
    return list;
  } catch {
    let list = [...localOpportunities];
    if (type && type !== 'all') {
      list = list.filter(o => o.opportunity_type === type);
    }
    if (search) {
      const term = search.toLowerCase();
      list = list.filter(o => o.title.toLowerCase().includes(term) || o.organization_name.toLowerCase().includes(term) || o.description.toLowerCase().includes(term));
    }
    return list;
  }
}

export async function toggleBookmarkOpportunity(oppId: string): Promise<boolean> {
  const opp = localOpportunities.find(o => o.id === oppId);
  if (opp) {
    opp.is_bookmarked = !opp.is_bookmarked;
    opp.bookmarks_count = Math.max(0, (opp.bookmarks_count || 0) + (opp.is_bookmarked ? 1 : -1));
    return opp.is_bookmarked;
  }
  return false;
}

export async function trackOpportunityApplication(oppId: string, status: 'interested' | 'applied' | 'interviewing' | 'accepted' | 'declined'): Promise<boolean> {
  const opp = localOpportunities.find(o => o.id === oppId);
  if (opp) {
    opp.user_application_status = status;
    return true;
  }
  return false;
}

export async function reportOpportunity(oppId: string, reason: string, details: string, reporterId?: string): Promise<boolean> {
  try {
    await supabase.from('opportunity_reports').insert([{
      opportunity_id: oppId,
      reporter_id: reporterId,
      reason,
      details
    }]);
  } catch {
    // fallback
  }
  return true;
}

// ==============================================================================
// 4. GREEN WALLET & AUDITABLE LEDGER SERVICE
// ==============================================================================

export async function fetchUserWallet(userId: string = 'demo-user'): Promise<UserWallet> {
  try {
    const { data, error } = await supabase.from('user_wallets').select('*').eq('user_id', userId).single();
    if (!error && data) return data as UserWallet;
  } catch {
    // fallback
  }

  if (!localWallets[userId]) {
    localWallets[userId] = {
      user_id: userId,
      green_points_balance: 100,
      total_points_earned: 100,
      total_points_redeemed: 0,
      pending_points: 0,
      currency: 'VERD_PTS',
      is_locked: false,
      last_activity_at: new Date().toISOString()
    };
  }
  return localWallets[userId];
}

export async function fetchWalletTransactions(userId: string = 'demo-user'): Promise<WalletTransaction[]> {
  try {
    const { data, error } = await supabase.from('wallet_transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (!error && data && data.length > 0) return data as WalletTransaction[];
  } catch {
    // fallback
  }
  return localTransactions.filter(tx => tx.user_id === userId || userId === 'demo-user');
}

/**
 * Awards green points to a user's wallet.
 * 
 * SECURITY NOTICE:
 * In production Supabase schemas (Migration 05), direct client writes to `user_wallets`
 * and `wallet_transactions` are rejected by RLS (Row Level Security). Points are issued
 * securely on the backend via the `award_green_points()` SECURITY DEFINER function or
 * database triggers. If direct client writes are rejected by RLS, this function logs a
 * warning and records the credit in local memory so the user interface remains responsive.
 */
export async function awardWalletPoints(
  userId: string,
  points: number,
  description: string,
  referenceId?: string,
  referenceType?: string
): Promise<WalletTransaction> {
  const wallet = await fetchUserWallet(userId);
  const newBalance = wallet.green_points_balance + points;

  wallet.green_points_balance = newBalance;
  wallet.total_points_earned += points;
  wallet.last_activity_at = new Date().toISOString();

  const newTx: WalletTransaction = {
    id: `tx-${Date.now()}`,
    user_id: userId,
    transaction_type: referenceType === 'bounty' ? 'bounty_reward' : 'adjustment',
    amount: points,
    status: 'completed',
    reference_id: referenceId,
    reference_type: referenceType,
    description,
    balance_after: newBalance,
    audit_hash: `0x${Math.random().toString(16).substring(2, 8)}...${Date.now().toString(16).substring(4)}`,
    created_at: new Date().toISOString()
  };

  localTransactions.unshift(newTx);

  try {
    const { error: walletErr } = await supabase.from('user_wallets').upsert([wallet]);
    if (walletErr) {
      console.warn('[Greenverse Economy] Direct wallet write blocked by RLS as intended. Points must be awarded via backend trigger or service_role.', walletErr.message);
    }
    const { error: txErr } = await supabase.from('wallet_transactions').insert([newTx]);
    if (txErr) {
      console.warn('[Greenverse Economy] Direct transaction insert blocked by RLS as intended.', txErr.message);
    }
  } catch (err) {
    console.warn('[Greenverse Economy] Wallet sync fallback to local memory state.', err);
  }

  return newTx;
}

export async function redeemPointsOption(userId: string, optionId: string): Promise<{ success: boolean; message: string }> {
  const option = INITIAL_REDEMPTIONS.find(r => r.id === optionId);
  if (!option) return { success: false, message: 'Invalid redemption option.' };

  const wallet = await fetchUserWallet(userId);
  if (wallet.green_points_balance < option.points_cost) {
    return { success: false, message: `Insufficient points. You need ${option.points_cost} points (Balance: ${wallet.green_points_balance}).` };
  }

  wallet.green_points_balance -= option.points_cost;
  wallet.total_points_redeemed += option.points_cost;
  wallet.last_activity_at = new Date().toISOString();

  const newTx: WalletTransaction = {
    id: `tx-${Date.now()}`,
    user_id: userId,
    transaction_type: 'redemption',
    amount: -option.points_cost,
    status: 'completed',
    reference_id: option.id,
    reference_type: 'redemption',
    description: `Redeemed: ${option.name}`,
    balance_after: wallet.green_points_balance,
    audit_hash: `0x${Math.random().toString(16).substring(2, 8)}...red`,
    created_at: new Date().toISOString()
  };

  localTransactions.unshift(newTx);

  try {
    await supabase.from('user_wallets').upsert([wallet]);
    await supabase.from('wallet_transactions').insert([newTx]);
    await supabase.from('wallet_redemptions').insert([{
      user_id: userId,
      reward_item_id: option.id,
      reward_name: option.name,
      category: option.category,
      points_cost: option.points_cost,
      status: 'processing'
    }]);
  } catch {
    // fallback
  }

  return { success: true, message: `Redeemed ${option.name}! Details and voucher certificate logged in your wallet.` };
}

// ==============================================================================
// 5. SKILLS PROFILE & MATCHING SERVICE
// ==============================================================================

export async function fetchUserSkillProfile(userId: string = 'demo-user'): Promise<UserSkillProfile> {
  try {
    const { data, error } = await supabase.from('user_skill_profiles').select('*').eq('user_id', userId).single();
    if (!error && data) return data as UserSkillProfile;
  } catch {
    // fallback
  }

  if (!localSkillProfiles[userId]) {
    localSkillProfiles[userId] = {
      user_id: userId,
      full_name: 'Environmental Practitioner',
      experience_level: 'intermediate',
      availability: 'flexible',
      preferred_job_type: 'remote',
      skills: ['Tree planting', 'Soil preparation', 'GIS & mapping'],
      interests: ['Forestry', 'Ecology'],
      certifications: ['Greenverse Contributor'],
      is_public: true,
      updated_at: new Date().toISOString()
    };
  }
  return localSkillProfiles[userId];
}

export async function saveUserSkillProfile(profile: Partial<UserSkillProfile>, userId: string = 'demo-user'): Promise<UserSkillProfile> {
  const existing = await fetchUserSkillProfile(userId);
  const updated: UserSkillProfile = {
    ...existing,
    ...profile,
    user_id: userId,
    updated_at: new Date().toISOString()
  };

  localSkillProfiles[userId] = updated;

  try {
    await supabase.from('user_skill_profiles').upsert([updated]);
  } catch {
    // fallback
  }

  return updated;
}

export function calculateSkillMatches(profile: UserSkillProfile, gigs: GreenGig[], opportunities: GreenOpportunity[]): SkillMatchResult[] {
  const userSkillsSet = new Set(profile.skills.map(s => s.toLowerCase()));
  const results: SkillMatchResult[] = [];

  // Match Gigs
  for (const gig of gigs) {
    const required = gig.required_skills || [];
    const matched = required.filter(s => userSkillsSet.has(s.toLowerCase()));
    const missing = required.filter(s => !userSkillsSet.has(s.toLowerCase()));

    let score = required.length > 0 ? Math.round((matched.length / required.length) * 70) : 50;

    // Bonus for location preference match
    const reasons: string[] = [];
    if (matched.length > 0) {
      reasons.push(`${matched.length} of ${required.length} required skills matched (${matched.join(', ')})`);
    }
    if (profile.preferred_job_type === gig.location_type || gig.location_type === 'remote') {
      score += 20;
      reasons.push(`Matches your ${profile.preferred_job_type} work preference`);
    }
    if (profile.availability === 'full_time' && gig.job_type === 'full_time') {
      score += 10;
      reasons.push('Full-time schedule alignment');
    }

    const finalScore = Math.min(100, Math.max(25, score));
    results.push({
      target_id: gig.id,
      target_title: gig.title,
      target_type: 'gig',
      match_percentage: finalScore,
      matched_skills: matched,
      missing_skills: missing,
      matching_reasons: reasons,
      recommendation: missing.length > 0
        ? `Develop or log experience in: ${missing.join(', ')} to boost alignment.`
        : 'Strong alignment with your recorded skills and work profile.'
    });
  }

  // Match Opportunities
  for (const opp of opportunities) {
    const required = opp.required_skills || [];
    const matched = required.filter(s => userSkillsSet.has(s.toLowerCase()));
    const missing = required.filter(s => !userSkillsSet.has(s.toLowerCase()));
    const score = required.length > 0 ? Math.round((matched.length / required.length) * 80) : 60;

    results.push({
      target_id: opp.id,
      target_title: opp.title,
      target_type: 'opportunity',
      match_percentage: Math.min(100, Math.max(30, score)),
      matched_skills: matched,
      missing_skills: missing,
      matching_reasons: [
        `${matched.length} skills matched (${matched.join(', ') || 'General profile'})`,
        `Program aligns with your environmental interests`
      ],
      recommendation: missing.length > 0 ? `Recommended training in ${missing.join(', ')}` : 'Ideal application opportunity.'
    });
  }

  return results.sort((a, b) => b.match_percentage - a.match_percentage);
}

// ==============================================================================
// 6. GREEN REPUTATION & CONTRIBUTION SERVICE
// ==============================================================================

export async function fetchUserReputation(userId: string = 'demo-user'): Promise<UserReputation> {
  try {
    const { data, error } = await supabase.from('user_reputations').select('*').eq('user_id', userId).single();
    if (!error && data) return data as UserReputation;
  } catch {
    // fallback
  }

  if (!localReputations[userId]) {
    localReputations[userId] = {
      user_id: userId,
      reputation_score: 75,
      reputation_tier: 'Seedling Contributor',
      trees_planted_verified: 2,
      bounties_completed: 1,
      challenges_won: 0,
      volunteer_hours_logged: 8,
      projects_supported: 1,
      last_calculated_at: new Date().toISOString()
    };
  }
  return localReputations[userId];
}

export async function fetchReputationActivities(userId: string = 'demo-user'): Promise<ReputationActivityLog[]> {
  try {
    const { data, error } = await supabase.from('reputation_activity_logs').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (!error && data && data.length > 0) return data as ReputationActivityLog[];
  } catch {
    // fallback
  }
  return localReputationLogs.filter(r => r.user_id === userId || userId === 'demo-user');
}

export async function fetchUserBadges(userId: string = 'demo-user'): Promise<UserBadge[]> {
  try {
    const { data, error } = await supabase.from('user_badges').select('*').eq('user_id', userId);
    if (!error && data && data.length > 0) return data as UserBadge[];
  } catch {
    // fallback
  }
  return localBadges.filter(b => b.user_id === userId || userId === 'demo-user');
}

// ==============================================================================
// 7. GREEN MARKETPLACE SERVICE
// ==============================================================================

export async function fetchMarketplaceListings(options?: {
  category?: string;
  listingType?: string;
  search?: string;
}): Promise<MarketplaceListing[]> {
  try {
    let query = supabase.from('marketplace_listings').select('*').eq('status', 'available').order('created_at', { ascending: false });
    if (options?.category && options.category !== 'all') {
      query = query.eq('category', options.category);
    }
    if (options?.listingType && options.listingType !== 'all') {
      query = query.eq('listing_type', options.listingType);
    }
    const { data, error } = await query;
    if (error || !data || data.length === 0) throw error;
    let list = data as MarketplaceListing[];
    if (options?.search) {
      const term = options.search.toLowerCase();
      list = list.filter(i => i.title.toLowerCase().includes(term) || i.description.toLowerCase().includes(term));
    }
    return list;
  } catch {
    let list = localMarketplace.filter(m => m.status === 'available');
    if (options?.category && options.category !== 'all') {
      list = list.filter(i => i.category === options.category);
    }
    if (options?.listingType && options.listingType !== 'all') {
      list = list.filter(i => i.listing_type === options.listingType);
    }
    if (options?.search) {
      const term = options.search.toLowerCase();
      list = list.filter(i => i.title.toLowerCase().includes(term) || i.description.toLowerCase().includes(term));
    }
    return list;
  }
}

export async function createMarketplaceListing(listing: Partial<MarketplaceListing>, userId?: string, userName?: string): Promise<MarketplaceListing> {
  const newListing: MarketplaceListing = {
    id: `item-${Date.now()}`,
    seller_id: userId || null,
    seller_name: userName || 'Local Community Member',
    title: listing.title || 'Untitled Item',
    category: listing.category || 'plants_seedlings',
    listing_type: listing.listing_type || 'for_sale',
    item_condition: listing.item_condition || 'new',
    price: Number(listing.price) || 0,
    currency: listing.currency || 'USD',
    exchange_preference: listing.exchange_preference,
    description: listing.description || '',
    image_url: listing.image_url || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80',
    location_region: listing.location_region || 'Local Community',
    status: 'available',
    bookmarks_count: 0,
    inquiries_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  try {
    const { data, error } = await supabase.from('marketplace_listings').insert([newListing]).select().single();
    if (!error && data) {
      localMarketplace.unshift(data);
      return data;
    }
  } catch {
    // fallback
  }

  localMarketplace.unshift(newListing);
  return newListing;
}

export async function sendMarketplaceInquiry(listingId: string, message: string, buyerName: string, buyerId?: string): Promise<boolean> {
  const inquiry: MarketplaceInquiry = {
    id: `inq-${Date.now()}`,
    listing_id: listingId,
    buyer_id: buyerId || null,
    buyer_name: buyerName,
    message,
    status: 'pending',
    created_at: new Date().toISOString()
  };

  localMarketplaceInquiries.push(inquiry);
  const item = localMarketplace.find(i => i.id === listingId);
  if (item) {
    item.inquiries_count = (item.inquiries_count || 0) + 1;
  }

  try {
    await supabase.from('marketplace_inquiries').insert([inquiry]);
  } catch {
    // fallback
  }

  return true;
}

export async function toggleBookmarkListing(listingId: string): Promise<boolean> {
  const item = localMarketplace.find(i => i.id === listingId);
  if (item) {
    item.is_bookmarked = !item.is_bookmarked;
    item.bookmarks_count = Math.max(0, (item.bookmarks_count || 0) + (item.is_bookmarked ? 1 : -1));
    return item.is_bookmarked;
  }
  return false;
}

// ==============================================================================
// 8. GREEN EXPERT FINDER SERVICE
// ==============================================================================

export async function fetchExpertProfiles(specialization?: string, search?: string): Promise<GreenExpertProfile[]> {
  try {
    let query = supabase.from('expert_profiles').select('*').order('rating', { ascending: false });
    if (specialization && specialization !== 'all') {
      query = query.eq('specialization', specialization);
    }
    const { data, error } = await query;
    if (error || !data || data.length === 0) throw error;
    let list = data as GreenExpertProfile[];
    if (search) {
      const term = search.toLowerCase();
      list = list.filter(e => e.full_name.toLowerCase().includes(term) || e.bio.toLowerCase().includes(term) || e.title.toLowerCase().includes(term));
    }
    return list;
  } catch {
    let list = [...localExperts];
    if (specialization && specialization !== 'all') {
      list = list.filter(e => e.specialization === specialization);
    }
    if (search) {
      const term = search.toLowerCase();
      list = list.filter(e => e.full_name.toLowerCase().includes(term) || e.bio.toLowerCase().includes(term) || e.title.toLowerCase().includes(term));
    }
    return list;
  }
}

export async function sendExpertInquiry(
  expertId: string,
  inquiry: {
    sender_name: string;
    sender_email: string;
    topic: string;
    message: string;
    preferred_date?: string;
  },
  senderId?: string
): Promise<boolean> {
  const newInq: ExpertInquiry = {
    id: `expinq-${Date.now()}`,
    expert_id: expertId,
    sender_id: senderId || null,
    sender_name: inquiry.sender_name,
    sender_email: inquiry.sender_email,
    topic: inquiry.topic,
    message: inquiry.message,
    preferred_date: inquiry.preferred_date,
    status: 'pending',
    created_at: new Date().toISOString()
  };

  localExpertInquiries.push(newInq);

  try {
    await supabase.from('expert_inquiries').insert([newInq]);
  } catch {
    // fallback
  }

  return true;
}

export async function toggleBookmarkExpert(expertId: string): Promise<boolean> {
  const exp = localExperts.find(e => e.id === expertId);
  if (exp) {
    exp.is_bookmarked = !exp.is_bookmarked;
    return exp.is_bookmarked;
  }
  return false;
}
