import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, Leaf, Droplets, Recycle, Save, Loader2, AlertCircle, Info, CheckCircle, Calculator } from 'lucide-react';
import { fetchImpactEstimate, saveImpactEstimate } from '../../services/projectService';
import { Project, ImpactEstimate } from '../../types/project';

interface ImpactEstimatorProps {
  project: Project;
  currentUserId?: string;
}

const DISCLAIMER = `These are estimated projections based on published averages, NOT verified ecological outcomes. Actual impact requires independent scientific audit. CO₂ calculations use the USDA i-Tree standard average of 22 kg CO₂/tree/year for urban trees. Real-world values vary significantly by species, climate, soil quality, and management.`;

const CO2_PER_TREE_PER_YEAR = 22; // kg — USDA i-Tree standard

interface FormValues {
  trees_planned: number;
  tree_survival_rate_pct: number;
  planting_area_sqm: number;
  restored_greenspace_sqm: number;
  waste_diverted_kg: number;
  water_conserved_liters: number;
  time_horizon_years: number;
  methodology_notes: string;
}

const DEFAULT_FORM: FormValues = {
  trees_planned: 100,
  tree_survival_rate_pct: 85,
  planting_area_sqm: 500,
  restored_greenspace_sqm: 500,
  waste_diverted_kg: 0,
  water_conserved_liters: 0,
  time_horizon_years: 5,
  methodology_notes: '',
};

