import React, { useState, useEffect } from 'react';
import {
  CheckCircle, Clock, AlertCircle, Loader2, TrendingUp, Image,
  FileText, PlusCircle, ChevronDown, ChevronUp, Calendar
} from 'lucide-react';
import {
  fetchMilestones, updateMilestoneProgress,
  fetchProjectUpdates, createProjectUpdate,
} from '../../services/projectService';
import { Project, ProjectMilestone, ProjectUpdate } from '../../types/project';

interface MilestoneTrackerProps {
  project: Project;
  currentUserId?: string;
  currentUserName?: string;
  isOwner?: boolean;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending', color: 'bg-slate-100 text-slate-600', icon: <Clock className="w-3 h-3" /> },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700', icon: <TrendingUp className="w-3 h-3" /> },
  completed: { label: 'Completed', color: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle className="w-3 h-3" /> },
  overdue: { label: 'Overdue', color: 'bg-red-100 text-red-700', icon: <AlertCircle className="w-3 h-3" /> },
};

const UPDATE_TYPES = ['milestone', 'field_work', 'financial', 'general'] as const;
type UpdateType = typeof UPDATE_TYPES[number];

const UPDATE_TYPE_LABELS: Record<UpdateType, string> = {
  milestone: 'Milestone Update',
  field_work: 'Field Work',
  financial: 'Financial Update',
  general: 'General Update',
};

const UPDATE_TYPE_COLORS: Record<UpdateType, string> = {
  milestone: 'bg-blue-100 text-blue-700',
  field_work: 'bg-emerald-100 text-emerald-700',
  financial: 'bg-amber-100 text-amber-700',
  general: 'bg-slate-100 text-slate-600',
};

