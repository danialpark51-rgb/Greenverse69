import {
  TreeRecord,
  PlantingSite,
  GreenMission,
  CommunityActivity,
  DiagnosticRecord,
  HeritageTree,
  Squad,
  GreenOpportunity,
  EnvironmentalProject,
  MarketplaceItem,
  ImpactAudit,
  WalletTransaction
} from '../types';

export const METRIC_STATS = [
  {
    id: 'm1',
    title: 'Trees Registered',
    value: '428,950',
    change: '+18.4%',
    isPositive: true,
    timeframe: 'vs last month',
    icon: 'Trees',
    accent: 'forest' as const,
  },
  {
    id: 'm2',
    title: 'Satellite Verified Trees',
    value: '381,240',
    change: '+24.1%',
    isPositive: true,
    timeframe: '91.8% verification rate',
    icon: 'ShieldCheck',
    accent: 'emerald' as const,
  },
  {
    id: 'm3',
    title: 'Active Restoration Projects',
    value: '64',
    change: '+7 new',
    isPositive: true,
    timeframe: 'across 18 eco-zones',
    icon: 'Sprout',
    accent: 'sage' as const,
  },
  {
    id: 'm4',
    title: 'Green Opportunities Open',
    value: '138',
    change: '32 closing soon',
    isPositive: true,
    timeframe: 'stipends & full-time',
    icon: 'Briefcase',
    accent: 'lime' as const,
  },
];

export const MOCK_TREES: TreeRecord[] = [
  {
    id: 't-101',
    treeCode: 'GV-OAK-9821',
    species: 'Bur Oak',
    scientificName: 'Quercus macrocarpa',
    plantedDate: '2024-04-12',
    plantedBy: 'Elena Rostova (Valley Rewilders)',
    location: {
      lat: 44.9778,
      lng: -93.2650,
      region: 'Upper Mississippi Watershed',
      siteName: 'Cedar Bend Urban Canopy Phase II'
    },
    ageMonths: 28,
    heightMeters: 3.4,
    dbhCm: 8.6,
    healthScore: 94,
    survivalProbability: 97.2,
    status: 'thriving',
    verificationStatus: 'satellite_verified',
    carbonOffsetKg: 58.4,
    moistureLevel: 68,
    lastInspected: '2026-11-18',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=GV-OAK-9821',
    imageUrl: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=600&q=80',
    notes: 'Exceptional deep root anchoring. Native mycorrhizal inoculum applied at planting.'
  },
  {
    id: 't-102',
    treeCode: 'GV-MAN-4019',
    species: 'Red Mangrove',
    scientificName: 'Rhizophora mangle',
    plantedDate: '2025-02-04',
    plantedBy: 'Salish Sea Coastal Squad',
    location: {
      lat: 25.7617,
      lng: -80.1918,
      region: 'Biscayne Coastal Biosphere',
      siteName: 'Pelican Shoals Estuary'
    },
    ageMonths: 18,
    heightMeters: 1.8,
    dbhCm: 4.2,
    healthScore: 89,
    survivalProbability: 93.5,
    status: 'thriving',
    verificationStatus: 'drone_verified',
    carbonOffsetKg: 84.1,
    moistureLevel: 94,
    lastInspected: '2026-11-20',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=GV-MAN-4019',
    imageUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=600&q=80',
    notes: 'Prop roots expanding rapidly. Salinity resilience verified.'
  },
  {
    id: 't-103',
    treeCode: 'GV-CED-1104',
    species: 'Western Red Cedar',
    scientificName: 'Thuja plicata',
    plantedDate: '2023-10-15',
    plantedBy: 'Pacific Canopy Alliance',
    location: {
      lat: 47.6062,
      lng: -122.3321,
      region: 'Cascadia Old Growth Buffer',
      siteName: 'Skykomish River Corridor'
    },
    ageMonths: 34,
    heightMeters: 4.2,
    dbhCm: 11.2,
    healthScore: 78,
    survivalProbability: 84.0,
    status: 'attention_required',
    verificationStatus: 'field_audited',
    carbonOffsetKg: 92.6,
    moistureLevel: 42,
    lastInspected: '2026-11-22',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=GV-CED-1104',
    imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80',
    notes: 'Low soil moisture detected by edge IoT probe. Supplementary watering scheduled.'
  },
  {
    id: 't-104',
    treeCode: 'GV-PNE-6230',
    species: 'Longleaf Pine',
    scientificName: 'Pinus palustris',
    plantedDate: '2024-01-20',
    plantedBy: 'Piedmont Forest Collective',
    location: {
      lat: 33.7490,
      lng: -84.3880,
      region: 'Southeastern Coastal Plain',
      siteName: 'Pine Barrens Sanctuary'
    },
    ageMonths: 31,
    heightMeters: 2.9,
    dbhCm: 6.8,
    healthScore: 92,
    survivalProbability: 95.0,
    status: 'thriving',
    verificationStatus: 'satellite_verified',
    carbonOffsetKg: 46.2,
    moistureLevel: 58,
    lastInspected: '2026-11-15',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=GV-PNE-6230',
    imageUrl: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=600&q=80',
    notes: 'Healthy grass stage transitioned to active rocket stem elongation.'
  }
];

