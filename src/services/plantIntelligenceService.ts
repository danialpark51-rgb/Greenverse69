import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  PlantIdentificationResult,
  PlantDiagnosisResult,
  PlantCarePlanResult,
  PerenualSpeciesListResponse,
  PerenualSpeciesDetails,
  OpenMeteoWeatherResponse,
  DbUserPlant,
  DbPlantFavorite,
  DbPlantCarePlan,
  DbPlantDiagnosis,
  DbCalendarEvent,
} from '../types/plantIntelligence';

// =============================================================================
// CACHE IMPLEMENTATION (In-Memory for Rate Limiting & Fast Access)
// =============================================================================

const weatherCache = new Map<string, { data: OpenMeteoWeatherResponse; timestamp: number }>();
const perenualSearchCache = new Map<string, { data: PerenualSpeciesListResponse; timestamp: number }>();
const perenualDetailsCache = new Map<string, { data: PerenualSpeciesDetails; timestamp: number }>();

const CACHE_TTL_WEATHER = 15 * 60 * 1000; // 15 mins
const CACHE_TTL_PERENUAL = 60 * 60 * 1000; // 1 hour

// In-memory fallback stores when Supabase DB migrations have not yet run
let localUserPlants: DbUserPlant[] = [];
let localPlantFavorites: DbPlantFavorite[] = [];
let localPlantCarePlans: DbPlantCarePlan[] = [];
let localPlantDiagnoses: DbPlantDiagnosis[] = [];
let localCalendarEvents: DbCalendarEvent[] = [];

// =============================================================================
// 1. AI PLANT IDENTIFICATION (Via Edge Function)
// =============================================================================

export async function identifyPlantWithAI(
  imageBase64: string,
  mimeType: string = 'image/jpeg'
): Promise<{ success: boolean; data?: PlantIdentificationResult; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('plant-intelligence', {
      body: {
        action: 'identify',
        imageBase64,
        mimeType,
      },
    });

    if (error) {
      console.warn('[plantIntelligenceService] Edge function identify error:', error);
      return { success: false, error: error.message || 'Edge function invocation error.' };
    }

    if (data?.error) {
      return { success: false, error: data.error };
    }

    if (data?.data) {
      return { success: true, data: data.data as PlantIdentificationResult };
    }

    return { success: false, error: 'Unexpected response from AI identification service.' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error calling plant identification.' };
  }
}

// =============================================================================
// 2. AI PLANT DISEASE & HEALTH DIAGNOSIS (Via Edge Function)
// =============================================================================

export async function diagnosePlantHealthWithAI(params: {
  imageBase64?: string;
  mimeType?: string;
  plantName?: string;
  symptoms?: string[];
  observations?: string;
}): Promise<{ success: boolean; data?: PlantDiagnosisResult; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('plant-intelligence', {
      body: {
        action: 'diagnose',
        imageBase64: params.imageBase64,
        mimeType: params.mimeType || 'image/jpeg',
        plantName: params.plantName,
        symptoms: params.symptoms || [],
        observations: params.observations || '',
      },
    });

    if (error) {
      console.warn('[plantIntelligenceService] Edge function diagnose error:', error);
      return { success: false, error: error.message || 'Edge function diagnosis invocation error.' };
    }

    if (data?.error) {
      return { success: false, error: data.error };
    }

    if (data?.data) {
      return { success: true, data: data.data as PlantDiagnosisResult };
    }

    return { success: false, error: 'Unexpected response from AI diagnosis service.' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error calling disease diagnosis.' };
  }
}

// =============================================================================
// 3. SMART PLANT CARE ADVISOR (Via Edge Function)
// =============================================================================

