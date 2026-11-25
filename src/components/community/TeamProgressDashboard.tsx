import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TreePine,
  Award,
  Users,
  Calendar,
  ShieldCheck,
  Heart,
  Flame,
  ArrowUpRight,
  Sparkles,
  Trophy,
  Medal,
  Activity
} from 'lucide-react';
import { TeamMetrics, SquadLeaderboardEntry } from '../../types/community';
import { getTeamMetrics, getSquadLeaderboard } from '../../services/communityService';

export const TeamProgressDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<TeamMetrics | null>(null);
  const [leaderboard, setLeaderboard] = useState<SquadLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const [m, l] = await Promise.all([
          getTeamMetrics(),
          getSquadLeaderboard(),
        ]);
        setMetrics(m);
        setLeaderboard(l);
      } catch (err) {
        console.error('Failed to load team dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm text-slate-600">Aggregating collective environmental impact metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-3 backdrop-blur-sm border border-emerald-500/30">
            <Activity className="w-3.5 h-3.5" />
            Live Ecosystem Telemetry
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">Team Progress & Collective Impact</h2>
          <p className="text-sm text-emerald-100/90 mt-2 leading-relaxed">
            Every seedling cataloged in Greenverse feeds directly into our shared canopy metrics. Track community milestones, survival rates, and squad rankings across all active regions.
          </p>
        </div>
      </div>

      {/* Aggregate Metric Cards */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Trees Planted</span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <TreePine className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-extrabold text-slate-900">{metrics.total_trees_planted.toLocaleString()}</div>
              <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Verified in database</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Trees Adopted</span>
              <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
                <Heart className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-extrabold text-slate-900">{metrics.total_trees_adopted.toLocaleString()}</div>
              <div className="text-[11px] text-teal-600 font-medium flex items-center gap-1 mt-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Active guardian care</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Survival Rate</span>
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-extrabold text-slate-900">{metrics.survival_rate}%</div>
              <div className="text-[11px] text-blue-600 font-medium flex items-center gap-1 mt-1">
                <span>Healthy foliage audits</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">CO2 Offset (est.)</span>
              <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-extrabold text-slate-900">{metrics.co2_offset_kg.toLocaleString()} <span className="text-sm font-semibold text-slate-500">kg</span></div>
              <div className="text-[11px] text-purple-600 font-medium flex items-center gap-1 mt-1">
                <span>Annual sequestration</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Secondary Metrics & Squad Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Squad Leaderboard */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                Top Squad Leaderboard
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Ranked by verified tree plantings, challenge milestones, and active squad members</p>
            </div>
          </div>

          <div className="space-y-3">
            {leaderboard.map((item, index) => {
              const isFirst = index === 0;
              const isSecond = index === 1;
              const isThird = index === 2;

              return (
                <div
                  key={item.squad_id}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                    isFirst
                      ? 'bg-amber-50/50 border-amber-200'
                      : isSecond
                      ? 'bg-slate-50/80 border-slate-200'
                      : isThird
                      ? 'bg-amber-50/20 border-slate-200'
                      : 'bg-white border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 flex items-center justify-center font-bold text-base">
                      {isFirst ? (
                        <Medal className="w-6 h-6 text-amber-500" />
                      ) : isSecond ? (
                        <Medal className="w-6 h-6 text-slate-400" />
                      ) : isThird ? (
                        <Medal className="w-6 h-6 text-amber-700" />
                      ) : (
                        <span className="text-slate-400 text-sm">#{item.rank}</span>
                      )}
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{item.squad_name}</h4>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                        <span>{item.trees_planted} trees</span>
                        <span>•</span>
                        <span>{item.challenges_won} challenges won</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-extrabold text-emerald-700 text-base">{item.score.toLocaleString()}</div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Impact Pts</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Community Milestones & Telemetry */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-emerald-600" />
              Community Milestones
            </h3>
            <p className="text-xs text-slate-500 mb-6">Recent collective breakthroughs unlocked by Greenverse squads</p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <TreePine className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-bold text-xs text-slate-900">500 Trees Placed & GPS Tracked</h5>
                  <p className="text-[11px] text-slate-500 mt-0.5">Reached across 12 distinct riparian corridors and urban parks.</p>
                  <span className="text-[10px] text-emerald-600 font-semibold">Unlocked 3 days ago</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-bold text-xs text-slate-900">100+ Active Canopy Stewards</h5>
                  <p className="text-[11px] text-slate-500 mt-0.5">Over 100 verified volunteers mobilized in monthly events.</p>
                  <span className="text-[10px] text-blue-600 font-semibold">Unlocked last week</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-bold text-xs text-slate-900">95% Survival Rate Benchmark</h5>
                  <p className="text-[11px] text-slate-500 mt-0.5">Sustained moisture retention through citizen mulching routines.</p>
                  <span className="text-[10px] text-purple-600 font-semibold">Active Milestone</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center justify-between text-xs text-slate-600 font-semibold mb-2">
              <span>Goal: 1,000 Verified Trees</span>
              <span>{(metrics ? ((metrics.total_trees_planted / 1000) * 100).toFixed(0) : 52)}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-1000"
                style={{ width: `${metrics ? Math.min(100, (metrics.total_trees_planted / 1000) * 100) : 52}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-2">
              Next milestone unlock: Community Nursery Grant for member squads
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
