// Greenverse Batch 2: Smart Planting Intelligence Domain Types

export type SunlightCondition = 'Full Sun' | 'Partial Shade' | 'Full Shade';
export type SoilType = 'Loam' | 'Clay' | 'Sandy' | 'Silty' | 'Chalky' | 'Peaty' | 'Rocky';
export type SoilCondition = 'Rich / Humus' | 'Compacted / Poor' | 'Well Drained' | 'Rocky' | 'Waterlogged';
export type WaterAvailability = 'Automated Irrigation' | 'Periodic Manual Hose' | 'Rainfall Only' | 'Seasonal Drought Prone';
export type InfrastructureProximity = 'Clear Open Area' | 'Near Building (<3m)' | 'Under Overhead Cables' | 'Near Pavement / Curb' | 'Near Underground Pipes';

export interface SiteAssessmentInput {
  site_name: string;
  location_name: string;
  latitude?: number | null;
  longitude?: number | null;
  space_width_m: number;
  space_length_m: number;
  sunlight: SunlightCondition;
  soil_type: SoilType;
  soil_condition: SoilCondition;
  water_availability: WaterAvailability;
  infrastructure: InfrastructureProximity[];
  notes?: string;
}

export interface SiteAssessmentResult {
  suitabilityScore: number; // 0-100
  rating: 'Optimal' | 'Favorable' | 'Challenging' | 'High Risk';
  strengths: string[];
  concerns: string[];
  recommendations: string[];
  recommendedHabit: string;
  usableAreaSqm: number;
}

export interface DbSiteAssessment {
  id: string;
  user_id: string | null;
  site_name: string;
  location_name: string;
  latitude: number | null;
  longitude: number | null;
  space_sqm: number;
  sunlight: string;
  soil_type: string;
  soil_condition: string;
  water_availability: string;
  infrastructure_notes: string | null;
  suitability_score: number;
  assessment_result: SiteAssessmentResult;
  created_at: string;
}

export interface GreenDeficitInput {
  area_name: string;
  total_area_sqm: number;
  current_canopy_pct: number;
  target_canopy_pct?: number; // defaults to 30% WHO standard
  location_type: 'Urban Core' | 'Suburban Residential' | 'Industrial Park' | 'School / Campus' | 'River Corridor';
  population_density: 'High' | 'Medium' | 'Low';
}

export interface GreenDeficitResult {
  deficitScore: number; // 0-100 (0 = thriving, 100 = extreme deficit)
  priorityLevel: 'Critical' | 'High' | 'Moderate' | 'Low';
  deficitCanopySqm: number;
  estimatedTreesNeeded: number;
  lostCarbonCapacityKgYear: number;
  heatIslandRiskIndex: number; // 1-10
  priorityZones: string[];
  recommendations: string[];
  isEstimate: boolean;
}

export interface DbGreenDeficitEvaluation {
  id: string;
  user_id: string | null;
  area_name: string;
  total_area_sqm: number;
  existing_canopy_pct: number;
  target_canopy_pct: number;
  deficit_score: number;
  priority_level: string;
  recommendations: GreenDeficitResult;
  created_at: string;
}

export interface PlantSpecies {
  id: string;
  commonName: string;
  scientificName: string;
  family: string;
  biomes: string[];
  nativeRegions: string[];
  hardinessZones: string[];
  minTempC: number;
  maxTempC: number;
  minAnnualRainfallMm: number;
  maxAnnualRainfallMm: number;
  soilPreferences: SoilType[];
  sunlightRequirement: SunlightCondition | 'Any';
  waterNeed: 'Low' | 'Moderate' | 'High' | 'Very High';
  droughtTolerance: 'Low' | 'Moderate' | 'High' | 'Extreme';
  matureHeightM: number;
  matureSpreadM: number;
  recommendedSpacingM: number;
  growthRate: 'Slow' | 'Moderate' | 'Fast' | 'Rapid';
  maintenanceLevel: 'Low' | 'Moderate' | 'High';
  carbonKgPerYear: number;
  ecologicalBenefits: string[];
  pollinatorFriendly: boolean;
  birdFriendly: boolean;
  floweringSeason: 'Spring' | 'Summer' | 'Autumn' | 'Winter' | 'Multi-season';
  canopyLayer: 'Overstory Canopy' | 'Sub-canopy Understory' | 'Shrub Layer' | 'Herbaceous Ground';
  rootSystem: 'Deep Taproot' | 'Spreading Fibrous' | 'Moderate Lateral' | 'Shallow Spreading';
  urbanTolerance: 'Low' | 'Moderate' | 'High';
  potentialRisks: string[];
  imageUrl: string;
}