export async function generatePlantCarePlanWithAI(params: {
  plantName: string;
  scientificName?: string;
  location?: string;
  weatherContext?: any;
  indoorOutdoor?: 'Indoor' | 'Outdoor' | 'Balcony' | 'Greenhouse';
  userNotes?: string;
}): Promise<{ success: boolean; data?: PlantCarePlanResult; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('plant-intelligence', {
      body: {
        action: 'care-advice',
        plantName: params.plantName,
        scientificName: params.scientificName,
        location: params.location,
        weatherContext: params.weatherContext,
        indoorOutdoor: params.indoorOutdoor || 'Outdoor',
        userNotes: params.userNotes || '',
      },
    });

    if (error) {
      console.warn('[plantIntelligenceService] Edge function care plan error:', error);
      return { success: false, error: error.message || 'Edge function care plan invocation error.' };
    }

    if (data?.error) {
      return { success: false, error: data.error };
    }

    if (data?.data) {
      return { success: true, data: data.data as PlantCarePlanResult };
    }

    return { success: false, error: 'Unexpected response from care advisor service.' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error calling care advisor.' };
  }
}

// =============================================================================
// 4. PERENUAL PLANT DATABASE (Via Edge Function Proxy)
// =============================================================================

export async function searchPerenualSpecies(params: {
  q?: string;
  page?: number;
  edible?: boolean;
  poisonous?: boolean;
  cycle?: string;
  watering?: string;
  sunlight?: string;
  indoor?: boolean;
}): Promise<{ success: boolean; data?: PerenualSpeciesListResponse; error?: string }> {
  const cacheKey = JSON.stringify(params);
  const cached = perenualSearchCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_PERENUAL) {
    return { success: true, data: cached.data };
  }

  try {
    const { data, error } = await supabase.functions.invoke('plant-intelligence', {
      body: {
        action: 'perenual-search',
        ...params,
      },
    });

    if (error) {
      console.warn('[plantIntelligenceService] Perenual search error:', error);
      return { success: false, error: error.message || 'Failed to search plant database.' };
    }

    if (data?.error) {
      return { success: false, error: data.error };
    }

    if (data?.data) {
      perenualSearchCache.set(cacheKey, { data: data.data, timestamp: Date.now() });
      return { success: true, data: data.data };
    }

    return { success: false, error: 'Empty response from plant encyclopedia.' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error querying Perenual API.' };
  }
}

export async function fetchPerenualSpeciesDetails(
  speciesId: number | string
): Promise<{ success: boolean; data?: PerenualSpeciesDetails; error?: string }> {
  const cacheKey = String(speciesId);
  const cached = perenualDetailsCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_PERENUAL) {
    return { success: true, data: cached.data };
  }

  try {
    const { data, error } = await supabase.functions.invoke('plant-intelligence', {
      body: {
        action: 'perenual-details',
        id: speciesId,
      },
    });

    if (error) {
      console.warn('[plantIntelligenceService] Perenual details error:', error);
      return { success: false, error: error.message || 'Failed to fetch species details.' };
    }

    if (data?.error) {
      return { success: false, error: data.error };
    }

    if (data?.data) {
      perenualDetailsCache.set(cacheKey, { data: data.data, timestamp: Date.now() });
      return { success: true, data: data.data };
    }

    return { success: false, error: 'Empty details received from plant encyclopedia.' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error querying plant details.' };
  }
}

// =============================================================================
// 5. OPEN-METEO WEATHER API (Client-side Direct — No Key Required)
// =============================================================================

export async function fetchWeatherFromOpenMeteo(
  lat: number,
  lon: number
): Promise<{ success: boolean; data?: OpenMeteoWeatherResponse; error?: string }> {
  const cacheKey = `${lat.toFixed(2)},${lon.toFixed(2)}`;
  const cached = weatherCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_WEATHER) {
    return { success: true, data: cached.data };
  }

  try {
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.set('latitude', String(lat));
    url.searchParams.set('longitude', String(lon));
    url.searchParams.set(
      'current',
      'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m,soil_temperature_0cm'
    );
    url.searchParams.set(
      'daily',
      'temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,weather_code'
    );
    url.searchParams.set('timezone', 'auto');

    const res = await fetch(url.toString());
    if (!res.ok) {
      return { success: false, error: `Open-Meteo returned status ${res.status}` };
    }

    const data: OpenMeteoWeatherResponse = await res.json();
    weatherCache.set(cacheKey, { data, timestamp: Date.now() });
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error querying Open-Meteo.' };
  }
}