export const MOCK_SITES: PlantingSite[] = [
  {
    id: 'site-1',
    name: 'Cedar Bend Urban Canopy',
    biome: 'urban',
    location: 'Minneapolis, MN',
    coordinates: [44.9778, -93.2650],
    targetTrees: 5000,
    plantedTrees: 3840,
    suitableSpecies: ['Bur Oak', 'Hackberry', 'Basswood', 'Silver Maple'],
    soilType: 'Loamy Mollisol (pH 6.8)',
    rainfallAnnualMm: 820,
    biodiversityIndex: 8.4,
    status: 'active'
  },
  {
    id: 'site-2',
    name: 'Pelican Shoals Estuary',
    biome: 'mangrove',
    location: 'Biscayne Bay, FL',
    coordinates: [25.7617, -80.1918],
    targetTrees: 12000,
    plantedTrees: 9450,
    suitableSpecies: ['Red Mangrove', 'Black Mangrove', 'Buttonwood'],
    soilType: 'Hydric Marine Peat',
    rainfallAnnualMm: 1420,
    biodiversityIndex: 9.6,
    status: 'active'
  },
  {
    id: 'site-3',
    name: 'Skykomish Cascadia Buffer',
    biome: 'riparian',
    location: 'King County, WA',
    coordinates: [47.6062, -122.3321],
    targetTrees: 8000,
    plantedTrees: 6100,
    suitableSpecies: ['Western Red Cedar', 'Sitka Spruce', 'Bigleaf Maple'],
    soilType: 'Alluvial Gravelly Silt',
    rainfallAnnualMm: 1850,
    biodiversityIndex: 9.1,
    status: 'active'
  },
  {
    id: 'site-4',
    name: 'Appalachian Agro-Corridor',
    biome: 'agroforestry',
    location: 'Roanoke Valley, VA',
    coordinates: [37.2710, -79.9414],
    targetTrees: 15000,
    plantedTrees: 4200,
    suitableSpecies: ['American Chestnut Hybrid', 'Pawpaw', 'Black Walnut'],
    soilType: 'Deep Acidic Ultisol (pH 5.9)',
    rainfallAnnualMm: 1050,
    biodiversityIndex: 8.8,
    status: 'preparing'
  }
];

export const MOCK_MISSIONS: GreenMission[] = [
  {
    id: 'm-1',
    title: 'Riparian Willow Staking Expedition',
    description: 'Install live willow fascines and bio-logs to prevent riverbank erosion before spring melt.',
    squad: 'Cascadia Riverkeepers',
    location: 'Skykomish River Sector 4',
    targetTrees: 450,
    currentTrees: 320,
    date: 'Saturday, Nov 28, 2026',
    status: 'in_progress',
    rewardTokens: 120,
    volunteersJoined: 18,
    volunteersNeeded: 24,
    category: 'Reforestation'
  },
  {
    id: 'm-2',
    title: 'Biscayne Propagule Drop & Tagging',
    description: 'Plant verified red mangrove propagules and bind NFC digital passport tags.',
    squad: 'Mangrove Sentinel Squad',
    location: 'Pelican Shoals Marshland',
    targetTrees: 600,
    currentTrees: 150,
    date: 'Sunday, Nov 29, 2026',
    status: 'upcoming',
    rewardTokens: 150,
    volunteersJoined: 12,
    volunteersNeeded: 20,
    category: 'Sensor Deployment'
  },
  {
    id: 'm-3',
    title: 'Urban Heat Island Micro-Forest Planting',
    description: 'Miyawaki method dense planting to cool south-facing asphalt residential corridors.',
    squad: 'Urban Canopy Syndicate',
    location: 'Cedar Bend District 3',
    targetTrees: 300,
    currentTrees: 0,
    date: 'Saturday, Dec 5, 2026',
    status: 'upcoming',
    rewardTokens: 95,
    volunteersJoined: 34,
    volunteersNeeded: 40,
    category: 'Reforestation'
  },
  {
    id: 'm-4',
    title: 'Heritage Banyan Canopy Audit',
    description: 'Conduct acoustic tomography and drone lidar scans on 180-year-old coastal landmark trees.',
    squad: 'Ancient Tree Watch',
    location: 'St. Petersburg Historic Sector',
    targetTrees: 45,
    currentTrees: 45,
    date: 'Nov 20, 2026',
    status: 'completed',
    rewardTokens: 200,
    volunteersJoined: 15,
    volunteersNeeded: 15,
    category: 'Heritage Protection'
  }
];

