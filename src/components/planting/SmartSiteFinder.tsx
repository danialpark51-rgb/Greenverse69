import React, { useState, useEffect } from 'react';
import {
  SiteAssessmentInput,
  SiteAssessmentResult,
  DbSiteAssessment,
  SunlightCondition,
  SoilType,
  SoilCondition,
  WaterAvailability,
  InfrastructureProximity
} from '../../types/planting';
import { evaluateSiteAssessment, saveSiteAssessment, fetchSiteAssessments } from '../../services/plantingIntelligenceService';
import { useAuth } from '../../context/AuthContext';
import { InteractiveMap, MapMarkerItem } from '../map/InteractiveMap';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import {
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Maximize2,
  Sun,
  Layers,
  Droplets,
  Building2,
  Loader2,
  Save,
  RotateCcw,
  Compass,
  Map
} from 'lucide-react';

export const SmartSiteFinder: React.FC = () => {
  const { user } = useAuth();
  const [form, setForm] = useState<SiteAssessmentInput>({
    site_name: 'Upper Mississippi River Parkway Plot',
    location_name: 'Minneapolis, MN (Zone 4b)',
    latitude: 44.9778,
    longitude: -93.2650,
    space_width_m: 10,
    space_length_m: 12,
    sunlight: 'Full Sun',
    soil_type: 'Loam',
    soil_condition: 'Well Drained',
    water_availability: 'Automated Irrigation',
    infrastructure: ['Clear Open Area'],
    notes: 'South-facing lawn strip adjacent to community walking path.',
  });

  const [result, setResult] = useState<SiteAssessmentResult>(() => evaluateSiteAssessment(form));
  const [savedSites, setSavedSites] = useState<DbSiteAssessment[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  useEffect(() => {
    fetchSiteAssessments(user?.id).then((res) => {
      setSavedSites(res.data);
      setLoadingSaved(false);
    });
  }, [user]);

  const handleEvaluate = (e: React.FormEvent) => {
    e.preventDefault();
    const evaluated = evaluateSiteAssessment(form);
    setResult(evaluated);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveFeedback(null);
    const res = await saveSiteAssessment(form, user?.id);
    setIsSaving(false);
    if (res.data) {
      setSavedSites((prev) => [res.data!, ...prev.filter((s) => s.id !== res.data!.id)]);
      setSaveFeedback(res.fromSupabase ? 'Site assessment with GPS coordinates saved to database!' : 'Assessment saved to local session registry.');
      setTimeout(() => setSaveFeedback(null), 3500);
    }
  };

  const handleSelectInfrastructure = (item: InfrastructureProximity) => {
    setForm((prev) => {
      if (item === 'Clear Open Area') return { ...prev, infrastructure: ['Clear Open Area'] };
      const current = prev.infrastructure.filter((i) => i !== 'Clear Open Area');
      return current.includes(item)
        ? { ...prev, infrastructure: current.filter((i) => i !== item) }
        : { ...prev, infrastructure: [...current, item] };
    });
  };

  const handleMapLocationSelect = (loc: { lat: number; lng: number; address: string }) => {
    setForm((prev) => ({
      ...prev,
      latitude: loc.lat,
      longitude: loc.lng,
      location_name: loc.address || prev.location_name,
    }));
  };

  const loadSavedSite = (site: DbSiteAssessment) => {
    setForm({
      site_name: site.site_name,
      location_name: site.location_name,
      latitude: site.latitude,
      longitude: site.longitude,
      space_width_m: Math.round(Math.sqrt(site.space_sqm)),
      space_length_m: Math.round(Math.sqrt(site.space_sqm)),
      sunlight: site.sunlight as SunlightCondition,
      soil_type: site.soil_type as SoilType,
      soil_condition: site.soil_condition as SoilCondition,
      water_availability: site.water_availability as WaterAvailability,
      infrastructure: site.infrastructure_notes
        ? (site.infrastructure_notes.split(', ') as InfrastructureProximity[])
        : ['Clear Open Area'],
      notes: '',
    });
    setResult(site.assessment_result || evaluateSiteAssessment(form));
  };

  // Prepare markers for saved sites
  const mapMarkers: MapMarkerItem[] = savedSites
    .filter((s) => s.latitude !== null && s.longitude !== null)
    .map((s) => ({
      id: s.id,
      lat: s.latitude!,
      lng: s.longitude!,
      title: s.site_name,
      subtitle: `${s.location_name} (${s.space_sqm} m²)`,
      score: s.suitability_score,
      variant: s.suitability_score >= 80 ? 'emerald' : s.suitability_score >= 60 ? 'forest' : 'amber',
      data: s,
    }));

  return (
    <div className="space-y-6">
      {/* Title & Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Compass className="w-5 h-5 text-forest-700" />
            Smart Site Finder & Live Interactive Map
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pinpoint potential planting plots on OpenStreetMap, search addresses, assess soil/sunlight, and store GPS coordinates.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="emerald" dot>Leaflet + OSM Live</Badge>
          <Badge variant="forest">GPS Geo-Tagging</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Assessment Form */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Site Parameters & Plot Input</CardTitle>
            <CardDescription>Enter parameters or click map to auto-fill location</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleEvaluate} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Site / Plot Identifier</label>
                <input
                  type="text"
                  value={form.site_name}
                  onChange={(e) => setForm({ ...form, site_name: e.target.value })}
                  className="w-full border border-sage-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-forest-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Geographic Location / Address</label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-forest-700 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={form.location_name}
                    onChange={(e) => setForm({ ...form, location_name: e.target.value })}
                    className="w-full border border-sage-200 rounded-lg pl-8 pr-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-forest-500"
                    required
                  />
                </div>
                {form.latitude && form.longitude && (
                  <span className="text-[10px] text-forest-700 font-mono mt-1 block">
                    Coordinates: {form.latitude.toFixed(5)}°, {form.longitude.toFixed(5)}°
                  </span>
                )}
              </div>

              {/* Dimensions */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Plot Width (m)</label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={form.space_width_m}
                    onChange={(e) => setForm({ ...form, space_width_m: Math.max(1, Number(e.target.value)) })}
                    className="w-full border border-sage-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-forest-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Plot Length (m)</label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={form.space_length_m}
                    onChange={(e) => setForm({ ...form, space_length_m: Math.max(1, Number(e.target.value)) })}
                    className="w-full border border-sage-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-forest-500"
                    required
                  />
                </div>
              </div>
              <div className="text-[11px] text-slate-500 flex items-center justify-between px-1">
                <span>Calculated Footprint:</span>
                <span className="font-bold text-forest-800">{form.space_width_m * form.space_length_m} m²</span>
              </div>

              {/* Sunlight Condition */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Sunlight Exposure</label>
                <select
                  value={form.sunlight}
                  onChange={(e) => setForm({ ...form, sunlight: e.target.value as SunlightCondition })}
                  className="w-full border border-sage-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-forest-500"
                >
                  <option value="Full Sun">Full Sun (6+ hours direct irradiance)</option>
                  <option value="Partial Shade">Partial Shade (3 - 6 hours direct sunlight)</option>
                  <option value="Full Shade">Full Shade (Under 3 hours direct sunlight)</option>
                </select>
              </div>

              {/* Soil Parameters */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Soil Texture</label>
                  <select
                    value={form.soil_type}
                    onChange={(e) => setForm({ ...form, soil_type: e.target.value as SoilType })}
                    className="w-full border border-sage-200 rounded-lg px-2.5 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-forest-500"
                  >
                    <option value="Loam">Loam (Optimal)</option>
                    <option value="Clay">Clay (Heavy)</option>
                    <option value="Sandy">Sandy (Rapid drain)</option>
                    <option value="Silty">Silty</option>
                    <option value="Chalky">Chalky / Alkaline</option>
                    <option value="Peaty">Peaty / Acidic</option>
                    <option value="Rocky">Rocky / Gravelly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Soil Condition</label>
                  <select
                    value={form.soil_condition}
                    onChange={(e) => setForm({ ...form, soil_condition: e.target.value as SoilCondition })}
                    className="w-full border border-sage-200 rounded-lg px-2.5 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-forest-500"
                  >
                    <option value="Well Drained">Well Drained</option>
                    <option value="Rich / Humus">Rich / Humus</option>
                    <option value="Compacted / Poor">Compacted / Poor</option>
                    <option value="Rocky">Rocky / Thin</option>
                    <option value="Waterlogged">Waterlogged / Wet</option>
                  </select>
                </div>
              </div>

              {/* Water Availability */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Water Access</label>
                <select
                  value={form.water_availability}
                  onChange={(e) => setForm({ ...form, water_availability: e.target.value as WaterAvailability })}
                  className="w-full border border-sage-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-forest-500"
                >
                  <option value="Automated Irrigation">Automated Irrigation (Drip / Sprinkler)</option>
                  <option value="Periodic Manual Hose">Periodic Manual Hose / Spigot Access</option>
                  <option value="Rainfall Only">Natural Rainfall Only</option>
                  <option value="Seasonal Drought Prone">Rainfall Only + Drought Prone</option>
                </select>
              </div>

              {/* Infrastructure Obstacles */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">Obstructions & Proximities</label>
                <div className="space-y-1.5">
                  {(
                    [
                      'Clear Open Area',
                      'Under Overhead Cables',
                      'Near Building (<3m)',
                      'Near Pavement / Curb',
                      'Near Underground Pipes',
                    ] as InfrastructureProximity[]
                  ).map((item) => {
                    const active = form.infrastructure.includes(item);
                    return (
                      <div
                        key={item}
                        onClick={() => handleSelectInfrastructure(item)}
                        className={`p-2 rounded-lg border cursor-pointer text-[11px] flex items-center justify-between transition-all ${
                          active
                            ? 'bg-forest-50 border-forest-400 text-forest-900 font-medium'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span>{item}</span>
                        <input
                          type="checkbox"
                          checked={active}
                          onChange={() => {}}
                          className="rounded text-forest-700 focus:ring-forest-500"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <Button type="submit" variant="primary" size="sm" className="w-full" icon={<Sparkles className="w-3.5 h-3.5" />}>
                  Calculate Suitability
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Right 2 Columns: Live Interactive Leaflet Map + Assessment Results */}
        <div className="lg:col-span-2 space-y-5">
          {/* Real Leaflet Map */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Map className="w-4 h-4 text-forest-700" />
                Select Planting Site on Map (OpenStreetMap)
              </span>
              <span className="text-[11px] text-slate-500">
                {savedSites.length} Saved Sites on Map · Click pin to load details
              </span>
            </div>

            <InteractiveMap
              center={
                form.latitude && form.longitude
                  ? [form.latitude, form.longitude]
                  : [44.9778, -93.2650]
              }
              zoom={13}
              height="340px"
              selectedLocation={
                form.latitude && form.longitude
                  ? { lat: form.latitude, lng: form.longitude }
                  : null
              }
              onLocationSelect={handleMapLocationSelect}
              markers={mapMarkers}
              onMarkerClick={(m) => {
                if (m.data) loadSavedSite(m.data);
              }}
              enableSearch={true}
              enableClickToPick={true}
              searchPlaceholder="Search address or landmark to place marker..."
            />
          </div>

          {/* Main Results Card */}
          <Card className="border-2 border-forest-100 overflow-hidden">
            <CardHeader className="bg-forest-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge
                    variant={
                      result.rating === 'Optimal'
                        ? 'emerald'
                        : result.rating === 'Favorable'
                        ? 'forest'
                        : result.rating === 'Challenging'
                        ? 'amber'
                        : 'rose'
                    }
                    size="sm"
                  >
                    {result.rating.toUpperCase()} SUITABILITY
                  </Badge>
                  <span className="text-xs text-slate-500 font-mono">
                    Score: {result.suitabilityScore}/100
                  </span>
                </div>
                <CardTitle>{form.site_name}</CardTitle>
                <CardDescription>
                  {form.location_name}
                  {form.latitude && form.longitude ? (
                    <span className="font-mono text-[11px] text-forest-700 ml-1">
                      ({form.latitude.toFixed(4)}°, {form.longitude.toFixed(4)}°)
                    </span>
                  ) : null}{' '}
                  · {result.usableAreaSqm} m² footprint
                </CardDescription>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  isLoading={isSaving}
                  onClick={handleSave}
                  icon={<Save className="w-3.5 h-3.5" />}
                  className="text-xs"
                >
                  Save Assessment
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-5 space-y-4 text-xs">
              {saveFeedback && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{saveFeedback}</span>
                </div>
              )}

              {/* Progress Bar of Suitability */}
              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>Site Suitability Index</span>
                  <span className="font-mono text-forest-800">{result.suitabilityScore}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      result.suitabilityScore >= 80
                        ? 'bg-emerald-600'
                        : result.suitabilityScore >= 60
                        ? 'bg-forest-600'
                        : result.suitabilityScore >= 45
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${result.suitabilityScore}%` }}
                  />
                </div>
              </div>

              {/* Recommended Habit */}
              <div className="p-3 bg-forest-900 text-white rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-lime-400 font-mono uppercase tracking-wider">
                    Recommended Planting Habit
                  </span>
                  <div className="text-sm font-bold mt-0.5">{result.recommendedHabit}</div>
                </div>
                <Badge variant="lime" size="sm">Tailored Archetype</Badge>
              </div>

              {/* Strengths & Concerns Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
                  <div className="font-bold text-emerald-900 flex items-center gap-1.5 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    Identified Strengths ({result.strengths.length})
                  </div>
                  <ul className="space-y-1.5">
                    {result.strengths.map((str, idx) => (
                      <li key={idx} className="text-slate-700 text-[11px] flex items-start gap-1.5">
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
                  <div className="font-bold text-amber-900 flex items-center gap-1.5 text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    Site Constraints & Risks ({result.concerns.length})
                  </div>
                  {result.concerns.length === 0 ? (
                    <div className="text-slate-500 text-[11px] italic">No major site constraints detected.</div>
                  ) : (
                    <ul className="space-y-1.5">
                      {result.concerns.map((con, idx) => (
                        <li key={idx} className="text-slate-700 text-[11px] flex items-start gap-1.5">
                          <span className="text-amber-600 font-bold">•</span>
                          <span>{con}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Actionable Recommendations */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                  <Sparkles className="w-4 h-4 text-forest-700 shrink-0" />
                  Prescribed Preparation & Mitigation Steps:
                </div>
                <div className="space-y-1.5">
                  {result.recommendations.map((rec, idx) => (
                    <div key={idx} className="text-slate-700 text-[11px] flex items-start gap-2 bg-white p-2 rounded-lg border border-slate-100">
                      <span className="w-4 h-4 rounded-full bg-forest-100 text-forest-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Saved Sites History */}
          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center justify-between">
              <span>Saved Site Evaluations with Coordinates ({savedSites.length})</span>
            </div>

            {loadingSaved ? (
              <div className="flex items-center gap-2 text-xs text-slate-400 py-3">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading saved evaluations...
              </div>
            ) : savedSites.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-white rounded-xl border border-sage-200">
                No saved sites yet. Assess a plot above and click "Save Assessment".
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {savedSites.map((site) => (
                  <div
                    key={site.id}
                    onClick={() => loadSavedSite(site)}
                    className="p-3.5 bg-white border border-sage-200 hover:border-forest-400 rounded-xl cursor-pointer transition-all hover:shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900 text-xs truncate max-w-[180px]">
                          {site.site_name}
                        </span>
                        <Badge
                          variant={
                            site.suitability_score >= 80 ? 'emerald' : site.suitability_score >= 60 ? 'forest' : 'amber'
                          }
                          size="sm"
                        >
                          {site.suitability_score}%
                        </Badge>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 truncate">
                        {site.location_name} · {site.space_sqm} m²
                      </div>
                      {site.latitude && site.longitude && (
                        <div className="text-[10px] font-mono text-forest-700 mt-0.5">
                          GPS: {site.latitude.toFixed(4)}°, {site.longitude.toFixed(4)}°
                        </div>
                      )}
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                      <span>{site.sunlight} · {site.soil_type}</span>
                      <span className="text-forest-700 font-medium">Click to Load & View on Map</span>
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