export interface SpeciesMatchCriteria {
  region?: string;
  sunlight?: SunlightCondition;
  soilType?: SoilType;
  waterAvailability?: WaterAvailability;
  maxHeightM?: number;
  nativeOnly?: boolean;
  pollinatorOnly?: boolean;
}

export interface SpeciesMatchResult {
  species: PlantSpecies;
  matchScore: number; // 0-100
  reasons: string[];
  drawbacks: string[];
}

export interface ClimateSuitabilityInput {
  speciesId: string;
  hardinessZone?: string;
  summerMaxTempC: number;
  winterMinTempC: number;
  annualRainfallMm: number;
  hasIrrigation: boolean;
  droughtSeverity: 'None' | 'Mild' | 'Moderate' | 'Severe';
}

export interface ClimateSuitabilityResult {
  score: number; // 0-100
  verdict: 'Excellent Adaptation' | 'Suitable with Care' | 'Marginal / Stressed' | 'High Risk of Mortality';
  tempCompatibility: 'Optimal' | 'Tolerable' | 'Too Hot' | 'Too Cold';
  waterCompatibility: 'Adequate' | 'Deficit / Needs Irrigation' | 'Excess / Risk of Root Rot';
  droughtVulnerability: 'Resilient' | 'Moderate Concern' | 'Severe Risk';
  warnings: string[];
  recommendations: string[];
}

export interface SpacingLayoutInput {
  speciesId: string;
  areaLengthM: number;
  areaWidthM: number;
  layoutPattern: 'Square Grid' | 'Staggered Triangle' | 'Miyawaki High-Density' | 'Hedgerow Corridor';
  customSpacingM?: number;
  targetQuantity?: number;
}

export interface SpacingLayoutResult {
  recommendedSpacingM: number;
  maxSafeQuantity: number;
  suggestedQuantity: number;
  rowsCount: number;
  colsCount: number;
  totalAreaSqm: number;
  effectiveCanopyCoverPct: number;
  yearsToFullCanopy: number;
  overcrowdingWarning: boolean;
  clearanceWarnings: string[];
  recommendations: string[];
  gridCoordinates: Array<{ x: number; y: number; r: number }>;
}

export interface BiodiversityPlanInput {
  plotSizeSqm: number;
  selectedSpeciesIds: string[];
  targetObjective: 'Maximum Pollinators' | 'Balanced Native Woodland' | 'Urban Wildlife Haven' | 'Dense Miyawaki Pocket';
}

export interface BiodiversityPlanResult {
  biodiversityScore: number; // 0-100
  rating: 'Exemplary Polyculture' | 'Good Diversity' | 'Limited Diversity' | 'Monoculture Risk';
  speciesCount: number;
  familyCount: number;
  layerCoverage: {
    canopy: boolean;
    subCanopy: boolean;
    shrub: boolean;
    ground: boolean;
  };
  pollinatorSupportScore: number;
  birdHabitatScore: number;
  continuousBloomSequence: string[];
  compliance10_20_30: boolean; // No >10% single species, 20% single genus, 30% family
  strengths: string[];
  improvements: string[];
}

export interface PlantingRiskInput {
  soilType: SoilType;
  soilCondition: SoilCondition;
  waterAvailability: WaterAvailability;
  sunlight: SunlightCondition;
  summerMaxTempC: number;
  winterMinTempC: number;
  areaSqm: number;
  infrastructure: InfrastructureProximity[];
  selectedSpeciesIds: string[];
  drainageIssue: boolean;
}

