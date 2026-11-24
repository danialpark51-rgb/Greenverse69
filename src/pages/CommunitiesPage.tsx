import React, { useState } from 'react';
import { MOCK_SQUADS, MOCK_MISSIONS } from '../data/mockData';
import { Squad } from '../types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { SearchInput } from '../components/common/SearchInput';
import { Modal } from '../components/common/Modal';
import {
  Users,
  Trophy,
  TreeDeciduous,
  Heart,
  PlusCircle,
  MapPin,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const CommunitiesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);
  const [squadsList, setSquadsList] = useState(MOCK_SQUADS);

  // New squad form state
  const [newSquadName, setNewSquadName] = useState('');
  const [newSquadChapter, setNewSquadChapter] = useState('');
  const [newSquadTagline, setNewSquadTagline] = useState('');

  const filteredSquads = squadsList.filter(
    (sq) =>
      sq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sq.chapter.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateSquad = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateSuccess(true);
    setTimeout(() => {
      setSquadsList([
        {
          id: `sq-${Date.now()}`,
          name: newSquadName || 'Northern Rewilding Cohort',
          tagline: newSquadTagline || 'Community reforestation & seed harvesting.',
          chapter: newSquadChapter || 'Regional Hub',
          membersCount: 1,
          treesPlanted: 0,
          survivalRate: 100,
          rank: squadsList.length + 1,
          badge: 'Initiate Reforester',
          avatar: '🌱',
        },
        ...squadsList,
      ]);
      setCreateSuccess(false);
      setIsCreateModalOpen(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-forest-700" />
            Eco-Communities & Planting Squads
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Join local neighborhood chapters, participate in competitive planting sprints, and earn collective eco-badges.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            icon={<PlusCircle className="w-4 h-4" />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Create a Squad
          </Button>
        </div>
      </div>

      {/* Leaderboard Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-forest-deep via-forest-rich to-forest-moss text-white flex flex-col md:flex-row md:items-center justify-between gap-6 border border-forest-moss/60">
        <div className="space-y-1">
          <div className="text-[10px] uppercase font-bold text-lime-400 tracking-wider flex items-center gap-1.5">
            <Trophy className="w-4 h-4" /> Global Community Standings
          </div>
          <h2 className="text-xl font-bold text-white">42 Verified Chapters Active Worldwide</h2>
          <p className="text-xs text-forest-200">
            Over <strong className="text-white">147,900 trees</strong> planted collectively by volunteer squads this season alone.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-forest-rich/80 px-4 py-3 rounded-xl border border-forest-emerald/40 text-xs shrink-0">
          <div>
            <div className="text-forest-300 text-[10px]">Your Squad:</div>
            <div className="font-bold text-white text-sm">Cascadia Canopy Guardians</div>
          </div>
          <div className="h-8 w-px bg-forest-moss/60" />
          <div>
            <div className="text-forest-300 text-[10px]">Global Rank:</div>
            <div className="font-bold text-lime-400 text-sm">#1 Ranked</div>
          </div>
        </div>
      </div>

      {/* Squads Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="max-w-md w-full">
            <SearchInput
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClear={() => setSearchTerm('')}
              placeholder="Search squads by name or regional chapter..."
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Showing {filteredSquads.length} eco-squads
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSquads.map((squad) => (
            <Card key={squad.id} hoverEffect className="overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-forest-100 flex items-center justify-center text-2xl shadow-sm border border-forest-200">
                      {squad.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900">{squad.name}</h3>
                        <Badge variant="forest" size="sm">#{squad.rank}</Badge>
                      </div>
                      <p className="text-xs text-slate-500">{squad.chapter}</p>
                    </div>
                  </div>

                  <Badge variant="lime" size="sm">{squad.badge}</Badge>
                </div>

                <p className="text-xs text-slate-600 mt-3 leading-relaxed">{squad.tagline}</p>

                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <div className="text-[10px] text-slate-400">Members</div>
                    <div className="font-bold text-slate-800">{squad.membersCount}</div>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <div className="text-[10px] text-slate-400">Trees Planted</div>
                    <div className="font-bold text-forest-700">{squad.treesPlanted.toLocaleString()}</div>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <div className="text-[10px] text-slate-400">Survival Rate</div>
                    <div className="font-bold text-emerald-700">{squad.survivalRate}%</div>
                  </div>
                </div>

                <div className="mt-4 flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => alert(`Joined ${squad.name}! Welcome to the squad.`)}
                  >
                    Join Squad
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Create Squad Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Form New Eco-Planting Squad"
        description="Rally local neighbors, organize tree care patrols, and compete on the global leaderboard."
      >
        {createSuccess ? (
          <div className="py-6 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-slate-900">Eco-Squad Created!</h4>
            <p className="text-xs text-slate-500">Your squad is now live on the Greenverse planetary roster.</p>
          </div>
        ) : (
          <form onSubmit={handleCreateSquad} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Squad Name</label>
              <input
                type="text"
                required
                value={newSquadName}
                onChange={(e) => setNewSquadName(e.target.value)}
                placeholder="e.g. River Bend Rewilders"
                className="w-full px-3 py-2 border border-sage-300 rounded-lg bg-white text-slate-800"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Regional Chapter</label>
              <input
                type="text"
                required
                value={newSquadChapter}
                onChange={(e) => setNewSquadChapter(e.target.value)}
                placeholder="e.g. Twin Cities Metro, MN"
                className="w-full px-3 py-2 border border-sage-300 rounded-lg bg-white text-slate-800"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Squad Tagline & Mission Focus</label>
              <textarea
                rows={3}
                required
                value={newSquadTagline}
                onChange={(e) => setNewSquadTagline(e.target.value)}
                placeholder="Describe your target rewilding zone or planting focus..."
                className="w-full px-3 py-2 border border-sage-300 rounded-lg bg-white text-slate-800"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Register Squad
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
