import React, { useState } from 'react';
import { SpacingLayoutInput, SpacingLayoutResult } from '../../types/planting';
import { calculateSpacingLayout, savePlantingPlan } from '../../services/plantingIntelligenceService';
import { SPECIES_CATALOG } from '../../data/speciesCatalog';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import {
  Grid3X3,
  Trees,
  Maximize2,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Save,
  Download,
  Info,
  Layers,
  Ruler
} from 'lucide-react';

export const PlantSpacingPlanner: React.FC = () => {
  const { user } = useAuth();
  const [form, setForm] = useState<SpacingLayoutInput>({
    speciesId: SPECIES_CATALOG[0].id,
    areaLengthM: 20,
    areaWidthM: 15,
    layoutPattern: 'Square Grid',
    targetQuantity: 6,
  });

  const [result, setResult] = useState<SpacingLayoutResult>(() => calculateSpacingLayout(form));
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdate = (updated: SpacingLayoutInput) => {
    setForm(updated);
    setResult(calculateSpacingLayout(updated));
  };

  const selectedSpecies = SPECIES_CATALOG.find((s) => s.id === form.speciesId) || SPECIES_CATALOG[0];

  const handleSave = async () => {
    setIsSaving(true);
    setSaveFeedback(null);
    const res = await savePlantingPlan({
      plan_name: `Spacing Blueprint — ${selectedSpecies.commonName} (${form.layoutPattern})`,
      location_name: 'Custom Spacing Layout',
      total_area_sqm: result.totalAreaSqm,
      total_plants: result.suggestedQuantity,
      layout_type: form.layoutPattern,
      status: 'active'
    }, user?.id);
    setIsSaving(false);
    if (res.data) {
      setSaveFeedback('Planting layout blueprint saved to your planting plans!');
      setTimeout(() => setSaveFeedback(null), 3500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Grid3X3 className="w-5 h-5 text-forest-700" />
            Plant Spacing & Canopy Geometry Planner
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Calculate safe stem spacing, prevent light starvation and crown overlap, and render spatial layout grids.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            isLoading={isSaving}
            onClick={handleSave}
            icon={<Save className="w-3.5 h-3.5" />}
            className="text-xs"
          >
            Save Blueprint
          </Button>
          <Badge variant="lime" dot>Geometric Physics</Badge>
        </div>
      </div>

      {saveFeedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveFeedback}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Dimensions & Architecture Controls */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Plot Dimensions & Species</CardTitle>
            <CardDescription>Configure physical boundaries</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            {/* Species Selector */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Target Species</label>
              <select
                value={form.speciesId}
                onChange={(e) => handleUpdate({ ...form, speciesId: e.target.value })}
                className="w-full border border-sage-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-forest-500"
              >
                {SPECIES_CATALOG.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.commonName} (Mature spread: {s.matureSpreadM}m)
                  </option>
                ))}
              </select>
              <div className="mt-1 text-[11px] text-slate-500 flex justify-between">
                <span>Recommended Spacing:</span>
                <span className="font-bold text-forest-800">{selectedSpecies.recommendedSpacingM}m</span>
              </div>
            </div>

            {/* Plot Dimensions */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Length (m)</label>
                <input
                  type="number"
                  min="2"
                  max="300"
                  value={form.areaLengthM}
                  onChange={(e) => handleUpdate({ ...form, areaLengthM: Math.max(2, Number(e.target.value)) })}
                  className="w-full border border-sage-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-forest-500"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Width (m)</label>
                <input
                  type="number"
                  min="2"
                  max="300"
                  value={form.areaWidthM}
                  onChange={(e) => handleUpdate({ ...form, areaWidthM: Math.max(2, Number(e.target.value)) })}
                  className="w-full border border-sage-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-forest-500"
                />
              </div>
            </div>
            <div className="text-[11px] text-slate-500 flex justify-between px-1">
              <span>Total Area:</span>
              <span className="font-bold text-slate-800">{form.areaLengthM * form.areaWidthM} m²</span>
            </div>

            {/* Layout Pattern */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Layout Architecture</label>
              <select
                value={form.layoutPattern}
                onChange={(e) => handleUpdate({ ...form, layoutPattern: e.target.value as any })}
                className="w-full border border-sage-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-forest-500"
              >
                <option value="Square Grid">Square Grid (Standard Orchard / Park)</option>
                <option value="Staggered Triangle">Staggered Triangle (Maximized Solar Penetration)</option>
                <option value="Miyawaki High-Density">Miyawaki High-Density (Pocket Mini-Forest)</option>
                <option value="Hedgerow Corridor">Hedgerow Corridor (Linear Buffer Strip)</option>
              </select>
            </div>

            {/* Target Quantity */}
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Target Sapling Quantity:</span>
                <span className="font-mono text-forest-800 font-bold">{form.targetQuantity}</span>
              </div>
              <input
                type="number"
                min="1"
                max="200"
                value={form.targetQuantity || 1}
                onChange={(e) => handleUpdate({ ...form, targetQuantity: Math.max(1, Number(e.target.value)) })}
                className="w-full border border-sage-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-forest-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Calculated max safe capacity: <strong className="text-slate-700">{result.maxSafeQuantity} trees</strong>
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Right 2 Columns: Visual Spacing Canvas & Safety Metrics */}
        <div className="lg:col-span-2 space-y-5">
          {/* Spatial Capacity KPI Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-white border border-sage-200 rounded-xl shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400">Recommended Spacing</span>
              <div className="text-xl font-black text-forest-800 mt-0.5">{result.recommendedSpacingM} m</div>
              <span className="text-[10px] text-slate-500">Stem-to-stem</span>
            </div>

            <div className="p-3.5 bg-white border border-sage-200 rounded-xl shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400">Safe Capacity</span>
              <div className="text-xl font-black text-slate-800 mt-0.5">{result.maxSafeQuantity} trees</div>
              <span className="text-[10px] text-slate-500">For {result.totalAreaSqm} m²</span>
            </div>

            <div className="p-3.5 bg-white border border-sage-200 rounded-xl shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400">Canopy Closure</span>
              <div className="text-xl font-black text-emerald-700 mt-0.5">~{result.yearsToFullCanopy} yrs</div>
              <span className="text-[10px] text-slate-500">Estimated 80% overlap</span>
            </div>

            <div className="p-3.5 bg-white border border-sage-200 rounded-xl shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400">Grid Geometry</span>
              <div className="text-xl font-black text-slate-800 mt-0.5">
                {result.colsCount} × {result.rowsCount}
              </div>
              <span className="text-[10px] text-slate-500">Cols × Rows</span>
            </div>
          </div>

          {/* Interactive Visual Planting Canvas */}
          <Card className="border-2 border-forest-100 overflow-hidden">
            <CardHeader className="bg-forest-50/60 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Spatial Planting Layout Simulation</CardTitle>
                  <CardDescription>
                    Top-down view of plot ({form.areaLengthM}m × {form.areaWidthM}m) with mature crown footprint
                  </CardDescription>
                </div>
                <Badge variant="forest" size="sm">{form.layoutPattern}</Badge>
              </div>
            </CardHeader>

            <CardContent className="p-5 space-y-4 text-xs">
              {/* Overcrowding Alert */}
              {result.overcrowdingWarning && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-900 rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>
                    <strong>Overcrowding Warning:</strong> Target quantity ({form.targetQuantity}) exceeds safe capacity ({result.maxSafeQuantity}). Mature root and canopy overlap may cause severe competition.
                  </span>
                </div>
              )}

              {/* SVG 2D Canvas Representation */}
              <div className="relative w-full h-64 bg-[#e8efe6] rounded-xl border-2 border-dashed border-forest-200 overflow-hidden flex items-center justify-center p-4">
                <svg className="w-full h-full max-h-56" viewBox={`0 0 ${form.areaLengthM * 10} ${form.areaWidthM * 10}`}>
                  <defs>
                    <pattern id="soilGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                      <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#236145" strokeWidth="0.5" opacity="0.15" />
                    </pattern>
                  </defs>
                  {/* Background Ground */}
                  <rect width="100%" height="100%" fill="url(#soilGrid)" />

                  {/* Render simulated tree points with crown circles */}
                  {result.gridCoordinates.map((pt, idx) => (
                    <g key={idx} className="group cursor-pointer">
                      {/* Mature Crown Spread Circle */}
                      <circle
                        cx={pt.x * 10}
                        cy={pt.y * 10}
                        r={Math.max(6, (selectedSpecies.matureSpreadM / 2) * 5)}
                        fill="#236145"
                        fillOpacity="0.25"
                        stroke="#236145"
                        strokeWidth="1"
                        className="transition-all group-hover:fill-opacity-40"
                      />
                      {/* Tree Trunk Center Node */}
                      <circle
                        cx={pt.x * 10}
                        cy={pt.y * 10}
                        r="3"
                        fill="#1b4a34"
                      />
                    </g>
                  ))}
                </svg>

                <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded text-[10px] text-slate-600 font-mono border border-slate-200">
                  {result.gridCoordinates.length} Sapling Positions Plotted
                </div>
              </div>

              {/* Clearance & Recommendations */}
              <div className="space-y-2">
                <div className="font-bold text-slate-800 text-xs">Layout Recommendations & Safety Clearances:</div>
                <div className="space-y-1.5">
                  {result.recommendations.map((rec, i) => (
                    <div key={i} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-[11px] flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-forest-700 shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </div>
                  ))}
                  {result.clearanceWarnings.map((warn, i) => (
                    <div key={i} className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[11px] flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>{warn}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
