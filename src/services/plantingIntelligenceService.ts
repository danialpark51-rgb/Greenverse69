import { supabase } from '../lib/supabase';
import {
  SiteAssessmentInput,
  SiteAssessmentResult,
  DbSiteAssessment,
  GreenDeficitInput,
  GreenDeficitResult,
  DbGreenDeficitEvaluation,
  SpeciesMatchCriteria,
  SpeciesMatchResult,
  ClimateSuitabilityInput,
  ClimateSuitabilityResult,
  SpacingLayoutInput,
  SpacingLayoutResult,
  BiodiversityPlanInput,
  BiodiversityPlanResult,
  PlantingRiskInput,
  PlantingRiskResult,
  RiskItem,
  PlantingCalendarMonth,
  DbPlantingPlan,
  PlantSpecies
} from '../types/planting';
import { SPECIES_CATALOG } from '../data/speciesCatalog';

// ==========================================
// 1. IN-MEMORY FALLBACK CACHE
// ==========================================

const FALLBACK_SITE_ASSESSMENTS: DbSiteAssessment[] = [
  {
    id: 'site-ass-01',
    user_id: null,
    site_name: 'Cedar Bend Community Park Extension',
    location_name: 'Upper Mississippi Watershed Basin',
    latitude: 44.9778,
    longitude: -93.2650,
    space_sqm: 120.0,
    sunlight: 'Full Sun',
    soil_type: 'Loam',
    soil_condition: 'Well Drained',
    water_availability: 'Automated Irrigation',
    infrastructure_notes: 'Clear open grass verge, 12m away from nearest asphalt',
    suitability_score: 92.0,
    assessment_result: {
      suitabilityScore: 92.0,
      rating: 'Optimal',
      strengths: ['Unobstructed 6+ hrs solar irradiance', 'Deep nutrient-dense loam soil layer', 'Automated trickle line available'],
      concerns: ['High pedestrian traffic on north boundary'],
      recommendations: ['Prioritize deep taproot native hardwoods like Bur Oak', 'Install permeable woodchip mulch ring'],
      recommendedHabit: 'Keystone Overstory Canopy',
      usableAreaSqm: 120.0
    },
    created_at: '2026-11-20T10:00:00Z'
  }
];

const FALLBACK_GREEN_DEFICITS: DbGreenDeficitEvaluation[] = [
  {
    id: 'deficit-01',
    user_id: null,
    area_name: 'Industrial Gateway District Corridor',
    total_area_sqm: 45000.0,
    existing_canopy_pct: 8.5,
    target_canopy_pct: 30.0,
    deficit_score: 71.7,
    priority_level: 'Critical',
    recommendations: {
      deficitScore: 71.7,
      priorityLevel: 'Critical',
      deficitCanopySqm: 9675.0,
      estimatedTreesNeeded: 387,
      lostCarbonCapacityKgYear: 8514,
      heatIslandRiskIndex: 8.8,
      priorityZones: ['Asphalt logistics parking perimeter', 'Unshaded pedestrian transit halts', 'Stormwater retention verge'],
      recommendations: [
        'Deploy high-density Miyawaki pocket forests on vacant berms',
        'Plant street-tolerant species like Common Hackberry along truck avenues',
        'Depave 15% of non-load bearing asphalt for rain gardens'
      ],
      isEstimate: true
    },
    created_at: '2026-11-21T14:30:00Z'
  }
];

let localSiteAssessments = [...FALLBACK_SITE_ASSESSMENTS];
let localGreenDeficits = [...FALLBACK_GREEN_DEFICITS];
let localPlantingPlans: DbPlantingPlan[] = [];
let localSavedSpecies: { id: string; user_id: string; species_id: string; species_name: string; match_score: number; notes: string | null; created_at: string }[] = [];

// ==========================================
// 1. SMART SITE FINDER ALGORITHM & STORAGE
// ==========================================

