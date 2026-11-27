// Greenverse Batch 2: Smart Planting Intelligence Types

export interface PlantIdentificationResult {
  identified: boolean;
  commonName: string;
  scientificName: string;
  family: string;
  category: string;
  confidenceLevel: 'High' | 'Moderate' | 'Low';
  confidenceScore: number;
  confidenceExplanation: string;
  observableCharacteristics: string[];
  alternativeSpecies: Array<{
    commonName: string;
    scientificName: string;
    distinction: string;
  }>;
  careOverview: {
    sunlight: string;
    watering: string;
    soil: string;
    hardinessZones?: string;
    summary: string;
  };
}

export interface PlantDiagnosisResult {
  plantIdentified: string;
  primaryIssue: string;
  category: string;
  severity: 'Mild' | 'Moderate' | 'Severe';
  confidence: 'High' | 'Moderate' | 'Low';
  visibleEvidence: string[];
  otherPlausibleCauses: string[];
  immediateActions: string[];
  treatmentRecommendations: string[];
  preventionAdvice: string[];
  monitoringGuidance: string;
  disclaimer: string;
}

export interface PlantCarePlanResult {
  plantName: string;
  careSummary: string;
  watering: {
    frequency: string;
    guidance: string;
    weatherAdjustment: string;
  };
  sunlight: {
    requirement: string;
    hoursPerDay: string;
    guidance: string;
  };
  soil: {
    type: string;
    phRange: string;
    drainage: string;
    fertilizer: string;
  };
  temperatureAndHumidity: {
    idealTempRange: string;
    frostTolerance: string;
    humidity: string;
  };
  maintenance: {
    pruning: string;
    repotting: string;
    growthRate: string;
  };
  seasonalCalendar: {
    spring: string;
    summer: string;
    autumn: string;
    winter: string;
  };
  commonMistakes: string[];
  alerts: string[];
}

export interface PerenualSpeciesItem {
  id: number;
  common_name: string;
  scientific_name: string[];
  other_name?: string[];
  cycle?: string;
  watering?: string;
  sunlight?: string[];
  default_image?: {
    license?: number;
    license_name?: string;
    license_url?: string;
    original_url?: string;
    regular_url?: string;
    medium_url?: string;
    small_url?: string;
    thumbnail?: string;
  } | null;
}

export interface PerenualSpeciesListResponse {
  data: PerenualSpeciesItem[];
  to?: number;
  per_page?: number;
  current_page?: number;
  from?: number;
  last_page?: number;
  total?: number;
}

export interface PerenualSpeciesDetails {
  id: number;
  common_name: string;
  scientific_name: string[];
  other_name?: string[];
  family?: string;
  origin?: string[];
  type?: string;
  dimension?: string;
  cycle?: string;
  watering?: string;
  watering_period?: string;
  watering_general_benchmark?: {
    value: string;
    unit: string;
  };
  sunlight?: string[];
  pruning_month?: string[];
  attracts?: string[];
  propagation?: string[];
  hardiness?: {
    min: string;
    max: string;
  };
  growth_rate?: string;
  maintenance?: string;
  care_level?: string;
  medicinal?: boolean;
  poisonous_to_humans?: number;
  poisonous_to_pets?: number;
  description?: string;
  default_image?: {
    regular_url?: string;
    thumbnail?: string;
  } | null;
}

export interface OpenMeteoWeatherResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature?: number;
    precipitation: number;
    rain?: number;
    weather_code: number;
    wind_speed_10m: number;
    soil_temperature_0cm?: number;
  };
  daily?: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    precipitation_probability_max?: number[];
    weather_code: number[];
  };
}

export interface DbUserPlant {
  id: string;
  user_id: string;
  common_name: string;
  scientific_name?: string | null;
  family?: string | null;
  category?: string;
  location_type: 'Indoor' | 'Outdoor' | 'Balcony' | 'Greenhouse' | 'Garden Bed';
  photo_url?: string | null;
  perenual_species_id?: string | null;
  planting_date: string;
  care_status: 'Healthy' | 'Needs Attention' | 'Critical' | 'Dormant' | 'Harvested';
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbPlantFavorite {
  id: string;
  user_id: string;
  species_id: string;
  common_name: string;
  scientific_name?: string | null;
  thumbnail_url?: string | null;
  source: 'perenual' | 'native_catalog' | 'custom';
  created_at: string;
}

export interface DbPlantCarePlan {
  id: string;
  user_id: string;
  plant_id?: string | null;
  plant_name: string;
  scientific_name?: string | null;
  watering_schedule: any;
  sunlight_guidance: any;
  soil_fertilizer_guidance: any;
  seasonal_tasks: any;
  care_summary?: string | null;
  full_plan_json: PlantCarePlanResult;
  created_at: string;
  updated_at: string;
}

export interface DbPlantDiagnosis {
  id: string;
  user_id: string;
  plant_id?: string | null;
  plant_name: string;
  photo_url?: string | null;
  symptoms: string[];
  observations?: string | null;
  primary_issue: string;
  category: string;
  severity: 'Mild' | 'Moderate' | 'Severe';
  confidence: 'High' | 'Moderate' | 'Low';
  treatment_recommendations: string[];
  prevention_advice: string[];
  full_diagnosis_json: PlantDiagnosisResult;
  status: 'active' | 'resolved' | 'monitoring';
  created_at: string;
}

export interface DbCalendarEvent {
  id: string;
  user_id: string;
  plant_id?: string | null;
  title: string;
  event_category: 'Sowing' | 'Seed Starting' | 'Planting' | 'Transplanting' | 'Watering' | 'Fertilizing' | 'Pruning' | 'Harvesting' | 'Pest Check' | 'Custom';
  event_date: string;
  notes?: string | null;
  is_completed: boolean;
  reminder_enabled: boolean;
  created_at: string;
  updated_at: string;
}
