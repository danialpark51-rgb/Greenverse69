import React, { useState, useEffect } from 'react';
import {
  Users, Briefcase, Package, Clock, MapPin, CheckCircle, ChevronDown, ChevronUp,
  AlertCircle, Loader2, UserPlus, Gift
} from 'lucide-react';
import {
  fetchVolunteerRoles, applyVolunteerRole, fetchResourceRequests, pledgeResource
} from '../../services/projectService';
import { Project, VolunteerRole, ResourceRequest } from '../../types/project';

interface VolunteerMatcherProps {
  project: Project;
  currentUserId?: string;
  currentUserName?: string;
}

const SKILL_OPTIONS = [
  'Tree planting', 'Soil preparation', 'Irrigation setup', 'Photography', 'Data collection',
  'Community outreach', 'Education & training', 'Environmental science', 'GIS & mapping',
  'Project management', 'Fundraising', 'Social media', 'Carpentry', 'Engineering',
];

const LOCATION_TYPE_COLORS: Record<string, string> = {
  on_site: 'bg-emerald-100 text-emerald-700',
  remote: 'bg-blue-100 text-blue-700',
  hybrid: 'bg-purple-100 text-purple-700',
};

const URGENCY_COLORS: Record<string, string> = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-red-100 text-red-700',
};

const RESOURCE_TYPE_COLORS: Record<string, string> = {
  tools: 'bg-blue-100 text-blue-700',
  materials: 'bg-amber-100 text-amber-700',
  plants_seedlings: 'bg-emerald-100 text-emerald-700',
  expertise: 'bg-purple-100 text-purple-700',
  equipment: 'bg-orange-100 text-orange-700',
  transport: 'bg-sky-100 text-sky-700',
};