export function evaluateSiteAssessment(input: SiteAssessmentInput): SiteAssessmentResult {
  let score = 70;
  const strengths: string[] = [];
  const concerns: string[] = [];
  const recommendations: string[] = [];

  const area = Math.max(1, input.space_width_m * input.space_length_m);

  // Sunlight evaluation
  if (input.sunlight === 'Full Sun') {
    score += 15;
    strengths.push('Full direct sunlight (6+ hours) supports high-biomass canopy trees and flowering species.');
  } else if (input.sunlight === 'Partial Shade') {
    score += 8;
    strengths.push('Partial shade is ideal for woodland understory species, dogwoods, and serviceberries.');
  } else {
    score -= 10;
    concerns.push('Dense shade limits mature canopy species and flowering pollinator ground flora.');
    recommendations.push('Select shade-tolerant understory species such as Northern Spicebush or Ferns.');
  }

  // Soil evaluation
  if (input.soil_type === 'Loam') {
    score += 15;
    strengths.push('Prime loamy soil texture provides balanced moisture retention and aeration.');
  } else if (input.soil_type === 'Clay') {
    score += 5;
    concerns.push('Heavy clay soil may drain slowly and resist initial root penetration.');
    recommendations.push('Incorporate mature organic compost and avoid creating a waterlogged planting bowl.');
  } else if (input.soil_type === 'Sandy') {
    score += 5;
    concerns.push('Sandy soil drains rapidly and loses soluble nutrients quickly.');
    recommendations.push('Apply a thick 3-4 inch organic mulch blanket to conserve sub-surface moisture.');
  }

  if (input.soil_condition === 'Well Drained') {
    score += 10;
    strengths.push('Well-drained soil prevents root hypoxia and fungal collar rot.');
  } else if (input.soil_condition === 'Compacted / Poor') {
    score -= 15;
    concerns.push('Compacted urban soil severely restricts root expansion and rain infiltration.');
    recommendations.push('Aerate or broadfork the planting zone to a 60cm depth before planting.');
  } else if (input.soil_condition === 'Waterlogged') {
    score -= 15;
    concerns.push('Chronic waterlogging causes root rot in typical hardwood species.');
    recommendations.push('Select obligate wetland or riparian trees like River Birch or Mangroves.');
  }

  // Water evaluation
  if (input.water_availability === 'Automated Irrigation') {
    score += 10;
    strengths.push('Automated irrigation guarantees crucial moisture during initial establishment years 1-3.');
  } else if (input.water_availability === 'Rainfall Only' || input.water_availability === 'Seasonal Drought Prone') {
    score -= 10;
    concerns.push('Lack of supplemental irrigation increases mortality risk during mid-summer heatwaves.');
    recommendations.push('Select drought-resilient keystone species with deep taproots and plan supplementary watering.');
  }

  // Infrastructure constraints
  let recommendedHabit = 'Overstory Deciduous Canopy';
  if (input.infrastructure.includes('Under Overhead Cables')) {
    score -= 12;
    concerns.push('Overhead powerlines present: Mature tree height must not exceed 6-7 meters.');
    recommendations.push('Strictly select compact sub-canopy trees (e.g. Downy Serviceberry or Eastern Redbud).');
    recommendedHabit = 'Compact Sub-Canopy / Large Shrub';
  }

  if (input.infrastructure.includes('Near Building (<3m)')) {
    score -= 10;
    concerns.push('Proximity to foundations creates potential structural friction and shade competition.');
    recommendations.push('Avoid aggressive spreading root systems; maintain at least 4 meters clearance.');
  }

  if (input.infrastructure.includes('Near Underground Pipes')) {
    score -= 8;
    concerns.push('Underground utility lines nearby require non-invasive, moderate root systems.');
  }

  // Space scaling
  if (area < 15 && recommendedHabit === 'Overstory Deciduous Canopy') {
    recommendedHabit = 'Columnar / Small Specimen Tree';
    recommendations.push('Limited footprint: Focus on vertical columnar species or multi-stem shrubs.');
  }

  const finalScore = Math.min(100, Math.max(20, score));
  const rating =
    finalScore >= 85 ? 'Optimal' : finalScore >= 70 ? 'Favorable' : finalScore >= 50 ? 'Challenging' : 'High Risk';

  return {
    suitabilityScore: finalScore,
    rating,
    strengths,
    concerns,
    recommendations,
    recommendedHabit,
    usableAreaSqm: area
  };
}

export async function saveSiteAssessment(
  input: SiteAssessmentInput,
  userId?: string
): Promise<{ data: DbSiteAssessment | null; error: Error | null; fromSupabase: boolean }> {
  const result = evaluateSiteAssessment(input);
  const area = input.space_width_m * input.space_length_m;

  const payload = {
    user_id: userId || null,
    site_name: input.site_name.trim(),
    location_name: input.location_name.trim(),
    latitude: input.latitude || null,
    longitude: input.longitude || null,
    space_sqm: area,
    sunlight: input.sunlight,
    soil_type: input.soil_type,
    soil_condition: input.soil_condition,
    water_availability: input.water_availability,
    infrastructure_notes: input.infrastructure.join(', ') || null,
    suitability_score: result.suitabilityScore,
    assessment_result: result,
  };

  try {
    const { data, error } = await supabase.from('site_assessments').insert(payload).select().single();
    if (!error && data) {
      localSiteAssessments.unshift(data as DbSiteAssessment);
      return { data: data as DbSiteAssessment, error: null, fromSupabase: true };
    }
  } catch (err) {
    console.warn('[Greenverse SiteAssessment] Supabase error:', err);
  }

  // Fallback to local cache
  const localRecord: DbSiteAssessment = {
    id: `site-${Date.now()}`,
    ...payload,
    created_at: new Date().toISOString()
  };
  localSiteAssessments.unshift(localRecord);
  return { data: localRecord, error: null, fromSupabase: false };
}

export async function fetchSiteAssessments(userId?: string): Promise<{ data: DbSiteAssessment[]; fromSupabase: boolean }> {
  try {
    let query = supabase.from('site_assessments').select('*').order('created_at', { ascending: false });
    if (userId) {
      query = query.or(`user_id.eq.${userId},user_id.is.null`);
    }
    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      return { data: data as DbSiteAssessment[], fromSupabase: true };
    }
  } catch (err) {
    console.warn('[Greenverse SiteAssessment] fetch error:', err);
  }

  return { data: localSiteAssessments, fromSupabase: false };
}

// ==========================================
// 2. GREEN DEFICIT ANALYZER
// ==========================================

