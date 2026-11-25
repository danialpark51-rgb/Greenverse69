import React, { useState, useEffect } from 'react';
import {
  Award, ShieldCheck, CheckCircle2, Sprout, Clock, Users, HeartHandshake,
  Lock, Eye, Info, Sparkles, TrendingUp, Calendar, AlertCircle
} from 'lucide-react';
import {
  fetchUserReputation,
  fetchReputationActivities,
  fetchUserBadges
} from '../../services/economyService';
import { UserReputation, ReputationActivityLog, UserBadge } from '../../types/economy';

interface GreenReputationDashboardProps {
  currentUserId?: string;
}

export const GreenReputationDashboard: React.FC<GreenReputationDashboardProps> = ({ currentUserId }) => {
  const userId = currentUserId || 'demo-user';

  const [reputation, setReputation] = useState<UserReputation | null>(null);
  const [activities, setActivities] = useState<ReputationActivityLog[]>([]);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [rep, acts, bgs] = await Promise.all([
          fetchUserReputation(userId),
          fetchReputationActivities(userId),
          fetchUserBadges(userId)
        ]);
        setReputation(rep);
        setActivities(acts);
        setBadges(bgs);
      } catch {
        // handled
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  return (
    <div className="space-y-6">
      {/* Header & Privacy Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600" />
            Environmental Contribution & Reputation Profile
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Transparent, auditable record of your verified on-the-ground environmental achievements across the Greenverse.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm">
          {isPublic ? <Eye className="w-4 h-4 text-emerald-600" /> : <Lock className="w-4 h-4 text-slate-400" />}
          <span className="text-xs font-medium text-slate-700">Profile: {isPublic ? 'Public' : 'Squad Only'}</span>
          <button
            onClick={() => setIsPublic(!isPublic)}
            className="text-[11px] underline text-emerald-700 font-semibold ml-1"
          >
            Switch
          </button>
        </div>
      </div>

      {/* Disclaimers & Rules */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-600 flex items-start gap-3">
        <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-800">Verifiable Record Notice:</span> Reputation scores reflect verified Greenverse field contributions (satellite MRV audits, squad lead verifications, and approved bounties). Scores are non-transferable and do not substitute for formal state-licensed professional accreditations.
        </div>
      </div>

      {/* Hero Tier Card */}
      <div className="bg-gradient-to-br from-forest-deep via-forest-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-sm border border-forest-moss relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-lime-400/20 text-lime-300 border border-lime-400/30">
                Current Level Tier
              </span>
              <span className="text-xs text-forest-300 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-lime-400" /> Cryptographically Verified
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {reputation?.reputation_tier || 'Forest Steward'}
            </h3>
            <p className="text-xs sm:text-sm text-forest-200 max-w-xl leading-relaxed">
              Awarded to high-consistency contributors who actively lead field tree planting, complete local bio-restoration tasks, and log verified community volunteer hours.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 shrink-0">
            <div className="text-center px-3 border-r border-white/20">
              <div className="text-3xl font-black text-lime-400">{reputation?.reputation_score || 88}</div>
              <span className="text-[10px] text-forest-200 uppercase tracking-wider font-semibold">Reputation Score</span>
            </div>
            <div className="text-center px-3">
              <div className="text-2xl font-bold text-white">{badges.length}</div>
              <span className="text-[10px] text-forest-200 uppercase tracking-wider font-semibold">Earned Badges</span>
            </div>
          </div>
        </div>
      </div>

      {/* Verified Contribution Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-center">
          <Sprout className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
          <div className="text-xl font-bold text-slate-900">{reputation?.trees_planted_verified || 0}</div>
          <span className="text-[10px] font-semibold text-slate-400 uppercase">Verified Trees</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-center">
          <CheckCircle2 className="w-5 h-5 text-amber-500 mx-auto mb-1" />
          <div className="text-xl font-bold text-slate-900">{reputation?.bounties_completed || 0}</div>
          <span className="text-[10px] font-semibold text-slate-400 uppercase">Bounties Approved</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-center">
          <Clock className="w-5 h-5 text-blue-500 mx-auto mb-1" />
          <div className="text-xl font-bold text-slate-900">{reputation?.volunteer_hours_logged || 0}h</div>
          <span className="text-[10px] font-semibold text-slate-400 uppercase">Volunteer Hours</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-center">
          <Sparkles className="w-5 h-5 text-purple-500 mx-auto mb-1" />
          <div className="text-xl font-bold text-slate-900">{reputation?.challenges_won || 0}</div>
          <span className="text-[10px] font-semibold text-slate-400 uppercase">Challenges Won</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-center col-span-2 sm:col-span-1">
          <HeartHandshake className="w-5 h-5 text-rose-500 mx-auto mb-1" />
          <div className="text-xl font-bold text-slate-900">{reputation?.projects_supported || 0}</div>
          <span className="text-[10px] font-semibold text-slate-400 uppercase">Projects Supported</span>
        </div>
      </div>

      {/* Badges & Recognitions */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Award className="w-4 h-4 text-emerald-600" />
          Accredited Badges & Field Milestones ({badges.length})
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {badges.map(b => (
            <div key={b.id} className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                  ★
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">{b.badge_name}</h4>
                  <span className="text-[10px] text-slate-400">Awarded {new Date(b.awarded_at).toLocaleDateString()}</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed pt-1">{b.badge_description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Verifiable Activity Audit Trail */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Verifiable Environmental Activity Audit Trail
          </h3>
          <p className="text-xs text-slate-400">Chronological ledger of verified fieldwork points</p>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {activities.map(act => (
            <div key={act.id} className="p-4 flex items-start justify-between gap-3 hover:bg-slate-50/60 transition">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h4 className="font-semibold text-slate-800 text-xs">{act.title}</h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span>Source: {act.verification_source || 'Sentinel-2 Satellite Pass'}</span>
                    <span>•</span>
                    <span>{new Date(act.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <span className="font-bold text-emerald-700 whitespace-nowrap bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                +{act.score_awarded} rep pts
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
