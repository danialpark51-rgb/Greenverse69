import React, { useState } from 'react';
import { SunlightCondition, PlantSpecies } from '../../types/planting';
import { compareSunlightConditions } from '../../services/plantingIntelligenceService';
import { SPECIES_CATALOG } from '../../data/speciesCatalog';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../common/Card';
import { Badge } from '../common/Badge';
import {
  Sun,
  CloudSun,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  Info,
  Sparkles,
  TreeDeciduous,
  Ruler
} from 'lucide-react';

const SUNLIGHT_OPTIONS: Array<{
  type: SunlightCondition;
  label: string;
  hours: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    type: 'Full Sun',
    label: 'Full Sun (Open Sky)',
    hours: '6+ hours direct unfiltered sunlight',
    icon: Sun
  },
  {
    type: 'Partial Shade',
    label: 'Partial Sun / Dappled Shade',
    hours: '3 to 6 hours direct or filtered sunlight',
    icon: CloudSun
  },
  {
    type: 'Full Shade',
    label: 'Full Shade (Dense Canopy / Walls)',
    hours: '< 3 hours direct sunlight',
    icon: Cloud
  }
];

export const SunlightAnalysisComparator: React.FC = () => {
  const [selectedSunlight, setSelectedSunlight] = useState<SunlightCondition>('Full Sun');
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string>(SPECIES_CATALOG[0].id);

  const species = SPECIES_CATALOG.find((s) => s.id === selectedSpeciesId) || SPECIES_CATALOG[0];
  const comparison = compareSunlightConditions(selectedSunlight, species);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sun className="w-5 h-5 text-amber-500" />
            Sunlight Analysis & Irradiance Comparator
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare site solar exposure against physiological photosynthesis requirements.
          </p>
        </div>
        <Badge
          variant={
            comparison.compatibilityStatus === 'Optimal'
              ? 'emerald'
              : comparison.compatibilityStatus === 'Tolerable'
              ? 'amber'
              : 'rose'
          }
        >
          {comparison.compatibilityStatus} Alignment
        </Badge>
      </div>

      {/* Honest Feature Notice */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3 text-xs text-amber-900">
        <Info className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
        <div>
          <span className="font-semibold">Irradiance Methodology: </span>
          This analysis calculates physiological photosynthetically active radiation (PAR) tolerance from published botanical standards. It does not utilize camera sensor photometric hardware or LiDAR sun-tracking unless an on-site pyranometer sensor is paired.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Selector Panel */}
        <Card className="lg:col-span-1 space-y-4">
          <CardHeader>
            <CardTitle className="text-sm">Step 1: Your Site's Sunlight Conditions</CardTitle>
            <CardDescription className="text-xs">Estimate the daily direct sun reaching ground level</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-1">
            <div className="space-y-2">
              {SUNLIGHT_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isSelected = selectedSunlight === opt.type;
                return (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() => setSelectedSunlight(opt.type)}
                    className={`w-full p-3 rounded-xl border text-left transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'border-amber-600 bg-amber-50/60 shadow-xs ring-1 ring-amber-500'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mt-0.5 ${isSelected ? 'text-amber-600' : 'text-slate-400'}`} />
                    <div className="min-w-0">
                      <div className={`text-xs font-bold ${isSelected ? 'text-amber-950' : 'text-slate-800'}`}>
                        {opt.label}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{opt.hours}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-200">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Step 2: Compare Against Species
              </label>
              <select
                value={selectedSpeciesId}
                onChange={(e) => setSelectedSpeciesId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-800"
              >
                {SPECIES_CATALOG.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.commonName} (Requires {s.sunlightRequirement})
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Comparison Output */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base text-slate-900">
                    Irradiance Comparison: {species.commonName}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Site: {selectedSunlight} vs. Species Need: {species.sunlightRequirement}
                  </CardDescription>
                </div>
                <Badge
                  variant={
                    comparison.compatibilityStatus === 'Optimal'
                      ? 'emerald'
                      : comparison.compatibilityStatus === 'Tolerable'
                      ? 'amber'
                      : 'rose'
                  }
                >
                  {comparison.compatibilityStatus}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-1">
              {/* Visual Solar Bar */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">Estimated Photoperiod Window:</span>
                  <span className="text-slate-500 font-medium">{comparison.dailySunlightHoursEstimated}</span>
                </div>
                <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden flex">
                  <div
                    className={`h-full transition-all ${
                      selectedSunlight === 'Full Sun'
                        ? 'w-full bg-amber-400'
                        : selectedSunlight === 'Partial Shade'
                        ? 'w-1/2 bg-amber-300'
                        : 'w-1/4 bg-slate-400'
                    }`}
                  />
                </div>
              </div>

              {/* Scientific Explanation */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Botanical Photobiology Analysis
                </h4>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 leading-relaxed">
                  {comparison.analysisExplanation}
                </div>
              </div>

              {/* Warning if any */}
              {comparison.leafImpactWarning && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-900 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Photomorphological Risk: </span>
                    {comparison.leafImpactWarning}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Canopy Placement Recommendations
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="bg-white border border-slate-200 rounded-lg p-2.5 text-slate-700 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-lime-600 shrink-0" />
                    <span>Position along south or west aspect for maximum sun capture.</span>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg p-2.5 text-slate-700 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-lime-600 shrink-0" />
                    <span>Avoid shadowing from tall adjacent building facades.</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