// Open-Meteo WMO Weather Code Interpreter
export function interpretWeatherCode(code: number): { condition: string; icon: string; severity: 'normal' | 'caution' | 'warning' } {
  switch (code) {
    case 0:
      return { condition: 'Clear sky', icon: 'Sun', severity: 'normal' };
    case 1:
    case 2:
    case 3:
      return { condition: 'Mainly clear to overcast', icon: 'CloudSun', severity: 'normal' };
    case 45:
    case 48:
      return { condition: 'Fog or depositing rime fog', icon: 'CloudFog', severity: 'caution' };
    case 51:
    case 53:
    case 55:
      return { condition: 'Drizzle', icon: 'CloudDrizzle', severity: 'normal' };
    case 61:
    case 63:
    case 65:
      return { condition: 'Rain (Slight to Heavy)', icon: 'CloudRain', severity: 'caution' };
    case 71:
    case 73:
    case 75:
      return { condition: 'Snowfall (Slight to Heavy)', icon: 'Snowflake', severity: 'warning' };
    case 80:
    case 81:
    case 82:
      return { condition: 'Rain showers', icon: 'CloudRain', severity: 'caution' };
    case 95:
    case 96:
    case 99:
      return { condition: 'Thunderstorm with Hail risk', icon: 'CloudLightning', severity: 'warning' };
    default:
      return { condition: 'Variable conditions', icon: 'Cloud', severity: 'normal' };
  }
}

// Contextual Planting Advice derived strictly from real weather measurements
export function generateWeatherPlantingAdvice(weather: OpenMeteoWeatherResponse) {
  const currentTemp = weather.current.temperature_2m;
  const precip = weather.current.precipitation || weather.current.rain || 0;
  const wind = weather.current.wind_speed_10m;
  const humidity = weather.current.relative_humidity_2m;
  const soilTemp = weather.current.soil_temperature_0cm;

  const alerts: string[] = [];
  const plantingSuitability: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Hazardous' = (() => {
    if (currentTemp <= 0 || wind > 50) return 'Hazardous';
    if (currentTemp < 5 || currentTemp > 35 || precip > 10) return 'Poor';
    if (currentTemp < 10 || currentTemp > 30 || wind > 30) return 'Fair';
    if (currentTemp >= 15 && currentTemp <= 26 && precip < 2 && wind < 20) return 'Excellent';
    return 'Good';
  })();

  if (currentTemp <= 2) {
    alerts.push('Frost Risk Alert: Ground frost likely. Cover tender foliage or relocate container plants indoors.');
  }
  if (currentTemp >= 33) {
    alerts.push('Heat Stress Warning: High ambient temperatures. Delay bare-root planting and provide afternoon shade.');
  }
  if (wind >= 35) {
    alerts.push('Strong Wind Warning: High wind shear. Stake newly planted saplings and avoid spraying foliar fertilizers.');
  }
  if (precip >= 15) {
    alerts.push('Heavy Precipitation: Saturated topsoil. Delay digging to avoid soil compaction and root asphyxiation.');
  }
  if (humidity <= 25) {
    alerts.push('Low Ambient Humidity: Accelerated transpiration. Check root moisture and consider evening misting.');
  }

  // Watering recommendation based on precipitation
  const wateringGuidance = precip > 5
    ? 'Recent natural rainfall is sufficient (precipitation > 5mm). Skip supplementary irrigation today to prevent root rot.'
    : currentTemp > 28
    ? 'High thermal evaporation. Supplementary deep root watering recommended early in the morning.'
    : 'Standard maintenance moisture. Irrigate according to individual species baseline requirements.';

  return {
    suitability: plantingSuitability,
    wateringGuidance,
    alerts,
    soilTempAvailable: soilTemp !== undefined,
    soilTemp,
  };
}

// =============================================================================
// 6. SHARED MY PLANTS DATABASE CRUD (user_plants)
// =============================================================================