export function calculateGreenDeficit(input: GreenDeficitInput): GreenDeficitResult {
  const targetPct = input.target_canopy_pct || 30.0;
  const currentPct = Math.min(100, Math.max(0, input.current_canopy_pct));
  const deficitPct = Math.max(0, targetPct - currentPct);
  const deficitScore = Number(((deficitPct / targetPct) * 100).toFixed(1));

  const totalArea = Math.max(100, input.total_area_sqm);
  const deficitCanopySqm = Number(((deficitPct / 100) * totalArea).toFixed(0));

  // Avg mature tree canopy coverage = 25 sqm
  const estimatedTreesNeeded = Math.ceil(deficitCanopySqm / 25);
  // Avg mature tree carbon capture = 22 kg CO2 / year
  const lostCarbonCapacityKgYear = estimatedTreesNeeded * 22;

  // Urban heat island risk index (1 to 10)
  let heatRisk = 2.0 + (deficitScore / 100) * 6.5;
  if (input.location_type === 'Urban Core' || input.location_type === 'Industrial Park') {
    heatRisk += 1.5;
  }
  if (input.population_density === 'High') {
    heatRisk += 0.8;
  }
  const heatIslandRiskIndex = Number(Math.min(10.0, Math.max(1.0, heatRisk)).toFixed(1));

  const priorityLevel: 'Critical' | 'High' | 'Moderate' | 'Low' =
    deficitScore >= 70 ? 'Critical' : deficitScore >= 45 ? 'High' : deficitScore >= 20 ? 'Moderate' : 'Low';

  const priorityZones: string[] = [];
  const recommendations: string[] = [];

  if (input.location_type === 'Urban Core' || input.location_type === 'Industrial Park') {
    priorityZones.push('Asphalt parking lots and unshaded loading bays');
    priorityZones.push('Pedestrian transit waiting areas and street sidewalks');
    recommendations.push('Deploy continuous tree pits with structural soil to support large-stature shade canopies.');
    recommendations.push('Implement depaving initiatives on underutilized impervious hardscapes.');
  } else if (input.location_type === 'Suburban Residential') {
    priorityZones.push('Street parkway strips and public right-of-way boulevards');
    priorityZones.push('Schoolyards and community recreational parks');
    recommendations.push('Initiate neighborhood residential tree-planting rebates for native shade trees.');
  } else if (input.location_type === 'River Corridor') {
    priorityZones.push('Eroding riverbanks and degraded riparian buffer zones');
    recommendations.push('Plant bio-engineering native species (River Birch, Dogwood) for bank stabilization.');
  } else {
    priorityZones.push('Campus courtyards and peripheral lawn perimeters');
    recommendations.push('Convert low-biodiversity mowed turf grass into native multi-tiered pocket mini-forests.');
  }

  recommendations.push(`Target an annual planting cadence of at least ${Math.ceil(estimatedTreesNeeded / 5)} trees/year over 5 years to achieve ${targetPct}% canopy coverage.`);

  return {
    deficitScore,
    priorityLevel,
    deficitCanopySqm,
    estimatedTreesNeeded,
    lostCarbonCapacityKgYear,
    heatIslandRiskIndex,
    priorityZones,
    recommendations,
    isEstimate: true
  };
}

export async function saveGreenDeficitEvaluation(
  input: GreenDeficitInput,
  result: GreenDeficitResult,
  userId?: string
): Promise<{ data: DbGreenDeficitEvaluation | null; error: Error | null; fromSupabase: boolean }> {
  const payload = {
    user_id: userId || null,
    area_name: input.area_name.trim(),
    total_area_sqm: input.total_area_sqm,
    existing_canopy_pct: input.current_canopy_pct,
    target_canopy_pct: input.target_canopy_pct || 30.0,
    deficit_score: result.deficitScore,
    priority_level: result.priorityLevel,
    recommendations: result,
  };

  try {
    const { data, error } = await supabase.from('green_deficit_evaluations').insert(payload).select().single();
    if (!error && data) {
      localGreenDeficits.unshift(data as DbGreenDeficitEvaluation);
      return { data: data as DbGreenDeficitEvaluation, error: null, fromSupabase: true };
    }
  } catch (err) {
    console.warn('[Greenverse GreenDeficit] Supabase error:', err);
  }

  const localRecord: DbGreenDeficitEvaluation = {
    id: `deficit-${Date.now()}`,
    ...payload,
    created_at: new Date().toISOString()
  };
  localGreenDeficits.unshift(localRecord);
  return { data: localRecord, error: null, fromSupabase: false };
}

export async function fetchGreenDeficitEvaluations(userId?: string): Promise<{ data: DbGreenDeficitEvaluation[]; fromSupabase: boolean }> {
  try {
    let query = supabase.from('green_deficit_evaluations').select('*').order('created_at', { ascending: false });
    if (userId) {
      query = query.or(`user_id.eq.${userId},user_id.is.null`);
    }
    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      return { data: data as DbGreenDeficitEvaluation[], fromSupabase: true };
    }
  } catch (err) {
    console.warn('[Greenverse GreenDeficit] fetch error:', err);
  }

  return { data: localGreenDeficits, fromSupabase: false };
}

// ==========================================
// 3. SPECIES MATCH ENGINE
// ==========================================