export interface RiskItem {
  category: 'Water Shortage' | 'Poor Soil' | 'Excessive Heat' | 'Shade Mismatch' | 'Space Constraint' | 'Root Conflict' | 'Flooding / Drainage' | 'Species Mismatch';
  severity: 'Low' | 'Moderate' | 'High' | 'Severe';
  explanation: string;
  mitigation: string;
}

export interface PlantingRiskResult {
  overallReadinessScore: number; // 0-100 (100 = safe to plant)
  overallRiskLevel: 'Low' | 'Moderate' | 'High' | 'Severe';
  risks: RiskItem[];
  criticalCount: number;
  summaryRecommendation: string;
}

export interface PlantingCalendarMonth {
  month: string;
  season: 'Spring' | 'Summer' | 'Autumn' | 'Winter';
  plantingTasks: string[];
  wateringGuidelines: string;
  soilAndMulchTasks: string[];
  pruningAndCare: string[];
  isOptimalPlantingSeason: boolean;
}

export interface DbPlantingPlan {
  id: string;
  user_id: string | null;
  plan_name: string;
  location_name: string;
  selected_species: any[];
  total_area_sqm: number;
  total_plants: number;
  layout_type: string;
  biodiversity_score: number;
  climate_suitability_score: number;
  risk_score: number;
  status: 'draft' | 'active' | 'archived';
  created_at: string;
  updated_at: string;
}

// ==========================================
// BATCH 2 SPECIFIC DOMAIN EXTENSIONS
// ==========================================

export interface WeatherDataState {
  isConfigured: boolean;
  provider: string;
  temperatureC: number | null;
  rainfallMm: number | null;
  humidityPct: number | null;
  weatherCondition: string | null;
  plantingSuitabilityInsight: string;
  dataSourceNotice: string;
}

export interface SoilCompatibilityAnalysis {
  selectedSoilType: SoilType;
  selectedSoilCondition: SoilCondition;
  drainageRate: 'Fast / Excessive' | 'Moderate / Ideal' | 'Slow / Prone to Pooling';
  compactionRisk: 'High' | 'Moderate' | 'Low';
  suitableSpecies: PlantSpecies[];
  scientificExplanation: string;
  amendmentRecommendations: string[];
}

export interface WateringRecommendation {
  speciesId: string;
  speciesName: string;
  baseWeeklyLiters: number;
  adjustedWeeklyLiters: number;
  wateringFrequency: string;
  isWeatherInformed: boolean;
  guidanceType: 'Standard Botanical Baseline' | 'Live Weather Adjusted';
  notes: string[];
}

export interface DbWateringLog {
  id: string;
  user_id: string | null;
  species_id: string;
  species_name: string;
  watered_date: string;
  amount_liters: number;
  method: 'Hose' | 'Drip Line' | 'Bucket' | 'Rainfall';
  notes?: string;
  created_at: string;
}

export interface SunlightComparisonAnalysis {
  locationSunlight: SunlightCondition;
  speciesRequirement: SunlightCondition | 'Any';
  compatibilityStatus: 'Optimal' | 'Tolerable' | 'Incompatible';
  dailySunlightHoursEstimated: string;
  analysisExplanation: string;
  leafImpactWarning?: string;
}

export interface NativePlantFilterOptions {
  selectedRegion: string;
  ecologicalRole?: string;
  minPollinatorValue?: boolean;
}

export interface SmartAssistantQuery {
  locationName: string;
  climateZone?: string;
  soilType: SoilType;
  soilCondition: SoilCondition;
  sunlight: SunlightCondition;
  waterAvailability: WaterAvailability;
  targetObjective: 'Pollinator Support' | 'Drought Resilience' | 'Max Carbon Sequestration' | 'Shade & Cooling';
}

export interface SmartAssistantReport {
  recommendedSpecies: PlantSpecies[];
  primaryStrengths: string[];
  ecologicalWarnings: string[];
  wateringAdvice: string;
  soilPreparationTip: string;
  seasonalCalendarHighlight: string;
  confidenceNotice: string;
}