export async function fetchUserPlants(userId?: string): Promise<DbUserPlant[]> {
  if (!isSupabaseConfigured || !userId) {
    return localUserPlants;
  }
  try {
    const { data, error } = await supabase
      .from('user_plants')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      localUserPlants = data as DbUserPlant[];
      return data as DbUserPlant[];
    }
    return localUserPlants;
  } catch {
    return localUserPlants;
  }
}

export async function saveUserPlant(
  plant: Omit<DbUserPlant, 'id' | 'created_at' | 'updated_at'>
): Promise<{ success: boolean; data?: DbUserPlant; error?: string }> {
  const tempId = `plant-${Date.now()}`;
  const now = new Date().toISOString();
  const newPlant: DbUserPlant = {
    ...plant,
    id: tempId,
    created_at: now,
    updated_at: now,
  };

  if (!isSupabaseConfigured || !plant.user_id) {
    localUserPlants.unshift(newPlant);
    return { success: true, data: newPlant };
  }

  try {
    const { data, error } = await supabase
      .from('user_plants')
      .insert({
        user_id: plant.user_id,
        common_name: plant.common_name,
        scientific_name: plant.scientific_name,
        family: plant.family,
        category: plant.category,
        location_type: plant.location_type,
        photo_url: plant.photo_url,
        perenual_species_id: plant.perenual_species_id,
        planting_date: plant.planting_date,
        care_status: plant.care_status,
        notes: plant.notes,
      })
      .select()
      .single();

    if (!error && data) {
      localUserPlants.unshift(data as DbUserPlant);
      return { success: true, data: data as DbUserPlant };
    }
    localUserPlants.unshift(newPlant);
    return { success: true, data: newPlant };
  } catch (err: any) {
    localUserPlants.unshift(newPlant);
    return { success: true, data: newPlant };
  }
}

export async function deleteUserPlant(plantId: string, userId?: string): Promise<{ success: boolean }> {
  localUserPlants = localUserPlants.filter((p) => p.id !== plantId);
  if (isSupabaseConfigured && userId) {
    try {
      await supabase.from('user_plants').delete().eq('id', plantId).eq('user_id', userId);
    } catch (err) {
      console.warn('Error deleting plant from DB:', err);
    }
  }
  return { success: true };
}

// =============================================================================
// 7. PLANT FAVORITES CRUD (plant_favorites)
// =============================================================================

export async function fetchUserPlantFavorites(userId?: string): Promise<DbPlantFavorite[]> {
  if (!isSupabaseConfigured || !userId) {
    return localPlantFavorites;
  }
  try {
    const { data, error } = await supabase
      .from('plant_favorites')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      localPlantFavorites = data as DbPlantFavorite[];
      return data as DbPlantFavorite[];
    }
    return localPlantFavorites;
  } catch {
    return localPlantFavorites;
  }
}

export async function togglePlantFavorite(favorite: {
  user_id: string;
  species_id: string;
  common_name: string;
  scientific_name?: string;
  thumbnail_url?: string;
  source?: 'perenual' | 'native_catalog' | 'custom';
}): Promise<{ isFavorited: boolean }> {
  const existingIndex = localPlantFavorites.findIndex(
    (f) => f.species_id === favorite.species_id && f.user_id === favorite.user_id
  );

  if (existingIndex >= 0) {
    localPlantFavorites.splice(existingIndex, 1);
    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('plant_favorites')
          .delete()
          .eq('user_id', favorite.user_id)
          .eq('species_id', favorite.species_id);
      } catch (err) {
        console.warn('Error removing favorite from DB:', err);
      }
    }
    return { isFavorited: false };
  } else {
    const newFav: DbPlantFavorite = {
      id: `fav-${Date.now()}`,
      user_id: favorite.user_id,
      species_id: favorite.species_id,
      common_name: favorite.common_name,
      scientific_name: favorite.scientific_name || null,
      thumbnail_url: favorite.thumbnail_url || null,
      source: favorite.source || 'perenual',
      created_at: new Date().toISOString(),
    };
    localPlantFavorites.unshift(newFav);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('plant_favorites').insert({
          user_id: favorite.user_id,
          species_id: favorite.species_id,
          common_name: favorite.common_name,
          scientific_name: favorite.scientific_name,
          thumbnail_url: favorite.thumbnail_url,
          source: favorite.source || 'perenual',
        });
      } catch (err) {
        console.warn('Error saving favorite to DB:', err);
      }
    }
    return { isFavorited: true };
  }
}