export function matchSpecies(criteria: SpeciesMatchCriteria): SpeciesMatchResult[] {
  return SPECIES_CATALOG.map((species) => {
    let score = 50;
    const reasons: string[] = [];
    const drawbacks: string[] = [];

    // Region / Biome Match
    if (criteria.region) {
      const match = species.nativeRegions.some((r) => r.toLowerCase().includes(criteria.region!.toLowerCase())) ||
                    species.biomes.some((b) => b.toLowerCase().includes(criteria.region!.toLowerCase()));
      if (match) {
        score += 20;
        reasons.push(`Indigenously adapted to ${criteria.region}.`);
      } else {
        drawbacks.push(`Not native to ${criteria.region}; requires climate acclimation.`);
      }
    } else {
      score += 10;
    }

    // Sunlight Match
    if (criteria.sunlight) {
      if (species.sunlightRequirement === criteria.sunlight || species.sunlightRequirement === 'Any') {
        score += 15;
        reasons.push(`Perfect sunlight alignment with ${criteria.sunlight}.`);
      } else if (species.sunlightRequirement === 'Partial Shade' && criteria.sunlight === 'Full Shade') {
        score += 5;
        drawbacks.push('Prefers partial sun; growth may be slower in full shade.');
      } else {
        score -= 15;
        drawbacks.push(`Requires ${species.sunlightRequirement}; incompatible with ${criteria.sunlight}.`);
      }
    }

    // Soil Match
    if (criteria.soilType) {
      if (species.soilPreferences.includes(criteria.soilType)) {
        score += 15;
        reasons.push(`Naturally thrives in ${criteria.soilType} soils.`);
      } else {
        score -= 10;
        drawbacks.push(`Less tolerant of heavy ${criteria.soilType} soils without amendment.`);
      }
    }

    // Water Match
    if (criteria.waterAvailability) {
      if (criteria.waterAvailability === 'Rainfall Only' || criteria.waterAvailability === 'Seasonal Drought Prone') {
        if (species.droughtTolerance === 'Extreme' || species.droughtTolerance === 'High') {
          score += 15;
          reasons.push('High drought tolerance thrives under rain-only conditions.');
        } else if (species.waterNeed === 'High' || species.waterNeed === 'Very High') {
          score -= 20;
          drawbacks.push('High moisture requirement will suffer severe stress without regular irrigation.');
        }
      } else {
        score += 10;
      }
    }

    // Height constraint
    if (criteria.maxHeightM) {
      if (species.matureHeightM <= criteria.maxHeightM) {
        score += 10;
        reasons.push(`Mature height (${species.matureHeightM}m) stays within ${criteria.maxHeightM}m ceiling.`);
      } else {
        score -= 25;
        drawbacks.push(`Mature height (${species.matureHeightM}m) exceeds the ${criteria.maxHeightM}m space limit.`);
      }
    }

    // Pollinator filter
    if (criteria.pollinatorOnly) {
      if (species.pollinatorFriendly) {
        score += 10;
        reasons.push('High nectar/pollen resource for native pollinator species.');
      } else {
        score -= 30;
        drawbacks.push('Low pollinator support value.');
      }
    }

    const finalScore = Math.min(100, Math.max(10, score));

    return {
      species,
      matchScore: finalScore,
      reasons: reasons.slice(0, 3),
      drawbacks: drawbacks.slice(0, 2),
    };
  }).sort((a, b) => b.matchScore - a.matchScore);
}

// ==========================================
// 4. CLIMATE SUITABILITY CHECKER
// ==========================================

export function checkClimateSuitability(input: ClimateSuitabilityInput): ClimateSuitabilityResult {
  const species = SPECIES_CATALOG.find((s) => s.id === input.speciesId) || SPECIES_CATALOG[0];

  let score = 80;
  const warnings: string[] = [];
  const recommendations: string[] = [];

  // Temperature evaluation
  let tempCompatibility: 'Optimal' | 'Tolerable' | 'Too Hot' | 'Too Cold' = 'Optimal';
  if (input.summerMaxTempC > species.maxTempC) {
    score -= 25;
    tempCompatibility = 'Too Hot';
    warnings.push(`Summer maximum (${input.summerMaxTempC}°C) exceeds thermal threshold (${species.maxTempC}°C) causing cellular heat stress.`);
    recommendations.push('Provide canopy shade cloth during establishment and plant near microclimate cooling features.');
  } else if (input.summerMaxTempC > species.maxTempC - 4) {
    score -= 8;
    tempCompatibility = 'Tolerable';
    warnings.push(`Summer temperatures approach species physiological limit.`);
  }

  if (input.winterMinTempC < species.minTempC) {
    score -= 35;
    tempCompatibility = 'Too Cold';
    warnings.push(`Winter minimum (${input.winterMinTempC}°C) drops below lethal frost boundary (${species.minTempC}°C).`);
    recommendations.push('Wrap young trunk with breathable insulation before the first ground freeze.');
  }

  // Rainfall evaluation
  let waterCompatibility: 'Adequate' | 'Deficit / Needs Irrigation' | 'Excess / Risk of Root Rot' = 'Adequate';
  if (input.annualRainfallMm < species.minAnnualRainfallMm) {
    if (!input.hasIrrigation) {
      score -= 25;
      waterCompatibility = 'Deficit / Needs Irrigation';
      warnings.push(`Annual rainfall (${input.annualRainfallMm}mm) is well below minimum requirement (${species.minAnnualRainfallMm}mm).`);
      recommendations.push('Install supplemental drip irrigation delivering 15-20 gallons bi-weekly during summer.');
    } else {
      score -= 5;
      waterCompatibility = 'Deficit / Needs Irrigation';
      recommendations.push('Irrigation will bridge rainfall deficit; monitor soil moisture sensors regularly.');
    }
  } else if (input.annualRainfallMm > species.maxAnnualRainfallMm) {
    score -= 10;
    waterCompatibility = 'Excess / Risk of Root Rot';
    warnings.push(`Heavy annual rainfall (${input.annualRainfallMm}mm) may exceed natural transpiration tolerance in poorly drained soil.`);
  }

  // Drought vulnerability
  let droughtVulnerability: 'Resilient' | 'Moderate Concern' | 'Severe Risk' = 'Resilient';
  if (input.droughtSeverity === 'Severe' || input.droughtSeverity === 'Moderate') {
    if (species.droughtTolerance === 'Low') {
      score -= 20;
      droughtVulnerability = 'Severe Risk';
      warnings.push(`Species has low drought tolerance; prolonged dry spells will cause premature canopy dieback.`);
    } else if (species.droughtTolerance === 'Moderate') {
      score -= 10;
      droughtVulnerability = 'Moderate Concern';
    }
  }

  const finalScore = Math.min(100, Math.max(15, score));
  const verdict =
    finalScore >= 85
      ? 'Excellent Adaptation'
      : finalScore >= 70
      ? 'Suitable with Care'
      : finalScore >= 50
      ? 'Marginal / Stressed'
      : 'High Risk of Mortality';

  return {
    score: finalScore,
    verdict,
    tempCompatibility,
    waterCompatibility,
    droughtVulnerability,
    warnings,
    recommendations
  };
}

