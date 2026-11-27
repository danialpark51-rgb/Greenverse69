import React, { useState, useEffect } from 'react';
import { PlantSpecies, DbWateringLog, WeatherDataState } from '../../types/planting';
import {
  calculateWateringRecommendation,
  getClimateIntelligence,
  fetchLiveWeather,
  logWateringEvent,
  fetchWateringLogs
} from '../../services/plantingIntelligenceService';
import { SPECIES_CATALOG } from '../../data/speciesCatalog';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import {
  Droplets,
  CloudRain,
  Calendar,
  CheckCircle2,
  Info,
  Clock,
  Plus,
  TreeDeciduous,
  AlertTriangle
} from 'lucide-react';

export const WateringIntelligenceTracker: React.FC = () => {
  const { user } = useAuth();
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string>(SPECIES_CATALOG[0].id);
  const [wateringLogs, setWateringLogs] = useState<DbWateringLog[]>([]);
  const [logAmountLiters, setLogAmountLiters] = useState<number>(20);
  const [logMethod, setLogMethod] = useState<'Hose' | 'Drip Line' | 'Bucket' | 'Rainfall'>('Hose');
  const [isLogging, setIsLogging] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [weather, setWeather] = useState<WeatherDataState>(getClimateIntelligence());

  // Attempt to load live weather from Open-Meteo using browser geolocation
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const liveWeather = await fetchLiveWeather(pos.coords.latitude, pos.coords.longitude);
        setWeather(liveWeather);
      },
      () => {
        // Permission denied or error — keep baseline state, no fabrication
        setWeather(getClimateIntelligence());
      },
      { timeout: 8000 }
    );
  }, []);
  const species = SPECIES_CATALOG.find((s) => s.id === selectedSpeciesId) || SPECIES_CATALOG[0];
  const recommendation = calculateWateringRecommendation(species, weather);

  useEffect(() => {
    fetchWateringLogs(user?.id).then(setWateringLogs);
  }, [user]);

  const handleRecordWatering = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLogging(true);
    setFeedback(null);

    const res = await logWateringEvent({
      user_id: user?.id || null,
      species_id: species.id,
      species_name: species.commonName,
      watered_date: new Date().toISOString().split('T')[0],
      amount_liters: Number(logAmountLiters),
      method: logMethod,
      notes: `Targeted hydration for ${species.commonName}`
    });

    setIsLogging(false);
    setWateringLogs((prev) => [res.data, ...prev]);
    setFeedback(`Recorded ${logAmountLiters}L watering event for ${species.commonName}!`);
    setTimeout(() => setFeedback(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Droplets className="w-5 h-5 text-sky-600" />
            Watering Intelligence & Moisture Tracker
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Species-specific irrigation benchmarks with weather-informed natural rainfall balancing.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={recommendation.isWeatherInformed ? 'emerald' : 'slate'}>
            {recommendation.guidanceType}
          </Badge>
        </div>
      </div>

      {/* Weather Integration Notice */}
      <div className="bg-sky-50/70 border border-sky-200 rounded-xl p-3.5 flex items-start gap-3 text-xs text-sky-900">
        <Info className="w-4 h-4 text-sky-600 mt-0.5 shrink-0" />
        <div>
          <span className="font-semibold">Weather-Informed Transparency: </span>
          {weather.dataSourceNotice} {recommendation.isWeatherInformed ? 'Live rainfall deductions have been applied.' : 'Showing standard botanical baseline requirement without active precipitation offsets.'}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommendation Engine */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-base text-slate-900">
                    Hydration Guidance: {species.commonName}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Botanical moisture regime and evapotranspiration demands
                  </CardDescription>
                </div>
                {/* Species Picker */}
                <select
                  value={selectedSpeciesId}
                  onChange={(e) => setSelectedSpeciesId(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-800"
                >
                  {SPECIES_CATALOG.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.commonName} ({s.waterNeed} Need)
                    </option>
                  ))}
                </select>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-1">
              {/* Metric Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <div className="text-[11px] font-medium text-slate-500 uppercase">Base Requirement</div>
                  <div className="text-xl font-bold text-slate-900 mt-0.5">
                    {recommendation.baseWeeklyLiters} <span className="text-xs font-normal text-slate-500">L / week</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Per mature root caliper</div>
                </div>

                <div className="bg-sky-50 border border-sky-200 rounded-xl p-3">
                  <div className="text-[11px] font-medium text-sky-800 uppercase">Recommended Delivery</div>
                  <div className="text-xl font-bold text-sky-950 mt-0.5">
                    {recommendation.adjustedWeeklyLiters} <span className="text-xs font-normal text-sky-700">L / week</span>
                  </div>
                  <div className="text-[10px] text-sky-600 mt-0.5">Adjusted for current season</div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <div className="text-[11px] font-medium text-slate-500 uppercase">Frequency Cycle</div>
                  <div className="text-sm font-bold text-slate-900 mt-1">
                    {recommendation.wateringFrequency}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Deep soak cadence</div>
                </div>
              </div>

              {/* Specific Guidance Notes */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Irrigation Science & Agronomic Rationale
                </h4>
                {recommendation.notes.map((note, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-700 flex items-start gap-2"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                    <span>{note}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Watering History Log */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Watering Activity History</CardTitle>
              <CardDescription className="text-xs">
                Audited irrigation events logged for your restoration plots
              </CardDescription>
            </CardHeader>
            <CardContent>
              {wateringLogs.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  No watering events recorded yet. Log your first irrigation session below.
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {wateringLogs.slice(0, 6).map((log) => (
                    <div
                      key={log.id}
                      className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Droplets className="w-3.5 h-3.5 text-sky-600" />
                        <span className="font-semibold text-slate-800">{log.species_name}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-500">{log.method}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-sky-800">{log.amount_liters} Liters</span>
                        <span className="text-slate-400">{log.watered_date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Log Form */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm">Log Watering Session</CardTitle>
            <CardDescription className="text-xs">
              Record moisture applied to keep track of establishment needs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRecordWatering} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Tree / Species
                </label>
                <div className="text-xs font-medium text-slate-900 bg-slate-100 p-2 rounded-lg border border-slate-200">
                  {species.commonName} ({species.scientificName})
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Amount Delivered (Liters)
                </label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={logAmountLiters}
                  onChange={(e) => setLogAmountLiters(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Delivery Method
                </label>
                <select
                  value={logMethod}
                  onChange={(e) => setLogMethod(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-900"
                >
                  <option value="Hose">Manual Garden Hose</option>
                  <option value="Drip Line">Automated Drip / Trickle Line</option>
                  <option value="Bucket">Slow-Release Tree Water Bag / Bucket</option>
                  <option value="Rainfall">Natural Significant Downpour</option>
                </select>
              </div>

              {feedback && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-2.5 rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{feedback}</span>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                className="w-full text-xs"
                disabled={isLogging}
              >
                {isLogging ? 'Recording...' : 'Save Watering Log'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
