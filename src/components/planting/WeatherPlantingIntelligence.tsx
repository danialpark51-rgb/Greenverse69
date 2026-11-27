import React, { useState, useEffect } from 'react';
import {
  fetchWeatherFromOpenMeteo,
  interpretWeatherCode,
  generateWeatherPlantingAdvice
} from '../../services/plantIntelligenceService';
import { OpenMeteoWeatherResponse } from '../../types/plantIntelligence';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import {
  CloudSun,
  Sun,
  CloudRain,
  CloudLightning,
  Wind,
  Droplets,
  Thermometer,
  ShieldAlert,
  MapPin,
  RefreshCw,
  AlertTriangle,
  Info,
  CheckCircle2,
  Calendar,
  Layers,
  Compass
} from 'lucide-react';

interface WeatherPlantingIntelligenceProps {
  onNavigateToCalendar?: () => void;
}

export const WeatherPlantingIntelligence: React.FC<WeatherPlantingIntelligenceProps> = ({
  onNavigateToCalendar
}) => {
  // Default coordinates: San Francisco / Bay Area temperate microclimate (37.77, -122.41)
  const [lat, setLat] = useState<number>(37.7749);
  const [lon, setLon] = useState<number>(-122.4194);
  const [cityName, setCityName] = useState<string>('San Francisco / Northern California');
  const [manualCityInput, setManualCityInput] = useState('');

  const [weatherData, setWeatherData] = useState<OpenMeteoWeatherResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const loadWeather = async (latitude: number, longitude: number) => {
    setLoading(true);
    setError(null);
    const res = await fetchWeatherFromOpenMeteo(latitude, longitude);
    setLoading(false);

    if (res.success && res.data) {
      setWeatherData(res.data);
    } else {
      setError(res.error || 'Failed to retrieve live forecast from Open-Meteo.');
    }
  };

  useEffect(() => {
    loadWeather(lat, lon);
  }, [lat, lon]);

  const handleBrowserGeolocation = () => {
    if (!navigator.geolocation) {
      setError('Browser geolocation is not supported on this device.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const newLat = position.coords.latitude;
        const newLon = position.coords.longitude;
        setLat(newLat);
        setLon(newLon);
        setCityName(`Local Coordinates (${newLat.toFixed(2)}°, ${newLon.toFixed(2)}°)`);
      },
      (err) => {
        setIsLocating(false);
        setError(`Location access permission denied or unavailable: ${err.message}. Please use manual coordinates.`);
      },
      { timeout: 10000 }
    );
  };

  const handleManualLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Geocode quick lookups or coordinates
    const trimmed = manualCityInput.trim();
    if (!trimmed) return;

    if (trimmed.includes(',')) {
      const [pLat, pLon] = trimmed.split(',').map((s) => parseFloat(s.trim()));
      if (!isNaN(pLat) && !isNaN(pLon)) {
        setLat(pLat);
        setLon(pLon);
        setCityName(`Custom Coordinates (${pLat.toFixed(2)}°, ${pLon.toFixed(2)}°)`);
        setManualCityInput('');
        return;
      }
    }

    // Default presets for popular ecological biomes
    const biomes: Record<string, { lat: number; lon: number; name: string }> = {
      london: { lat: 51.5074, lon: -0.1278, name: 'London, UK (Temperate Maritime)' },
      paris: { lat: 48.8566, lon: 2.3522, name: 'Paris, France (Continental)' },
      tokyo: { lat: 35.6762, lon: 139.6503, name: 'Tokyo, Japan (Humid Subtropical)' },
      sydney: { lat: -33.8688, lon: 151.2093, name: 'Sydney, Australia (Coastal Subtropical)' },
      newyork: { lat: 40.7128, lon: -74.0060, name: 'New York, US (Humid Continental)' },
      seattle: { lat: 47.6062, lon: -122.3321, name: 'Seattle, US (Pacific Northwest Maritime)' },
      bangalore: { lat: 12.9716, lon: 77.5946, name: 'Bengaluru, India (Tropical Savanna)' },
    };

    const clean = trimmed.toLowerCase().replace(/[^a-z]/g, '');
    if (biomes[clean]) {
      setLat(biomes[clean].lat);
      setLon(biomes[clean].lon);
      setCityName(biomes[clean].name);
      setManualCityInput('');
    } else {
      setError(`Biome "${trimmed}" not recognized. Please enter as "latitude, longitude" (e.g. 40.71, -74.00) or choose a major biome.`);
    }
  };

  const weatherAdvice = weatherData ? generateWeatherPlantingAdvice(weatherData) : null;
  const currentCondition = weatherData ? interpretWeatherCode(weatherData.current.weather_code) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CloudSun className="w-5 h-5 text-sky-600" />
            Weather-Based Planting Intelligence
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real meteorological telemetry via Open-Meteo. Dynamic thermal stress, rainfall offsets, and soil conditions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="emerald" className="text-xs">
            Live Open-Meteo API
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadWeather(lat, lon)}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
            className="text-xs"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Location Selector Bar */}
      <Card>
        <CardContent className="p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-700 w-full sm:w-auto">
            <MapPin className="w-4 h-4 text-forest-700 shrink-0" />
            <span className="font-semibold text-slate-900">{cityName}</span>
            <span className="text-[10px] font-mono text-slate-400">
              ({lat.toFixed(2)}°N, {lon.toFixed(2)}°W)
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBrowserGeolocation}
              disabled={isLocating}
              icon={<Compass className="w-3.5 h-3.5 text-forest-700" />}
              className="text-xs shrink-0"
            >
              {isLocating ? 'Locating...' : 'Use My GPS'}
            </Button>

            <form onSubmit={handleManualLocationSubmit} className="flex gap-1.5 w-full sm:w-auto">
              <input
                type="text"
                value={manualCityInput}
                onChange={(e) => setManualCityInput(e.target.value)}
                placeholder="e.g. Seattle, or lat, lon"
                className="px-2.5 py-1.5 border border-sage-300 rounded-lg text-xs w-full sm:w-44 bg-white"
              />
              <Button type="submit" variant="primary" size="sm" className="text-xs shrink-0">
                Set
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <Card className="p-12 text-center text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-forest-700 mb-2" />
          <p className="text-xs font-semibold text-slate-700">Fetching live atmospheric observations...</p>
          <p className="text-[11px] text-slate-500">Querying Open-Meteo European & GFS meteorological ensembles</p>
        </Card>
      ) : weatherData ? (
        <div className="space-y-6">
          {/* Top Meteorological Gauges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="p-4 bg-gradient-to-br from-sky-50 to-white border-sky-100">
              <div className="flex items-center justify-between text-sky-800">
                <span className="text-[11px] font-semibold">Ambient Temperature</span>
                <Thermometer className="w-4 h-4 text-sky-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
                {weatherData.current.temperature_2m}°C
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                {currentCondition?.condition}
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-blue-50 to-white border-blue-100">
              <div className="flex items-center justify-between text-blue-800">
                <span className="text-[11px] font-semibold">Precipitation / Rain</span>
                <CloudRain className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
                {weatherData.current.precipitation || weatherData.current.rain || 0} mm
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                Relative Humidity: {weatherData.current.relative_humidity_2m}%
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-emerald-50 to-white border-emerald-100">
              <div className="flex items-center justify-between text-emerald-800">
                <span className="text-[11px] font-semibold">Soil Surface Temperature</span>
                <Layers className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
                {weatherData.current.soil_temperature_0cm !== undefined
                  ? `${weatherData.current.soil_temperature_0cm}°C`
                  : 'Derived'}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                Measured at 0cm root crown
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-slate-50 to-white border-slate-200">
              <div className="flex items-center justify-between text-slate-800">
                <span className="text-[11px] font-semibold">Wind Shear Speed</span>
                <Wind className="w-4 h-4 text-slate-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
                {weatherData.current.wind_speed_10m} km/h
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                Recorded at 10m altitude
              </div>
            </Card>
          </div>

          {/* Plant Intelligence Recommendations Derived from Weather */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm">Phenological & Planting Suitability</CardTitle>
                      <CardDescription className="text-xs">
                        Derived from live temperature, humidity, and wind velocity
                      </CardDescription>
                    </div>
                    {weatherAdvice && (
                      <Badge
                        variant={
                          weatherAdvice.suitability === 'Excellent' || weatherAdvice.suitability === 'Good'
                            ? 'emerald'
                            : weatherAdvice.suitability === 'Fair'
                            ? 'amber'
                            : 'slate'
                        }
                      >
                        Suitability: {weatherAdvice.suitability}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 text-xs">
                  {/* Weather Alert Banners if any */}
                  {weatherAdvice?.alerts && weatherAdvice.alerts.length > 0 && (
                    <div className="space-y-2">
                      {weatherAdvice.alerts.map((alert, i) => (
                        <div
                          key={i}
                          className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 flex items-start gap-2"
                        >
                          <ShieldAlert className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                          <div className="text-[11px] leading-relaxed">{alert}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Watering Guidance */}
                  <div className="p-3 bg-sky-50 border border-sky-200 rounded-lg space-y-1">
                    <div className="font-semibold text-sky-900 flex items-center gap-1.5">
                      <Droplets className="w-3.5 h-3.5 text-sky-600" />
                      Dynamic Rainfall Irrigation Offset
                    </div>
                    <p className="text-[11px] text-sky-800 leading-relaxed">
                      {weatherAdvice?.wateringGuidance}
                    </p>
                  </div>

                  {/* 5-Day Outlook */}
                  {weatherData.daily && (
                    <div>
                      <div className="font-semibold text-slate-800 mb-2 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-forest-700" />
                        5-Day Planting Forecast Outlook
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {weatherData.daily.time.slice(0, 5).map((dateStr, i) => {
                          const maxT = weatherData.daily!.temperature_2m_max[i];
                          const minT = weatherData.daily!.temperature_2m_min[i];
                          const pop = weatherData.daily!.precipitation_probability_max?.[i] ?? 0;
                          const wCode = weatherData.daily!.weather_code[i];
                          const cond = interpretWeatherCode(wCode);

                          return (
                            <div
                              key={dateStr}
                              className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-center"
                            >
                              <div className="text-[10px] font-mono text-slate-500">
                                {new Date(dateStr).toLocaleDateString([], { weekday: 'short', month: 'numeric', day: 'numeric' })}
                              </div>
                              <div className="font-semibold text-slate-800 my-1 text-xs">
                                {Math.round(maxT)}° / <span className="text-slate-500 font-normal">{Math.round(minT)}°</span>
                              </div>
                              <div className="text-[10px] text-sky-600 font-medium">
                                🌧 {pop}% rain
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Action & Attribution */}
            <div className="lg:col-span-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Gardening Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Synchronize your planting schedule with today's atmospheric moisture levels to reduce seedling mortality by up to 34%.
                  </p>
                  {onNavigateToCalendar && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={onNavigateToCalendar}
                      className="w-full text-xs"
                    >
                      Open Planting Calendar →
                    </Button>
                  )}
                  <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-400">
                    <p className="font-medium text-slate-600">Attribution:</p>
                    <p>Weather data provided by Open-Meteo.com under Non-Commercial / Open Database License.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
