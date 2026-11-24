import { supabase } from '../lib/supabase';
import {
  DbTree,
  DbCareTask,
  DbGrowthLog,
  DbAdoption,
  DbHealthRecord,
  RegisterTreeInput,
  CreateCareTaskInput,
  CreateGrowthLogInput,
  AdoptTreeInput,
  CreateHealthRecordInput,
  CareTaskType
} from '../types/tree';

// Fallback initial seeds displayed when Supabase tables are freshly initialized or empty
export const FALLBACK_TREES: DbTree[] = [
  {
    id: 'b1-tree-101',
    tree_code: 'GV-OAK-9821',
    name: 'Council Bur Oak Twin',
    species: 'Bur Oak',
    scientific_name: 'Quercus macrocarpa',
    planting_date: '2024-04-12',
    location_description: 'Cedar Bend Urban Canopy Phase II, Upper Mississippi Watershed',
    latitude: 44.9778,
    longitude: -93.2650,
    photo_url: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=600&q=80',
    health_status: 'thriving',
    height_meters: 3.4,
    dbh_cm: 8.6,
    carbon_offset_kg: 58.4,
    notes: 'Exceptional deep root anchoring. Native mycorrhizal inoculum applied at planting.',
    user_id: null,
    created_at: '2024-04-12T10:00:00Z',
    updated_at: '2026-11-18T14:30:00Z'
  },
  {
    id: 'b1-tree-102',
    tree_code: 'GV-MAN-4019',
    name: 'Biscayne Sentinel Mangrove',
    species: 'Red Mangrove',
    scientific_name: 'Rhizophora mangle',
    planting_date: '2025-02-04',
    location_description: 'Pelican Shoals Estuary, Biscayne Coastal Biosphere',
    latitude: 25.7617,
    longitude: -80.1918,
    photo_url: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=600&q=80',
    health_status: 'thriving',
    height_meters: 1.8,
    dbh_cm: 4.2,
    carbon_offset_kg: 84.1,
    notes: 'Prop roots expanding rapidly. Salinity resilience verified.',
    user_id: null,
    created_at: '2025-02-04T09:00:00Z',
    updated_at: '2026-11-20T11:00:00Z'
  },
  {
    id: 'b1-tree-103',
    tree_code: 'GV-CED-1104',
    name: 'Skykomish Western Red Cedar',
    species: 'Western Red Cedar',
    scientific_name: 'Thuja plicata',
    planting_date: '2023-10-15',
    location_description: 'Skykomish River Corridor Buffer, Cascadia Old Growth',
    latitude: 47.6062,
    longitude: -122.3321,
    photo_url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80',
    health_status: 'attention_required',
    height_meters: 4.2,
    dbh_cm: 11.2,
    carbon_offset_kg: 92.6,
    notes: 'Soil moisture telemetry detected lower hydration. Supplementary mulch and trickle irrigation requested.',
    user_id: null,
    created_at: '2023-10-15T08:00:00Z',
    updated_at: '2026-11-22T16:00:00Z'
  }
];

// In-memory runtime cache for seamless local testing when migrations are pending execution
let localTreesCache: DbTree[] = [...FALLBACK_TREES];
let localTasksCache: DbCareTask[] = [
  {
    id: 'task-1',
    tree_id: 'b1-tree-103',
    user_id: null,
    task_type: 'Mulching',
    title: 'Apply 3-inch cedar woodchip mulch collar',
    description: 'Protect root flare from heat stress and suppress competitive grass.',
    due_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    completed: false,
    completed_at: null,
    priority: 'high',
    created_at: new Date().toISOString()
  },
  {
    id: 'task-2',
    tree_id: 'b1-tree-101',
    user_id: null,
    task_type: 'Inspection',
    title: 'Pre-winter dormant root flare inspection',
    description: 'Ensure soil settling has not buried root flare post-rain.',
    due_date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    completed: false,
    completed_at: null,
    priority: 'medium',
    created_at: new Date().toISOString()
  }
];
let localGrowthCache: DbGrowthLog[] = [];
let localAdoptionsCache: DbAdoption[] = [];
let localHealthCache: DbHealthRecord[] = [];

// ==========================================
// A & B. TREE REGISTRATION & MY TREES
// ==========================================