export const ImpactEstimator: React.FC<ImpactEstimatorProps> = ({ project, currentUserId }) => {
  const [form, setForm] = useState<FormValues>(DEFAULT_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [existingEstimate, setExistingEstimate] = useState<ImpactEstimate | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const est = await fetchImpactEstimate(project.id);
        if (est) {
          setExistingEstimate(est);
          setForm({
            trees_planned: est.trees_planned || DEFAULT_FORM.trees_planned,
            tree_survival_rate_pct: est.tree_survival_rate_pct || DEFAULT_FORM.tree_survival_rate_pct,
            planting_area_sqm: est.planting_area_sqm || DEFAULT_FORM.planting_area_sqm,
            restored_greenspace_sqm: est.restored_greenspace_sqm || DEFAULT_FORM.restored_greenspace_sqm,
            waste_diverted_kg: est.waste_diverted_kg || 0,
            water_conserved_liters: est.water_conserved_liters || 0,
            time_horizon_years: est.time_horizon_years || DEFAULT_FORM.time_horizon_years,
            methodology_notes: est.methodology_notes || '',
          });
        }
      } catch {
        // No estimate yet — start fresh
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [project.id]);

  // Auto-calculate derived values
  const survivingTrees = Math.round(form.trees_planned * (form.tree_survival_rate_pct / 100));
  const annualCO2Kg = survivingTrees * CO2_PER_TREE_PER_YEAR;
  const totalCO2Kg = annualCO2Kg * form.time_horizon_years;
  const totalCO2Tonnes = (totalCO2Kg / 1000).toFixed(2);

  const setField = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      await saveImpactEstimate({
        project_id: project.id,
        trees_planned: form.trees_planned,
        tree_survival_rate_pct: form.tree_survival_rate_pct,
        planting_area_sqm: form.planting_area_sqm,
        restored_greenspace_sqm: form.restored_greenspace_sqm,
        waste_diverted_kg: form.waste_diverted_kg,
        water_conserved_liters: form.water_conserved_liters,
        time_horizon_years: form.time_horizon_years,
        estimated_annual_co2_kg: annualCO2Kg,
        methodology_notes: form.methodology_notes,
      });
      setSaveSuccess(true);
    } catch (err: any) {
      setSaveError(err?.message || 'Failed to save estimate.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mr-3" />
        <span className="text-slate-600">Loading impact data…</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-slate-800">Project Impact Estimator</h2>
        <p className="text-sm text-slate-500 mt-1">
          Estimate the potential environmental impact of this project using published ecological formulas.
        </p>
      </div>

      {/* Disclaimer Banner */}
      <div className="flex gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-800 mb-1">Estimates Only — Not Verified Outcomes</p>
          <p className="text-xs text-amber-700">{DISCLAIMER}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-700 flex items-center gap-2">
            <Calculator className="w-4 h-4" /> Input Parameters
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Trees Planned</label>
              <input
                type="number"
                min={0}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={form.trees_planned}
                onChange={e => setField('trees_planned', Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Survival Rate (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                step={1}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={form.tree_survival_rate_pct}
                onChange={e => setField('tree_survival_rate_pct', Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Planting Area (m²)</label>
              <input
                type="number"
                min={0}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={form.planting_area_sqm}
                onChange={e => setField('planting_area_sqm', Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Restored Greenspace (m²)</label>
              <input
                type="number"
                min={0}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={form.restored_greenspace_sqm}
                onChange={e => setField('restored_greenspace_sqm', Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Waste Diverted (kg)</label>
              <input
                type="number"
                min={0}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={form.waste_diverted_kg}
                onChange={e => setField('waste_diverted_kg', Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Water Conserved (L)</label>
              <input
                type="number"
                min={0}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={form.water_conserved_liters}
                onChange={e => setField('water_conserved_liters', Number(e.target.value))}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Time Horizon (years)</label>
              <input
                type="number"
                min={1}
                max={50}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={form.time_horizon_years}
                onChange={e => setField('time_horizon_years', Number(e.target.value))}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Methodology Notes</label>
              <textarea
                rows={3}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                placeholder="Describe species mix, measurement approach, data sources..."
                value={form.methodology_notes}
                onChange={e => setField('methodology_notes', e.target.value)}
              />
            </div>
          </div>

          {currentUserId && (
            <div className="space-y-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Estimate
              </button>
              {saveSuccess && (
                <p className="flex items-center gap-1 text-sm text-emerald-600">
                  <CheckCircle className="w-4 h-4" /> Estimate saved successfully.
                </p>
              )}
              {saveError && (
                <p className="flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4" /> {saveError}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Results Panel */}
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-700 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Estimated Impact Results
          </h3>

          {/* CO2 — Primary Card */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs font-medium text-emerald-700 uppercase tracking-wide">CO₂ Sequestration (Est.)</p>
                <p className="text-3xl font-bold text-emerald-800 mt-1">{totalCO2Tonnes} t</p>
                <p className="text-xs text-emerald-600 mt-0.5">over {form.time_horizon_years} year{form.time_horizon_years !== 1 ? 's' : ''}</p>
              </div>
              <Leaf className="w-8 h-8 text-emerald-500 opacity-60" />
            </div>
            <div className="border-t border-emerald-200 pt-3 space-y-1">
              <p className="text-xs text-emerald-700">
                <span className="font-medium">{survivingTrees}</span> trees surviving ({form.tree_survival_rate_pct}% survival)
              </p>
              <p className="text-xs text-emerald-700">
                <span className="font-medium">{annualCO2Kg.toLocaleString()} kg/year</span> annual absorption (est.)
              </p>
              <p className="text-xs text-emerald-600 flex items-center gap-1 mt-2">
                <Info className="w-3 h-3" />
                Formula: {form.trees_planned} × {form.tree_survival_rate_pct}% × 22 kg/tree/year × {form.time_horizon_years} yrs
              </p>
            </div>
          </div>

          {/* Other Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Droplets className="w-4 h-4 text-blue-500" />
                <p className="text-xs font-medium text-blue-700 uppercase tracking-wide">Water Conserved</p>
              </div>
              <p className="text-2xl font-bold text-blue-800">
                {form.water_conserved_liters > 0
                  ? form.water_conserved_liters >= 1000
                    ? `${(form.water_conserved_liters / 1000).toFixed(1)} kL`
                    : `${form.water_conserved_liters} L`
                  : '—'}
              </p>
              <p className="text-xs text-blue-600 mt-0.5">estimated / year</p>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Recycle className="w-4 h-4 text-amber-500" />
                <p className="text-xs font-medium text-amber-700 uppercase tracking-wide">Waste Diverted</p>
              </div>
              <p className="text-2xl font-bold text-amber-800">
                {form.waste_diverted_kg > 0
                  ? form.waste_diverted_kg >= 1000
                    ? `${(form.waste_diverted_kg / 1000).toFixed(1)} t`
                    : `${form.waste_diverted_kg} kg`
                  : '—'}
              </p>
              <p className="text-xs text-amber-600 mt-0.5">from landfill</p>
            </div>
            <div className="col-span-2 bg-forest-50 border border-slate-100 bg-slate-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Leaf className="w-4 h-4 text-slate-500" />
                <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">Greenspace</p>
              </div>
              <div className="flex gap-6">
                <div>
                  <p className="text-xl font-bold text-slate-700">{form.planting_area_sqm.toLocaleString()} m²</p>
                  <p className="text-xs text-slate-500">planting area</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-700">{form.restored_greenspace_sqm.toLocaleString()} m²</p>
                  <p className="text-xs text-slate-500">restored habitat</p>
                </div>
              </div>
            </div>
          </div>

          {/* Formula Transparency */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-slate-600 mb-2">Formula Transparency</p>
            <ul className="text-xs text-slate-500 space-y-1 font-mono">
              <li>CO₂/year = trees_planned × (survival_rate/100) × 22 kg</li>
              <li>Total CO₂ = CO₂/year × time_horizon_years</li>
              <li>Source: USDA i-Tree urban tree average</li>
            </ul>
          </div>

          {existingEstimate && (
            <p className="text-xs text-slate-400 text-center">
              Last saved: {existingEstimate.created_at ? new Date(existingEstimate.created_at).toLocaleString() : 'Unknown'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