export const MilestoneTracker: React.FC<MilestoneTrackerProps> = ({
  project, currentUserId, currentUserName, isOwner,
}) => {
  const [milestones, setMilestones] = useState<ProjectMilestone[]>([]);
  const [updates, setUpdates] = useState<ProjectUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'milestones' | 'updates'>('milestones');

  // Progress update state
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [progressValue, setProgressValue] = useState(0);
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [expandedMilestone, setExpandedMilestone] = useState<string | null>(null);

  // Post update state
  const [showPostUpdate, setShowPostUpdate] = useState(false);
  const [postForm, setPostForm] = useState({
    title: '',
    content: '',
    update_type: 'general' as UpdateType,
    media_url: '',
  });
  const [postLoading, setPostLoading] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);
  const [postSuccess, setPostSuccess] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [ms, ups] = await Promise.all([
          fetchMilestones(project.id),
          fetchProjectUpdates(project.id),
        ]);
        setMilestones(ms);
        setUpdates(ups);
      } catch {
        setError('Failed to load milestone data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [project.id]);

  const computeStatus = (m: ProjectMilestone): string => {
    if (m.status === 'completed') return 'completed';
    if (m.due_date && new Date(m.due_date) < new Date()) return 'overdue';
    return m.status || 'pending';
  };

  const handleUpdateProgress = async (milestoneId: string) => {
    setUpdateLoading(true);
    setUpdateError(null);
    try {
      await updateMilestoneProgress(milestoneId, project.id, progressValue, evidenceUrl || undefined);
      const updated = await fetchMilestones(project.id);
      setMilestones(updated);
      setUpdatingId(null);
      setProgressValue(0);
      setEvidenceUrl('');
    } catch (err: any) {
      setUpdateError(err?.message || 'Update failed.');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handlePostUpdate = async () => {
    setPostLoading(true);
    setPostError(null);
    try {
      await createProjectUpdate(
        {
          project_id: project.id,
          title: postForm.title,
          content: postForm.content,
          update_type: postForm.update_type,
          media_url: postForm.media_url || undefined,
        },
        currentUserId,
        currentUserName || 'Project Team',
      );
      setPostSuccess(true);
      const updated = await fetchProjectUpdates(project.id);
      setUpdates(updated);
      setTimeout(() => {
        setShowPostUpdate(false);
        setPostSuccess(false);
        setPostForm({ title: '', content: '', update_type: 'general', media_url: '' });
      }, 2000);
    } catch (err: any) {
      setPostError(err?.message || 'Failed to post update.');
    } finally {
      setPostLoading(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'No date set';
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mr-3" />
        <span className="text-slate-600">Loading milestones…</span>
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Milestone & Progress Tracker</h2>
          <p className="text-sm text-slate-500 mt-1">Track field work, completed milestones, and project updates.</p>
        </div>
        {isOwner && (
          <button
            onClick={() => setShowPostUpdate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors font-medium"
          >
            <PlusCircle className="w-4 h-4" />
            Post Update
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('milestones')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'milestones'
              ? 'border-emerald-500 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Milestones ({milestones.length})
        </button>
        <button
          onClick={() => setActiveTab('updates')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'updates'
              ? 'border-emerald-500 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Activity Feed ({updates.length})
        </button>
      </div>

      {/* Milestones Timeline */}
      {activeTab === 'milestones' && (
        <div className="space-y-4">
          {milestones.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <TrendingUp className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No milestones set for this project yet.</p>
            </div>
          ) : (
            <div className="relative">
              {/* Vertical timeline line */}
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-slate-200" />
              <div className="space-y-6 ml-12">
                {milestones.map(m => {
                  const status = computeStatus(m);
                  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
                  const pct = m.current_progress_percentage || 0;
                  const isExpanded = expandedMilestone === m.id;
                  const isUpdating = updatingId === m.id;

                  return (
                    <div key={m.id} className="relative">
                      {/* Circle on timeline */}
                      <div className={`absolute -left-9 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        status === 'completed' ? 'bg-emerald-500 border-emerald-500' :
                        status === 'overdue' ? 'bg-red-400 border-red-400' :
                        status === 'in_progress' ? 'bg-blue-400 border-blue-400' :
                        'bg-white border-slate-300'
                      }`}>
                        {status === 'completed' && <CheckCircle className="w-3 h-3 text-white" />}
                      </div>

                      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                        <div
                          className="p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                          onClick={() => setExpandedMilestone(isExpanded ? null : m.id)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h3 className="font-semibold text-slate-800">{m.title}</h3>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${cfg.color}`}>
                                  {cfg.icon}{cfg.label}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-slate-400">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" /> {formatDate(m.due_date)}
                                </span>
                                {m.responsible_member_name && (
                                  <span>Responsible: {m.responsible_member_name}</span>
                                )}
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0 flex items-center gap-2">
                              <span className="text-sm font-bold text-emerald-700">{pct}%</span>
                              {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                            </div>
                          </div>
                          <div className="mt-2 w-full bg-slate-100 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${status === 'completed' ? 'bg-emerald-500' : status === 'overdue' ? 'bg-red-400' : 'bg-blue-400'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="px-4 pb-4 space-y-3 border-t border-slate-100 pt-3">
                            {m.description && <p className="text-sm text-slate-600">{m.description}</p>}
                            {m.evidence_url && (
                              <a
                                href={m.evidence_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700"
                              >
                                <Image className="w-4 h-4" /> View Evidence
                              </a>
                            )}
                            {isOwner && !isUpdating && (
                              <button
                                onClick={() => {
                                  setUpdatingId(m.id);
                                  setProgressValue(m.current_progress_percentage || 0);
                                  setEvidenceUrl('');
                                  setUpdateError(null);
                                }}
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                              >
                                Update Progress →
                              </button>
                            )}
                            {isOwner && isUpdating && (
                              <div className="space-y-3 p-3 bg-blue-50 rounded-lg">
                                <div>
                                  <label className="block text-xs font-medium text-slate-600 mb-1">
                                    Progress: {progressValue}%
                                  </label>
                                  <input
                                    type="range"
                                    min={0}
                                    max={100}
                                    step={5}
                                    value={progressValue}
                                    onChange={e => setProgressValue(Number(e.target.value))}
                                    className="w-full accent-emerald-600"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-slate-600 mb-1">Evidence URL (optional)</label>
                                  <input
                                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="https://..."
                                    value={evidenceUrl}
                                    onChange={e => setEvidenceUrl(e.target.value)}
                                  />
                                </div>
                                {updateError && <p className="text-xs text-red-600">{updateError}</p>}
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleUpdateProgress(m.id)}
                                    disabled={updateLoading}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                                  >
                                    {updateLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setUpdatingId(null)}
                                    className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Activity Feed */}
      {activeTab === 'updates' && (
        <div className="space-y-4">
          {updates.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No updates posted yet.</p>
            </div>
          ) : (
            updates.map(update => {
              const typeCfg = UPDATE_TYPE_COLORS[(update.update_type as UpdateType)] || 'bg-slate-100 text-slate-600';
              return (
                <div key={update.id} className="bg-white border border-slate-200 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="font-semibold text-slate-800">{update.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeCfg}`}>
                          {UPDATE_TYPE_LABELS[(update.update_type as UpdateType)] || update.update_type}
                        </span>
                        <span className="text-xs text-slate-400">
                          by {update.author_name || 'Project Team'}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 flex-shrink-0">
                      {formatDate(update.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">{update.content}</p>
                  {update.media_url && (
                    <a
                      href={update.media_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700"
                    >
                      <Image className="w-4 h-4" /> View Media
                    </a>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Post Update Modal */}
      {showPostUpdate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800">Post Project Update</h3>
            </div>
            <div className="p-6 space-y-4">
              {postSuccess ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                  <p className="font-semibold text-slate-800">Update posted!</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Update Type</label>
                    <select
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      value={postForm.update_type}
                      onChange={e => setPostForm(prev => ({ ...prev, update_type: e.target.value as UpdateType }))}
                    >
                      {UPDATE_TYPES.map(t => (
                        <option key={t} value={t}>{UPDATE_TYPE_LABELS[t]}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
                    <input
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      value={postForm.title}
                      onChange={e => setPostForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Update headline"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Content *</label>
                    <textarea
                      rows={4}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                      value={postForm.content}
                      onChange={e => setPostForm(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Describe what happened, what was achieved, or what needs attention..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Media URL (optional)</label>
                    <input
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      value={postForm.media_url}
                      onChange={e => setPostForm(prev => ({ ...prev, media_url: e.target.value }))}
                      placeholder="https://..."
                    />
                  </div>
                  {postError && <p className="text-sm text-red-600">{postError}</p>}
                </>
              )}
            </div>
            {!postSuccess && (
              <div className="p-6 border-t border-slate-100 flex gap-3 justify-end">
                <button onClick={() => setShowPostUpdate(false)} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800">Cancel</button>
                <button
                  onClick={handlePostUpdate}
                  disabled={postLoading || !postForm.title || !postForm.content}
                  className="flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium"
                >
                  {postLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Post Update
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