// ==========================================
// 5. PLANT SPACING PLANNER
// ==========================================

export function calculateSpacingLayout(input: SpacingLayoutInput): SpacingLayoutResult {
  const species = SPECIES_CATALOG.find((s) => s.id === input.speciesId) || SPECIES_CATALOG[0];

  const length = Math.max(2, input.areaLengthM);
  const width = Math.max(2, input.areaWidthM);
  const totalAreaSqm = length * width;

  let spacing = input.customSpacingM || species.recommendedSpacingM;

  if (input.layoutPattern === 'Miyawaki High-Density') {
    spacing = 0.8; // 3 to 4 plants per sqm
  } else if (input.layoutPattern === 'Hedgerow Corridor') {
    spacing = Math.max(1.0, species.recommendedSpacingM * 0.5);
  }

  const colsCount = Math.max(1, Math.floor(length / spacing));
  const rowsCount = Math.max(1, Math.floor(width / spacing));
  const maxSafeQuantity = colsCount * rowsCount;

  const targetQty = input.targetQuantity || maxSafeQuantity;
  const overcrowdingWarning = targetQty > maxSafeQuantity * 1.25;

  const clearanceWarnings: string[] = [];
  const recommendations: string[] = [];

  if (overcrowdingWarning) {
    clearanceWarnings.push(`Target count (${targetQty}) exceeds calculated safe capacity (${maxSafeQuantity}) for ${input.layoutPattern}.`);
    recommendations.push('Thin canopy density to prevent light starvation, fungal dampening, and root competition.');
  }

  if (species.matureSpreadM > width) {
    clearanceWarnings.push(`Mature crown spread (${species.matureSpreadM}m) exceeds available plot width (${width}m).`);
    recommendations.push('Expect crown overlap with neighboring property; plan for periodic directional pruning.');
  }

  // Grid coordinates generation for visualization canvas
  const gridCoordinates: Array<{ x: number; y: number; r: number }> = [];
  const renderCols = Math.min(12, colsCount);
  const renderRows = Math.min(12, rowsCount);
  const colStep = length / (renderCols + 1);
  const rowStep = width / (renderRows + 1);

  for (let r = 0; r < renderRows; r++) {
    for (let c = 0; c < renderCols; c++) {
      if (gridCoordinates.length < Math.min(100, targetQty)) {
        let xOffset = 0;
        if (input.layoutPattern === 'Staggered Triangle' && r % 2 === 1) {
          xOffset = colStep * 0.5;
        }
        gridCoordinates.push({
          x: Math.round(((c + 1) * colStep + xOffset) * 10) / 10,
          y: Math.round((r + 1) * rowStep * 10) / 10,
          r: Math.round((species.matureSpreadM / 2) * 10) / 10,
        });
      }
    }
  }

  const yearsToFullCanopy =
    species.growthRate === 'Rapid' ? 5 : species.growthRate === 'Fast' ? 8 : species.growthRate === 'Moderate' ? 14 : 22;

  const effectiveCanopyCoverPct = Math.min(100, Math.round(((targetQty * Math.PI * Math.pow(species.matureSpreadM / 2, 2)) / totalAreaSqm) * 100));

  recommendations.push(`Layout accommodates ${gridCoordinates.length} tree planting points positioned at ~${spacing.toFixed(1)}m stem-to-stem spacing.`);
  recommendations.push(`Estimated canopy closure reaches 80%+ within approximately ${yearsToFullCanopy} years.`);

  return {
    recommendedSpacingM: spacing,
    maxSafeQuantity,
    suggestedQuantity: Math.min(targetQty, maxSafeQuantity),
    rowsCount,
    colsCount,
    totalAreaSqm,
    effectiveCanopyCoverPct,
    yearsToFullCanopy,
    overcrowdingWarning,
    clearanceWarnings,
    recommendations,
    gridCoordinates
  };
}

