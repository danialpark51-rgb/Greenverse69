import React, { useState, useEffect } from 'react';
import {
  PlantingRiskInput,
  PlantingRiskResult,
  SoilType,
  SoilCondition,
  WaterAvailability,
  SunlightCondition,
  InfrastructureProximity,
  DbSiteAssessment
} from '../../types/planting';
import { scanPlantingRisks, fetchSiteAssessments } from '../../services/plantingIntelligenceService';
import { SPECIES_CATALOG } from '../../data/speciesCatalog';
import { useAuth } from '../../context/AuthContext';
import { InteractiveMap, MapMarkerItem } from '../map/InteractiveMap';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Droplets,
  Layers,
  Thermometer,
  Compass,
  Building2,
  RefreshCw,
  MapPin,
  Map
} from 'lucide-react';

export const PlantingRiskScanner: React.FC = () => {
  const { user } = useAuth();
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>({
    lat: 44.9778,
    lng: -93.2650,
  });
  const [locationName, setLocationName] = useState('Minneapolis, MN (Zone 4b)');
  const [savedSites, setSavedSites] = useState<DbSiteAssessment[]>([]);

  const [input, setInput] = useState<PlantingRiskInput>({
    soilType: 'Clay',
    soilCondition: 'Compacted / Poor',
    waterAvailability: 'Rainfall Only',
    sunlight: 'Full Sun',
    summerMaxTempC: 39,
    winterMinTempC: -25,
    areaSqm: 80,
    infrastructure: ['Under Overhead Cables'],
    selectedSpeciesIds: [SPECIES_CATALOG[0].id],
    drainageIssue: true,
  });

  const [result, setResult] = useState<PlantingRiskResult>(() => scanPlantingRisks(input));

  useEffect(() => {
    fetchSiteAssessments(user?.id).then((res) => {
      setSavedSites(res.data);
    });
  }, [user]);

  const handleScan = (updated: PlantingRiskInput) => {
    setInput(updated);
    setResult(scanPlantingRisks(updated));
  };

  const handleToggleInfra = (item: InfrastructureProximity) => {
    const next = input.infrastructure.includes(item)
      ? input.infrastructure.filter((i) => i !== item)
      : [...input.infrastructure, item];
    handleScan({ ...input, infrastructure: next });
  };

  const handleMapLocationSelect = (loc: { lat: number; lng: number; address: string }) => {
    setSelectedCoords({ lat: loc.lat, lng: loc.lng });
    setLocationName(loc.address);
  };

  const handleLoadSite = (site: DbSiteAssessment) => {
    if (site.latitude && site.longitude) {
      setSelectedCoords({ lat: site.latitude, lng: site.longitude });
    }
    setLocationName(site.location_name);
    handleScan({
      ...input,
      soilType: site.soil_type as SoilType,
      soilCondition: site.soil_condition as SoilCondition,
      waterAvailability: site.water_availability as WaterAvailability,
      sunlight: site.sunlight as SunlightCondition,
      areaSqm: site.space_sqm,
      infrastructure: site.infrastructure_notes
        ? (site.infrastructure_notes.split(', ') as InfrastructureProximity[])
        : ['Clear Open Area'],
    });
  };

  const mapMarkers: MapMarkerItem[] = savedSites
    .filter((s) => s.latitude !== null && s.longitude !== null)
    .map((s) => ({
      id: s.id,
      lat: s.latitude!,
      lng: s.longitude!,
      title: s.site_name,
      subtitle: `${s.location_name}`,
      score: s.suitability_score,
      variant: s.suitability_score >= 80 ? 'emerald' : 'amber',
      data: s,
    }));

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-forest-700" />
            Planting Risk Scanner & Location-Based Vulnerability Audit
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Identify 8 potential mortality drivers (drainage, heat, root conflicts, drought) linked to exact map coordinates.
          </p>
        </div>
        <Badge
          variant={
            result.overallRiskLevel === 'Low'
              ? 'emerald'
              : result.overallRiskLevel === 'Moderate'
              ? 'amber'
              : 'rose'
          }
          dot
        >
          {result.overallRiskLevel.toUpperCase()} RISK LEVEL
        </Badge>
      </div>

      {/* Interactive Map Location Selector */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-800 flex items-center gap-1.5">
            <Map className="w-4 h-4 text-forest-700" />
            Select Planting Site to Audit on Map
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            {selectedCoords ? `${selectedCoords.lat.toFixed(4)}°, ${selectedCoords.lng.toFixed(4)}° — ${locationName}` : 'Click map to place target marker'}
          </span>
        </div>

        <InteractiveMap
          center={selectedCoords ? [selectedCoords.lat, selectedCoords.lng] : [44.9778, -93.2650]}
          zoom={13}
          height="280px"
          selectedLocation={selectedCoords}
          onLocationSelect={handleMapLocationSelect}
          markers={mapMarkers}
          onMarkerClick={(m) => {
            if (m.data) handleLoadSite(m.data);
          }}
          enableSearch={true}
          enableClickToPick={true}
          searchPlaceholder="Search address to inspect risk profile..."
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Risk Factor Inputs */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Plot Environmental Factors</CardTitle>
            <CardDescription>Configure risk variables for {locationName}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3.5 text-xs">
            {/* Water availability */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Water Supply</label>
              <select
                value={input.waterAvailability}
                onChange={(e) =>
                  handleScan({ ...input, waterAvailability: e.target.value as WaterAvailability })
                }
                className="w-full border border-sage-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-forest-500"
              >
                <option value="Automated Irrigation">Automated Irrigation</option>
                <option value="Periodic Manual Hose">Manual Hose / Spigot Access</option>
                <option value="Rainfall Only">Natural Rainfall Only</option>
                <option value="Seasonal Drought Prone">Rainfall Only + Drought Prone</option>
              </select>
            </div>

            {/* Soil condition */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Soil Condition</label>
              <select
                value={input.soilCondition}
                onChange={(e) =>
                  handleScan({ ...input, soilCondition: e.target.value as SoilCondition })
                }
                className="w-full border border-sage-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-forest-500"
              >
                <option value="Well Drained">Well Drained (Aerated)</option>
                <option value="Rich / Humus">Rich / Humus Layer</option>
                <option value="Compacted / Poor">Compacted / Heavy Foot Traffic</option>
                <option value="Rocky">Rocky / Thin Substrate</option>
              </select>
            </div>

            {/* Drainage issue toggle */}
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={input.drainageIssue}
                  onChange={(e) => handleScan({ ...input, drainageIssue: e.target.checked })}
                  className="rounded text-forest-700 focus:ring-forest-500"
                />
                <span className="text-slate-700 font-medium text-[11px]">
                  Standing Water / Slow Drainage (&gt;48h post-rain)
                </span>
              </label>
            </div>

            {/* Summer max temp */}
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Peak Summer Heat:</span>
                <span className="font-mono text-amber-600 font-bold">{input.summerMaxTempC}°C</span>
              </div>
              <input
                type="range"
                min="25"
                max="48"
                step="1"
                value={input.summerMaxTempC}
                onChange={(e) => handleScan({ ...input, summerMaxTempC: Number(e.target.value) })}
                className="w-full accent-amber-500"
              />
            </div>

            {/* Sunlight */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Sunlight</label>
              <select
                value={input.sunlight}
                onChange={(e) =>
                  handleScan({ ...input, sunlight: e.target.value as SunlightCondition })
                }
                className="w-full border border-sage-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-forest-500"
              >
                <option value="Full Sun">Full Sun (6+ hrs)</option>
                <option value="Partial Shade">Partial Shade (3-6 hrs)</option>
                <option value="Full Shade">Full Shade (&lt;3 hrs)</option>
              </select>
            </div>

            {/* Infrastructure proximity */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Obstructions & Proximity</label>
              <div className="space-y-1">
                {(['Under Overhead Cables', 'Near Building (<3m)', 'Near Pavement / Curb'] as InfrastructureProximity[]).map(
                  (item) => (
                    <label
                      key={item}
                      className="flex items-center gap-2 p-1.5 rounded-lg border border-slate-200 bg-white cursor-pointer text-[11px]"
                    >
                      <input
                        type="checkbox"
                        checked={input.infrastructure.includes(item)}
                        onChange={() => handleToggleInfra(item)}
                        className="rounded text-forest-700 focus:ring-forest-500"
                      />
                      <span>{item}</span>
                    </label>
                  )
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right 2 Columns: Overall Readiness & Risk Breakdown */}
        <div className="lg:col-span-2 space-y-5">
          {/* Readiness Score Card */}
          <Card className="border-2 border-forest-100 overflow-hidden">
            <CardHeader className="bg-forest-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge
                    variant={
                      result.overallReadinessScore >= 80
                        ? 'emerald'
                        : result.overallReadinessScore >= 60
                        ? 'forest'
                        : result.overallReadinessScore >= 40
                        ? 'amber'
                        : 'rose'
                    }
                    size="sm"
                  >
                    READINESS: {result.overallReadinessScore}%
                  </Badge>
                  <span className="text-xs text-slate-500 font-mono">
                    {result.criticalCount} Critical/High Risk Factors
                  </span>
                </div>
                <CardTitle>Planting Readiness Evaluation</CardTitle>
                <CardDescription>{result.summaryRecommendation}</CardDescription>
              </div>

              <div className="text-right shrink-0">
                <div className="text-3xl font-black text-slate-900">{result.overallReadinessScore}%</div>
                <span className="text-[10px] text-slate-400">Survival Likelihood</span>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-4 text-xs">
              {/* Readiness Progress Bar */}
              <div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      result.overallReadinessScore >= 80
                        ? 'bg-emerald-600'
                        : result.overallReadinessScore >= 60
                        ? 'bg-forest-600'
                        : result.overallReadinessScore >= 40
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${result.overallReadinessScore}%` }}
                  />
                </div>
              </div>

              {/* Detected Risks Breakdown */}
              <div className="space-y-3 pt-2">
                <div className="font-bold text-slate-800 text-xs">
                  Detected Environmental Vulnerabilities ({result.risks.length}):
                </div>

                {result.risks.length === 0 ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>No elevated environmental mortality risks detected. The plot is ready for planting!</span>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {result.risks.map((risk, idx) => (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-xl border space-y-1.5 ${
                          risk.severity === 'Severe'
                            ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                            : risk.severity === 'High'
                            ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                            : 'bg-slate-50 border-slate-200 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs flex items-center gap-1.5">
                            <AlertTriangle
                              className={`w-3.5 h-3.5 ${
                                risk.severity === 'Severe' ? 'text-rose-600' : 'text-amber-600'
                              }`}
                            />
                            {risk.category}
                          </span>
                          <Badge
                            variant={
                              risk.severity === 'Severe'
                                ? 'rose'
                                : risk.severity === 'High'
                                ? 'amber'
                                : 'forest'
                            }
                            size="sm"
                          >
                            {risk.severity.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-slate-700">{risk.explanation}</p>
                        <div className="p-2 bg-white rounded-lg border border-slate-200/80 text-[11px] text-slate-800">
                          <strong className="text-forest-800">Recommended Action:</strong> {risk.mitigation}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
