import React, { useState } from 'react';
import { SoilType, SoilCondition } from '../../types/planting';
import { analyzeSoilCompatibility } from '../../services/plantingIntelligenceService';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../common/Card';
import { Badge } from '../common/Badge';
import {
  Layers,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
  Droplets,
  TreeDeciduous,
  ArrowRight
} from 'lucide-react';

const SOIL_TYPES: SoilType[] = ['Loam', 'Clay', 'Sandy', 'Silty', 'Peaty', 'Chalky', 'Rocky'];
const SOIL_CONDITIONS: SoilCondition[] = [
  'Well Drained',
  'Rich / Humus',
  'Compacted / Poor',
  'Rocky',
  'Waterlogged'
];

export const SoilCompatibilityChecker: React.FC = () => {
  const [selectedSoil, setSelectedSoil] = useState<SoilType>('Loam');
  const [selectedCondition, setSelectedCondition] = useState<SoilCondition>('Well Drained');

  const analysis = analyzeSoilCompatibility(selectedSoil, selectedCondition);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-700" />
            Soil Compatibility & Substrate Analysis
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluate percolation, compaction vulnerability, and botanically verified species matching for your local substrate.
          </p>
        </div>
        <Badge variant="amber" className="w-fit text-xs">
          Agronomic Physics Model
        </Badge>
      </div>

      {/* Disclaimers & Transparency */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3 text-xs text-amber-900">
        <Info className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
        <div>
          <span className="font-semibold">Laboratory Analysis Disclaimer: </span>
          This tool calculates physical drainage and nutrient dynamics from standard soil texture classifications. It does not claim or simulate chemical laboratory soil core assays (pH, cation exchange, heavy metal tests).
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm">Select Substrate Parameters</CardTitle>
            <CardDescription className="text-xs">Configure your site's physical soil profile</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Soil Texture Classification
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {SOIL_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedSoil(type)}
                    className={`py-2 px-2.5 rounded-lg text-xs font-medium text-left transition-all ${
                      selectedSoil === type
                        ? 'bg-amber-800 text-white shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Physical Soil Condition
              </label>
              <div className="space-y-1.5">
                {SOIL_CONDITIONS.map((cond) => (
                  <button
                    key={cond}
                    type="button"
                    onClick={() => setSelectedCondition(cond)}
                    className={`w-full py-2 px-3 rounded-lg text-xs font-medium text-left transition-all flex items-center justify-between ${
                      selectedCondition === cond
                        ? 'bg-amber-800 text-white shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    <span>{cond}</span>
                    {selectedCondition === cond && <CheckCircle2 className="w-3.5 h-3.5 text-lime-400" />}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="lg:col-span-2 space-y-4">
          {/* Analysis Summary */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-slate-900">
                  Substrate Physics: {analysis.selectedSoilType} ({analysis.selectedSoilCondition})
                </CardTitle>
                <div className="flex gap-2">
                  <Badge variant={analysis.compactionRisk === 'High' ? 'rose' : 'slate'}>
                    Compaction: {analysis.compactionRisk}
                  </Badge>
                  <Badge variant={analysis.drainageRate.includes('Slow') ? 'amber' : 'emerald'}>
                    Percolation: {analysis.drainageRate.split('/')[0]}
                  </Badge>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {analysis.scientificExplanation}
              </p>
            </CardHeader>

            <CardContent className="space-y-4 pt-1">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Recommended Soil Amendments & Planting Techniques
                </h4>
                <div className="space-y-1.5">
                  {analysis.amendmentRecommendations.map((rec, i) => (
                    <div
                      key={i}
                      className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-700 flex items-start gap-2"
                    >
                      <ArrowRight className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Compatible Species List */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                  <TreeDeciduous className="w-3.5 h-3.5 text-forest-700" />
                  Naturally Thriving Species for {analysis.selectedSoilType} ({analysis.suitableSpecies.length} in Catalog)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {analysis.suitableSpecies.map((sp) => (
                    <div
                      key={sp.id}
                      className="bg-white border border-slate-200 rounded-lg p-3 hover:border-amber-400 transition-all shadow-2xs flex items-center gap-3"
                    >
                      <img
                        src={sp.imageUrl}
                        alt={sp.commonName}
                        className="w-12 h-12 rounded-lg object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {sp.commonName}
                        </div>
                        <div className="text-[11px] italic text-slate-500 truncate">
                          {sp.scientificName}
                        </div>
                        <div className="flex gap-1.5 mt-1">
                          <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-medium">
                            {sp.rootSystem}
                          </span>
                          <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-medium">
                            {sp.waterNeed} Water
                          </span>
                        </div>
                      </div>
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