// ==========================================
// 6. BIODIVERSITY PLANNER
// ==========================================

export function evaluateBiodiversityPlan(input: BiodiversityPlanInput): BiodiversityPlanResult {
  const selected = SPECIES_CATALOG.filter((s) => input.selectedSpeciesIds.includes(s.id));

  const speciesCount = selected.length;
  const families = new Set(selected.map((s) => s.family));
  const familyCount = families.size;

  const layerCoverage = {
    canopy: selected.some((s) => s.canopyLayer === 'Overstory Canopy'),
    subCanopy: selected.some((s) => s.canopyLayer === 'Sub-canopy Understory'),
    shrub: selected.some((s) => s.canopyLayer === 'Shrub Layer'),
    ground: selected.some((s) => s.canopyLayer === 'Herbaceous Ground'),
  };

  const layersPresent = Object.values(layerCoverage).filter(Boolean).length;

  const pollinatorFriendlyCount = selected.filter((s) => s.pollinatorFriendly).length;
  const birdFriendlyCount = selected.filter((s) => s.birdFriendly).length;

  const pollinatorSupportScore = Math.round((pollinatorFriendlyCount / Math.max(1, speciesCount)) * 100);
  const birdHabitatScore = Math.round((birdFriendlyCount / Math.max(1, speciesCount)) * 100);

  // Santamour's 10-20-30 urban forestry rule
  const compliance10_20_30 = speciesCount >= 5 && familyCount >= 4;

  let bioScore = 30 + (speciesCount * 10) + (layersPresent * 10);
  if (compliance10_20_30) bioScore += 15;
  if (pollinatorSupportScore >= 70) bioScore += 10;
  if (birdHabitatScore >= 70) bioScore += 5;

  const finalScore = Math.min(100, Math.max(15, bioScore));
  const rating =
    finalScore >= 85
      ? 'Exemplary Polyculture'
      : finalScore >= 70
      ? 'Good Diversity'
      : finalScore >= 50
      ? 'Limited Diversity'
      : 'Monoculture Risk';

  const strengths: string[] = [];
  const improvements: string[] = [];

  if (speciesCount <= 1) {
    improvements.push('Single-species monocultures are vulnerable to total collapse from single pest/pathogen outbreaks.');
    improvements.push('Incorporate at least 3 distinct native botanical families to establish ecological resilience.');
  } else {
    strengths.push(`${speciesCount} complementary species across ${familyCount} botanical families.`);
  }

  if (layersPresent >= 3) {
    strengths.push(`Multi-tiered vertical canopy architecture spanning ${layersPresent} of 4 distinct ecological layers.`);
  } else {
    improvements.push('Add missing vertical layers (e.g. native shrubs or groundcover) to prevent weed colonization and soil moisture loss.');
  }

  // Bloom sequence
  const bloomSeasons = Array.from(new Set(selected.map((s) => s.floweringSeason)));
  if (bloomSeasons.includes('Spring') && bloomSeasons.includes('Summer')) {
    strengths.push('Continuous seasonal pollen and nectar sequence from early spring queens through late summer pollinators.');
  } else {
    improvements.push('Introduce late summer or autumn flowering perennials (e.g. Purple Coneflower, Little Bluestem) for migrating fauna.');
  }

  return {
    biodiversityScore: finalScore,
    rating,
    speciesCount,
    familyCount,
    layerCoverage,
    pollinatorSupportScore,
    birdHabitatScore,
    continuousBloomSequence: bloomSeasons,
    compliance10_20_30,
    strengths,
    improvements
  };
}

// ==========================================
// 7. PLANTING RISK SCANNER
// ==========================================

