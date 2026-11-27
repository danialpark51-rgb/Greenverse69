import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  generatePlantCarePlanWithAI,
  savePlantCarePlan,
  saveUserPlant
} from '../../services/plantIntelligenceService';
import { PlantCarePlanResult, DbUserPlant } from '../../types/plantIntelligence';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import {
  Bot,
  Sun,
  Droplets,
  Layers,
  Thermometer,
  Calendar,
  Save,
  CheckCircle2,
  AlertTriangle,
  BookmarkPlus,
  Loader2,
  Clock,
  Sparkles,
  Info
} from 'lucide-react';

interface SmartPlantCareAdvisorProps {
  initialPlantName?: string;
  initialScientificName?: string;
  userPlants?: DbUserPlant[];
  onPlanSaved?: () => void;
}

export const SmartPlantCareAdvisor: React.FC<SmartPlantCareAdvisorProps> = ({
  initialPlantName = '',
  initialScientificName = '',
  userPlants = [],
  onPlanSaved
}) => {
  const { user } = useAuth();

  const [plantName, setPlantName] = useState(initialPlantName);
  const [scientificName, setScientificName] = useState(initialScientificName);
  const [location, setLocation] = useState('Temperate Zone 6b');
  const [indoorOutdoor, setIndoorOutdoor] = useState<'Indoor' | 'Outdoor' | 'Balcony' | 'Greenhouse'>('Outdoor');
  const [userNotes, setUserNotes] = useState('');

  const [generating, setGenerating] = useState(false);
  const [planResult, setPlanResult] = useState<PlantCarePlanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSelectFromSaved = (p: DbUserPlant) => {
    setPlantName(p.common_name);
    setScientificName(p.scientific_name || '');
    if (p.location_type === 'Indoor' || p.location_type === 'Outdoor' || p.location_type === 'Balcony' || p.location_type === 'Greenhouse') {
      setIndoorOutdoor(p.location_type);
    }
  };

  const handleGenerateCarePlan = async () => {
    if (!plantName.trim()) {
      setError('Please provide a plant name.');
      return;
    }

    setGenerating(true);
    setError(null);
    setPlanResult(null);
    setSavedSuccess(false);

    const response = await generatePlantCarePlanWithAI({
      plantName: plantName.trim(),
      scientificName: scientificName.trim() || undefined,
      location: location.trim(),
      indoorOutdoor,
      userNotes: userNotes.trim() || undefined,
    });

    setGenerating(false);

    if (response.success && response.data) {
      setPlanResult(response.data);
    } else {
      setError(response.error || 'Failed to generate care plan. Please verify plant name.');
    }
  };

  const handleSaveCarePlan = async () => {
    if (!planResult || !user?.id) return;
    setIsSaving(true);

    const res = await savePlantCarePlan({
      user_id: user.id,
      plant_name: planResult.plantName,
      scientific_name: scientificName || null,
      watering_schedule: planResult.watering,
      sunlight_guidance: planResult.sunlight,
      soil_fertilizer_guidance: planResult.soil,
      seasonal_tasks: planResult.seasonalCalendar,
      care_summary: planResult.careSummary,
      full_plan_json: planResult,
    });

    setIsSaving(false);
    if (res.success) {
      setSavedSuccess(true);
      if (onPlanSaved) onPlanSaved();
      setTimeout(() => setSavedSuccess(false), 4000);
    } else {
      setError(res.error || 'Failed to persist care plan.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Bot className="w-5 h-5 text-forest-700" />
            Smart Plant Care Advisor
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Personalized horticultural regimes: irrigation schedules, solar requirements, soil fertility, and seasonal management.
          </p>
        </div>
        <Badge variant="emerald" className="text-xs" dot>
          Agronomic Intelligence
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Inputs & Context */}
        <div className="lg:col-span-5 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Plant Profile & Location</CardTitle>
              <CardDescription className="text-xs">
                Configure species and environmental parameters for custom guidance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3.5 text-xs">
              {/* Quick Select from Saved Plants if available */}
              {userPlants.length > 0 && (
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Select from My Plants</label>
                  <select
                    onChange={(e) => {
                      const selected = userPlants.find((p) => p.id === e.target.value);
                      if (selected) handleSelectFromSaved(selected);
                    }}
                    className="w-full px-3 py-2 border border-sage-300 rounded-lg text-slate-800 bg-white"
                  >
                    <option value="">-- Choose a saved plant --</option>
                    {userPlants.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.common_name} {p.scientific_name ? `(${p.scientific_name})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-medium text-slate-700 mb-1">Common Plant Name *</label>
                <input
                  type="text"
                  value={plantName}
                  onChange={(e) => setPlantName(e.target.value)}
                  placeholder="e.g. Japanese Maple, Rosemary, Fiddle Leaf Fig"
                  className="w-full px-3 py-2 border border-sage-300 rounded-lg text-slate-800 bg-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Scientific / Botanical Name (Optional)</label>
                <input
                  type="text"
                  value={scientificName}
                  onChange={(e) => setScientificName(e.target.value)}
                  placeholder="e.g. Acer palmatum"
                  className="w-full px-3 py-2 border border-sage-300 rounded-lg text-slate-800 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Environment</label>
                  <select
                    value={indoorOutdoor}
                    onChange={(e: any) => setIndoorOutdoor(e.target.value)}
                    className="w-full px-3 py-2 border border-sage-300 rounded-lg text-slate-800 bg-white"
                  >
                    <option value="Outdoor">Outdoor Garden</option>
                    <option value="Indoor">Indoor Home/Office</option>
                    <option value="Balcony">Balcony Container</option>
                    <option value="Greenhouse">Greenhouse</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Climate / Region</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Zone 6b, Mediterranean"
                    className="w-full px-3 py-2 border border-sage-300 rounded-lg text-slate-800 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Special Plant Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={userNotes}
                  onChange={(e) => setUserNotes(e.target.value)}
                  placeholder="e.g. Recently transplanted, clay-heavy topsoil, exposed to morning sun only..."
                  className="w-full px-3 py-2 border border-sage-300 rounded-lg text-slate-800 bg-white"
                />
              </div>

              <Button
                type="button"
                variant="primary"
                size="sm"
                disabled={generating || !plantName.trim()}
                onClick={handleGenerateCarePlan}
                icon={generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                className="w-full text-xs"
              >
                {generating ? 'Formulating Care Plan with AI...' : 'Generate Personalized Care Plan'}
              </Button>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                  <div>{error}</div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Care Plan Dashboard */}
        <div className="lg:col-span-7">
          {generating ? (
            <Card className="h-full flex items-center justify-center p-12 text-center">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-full bg-forest-100 text-forest-700 mx-auto flex items-center justify-center animate-pulse">
                  <Bot className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-slate-800">Synthesizing Care Schedule</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Calculating transpiration rates, photoperiod requirements, and seasonal phenology for {plantName}...
                </p>
              </div>
            </Card>
          ) : planResult ? (
            <div className="space-y-4">
              <Card>
                <CardHeader className="border-b border-sage-100 pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-forest-600 font-semibold">
                        Personalized Care Regimen
                      </span>
                      <CardTitle className="text-lg text-slate-900 mt-0.5">{planResult.plantName}</CardTitle>
                      <p className="text-xs text-slate-500">{planResult.careSummary}</p>
                    </div>
                    {savedSuccess ? (
                      <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Plan Saved!
                      </span>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSaveCarePlan}
                        disabled={isSaving || !user}
                        icon={<Save className="w-3.5 h-3.5" />}
                        className="text-xs"
                      >
                        {isSaving ? 'Saving...' : user ? 'Save Care Plan' : 'Log in to Save'}
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 text-xs pt-4">
                  {/* Grid of Core Pillars */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Watering */}
                    <div className="p-3 bg-sky-50/60 border border-sky-200 rounded-xl space-y-1">
                      <div className="flex items-center gap-1.5 text-sky-800 font-semibold">
                        <Droplets className="w-4 h-4 text-sky-600" />
                        Irrigation Protocol
                      </div>
                      <div className="text-[11px] font-medium text-slate-800">
                        {planResult.watering?.frequency}
                      </div>
                      <p className="text-[10px] text-slate-600 leading-relaxed">
                        {planResult.watering?.guidance}
                      </p>
                      {planResult.watering?.weatherAdjustment && (
                        <div className="text-[10px] text-sky-700 font-medium pt-1">
                          🌦 {planResult.watering.weatherAdjustment}
                        </div>
                      )}
                    </div>

                    {/* Sunlight */}
                    <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl space-y-1">
                      <div className="flex items-center gap-1.5 text-amber-800 font-semibold">
                        <Sun className="w-4 h-4 text-amber-600" />
                        Photoperiod & Solar
                      </div>
                      <div className="text-[11px] font-medium text-slate-800">
                        {planResult.sunlight?.requirement} ({planResult.sunlight?.hoursPerDay})
                      </div>
                      <p className="text-[10px] text-slate-600 leading-relaxed">
                        {planResult.sunlight?.guidance}
                      </p>
                    </div>

                    {/* Soil & Nutrition */}
                    <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-1">
                      <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                        <Layers className="w-4 h-4 text-emerald-600" />
                        Substrate & Fertility
                      </div>
                      <div className="text-[11px] font-medium text-slate-800">
                        {planResult.soil?.type} (pH {planResult.soil?.phRange})
                      </div>
                      <p className="text-[10px] text-slate-600 leading-relaxed">
                        Fertilizer: {planResult.soil?.fertilizer}
                      </p>
                    </div>

                    {/* Temperature & Humidity */}
                    <div className="p-3 bg-indigo-50/60 border border-indigo-200 rounded-xl space-y-1">
                      <div className="flex items-center gap-1.5 text-indigo-800 font-semibold">
                        <Thermometer className="w-4 h-4 text-indigo-600" />
                        Thermal Tolerance
                      </div>
                      <div className="text-[11px] font-medium text-slate-800">
                        {planResult.temperatureAndHumidity?.idealTempRange}
                      </div>
                      <p className="text-[10px] text-slate-600 leading-relaxed">
                        {planResult.temperatureAndHumidity?.frostTolerance}
                      </p>
                    </div>
                  </div>

                  {/* Seasonal Tasks */}
                  {planResult.seasonalCalendar && (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                      <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-forest-700" />
                        Seasonal Management Calendar
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        <div className="p-2 bg-white rounded border border-slate-100">
                          <span className="font-semibold text-emerald-700">🌱 Spring: </span>
                          {planResult.seasonalCalendar.spring}
                        </div>
                        <div className="p-2 bg-white rounded border border-slate-100">
                          <span className="font-semibold text-amber-700">☀️ Summer: </span>
                          {planResult.seasonalCalendar.summer}
                        </div>
                        <div className="p-2 bg-white rounded border border-slate-100">
                          <span className="font-semibold text-orange-700">🍂 Autumn: </span>
                          {planResult.seasonalCalendar.autumn}
                        </div>
                        <div className="p-2 bg-white rounded border border-slate-100">
                          <span className="font-semibold text-blue-700">❄️ Winter: </span>
                          {planResult.seasonalCalendar.winter}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Common Pitfalls & Cautions */}
                  {planResult.commonMistakes?.length > 0 && (
                    <div>
                      <div className="font-semibold text-slate-800 mb-1">Common Pitfalls to Avoid</div>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-600 text-[11px]">
                        {planResult.commonMistakes.map((m, i) => (
                          <li key={i}>{m}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="h-full flex items-center justify-center p-12 text-center text-slate-400">
              <div className="space-y-2">
                <Bot className="w-10 h-10 mx-auto text-slate-300" />
                <h4 className="text-sm font-semibold text-slate-600">No Care Plan Generated</h4>
                <p className="text-xs max-w-xs mx-auto">
                  Enter a plant name on the left or pick from your saved collection to generate custom care, hydration schedules, and seasonal tasks.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
