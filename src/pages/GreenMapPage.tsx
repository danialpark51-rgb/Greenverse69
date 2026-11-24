import React, { useState } from 'react';
import { MOCK_SITES } from '../data/mockData';
import { PlantingSite } from '../types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { SearchInput } from '../components/common/SearchInput';
import {
  MapPin,
  Layers,
  Trees,
  Droplets,
  Thermometer,
  Compass,
  Filter,
  CheckCircle2,
  ExternalLink,
  Satellite,
  Eye,
  SlidersHorizontal
} from 'lucide-react';

export const GreenMapPage: React.FC = () => {
  const [selectedSite, setSelectedSite] = useState<PlantingSite>(MOCK_SITES[0]);
  const [activeLayer, setActiveLayer] = useState<'canopy' | 'moisture' | 'carbon'>('canopy');
  const [biomeFilter, setBiomeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSites = MOCK_SITES.filter((site) => {
    const matchesBiome = biomeFilter === 'all' || site.biome === biomeFilter;
    const matchesSearch = site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          site.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesBiome && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <MapPin className="w-6 h-6 text-forest-700" />
            Global Green Map & Biome Monitor
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Geospatial tree density, IoT sensor feeds, and verified ecological restoration zones.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="emerald" dot>Live Satellite Pass: Sentinel-2</Badge>
          <Badge variant="forest">Demo Geospatial Telemetry</Badge>
        </div>
      </div>

      {/* Main Map Viewport & Sidebar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Map Canvas */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="overflow-hidden">
            {/* Map Controls Top Bar */}
            <div className="p-3 bg-white border-b border-sage-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-forest-600" /> Layer:
                </span>
                <div className="flex rounded-lg bg-sage-100 p-0.5 text-xs">
                  <button
                    onClick={() => setActiveLayer('canopy')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                      activeLayer === 'canopy'
                        ? 'bg-forest-rich text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Canopy Vigor
                  </button>
                  <button
                    onClick={() => setActiveLayer('moisture')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                      activeLayer === 'moisture'
                        ? 'bg-forest-rich text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Soil Moisture
                  </button>
                  <button
                    onClick={() => setActiveLayer('carbon')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                      activeLayer === 'carbon'
                        ? 'bg-forest-rich text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Carbon Density
                  </button>
                </div>
              </div>

              {/* Biome Filter Badges */}
              <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                {['all', 'urban', 'mangrove', 'riparian', 'agroforestry'].map((b) => (
                  <button
                    key={b}
                    onClick={() => setBiomeFilter(b)}
                    className={`text-[11px] px-2 py-0.5 rounded-full capitalize font-medium border ${
                      biomeFilter === b
                        ? 'bg-forest-100 text-forest-900 border-forest-300'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Simulated Interactive SVG Geospatial Map */}
            <div className="relative h-96 sm:h-[450px] bg-[#d9e5d6] overflow-hidden select-none">
              {/* Topographic Background Pattern */}
              <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#236145" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
                {/* Curved elevation contour lines */}
                <path d="M0,150 Q200,90 400,180 T800,120" fill="none" stroke="#236145" strokeWidth="2" />
                <path d="M0,280 Q300,220 600,310 T1000,250" fill="none" stroke="#236145" strokeWidth="2" />
              </svg>

              {/* Layer Gradient Overlay */}
              {activeLayer === 'moisture' && (
                <div className="absolute inset-0 bg-blue-500/10 pointer-events-none transition-opacity" />
              )}
              {activeLayer === 'carbon' && (
                <div className="absolute inset-0 bg-emerald-600/15 pointer-events-none transition-opacity" />
              )}

              {/* Geo Pins on Map */}
              <div className="absolute inset-0 flex items-center justify-around p-8">
                {filteredSites.map((site, index) => {
                  const isSelected = selectedSite.id === site.id;
                  return (
                    <div
                      key={site.id}
                      onClick={() => setSelectedSite(site)}
                      style={{
                        transform: `translateY(${(index % 2 === 0 ? -1 : 1) * 30}px)`,
                      }}
                      className="group cursor-pointer relative flex flex-col items-center"
                    >
                      {/* Pulse Ring */}
                      <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500" />
                      </span>

                      {/* Map Node Pin */}
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-soft-lg ${
                          isSelected
                            ? 'bg-forest-deep text-lime-400 ring-4 ring-lime-400/50 scale-110'
                            : 'bg-white text-forest-800 hover:bg-forest-50 border-2 border-forest-600'
                        }`}
                      >
                        <Trees className="w-6 h-6" />
                      </div>

                      {/* Site Tag Label */}
                      <div className="mt-2 bg-white/95 backdrop-blur-md px-3 py-1 rounded-lg shadow-sm border border-sage-200 text-center">
                        <div className="text-xs font-bold text-slate-900">{site.name}</div>
                        <div className="text-[10px] text-forest-700 font-medium">
                          {site.plantedTrees.toLocaleString()} trees planted
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Map Canvas HUD Overlay */}
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-sage-200 text-xs shadow-sm flex items-center gap-4 text-slate-700">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span>Optimal Canopy Health</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-amber-400" />
                  <span>Moisture Attention</span>
                </div>
              </div>

              <div className="absolute top-4 right-4 bg-forest-deep/90 text-white backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-mono border border-forest-moss flex items-center gap-2">
                <Compass className="w-3.5 h-3.5 text-lime-400" />
                <span>LAT: 44.97°N | LNG: 93.26°W</span>
              </div>
            </div>
          </Card>

          {/* Quick Search & Filter Strip */}
          <div className="flex items-center gap-3">
            <SearchInput
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClear={() => setSearchTerm('')}
              placeholder="Search restoration biomes or regions..."
            />
          </div>
        </div>

        {/* Right 1 Col: Selected Site Telemetry Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="bg-forest-50/50">
              <div>
                <Badge variant="emerald" size="sm" className="mb-1.5">
                  {selectedSite.biome.toUpperCase()} BIOME
                </Badge>
                <CardTitle>{selectedSite.name}</CardTitle>
                <CardDescription>{selectedSite.location}</CardDescription>
              </div>
              <div className="w-10 h-10 rounded-xl bg-forest-100 text-forest-800 flex items-center justify-center font-bold text-sm">
                {Math.round((selectedSite.plantedTrees / selectedSite.targetTrees) * 100)}%
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>Reforestation Progress</span>
                  <span className="font-semibold text-slate-900">
                    {selectedSite.plantedTrees.toLocaleString()} / {selectedSite.targetTrees.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-forest-600 h-full rounded-full"
                    style={{ width: `${(selectedSite.plantedTrees / selectedSite.targetTrees) * 100}%` }}
                  />
                </div>
              </div>

              {/* Environmental Sensor Telemetry */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-sage-50 rounded-lg border border-sage-100">
                  <div className="text-[11px] text-slate-500">Soil Profile</div>
                  <div className="font-semibold text-slate-900 mt-0.5">{selectedSite.soilType}</div>
                </div>
                <div className="p-3 bg-sage-50 rounded-lg border border-sage-100">
                  <div className="text-[11px] text-slate-500">Annual Rainfall</div>
                  <div className="font-semibold text-slate-900 mt-0.5">{selectedSite.rainfallAnnualMm} mm / yr</div>
                </div>
                <div className="p-3 bg-sage-50 rounded-lg border border-sage-100">
                  <div className="text-[11px] text-slate-500">Biodiversity Index</div>
                  <div className="font-semibold text-emerald-700 mt-0.5">{selectedSite.biodiversityIndex} / 10</div>
                </div>
                <div className="p-3 bg-sage-50 rounded-lg border border-sage-100">
                  <div className="text-[11px] text-slate-500">Status</div>
                  <div className="font-semibold text-forest-700 mt-0.5 capitalize">{selectedSite.status}</div>
                </div>
              </div>

              {/* Recommended Species */}
              <div>
                <div className="text-xs font-semibold text-slate-800 mb-2">Native Species Planted:</div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedSite.suitableSpecies.map((sp) => (
                    <span
                      key={sp}
                      className="px-2 py-0.5 bg-forest-100 text-forest-800 text-[11px] font-medium rounded-full"
                    >
                      {sp}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-forest-deep text-white text-xs space-y-1">
                <div className="font-semibold text-lime-400 flex items-center gap-1.5">
                  <Satellite className="w-3.5 h-3.5" />
                  Telemetry Verified
                </div>
                <p className="text-forest-200 text-[11px]">
                  LoRaWAN automated sensor array online. Last ground humidity packet received 18 minutes ago.
                </p>
              </div>

              <Button
                variant="primary"
                size="sm"
                className="w-full text-xs"
                onClick={() => alert(`Opening ground telemetry console for ${selectedSite.name}`)}
              >
                Inspect Sensor Array
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
