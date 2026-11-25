import React, { useState, useEffect, useCallback } from 'react';
import {
  Trophy,
  Users,
  TreePine,
  Target,
  Calendar,
  AlertCircle,
  Loader2,
  RefreshCw,
  Info,
} from 'lucide-react';
import {
  fetchCommunityLeaderboard,
  fetchMemberLeaderboard,
} from '../../services/communityService';
import type { CommunityLeaderboardEntry, MemberLeaderboardEntry } from '../../types/community';

// ─── Rank Badge ───────────────────────────────────────────────────────────────
function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return (
    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-400 text-white text-xs font-black shadow-sm">🥇</span>
  );
  if (rank === 2) return (
    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-400 text-white text-xs font-black shadow-sm">🥈</span>
  );
  if (rank === 3) return (
    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-700 text-white text-xs font-black shadow-sm">🥉</span>
  );
  return (
    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
      {rank}
    </span>
  );
}

// ─── Community Rankings Table ─────────────────────────────────────────────────
function CommunityRankings() {
  const [data, setData] = useState<CommunityLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [fromSupabase, setFromSupabase] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await fetchCommunityLeaderboard();
    setData(result.data);
    setFromSupabase(result.fromSupabase);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-4">
      {!fromSupabase && (
        <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          Could not reach Supabase. Rankings unavailable offline.
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-7 h-7 animate-spin text-emerald-500" />
        </div>
      ) : data.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
          <Trophy className="w-10 h-10 mx-auto mb-3 text-slate-300" />
          <p className="text-sm font-semibold text-slate-700">No community data yet</p>
          <p className="text-xs text-slate-500 mt-1">Rankings will appear once communities plant trees and welcome members.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-5 py-3.5 w-12">#</th>
                <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-3.5">Community</th>
                <th className="text-right text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-3.5 hidden sm:table-cell">
                  <span className="flex items-center justify-end gap-1"><TreePine className="w-3 h-3" /> Trees</span>
                </th>
                <th className="text-right text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-3.5 hidden md:table-cell">
                  <span className="flex items-center justify-end gap-1"><Users className="w-3 h-3" /> Members</span>
                </th>
                <th className="text-right text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-3.5">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.map(entry => (
                <tr key={entry.community_id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <RankBadge rank={entry.rank} />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      {entry.avatar_url ? (
                        <img src={entry.avatar_url} alt="" className="w-8 h-8 rounded-xl object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                          <TreePine className="w-4 h-4 text-emerald-600" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{entry.community_name}</p>
                        {entry.location_name && (
                          <p className="text-xs text-slate-500 truncate">{entry.location_name}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-right hidden sm:table-cell">
                    <span className="text-sm font-bold text-slate-800">{entry.trees_planted_count.toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-3.5 text-right hidden md:table-cell">
                    <span className="text-sm font-bold text-slate-800">{entry.members_count.toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-black border border-emerald-100">
                      <Trophy className="w-3 h-3 text-emerald-600" />
                      {entry.score.toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Member Rankings Table ────────────────────────────────────────────────────
function MemberRankings() {
  const [data, setData] = useState<MemberLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [fromSupabase, setFromSupabase] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await fetchMemberLeaderboard();
    setData(result.data);
    setFromSupabase(result.fromSupabase);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-4">
      {!fromSupabase && (
        <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          Could not reach Supabase. Member rankings unavailable offline.
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-7 h-7 animate-spin text-emerald-500" />
        </div>
      ) : data.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
          <Users className="w-10 h-10 mx-auto mb-3 text-slate-300" />
          <p className="text-sm font-semibold text-slate-700">No member data yet</p>
          <p className="text-xs text-slate-500 mt-1">Rankings appear once members join communities and complete challenges.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-5 py-3.5 w-12">#</th>
                <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-3.5">Member</th>
                <th className="text-right text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-3.5 hidden sm:table-cell">
                  <span className="flex items-center justify-end gap-1"><Target className="w-3 h-3" /> Challenges</span>
                </th>
                <th className="text-right text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-3.5 hidden md:table-cell">
                  <span className="flex items-center justify-end gap-1"><Calendar className="w-3 h-3" /> Events</span>
                </th>
                <th className="text-right text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-3.5">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.map(entry => (
                <tr key={entry.user_id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <RankBadge rank={entry.rank} />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-700 font-bold text-sm">
                        {entry.display_name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-semibold text-slate-900 truncate">{entry.display_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-right hidden sm:table-cell">
                    <span className="text-sm font-bold text-slate-800">{entry.challenges_completed}</span>
                  </td>
                  <td className="px-4 py-3.5 text-right hidden md:table-cell">
                    <span className="text-sm font-bold text-slate-800">{entry.events_attended}</span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-black border border-emerald-100">
                      <Trophy className="w-3 h-3 text-emerald-600" />
                      {entry.score}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export const CommunityLeaderboard: React.FC = () => {
  const [view, setView] = useState<'communities' | 'members'>('communities');
  const [showScoring, setShowScoring] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold uppercase tracking-wider mb-2 border border-amber-100">
              <Trophy className="w-3.5 h-3.5" />
              Leaderboard
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">Community Rankings</h2>
            <p className="text-xs text-slate-500 mt-1">
              Rankings reflect registered environmental activity within Greenverse only.{' '}
              <span className="text-amber-700 font-medium">Demo/seed records are labeled.</span>
            </p>
          </div>
          <button
            onClick={() => setShowScoring(s => !s)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors"
          >
            <Info className="w-3.5 h-3.5" />
            Scoring Guide
          </button>
        </div>

        {/* Scoring guide */}
        {showScoring && (
          <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
            <p className="font-bold text-slate-800">How scores are calculated</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="font-semibold text-slate-700 mb-1">🏘 Community Score</p>
                <ul className="space-y-0.5 text-slate-600">
                  <li>Trees planted × <strong>2 pts</strong></li>
                  <li>Members count × <strong>1 pt</strong></li>
                  <li>Challenges hosted × <strong>3 pts</strong> <span className="text-slate-400">(future)</span></li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-slate-700 mb-1">👤 Member Score</p>
                <ul className="space-y-0.5 text-slate-600">
                  <li>Trees registered × <strong>3 pts</strong></li>
                  <li>Challenges completed × <strong>5 pts</strong></li>
                  <li>Events attended × <strong>1 pt</strong></li>
                </ul>
              </div>
            </div>
            <p className="text-slate-400 pt-1">
              Scores are computed from real Greenverse database records. No self-reported scores are accepted.
            </p>
          </div>
        )}

        {/* Tab switcher */}
        <div className="mt-5 flex gap-2">
          <button
            onClick={() => setView('communities')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
              view === 'communities' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Community Rankings
          </button>
          <button
            onClick={() => setView('members')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
              view === 'members' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Member Rankings
          </button>
        </div>
      </div>

      {view === 'communities' ? <CommunityRankings /> : <MemberRankings />}
    </div>
  );
};
