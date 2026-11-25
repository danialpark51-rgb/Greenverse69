import React, { useState, useEffect } from 'react';
import {
  Sparkles, CheckCircle2, AlertCircle, ArrowRight, UserCheck,
  Target, Briefcase, GraduationCap, Edit3, Save, Loader2
} from 'lucide-react';
import {
  fetchUserSkillProfile,
  saveUserSkillProfile,
  calculateSkillMatches,
  fetchGigs,
  fetchOpportunities
} from '../../services/economyService';
import { UserSkillProfile, SkillMatchResult } from '../../types/economy';

interface SkillsMatcherHubProps {
  currentUserId?: string;
  currentUserName?: string;
}

const COMMON_SKILLS = [
  'Tree planting',
  'Soil preparation',
  'GIS & mapping',
  'Environmental science',
  'Community outreach',
  'Data collection',
  'Photography',
  'Education & training',
  'Field leadership',
  'Irrigation setup',
  'Waste auditing',
  'Biodiversity survey'
];

export const SkillsMatcherHub: React.FC<SkillsMatcherHubProps> = ({ currentUserId, currentUserName }) => {
  const [profile, setProfile] = useState<UserSkillProfile | null>(null);
  const [matches, setMatches] = useState<SkillMatchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Edit form state
  const [formHeadline, setFormHeadline] = useState('');
  const [formBio, setFormBio] = useState('');
  const [formLevel, setFormLevel] = useState<'beginner' | 'intermediate' | 'advanced' | 'expert'>('intermediate');
  const [formAvailability, setFormAvailability] = useState<'full_time' | 'part_time' | 'weekends' | 'flexible'>('flexible');
  const [formJobType, setFormJobType] = useState<'remote' | 'on_site' | 'hybrid'>('remote');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [customSkillInput, setCustomSkillInput] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const p = await fetchUserSkillProfile(currentUserId || 'demo-user');
      setProfile(p);
      setFormHeadline(p.headline || '');
      setFormBio(p.bio || '');
      setFormLevel(p.experience_level);
      setFormAvailability(p.availability);
      setFormJobType(p.preferred_job_type);
      setSelectedSkills(p.skills);

      const [gigs, opps] = await Promise.all([fetchGigs(), fetchOpportunities()]);
      const matchResults = calculateSkillMatches(p, gigs, opps);
      setMatches(matchResults);
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUserId]);

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handleAddCustomSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customSkillInput.trim()) {
      e.preventDefault();
      if (!selectedSkills.includes(customSkillInput.trim())) {
        setSelectedSkills(prev => [...prev, customSkillInput.trim()]);
      }
      setCustomSkillInput('');
    }
  };

  const handleSaveProfile = async () => {
    const updated = await saveUserSkillProfile(
      {
        headline: formHeadline,
        bio: formBio,
        experience_level: formLevel,
        availability: formAvailability,
        preferred_job_type: formJobType,
        skills: selectedSkills,
      },
      currentUserId || 'demo-user'
    );
    setProfile(updated);
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);

    const [gigs, opps] = await Promise.all([fetchGigs(), fetchOpportunities()]);
    setMatches(calculateSkillMatches(updated, gigs, opps));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mr-2" />
        <span className="text-sm text-slate-600">Calculating opportunity matches...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-lime-600" />
          Skills-to-Jobs & Opportunities Matcher
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Match your verified environmental skills with active gigs, bounties, and grants with transparent match scoring.
        </p>
      </div>

      {/* Profile Card & Skill Selector */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              {profile?.full_name || currentUserName || 'Your Environmental Profile'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{profile?.headline || 'Environmental Practitioner'}</p>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition w-fit"
          >
            <Edit3 className="w-3.5 h-3.5" />
            {isEditing ? 'Cancel Editing' : 'Edit Skill Profile'}
          </button>
        </div>

        {saveSuccess && (
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Skill profile updated! Recalculated your opportunity match scores.
          </div>
        )}

        {isEditing ? (
          <div className="space-y-3 text-xs pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Headline</label>
                <input
                  type="text"
                  value={formHeadline}
                  onChange={e => setFormHeadline(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-medium mb-1">Experience Level</label>
                <select
                  value={formLevel}
                  onChange={e => setFormLevel(e.target.value as any)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-medium mb-1">Preferred Location</label>
                <select
                  value={formJobType}
                  onChange={e => setFormJobType(e.target.value as any)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="remote">Remote Only</option>
                  <option value="on_site">On-Site Fieldwork</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Select Your Skills</label>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_SKILLS.map(skill => {
                  const isSelected = selectedSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-600 font-semibold'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300'
                      }`}
                    >
                      {skill} {isSelected ? '✓' : '+'}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Add Custom Skill (Press Enter)</label>
              <input
                type="text"
                placeholder="Type and press Enter to add..."
                value={customSkillInput}
                onChange={e => setCustomSkillInput(e.target.value)}
                onKeyDown={handleAddCustomSkill}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleSaveProfile}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition"
              >
                <Save className="w-3.5 h-3.5" />
                Save & Recalculate Matches
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Active Skills:</span>
            {profile?.skills.map((s, i) => (
              <span key={i} className="text-xs bg-emerald-50 text-emerald-800 font-medium px-2.5 py-0.5 rounded-full border border-emerald-200">
                {s}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Matched Opportunities Feed */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm">
            Top Matched Gigs & Opportunities ({matches.length})
          </h3>
          <span className="text-[11px] text-slate-400">Sorted by skill alignment</span>
        </div>

        <div className="space-y-3">
          {matches.map(m => (
            <div
              key={m.target_id}
              className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-emerald-400 transition space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {m.target_type}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">{m.target_title}</h4>
                  </div>
                  <ul className="text-xs text-slate-600 space-y-0.5">
                    {m.matching_reasons.map((r, i) => (
                      <li key={i} className="flex items-center gap-1 text-slate-600">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="text-right shrink-0">
                  <div className={`text-xl font-bold ${
                    m.match_percentage >= 75 ? 'text-emerald-700' : m.match_percentage >= 50 ? 'text-amber-600' : 'text-slate-500'
                  }`}>
                    {m.match_percentage}%
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium uppercase">Match Score</span>
                </div>
              </div>

              {m.missing_skills.length > 0 && (
                <div className="bg-amber-50/70 border border-amber-200/70 rounded-xl p-2.5 text-xs text-amber-800 flex items-start gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Missing Skill Recommendation:</span>{' '}
                    {m.recommendation}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
