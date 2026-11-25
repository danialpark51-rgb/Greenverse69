import React, { useState } from 'react';
import { PlantingCalendarMonth } from '../../types/planting';
import { getPlantingCalendar, savePlantingPlan } from '../../services/plantingIntelligenceService';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import {
  Calendar,
  Droplets,
  Sprout,
  Scissors,
  Layers,
  Save,
  CheckCircle2,
  Clock,
  ChevronRight,
  Sun
} from 'lucide-react';

export const PlantingCalendar: React.FC = () => {
  const { user } = useAuth();
  const [selectedRegion, setSelectedRegion] = useState('Upper Midwest / Great Lakes');
  const [selectedSeason, setSelectedSeason] = useState<'All' | 'Spring' | 'Summer' | 'Autumn' | 'Winter'>('All');
  const [activeMonthIndex, setActiveMonthIndex] = useState(2); // March default
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const months = getPlantingCalendar(selectedRegion);
  const activeMonth = months[activeMonthIndex];

  const handleSavePlan = async () => {
    setIsSaving(true);
    setSaveFeedback(null);
    const res = await savePlantingPlan({
      plan_name: `Seasonal Planting Schedule — ${selectedRegion}`,
      location_name: selectedRegion,
      status: 'active'
    }, user?.id);
    setIsSaving(false);
    if (res.data) {
      setSaveFeedback('Planting calendar schedule saved to your planting plans!');
      setTimeout(() => setSaveFeedback(null), 3500);
    }
  };

  const filteredMonths = selectedSeason === 'All'
    ? months
    : months.filter((m) => m.season === selectedSeason);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-5 h-5 text-forest-700" />
            Seasonal Planting & Stewardship Calendar
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Month-by-month phenological planting windows, seasonal hydration schedules, soil dressing, and pruning protocols.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            isLoading={isSaving}
            onClick={handleSavePlan}
            icon={<Save className="w-3.5 h-3.5" />}
            className="text-xs"
          >
            Save Calendar Plan
          </Button>
          <Badge variant="emerald" dot>Phenology Driven</Badge>
        </div>
      </div>

      {saveFeedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveFeedback}</span>
        </div>
      )}

      {/* Seasonal & Region Filter Bar */}
      <div className="p-3.5 bg-white border border-sage-200 rounded-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-700">Eco-Region:</span>
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="border border-sage-200 rounded-lg px-2.5 py-1 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-forest-500"
          >
            <option value="Upper Midwest / Great Lakes">Upper Midwest / Great Lakes (Zone 4-5)</option>
            <option value="Pacific Northwest / Cascadia">Pacific Northwest / Cascadia (Zone 7-8)</option>
            <option value="Eastern Deciduous / Mid-Atlantic">Eastern Deciduous / Mid-Atlantic (Zone 6-7)</option>
            <option value="Southern Coastal / Gulf">Southern Coastal / Gulf (Zone 8-9)</option>
          </select>
        </div>

        <div className="flex rounded-lg bg-sage-100 p-0.5 text-xs">
          {(['All', 'Spring', 'Summer', 'Autumn', 'Winter'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSelectedSeason(s)}
              className={`px-3 py-1 rounded-md font-medium capitalize transition-all ${
                selectedSeason === s
                  ? 'bg-forest-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* 12-Month Grid Selector Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2">
        {months.map((m, idx) => {
          const isSelected = activeMonthIndex === idx;
          return (
            <div
              key={m.month}
              onClick={() => setActiveMonthIndex(idx)}
              className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all ${
                isSelected
                  ? 'bg-forest-800 text-white border-forest-800 shadow-sm ring-2 ring-forest-500'
                  : 'bg-white border-sage-200 hover:border-forest-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="text-xs font-bold">{m.month.substring(0, 3)}</div>
              <div className="mt-1">
                {m.isOptimalPlantingSeason ? (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                    isSelected ? 'bg-lime-400 text-forest-950' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    Planting
                  </span>
                ) : (
                  <span className={`text-[9px] ${isSelected ? 'text-forest-200' : 'text-slate-400'}`}>
                    Care
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Month Detailed Protocol Dashboard */}
      <Card className="border-2 border-forest-100 overflow-hidden">
        <CardHeader className="bg-forest-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge
                variant={
                  activeMonth.season === 'Spring'
                    ? 'emerald'
                    : activeMonth.season === 'Autumn'
                    ? 'amber'
                    : activeMonth.season === 'Summer'
                    ? 'lime'
                    : 'forest'
                }
                size="sm"
              >
                {activeMonth.season.toUpperCase()} PHASE
              </Badge>
              {activeMonth.isOptimalPlantingSeason && (
                <Badge variant="emerald" size="sm">Optimal Planting Window</Badge>
              )}
            </div>
            <CardTitle className="text-2xl">{activeMonth.month} Ecological Stewardship Protocol</CardTitle>
            <CardDescription>{selectedRegion} Seasonal Guidelines</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-5 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Planting Tasks */}
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
              <div className="font-bold text-emerald-950 flex items-center gap-1.5 text-xs">
                <Sprout className="w-4 h-4 text-emerald-600" />
                Planting Interventions & Transplanting Windows:
              </div>
              <ul className="space-y-1.5">
                {activeMonth.plantingTasks.map((task, i) => (
                  <li key={i} className="text-slate-700 text-[11px] flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{task}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Hydration Guidelines */}
            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
              <div className="font-bold text-blue-950 flex items-center gap-1.5 text-xs">
                <Droplets className="w-4 h-4 text-blue-600" />
                Irrigation & Soil Moisture Protocol:
              </div>
              <p className="text-slate-700 text-[11px] leading-relaxed">
                {activeMonth.wateringGuidelines}
              </p>
            </div>

            {/* Soil & Mulch Tasks */}
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
              <div className="font-bold text-amber-950 flex items-center gap-1.5 text-xs">
                <Layers className="w-4 h-4 text-amber-600" />
                Soil Health, Mulching & Compost Amendments:
              </div>
              <ul className="space-y-1.5">
                {activeMonth.soilAndMulchTasks.map((task, i) => (
                  <li key={i} className="text-slate-700 text-[11px] flex items-start gap-1.5">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>{task}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pruning & Sanitation */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                <Scissors className="w-4 h-4 text-slate-600" />
                Pruning, Structural Staking & Sanitation:
              </div>
              <ul className="space-y-1.5">
                {activeMonth.pruningAndCare.map((task, i) => (
                  <li key={i} className="text-slate-700 text-[11px] flex items-start gap-1.5">
                    <span className="text-slate-500 font-bold">•</span>
                    <span>{task}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