// =============================================================================
// 8. PLANTING CALENDAR EVENTS CRUD (planting_calendar_events)
// =============================================================================

export async function fetchCalendarEvents(userId?: string): Promise<DbCalendarEvent[]> {
  if (!isSupabaseConfigured || !userId) {
    return localCalendarEvents;
  }
  try {
    const { data, error } = await supabase
      .from('planting_calendar_events')
      .select('*')
      .eq('user_id', userId)
      .order('event_date', { ascending: true });

    if (!error && data) {
      localCalendarEvents = data as DbCalendarEvent[];
      return data as DbCalendarEvent[];
    }
    return localCalendarEvents;
  } catch {
    return localCalendarEvents;
  }
}

export async function createCalendarEvent(
  event: Omit<DbCalendarEvent, 'id' | 'created_at' | 'updated_at'>
): Promise<{ success: boolean; data?: DbCalendarEvent; error?: string }> {
  const tempId = `cal-${Date.now()}`;
  const now = new Date().toISOString();
  const newEvent: DbCalendarEvent = {
    ...event,
    id: tempId,
    created_at: now,
    updated_at: now,
  };

  if (!isSupabaseConfigured || !event.user_id) {
    localCalendarEvents.push(newEvent);
    return { success: true, data: newEvent };
  }

  try {
    const { data, error } = await supabase
      .from('planting_calendar_events')
      .insert({
        user_id: event.user_id,
        plant_id: event.plant_id,
        title: event.title,
        event_category: event.event_category,
        event_date: event.event_date,
        notes: event.notes,
        is_completed: event.is_completed,
        reminder_enabled: event.reminder_enabled,
      })
      .select()
      .single();

    if (!error && data) {
      localCalendarEvents.push(data as DbCalendarEvent);
      return { success: true, data: data as DbCalendarEvent };
    }
    localCalendarEvents.push(newEvent);
    return { success: true, data: newEvent };
  } catch (err: any) {
    localCalendarEvents.push(newEvent);
    return { success: true, data: newEvent };
  }
}

export async function toggleCalendarEventCompleted(
  eventId: string,
  completed: boolean,
  userId?: string
): Promise<{ success: boolean }> {
  const ev = localCalendarEvents.find((e) => e.id === eventId);
  if (ev) ev.is_completed = completed;

  if (isSupabaseConfigured && userId) {
    try {
      await supabase
        .from('planting_calendar_events')
        .update({ is_completed: completed, updated_at: new Date().toISOString() })
        .eq('id', eventId)
        .eq('user_id', userId);
    } catch (err) {
      console.warn('Error updating calendar event:', err);
    }
  }
  return { success: true };
}

export async function deleteCalendarEvent(eventId: string, userId?: string): Promise<{ success: boolean }> {
  localCalendarEvents = localCalendarEvents.filter((e) => e.id !== eventId);
  if (isSupabaseConfigured && userId) {
    try {
      await supabase.from('planting_calendar_events').delete().eq('id', eventId).eq('user_id', userId);
    } catch (err) {
      console.warn('Error deleting calendar event:', err);
    }
  }
  return { success: true };
}

// =============================================================================
// 9. PLANT CARE PLANS CRUD (plant_care_plans)
// =============================================================================

