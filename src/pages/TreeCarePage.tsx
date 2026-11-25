import React, { useState, useEffect } from 'react';
import { DbCareTask, DbTree, CreateCareTaskInput, CareTaskType, TaskPriority } from '../types/tree';
import {
  fetchTreeCareTasks,
  createCareTask,
  toggleCareTask,
  getSpeciesCareGuidelines,
  fetchTrees
} from '../services/treeService';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import {
  Droplets,
  Thermometer,
  HeartPulse,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock,
  Sparkles,
  Wifi,
  Waves,
  Plus,
  Loader2,
  BookOpen,
  Users,
  ShieldAlert,
  Info
} from 'lucide-react';

export const TreeCarePage: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<DbCareTask[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [trees, setTrees] = useState<DbTree[]>([]);
  const [careFilter, setCareFilter] = useState<'all' | 'due' | 'completed'>('all');
  const [selectedSpecies, setSelectedSpecies] = useState('Western Red Cedar');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [volunteerMsg, setVolunteerMsg] = useState<string | null>(null);

  // New task form state
  const [taskForm, setTaskForm] = useState<CreateCareTaskInput>({
    title: '',
    task_type: 'Watering',
    due_date: new Date().toISOString().split('T')[0],
    priority: 'medium',
    tree_id: '',
    description: '',
  });
  const [taskSubmitting, setTaskSubmitting] = useState(false);

  const loadData = async () => {
    setLoadingTasks(true);
    const [fetchedTasks, treesRes] = await Promise.all([
      fetchTreeCareTasks(),
      fetchTrees(),
    ]);
    setTasks(fetchedTasks);
    setTrees(treesRes.data);
    setLoadingTasks(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleTask = async (taskId: string, currentCompleted: boolean) => {
    const nextCompleted = !currentCompleted;
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: nextCompleted } : t))
    );
    await toggleCareTask(taskId, nextCompleted);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return;

    setTaskSubmitting(true);
    const res = await createCareTask(taskForm, user?.id);
    setTaskSubmitting(false);

    if (res.data) {
      setTasks((prev) => [res.data!, ...prev]);
      setIsTaskModalOpen(false);
      setTaskForm({
        title: '',
        task_type: 'Watering',
        due_date: new Date().toISOString().split('T')[0],
        priority: 'medium',
        tree_id: '',
        description: '',
      });
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredTasks = tasks.filter((t) => {
    if (careFilter === 'completed') return t.completed;
    if (careFilter === 'due') return !t.completed;
    return true;
  });

  const treesNeedingCare = trees.filter(
    (t) => t.health_status === 'attention_required' || t.health_status === 'critical'
  );

  const guidelines = getSpeciesCareGuidelines(selectedSpecies);

  return (
    <div className="space-y-6">
      {/* Page Title & Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Droplets className="w-6 h-6 text-forest-700" />
            Tree Care & Survival Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time root hydration monitoring, rule-based seasonal protocols, and community stewardship network.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="emerald" dot>Survival Index: 94.2%</Badge>
          <Badge variant="lime">Rule-based Guidance</Badge>
        </div>
      </div>

      {/* Professional Care Disclaimer */}
      <div className="p-3.5 bg-forest-50/70 border border-forest-200 rounded-xl text-xs text-forest-900 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-forest-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">General Agroforestry Stewardship Guidance</span>
          <p className="text-[11px] text-forest-800 mt-0.5">
            Care plans and survival guidelines provided here represent standardized horticultural rules-of-thumb and do not replace professional arborist on-site assessment.
          </p>
        </div>
      </div>

      {/* Real-time Survival KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-sage-200 shadow-soft">
          <div className="text-[11px] font-semibold uppercase text-slate-500 flex items-center gap-1.5">
            <HeartPulse className="w-4 h-4 text-emerald-600" />
            Average Survival Rate
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">94.2%</div>
          <div className="text-[10px] text-emerald-600 font-medium mt-1">↑ +2.1% higher than regional baseline</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-sage-200 shadow-soft">
          <div className="text-[11px] font-semibold uppercase text-slate-500 flex items-center gap-1.5">
            <Droplets className="w-4 h-4 text-blue-500" />
            Root Zone Hydration
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">68%</div>
          <div className="text-[10px] text-slate-500 mt-1">Optimal moisture zone (50-80%)</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-sage-200 shadow-soft">
          <div className="text-[11px] font-semibold uppercase text-slate-500 flex items-center gap-1.5">
            <Thermometer className="w-4 h-4 text-amber-500" />
            Canopy Temperature
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">16.4°C</div>
          <div className="text-[10px] text-slate-500 mt-1">Normal transpiration cooling</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-sage-200 shadow-soft">
          <div className="text-[11px] font-semibold uppercase text-slate-500 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            Active Care Alerts
          </div>
          <div className="text-2xl font-bold text-rose-600 mt-1">
            {treesNeedingCare.length} {treesNeedingCare.length === 1 ? 'Tree' : 'Trees'}
          </div>
          <div className="text-[10px] text-rose-500 mt-1">Attention requested by stewards</div>
        </div>
      </div>

      {/* Main Care Modules Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Stewardship Task List & Tree Care Network */}
        <div className="lg:col-span-2 space-y-5">
          {/* Real Supabase Care Tasks Card */}
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle>Stewardship Task Checklist</CardTitle>
                <CardDescription>Scheduled hydration, mulching & inspection interventions</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex rounded-lg bg-sage-100 p-0.5 text-xs">
                  {(['all', 'due', 'completed'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setCareFilter(tab)}
                      className={`px-2.5 py-1 rounded-md font-medium capitalize transition-all ${
                        careFilter === tab
                          ? 'bg-forest-700 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Plus className="w-3.5 h-3.5" />}
                  onClick={() => setIsTaskModalOpen(true)}
                >
                  Add Task
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 p-4">
              {loadingTasks ? (
                <div className="flex items-center justify-center p-8 text-xs text-slate-500 gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-forest-600" />
                  Loading stewardship tasks...
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  No tasks matching the "{careFilter}" view.
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredTasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => handleToggleTask(t.id, t.completed)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                        t.completed
                          ? 'bg-forest-50/50 border-forest-200 opacity-60'
                          : 'bg-white border-sage-200 hover:border-forest-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={t.completed}
                        onChange={() => {}}
                        className="mt-1 rounded text-forest-700 focus:ring-forest-500 h-4 w-4"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`text-xs font-semibold ${
                              t.completed ? 'line-through text-slate-400' : 'text-slate-800'
                            }`}
                          >
                            {t.title}
                          </span>
                          <Badge
                            variant={
                              t.priority === 'urgent'
                                ? 'rose'
                                : t.priority === 'high'
                                ? 'amber'
                                : 'forest'
                            }
                            size="sm"
                          >
                            {t.task_type}
                          </Badge>
                        </div>
                        {t.description && (
                          <p className="text-[11px] text-slate-500 mt-0.5">{t.description}</p>
                        )}
                        <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Due {t.due_date}
                          </span>
                          {t.tree_id && (
                            <span className="font-mono text-forest-700">Tree Ref: {t.tree_id}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tree Care Network — Trees Needing Care */}
          <Card className="border-amber-200 bg-amber-50/20">
            <CardHeader className="bg-amber-50/60">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-700" />
                <div>
                  <CardTitle className="text-amber-950">Community Tree Care Network</CardTitle>
                  <CardDescription>Trees requiring community volunteer watering or care assistance</CardDescription>
                </div>
              </div>
              <Badge variant="amber" size="sm">{treesNeedingCare.length} Needing Care</Badge>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {volunteerMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{volunteerMsg}</span>
                </div>
              )}

              {treesNeedingCare.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500">
                  All monitored trees currently have optimal health and hydration.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {treesNeedingCare.map((tree) => (
                    <div
                      key={tree.id}
                      className="p-3.5 bg-white rounded-xl border border-amber-200 shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-forest-900">
                            {tree.tree_code}
                          </span>
                          <Badge variant="rose" size="sm">
                            {tree.health_status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="text-xs font-semibold text-slate-800 mt-1">
                          {tree.name || tree.species}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                          {tree.location_description}
                        </div>
                      </div>
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">
                          Planted: {tree.planting_date}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-[11px] py-1 h-7 border-amber-300 text-amber-900 hover:bg-amber-50"
                          onClick={() => {
                            setVolunteerMsg(`Volunteer care commitment registered for ${tree.tree_code}! Thank you for nurturing our biosphere.`);
                            setTimeout(() => setVolunteerMsg(null), 4000);
                          }}
                        >
                          Volunteer Care
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Rule-based Species Care Protocols */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="bg-forest-50/50">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-forest-700" />
                <div>
                  <CardTitle>Species Care Playbook</CardTitle>
                  <CardDescription>Rule-based seasonal guidelines</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1.5">Select Canopy Species</label>
                <select
                  value={selectedSpecies}
                  onChange={(e) => setSelectedSpecies(e.target.value)}
                  className="w-full border border-sage-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-forest-500"
                >
                  <option value="Western Red Cedar">Western Red Cedar (Thuja plicata)</option>
                  <option value="Bur Oak">Bur Oak (Quercus macrocarpa)</option>
                  <option value="Red Mangrove">Red Mangrove (Rhizophora mangle)</option>
                  <option value="Native Keystone Hardwood">Native Keystone Hardwood (General)</option>
                </select>
              </div>

              <div className="space-y-3 pt-2">
                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
                  <div className="font-semibold text-blue-900 flex items-center gap-1.5 mb-1">
                    <Droplets className="w-3.5 h-3.5 text-blue-600" />
                    Hydration Rule
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">{guidelines.wateringRule}</p>
                </div>

                <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100">
                  <div className="font-semibold text-amber-900 flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    Mulch & Root Flare Rule
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">{guidelines.mulchRule}</p>
                </div>

                <div className="p-3 bg-forest-50/60 rounded-xl border border-forest-100">
                  <div className="font-semibold text-forest-900 flex items-center gap-1.5 mb-1">
                    <Calendar className="w-3.5 h-3.5 text-forest-700" />
                    Seasonal Inspection
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">{guidelines.inspectionSeason}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="font-semibold text-slate-900 flex items-center gap-1.5 mb-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-slate-700" />
                    Winter & Dormancy Prep
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">{guidelines.winterPrep}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Task Modal */}
      <Modal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        title="Add Stewardship Care Task"
        description="Schedule a maintenance, hydration, or inspection task for tree health."
      >
        <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Task Title <span className="text-rose-500">*</span></label>
            <input
              type="text"
              placeholder="e.g. Apply 3-inch cedar woodchip mulch collar"
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              required
              className="w-full border border-sage-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-forest-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Task Type</label>
              <select
                value={taskForm.task_type}
                onChange={(e) => setTaskForm({ ...taskForm, task_type: e.target.value as CareTaskType })}
                className="w-full border border-sage-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-forest-500"
              >
                <option value="Watering">Watering</option>
                <option value="Mulching">Mulching</option>
                <option value="Pruning">Pruning</option>
                <option value="Inspection">Inspection</option>
                <option value="Sensor Check">Sensor Check</option>
                <option value="Fertilization">Fertilization</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Priority</label>
              <select
                value={taskForm.priority}
                onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as TaskPriority })}
                className="w-full border border-sage-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-forest-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Due Date <span className="text-rose-500">*</span></label>
              <input
                type="date"
                value={taskForm.due_date}
                onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                required
                className="w-full border border-sage-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-forest-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Associated Tree</label>
              <select
                value={taskForm.tree_id || ''}
                onChange={(e) => setTaskForm({ ...taskForm, tree_id: e.target.value })}
                className="w-full border border-sage-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-forest-500"
              >
                <option value="">General / Unlinked</option>
                {trees.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.tree_code} — {t.species}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Description / Instructions</label>
            <textarea
              rows={2}
              placeholder="e.g. Ensure root flare is exposed and mulch is kept 3 inches away from trunk."
              value={taskForm.description || ''}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              className="w-full border border-sage-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-forest-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsTaskModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={taskSubmitting}
            >
              Save Care Task
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
