// Greenverse Batch 1: Tree Ecosystem Domain Types

export type HealthStatus = 'thriving' | 'stable' | 'attention_required' | 'critical';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type CareTaskType = 'Watering' | 'Mulching' | 'Pruning' | 'Inspection' | 'Sensor Check' | 'Fertilization';

export interface DbTree {
  id: string;
  tree_code: string;
  name: string | null;
  species: string;
  scientific_name: string | null;
  planting_date: string;
  location_description: string | null;
  latitude: number | null;
  longitude: number | null;
  photo_url: string | null;
  health_status: HealthStatus;
  height_meters: number;
  dbh_cm: number;
  carbon_offset_kg: number;
  notes: string | null;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbCareTask {
  id: string;
  tree_id: string | null;
  user_id: string | null;
  task_type: CareTaskType;
  title: string;
  description: string | null;
  due_date: string;
  completed: boolean;
  completed_at: string | null;
  priority: TaskPriority;
  created_at: string;
}

export interface DbGrowthLog {
  id: string;
  tree_id: string;
  user_id: string | null;
  recorded_date: string;
  height_meters: number | null;
  dbh_cm: number | null;
  health_status: HealthStatus;
  observations: string | null;
  photo_url: string | null;
  created_at: string;
}

export interface DbAdoption {
  id: string;
  tree_id: string;
  user_id: string;
  guardian_name: string;
  guardian_message: string | null;
  adoption_date: string;
  status: 'active' | 'concluded';
  created_at: string;
}

export interface DbHealthRecord {
  id: string;
  tree_id: string;
  user_id: string | null;
  recorded_date: string;
  symptoms: string[];
  observations: string;
  severity: 'mild' | 'moderate' | 'severe';
  suggested_actions: string | null;
  status: 'open' | 'under_care' | 'resolved';
  created_at: string;
}

export interface RegisterTreeInput {
  name?: string;
  species: string;
  scientific_name?: string;
  planting_date: string;
  location_description: string;
  latitude?: number | null;
  longitude?: number | null;
  photo_url?: string;
  health_status: HealthStatus;
  height_meters?: number;
  dbh_cm?: number;
  notes?: string;
}

export interface CreateCareTaskInput {
  tree_id?: string;
  task_type: CareTaskType;
  title: string;
  description?: string;
  due_date: string;
  priority: TaskPriority;
}

export interface CreateGrowthLogInput {
  tree_id: string;
  recorded_date: string;
  height_meters?: number;
  dbh_cm?: number;
  health_status: HealthStatus;
  observations?: string;
  photo_url?: string;
}

export interface AdoptTreeInput {
  tree_id: string;
  guardian_name: string;
  guardian_message?: string;
}

export interface CreateHealthRecordInput {
  tree_id: string;
  recorded_date: string;
  symptoms: string[];
  observations: string;
  severity: 'mild' | 'moderate' | 'severe';
  suggested_actions?: string;
}