export function scanPlantingRisks(input: PlantingRiskInput): PlantingRiskResult {
  const risks: RiskItem[] = [];

  // 1. Water shortage risk
  if (input.waterAvailability === 'Rainfall Only' || input.waterAvailability === 'Seasonal Drought Prone') {
    risks.push({
      category: 'Water Shortage',
      severity: 'High',
      explanation: 'No supplemental irrigation in place. Sapling root systems lack deep establishment in years 1-2.',
      mitigation: 'Implement rainwater catchment swales, apply a 4-inch organic woodchip collar, and set up bi-weekly bucket irrigation.'
    });
  }

  // 2. Poor soil risk
  if (input.soilCondition === 'Compacted / Poor') {
    risks.push({
      category: 'Poor Soil',
      severity: 'Severe',
      explanation: 'Compacted substrate restricts oxygen diffusion to roots and limits vertical root penetration.',
      mitigation: 'Broadfork a 3-meter radius around the planting zone and blend in 30% mature compost before planting.'
    });
  } else if (input.soilType === 'Clay' && input.drainageIssue) {
    risks.push({
      category: 'Flooding / Drainage',
      severity: 'High',
      explanation: 'Heavy clay with poor drainage creates standing water causing root suffocation and fungal Phytophthora.',
      mitigation: 'Plant trees on a raised earth mound 20-30cm above natural grade so root flare stays well aerated.'
    });
  }

  // 3. Excessive heat risk
  if (input.summerMaxTempC >= 38) {
    risks.push({
      category: 'Excessive Heat',
      severity: input.summerMaxTempC >= 42 ? 'Severe' : 'Moderate',
      explanation: `Extreme heat (> ${input.summerMaxTempC}°C) causes transpiration shutoff and leaf margin scorch.`,
      mitigation: 'Select heat-adapted species (Bur Oak, Hackberry) and prioritize afternoon shadow positioning.'
    });
  }

  // 4. Shade mismatch
  if (input.sunlight === 'Full Shade') {
    risks.push({
      category: 'Shade Mismatch',
      severity: 'Moderate',
      explanation: 'Deep canopy shade limits photosynthetic energy and stunts sun-loving hardwood saplings.',
      mitigation: 'Select shade-tolerant understory species (Downy Serviceberry, Northern Spicebush).'
    });
  }

  // 5. Space constraint / Infrastructure
  if (input.infrastructure.includes('Under Overhead Cables')) {
    risks.push({
      category: 'Root Conflict',
      severity: 'High',
      explanation: 'Overhead power cables will require aggressive utility topping if canopy height exceeds 6m.',
      mitigation: 'Enforce strict 6m mature height threshold; avoid overstory oaks or maples.'
    });
  }

  if (input.infrastructure.includes('Near Building (<3m)')) {
    risks.push({
      category: 'Space Constraint',
      severity: 'Moderate',
      explanation: 'Building wall proximity limits crown expansion and can shade saplings during half the day.',
      mitigation: 'Ensure at least 3.5m clearance and avoid aggressive spreading lateral surface root systems.'
    });
  }

  if (input.selectedSpeciesIds.length === 1 && input.areaSqm > 100) {
    risks.push({
      category: 'Species Mismatch',
      severity: 'Moderate',
      explanation: 'Planting a single species over large acreage creates pest disease vulnerability.',
      mitigation: 'Diversify planting palette with at least 3 complementary companion species.'
    });
  }

  const criticalCount = risks.filter((r) => r.severity === 'Severe' || r.severity === 'High').length;
  let readiness = 100 - (criticalCount * 22) - (risks.length * 8);
  readiness = Math.min(100, Math.max(15, readiness));

  const overallRiskLevel: 'Low' | 'Moderate' | 'High' | 'Severe' =
    readiness >= 80 ? 'Low' : readiness >= 60 ? 'Moderate' : readiness >= 40 ? 'High' : 'Severe';

  const summaryRecommendation =
    overallRiskLevel === 'Low'
      ? 'Plot conditions are favorable with minor manageable environmental factors. Ready to plant!'
      : overallRiskLevel === 'Moderate'
      ? 'Plot is viable once highlighted mitigation measures (mulch, soil preparation, spacing) are addressed.'
      : 'Significant environmental hurdles identified. Implement recommended site modifications prior to investing in saplings.';

  return {
    overallReadinessScore: readiness,
    overallRiskLevel,
    risks,
    criticalCount,
    summaryRecommendation
  };
}

// ==========================================
// 8. PLANTING CALENDAR GENERATOR
// ==========================================

