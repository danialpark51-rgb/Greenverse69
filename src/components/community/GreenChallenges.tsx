import React, { useState, useEffect } from 'react';
import { DbGreenChallenge, ChallengeDifficulty } from '../../types/community';
import { fetchChallenges, toggleJoinChallenge, incrementChallengeProgress } from '../../services/communityService';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import {
  Trophy,
  Target,
  CheckCircle2,
  Calendar,
  Award,
  Sparkles,
  Users,
  Flame,
  ArrowRight,
  Loader2,
  Plus
} from 'lucide-react';

export const GreenChallenges: React.FC = () => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<DbGreenChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    const res = await fetchChallenges({ category: selectedCategory, userId: user?.id });
    setChallenges(res.data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory]);

  const handleToggleJoin = async (chal: DbGreenChallenge) => {
    const res = await toggleJoinChallenge(chal.id, user?.id);
    setChallenges((prev) =>
      prev.map((c) =>
        c.id === chal.id
          ? {
              ...c,
              participants_count: c.participants_count + (res.isJoined ? 1 : -1),
              userParticipation: res.isJoined
                ? { status: 'in_progress', current_progress: res.currentProgress, joined_at: new Date().toISOString() }
                : null,
            }
          : c
      )
    );
    setFeedback(res.isJoined ? `Joined "${chal.title}"!` : `Left challenge.`);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleIncrement = async (chal: DbGreenChallenge) => {
    const res = await incrementChallengeProgress(chal.id, user?.id, 1);
    setChallenges((prev) =>
      prev.map((c) =>
        c.id === chal.id && c.userParticipation
          ? {
              ...c,
              userParticipation: {
                ...c.userParticipation,
                current_progress: res.progress,
                status: res.completed ? 'completed' : 'in_progress',
              },
            }
          : c
      )
    );
    if (res.completed) {
      setFeedback(`🏆 Challenge Completed! Earned ${chal.reward_points} green points and the ${chal.reward_badge} badge!`);
    } else {
      setFeedback(`Progress updated: ${res.progress}/${chal.target_value} logged!`);
    }
    setTimeout(() => setFeedback(null), 4000);
  };

  const difficultyVariant = (d: ChallengeDifficulty): 'emerald' | 'forest' | 'amber' | 'rose' => {
    if (d === 'Beginner') return 'emerald';
    if (d === 'Intermediate') return 'forest';
    if (d === 'Advanced') return 'amber';
    return 'rose';
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Trophy className="w-5 h-5 text-forest-700" />
            Green Challenges & Action Milestones
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Take on structured environmental sprints, submit verified stewardship records, and unlock community badges.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="emerald" dot>Real Participation Auditing</Badge>
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {['All', 'Tree planting', 'Water conservation', 'Biodiversity', 'Waste management'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-forest-800 text-white font-semibold'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Challenge Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center p-12 text-slate-400 gap-2 text-xs">
          <Loader2 className="w-5 h-5 animate-spin text-forest-600" />
          Loading active green challenges...
        </div>
      ) : challenges.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-xl border border-sage-200">
          No active challenges found in this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {challenges.map((chal) => {
            const part = chal.userParticipation;
            const isCompleted = part?.status === 'completed';
            const progressPct = part ? Math.min(100, Math.round((part.current_progress / chal.target_value) * 100)) : 0;

            return (
              <Card
                key={chal.id}
                className={`overflow-hidden border transition-all flex flex-col justify-between ${
                  isCompleted
                    ? 'border-emerald-300 bg-emerald-50/20'
                    : part
                    ? 'border-forest-400 shadow-xs'
                    : 'border-sage-200 hover:border-forest-300'
                }`}
              >
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <Badge variant={difficultyVariant(chal.difficulty)} size="sm">
                        {chal.difficulty}
                      </Badge>
                      <Badge variant="forest" size="sm">
                        {chal.duration_days} Days
                      </Badge>
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-xs font-bold text-forest-800">
                        +{chal.reward_points} PTS
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">
                      {chal.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                      {chal.description}
                    </p>
                  </div>

                  {/* Reward Badge Preview */}
                  <div className="p-2.5 bg-sage-50/70 rounded-xl border border-sage-200 flex items-center justify-between text-xs">
                    <span className="text-slate-600 flex items-center gap-1.5 text-[11px]">
                      <Award className="w-3.5 h-3.5 text-amber-600" />
                      Badge: <strong className="text-slate-900 font-semibold">{chal.reward_badge}</strong>
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {chal.participants_count} Joined
                    </span>
                  </div>

                  {/* Active User Progress */}
                  {part && (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-600">Your Progress:</span>
                        <span className="font-mono text-forest-800">
                          {part.current_progress} / {chal.target_value} ({chal.target_metric})
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isCompleted ? 'bg-emerald-600' : 'bg-forest-600'
                          }`}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>

                {/* Card Actions */}
                <div className="p-4 pt-0 border-t border-slate-50 flex items-center justify-between gap-2">
                  {part ? (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-rose-600 hover:text-rose-800"
                        onClick={() => handleToggleJoin(chal)}
                      >
                        Leave
                      </Button>

                      {!isCompleted ? (
                        <Button
                          variant="primary"
                          size="sm"
                          className="text-xs"
                          onClick={() => handleIncrement(chal)}
                          icon={<Plus className="w-3.5 h-3.5" />}
                        >
                          Log Progress (+1)
                        </Button>
                      ) : (
                        <Badge variant="emerald" size="sm">
                          Completed ✓
                        </Badge>
                      )}
                    </>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => handleToggleJoin(chal)}
                    >
                      Accept Challenge
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