export const MOCK_COMMUNITY_ACTIVITIES: CommunityActivity[] = [
  {
    id: 'ca-1',
    user: {
      name: 'Dr. Maeve Thorne',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      role: 'Lead Ecologist'
    },
    action: 'verified satellite telemetry for',
    target: '340 White Oaks in Cascadia Corridor',
    timestamp: '14 minutes ago',
    badge: 'Tier 1 MRV',
    iconName: 'ShieldCheck'
  },
  {
    id: 'ca-2',
    user: {
      name: 'Tariq Al-Mansoor',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
      role: 'Squad Ranger'
    },
    action: 'logged IoT sensor probe readings for',
    target: 'Skykomish Sector 2 Soil Moisture Array',
    timestamp: '42 minutes ago',
    iconName: 'Cpu'
  },
  {
    id: 'ca-3',
    user: {
      name: 'Elena Rostova',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80',
      role: 'Urban Planter'
    },
    action: 'planted and registered new digital twin',
    target: 'GV-OAK-9821 with NFC Tree Passport',
    timestamp: '2 hours ago',
    badge: 'Passport Minted',
    iconName: 'QrCode'
  },
  {
    id: 'ca-4',
    user: {
      name: 'BioCorridor Foundation',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
      role: 'Sponsor Org'
    },
    action: 'funded $14,500 milestone for',
    target: 'Appalachian Agro-Corridor Phase III',
    timestamp: '4 hours ago',
    iconName: 'Coins'
  }
];

export const MOCK_DIAGNOSTICS: DiagnosticRecord[] = [
  {
    id: 'diag-1',
    treeId: 'GV-CED-1104',
    species: 'Western Red Cedar',
    symptoms: ['Foliage flagging', 'Tip desiccation', 'Soil moisture below 45%'],
    diagnosis: 'Early Stage Heat Drought Stress + Secondary Cedar Bark Beetle Pressure',
    severity: 'moderate',
    confidence: 94.2,
    recommendedTreatment: 'Mulch collar expansion to 1.5m radius, mycorrhizal biostimulant soak, and deep root trickle irrigation.',
    prescribedBy: 'AI Agroforestry NeuralNet',
    date: '2026-11-21',
    status: 'under_treatment',
    treatmentProtocol: [
      'Apply 15 gallons of aerated compost tea with Glomus intraradices mycorrhizae.',
      'Deploy 4-inch cedar woodchip mulch away from root flair.',
      'Attach automated soil moisture solenoid at 25cm depth.',
      'Re-scan trunk foliage in 7 days.'
    ]
  },
  {
    id: 'diag-2',
    treeId: 'GV-OAK-8109',
    species: 'Bur Oak',
    symptoms: ['Vein necrosis on lower foliage', 'Leaf curling'],
    diagnosis: 'Bur Oak Blight (Tubakia iowensis)',
    severity: 'mild',
    confidence: 88.7,
    recommendedTreatment: 'Prune affected lower twigs during dormancy. Apply micro-injected propiconazole if defoliation exceeds 20%.',
    prescribedBy: 'Certified Arborist',
    date: '2026-11-14',
    status: 'resolved',
    treatmentProtocol: [
      'Collect and incinerate fallen infected leaves.',
      'Sterilize bypass pruners between each branch cut.',
      'Bio-fungicide copper soap preventative misting.'
    ]
  },
  {
    id: 'diag-3',
    treeId: 'GV-MAN-3088',
    species: 'Red Mangrove',
    symptoms: ['Yellow chlorosis on prop roots', 'Epiphyte overgrowth'],
    diagnosis: 'Algal Slime Silt Deposition due to Canal Runoff',
    severity: 'moderate',
    confidence: 91.0,
    recommendedTreatment: 'Install temporary silt silt-screen barrier, rinse root lenticels with brackish water jet.',
    prescribedBy: 'AI Agroforestry NeuralNet',
    date: '2026-11-19',
    status: 'under_treatment',
    treatmentProtocol: [
      'Clear sediment from aerial breathing lenticels.',
      'Coordinate municipal runoff filter inspection.'
    ]
  }
];