export async function fetchTrees(options?: { userId?: string; search?: string }): Promise<{
  data: DbTree[];
  error: Error | null;
  fromSupabase: boolean;
}> {
  try {
    let query = supabase.from('trees').select('*').order('created_at', { ascending: false });

    if (options?.userId) {
      query = query.eq('user_id', options.userId);
    }

    const { data, error } = await query;

    if (error) {
      console.warn('[Greenverse Trees] Notice on fetching trees:', error.message);
      // Filter local cache gracefully
      let filtered = [...localTreesCache];
      if (options?.userId) {
        filtered = filtered.filter(t => t.user_id === options.userId);
      }
      if (options?.search) {
        const s = options.search.toLowerCase();
        filtered = filtered.filter(t =>
          t.tree_code.toLowerCase().includes(s) ||
          t.species.toLowerCase().includes(s) ||
          (t.name && t.name.toLowerCase().includes(s))
        );
      }
      return { data: filtered, error: new Error(error.message), fromSupabase: false };
    }

    if (data && data.length > 0) {
      // Merge unique entries to local cache
      const map = new Map<string, DbTree>();
      data.forEach((t: DbTree) => map.set(t.id, t));
      localTreesCache.forEach(t => {
        if (!map.has(t.id)) map.set(t.id, t);
      });
      return { data, error: null, fromSupabase: true };
    }

    // If database returned 0 rows, return local baseline
    let result = localTreesCache;
    if (options?.userId) {
      result = result.filter(t => t.user_id === options.userId);
    }
    return { data: result, error: null, fromSupabase: true };
  } catch (err: any) {
    return { data: localTreesCache, error: err, fromSupabase: false };
  }
}

export async function fetchTreeByIdOrCode(idOrCode: string): Promise<DbTree | null> {
  try {
    // 1. Try by UUID
    const { data: byId } = await supabase.from('trees').select('*').eq('id', idOrCode).maybeSingle();
    if (byId) return byId as DbTree;

    // 2. Try by tree_code
    const { data: byCode } = await supabase.from('trees').select('*').eq('tree_code', idOrCode).maybeSingle();
    if (byCode) return byCode as DbTree;
  } catch (err) {
    console.warn('[Greenverse Trees] ID lookup exception:', err);
  }

  // Check local cache
  const found = localTreesCache.find(t => t.id === idOrCode || t.tree_code.toUpperCase() === idOrCode.toUpperCase());
  return found || null;
}