export function getPlantingCalendar(region: string): PlantingCalendarMonth[] {
  return [
    {
      month: 'January',
      season: 'Winter',
      plantingTasks: ['Dormant bare-root planning and inventory ordering', 'Tool sanitization'],
      wateringGuidelines: 'Minimal. Avoid watering frozen soils.',
      soilAndMulchTasks: ['Inspect winter mulch depth (maintain 3-4 inches)'],
      pruningAndCare: ['Dormant structure pruning of deciduous shade trees'],
      isOptimalPlantingSeason: false
    },
    {
      month: 'February',
      season: 'Winter',
      plantingTasks: ['Order bareroot native saplings from state nurseries'],
      wateringGuidelines: 'Inspect moisture after winter snowmelts.',
      soilAndMulchTasks: ['Soil test pH and organic matter in unthawed plots'],
      pruningAndCare: ['Remove storm-damaged limbs before spring sap rise'],
      isOptimalPlantingSeason: false
    },
    {
      month: 'March',
      season: 'Spring',
      plantingTasks: ['Prime planting window for bare-root native trees as ground thaws', 'Plant early spring pollinators'],
      wateringGuidelines: 'Thorough initial soaking at planting (10-15 gallons/sapling).',
      soilAndMulchTasks: ['Broadfork compacted planting pits; integrate mycorrhizal inoculant'],
      pruningAndCare: ['Remove winter tree trunk wraps as rodents become less active'],
      isOptimalPlantingSeason: true
    },
    {
      month: 'April',
      season: 'Spring',
      plantingTasks: ['Peak containerized tree planting season', 'Seed native tallgrass prairie & wildflower meadows'],
      wateringGuidelines: 'Weekly deep soaking if natural rain is under 25mm/week.',
      soilAndMulchTasks: ['Apply fresh 3-inch composted woodchip mulch donut ring'],
      pruningAndCare: ['Stake high-wind exposure saplings with flexible webbing'],
      isOptimalPlantingSeason: true
    },
    {
      month: 'May',
      season: 'Spring',
      plantingTasks: ['Late containerized planting; establish warm-season groundcover'],
      wateringGuidelines: 'Begin automated drip irrigation cycles (10 gal weekly per caliper inch).',
      soilAndMulchTasks: ['Top-dress organic compost around drip line'],
      pruningAndCare: ['Inspect young stems for early aphid or caterpillar leaf damage'],
      isOptimalPlantingSeason: true
    },
    {
      month: 'June',
      season: 'Summer',
      plantingTasks: ['Avoid new bare-root planting; focus on weed suppression'],
      wateringGuidelines: 'Increase trickle watering frequency during early heat waves.',
      soilAndMulchTasks: ['Replenish decomposed mulch to prevent soil bake'],
      pruningAndCare: ['Prune dead lower suckers to direct sap flow to primary leader'],
      isOptimalPlantingSeason: false
    },
    {
      month: 'July',
      season: 'Summer',
      plantingTasks: ['Survival stewardship phase; pause new transplanting'],
      wateringGuidelines: 'Deep morning soak every 4-5 days during dry spells.',
      soilAndMulchTasks: ['Verify mulch keeps root zone 5°C cooler than ambient air'],
      pruningAndCare: ['Monitor leaf transpiration and check for heat scorch'],
      isOptimalPlantingSeason: false
    },
    {
      month: 'August',
      season: 'Summer',
      plantingTasks: ['Maintain watering vigilance; plan autumn planting sites'],
      wateringGuidelines: 'Crucial root hydration phase to prevent late-summer root desiccation.',
      soilAndMulchTasks: ['Pre-dig autumn planting holes and blend in compost'],
      pruningAndCare: ['Check staking ties; loosen any girdling wire'],
      isOptimalPlantingSeason: false
    },
    {
      month: 'September',
      season: 'Autumn',
      plantingTasks: ['Autumn planting season begins: ideal soil warmth & cool air', 'Plant containerized keystone trees'],
      wateringGuidelines: 'Consistent bi-weekly deep soaking to establish root anchoring.',
      soilAndMulchTasks: ['Rake fallen leaf mulch around perimeter for humus development'],
      pruningAndCare: ['Zero nitrogen fertilizer (prevents tender frost-vulnerable growth)'],
      isOptimalPlantingSeason: true
    },
    {
      month: 'October',
      season: 'Autumn',
      plantingTasks: ['Prime autumn hardwood planting window', 'Divide native perennial pollinator crowns'],
      wateringGuidelines: 'Deep soak newly planted trees thoroughly before dormancy.',
      soilAndMulchTasks: ['Apply clean hardwood woodchips keeping trunk flare exposed'],
      pruningAndCare: ['Install hardware cloth trunk protectors against deer and rabbits'],
      isOptimalPlantingSeason: true
    },
    {
      month: 'November',
      season: 'Autumn',
      plantingTasks: ['Final late-season bareroot tree planting before hard freeze'],
      wateringGuidelines: 'Give all young trees one heavy final pre-freeze soak.',
      soilAndMulchTasks: ['Ensure 4-inch insulating mulch cover over root zone'],
      pruningAndCare: ['Inspect stakes to ensure winter gale stability'],
      isOptimalPlantingSeason: true
    },
    {
      month: 'December',
      season: 'Winter',
      plantingTasks: ['Dormant winter observation & bird habitat monitoring'],
      wateringGuidelines: 'No watering needed during ground frost.',
      soilAndMulchTasks: ['Leave fallen leaves and perennial seedheads for wintering fauna'],
      pruningAndCare: ['Brush heavy wet snow off young branches to prevent limb shear'],
      isOptimalPlantingSeason: false
    }
  ];
}

// ==========================================
// 9. PLANTING PLANS CRUD
// ==========================================

export async function savePlantingPlan(
  plan: Partial<DbPlantingPlan>,
  userId?: string
): Promise<{ data: DbPlantingPlan | null; error: Error | null; fromSupabase: boolean }> {
  const payload = {
    user_id: userId || null,
    plan_name: plan.plan_name || 'My Ecological Planting Plan',
    location_name: plan.location_name || 'Selected Restoration Plot',
    selected_species: plan.selected_species || [],
    total_area_sqm: plan.total_area_sqm || 100,
    total_plants: plan.total_plants || 10,
    layout_type: plan.layout_type || 'Square Grid',
    biodiversity_score: plan.biodiversity_score || 80,
    climate_suitability_score: plan.climate_suitability_score || 85,
    risk_score: plan.risk_score || 20,
    status: plan.status || 'draft',
    updated_at: new Date().toISOString()
  };

  try {
    const { data, error } = await supabase.from('planting_plans').insert(payload).select().single();
    if (!error && data) {
      localPlantingPlans.unshift(data as DbPlantingPlan);
      return { data: data as DbPlantingPlan, error: null, fromSupabase: true };
    }
  } catch (err) {
    console.warn('[Greenverse PlantingPlan] Supabase error:', err);
  }

  const localRecord: DbPlantingPlan = {
    id: `plan-${Date.now()}`,
    ...payload,
    created_at: new Date().toISOString()
  };
  localPlantingPlans.unshift(localRecord);
  return { data: localRecord, error: null, fromSupabase: false };
}

export async function fetchPlantingPlans(userId?: string): Promise<{ data: DbPlantingPlan[]; fromSupabase: boolean }> {
  try {
    let query = supabase.from('planting_plans').select('*').order('created_at', { ascending: false });
    if (userId) {
      query = query.or(`user_id.eq.${userId},user_id.is.null`);
    }
    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      return { data: data as DbPlantingPlan[], fromSupabase: true };
    }
  } catch (err) {
    console.warn('[Greenverse PlantingPlan] fetch error:', err);
  }

  return { data: localPlantingPlans, fromSupabase: false };
}
