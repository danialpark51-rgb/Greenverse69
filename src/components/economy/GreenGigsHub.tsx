import React, { useState, useEffect } from 'react';
import {
  Briefcase, Search, Filter, MapPin, DollarSign, Clock, CheckCircle2, Bookmark,
  PlusCircle, ExternalLink, AlertCircle, Loader2, Send, X, ShieldCheck
} from 'lucide-react';
import { fetchGigs, createGig, applyForGig, toggleBookmarkGig } from '../../services/economyService';
import { GreenGig, GigCategory, GigCompensationType, GigJobType, GigLocationType } from '../../types/economy';

interface GreenGigsHubProps {
  currentUserId?: string;
  currentUserName?: string;
}

const CATEGORIES: { key: GigCategory | 'all'; label: string }[] = [
  { key: 'all', label: 'All Categories' },
  { key: 'tree_planting_restoration', label: 'Tree Planting & Restoration' },
  { key: 'environmental_research', label: 'Environmental Research' },
  { key: 'sustainability_consulting', label: 'Sustainability Consulting' },
  { key: 'wildlife_biodiversity', label: 'Wildlife & Biodiversity' },
  { key: 'waste_recycling', label: 'Waste Management & Circularity' },
  { key: 'climate_action', label: 'Climate Action' },
  { key: 'renewable_energy', label: 'Renewable Energy' },
  { key: 'gis_mapping', label: 'GIS & Mapping' },
  { key: 'environmental_education', label: 'Environmental Education' },
  { key: 'community_outreach', label: 'Community Outreach' },
];

