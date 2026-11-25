import React, { useState, useEffect } from 'react';
import { MOCK_SITES } from '../data/mockData';
import { PlantingSite } from '../types';
import { DbTree } from '../types/tree';
import { fetchTrees } from '../services/treeService';
import { InteractiveMap, MapMarkerItem } from '../components/map/InteractiveMap';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
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
  SlidersHorizontal,
  QrCode,
  Calendar,
  Sparkles,
  Map
} from 'lucide-react';

export const GreenMapPage: React.FC = () => {
  const [selectedSite, setSelectedSite] = useState<PlantingSite | null>(MOCK_SITES[0]);
  const [selectedTree, setSelectedTree] = useState<DbTree | null>(null);
  const [biomeFilter, setBiomeFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'all' | 'sites' | 'trees'>('all');
  const [trees, setTrees] = useState<DbTree[]>([]);

  useEffect(() => {
    fetchTrees().then((res) => {
      setTrees(res.data.filter((t) => t.latitude !== null && t.longitude !== null));
    });
  }, []);

  const filteredSites = MOCK_SITES.filter((site) => {
    return biomeFilter === 'all' || site.biome === biomeFilter;
  });

  const filteredTrees = trees;

  // Build unified Leaflet markers
  const mapMarkers: MapMarkerItem[] = [];

  if (viewMode === 'all' || viewMode === 'sites') {
    filteredSites.forEach((site) => {
      mapMarkers.push({
        id: `site-${site.id}`,
        lat: site.coordinates[0],
        lng: site.coordinates[1],
        title: site.name,
        subtitle: `${site.location} (${site.plantedTrees.toLocaleString()} trees)`,
        score: Math.round((site.plantedTrees / site.targetTrees) * 100),
        variant: 'forest',
        data: { type: 'site', item: site },
      });
    });
  }

  if (viewMode === 'all' || viewMode === 'trees') {
    filteredTrees.forEach((tree) => {
      mapMarkers.push({
        id: `tree-${tree.id}`,
        lat: tree.latitude!,
        lng: tree.longitude!,
        title: tree.tree_code,
        subtitle: `${tree.name || tree.species} (${tree.location_description || 'Planted'})`,
        variant: tree.health_status === 'thriving' ? 'emerald' : 'amber',
        data: { type: 'tree', item: tree },
      });
    });
  }

  const handleMarkerClick = (m: MapMarkerItem) => {
    if (m.data?.type === 'site') {
      setSelectedSite(m.data.item);
      setSelectedTree(null);
    } else if (m.data?.type === 'tree') {
      setSelectedTree(m.data.item);
      setSelectedSite(null);
    }
  };

  const currentCenter: [number, number] = selectedTree && selectedTree.latitude && selectedTree.longitude
    ? [selectedTree.latitude, selectedTree.longitude]
    : selectedSite
    ? [selectedSite.coordinates[0], selectedSite.coordinates[1]]
    : [44.9778, -93.2650];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <MapPin className="w-6 h-6 text-forest-700" />
            Global Green Map & Geospatial Biome Monitor
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real interactive OpenStreetMap telemetry: verified tree passports, ecological restoration zones, and ground probes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="emerald" dot>Leaflet + OSM Live</Badge>
          <Badge variant="forest">{mapMarkers.length} Active Geo-Markers</Badge>
        </div>
      </div>

      {/* Main Map Viewport & Sidebar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Real Leaflet Map */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="overflow-hidden">
            {/* Map Controls Top Bar */}
            <div className="p-3 bg-white border-b border-sage-200 flex flex-wrap items-center justify-between gap-3">
              {/* View Mode (Sites / Trees) */}
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
                {(['all', 'sites', 'trees'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-2.5 py-1 rounded-md capitalize font-medium transition-all ${
                      viewMode === mode
                        ? 'bg-white text-forest-900 shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {mode === 'all' ? 'All Markers' : mode === 'sites' ? 'Restoration Sites' : 'Geo Trees'}
                  </button>
                ))}
              </div>

              {/* Biome Filter Badges */}
              <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                {['all', 'urban', 'mangrove', 'riparian', 'agroforestry'].map((b) => (
                  <button
                    key={b}
                    onClick={() => setBiomeFilter(b)}
                    className={`text-[11px] px-2.5 py-0.5 rounded-full capitalize font-medium border ${
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

            {/* Live Leaflet Map Container */}
            <div className="p-2 bg-slate-50">
              <InteractiveMap
                center={currentCenter}
                zoom={selectedTree ? 15 : 12}
                height="450px"
                markers={mapMarkers}
                onMarkerClick={handleMarkerClick}
                enableSearch={true}
                enableClickToPick={false}
                searchPlaceholder="Search address or zoom into any region globally..."
              />
            </div>
          </Card>
        </div>

        {/* Right 1 Col: Selected Site or Tree Telemetry Panel */}
        <div className="space-y-4">
          {selectedTree ? (
            /* Selected Tree Passport Card */
            <Card>
              <CardHeader className="bg-forest-50/70">
                <div>
                  <Badge variant="emerald" size="sm" className="mb-1.5">
                    INDIVIDUAL TREE PASSPORT
                  </Badge>
                  <CardTitle className="font-mono">{selectedTree.tree_code}</CardTitle>
                  <CardDescription>{selectedTree.name || selectedTree.species}</CardDescription>
                </div>
                <Badge
                  variant={selectedTree.health_status === 'thriving' ? 'emerald' : 'amber'}
                  size="sm"
                >
                  {selectedTree.health_status.replace('_', ' ')}
                </Badge>
              </CardHeader>

              <CardContent className="space-y-4 p-4 text-xs">
                <div>
                  <span className="text-[11px] text-slate-400">Location Description</span>
                  <div className="font-medium text-slate-800 mt-0.5">
                    {selectedTree.location_description}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-sage-50 rounded-lg border border-sage-100">
                    <span className="text-[10px] text-slate-400">Canopy Height</span>
                    <div className="font-bold text-slate-900 mt-0.5">{selectedTree.height_meters} m</div>
                  </div>
                  <div className="p-3 bg-sage-50 rounded-lg border border-sage-100">
                    <span className="text-[10px] text-slate-400">Stem DBH</span>
                    <div className="font-bold text-slate-900 mt-0.5">{selectedTree.dbh_cm} cm</div>
                  </div>
                  <div className="p-3 bg-sage-50 rounded-lg border border-sage-100">
                    <span className="text-[10px] text-slate-400">Carbon Offset</span>
                    <div className="font-bold text-forest-800 mt-0.5">{selectedTree.carbon_offset_kg} kg</div>
                  </div>
                  <div className="p-3 bg-sage-50 rounded-lg border border-sage-100">
                    <span className="text-[10px] text-slate-400">Planted</span>
                    <div className="font-bold text-slate-900 mt-0.5">{selectedTree.planting_date}</div>
                  </div>
                </div>

                <div className="p-3 bg-forest-900 text-white rounded-xl space-y-1">
                  <div className="font-semibold text-lime-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    Exact GPS Coordinates
                  </div>
                  <p className="font-mono text-[11px] text-forest-200">
                    Lat: {selectedTree.latitude?.toFixed(5)}° · Lng: {selectedTree.longitude?.toFixed(5)}°
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : selectedSite ? (
            /* Selected Restoration Site Card */
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

                {/* Native Species Planted */}
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
                    OpenStreetMap Ground Verified
                  </div>
                  <p className="font-mono text-[11px] text-forest-200">
                    Coordinates: [{selectedSite.coordinates[0]}°, {selectedSite.coordinates[1]}°]
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="p-8 text-center text-slate-400">
              <p className="text-xs">Click any map marker to view biometrics & telemetry.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