export const VolunteerMatcher: React.FC<VolunteerMatcherProps> = ({
  project, currentUserId, currentUserName,
}) => {
  const [roles, setRoles] = useState<VolunteerRole[]>([]);
  const [resources, setResources] = useState<ResourceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Apply modal state
  const [applyRoleId, setApplyRoleId] = useState<string | null>(null);
  const [applyForm, setApplyForm] = useState({
    applicant_name: currentUserName || '',
    applicant_email: '',
    skills: [] as string[],
    availability: '',
    motivation: '',
  });
  const [applyLoading, setApplyLoading] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  // Pledge modal state
  const [pledgeRequestId, setPledgeRequestId] = useState<string | null>(null);
  const [pledgeForm, setPledgeForm] = useState({
    donor_name: currentUserName || '',
    quantity_offered: 1,
    notes: '',
  });
  const [pledgeLoading, setPledgeLoading] = useState(false);
  const [pledgeSuccess, setPledgeSuccess] = useState(false);
  const [pledgeError, setPledgeError] = useState<string | null>(null);

  const [expandedRole, setExpandedRole] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'volunteers' | 'resources'>('volunteers');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [rolesData, resourcesData] = await Promise.all([
          fetchVolunteerRoles(project.id),
          fetchResourceRequests(project.id),
        ]);
        setRoles(rolesData);
        setResources(resourcesData);
      } catch (err) {
        setError('Failed to load volunteer and resource data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [project.id]);

  const handleApply = async () => {
    if (!applyRoleId) return;
    setApplyLoading(true);
    setApplyError(null);
    try {
      await applyVolunteerRole(
        {
          role_id: applyRoleId,
          project_id: project.id,
          applicant_email: applyForm.applicant_email,
          skills: applyForm.skills,
          availability: applyForm.availability,
          motivation: applyForm.motivation,
        },
        currentUserId,
        applyForm.applicant_name || currentUserName || 'Anonymous',
      );
      setApplySuccess(true);
      setTimeout(() => {
        setApplyRoleId(null);
        setApplySuccess(false);
        setApplyForm({ applicant_name: currentUserName || '', applicant_email: '', skills: [], availability: '', motivation: '' });
      }, 2000);
    } catch (err: any) {
      setApplyError(err?.message || 'Application failed. Please try again.');
    } finally {
      setApplyLoading(false);
    }
  };

  const handlePledge = async () => {
    if (!pledgeRequestId) return;
    setPledgeLoading(true);
    setPledgeError(null);
    try {
      await pledgeResource(
        {
          request_id: pledgeRequestId,
          donor_name: pledgeForm.donor_name || 'Anonymous',
          quantity_offered: pledgeForm.quantity_offered,
          notes: pledgeForm.notes,
        },
        currentUserId,
      );
      setPledgeSuccess(true);
      // Refresh resources
      const updated = await fetchResourceRequests(project.id);
      setResources(updated);
      setTimeout(() => {
        setPledgeRequestId(null);
        setPledgeSuccess(false);
        setPledgeForm({ donor_name: currentUserName || '', quantity_offered: 1, notes: '' });
      }, 2000);
    } catch (err: any) {
      setPledgeError(err?.message || 'Pledge failed. Please try again.');
    } finally {
      setPledgeLoading(false);
    }
  };

  const toggleSkill = (skill: string) => {
    setApplyForm(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mr-3" />
        <span className="text-slate-600">Loading volunteer data…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl text-red-700">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  const selectedRole = roles.find(r => r.id === applyRoleId) || null;
  const selectedRequest = resources.find(r => r.id === pledgeRequestId) || null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-slate-800">Volunteer & Resource Matcher</h2>
        <p className="text-sm text-slate-500 mt-1">
          Join this project as a volunteer or contribute needed resources.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('volunteers')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'volunteers'
              ? 'border-emerald-500 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Users className="inline w-4 h-4 mr-1" />
          Volunteer Roles ({roles.length})
        </button>
        <button
          onClick={() => setActiveTab('resources')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'resources'
              ? 'border-emerald-500 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Package className="inline w-4 h-4 mr-1" />
          Resource Needs ({resources.length})
        </button>
      </div>

      {/* Volunteer Roles Tab */}
      {activeTab === 'volunteers' && (
        <div className="space-y-4">
          {roles.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No volunteer roles posted yet for this project.</p>
            </div>
          ) : (
            roles.map(role => {
              const filled = role.spots_filled || 0;
              const needed = role.spots_needed || 1;
              const fillPct = Math.min(100, Math.round((filled / needed) * 100));
              const isFull = filled >= needed;
              const isExpanded = expandedRole === role.id;

              return (
                <div key={role.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                  <div
                    className="flex items-start justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => setExpandedRole(isExpanded ? null : role.id)}
                  >
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-2 mb-1">
                        <h3 className="font-semibold text-slate-800">{role.title}</h3>
                        {role.location_type && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${LOCATION_TYPE_COLORS[role.location_type] || 'bg-slate-100 text-slate-600'}`}>
                            {role.location_type.replace('_', '-')}
                          </span>
                        )}
                        {isFull && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-500 font-medium">
                            Full
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 line-clamp-2">{role.description}</p>
                      {role.time_commitment && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
                          <Clock className="w-3 h-3" />
                          <span>{role.time_commitment}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right ml-4 flex-shrink-0">
                      <span className="text-sm font-semibold text-emerald-700">{filled}/{needed}</span>
                      <span className="text-xs text-slate-400 block">spots</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400 mt-1 ml-auto" /> : <ChevronDown className="w-4 h-4 text-slate-400 mt-1 ml-auto" />}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="px-4 pb-2">
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${isFull ? 'bg-slate-400' : 'bg-emerald-500'}`}
                        style={{ width: `${fillPct}%` }}
                      />
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-3 border-t border-slate-100 pt-3">
                      {role.required_skills && role.required_skills.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-slate-500 mb-1">Required Skills</p>
                          <div className="flex flex-wrap gap-1">
                            {role.required_skills.map(skill => (
                              <span key={skill} className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      <p className="text-xs text-slate-400 italic">
                        📧 Volunteer contact details are kept private and only shared with project organizers after acceptance.
                      </p>
                      {!isFull && (
                        <button
                          onClick={() => { setApplyRoleId(role.id); setApplyError(null); }}
                          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                        >
                          <UserPlus className="w-4 h-4" />
                          Apply for this Role
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Resource Needs Tab */}
      {activeTab === 'resources' && (
        <div className="space-y-4">
          {resources.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Package className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No resource requests posted yet.</p>
            </div>
          ) : (
            resources.map(req => {
              const fulfilled = req.quantity_fulfilled || 0;
              const needed = req.quantity_needed || 1;
              const pct = Math.min(100, Math.round((fulfilled / needed) * 100));
              const isMet = fulfilled >= needed;

              return (
                <div key={req.id} className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-2 mb-1">
                        <h3 className="font-semibold text-slate-800">{req.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${RESOURCE_TYPE_COLORS[req.resource_type] || 'bg-slate-100 text-slate-600'}`}>
                          {req.resource_type}
                        </span>
                        {req.urgency && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${URGENCY_COLORS[req.urgency] || 'bg-slate-100 text-slate-600'}`}>
                            {req.urgency} urgency
                          </span>
                        )}
                        {isMet && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Fulfilled
                          </span>
                        )}
                      </div>
                      
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-sm font-semibold text-slate-700">{fulfilled}/{needed}</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${isMet ? 'bg-emerald-500' : 'bg-amber-400'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  {!isMet && (
                    <button
                      onClick={() => { setPledgeRequestId(req.id); setPledgeError(null); }}
                      className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white text-sm rounded-lg hover:bg-amber-600 transition-colors font-medium"
                    >
                      <Gift className="w-4 h-4" />
                      Offer This Resource
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Apply Modal */}
      {applyRoleId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800">
                Apply: {selectedRole?.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Your details will only be shared with project organizers.
              </p>
            </div>
            <div className="p-6 space-y-4">
              {applySuccess ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                  <p className="font-semibold text-slate-800">Application submitted!</p>
                  <p className="text-sm text-slate-500 mt-1">The project team will review your application.</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Your Name *</label>
                    <input
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      value={applyForm.applicant_name}
                      onChange={e => setApplyForm(prev => ({ ...prev, applicant_name: e.target.value }))}
                      placeholder="Full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                    <input
                      type="email"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      value={applyForm.applicant_email}
                      onChange={e => setApplyForm(prev => ({ ...prev, applicant_email: e.target.value }))}
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Relevant Skills</label>
                    <div className="flex flex-wrap gap-2">
                      {SKILL_OPTIONS.map(skill => (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleSkill(skill)}
                          className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                            applyForm.skills.includes(skill)
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'border-slate-200 text-slate-600 hover:border-emerald-400'
                          }`}
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Availability *</label>
                    <input
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      value={applyForm.availability}
                      onChange={e => setApplyForm(prev => ({ ...prev, availability: e.target.value }))}
                      placeholder="e.g. Weekends, 4 hrs/week"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Why do you want to volunteer? *</label>
                    <textarea
                      rows={3}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                      value={applyForm.motivation}
                      onChange={e => setApplyForm(prev => ({ ...prev, motivation: e.target.value }))}
                      placeholder="Tell the project team about your motivation..."
                    />
                  </div>
                  {applyError && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> {applyError}
                    </p>
                  )}
                </>
              )}
            </div>
            {!applySuccess && (
              <div className="p-6 border-t border-slate-100 flex gap-3 justify-end">
                <button
                  onClick={() => setApplyRoleId(null)}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApply}
                  disabled={applyLoading || !applyForm.applicant_email || !applyForm.motivation}
                  className="flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50"
                >
                  {applyLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Submit Application
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pledge Modal */}
      {pledgeRequestId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800">
                Offer Resource: {selectedRequest?.title}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {pledgeSuccess ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                  <p className="font-semibold text-slate-800">Resource pledge recorded!</p>
                  <p className="text-sm text-slate-500 mt-1">The project team will follow up with you.</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Your Name</label>
                    <input
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      value={pledgeForm.donor_name}
                      onChange={e => setPledgeForm(prev => ({ ...prev, donor_name: e.target.value }))}
                      placeholder="Your name or organisation"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Quantity offered
                    </label>
                    <input
                      type="number"
                      min={1}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      value={pledgeForm.quantity_offered}
                      onChange={e => setPledgeForm(prev => ({ ...prev, quantity_offered: Number(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                    <textarea
                      rows={2}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                      value={pledgeForm.notes}
                      onChange={e => setPledgeForm(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Delivery timeline, condition, notes..."
                    />
                  </div>
                  {pledgeError && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> {pledgeError}
                    </p>
                  )}
                </>
              )}
            </div>
            {!pledgeSuccess && (
              <div className="p-6 border-t border-slate-100 flex gap-3 justify-end">
                <button
                  onClick={() => setPledgeRequestId(null)}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePledge}
                  disabled={pledgeLoading}
                  className="flex items-center gap-2 px-5 py-2 bg-amber-500 text-white text-sm rounded-lg hover:bg-amber-600 transition-colors font-medium disabled:opacity-50"
                >
                  {pledgeLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Confirm Pledge
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