export const GreenGigsHub: React.FC<GreenGigsHubProps> = ({ currentUserId, currentUserName }) => {
  const [gigs, setGigs] = useState<GreenGig[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCompType, setSelectedCompType] = useState<string>('all');
  const [selectedJobType, setSelectedJobType] = useState<string>('all');
  const [selectedLocationType, setSelectedLocationType] = useState<string>('all');

  // Detail & Apply Modal State
  const [activeGig, setActiveGig] = useState<GreenGig | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyForm, setApplyForm] = useState({
    applicant_name: currentUserName || '',
    applicant_email: '',
    experience_summary: '',
    portfolio_url: '',
    skills_text: '',
    cover_note: '',
  });
  const [applyLoading, setApplyLoading] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  // Create Gig Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    category: 'tree_planting_restoration' as GigCategory,
    compensation_type: 'paid' as GigCompensationType,
    compensation_amount: 30,
    compensation_currency: 'USD',
    compensation_frequency: 'hourly' as 'hourly' | 'monthly' | 'project' | 'one_time',
    job_type: 'contract' as GigJobType,
    location_type: 'on_site' as GigLocationType,
    location_name: '',
    deadline: '',
    description: '',
    responsibilities_text: '',
    requirements_text: '',
    skills_text: '',
  });
  const [createLoading, setCreateLoading] = useState(false);

  const loadGigs = async () => {
    setLoading(true);
    try {
      const data = await fetchGigs({
        search: searchTerm,
        category: selectedCategory,
        compensationType: selectedCompType,
        jobType: selectedJobType,
        locationType: selectedLocationType,
      });
      setGigs(data);
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGigs();
  }, [searchTerm, selectedCategory, selectedCompType, selectedJobType, selectedLocationType]);

  const handleApply = async () => {
    if (!activeGig) return;
    setApplyLoading(true);
    setApplyError(null);
    try {
      const skillsArray = applyForm.skills_text
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      await applyForGig(
        activeGig.id,
        {
          applicant_name: applyForm.applicant_name,
          applicant_email: applyForm.applicant_email,
          experience_summary: applyForm.experience_summary,
          portfolio_url: applyForm.portfolio_url,
          skills: skillsArray,
          cover_note: applyForm.cover_note,
        },
        currentUserId
      );

      setApplySuccess(true);
      setTimeout(() => {
        setApplySuccess(false);
        setShowApplyModal(false);
        loadGigs();
      }, 1800);
    } catch (err: any) {
      setApplyError(err?.message || 'Failed to submit application.');
    } finally {
      setApplyLoading(false);
    }
  };

  const handleCreateGig = async () => {
    setCreateLoading(true);
    try {
      await createGig(
        {
          ...createForm,
          responsibilities: createForm.responsibilities_text.split('\n').map(s => s.trim()).filter(Boolean),
          requirements: createForm.requirements_text.split('\n').map(s => s.trim()).filter(Boolean),
          required_skills: createForm.skills_text.split(',').map(s => s.trim()).filter(Boolean),
        },
        currentUserId,
        currentUserName || 'Greenverse Organizer'
      );
      setShowCreateModal(false);
      loadGigs();
    } catch {
      // handled
    } finally {
      setCreateLoading(false);
    }
  };

  const handleBookmark = async (e: React.MouseEvent, gigId: string) => {
    e.stopPropagation();
    await toggleBookmarkGig(gigId);
    setGigs(prev => prev.map(g => g.id === gigId ? { ...g, is_bookmarked: !g.is_bookmarked } : g));
  };

  return (
    <div className="space-y-6">
      {/* Header & Post Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-emerald-600" />
            Green Gigs & Environmental Employment
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Discover paid contracts, ecological fieldwork, and sustainable freelance opportunities.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition shadow-sm w-fit"
        >
          <PlusCircle className="w-4 h-4" />
          Post a Green Gig
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search gigs by title, skill, employer, or keyword..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1">
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="text-xs px-3 py-2 border border-slate-200 rounded-lg text-slate-700 bg-white"
          >
            {CATEGORIES.map(c => (
              <option key={c.key} value={c.key}>{c.label}</option>
            ))}
          </select>
          <select
            value={selectedCompType}
            onChange={e => setSelectedCompType(e.target.value)}
            className="text-xs px-3 py-2 border border-slate-200 rounded-lg text-slate-700 bg-white"
          >
            <option value="all">All Compensations</option>
            <option value="paid">Paid Gigs Only</option>
            <option value="unpaid_stipend">Stipend Supported</option>
            <option value="volunteer">Volunteer Experience</option>
          </select>
          <select
            value={selectedJobType}
            onChange={e => setSelectedJobType(e.target.value)}
            className="text-xs px-3 py-2 border border-slate-200 rounded-lg text-slate-700 bg-white"
          >
            <option value="all">All Job Types</option>
            <option value="contract">Contract / Freelance</option>
            <option value="full_time">Full-Time</option>
            <option value="part_time">Part-Time</option>
            <option value="internship">Internship</option>
          </select>
          <select
            value={selectedLocationType}
            onChange={e => setSelectedLocationType(e.target.value)}
            className="text-xs px-3 py-2 border border-slate-200 rounded-lg text-slate-700 bg-white"
          >
            <option value="all">All Locations</option>
            <option value="remote">Remote Only</option>
            <option value="on_site">On-Site Fieldwork</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>
      </div>

      {/* Gigs List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mr-2" />
          <span className="text-sm text-slate-600">Loading green gigs...</span>
        </div>
      ) : gigs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8">
          <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-base font-semibold text-slate-800">No gigs matched your filter criteria</h3>
          <p className="text-xs text-slate-500 mt-1">Try resetting your filters or post a new opportunity.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {gigs.map(gig => (
            <div
              key={gig.id}
              onClick={() => setActiveGig(gig)}
              className="bg-white border border-slate-200 hover:border-emerald-500/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {gig.category.replace(/_/g, ' ')}
                  </span>
                  <button
                    onClick={e => handleBookmark(e, gig.id)}
                    className="text-slate-400 hover:text-amber-500 transition p-1"
                  >
                    <Bookmark className={`w-4 h-4 ${gig.is_bookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
                  </button>
                </div>
                <h3 className="font-semibold text-slate-900 text-sm line-clamp-2 mb-1 hover:text-emerald-700 transition">
                  {gig.title}
                </h3>
                <p className="text-xs text-slate-500 mb-3 font-medium">
                  {gig.employer_name}
                </p>
                <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                  {gig.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="flex items-center gap-1 font-semibold text-emerald-700">
                    <DollarSign className="w-3.5 h-3.5" />
                    {gig.compensation_type === 'paid'
                      ? `${gig.compensation_amount} ${gig.compensation_currency}/${gig.compensation_frequency}`
                      : gig.compensation_type === 'unpaid_stipend'
                      ? `Stipend ($${gig.compensation_amount})`
                      : 'Volunteer'}
                  </span>
                  <span className="flex items-center gap-1 text-slate-500">
                    <MapPin className="w-3.5 h-3.5" />
                    {gig.location_name || gig.location_type}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>{gig.job_type.replace('_', ' ')}</span>
                  <span>{gig.applications_count} applied</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {activeGig && !showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium">
                  {activeGig.category.replace(/_/g, ' ')}
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-2">{activeGig.title}</h2>
                <p className="text-xs text-slate-500 font-medium">{activeGig.employer_name}</p>
              </div>
              <button onClick={() => setActiveGig(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl text-xs">
              <div>
                <span className="text-slate-400 block">Compensation</span>
                <span className="font-semibold text-emerald-700">
                  ${activeGig.compensation_amount} {activeGig.compensation_currency}/{activeGig.compensation_frequency}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Role Type</span>
                <span className="font-semibold text-slate-700">{activeGig.job_type}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Location</span>
                <span className="font-semibold text-slate-700">{activeGig.location_name || activeGig.location_type}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Deadline</span>
                <span className="font-semibold text-slate-700">
                  {activeGig.deadline ? new Date(activeGig.deadline).toLocaleDateString() : 'Rolling'}
                </span>
              </div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-700">
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">About the Role</h4>
                <p className="leading-relaxed">{activeGig.description}</p>
              </div>

              {activeGig.responsibilities?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Core Responsibilities</h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    {activeGig.responsibilities.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
              )}

              {activeGig.requirements?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Candidate Requirements</h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    {activeGig.requirements.map((req, i) => <li key={i}>{req}</li>)}
                  </ul>
                </div>
              )}

              {activeGig.required_skills?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Desired Skills</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {activeGig.required_skills.map((s, i) => (
                      <span key={i} className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-100">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => setActiveGig(null)}
                className="px-4 py-2 text-xs text-slate-600 hover:text-slate-800"
              >
                Close
              </button>
              <button
                onClick={() => setShowApplyModal(true)}
                className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition"
              >
                <Send className="w-3.5 h-3.5" />
                Apply for this Gig
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Apply Modal */}
      {showApplyModal && activeGig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Apply for: {activeGig.title}</h3>
            {applySuccess ? (
              <div className="text-center py-6">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
                <p className="font-bold text-slate-800">Application Submitted!</p>
                <p className="text-xs text-slate-500 mt-1">The employer will review your profile directly.</p>
              </div>
            ) : (
              <>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={applyForm.applicant_name}
                      onChange={e => setApplyForm(p => ({ ...p, applicant_name: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Email Address *</label>
                    <input
                      type="email"
                      value={applyForm.applicant_email}
                      onChange={e => setApplyForm(p => ({ ...p, applicant_email: e.target.value }))}
                      placeholder="your@email.com"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Experience Summary *</label>
                    <textarea
                      rows={3}
                      value={applyForm.experience_summary}
                      onChange={e => setApplyForm(p => ({ ...p, experience_summary: e.target.value }))}
                      placeholder="Describe your relevant environmental restoration or field experience..."
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Portfolio or CV Link</label>
                    <input
                      type="url"
                      value={applyForm.portfolio_url}
                      onChange={e => setApplyForm(p => ({ ...p, portfolio_url: e.target.value }))}
                      placeholder="https://..."
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Relevant Skills (comma separated)</label>
                    <input
                      type="text"
                      value={applyForm.skills_text}
                      onChange={e => setApplyForm(p => ({ ...p, skills_text: e.target.value }))}
                      placeholder="Tree planting, GIS & mapping, Soil prep"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>

                {applyError && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {applyError}
                  </p>
                )}

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => setShowApplyModal(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApply}
                    disabled={applyLoading || !applyForm.applicant_name || !applyForm.applicant_email || !applyForm.experience_summary}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {applyLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Submit Application
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Create Gig Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-slate-900 text-base">Post a New Green Gig</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Gig Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Riparian Forest Restoration Lead"
                  value={createForm.title}
                  onChange={e => setCreateForm(p => ({ ...p, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Category</label>
                  <select
                    value={createForm.category}
                    onChange={e => setCreateForm(p => ({ ...p, category: e.target.value as GigCategory }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    {CATEGORIES.filter(c => c.key !== 'all').map(c => (
                      <option key={c.key} value={c.key}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Job Type</label>
                  <select
                    value={createForm.job_type}
                    onChange={e => setCreateForm(p => ({ ...p, job_type: e.target.value as GigJobType }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="contract">Contract / Freelance</option>
                    <option value="full_time">Full-Time</option>
                    <option value="part_time">Part-Time</option>
                    <option value="internship">Internship</option>
                    <option value="volunteer">Volunteer</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Compensation</label>
                  <select
                    value={createForm.compensation_type}
                    onChange={e => setCreateForm(p => ({ ...p, compensation_type: e.target.value as GigCompensationType }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="paid">Paid</option>
                    <option value="unpaid_stipend">Stipend</option>
                    <option value="volunteer">Volunteer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Amount ($)</label>
                  <input
                    type="number"
                    value={createForm.compensation_amount}
                    onChange={e => setCreateForm(p => ({ ...p, compensation_amount: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Frequency</label>
                  <select
                    value={createForm.compensation_frequency}
                    onChange={e => setCreateForm(p => ({ ...p, compensation_frequency: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="hourly">Hourly</option>
                    <option value="monthly">Monthly</option>
                    <option value="project">Per Project</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Location Name or Zone</label>
                <input
                  type="text"
                  placeholder="e.g. Willamette Basin, OR or Remote"
                  value={createForm.location_name}
                  onChange={e => setCreateForm(p => ({ ...p, location_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Description *</label>
                <textarea
                  rows={3}
                  value={createForm.description}
                  onChange={e => setCreateForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Provide project context and scope..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg resize-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Required Skills (comma separated)</label>
                <input
                  type="text"
                  placeholder="Tree planting, Soil preparation, GIS & mapping"
                  value={createForm.skills_text}
                  onChange={e => setCreateForm(p => ({ ...p, skills_text: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button onClick={() => setShowCreateModal(false)} className="px-3 py-1.5 text-xs text-slate-600">Cancel</button>
              <button
                onClick={handleCreateGig}
                disabled={createLoading || !createForm.title || !createForm.description}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 disabled:opacity-50"
              >
                {createLoading ? 'Publishing...' : 'Publish Gig'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
