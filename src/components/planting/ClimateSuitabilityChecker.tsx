import React, { useState } from 'react';
import { ClimateSuitabilityInput, ClimateSuitabilityResult } from '../../types/planting';
import { checkClimateSuitability } from '../../services/plantingIntelligenceService';
import { SPECIES_CATALOG } from '../../data/speciesCatalog';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import {
  Thermometer,
  CloudRain,
  Sun,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Info,
  Layers,
  ShieldCheck,
  Flame,
  Snowflake
} from 'lucide-react';

export const ClimateSuitabilityChecker: React.FC = () => {
  const [input, setInput] = useState<ClimateSuitabilityInput>({
    speciesId: SPECIES_CATALOG[0].id,
    summerMaxTempC: 36,
    winterMinTempC: -28,
    annualRainfallMm: 780,
    hasIrrigation: true,
    droughtSeverity: 'Mild',
  });

  const [result, setResult] = useState<ClimateSuitabilityResult>(() => checkClimateSuitability(input));

  const handleEvaluate = (updated: ClimateSuitabilityInput) => {
    setInput(updated);
    setResult(checkClimateSuitability(updated));
  };

  const selectedSpecies = SPECIES_CATALOG.find((s) => s.id === input.speciesId) || SPECIES_CATALOG[0];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Thermometer className="w-5 h-5 text-forest-700" />
            Bioclimatic & Thermal Suitability Checker
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Test species survival thresholds against localized heatwaves, winter hardiness minimums, and precipitation deficits.
          </p>
        </div>
        <Badge variant="lime" dot>Microclimate Stress Modeling</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Climate Inputs */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Climate & Environmental Envelope</CardTitle>
            <CardDescription>Adjust localized temperature & rainfall parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            {/* Target Species */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Target Species</label>
              <select
                value={input.speciesId}
                onChange={(e) => handleEvaluate({ ...input, speciesId: e.target.value })}
                className="w-full border border-sage-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-forest-500"
              >
                {SPECIES_CATALOG.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.commonName} ({s.scientificName})
                  </option>
                ))}
              </select>
            </div>

            {/* Summer High */}
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  Peak Summer Max Temp:
                </span>
                <span className="font-mono text-amber-600 font-bold">{input.summerMaxTempC}°C</span>
              </div>
              <input
                type="range"
                min="20"
                max="50"
                step="1"
                value={input.summerMaxTempC}
                onChange={(e) => handleEvaluate({ ...input, summerMaxTempC: Number(e.target.value) })}
                className="w-full accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>20°C (Mild)</span>
                <span>35°C (Warm)</span>
                <span>50°C (Extreme Heat)</span>
              </div>
            </div>

            {/* Winter Low */}
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <Snowflake className="w-3.5 h-3.5 text-blue-500" />
                  Extreme Winter Minimum:
                </span>
                <span className="font-mono text-blue-600 font-bold">{input.winterMinTempC}°C</span>
              </div>
              <input
                type="range"
                min="-45"
                max="15"
                step="1"
                value={input.winterMinTempC}
                onChange={(e) => handleEvaluate({ ...input, winterMinTempC: Number(e.target.value) })}
                className="w-full accent-blue-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>-45°C (Polar)</span>
                <span>-15°C (Moderate)</span>
                <span>+15°C (Tropical)</span>
              </div>
            </div>

            {/* Rainfall */}
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <CloudRain className="w-3.5 h-3.5 text-blue-600" />
                  Annual Rainfall:
                </span>
                <span className="font-mono text-blue-700 font-bold">{input.annualRainfallMm} mm / yr</span>
              </div>
              <input
                type="range"
                min="150"
                max="3000"
                step="50"
                value={input.annualRainfallMm}
                onChange={(e) => handleEvaluate({ ...input, annualRainfallMm: Number(e.target.value) })}
                className="w-full accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>150mm (Arid)</span>
                <span>900mm (Subhumid)</span>
                <span>3000mm (Rainforest)</span>
              </div>
            </div>

            {/* Drought Frequency */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Drought Frequency</label>
              <select
                value={input.droughtSeverity}
                onChange={(e) => handleEvaluate({ ...input, droughtSeverity: e.target.value as any })}
                className="w-full border border-sage-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-forest-500"
              >
                <option value="None">Infrequent / Normal Rainfall Patterns</option>
                <option value="Mild">Occasional 2-3 Week Mid-Summer Dry Spells</option>
                <option value="Moderate">Frequent Seasonal Summer Droughts</option>
                <option value="Severe">Severe Multi-Month Prolonged Aridity</option>
              </select>
            </div>

            {/* Irrigation toggle */}
            <div className="pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={input.hasIrrigation}
                  onChange={(e) => handleEvaluate({ ...input, hasIrrigation: e.target.checked })}
                  className="rounded text-forest-700 focus:ring-forest-500"
                />
                <span className="text-slate-700 font-medium">Supplementary Drip Irrigation Available</span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Right 2 Columns: Climate Verdict & Risk Analysis */}
        <div className="lg:col-span-2 space-y-5">
          {/* Main Verdict Card */}
          <Card className="border-2 border-forest-100 overflow-hidden">
            <CardHeader className="bg-forest-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge
                    variant={
                      result.score >= 80
                        ? 'emerald'
                        : result.score >= 65
                        ? 'forest'
                        : result.score >= 50
                        ? 'amber'
                        : 'rose'
                    }
                    size="sm"
                  >
                    {result.verdict.toUpperCase()}
                  </Badge>
                  <span className="font-mono text-xs text-slate-500">
                    Suitability Score: {result.score}/100
                  </span>
                </div>
                <CardTitle>{selectedSpecies.commonName}</CardTitle>
                <CardDescription>
                  Natural Tolerance Range: {selectedSpecies.minTempC}°C to {selectedSpecies.maxTempC}°C · {selectedSpecies.minAnnualRainfallMm}-{selectedSpecies.maxAnnualRainfallMm}mm rain
                </CardDescription>
              </div>

              <div className="text-right shrink-0">
                <div className="text-2xl font-black text-forest-800">{result.score}%</div>
                <span className="text-[10px] text-slate-400">Climate Index</span>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-5 text-xs">
              {/* Three Compatibility Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Thermal Range</span>
                  <div className="font-bold text-slate-800 text-sm mt-0.5">{result.tempCompatibility}</div>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Range: {input.winterMinTempC}°C to {input.summerMaxTempC}°C
                  </span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Precipitation Balance</span>
                  <div className="font-bold text-slate-800 text-sm mt-0.5">{result.waterCompatibility}</div>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    {input.annualRainfallMm} mm annual rainfall
                  </span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Drought Resilience</span>
                  <div className="font-bold text-slate-800 text-sm mt-0.5">{result.droughtVulnerability}</div>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Species Drought: {selectedSpecies.droughtTolerance}
                  </span>
                </div>
              </div>

              {/* Warnings Box */}
              {result.warnings.length > 0 && (
                <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2">
                  <div className="font-bold text-amber-950 flex items-center gap-1.5 text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    Bioclimatic Warnings & Stress Indicators ({result.warnings.length}):
                  </div>
                  <ul className="space-y-1.5">
                    {result.warnings.map((w, idx) => (
                      <li key={idx} className="text-slate-700 text-[11px] flex items-start gap-1.5">
                        <span className="text-amber-600 font-bold">!</span>
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Practical Recommendations Box */}
              <div className="p-4 bg-forest-50/70 border border-forest-200 rounded-xl space-y-2">
                <div className="font-bold text-forest-950 flex items-center gap-1.5 text-xs">
                  <Sparkles className="w-4 h-4 text-forest-700 shrink-0" />
                  Practical Horticultural Recommendations:
                </div>
                <div className="space-y-1.5">
                  {result.recommendations.map((rec, idx) => (
                    <div key={idx} className="bg-white p-2.5 rounded-lg border border-slate-100 text-slate-700 text-[11px] flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{rec}</span>
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