export const MOCK_HERITAGE_TREES: HeritageTree[] = [
  {
    id: 'ht-1',
    code: 'HT-OAK-1840',
    commonName: 'Council Sentinel Oak',
    scientificName: 'Quercus alba',
    estimatedAgeYears: 245,
    heightMeters: 28.5,
    canopySpreadMeters: 36.2,
    legalStatus: 'Municipal Heritage Landmark',
    riskScore: 24,
    lastPatrolDate: '2026-11-21',
    patrolSquad: 'Twin Cities Canopy Guardians',
    threats: ['Soil compaction from nearby pathway', 'Heavy snow branch load'],
    location: 'St. Anthony Falls Reserve, MN'
  },
  {
    id: 'ht-2',
    code: 'HT-BAN-1892',
    commonName: 'Grand Banyan of Tampa Bay',
    scientificName: 'Ficus benghalensis',
    estimatedAgeYears: 134,
    heightMeters: 22.0,
    canopySpreadMeters: 48.0,
    legalStatus: 'Endangered Canopy Act',
    riskScore: 58,
    lastPatrolDate: '2026-11-23',
    patrolSquad: 'Ancient Tree Watch',
    threats: ['Commercial zoning encroachment permit filed', 'Root disruption risk'],
    location: 'Pinellas Coastline, FL'
  },
  {
    id: 'ht-3',
    code: 'HT-RED-1680',
    commonName: 'Emerald Cathedral Redwood',
    scientificName: 'Sequoia sempervirens',
    estimatedAgeYears: 420,
    heightMeters: 62.4,
    canopySpreadMeters: 22.8,
    legalStatus: 'State Forest Reserve',
    riskScore: 12,
    lastPatrolDate: '2026-11-15',
    patrolSquad: 'Pacific Canopy Alliance',
    threats: ['Illegal drone disturbance', 'Unmonitored tourist foot traffic'],
    location: 'Humboldt Coastal Corridor, CA'
  }
];

export const MOCK_SQUADS: Squad[] = [
  {
    id: 'sq-1',
    name: 'Cascadia Canopy Guardians',
    tagline: 'Defending old-growth buffers and restoring salmon river corridors.',
    chapter: 'Pacific Northwest',
    membersCount: 428,
    treesPlanted: 54200,
    survivalRate: 94.6,
    rank: 1,
    badge: 'Diamond Forester',
    avatar: '🌲'
  },
  {
    id: 'sq-2',
    name: 'Mangrove Sentinel Squad',
    tagline: 'Coastal blue carbon restoration through tidal wetland planting.',
    chapter: 'South Florida & Caribbean',
    membersCount: 312,
    treesPlanted: 41800,
    survivalRate: 92.1,
    rank: 2,
    badge: 'Blue Carbon Champion',
    avatar: '🌊'
  },
  {
    id: 'sq-3',
    name: 'Midwest Rewilding Guild',
    tagline: 'Transforming industrial urban parcels into thriving Miyawaki forests.',
    chapter: 'Great Lakes Region',
    membersCount: 265,
    treesPlanted: 29500,
    survivalRate: 91.4,
    rank: 3,
    badge: 'Urban Micro-Forestry Leader',
    avatar: '🏙️'
  },
  {
    id: 'sq-4',
    name: 'Appalachian Restoration Collective',
    tagline: 'Replanting native hardwoods on historic mining and agricultural ridgelines.',
    chapter: 'Blue Ridge & Allegheny',
    membersCount: 198,
    treesPlanted: 22400,
    survivalRate: 89.8,
    rank: 4,
    badge: 'Montane Reforester',
    avatar: '⛰️'
  }
];

