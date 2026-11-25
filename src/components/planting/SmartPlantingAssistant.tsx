import React, { useState } from 'react';
import {
  SmartAssistantQuery,
  SoilType,
  SoilCondition,
  SunlightCondition,
  WaterAvailability
} from '../../types/planting';
import { generateSmartPlantingAssistantReport } from '../../services/plantingIntelligenceService';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import {
  Bot,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
  Droplets,
  Layers,
  Sun,
  Calendar,
  TreeDeciduous,
  ArrowRight
} from 'lucide-react';

export const SmartPlantingAssistant: React.FC = () => {
  const [query, setQuery] = useState<SmartAssistantQuery>({
    locationName: 'Community Restoration Site, Zone 4b',
    soilType: 'Loam',
    soilCondition: 'Well Drained',
    sunlight: 'Full Sun',
    waterAvailability: 'Automated Irrigation',
    targetObjective: 'Pollinator Support'
  });

  const [report, setReport] = useState(() => generateSmartPlantingAssistantReport(query));

  const handleUpdate = (updated: Partial<SmartAssistantQuery>) => {
    const next = { ...query, ...updated };
    setQuery(next);
    setReport(generateSmartPlantingAssistantReport(next));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Bot className="w-5 h-5 text-forest-700" />
            Smart Planting Assistant & Ecological Advisor
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Unified agronomic rule synthesizer: multi-vector site conditions, species matching, and soil care.
          </p>
        </div>
        <Badge variant="slate" className="text-xs">
          Deterministic Agronomic Engine
        </Badge>
      </div>

      {/* Honest AI / LLM Integration Notice */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-start gap-3 text-xs text-slate-700">
        <Info className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
        <div>
          <span className="font-semibold text-slate-900">Deterministic Botanical Logic Notice: </span>
          {report.confidenceNotice} Greenverse does not pretend an active external LLM or cloud model is running if unconfigured; these insights originate from validated ecological algorithms.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Parameters */}
        <Card className="lg:col-span-1 space-y-4">
          <CardHeader>
            <CardTitle className="text-sm">Synthesizer Parameters</CardTitle>
            <CardDescription className="text-xs">
              Configure unified site profile to generate recommendations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3.5 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Restoration Objective
              </label>
              <select
                value={query.targetObjective}
                onChange={(e) => handleUpdate({ targetObjective: e.target.value as any })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-800"
              >
                <option value="Pollinator Support">Pollinator & Biodiversity Support</option>
                <option value="Drought Resilience">Drought & Heat Resilience</option>
                <option value="Max Carbon Sequestration">Maximum Carbon Storage</option>
                <option value="Shade & Cooling">Urban Canopy & Microclimate Cooling</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sunlight Exposure
              </label>
              <select
                value={query.sunlight}
                onChange={(e) => handleUpdate({ sunlight: e.target.value as any })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-800"
              >
                <option value="Full Sun">Full Sun (6+ hrs direct)</option>
                <option value="Partial Shade">Partial Shade (3–6 hrs)</option>
                <option value="Full Shade">Full Shade (&lt; 3 hrs)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Soil Type
              </label>
              <select
                value={query.soilType}
                onChange={(e) => handleUpdate({ soilType: e.target.value as any })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-800"
              >
                <option value="Loam">Loam (Balanced)</option>
                <option value="Clay">Clay (Heavy / Dense)</option>
                <option value="Sandy">Sandy (Fast Draining)</option>
                <option value="Silty">Silty</option>
                <option value="Peaty">Peaty</option>
                <option value="Rocky">Rocky Substrate</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Soil Physical Condition
              </label>
              <select
                value={query.soilCondition}
                onChange={(e) => handleUpdate({ soilCondition: e.target.value as any })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-800"
              >
                <option value="Well Drained">Well Drained & Aerated</option>
                <option value="Rich / Humus">Rich / High Humus</option>
                <option value="Compacted / Poor">Compacted / Degraded Subsoil</option>
                <option value="Waterlogged">Waterlogged / Standing Water</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Water Availability
              </label>
              <select
                value={query.waterAvailability}
                onChange={(e) => handleUpdate({ waterAvailability: e.target.value as any })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-800"
              >
                <option value="Automated Irrigation">Automated Irrigation Active</option>
                <option value="Periodic Manual Hose">Periodic Manual Hose Watering</option>
                <option value="Rainfall Only">Natural Rainfall Only</option>
                <option value="Seasonal Drought Prone">Seasonal Drought Prone</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Synthesized Advisory Output */}
        <div className="lg:col-span-2 space-y-4">
          {/* Top Species Recommendations */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-slate-900">
                Primary Matched Keystone Species ({report.recommendedSpecies.length} Recommended)
              </CardTitle>
              <CardDescription className="text-xs">
                Selected for physiological compatibility with your site inputs
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {report.recommendedSpecies.map((sp) => (
                  <div
                    key={sp.id}
                    className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-3"
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
                      <div className="text-[10px] text-forest-700 font-semibold mt-0.5">
                        {sp.canopyLayer} • {sp.waterNeed} Water
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Assistant Action Advice Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Soil Prep */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-700" />
                  Substrate Preparation Guidance
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-slate-700 pt-0">
                {report.soilPreparationTip}
              </CardContent>
            </Card>

            {/* Watering Advice */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-sky-600" />
                  Establishment Irrigation Strategy
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-slate-700 pt-0">
                {report.wateringAdvice}
              </CardContent>
            </Card>
          </div>

          {/* Seasonal Calendar Highlight */}
          <Card className="bg-emerald-50/50 border-emerald-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs flex items-center gap-2 text-emerald-950">
                <Calendar className="w-4 h-4 text-emerald-700" />
                Seasonal Calendar Timing Window
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-emerald-900 pt-0">
              {report.seasonalCalendarHighlight}
            </CardContent>
          </Card>

          {/* Ecological Warnings if any */}
          {report.ecologicalWarnings.length > 0 && (
            <Card className="border-amber-200 bg-amber-50/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs flex items-center gap-2 text-amber-950">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Agronomic Stress Warnings & Mitigations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5 pt-0 text-xs text-amber-900">
                {report.ecologicalWarnings.map((warn, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <ArrowRight className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>{warn}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
