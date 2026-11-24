// Greenverse Core Types

export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type VerificationStatus = 'unverified' | 'pending' | 'satellite_verified' | 'drone_verified' | 'field_audited';

export interface MetricCard {
  id: string;
  title: string;
  value: string | number;
  change: string;
  isPositive: boolean;
  timeframe: string;
  icon: string;
  accent: 'forest' | 'sage' | 'lime' | 'emerald';
}

export interface TreeRecord {
  id: string;
  treeCode: string;
  species: string;
  scientificName: string;
  plantedDate: string;
  plantedBy: string;
  location: {
    lat: number;
    lng: number;
    region: string;
    siteName: string;
  };
  ageMonths: number;
  heightMeters: number;
  dbhCm: number; // Diameter at Breast Height
  healthScore: number; // 0 - 100
  survivalProbability: number;
  status: 'thriving' | 'stable' | 'attention_required' | 'critical';
  verificationStatus: VerificationStatus;
  carbonOffsetKg: number;
  moistureLevel: number;
  lastInspected: string;
  qrCodeUrl: string;
  imageUrl: string;
  notes: string;
}

export interface PlantingSite {
  id: string;
  name: string;
  biome: 'urban' | 'mangrove' | 'boreal' | 'agroforestry' | 'riparian';
  location: string;
  coordinates: [number, number];
  targetTrees: number;
  plantedTrees: number;
  suitableSpecies: string[];
  soilType: string;
  rainfallAnnualMm: number;
  biodiversityIndex: number; // 0 - 10
  status: 'active' | 'preparing' | 'completed';
}

export interface GreenMission {
  id: string;
  title: string;
  description: string;
  squad: string;
  location: string;
  targetTrees: number;
  currentTrees: number;
  date: string;
  status: 'upcoming' | 'in_progress' | 'completed';
  rewardTokens: number;
  volunteersJoined: number;
  volunteersNeeded: number;
  category: 'Reforestation' | 'Care & Mulching' | 'Sensor Deployment' | 'Heritage Protection';
}

export interface CommunityActivity {
  id: string;
  user: {
    name: string;
    avatar: string;
    role: string;
  };
  action: string;
  target: string;
  timestamp: string;
  badge?: string;
  iconName: string;
}

export interface DiagnosticRecord {
  id: string;
  treeId: string;
  species: string;
  symptoms: string[];
  diagnosis: string;
  severity: 'mild' | 'moderate' | 'severe';
  confidence: number;
  recommendedTreatment: string;
  prescribedBy: 'AI Agroforestry NeuralNet' | 'Certified Arborist';
  date: string;
  status: 'resolved' | 'under_treatment' | 'quarantined';
  treatmentProtocol: string[];
}

export interface HeritageTree {
  id: string;
  code: string;
  commonName: string;
  scientificName: string;
  estimatedAgeYears: number;
  heightMeters: number;
  canopySpreadMeters: number;
  legalStatus: 'Municipal Heritage Landmark' | 'State Forest Reserve' | 'Endangered Canopy Act' | 'Private Sacred Grove';
  riskScore: number; // 0-100 (higher = at risk)
  lastPatrolDate: string;
  patrolSquad: string;
  threats: string[];
  location: string;
}

export interface Squad {
  id: string;
  name: string;
  tagline: string;
  chapter: string;
  membersCount: number;
  treesPlanted: number;
  survivalRate: number;
  rank: number;
  badge: string;
  avatar: string;
}

export interface GreenOpportunity {
  id: string;
  title: string;
  organization: string;
  type: 'Full-time' | 'Contract' | 'Research Fellowship' | 'Volunteer Expedition';
  location: string;
  isRemote: boolean;
  compensation: string;
  tags: string[];
  deadline: string;
  description: string;
  impactFocus: string;
}

export interface EnvironmentalProject {
  id: string;
  title: string;
  subtitle: string;
  leadOrganization: string;
  category: 'Coastal Mangrove' | 'Micro-Forest Rewilding' | 'Rainforest Corridor' | 'Dryland Agroforestry';
  fundingGoal: number;
  raisedAmount: number;
  targetTrees: number;
  verifiedTonsCO2e: number;
  location: string;
  status: 'funding' | 'execution' | 'verified';
  daysLeft: number;
  backersCount: number;
  imageUrl: string;
}

export interface MarketplaceItem {
  id: string;
  title: string;
  category: 'Certified Native Saplings' | 'Soil Bio-Amendments' | 'IoT Sensors' | 'Protective Gear';
  priceVerd: number;
  priceUsd: number;
  rating: number;
  reviewsCount: number;
  inStock: boolean;
  carbonBadge: string;
  description: string;
  imageUrl: string;
}

export interface ImpactAudit {
  id: string;
  period: string;
  treesVerifiedCount: number;
  tonsCO2eSequestered: number;
  satelliteAuditDate: string;
  auditStandard: 'Verra VCS + CCB' | 'Gold Standard' | 'Plan Vivo Foundation' | 'Greenverse MRV 2.4';
  auditorOrg: string;
  verificationReportHash: string;
  biomassDensityTonsHa: number;
}

export interface WalletTransaction {
  id: string;
  type: 'earned_mission' | 'tree_survival_bonus' | 'carbon_credit_mint' | 'marketplace_spent' | 'donation';
  description: string;
  amount: number;
  timestamp: string;
  status: 'confirmed' | 'processing';
  txHash: string;
}