export async function registerTree(input: RegisterTreeInput, userId?: string): Promise<{
  data: DbTree | null;
  error: Error | null;
  fromSupabase: boolean;
}> {
  // Generate distinct passport code: GV-TR-XXXXX
  const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
  const treeCode = `GV-TR-${randomSuffix}`;

  const payload = {
    tree_code: treeCode,
    name: input.name?.trim() || input.species,
    species: input.species.trim(),
    scientific_name: input.scientific_name?.trim() || null,
    planting_date: input.planting_date,
    location_description: input.location_description.trim(),
    latitude: input.latitude !== undefined && input.latitude !== null ? Number(input.latitude) : null,
    longitude: input.longitude !== undefined && input.longitude !== null ? Number(input.longitude) : null,
    photo_url: input.photo_url || null,
    health_status: input.health_status,
    height_meters: input.height_meters ? Number(input.height_meters) : 1.2,
    dbh_cm: input.dbh_cm ? Number(input.dbh_cm) : 2.5,
    carbon_offset_kg: Number(((input.height_meters || 1.2) * 5.2).toFixed(1)),
    notes: input.notes?.trim() || null,
    user_id: userId || null,
  };

  try {
    const { data, error } = await supabase.from('trees').insert(payload).select().single();

    if (error) {
      console.warn('[Greenverse Trees] Supabase insertion error:', error.message);
      // Construct realistic local entry with note on database sync
      const localTree: DbTree = {
        id: `tree-${Date.now()}`,
        ...payload,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      localTreesCache.unshift(localTree);
      return { data: localTree, error: new Error(error.message), fromSupabase: false };
    }

    if (data) {
      localTreesCache.unshift(data as DbTree);
      return { data: data as DbTree, error: null, fromSupabase: true };
    }
  } catch (err: any) {
    const localTree: DbTree = {
      id: `tree-${Date.now()}`,
      ...payload,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    localTreesCache.unshift(localTree);
    return { data: localTree, error: err, fromSupabase: false };
  }

  return { data: null, error: new Error('Unknown registration error occurred.'), fromSupabase: false };
}

// ==========================================
// E. GROWTH JOURNAL
// ==========================================

export async function fetchGrowthLogs(treeId: string): Promise<DbGrowthLog[]> {
  try {
    const { data, error } = await supabase
      .from('tree_growth_logs')
      .select('*')
      .eq('tree_id', treeId)
      .order('recorded_date', { ascending: false });

    if (!error && data && data.length > 0) {
      return data as DbGrowthLog[];
    }
  } catch (err) {
    console.warn('[Greenverse Growth] fetch error:', err);
  }

  return localGrowthCache.filter(g => g.tree_id === treeId);
}

export async function createGrowthLog(input: CreateGrowthLogInput, userId?: string): Promise<{
  data: DbGrowthLog | null;
  error: Error | null;
}> {
  const payload = {
    tree_id: input.tree_id,
    user_id: userId || null,
    recorded_date: input.recorded_date,
    height_meters: input.height_meters ? Number(input.height_meters) : null,
    dbh_cm: input.dbh_cm ? Number(input.dbh_cm) : null,
    health_status: input.health_status,
    observations: input.observations?.trim() || null,
    photo_url: input.photo_url || null,
  };

  try {
    const { data, error } = await supabase.from('tree_growth_logs').insert(payload).select().single();

    if (!error && data) {
      localGrowthCache.unshift(data as DbGrowthLog);

      // Also update tree biometrics in trees table
      if (input.height_meters || input.dbh_cm || input.health_status) {
        await supabase.from('trees').update({
          ...(input.height_meters ? { height_meters: Number(input.height_meters) } : {}),
          ...(input.dbh_cm ? { dbh_cm: Number(input.dbh_cm) } : {}),
          health_status: input.health_status,
          updated_at: new Date().toISOString()
        }).eq('id', input.tree_id);
      }

      return { data: data as DbGrowthLog, error: null };
    }

    if (error) {
      const fallbackLog: DbGrowthLog = {
        id: `growth-${Date.now()}`,
        ...payload,
        created_at: new Date().toISOString(),
      };
      localGrowthCache.unshift(fallbackLog);
      return { data: fallbackLog, error: new Error(error.message) };
    }
  } catch (err: any) {
    const fallbackLog: DbGrowthLog = {
      id: `growth-${Date.now()}`,
      ...payload,
      created_at: new Date().toISOString(),
    };
    localGrowthCache.unshift(fallbackLog);
    return { data: fallbackLog, error: err };
  }

  return { data: null, error: new Error('Failed to record growth update.') };
}

// ==========================================
// F. ADOPT-A-TREE / GUARDIANSHIP
// ==========================================

export async function fetchTreeAdoptions(treeId?: string): Promise<DbAdoption[]> {
  try {
    let q = supabase.from('tree_adoptions').select('*').order('adoption_date', { ascending: false });
    if (treeId) q = q.eq('tree_id', treeId);
    const { data, error } = await q;

    if (!error && data && data.length > 0) {
      return data as DbAdoption[];
    }
  } catch (err) {
    console.warn('[Greenverse Adoptions] fetch error:', err);
  }

  return treeId ? localAdoptionsCache.filter(a => a.tree_id === treeId) : localAdoptionsCache;
}

export async function adoptTree(input: AdoptTreeInput, userId: string): Promise<{
  data: DbAdoption | null;
  error: Error | null;
}> {
  // Check local cache for duplicate active adoption
  const alreadyAdoptedLocally = localAdoptionsCache.some(
    a => a.tree_id === input.tree_id && a.user_id === userId && a.status === 'active'
  );
  if (alreadyAdoptedLocally) {
    return { data: null, error: new Error('You are already an active guardian for this tree.') };
  }

  const payload = {
    tree_id: input.tree_id,
    user_id: userId,
    guardian_name: input.guardian_name.trim(),
    guardian_message: input.guardian_message?.trim() || null,
    adoption_date: new Date().toISOString(),
    status: 'active' as const,
  };

  try {
    const { data, error } = await supabase.from('tree_adoptions').insert(payload).select().single();

    if (!error && data) {
      localAdoptionsCache.unshift(data as DbAdoption);
      return { data: data as DbAdoption, error: null };
    }

    if (error) {
      if (error.message.includes('unique') || error.code === '23505') {
        return { data: null, error: new Error('You have already adopted this tree.') };
      }
      const fallbackAdoption: DbAdoption = {
        id: `adopt-${Date.now()}`,
        ...payload,
        created_at: new Date().toISOString(),
      };
      localAdoptionsCache.unshift(fallbackAdoption);
      return { data: fallbackAdoption, error: new Error(error.message) };
    }
  } catch (err: any) {
    const fallbackAdoption: DbAdoption = {
      id: `adopt-${Date.now()}`,
      ...payload,
      created_at: new Date().toISOString(),
    };
    localAdoptionsCache.unshift(fallbackAdoption);
    return { data: fallbackAdoption, error: err };
  }

  return { data: null, error: new Error('Adoption request could not be processed.') };
}

// ==========================================
// G. TREE CARE & SURVIVAL PLANNER & TASKS
// ==========================================

export async function fetchTreeCareTasks(treeId?: string): Promise<DbCareTask[]> {
  try {
    let q = supabase.from('tree_care_tasks').select('*').order('due_date', { ascending: true });
    if (treeId) q = q.eq('tree_id', treeId);
    const { data, error } = await q;

    if (!error && data && data.length > 0) {
      return data as DbCareTask[];
    }
  } catch (err) {
    console.warn('[Greenverse Tasks] fetch error:', err);
  }

  return treeId ? localTasksCache.filter(t => t.tree_id === treeId) : localTasksCache;
}

export async function createCareTask(input: CreateCareTaskInput, userId?: string): Promise<{
  data: DbCareTask | null;
  error: Error | null;
}> {
  const payload = {
    tree_id: input.tree_id || null,
    user_id: userId || null,
    task_type: input.task_type,
    title: input.title.trim(),
    description: input.description?.trim() || null,
    due_date: input.due_date,
    completed: false,
    completed_at: null,
    priority: input.priority,
  };

  try {
    const { data, error } = await supabase.from('tree_care_tasks').insert(payload).select().single();

    if (!error && data) {
      localTasksCache.unshift(data as DbCareTask);
      return { data: data as DbCareTask, error: null };
    }

    if (error) {
      const fallbackTask: DbCareTask = {
        id: `task-${Date.now()}`,
        ...payload,
        created_at: new Date().toISOString(),
      };
      localTasksCache.unshift(fallbackTask);
      return { data: fallbackTask, error: new Error(error.message) };
    }
  } catch (err: any) {
    const fallbackTask: DbCareTask = {
      id: `task-${Date.now()}`,
      ...payload,
      created_at: new Date().toISOString(),
    };
    localTasksCache.unshift(fallbackTask);
    return { data: fallbackTask, error: err };
  }

  return { data: null, error: new Error('Task creation could not be completed.') };
}

export async function toggleCareTask(taskId: string, completed: boolean): Promise<boolean> {
  const completed_at = completed ? new Date().toISOString() : null;

  try {
    const { error } = await supabase
      .from('tree_care_tasks')
      .update({ completed, completed_at })
      .eq('id', taskId);

    if (!error) {
      localTasksCache = localTasksCache.map(t =>
        t.id === taskId ? { ...t, completed, completed_at } : t
      );
      return true;
    }
  } catch (err) {
    console.warn('[Greenverse Tasks] Toggle error:', err);
  }

  // Update in local cache
  localTasksCache = localTasksCache.map(t =>
    t.id === taskId ? { ...t, completed, completed_at } : t
  );
  return true;
}

// Rule-based seasonal care planner
export function getSpeciesCareGuidelines(species: string): {
  wateringRule: string;
  mulchRule: string;
  inspectionSeason: string;
  winterPrep: string;
} {
  const s = species.toLowerCase();

  if (s.includes('oak')) {
    return {
      wateringRule: 'Deep monthly soak during hot summer droughts (15-20 gal). Avoid saturated roots.',
      mulchRule: '2-3 inches organic hardwood mulch spread to drip-line, 3 inches away from trunk collar.',
      inspectionSeason: 'Early Autumn: inspect lower canopy for vein necrosis or gall wasps.',
      winterPrep: 'Protect young stems from rodent gnawing with breathable mesh tree guard.'
    };
  }

  if (s.includes('cedar') || s.includes('spruce')) {
    return {
      wateringRule: 'Moisture retentive: trickle water bi-weekly during dry spells. Requires 50%+ root humidity.',
      mulchRule: '3-4 inches acidic cedar or pine needle mulch to stabilize root temperature.',
      inspectionSeason: 'Late Spring: inspect branch tips for desiccation or spider mites.',
      winterPrep: 'Lightly brush heavy wet snow loads off young lateral branches to prevent limb shear.'
    };
  }

  if (s.includes('mangrove')) {
    return {
      wateringRule: 'Brackish or tidal flush daily. Ensure aerial lenticels remain unblocked by silt runoff.',
      mulchRule: 'Organic marine detritus. No standard terrestrial wood mulch needed.',
      inspectionSeason: 'Post-storm tidal cycle: check prop root stability and sediment deposition.',
      winterPrep: 'Monitor cold snaps: mangroves suffer damage if air temperature drops below 4°C.'
    };
  }

  // Default keystone hardwood rules
  return {
    wateringRule: '10 gallons per caliper inch weekly during establishment years 1-3.',
    mulchRule: 'Donut-shaped mulch ring 3 feet wide, keeping root flare completely exposed.',
    inspectionSeason: 'Mid-summer: check leaf vigor, leaf color chlorosis, and soil probe reading.',
    winterPrep: 'Apply deep watering in late autumn prior to ground freeze.'
  };
}

// ==========================================
// H. TREE HEALTH RECORDS
// ==========================================

export async function fetchHealthRecords(treeId?: string): Promise<DbHealthRecord[]> {
  try {
    let q = supabase.from('tree_health_records').select('*').order('recorded_date', { ascending: false });
    if (treeId) q = q.eq('tree_id', treeId);
    const { data, error } = await q;

    if (!error && data && data.length > 0) {
      return data as DbHealthRecord[];
    }
  } catch (err) {
    console.warn('[Greenverse Health] fetch error:', err);
  }

  return treeId ? localHealthCache.filter(h => h.tree_id === treeId) : localHealthCache;
}

export async function createHealthRecord(input: CreateHealthRecordInput, userId?: string): Promise<{
  data: DbHealthRecord | null;
  error: Error | null;
}> {
  // Generate rule-based organic triage suggestion
  let suggested = input.suggested_actions;
  if (!suggested) {
    if (input.symptoms.includes('Yellowing Foliage / Chlorosis')) {
      suggested = 'Rule-based Suggestion: Aerate soil to prevent root saturation; apply balanced chelated iron biostimulant.';
    } else if (input.symptoms.includes('Leaf Wilting & Flagging')) {
      suggested = 'Rule-based Suggestion: Inspect root zone for desiccation. Provide deep trickle irrigation immediately.';
    } else if (input.symptoms.includes('Bark Lesions or Cankers')) {
      suggested = 'Rule-based Suggestion: Sterilize pruning tools; apply organic copper fungicide spray during dormancy.';
    } else {
      suggested = 'Rule-based Suggestion: Expand mulch perimeter and monitor moisture telemetry weekly.';
    }
  }

  const payload = {
    tree_id: input.tree_id,
    user_id: userId || null,
    recorded_date: input.recorded_date,
    symptoms: input.symptoms,
    observations: input.observations.trim(),
    severity: input.severity,
    suggested_actions: suggested,
    status: 'open' as const,
  };

  try {
    const { data, error } = await supabase.from('tree_health_records').insert(payload).select().single();

    if (!error && data) {
      localHealthCache.unshift(data as DbHealthRecord);

      // If severity is severe, update tree health status
      if (input.severity === 'severe') {
        await supabase.from('trees').update({
          health_status: 'attention_required',
          updated_at: new Date().toISOString()
        }).eq('id', input.tree_id);
      }

      return { data: data as DbHealthRecord, error: null };
    }

    if (error) {
      const fallbackRecord: DbHealthRecord = {
        id: `health-${Date.now()}`,
        ...payload,
        created_at: new Date().toISOString(),
      };
      localHealthCache.unshift(fallbackRecord);
      return { data: fallbackRecord, error: new Error(error.message) };
    }
  } catch (err: any) {
    const fallbackRecord: DbHealthRecord = {
      id: `health-${Date.now()}`,
      ...payload,
      created_at: new Date().toISOString(),
    };
    localHealthCache.unshift(fallbackRecord);
    return { data: fallbackRecord, error: err };
  }

  return { data: null, error: new Error('Health record could not be saved.') };
}
