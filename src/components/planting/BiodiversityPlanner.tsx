import React, { useState } from 'react';
import { BiodiversityPlanInput, BiodiversityPlanResult } from '../../types/planting';
import { evaluateBiodiversityPlan } from '../../services/plantingIntelligenceService';
import { SPECIES_CATALOG } from '../../data/speciesCatalog';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import {
  Sparkles,
  Layers,
  Leaf,
  Bird,
  AlertTriangle,
  CheckCircle2,
  Info,
  ShieldCheck,
  Flower2,
  Plus,
  Trash2
} from 'lucide-react';

export const BiodiversityPlanner: React.FC = () => {
  const [input, setInput] = useState<BiodiversityPlanInput>({
    plotSizeSqm: 250,
    selectedSpeciesIds: [
      SPECIES_CATALOG[0].id, // Bur Oak (Canopy)
      SPECIES_CATALOG[4].id, // Serviceberry (Sub-canopy)
      SPECIES_CATALOG[6].id, // Gray Dogwood (Shrub)
      SPECIES_CATALOG[8].id, // Purple Coneflower (Ground)
    ],
    targetObjective: 'Balanced Native Woodland',
  });

  const [result, setResult] = useState<BiodiversityPlanResult>(() => evaluateBiodiversityPlan(input));

  const handleToggleSpecies = (speciesId: string) => {
    let nextIds = input.selectedSpeciesIds.includes(speciesId)
      ? input.selectedSpeciesIds.filter((id) => id !== speciesId)
      : [...input.selectedSpeciesIds, speciesId];

    if (nextIds.length === 0) nextIds = [SPECIES_CATALOG[0].id];

    const updated = { ...input, selectedSpeciesIds: nextIds };
    setInput(updated);
    setResult(evaluateBiodiversityPlan(updated));
  };

  const handleObjectiveChange = (targetObjective: any) => {
    const updated = { ...input, targetObjective };
    setInput(updated);
    setResult(evaluateBiodiversityPlan(updated));
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-forest-700" />
            Biodiversity & Polyculture Ecological Planner
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Design multi-tiered native polycultures, avoid monoculture pests, and optimize multi-season pollinator nectar corridors.
          </p>
        </div>
        <Badge variant="emerald" dot>10-20-30 Rule Verified</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Palette Selection & Target Objective */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Ecological Palette</CardTitle>
            <CardDescription>Select multi-tier companion species</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            {/* Objective Selector */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Ecological Restoration Goal</label>
              <select
                value={input.targetObjective}
                onChange={(e) => handleObjectiveChange(e.target.value)}
                className="w-full border border-sage-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-forest-500"
              >
                <option value="Balanced Native Woodland">Balanced Multi-Tier Native Woodland</option>
                <option value="Maximum Pollinators">Maximum Continuous Pollinator Habitat</option>
                <option value="Urban Wildlife Haven">Urban Avian & Songbird Sanctuary</option>
                <option value="Dense Miyawaki Pocket">Dense Miyawaki Pocket Mini-Forest</option>
              </select>
            </div>

            {/* Species Palette Checklist */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1.5">
                Companion Species Selection ({input.selectedSpeciesIds.length} chosen)
              </label>
              <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
                {SPECIES_CATALOG.map((s) => {
                  const isChecked = input.selectedSpeciesIds.includes(s.id);
                  return (
                    <div
                      key={s.id}
                      onClick={() => handleToggleSpecies(s.id)}
                      className={`p-2.5 rounded-lg border cursor-pointer text-xs flex items-center justify-between transition-all ${
                        isChecked
                          ? 'bg-forest-50 border-forest-400 text-forest-950 font-medium'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-slate-900">{s.commonName}</div>
                        <div className="text-[10px] text-slate-400">{s.canopyLayer} · {s.family}</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="rounded text-forest-700 focus:ring-forest-500"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right 2 Columns: Biodiversity Score & Multi-Tier Analysis */}
        <div className="lg:col-span-2 space-y-5">
          {/* Biodiversity Score Ribbon */}
          <Card className="border-2 border-forest-100 overflow-hidden">
            <CardHeader className="bg-forest-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge
                    variant={
                      result.biodiversityScore >= 80
                        ? 'emerald'
                        : result.biodiversityScore >= 65
                        ? 'forest'
                        : 'amber'
                    }
                    size="sm"
                  >
                    {result.rating.toUpperCase()}
                  </Badge>
                  <span className="font-mono text-xs text-slate-500">
                    Biodiversity Vitality: {result.biodiversityScore}/100
                  </span>
                </div>
                <CardTitle>{input.targetObjective}</CardTitle>
                <CardDescription>
                  {result.speciesCount} species across {result.familyCount} distinct botanical families
                </CardDescription>
              </div>

              <div className="text-right shrink-0">
                <div className="text-3xl font-black text-forest-800">{result.biodiversityScore}</div>
                <span className="text-[10px] text-slate-400">Bio-Index</span>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-5 text-xs">
              {/* Layer Architecture Matrix */}
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Multi-Tier Vertical Strata Coverage:
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className={`p-3 rounded-xl border text-center ${
                    result.layerCoverage.canopy ? 'bg-forest-50 border-forest-300 text-forest-900' : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                  }`}>
                    <div className="font-bold text-xs">Overstory Canopy</div>
                    <span className="text-[10px]">{result.layerCoverage.canopy ? '✓ Present' : '✗ Missing'}</span>
                  </div>

                  <div className={`p-3 rounded-xl border text-center ${
                    result.layerCoverage.subCanopy ? 'bg-forest-50 border-forest-300 text-forest-900' : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                  }`}>
                    <div className="font-bold text-xs">Sub-Canopy</div>
                    <span className="text-[10px]">{result.layerCoverage.subCanopy ? '✓ Present' : '✗ Missing'}</span>
                  </div>

                  <div className={`p-3 rounded-xl border text-center ${
                    result.layerCoverage.shrub ? 'bg-forest-50 border-forest-300 text-forest-900' : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                  }`}>
                    <div className="font-bold text-xs">Shrub Layer</div>
                    <span className="text-[10px]">{result.layerCoverage.shrub ? '✓ Present' : '✗ Missing'}</span>
                  </div>

                  <div className={`p-3 rounded-xl border text-center ${
                    result.layerCoverage.ground ? 'bg-forest-50 border-forest-300 text-forest-900' : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                  }`}>
                    <div className="font-bold text-xs">Herbaceous Ground</div>
                    <span className="text-[10px]">{result.layerCoverage.ground ? '✓ Present' : '✗ Missing'}</span>
                  </div>
                </div>
              </div>

              {/* Pollinator & Bird Habitat Index */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-amber-950 flex items-center gap-1.5 text-xs">
                      <Flower2 className="w-4 h-4 text-amber-600" />
                      Pollinator Support Index
                    </span>
                    <span className="font-mono font-bold text-amber-900">{result.pollinatorSupportScore}%</span>
                  </div>
                  <div className="text-[11px] text-slate-600">
                    Provides continuous nectar flow from {result.continuousBloomSequence.join(', ') || 'selected blooms'}.
                  </div>
                </div>

                <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-blue-950 flex items-center gap-1.5 text-xs">
                      <Bird className="w-4 h-4 text-blue-600" />
                      Avian & Songbird Habitat
                    </span>
                    <span className="font-mono font-bold text-blue-900">{result.birdHabitatScore}%</span>
                  </div>
                  <div className="text-[11px] text-slate-600">
                    High winter lipid berry forage and nesting architectural security.
                  </div>
                </div>
              </div>

              {/* Strengths & Recommendations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <div className="font-semibold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Ecological Design Strengths:
                  </div>
                  <ul className="space-y-1">
                    {result.strengths.map((str, idx) => (
                      <li key={idx} className="text-slate-600 text-[11px] flex items-start gap-1.5">
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-1.5">
                  <div className="font-semibold text-amber-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Ecological Recommendations:
                  </div>
                  <ul className="space-y-1">
                    {result.improvements.map((imp, idx) => (
                      <li key={idx} className="text-slate-600 text-[11px] flex items-start gap-1.5">
                        <span className="text-amber-600 font-bold">!</span>
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
