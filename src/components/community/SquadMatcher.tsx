import React, { useState, useEffect } from 'react';
import { DbSquad, EnvironmentalSkill, SquadRole } from '../../types/community';
import { fetchSquads, createSquad, toggleJoinSquad } from '../../services/communityService';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { SearchInput } from '../common/SearchInput';
import { Modal } from '../common/Modal';
import {
  Users,
  Compass,
  CheckCircle2,
  PlusCircle,
  Sparkles,
  MapPin,
  Trees,
  Award,
  Search,
  Target,
  Loader2,
  ShieldCheck
} from 'lucide-react';

const SKILLS_LIST: EnvironmentalSkill[] = [
  'Tree planting',
  'Gardening',
  'Wildlife protection',
  'Waste recycling',
  'Event organizing',
  'Photography',
  'Community organizing',
  'Environmental research',
  'GIS/maps',
  'Education and awareness',
];

export const SquadMatcher: React.FC = () => {
  const { user } = useAuth();
  const [squads, setSquads] = useState<DbSquad[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkill, setSelectedSkill] = useState<string>('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedSquad, setSelectedSquad] = useState<DbSquad | null>(null);

  // Matcher state (find teammates by interest/skill)
  const [matcherSkill, setMatcherSkill] = useState<EnvironmentalSkill>('Tree planting');

  // Form state
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [locationName, setLocationName] = useState('');
  const [goals, setGoals] = useState('');
  const [skillsNeeded, setSkillsNeeded] = useState<EnvironmentalSkill[]>(['Tree planting']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    const res = await fetchSquads({
      search: searchTerm,
      skill: selectedSkill,
      userId: user?.id,
    });
    setSquads(res.data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [searchTerm, selectedSkill]);

  const handleToggleSkillSelection = (skill: EnvironmentalSkill) => {
    setSkillsNeeded((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setFeedback(null);
    const res = await createSquad(
      {
        name,
        tagline,
        location_name: locationName,
        goals,
        skills_needed: skillsNeeded,
      },
      user?.id
    );
    setIsSubmitting(false);

    if (res.data) {
      setSquads((prev) => [res.data!, ...prev]);
      setIsCreateModalOpen(false);
      setName('');
      setTagline('');
      setLocationName('');
      setGoals('');
      setFeedback('New environmental squad founded and recruiting!');
      setTimeout(() => setFeedback(null), 3500);
    }
  };

  const handleToggleJoin = async (squad: DbSquad) => {
    const res = await toggleJoinSquad(squad.id, user?.id, ['Tree planting']);
    setSquads((prev) =>
      prev.map((s) =>
        s.id === squad.id
          ? { ...s, isJoined: res.isJoined, members_count: res.membersCount, userRole: res.isJoined ? 'member' : null }
          : s
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-forest-700" />
            Squad Matcher & Environmental Teammate Discovery
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Match with local planting squads, connect with specialized ecological skillsets, and collaborate on field expeditions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            icon={<PlusCircle className="w-4 h-4" />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Form a Squad
          </Button>
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Smart Skill Matcher Banner */}
      <div className="p-4 bg-gradient-to-r from-forest-deep via-forest-rich to-forest-moss text-white rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-[10px] uppercase font-bold text-lime-400 tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Skill-Based Teammate Matching
          </div>
          <h3 className="text-base font-bold text-white">Find Squads Seeking Your Environmental Specialty</h3>
          <p className="text-xs text-forest-200">
            Select a skill to filter squads currently recruiting field operators.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
            className="border border-forest-moss rounded-lg px-3 py-1.5 text-xs bg-forest-900/90 text-white focus:outline-none focus:ring-2 focus:ring-lime-400"
          >
            <option value="All">All Skill Requirements</option>
            {SKILLS_LIST.map((sk) => (
              <option key={sk} value={sk}>{sk}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Search Input */}
      <div className="max-w-md w-full">
        <SearchInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onClear={() => setSearchTerm('')}
          placeholder="Search squads by name, location or focus..."
        />
      </div>

      {/* Squad Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center p-12 text-slate-400 gap-2 text-xs">
          <Loader2 className="w-5 h-5 animate-spin text-forest-600" />
          Finding active planting squads...
        </div>
      ) : squads.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-dashed border-sage-300 space-y-3">
          <Users className="w-10 h-10 text-sage-400 mx-auto" />
          <div className="text-sm font-semibold text-slate-700">No squads match your filters</div>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try resetting your skill filter or form a new squad to recruit local stewards.
          </p>
          <Button variant="outline" size="sm" onClick={() => setSelectedSkill('All')}>
            Reset Skill Filter
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {squads.map((sq) => (
            <Card
              key={sq.id}
              className="border border-sage-200 hover:border-forest-400 hover:shadow-soft transition-all flex flex-col justify-between"
            >
              <CardContent className="p-5 space-y-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl p-2 bg-sage-50 rounded-xl border border-sage-200 shrink-0">
                      {sq.avatar}
                    </span>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{sq.name}</h3>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-forest-700 shrink-0" />
                        <span className="truncate max-w-[150px]">{sq.location_name}</span>
                      </div>
                    </div>
                  </div>

                  <Badge variant={sq.is_recruiting ? 'emerald' : 'forest'} size="sm">
                    {sq.is_recruiting ? 'Recruiting' : 'Full'}
                  </Badge>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2">{sq.tagline}</p>

                {/* Skills Needed Tags */}
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-1.5">
                    Recruiting Skills:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {sq.skills_needed.map((sk) => (
                      <span
                        key={sk}
                        className="px-2 py-0.5 bg-forest-50 text-forest-800 rounded-md text-[10px] font-medium border border-forest-100"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Metrics */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>{sq.members_count} / {sq.max_members} members</span>
                  <span className="font-bold text-forest-800">{sq.trees_planted} trees planted</span>
                </div>
              </CardContent>

              {/* Action Buttons */}
              <div className="p-4 pt-0 border-t border-slate-50 flex items-center justify-between gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-slate-600"
                  onClick={() => setSelectedSquad(sq)}
                >
                  Squad Goals
                </Button>

                <Button
                  variant={sq.isJoined ? 'outline' : 'primary'}
                  size="sm"
                  className="text-xs"
                  onClick={() => handleToggleJoin(sq)}
                >
                  {sq.isJoined ? 'Enrolled ✓' : 'Join Squad'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Squad Profile & Goals Modal */}
      {selectedSquad && (
        <Modal
          isOpen={!!selectedSquad}
          onClose={() => setSelectedSquad(null)}
          title={selectedSquad.name}
          description={`Led by ${selectedSquad.leader_name || 'Squad Lead'} · ${selectedSquad.location_name}`}
        >
          <div className="space-y-4 text-xs py-1">
            <p className="text-slate-700 leading-relaxed">{selectedSquad.tagline}</p>

            <div className="p-3 bg-forest-50 border border-forest-200 rounded-xl space-y-1">
              <span className="font-semibold text-forest-900 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-forest-700" />
                Team Objectives & Milestones:
              </span>
              <p className="text-slate-600">{selectedSquad.goals}</p>
            </div>

            <div>
              <span className="font-semibold text-slate-800 block mb-1">Environmental Interests:</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedSquad.environmental_interests.map((int, i) => (
                  <Badge key={i} variant="forest" size="sm">{int}</Badge>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant={selectedSquad.isJoined ? 'outline' : 'primary'}
                size="sm"
                onClick={() => {
                  handleToggleJoin(selectedSquad);
                  setSelectedSquad(null);
                }}
              >
                {selectedSquad.isJoined ? 'Leave Squad' : 'Join Squad'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Form a Squad Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Form an Environmental Squad"
        description="Establish an agile field team to tackle regional rewilding or urban canopy goals."
      >
        <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Squad Name <span className="text-rose-500">*</span></label>
            <input
              type="text"
              placeholder="e.g. Cascadia Old Growth Guardians"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-sage-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-forest-500"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Tagline / Mission</label>
            <input
              type="text"
              placeholder="e.g. Protecting old-growth buffers and restoring salmon river corridors"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full border border-sage-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-forest-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Operating Location</label>
            <input
              type="text"
              placeholder="e.g. Skykomish River Basin, WA"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className="w-full border border-sage-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-forest-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Squad Team Goals</label>
            <textarea
              rows={2}
              placeholder="e.g. Plant 1,500 western red cedars and maintain 90%+ sapling survival."
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              className="w-full border border-sage-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-forest-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">Required Skills (Select applicable)</label>
            <div className="grid grid-cols-2 gap-1.5">
              {SKILLS_LIST.map((sk) => {
                const active = skillsNeeded.includes(sk);
                return (
                  <div
                    key={sk}
                    onClick={() => handleToggleSkillSelection(sk)}
                    className={`p-2 rounded-lg border cursor-pointer text-[11px] flex items-center justify-between ${
                      active ? 'bg-forest-50 border-forest-400 font-medium text-forest-900' : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <span>{sk}</span>
                    <input type="checkbox" checked={active} onChange={() => {}} className="rounded text-forest-700" />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
              Establish Squad
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
