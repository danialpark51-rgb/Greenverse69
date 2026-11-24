import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import {
  Sparkles,
  Compass,
  Cpu,
  Layers,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Droplets,
  Sun,
  ShieldCheck,
  TreeDeciduous,
  ArrowRight
} from 'lucide-react';

export const IntelligencePage: React.FC = () => {
  const [region, setRegion] = useState('Upper Mississippi Basin');
  const [soilType, setSoilType] = useState('Loam / Mollisol (pH 6.8)');
  const [sunlight, setSunlight] = useState('Full Sun (6+ hrs)');
  const [drainage, setDrainage] = useState('Well Drained');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(true);

  const handleRunAnalysis = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setHasAnalyzed(true);
    }, 800);
  };

  const recommendations = [
    {
      species: 'Bur Oak (Quercus macrocarpa)',
      matchScore: 98,
      droughtTolerance: 'High',
      carbonYield: '1.4t CO2e / 30yr',
      biodiversitySupport: '500+ Lepidoptera species',
      rationale: 'Exceptional deep taproot anchoring suited for loamy mollisols with maximum drought resilience under warming climate shifts.',
      badge: 'Best Native Anchor',
    },
    {
      species: 'Hackberry (Celtis occidentalis)',
      matchScore: 94,
      droughtTolerance: 'Very High',
      carbonYield: '1.1t CO2e / 30yr',
      biodiversitySupport: 'High avian winter forage',
      rationale: 'Highly adaptive to variable moisture regimes, resilient to urban soil compaction and wind shear.',
      badge: 'High Adaptability',
    },
    {
      species: 'American Basswood (Tilia americana)',
      matchScore: 89,
      droughtTolerance: 'Moderate',
      carbonYield: '1.3t CO2e / 30yr',
      biodiversitySupport: 'Critical pollinator nectar source',
      rationale: 'Deep leaf litter creates nutrient-rich humus layer accelerating microbial soil biodiversity.',
      badge: 'Pollinator Keystone',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-lime-600" />
            Smart Planting Intelligence Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            AI-driven native species recommendations based on bioclimatic projections, soil microbes, and drought resilience.
          </p>
        </div>
        <Badge variant="lime" dot size="md">
          Neural Net Biome v3.2 Active
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Environmental Input Simulator */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div>
              <CardTitle>Site Bioclimatic Inputs</CardTitle>
              <CardDescription>Specify planting plot parameters</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRunAnalysis} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Target Watershed / Region</label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full px-3 py-2 border border-sage-300 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-forest-600"
                >
                  <option value="Upper Mississippi Basin">Upper Mississippi Basin (Zone 4b/5a)</option>
                  <option value="Cascadia Riparian Corridor">Cascadia Riparian Corridor (Zone 8a)</option>
                  <option value="Biscayne Coastal Biosphere">Biscayne Coastal Biosphere (Zone 10b)</option>
                  <option value="Appalachian Hardwood Range">Appalachian Hardwood Range (Zone 6a)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Soil Texture & Chemistry</label>
                <select
                  value={soilType}
                  onChange={(e) => setSoilType(e.target.value)}
                  className="w-full px-3 py-2 border border-sage-300 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-forest-600"
                >
                  <option value="Loam / Mollisol (pH 6.8)">Loam / Mollisol (pH 6.8 - Balanced)</option>
                  <option value="Hydric Clay / Peat (pH 7.4)">Hydric Clay / Peat (High Moisture)</option>
                  <option value="Sandy Acidic Ultisol (pH 5.4)">Sandy Acidic Ultisol (Low Retentive)</option>
                  <option value="Compacted Urban Fill (pH 7.8)">Compacted Urban Fill (Disturbed)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Solar Irradiance</label>
                <select
                  value={sunlight}
                  onChange={(e) => setSunlight(e.target.value)}
                  className="w-full px-3 py-2 border border-sage-300 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-forest-600"
                >
                  <option value="Full Sun (6+ hrs)">Full Sun (6+ hrs Direct Radiation)</option>
                  <option value="Partial Canopy Shade">Partial Canopy Shade (3-6 hrs)</option>
                  <option value="Dense Understory Shade">Dense Understory Shade (&lt;3 hrs)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Hydrologic Drainage</label>
                <select
                  value={drainage}
                  onChange={(e) => setDrainage(e.target.value)}
                  className="w-full px-3 py-2 border border-sage-300 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-forest-600"
                >
                  <option value="Well Drained">Well Drained (Permeable)</option>
                  <option value="Periodically Flooded">Periodically Flooded (Riparian/Tidal)</option>
                  <option value="Arid / Rapid Evaporation">Arid / Rapid Evaporation</option>
                </select>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full"
                  isLoading={isAnalyzing}
                  icon={<Cpu className="w-4 h-4" />}
                >
                  Generate Planting Strategy
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Right 2 Columns: AI Synthesis & Ranked Species */}
        <div className="lg:col-span-2 space-y-5">
          {/* AI Bioclimatic Summary Card */}
          <div className="p-5 rounded-xl bg-forest-deep text-white border border-forest-moss space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-lime-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Ecological Model Verdict
              </span>
              <span className="text-xs text-forest-300 font-mono">Confidence: 96.8%</span>
            </div>
            <h3 className="text-base font-bold text-white">
              Optimal Planting Window: Early Spring (April 10 – May 2)
            </h3>
            <p className="text-xs text-forest-200 leading-relaxed">
              Based on historical rainfall deficits and 2030 climate warming envelope projections for the <strong className="text-white">{region}</strong>,
              prioritize deep-rooted oak and hackberry species with mycorrhizal inoculation to ensure greater than 92% 3-year survival rate.
            </p>
          </div>

          {/* Ranked Species Cards */}
          <div className="space-y-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Ranked Native Species Recommendations ({recommendations.length})
            </div>

            {recommendations.map((rec, i) => (
              <Card key={rec.species} hoverEffect className="overflow-hidden">
                <div className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-forest-100 text-forest-800 text-xs font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">{rec.species}</h4>
                      <Badge variant="lime" size="sm">{rec.badge}</Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="text-xs font-bold text-forest-700">{rec.matchScore}% Match</div>
                        <div className="text-[10px] text-slate-400">Biome Fit</div>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mb-4 leading-relaxed">{rec.rationale}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3 border-t border-slate-100 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-lg">
                      <div className="text-[10px] text-slate-400">Drought Resilience</div>
                      <div className="font-semibold text-slate-800">{rec.droughtTolerance}</div>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-lg">
                      <div className="text-[10px] text-slate-400">Est. Carbon Sequestration</div>
                      <div className="font-semibold text-forest-700">{rec.carbonYield}</div>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-lg">
                      <div className="text-[10px] text-slate-400">Biodiversity Anchor</div>
                      <div className="font-semibold text-slate-800 truncate">{rec.biodiversitySupport}</div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