export const MOCK_OPPORTUNITIES: GreenOpportunity[] = [
  {
    id: 'opp-1',
    title: 'Senior Forest Lidar & Remote Sensing Specialist',
    organization: 'Earthshot Forestry Labs',
    type: 'Full-time',
    location: 'Seattle, WA (Hybrid)',
    isRemote: true,
    compensation: '$110,000 - $135,000 + Equity',
    tags: ['Drone Lidar', 'Python', 'MRV Verification', 'GIS'],
    deadline: 'Dec 15, 2026',
    description: 'Lead canopy biomass calculations from multispectral satellite passes and drone flights across 50,000+ hectares of rewilding corridors.',
    impactFocus: 'Planetary Biomass Accuracy'
  },
  {
    id: 'opp-2',
    title: 'Urban Agroforestry Field Coordinator',
    organization: 'Green Canopy Initiative',
    type: 'Full-time',
    location: 'Chicago, IL',
    isRemote: false,
    compensation: '$68,000 - $82,000',
    tags: ['Community Planting', 'Miyawaki Method', 'Soil Prep'],
    deadline: 'Dec 08, 2026',
    description: 'Coordinate volunteer squads, sapling distribution, and municipal permits for 15 upcoming micro-forests in high-density urban wards.',
    impactFocus: 'Urban Heat Island Mitigation'
  },
  {
    id: 'opp-3',
    title: 'Mycorrhizal Soil Inoculum Research Fellow',
    organization: 'Planetary Biosphere Institute',
    type: 'Research Fellowship',
    location: 'Fort Collins, CO',
    isRemote: false,
    compensation: '$52,000 / year stipend',
    tags: ['Soil Microbiology', 'Fungal Networks', 'Tree Survival'],
    deadline: 'Dec 22, 2026',
    description: 'Conduct field trials assessing symbiotic fungal inoculations in semi-arid drought reforestation plots.',
    impactFocus: 'Drought Survival Rates'
  },
  {
    id: 'opp-4',
    title: 'Tidal Blue Carbon Drone Pilot & Tagging Volunteer',
    organization: 'Coastal Mangrove Coalition',
    type: 'Volunteer Expedition',
    location: 'Key Largo, FL',
    isRemote: false,
    compensation: 'Travel + Housing + 500 $VERD',
    tags: ['FAA Part 107', 'Marine Biology', 'Weekend Field'],
    deadline: 'Nov 30, 2026',
    description: 'Join an all-hands 3-day field sprint planting and geo-tagging 3,000 red mangrove propagules with aerial mapping.',
    impactFocus: 'Coastline Buffer Stabilization'
  }
];

export const MOCK_PROJECTS: EnvironmentalProject[] = [
  {
    id: 'proj-1',
    title: 'Cascadia Salmon Canopy Corridor',
    subtitle: 'Re-establishing continuous shade along 42 miles of thermal-stressed spawning tributaries.',
    leadOrganization: 'Pacific Salmon & Old Growth Coalition',
    category: 'Rainforest Corridor',
    fundingGoal: 250000,
    raisedAmount: 198400,
    targetTrees: 45000,
    verifiedTonsCO2e: 12400,
    location: 'Snohomish & King Counties, WA',
    status: 'funding',
    daysLeft: 14,
    backersCount: 1420,
    imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'proj-2',
    title: 'Biscayne Bay Blue Carbon Estuary Shield',
    subtitle: 'Restoring hurricane-ravaged barrier mangroves with automated tidal moisture and salinity telemetry.',
    leadOrganization: 'Marine Biosphere Foundation',
    category: 'Coastal Mangrove',
    fundingGoal: 180000,
    raisedAmount: 165000,
    targetTrees: 35000,
    verifiedTonsCO2e: 18900,
    location: 'Biscayne Bay Aquatic Preserve, FL',
    status: 'funding',
    daysLeft: 9,
    backersCount: 980,
    imageUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'proj-3',
    title: 'Great Lakes Industrial Belt Urban Rewilding',
    subtitle: 'Planting 28 fast-growing native biodiverse micro-forests on reclaimed post-industrial plots.',
    leadOrganization: 'Urban Biome Syndicate',
    category: 'Micro-Forest Rewilding',
    fundingGoal: 120000,
    raisedAmount: 120000,
    targetTrees: 22000,
    verifiedTonsCO2e: 6800,
    location: 'Detroit & Cleveland Metro Corridors',
    status: 'execution',
    daysLeft: 0,
    backersCount: 1140,
    imageUrl: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=800&q=80'
  }
];