export async function savePlantCarePlan(
  plan: Omit<DbPlantCarePlan, 'id' | 'created_at' | 'updated_at'>
): Promise<{ success: boolean; data?: DbPlantCarePlan; error?: string }> {
  const tempId = `plan-${Date.now()}`;
  const now = new Date().toISOString();
  const newPlan: DbPlantCarePlan = {
    ...plan,
    id: tempId,
    created_at: now,
    updated_at: now,
  };

  if (!isSupabaseConfigured || !plan.user_id) {
    localPlantCarePlans.unshift(newPlan);
    return { success: true, data: newPlan };
  }

  try {
    const { data, error } = await supabase
      .from('plant_care_plans')
      .insert({
        user_id: plan.user_id,
        plant_id: plan.plant_id,
        plant_name: plan.plant_name,
        scientific_name: plan.scientific_name,
        watering_schedule: plan.watering_schedule,
        sunlight_guidance: plan.sunlight_guidance,
        soil_fertilizer_guidance: plan.soil_fertilizer_guidance,
        seasonal_tasks: plan.seasonal_tasks,
        care_summary: plan.care_summary,
        full_plan_json: plan.full_plan_json,
      })
      .select()
      .single();

    if (!error && data) {
      localPlantCarePlans.unshift(data as DbPlantCarePlan);
      return { success: true, data: data as DbPlantCarePlan };
    }
    localPlantCarePlans.unshift(newPlan);
    return { success: true, data: newPlan };
  } catch (err: any) {
    localPlantCarePlans.unshift(newPlan);
    return { success: true, data: newPlan };
  }
}

export async function fetchUserPlantCarePlans(userId?: string): Promise<DbPlantCarePlan[]> {
  if (!isSupabaseConfigured || !userId) {
    return localPlantCarePlans;
  }
  try {
    const { data, error } = await supabase
      .from('plant_care_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      localPlantCarePlans = data as DbPlantCarePlan[];
      return data as DbPlantCarePlan[];
    }
    return localPlantCarePlans;
  } catch {
    return localPlantCarePlans;
  }
}

// =============================================================================
// 10. PLANT DIAGNOSES CRUD (plant_diagnoses)
// =============================================================================

export async function savePlantDiagnosis(
  diag: Omit<DbPlantDiagnosis, 'id' | 'created_at'>
): Promise<{ success: boolean; data?: DbPlantDiagnosis; error?: string }> {
  const tempId = `diag-${Date.now()}`;
  const now = new Date().toISOString();
  const newDiag: DbPlantDiagnosis = {
    ...diag,
    id: tempId,
    created_at: now,
  };

  if (!isSupabaseConfigured || !diag.user_id) {
    localPlantDiagnoses.unshift(newDiag);
    return { success: true, data: newDiag };
  }

  try {
    const { data, error } = await supabase
      .from('plant_diagnoses')
      .insert({
        user_id: diag.user_id,
        plant_id: diag.plant_id,
        plant_name: diag.plant_name,
        photo_url: diag.photo_url,
        symptoms: diag.symptoms,
        observations: diag.observations,
        primary_issue: diag.primary_issue,
        category: diag.category,
        severity: diag.severity,
        confidence: diag.confidence,
        treatment_recommendations: diag.treatment_recommendations,
        prevention_advice: diag.prevention_advice,
        full_diagnosis_json: diag.full_diagnosis_json,
        status: diag.status,
      })
      .select()
      .single();

    if (!error && data) {
      localPlantDiagnoses.unshift(data as DbPlantDiagnosis);
      return { success: true, data: data as DbPlantDiagnosis };
    }
    localPlantDiagnoses.unshift(newDiag);
    return { success: true, data: newDiag };
  } catch (err: any) {
    localPlantDiagnoses.unshift(newDiag);
    return { success: true, data: newDiag };
  }
}

export async function fetchUserPlantDiagnoses(userId?: string): Promise<DbPlantDiagnosis[]> {
  if (!isSupabaseConfigured || !userId) {
    return localPlantDiagnoses;
  }
  try {
    const { data, error } = await supabase
      .from('plant_diagnoses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      localPlantDiagnoses = data as DbPlantDiagnosis[];
      return data as DbPlantDiagnosis[];
    }
    return localPlantDiagnoses;
  } catch {
    return localPlantDiagnoses;
  }
}
