import React, { useState, useEffect } from 'react';
import {
  Award, Lock, CheckCircle2, Sparkles, Sprout, ShieldAlert,
  TreeDeciduous, HeartHandshake, ShieldCheck, Star, Loader2
} from 'lucide-react';
import { fetchUserAchievements } from '../../services/impactService';
import { UserAchievement, AchievementCategory } from '../../types/impact';

interface GreenAchievementsCenterProps {
  currentUserId?: string;
}

const CATEGORIES: { key: AchievementCategory | 'all'; label: string }[] = [
  { key: 'all', label: 'All Achievements' },
  { key: 'tree_planting', label: 'Planting' },
  { key: 'tree_care', label: 'Tree Care' },
  { key: 'bounties', label: 'Bounties' },
  { key: 'tree_protection', label: 'Protection' },
  { key: 'biodiversity', label: 'Biodiversity' },
];

export const GreenAchievementsCenter: React.FC<GreenAchievementsCenterProps> = ({ currentUserId }) => {
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState<string>('all');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchUserAchievements(currentUserId);
        setAchievements(data);
      } catch {
        // handled
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentUserId]);

  const filtered = selectedCat === 'all'
    ? achievements
    : achievements.filter(a => a.category === selectedCat);

  const unlockedCount = achievements.filter(a => a.is_unlocked).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            Green Achievements & Milestone Badges
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Earn permanent recognition and unlock badges through verified environmental action.
          </p>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl text-xs text-emerald-800 font-semibold w-fit">
          Unlocked: {unlockedCount} of {achievements.length} Badges
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {CATEGORIES.map(c => (
          <button
            key={c.key}
            onClick={() => setSelectedCat(c.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedCat === c.key
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Achievements Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mr-2" />
          <span className="text-sm text-slate-600">Loading achievements...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(ach => {
            const pct = Math.min(100, Math.round((ach.progress_current / ach.progress_target) * 100));

            return (
              <div
                key={ach.id}
                className={`rounded-2xl p-5 border transition flex flex-col justify-between ${
                  ach.is_unlocked
                    ? 'bg-white border-emerald-300 shadow-sm'
                    : 'bg-slate-50/70 border-slate-200 opacity-80'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
                      ach.is_unlocked
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-200 text-slate-400'
                    }`}>
                      {ach.is_unlocked ? '★' : <Lock className="w-4 h-4 text-slate-400" />}
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {ach.tier}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm mb-1">{ach.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">{ach.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <span>Progress: {ach.progress_current}/{ach.progress_target}</span>
                    <span className={ach.is_unlocked ? 'text-emerald-700 font-bold' : 'text-slate-400'}>
                      {ach.is_unlocked ? 'Unlocked' : `${pct}%`}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        ach.is_unlocked ? 'bg-emerald-600' : 'bg-slate-400'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
