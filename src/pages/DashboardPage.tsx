import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  METRIC_STATS,
  MOCK_MISSIONS,
  MOCK_COMMUNITY_ACTIVITIES,
  MOCK_SITES
} from '../data/mockData';
import { StatCard } from '../components/common/StatCard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import {
  TreeDeciduous,
  MapPin,
  PlusCircle,
  Users,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Droplets,
  Satellite,
  Compass,
  CheckCircle2,
  Calendar,
  Layers,
  Award
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedBiome, setSelectedBiome] = useState<string>('all');
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [activeMissionTitle, setActiveMissionTitle] = useState('');
  const [joinSuccess, setJoinSuccess] = useState(false);

  const filteredSites = selectedBiome === 'all'
    ? MOCK_SITES
    : MOCK_SITES.filter(s => s.biome === selectedBiome);

  const handleJoinMission = (title: string) => {
    setActiveMissionTitle(title);
    setIsJoinModalOpen(true);
  };

  const confirmJoinMission = () => {
    setJoinSuccess(true);
    setTimeout(() => {
      setJoinSuccess(false);
      setIsJoinModalOpen(false);
    }, 1200);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* 1. Personalized Welcome & Environmental Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-forest-deep via-forest-rich to-forest-moss text-white p-6 sm:p-8 shadow-soft-lg border border-forest-moss/60">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(#84cc16_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-600/40 border border-forest-400/30 text-lime-300 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Planetary Tree Intelligence — Demo Preview
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Welcome back, Elena
            </h1>
            <p className="text-forest-200 text-xs sm:text-sm leading-relaxed">
              Your registered canopy sequestered an estimated <strong className="text-white font-semibold">142.6 tons of CO₂e</strong> (demo estimate).
              Illustrative Sentinel-2 multispectral telemetry based on USDA i-Tree carbon models.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 shrink-0">
            <Button
              variant="lime"
              size="md"
              icon={<TreeDeciduous className="w-4 h-4" />}
              onClick={() => navigate('/passport')}
            >
              Plant a Tree
            </Button>
            <Button
              variant="outline"
              size="md"
              className="bg-white/10 text-white border-forest-400/40 hover:bg-white/20"
              icon={<Compass className="w-4 h-4" />}
              onClick={() => navigate('/map')}
            >
              Explore Map
            </Button>
          </div>
        </div>

        {/* Mini telemetry pills */}
        <div className="mt-6 pt-5 border-t border-forest-moss/60 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <div className="text-forest-300 text-[11px]">Canopy Survival Rate</div>
            <div className="text-lg font-bold text-white flex items-center gap-1.5 mt-0.5">
              94.2%
              <span className="text-[10px] text-lime-400 font-normal">↑ 1.8%</span>
            </div>
          </div>
          <div>
            <div className="text-forest-300 text-[11px]">Soil Moisture Index</div>
            <div className="text-lg font-bold text-white flex items-center gap-1.5 mt-0.5">
              68.4%
              <span className="text-[10px] text-forest-300 font-normal">Optimal</span>
            </div>
          </div>
          <div>
            <div className="text-forest-300 text-[11px]">Active Eco-Squads</div>
            <div className="text-lg font-bold text-white flex items-center gap-1.5 mt-0.5">
              42 Squads
              <span className="text-[10px] text-lime-400 font-normal">Global</span>
            </div>
          </div>
          <div>
            <div className="text-forest-300 text-[11px]">$VERD Balance</div>
            <div className="text-lg font-bold text-lime-400 flex items-center gap-1.5 mt-0.5">
              1,840 VERD
              <span className="text-[10px] text-forest-300 font-normal">≈ $920</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {METRIC_STATS.map((metric) => (
          <StatCard
            key={metric.id}
            title={metric.title}
            value={metric.value}
            change={metric.change}
            isPositive={metric.isPositive}
            timeframe={metric.timeframe}
            iconName={metric.icon}
            accent={metric.accent}
            onClick={() => {
              if (metric.id === 'm1') navigate('/passport');
              if (metric.id === 'm2') navigate('/impact');
              if (metric.id === 'm3') navigate('/projects');
              if (metric.id === 'm4') navigate('/opportunities');
            }}
          />
        ))}
      </div>

      {/* 3. Quick Action Hub */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <button
          onClick={() => navigate('/passport')}
          className="p-4 rounded-xl bg-white border border-sage-200 hover:border-forest-400 hover:shadow-soft transition-all text-left group flex flex-col justify-between"
        >
          <div className="w-9 h-9 rounded-lg bg-forest-50 border border-forest-100 flex items-center justify-center text-forest-700 group-hover:scale-105 group-hover:bg-forest-100 transition-all">
            <TreeDeciduous className="w-5 h-5" />
          </div>
          <div className="mt-3">
            <div className="text-xs font-semibold text-slate-800 group-hover:text-forest-800">
              Plant a Tree
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Mint NFC digital passport</div>
          </div>
        </button>

        <button
          onClick={() => navigate('/map')}
          className="p-4 rounded-xl bg-white border border-sage-200 hover:border-forest-400 hover:shadow-soft transition-all text-left group flex flex-col justify-between"
        >
          <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 group-hover:scale-105 group-hover:bg-emerald-100 transition-all">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="mt-3">
            <div className="text-xs font-semibold text-slate-800 group-hover:text-forest-800">
              Find a Planting Site
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Explore open restoration biomes</div>
          </div>
        </button>

        <button
          onClick={() => navigate('/projects')}
          className="p-4 rounded-xl bg-white border border-sage-200 hover:border-forest-400 hover:shadow-soft transition-all text-left group flex flex-col justify-between"
        >
          <div className="w-9 h-9 rounded-lg bg-sage-100 border border-sage-200 flex items-center justify-center text-forest-800 group-hover:scale-105 group-hover:bg-sage-200 transition-all">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div className="mt-3">
            <div className="text-xs font-semibold text-slate-800 group-hover:text-forest-800">
              Create a Project
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Launch verified campaign</div>
          </div>
        </button>

        <button
          onClick={() => navigate('/communities')}
          className="p-4 rounded-xl bg-white border border-sage-200 hover:border-forest-400 hover:shadow-soft transition-all text-left group flex flex-col justify-between"
        >
          <div className="w-9 h-9 rounded-lg bg-lime-100 border border-lime-200 flex items-center justify-center text-forest-900 group-hover:scale-105 group-hover:bg-lime-200 transition-all">
            <Users className="w-5 h-5" />
          </div>
          <div className="mt-3">
            <div className="text-xs font-semibold text-slate-800 group-hover:text-forest-800">
              Join a Mission
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Field action & squad rewards</div>
          </div>
        </button>
      </div>

      {/* 4. Green Map Preview & Canopy Progress Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Green Map Preview */}
        <Card className="lg:col-span-2 overflow-hidden flex flex-col">
          <CardHeader>
            <div>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-forest-700" />
                Live Restoration Sites Map
              </CardTitle>
              <CardDescription>
                Real-time geospatial monitor of active rewilding biomes & IoT telemetry
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => navigate('/map')}
              >
                Full Screen Map <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </CardHeader>

          {/* Interactive Map Canvas Simulator */}
          <div className="relative bg-gradient-to-b from-[#e8f0e6] to-[#d8e5d6] p-6 h-72 sm:h-80 flex flex-col justify-between overflow-hidden border-b border-sage-200">
            {/* Simulated Geospatial Grid Lines */}
            <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(to_right,#557257_1px,transparent_1px),linear-gradient(to_bottom,#557257_1px,transparent_1px)] [background-size:40px_40px]" />

            {/* Top filter pills on map */}
            <div className="relative z-10 flex flex-wrap gap-2">
              {['all', 'urban', 'mangrove', 'riparian', 'agroforestry'].map((biome) => (
                <button
                  key={biome}
                  onClick={() => setSelectedBiome(biome)}
                  className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all capitalize shadow-sm ${
                    selectedBiome === biome
                      ? 'bg-forest-rich text-white border border-forest-moss shadow'
                      : 'bg-white/90 text-slate-700 hover:bg-white border border-sage-200'
                  }`}
                >
                  {biome === 'all' ? 'All Biomes' : biome}
                </button>
              ))}
            </div>

            {/* Simulated Geo Pinpoints on SVG Canvas */}
            <div className="relative z-10 flex items-center justify-around h-full my-auto">
              {filteredSites.map((site, idx) => (
                <div
                  key={site.id}
                  onClick={() => navigate('/map')}
                  className="group relative cursor-pointer flex flex-col items-center transition-transform hover:scale-110"
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-forest-rich text-white flex items-center justify-center shadow-soft-lg border-2 border-lime-400 group-hover:border-white">
                      <TreeDeciduous className="w-5 h-5 text-lime-300" />
                    </div>
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
                  </div>
                  <div className="mt-2 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-md shadow-sm border border-sage-200 text-center max-w-[140px]">
                    <div className="text-[11px] font-bold text-slate-900 truncate">{site.name}</div>
                    <div className="text-[9px] text-forest-700 font-semibold">{site.plantedTrees.toLocaleString()} trees</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Map Legend */}
            <div className="relative z-10 flex items-center justify-between text-[11px] bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-sage-200 text-slate-600">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                Active Planting ({filteredSites.length} sites active)
              </span>
              <span className="font-mono text-slate-500 text-[10px]">
                Coordinates: 44.97°N, 93.26°W
              </span>
            </div>
          </div>

          {/* Map Footer Sites Quick List */}
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white">
            {filteredSites.slice(0, 2).map((site) => (
              <div
                key={site.id}
                onClick={() => navigate('/map')}
                className="p-3 rounded-lg border border-sage-100 hover:border-forest-300 bg-sage-50/30 hover:bg-forest-50/20 transition-all cursor-pointer flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-semibold text-slate-800">{site.name}</div>
                  <div className="text-[10px] text-slate-500">{site.location} · {site.soilType}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-forest-700">
                    {Math.round((site.plantedTrees / site.targetTrees) * 100)}%
                  </div>
                  <div className="text-[9px] text-slate-400">target reached</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Right 1 Col: Species Distribution & Growth Chart */}
        <Card className="flex flex-col">
          <CardHeader>
            <div>
              <CardTitle>Canopy Species Mix</CardTitle>
              <CardDescription>Biodiversity distribution across plots</CardDescription>
            </div>
            <Badge variant="lime" size="sm">High Diversity</Badge>
          </CardHeader>

          <CardContent className="space-y-4 flex-1">
            {/* Visual Bar Progression */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700">Bur Oak (Quercus macrocarpa)</span>
                  <span className="font-semibold text-slate-900">38%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-forest-700 h-full rounded-full" style={{ width: '38%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700">Western Red Cedar (Thuja plicata)</span>
                  <span className="font-semibold text-slate-900">26%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-forest-500 h-full rounded-full" style={{ width: '26%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700">Red Mangrove (Rhizophora mangle)</span>
                  <span className="font-semibold text-slate-900">21%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '21%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700">American Chestnut Hybrids</span>
                  <span className="font-semibold text-slate-900">15%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-lime-500 h-full rounded-full" style={{ width: '15%' }} />
                </div>
              </div>
            </div>

            {/* Carbon Yield Highlight Box */}
            <div className="p-3.5 rounded-xl bg-forest-50 border border-forest-100 text-xs space-y-2">
              <div className="flex items-center justify-between text-forest-900 font-semibold">
                <span className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-forest-700" />
                  MRV Satellite Audit Status
                </span>
                <span className="text-[10px] text-emerald-700 font-mono">VCS Verra Tier-1</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Multispectral vegetative index (NDVI) confirms canopy photosynthetic density increased by <strong className="text-forest-800">14.8%</strong> year-over-year.
              </p>
            </div>
          </CardContent>

          <CardFooter>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => navigate('/intelligence')}
            >
              Run AI Planting Intelligence
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* 5. Bottom Row: Upcoming Green Missions & Recent Community Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Upcoming Green Missions */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-forest-700" />
                Upcoming Green Missions
              </CardTitle>
              <CardDescription>Volunteer squad planting sprints & sensor deployments</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => navigate('/communities')}
            >
              All Missions <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </CardHeader>

          <CardContent className="divide-y divide-slate-100 p-0">
            {MOCK_MISSIONS.slice(0, 3).map((mission) => (
              <div key={mission.id} className="p-5 hover:bg-slate-50/60 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{mission.title}</span>
                      <Badge
                        variant={mission.status === 'in_progress' ? 'lime' : 'sage'}
                        size="sm"
                      >
                        {mission.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1">{mission.description}</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {mission.location}
                      </span>
                      <span>·</span>
                      <span className="font-medium text-forest-700">
                        +{mission.rewardTokens} $VERD Reward
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    className="shrink-0 text-xs"
                    onClick={() => handleJoinMission(mission.title)}
                  >
                    Join Squad
                  </Button>
                </div>

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                    <span>Target: {mission.targetTrees} trees</span>
                    <span>{mission.volunteersJoined} / {mission.volunteersNeeded} volunteers</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-forest-600 h-full rounded-full"
                      style={{ width: `${(mission.currentTrees / mission.targetTrees) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Right: Recent Community Activity Feed */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-4 h-4 text-forest-700" />
                Recent Community & Squad Action
              </CardTitle>
              <CardDescription>Live telemetry, passport mints, and squad contributions</CardDescription>
            </div>
            <Badge variant="emerald" size="sm" dot>Live Sync</Badge>
          </CardHeader>

          <CardContent className="divide-y divide-slate-100 p-0">
            {MOCK_COMMUNITY_ACTIVITIES.map((act) => (
              <div key={act.id} className="p-4 hover:bg-slate-50/60 transition-colors flex items-start gap-3">
                <img
                  src={act.user.avatar}
                  alt={act.user.name}
                  className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-sage-200 mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-900 truncate">
                      {act.user.name}
                    </span>
                    <span className="text-[10px] text-slate-400 shrink-0">{act.timestamp}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">{act.user.role}</div>
                  <p className="text-xs text-slate-700 mt-1">
                    {act.action} <span className="font-semibold text-forest-800">{act.target}</span>
                  </p>
                  {act.badge && (
                    <div className="mt-1.5">
                      <Badge variant="forest" size="sm">
                        {act.badge}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => navigate('/communities')}
            >
              Explore All Eco-Squads & Chapters
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Join Mission Modal */}
      <Modal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        title="Join Green Mission Squad"
        description={activeMissionTitle}
      >
        {joinSuccess ? (
          <div className="py-6 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-slate-900">You're Enrolled in this Mission!</h4>
            <p className="text-xs text-slate-500">Field briefing coordinates and equipment checklist sent to your notification center.</p>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            <p className="text-slate-600 leading-relaxed">
              By joining this mission, you will team up with verified local ecologists to plant native species and attach digital Tree Passports.
            </p>
            <div className="p-3 bg-sage-50 border border-sage-200 rounded-lg space-y-1.5">
              <div className="flex justify-between font-medium text-slate-700">
                <span>Mission Reward:</span>
                <span className="text-forest-700 font-bold">+120 $VERD</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Field Equipment:</span>
                <span>Gloves, GPS Reader, Bio-Mulch</span>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setIsJoinModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={confirmJoinMission}>
                Confirm Enrollment
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
