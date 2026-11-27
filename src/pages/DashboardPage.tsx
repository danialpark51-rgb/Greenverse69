import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboardData } from '../hooks/useDashboardData';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/common/StatCard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import {
  MOCK_MISSIONS,
  MOCK_SITES,
} from '../data/mockData';
import {
  TreeDeciduous,
  MapPin,
  PlusCircle,
  Users,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Droplets,
  CheckCircle2,
  Calendar,
  Award,
  Loader2,
  Wallet,
  Bell,
  AlertCircle,
  Briefcase,
  Sprout,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { metrics, recentActivity, recentNotifications, loading, error, refresh } = useDashboardData();

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

  // Derive display name from real auth data
  const displayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    (user?.email ? user.email.split('@')[0] : null) ||
    'Forester';

  // Format numbers with locale separators
  const fmt = (n: number | null) =>
    n === null ? '—' : n.toLocaleString();

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* 1. Personalized Welcome & Environmental Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-forest-deep via-forest-rich to-forest-moss text-white p-6 sm:p-8 shadow-soft-lg border border-forest-moss/60">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(#84cc16_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-600/40 border border-forest-400/30 text-lime-300 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Planetary Tree Intelligence
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Welcome back, {displayName}
            </h1>
            <p className="text-forest-200 text-xs sm:text-sm leading-relaxed">
              Your Greenverse dashboard — live metrics from your connected Supabase backend.
              {!user && (
                <span className="text-lime-300 font-medium"> Sign in to unlock your personal metrics.</span>
              )}
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
              icon={<MapPin className="w-4 h-4" />}
              onClick={() => navigate('/map')}
            >
              Explore Map
            </Button>
          </div>
        </div>

        {/* Live telemetry pills */}
        <div className="mt-6 pt-5 border-t border-forest-moss/60 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <div className="text-forest-300 text-[11px]">Trees Registered</div>
            <div className="text-lg font-bold text-white flex items-center gap-1.5 mt-0.5">
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-forest-300" />
              ) : (
                <>
                  {fmt(metrics.treesRegistered)}
                  <span className="text-[10px] text-lime-400 font-normal">live</span>
                </>
              )}
            </div>
          </div>
          <div>
            <div className="text-forest-300 text-[11px]">Active Projects</div>
            <div className="text-lg font-bold text-white flex items-center gap-1.5 mt-0.5">
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-forest-300" />
              ) : (
                <>
                  {fmt(metrics.activeProjects)}
                  <span className="text-[10px] text-forest-300 font-normal">running</span>
                </>
              )}
            </div>
          </div>
          <div>
            <div className="text-forest-300 text-[11px]">Open Opportunities</div>
            <div className="text-lg font-bold text-white flex items-center gap-1.5 mt-0.5">
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-forest-300" />
              ) : (
                <>
                  {fmt(metrics.openOpportunities)}
                  <span className="text-[10px] text-lime-400 font-normal">open</span>
                </>
              )}
            </div>
          </div>
          <div>
            <div className="text-forest-300 text-[11px]">$VERD Balance</div>
            <div className="text-lg font-bold text-lime-400 flex items-center gap-1.5 mt-0.5">
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-forest-300" />
              ) : user ? (
                <>
                  {fmt(metrics.walletBalance)} pts
                  <span className="text-[10px] text-forest-300 font-normal">VERD</span>
                </>
              ) : (
                <span className="text-forest-400 text-sm font-normal">Sign in</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
          <button onClick={refresh} className="ml-auto font-semibold underline">Retry</button>
        </div>
      )}

      {/* 2. Key Metrics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Trees Registered"
          value={loading ? '…' : fmt(metrics.treesRegistered)}
          change={metrics.treesRegistered !== null ? 'Live from database' : 'No data yet'}
          isPositive={true}
          timeframe="all time"
          iconName="Trees"
          accent="forest"
          onClick={() => navigate('/passport')}
        />
        <StatCard
          title="Active Projects"
          value={loading ? '…' : fmt(metrics.activeProjects)}
          change={metrics.activeProjects !== null ? 'Live from database' : 'No projects yet'}
          isPositive={true}
          timeframe="currently running"
          iconName="Sprout"
          accent="sage"
          onClick={() => navigate('/projects')}
        />
        <StatCard
          title="Open Opportunities"
          value={loading ? '…' : fmt(metrics.openOpportunities)}
          change={metrics.openOpportunities !== null ? 'Live from database' : 'No data yet'}
          isPositive={true}
          timeframe="accepting applications"
          iconName="Briefcase"
          accent="lime"
          onClick={() => navigate('/opportunities')}
        />
        <StatCard
          title="$VERD Points"
          value={loading ? '…' : user ? fmt(metrics.walletBalance) : 'Sign in'}
          change={user ? (metrics.walletBalance !== null ? 'Your wallet' : 'Initializing…') : 'Required'}
          isPositive={true}
          timeframe="green reward points"
          iconName="Wallet"
          accent="emerald"
          onClick={() => navigate('/wallet')}
        />
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

      {/* 4. Recent Notifications Preview (live) + Map Row */}
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
            <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(to_right,#557257_1px,transparent_1px),linear-gradient(to_bottom,#557257_1px,transparent_1px)] [background-size:40px_40px]" />

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

            <div className="relative z-10 flex items-center justify-around h-full my-auto">
              {filteredSites.map((site) => (
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

        {/* Right: Notifications Preview (live) */}
        <Card className="flex flex-col">
          <CardHeader>
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-forest-700" />
                Recent Notifications
              </CardTitle>
              <CardDescription>Your latest alerts and updates</CardDescription>
            </div>
            {metrics.pendingNotifications !== null && metrics.pendingNotifications > 0 && (
              <Badge variant="emerald" size="sm">
                {metrics.pendingNotifications} unread
              </Badge>
            )}
          </CardHeader>

          <CardContent className="flex-1 p-0 divide-y divide-slate-100">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-forest-600 mr-2" />
                <span className="text-xs text-slate-500">Loading…</span>
              </div>
            ) : !user ? (
              <div className="p-5 text-center text-xs text-slate-500">
                <Bell className="w-7 h-7 mx-auto text-slate-300 mb-2" />
                <p className="font-medium text-slate-700">Sign in to view notifications</p>
                <button
                  onClick={() => navigate('/login')}
                  className="mt-2 text-forest-700 font-semibold underline"
                >
                  Sign In
                </button>
              </div>
            ) : recentNotifications.length === 0 ? (
              <div className="p-5 text-center text-xs text-slate-500">
                <CheckCircle2 className="w-7 h-7 mx-auto text-emerald-300 mb-2" />
                <p className="font-medium text-slate-600">All caught up!</p>
                <p>No notifications yet.</p>
              </div>
            ) : (
              recentNotifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3.5 flex gap-3 ${!n.is_read ? 'bg-forest-50/40' : ''}`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      n.type === 'alert'
                        ? 'bg-amber-100 text-amber-700'
                        : n.type === 'wallet'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-forest-100 text-forest-700'
                    }`}
                  >
                    {n.type === 'wallet' ? (
                      <Wallet className="w-3.5 h-3.5" />
                    ) : n.type === 'alert' ? (
                      <AlertCircle className="w-3.5 h-3.5" />
                    ) : (
                      <Bell className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">{n.title}</p>
                    <p className="text-[11px] text-slate-500 truncate">{n.message}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {new Date(n.created_at).toLocaleString()}
                    </p>
                  </div>
                  {!n.is_read && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </CardContent>

          <CardFooter>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => navigate('/wallet')}
            >
              <Wallet className="w-3.5 h-3.5 mr-1" />
              View Rewards Wallet
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* 5. Bottom Row: Upcoming Green Missions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Upcoming Green Missions (from mock data — no Supabase table for missions yet) */}
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

        {/* Right: Live activity from community posts (or empty state) */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-4 h-4 text-forest-700" />
                Recent Community Activity
              </CardTitle>
              <CardDescription>Latest posts & contributions from the network</CardDescription>
            </div>
            {!loading && recentActivity.length > 0 && (
              <Badge variant="emerald" size="sm" dot>Live</Badge>
            )}
          </CardHeader>

          <CardContent className="divide-y divide-slate-100 p-0">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-forest-600 mr-2" />
                <span className="text-xs text-slate-500">Loading activity…</span>
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="font-medium text-slate-700">No community activity yet</p>
                <p>Be the first to post in the community!</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 text-xs"
                  onClick={() => navigate('/communities')}
                >
                  Explore Communities
                </Button>
              </div>
            ) : (
              recentActivity.map((act) => (
                <div key={act.id} className="p-4 hover:bg-slate-50/60 transition-colors flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-forest-100 text-forest-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-900 truncate">
                        {act.title}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {new Date(act.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 mt-1 line-clamp-2">{act.description}</p>
                  </div>
                </div>
              ))
            )}
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
            <p className="text-xs text-slate-500">Field briefing coordinates sent to your notification center.</p>
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