export const MOCK_MARKETPLACE: MarketplaceItem[] = [
  {
    id: 'prod-1',
    title: 'Heritage Bur Oak Certified Sapling (1.5m Bareroot)',
    category: 'Certified Native Saplings',
    priceVerd: 45,
    priceUsd: 22,
    rating: 4.9,
    reviewsCount: 184,
    inStock: true,
    carbonBadge: 'Est. 1.2t CO2 Lifetime',
    description: 'Genetically diverse, cold-hardy stock grown from local ecotype seed collections. Pre-inoculated with ectomycorrhizae.',
    imageUrl: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'prod-2',
    title: 'Bio-Mesh Long-Life Tree Guard (Pack of 10)',
    category: 'Protective Gear',
    priceVerd: 35,
    priceUsd: 18,
    rating: 4.8,
    reviewsCount: 92,
    inStock: true,
    carbonBadge: '100% Cornstarch Biopolymer',
    description: 'Protects young trees from rodents and mechanical line-trimmers. Degrades harmlessly into soil organic matter in 5 years.',
    imageUrl: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'prod-3',
    title: 'Greenverse TerraSense LoRaWAN Moisture & Temp Probe',
    category: 'IoT Sensors',
    priceVerd: 110,
    priceUsd: 65,
    rating: 4.95,
    reviewsCount: 310,
    inStock: true,
    carbonBadge: 'Solar & Kinetic Powered',
    description: 'Real-time telemetry broadcast to the Greenverse tree dashboard up to 8 miles away. Zero battery replacement required.',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'prod-4',
    title: 'SymbioGrow Forest Fungal Inoculum (2kg)',
    category: 'Soil Bio-Amendments',
    priceVerd: 28,
    priceUsd: 15,
    rating: 4.7,
    reviewsCount: 145,
    inStock: true,
    carbonBadge: '+38% 3-Year Survival Rate',
    description: 'Proprietary spore blend of 9 endo- and ecto-mycorrhizal fungal strains tailored for northern temperate hardwood saplings.',
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80'
  }
];

export const MOCK_IMPACT_AUDITS: ImpactAudit[] = [
  {
    id: 'ia-2026-q3',
    period: 'Q3 2026 Comprehensive Biosphere Audit',
    treesVerifiedCount: 381240,
    tonsCO2eSequestered: 24890,
    satelliteAuditDate: '2026-10-15',
    auditStandard: 'Verra VCS + CCB',
    auditorOrg: 'SCS Global Services & Planet Lidar Consortium',
    verificationReportHash: '0x8f4d92a11b6c72e90e7845ba01c899d2146f',
    biomassDensityTonsHa: 48.6
  },
  {
    id: 'ia-2026-q2',
    period: 'Q2 2026 Seasonal Survival Census',
    treesVerifiedCount: 324100,
    tonsCO2eSequestered: 19450,
    satelliteAuditDate: '2026-07-20',
    auditStandard: 'Gold Standard',
    auditorOrg: 'Earthshot Verification Council',
    verificationReportHash: '0x3c2a11e899b047120dfa542b890cc412351',
    biomassDensityTonsHa: 42.1
  }
];

export const MOCK_TRANSACTIONS: WalletTransaction[] = [
  {
    id: 'tx-901',
    type: 'carbon_credit_mint',
    description: 'Minted 4.2 Verified Carbon Credits from Q3 Audit',
    amount: 420,
    timestamp: 'Yesterday at 4:18 PM',
    status: 'confirmed',
    txHash: '0x9b4f...a231'
  },
  {
    id: 'tx-902',
    type: 'tree_survival_bonus',
    description: 'Year 2 Survival Milestone: Cascadia Plot 14 (96.4% survival rate)',
    amount: 150,
    timestamp: 'Nov 18, 2026',
    status: 'confirmed',
    txHash: '0x44a1...fe09'
  },
  {
    id: 'tx-903',
    type: 'earned_mission',
    description: 'Completed Mission: Riparian Willow Staking Expedition',
    amount: 120,
    timestamp: 'Nov 14, 2026',
    status: 'confirmed',
    txHash: '0x12c9...77b2'
  },
  {
    id: 'tx-904',
    type: 'marketplace_spent',
    description: 'Ordered: TerraSense LoRaWAN Moisture Probe x1',
    amount: -110,
    timestamp: 'Nov 09, 2026',
    status: 'confirmed',
    txHash: '0x88ea...0024'
  }
];
