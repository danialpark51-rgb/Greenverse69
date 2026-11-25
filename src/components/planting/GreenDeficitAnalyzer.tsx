import React, { useState, useEffect } from 'react';
import { GreenDeficitInput, GreenDeficitResult, DbGreenDeficitEvaluation } from '../../types/planting';
import {
  calculateGreenDeficit,
  saveGreenDeficitEvaluation,
  fetchGreenDeficitEvaluations
} from '../../services/plantingIntelligenceService';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import {
  PieChart,
  Trees,
  AlertTriangle,
  CheckCircle2,
  Thermometer,
  CloudRain,
  Sparkles,
  Save,
  Loader2,
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';

export const GreenDeficitAnalyzer: React.FC = () => {
  const { user } = useAuth();
  const [form, setForm] = useState<GreenDeficitInput>({
    area_name: 'Metro East Industrial District Corridor',
    total_area_sqm: 60000,
    current_canopy_pct: 9.5,
    target_canopy_pct: 30.0,
    location_type: 'Industrial Park',
    population_density: 'High',
  });

  const [result, setResult] = useState<GreenDeficitResult>(() => calculateGreenDeficit(form));
  const [savedEvaluations, setSavedEvaluations] = useState<DbGreenDeficitEvaluation[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  useEffect(() => {
    fetchGreenDeficitEvaluations(user?.id).then((res) => {
      setSavedEvaluations(res.data);
      setLoadingSaved(false);
    });
  }, [user]);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(calculateGreenDeficit(form));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveFeedback(null);
    const res = await saveGreenDeficitEvaluation(form, result, user?.id);
    setIsSaving(false);
    if (res.data) {
      setSavedEvaluations((prev) => [res.data!, ...prev.filter(e => e.id !== res.data!.id)]);
      setSaveFeedback(res.fromSupabase ? 'Greenery deficit evaluation saved to database!' : 'Evaluation saved to local session registry.');
      setTimeout(() => setSaveFeedback(null), 3500);
    }
  };

  const currentCoverSqm = Math.round((form.current_canopy_pct / 100) * form.total_area_sqm);
  const targetCoverSqm = Math.round(((form.target_canopy_pct || 30) / 100) * form.total_area_sqm);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <PieChart className="w-5 h-5 text-forest-700" />
            Green Deficit & Canopy Equity Analyzer
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Diagnose urban canopy deficits, quantify missing tree biomass, and identify high-priority restoration zones.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="amber" dot>Calculated Estimate</Badge>
          <Badge variant="forest">WHO 30% Standard</Badge>
        </div>
      </div>

      {/* Clear Scientific Distinguisher Notice */}
      <div className="p-3.5 bg-forest-50/70 border border-forest-200 rounded-xl text-xs text-forest-900 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-forest-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">Calculation Methodology & Transparency Notice</span>
          <p className="text-[11px] text-forest-800 mt-0.5">
            Greenery indices are mathematical estimates calculated from user-provided area footprints and ground canopy surveys. They do not simulate satellite optical multispectral passes and should be paired with physical drone or arborist surveys.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Input Form */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>District Parameters</CardTitle>
            <CardDescription>Specify geographic area and coverage</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCalculate} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Target Area / District</label>
                <input
                  type="text"
                  value={form.area_name}
                  onChange={(e) => setForm({ ...form, area_name: e.target.value })}
                  className="w-full border border-sage-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-forest-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Total Geographic Area (m²)</label>
                <input
                  type="number"
                  min="500"
                  step="500"
                  value={form.total_area_sqm}
                  onChange={(e) => setForm({ ...form, total_area_sqm: Math.max(100, Number(e.target.value)) })}
                  className="w-full border border-sage-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-forest-500"
                  required
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  ~{(form.total_area_sqm / 10000).toFixed(2)} hectares (ha)
                </span>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Current Canopy Coverage: <span className="font-mono text-forest-800 font-bold">{form.current_canopy_pct}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="70"
                  step="0.5"
                  value={form.current_canopy_pct}
                  onChange={(e) => setForm({ ...form, current_canopy_pct: Number(e.target.value) })}
                  className="w-full accent-forest-700"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>0% (Bare Asphalt)</span>
                  <span>30% (Standard)</span>
                  <span>70% (Dense)</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Target Canopy Goal (%)</label>
                <select
                  value={form.target_canopy_pct}
                  onChange={(e) => setForm({ ...form, target_canopy_pct: Number(e.target.value) })}
                  className="w-full border border-sage-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-forest-500"
                >
                  <option value={20}>20% (Minimum Viable Shade)</option>
                  <option value={30}>30% (WHO / 3-30-300 Standard)</option>
                  <option value={40}>40% (Optimal Urban Cooling Target)</option>
                  <option value={50}>50% (Ecological Woodland Target)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">District Type</label>
                  <select
                    value={form.location_type}
                    onChange={(e) => setForm({ ...form, location_type: e.target.value as any })}
                    className="w-full border border-sage-200 rounded-lg px-2.5 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-forest-500"
                  >
                    <option value="Urban Core">Urban Core</option>
                    <option value="Suburban Residential">Suburban</option>
                    <option value="Industrial Park">Industrial Park</option>
                    <option value="School / Campus">School / Campus</option>
                    <option value="River Corridor">River Corridor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Population Density</label>
                  <select
                    value={form.population_density}
                    onChange={(e) => setForm({ ...form, population_density: e.target.value as any })}
                    className="w-full border border-sage-200 rounded-lg px-2.5 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-forest-500"
                  >
                    <option value="High">High Density</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low Density</option>
                  </select>
                </div>
              </div>

              <Button type="submit" variant="primary" size="sm" className="w-full" icon={<PieChart className="w-3.5 h-3.5" />}>
                Compute Green Deficit
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Right 2 Columns: Deficit Analytics & Action Plan */}
        <div className="lg:col-span-2 space-y-5">
          {/* Deficit Metric Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-white border border-sage-200 rounded-xl shadow-xs">
              <div className="text-[10px] uppercase font-bold text-slate-400">Green Deficit Score</div>
              <div className="text-2xl font-black text-rose-600 mt-0.5">{result.deficitScore}</div>
              <Badge variant={result.priorityLevel === 'Critical' ? 'rose' : result.priorityLevel === 'High' ? 'amber' : 'forest'} size="sm" className="mt-1">
                {result.priorityLevel} Priority
              </Badge>
            </div>

            <div className="p-3.5 bg-white border border-sage-200 rounded-xl shadow-xs">
              <div className="text-[10px] uppercase font-bold text-slate-400">Missing Canopy</div>
              <div className="text-xl font-black text-slate-800 mt-0.5">
                {result.deficitCanopySqm.toLocaleString()} m²
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">Shortfall to goal</span>
            </div>

            <div className="p-3.5 bg-white border border-sage-200 rounded-xl shadow-xs">
              <div className="text-[10px] uppercase font-bold text-slate-400">Trees Needed</div>
              <div className="text-xl font-black text-forest-800 mt-0.5">
                {result.estimatedTreesNeeded.toLocaleString()}
              </div>
              <span className="text-[10px] text-emerald-600 font-medium mt-1 block">@ 25m² mature canopy</span>
            </div>

            <div className="p-3.5 bg-white border border-sage-200 rounded-xl shadow-xs">
              <div className="text-[10px] uppercase font-bold text-slate-400">Heat Island Vulnerability</div>
              <div className="text-xl font-black text-amber-600 mt-0.5">
                {result.heatIslandRiskIndex} <span className="text-xs text-slate-400 font-normal">/ 10</span>
              </div>
              <span className="text-[10px] text-amber-700 font-medium mt-1 block">Elevated heat retention</span>
            </div>
          </div>

          {/* Interactive Visual Coverage Comparison Bar */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Canopy Coverage Equity Gap</CardTitle>
                <CardDescription>Current vs Target Ecological Canopy Equilibrium</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                isLoading={isSaving}
                onClick={handleSave}
                icon={<Save className="w-3.5 h-3.5" />}
                className="text-xs"
              >
                Save Evaluation
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              {saveFeedback && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{saveFeedback}</span>
                </div>
              )}

              {/* Stacked visual chart */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>Current: {currentCoverSqm.toLocaleString()} m² ({form.current_canopy_pct}%)</span>
                  <span className="text-forest-700">Target: {targetCoverSqm.toLocaleString()} m² ({form.target_canopy_pct}%)</span>
                </div>

                <div className="h-6 w-full bg-slate-100 rounded-xl overflow-hidden flex border border-slate-200">
                  {/* Current Canopy */}
                  <div
                    className="bg-emerald-600 h-full flex items-center justify-center text-[10px] text-white font-bold transition-all duration-500"
                    style={{ width: `${Math.min(100, form.current_canopy_pct)}%` }}
                    title={`Current Canopy: ${form.current_canopy_pct}%`}
                  >
                    {form.current_canopy_pct > 8 ? `${form.current_canopy_pct}%` : ''}
                  </div>
                  {/* Deficit */}
                  <div
                    className="bg-rose-400/80 h-full flex items-center justify-center text-[10px] text-white font-bold transition-all duration-500"
                    style={{
                      width: `${Math.min(100 - form.current_canopy_pct, Math.max(0, (form.target_canopy_pct || 30) - form.current_canopy_pct))}%`,
                    }}
                    title="Deficit Gap"
                  >
                    Deficit
                  </div>
                </div>

                <div className="flex items-center gap-4 text-[10px] text-slate-500 pt-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> Existing Living Canopy
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-400" /> Critical Deficit Shortfall
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-200" /> Impervious Hardscape
                  </span>
                </div>
              </div>

              {/* Priority Zones & Recommendations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
                  <div className="font-bold text-amber-950 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                    Priority Planting Interventions:
                  </div>
                  <ul className="space-y-1.5">
                    {result.priorityZones.map((zone, i) => (
                      <li key={i} className="text-slate-700 text-[11px] flex items-start gap-1.5">
                        <span className="text-amber-600 font-bold">→</span>
                        <span>{zone}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 bg-forest-50/70 border border-forest-200 rounded-xl space-y-2">
                  <div className="font-bold text-forest-950 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-forest-700" />
                    Environmental Recovery Plan:
                  </div>
                  <ul className="space-y-1.5">
                    {result.recommendations.map((rec, i) => (
                      <li key={i} className="text-slate-700 text-[11px] flex items-start gap-1.5">
                        <span className="text-forest-600 font-bold">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Historical Saved Evaluations */}
          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Saved District Evaluations ({savedEvaluations.length})
            </div>
            {loadingSaved ? (
              <div className="flex items-center gap-2 text-xs text-slate-400 py-3">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading saved evaluations...
              </div>
            ) : savedEvaluations.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-white rounded-xl border border-sage-200">
                No past district evaluations recorded.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {savedEvaluations.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 bg-white border border-sage-200 rounded-xl flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900 text-xs truncate max-w-[180px]">
                          {item.area_name}
                        </span>
                        <Badge variant="rose" size="sm">
                          {item.deficit_score} Deficit
                        </Badge>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Canopy: {item.existing_canopy_pct}% / Target: {item.target_canopy_pct}%
                      </div>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                      <span>Area: {item.total_area_sqm.toLocaleString()} m²</span>
                      <span className="font-mono">{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
