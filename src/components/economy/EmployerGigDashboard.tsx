import React, { useState, useEffect } from 'react';
import {
  Users, CheckCircle2, XCircle, Star, Loader2, AlertCircle,
  ChevronDown, ChevronUp, ArrowUpRight, Briefcase
} from 'lucide-react';
import {
  fetchMyPostedGigs, fetchGigApplicationsForEmployer,
  decideGigApplication, updateGigStatus
} from '../../services/economyService';
import { GreenGig, GigApplication } from '../../types/economy';

interface EmployerGigDashboardProps {
  currentUserId?: string;
}

const APP_STATUS_STYLES: Record<string, string> = {
  submitted:   'bg-blue-50 text-blue-700 border-blue-200',
  reviewing:   'bg-amber-50 text-amber-700 border-amber-200',
  shortlisted: 'bg-purple-50 text-purple-700 border-purple-200',
  accepted:    'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected:    'bg-slate-50 text-slate-500 border-slate-200',
  withdrawn:   'bg-slate-50 text-slate-400 border-slate-200',
};

const GIG_STATUS_STYLES: Record<string, string> = {
  open:      'bg-emerald-100 text-emerald-700',
  in_review: 'bg-amber-100 text-amber-700',
  filled:    'bg-blue-100 text-blue-700',
  closed:    'bg-slate-100 text-slate-500',
};

export const EmployerGigDashboard: React.FC<EmployerGigDashboardProps> = ({ currentUserId }) => {
  const [gigs, setGigs] = useState<GreenGig[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedGig, setExpandedGig] = useState<string | null>(null);
  const [applications, setApplications] = useState<Record<string, GigApplication[]>>({});
  const [appsLoading, setAppsLoading] = useState<string | null>(null);
  const [deciding, setDeciding] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ id: string; msg: string; ok: boolean } | null>(null);

  useEffect(() => {
    if (!currentUserId) { setLoading(false); return; }
    fetchMyPostedGigs(currentUserId).then(data => {
      setGigs(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [currentUserId]);

  const loadApplications = async (gigId: string) => {
    if (applications[gigId]) return;
    setAppsLoading(gigId);
    const apps = await fetchGigApplicationsForEmployer(gigId);
    setApplications(prev => ({ ...prev, [gigId]: apps }));
    setAppsLoading(null);
  };

  const toggleGig = (gigId: string) => {
    const next = expandedGig === gigId ? null : gigId;
    setExpandedGig(next);
    if (next) loadApplications(next);
  };

  const handleDecide = async (appId: string, gigId: string, decision: 'shortlisted' | 'accepted' | 'rejected') => {
    setDeciding(appId);
    const result = await decideGigApplication(appId, decision);
    if (result.success) {
      setApplications(prev => ({
        ...prev,
        [gigId]: (prev[gigId] || []).map(a => a.id === appId ? { ...a, status: decision } : a)
      }));
      setStatusMsg({ id: appId, msg: `Marked as ${decision}`, ok: true });
    } else {
      setStatusMsg({ id: appId, msg: result.error || 'Failed', ok: false });
    }
    setDeciding(null);
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleGigStatusChange = async (gigId: string, status: 'open' | 'in_review' | 'filled' | 'closed') => {
    const result = await updateGigStatus(gigId, status);
    if (result.success) {
      setGigs(prev => prev.map(g => g.id === gigId ? { ...g, status } : g));
    }
  };

  if (!currentUserId) {
    return (
      <div className="text-center py-16 text-slate-500">
        <Briefcase className="w-10 h-10 mx-auto mb-3 text-slate-300" />
        <p className="text-sm">Sign in to manage your posted gigs.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-7 h-7 animate-spin text-emerald-600 mr-2" />
        <span className="text-sm text-slate-500">Loading your gigs…</span>
      </div>
    );
  }

  if (gigs.length === 0) {
    return (
      <div className="text-center py-16 text-slate-500">
        <Briefcase className="w-10 h-10 mx-auto mb-3 text-slate-300" />
        <p className="text-sm font-semibold text-slate-700">No gigs posted yet</p>
        <p className="text-xs text-slate-400 mt-1">Switch to the Browse tab and use "Post a Gig" to create your first listing.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-base font-bold text-slate-900">My Posted Gigs</h2>

      {gigs.map(gig => {
        const isOpen = expandedGig === gig.id;
        const apps = applications[gig.id] || [];

        return (
          <div key={gig.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <button
              className="w-full text-left p-4 hover:bg-slate-50 transition-colors"
              onClick={() => toggleGig(gig.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{gig.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {gig.applications_count} applicant{gig.applications_count !== 1 ? 's' : ''} ·
                    {gig.location_type} · {gig.compensation_type === 'paid' ? `${gig.compensation_currency} ${gig.compensation_amount}/${gig.compensation_frequency}` : gig.compensation_type}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={gig.status}
                    onClick={e => e.stopPropagation()}
                    onChange={e => handleGigStatusChange(gig.id, e.target.value as any)}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border cursor-pointer ${GIG_STATUS_STYLES[gig.status] || ''}`}
                  >
                    <option value="open">Open</option>
                    <option value="in_review">In Review</option>
                    <option value="filled">Filled</option>
                    <option value="closed">Closed</option>
                  </select>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
              </div>
            </button>

            {isOpen && (
              <div className="border-t border-slate-100">
                {appsLoading === gig.id ? (
                  <div className="p-6 flex justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                  </div>
                ) : apps.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    <Users className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                    No applications yet.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {apps.map(app => (
                      <div key={app.id} className="p-4 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{app.applicant_name}</p>
                            <p className="text-xs text-slate-500">{app.applicant_email}</p>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${APP_STATUS_STYLES[app.status] || ''}`}>
                            {app.status}
                          </span>
                        </div>

                        {app.experience_summary && (
                          <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{app.experience_summary}</p>
                        )}

                        {app.skills?.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {app.skills.map((s, i) => (
                              <span key={i} className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">{s}</span>
                            ))}
                          </div>
                        )}

                        {app.portfolio_url && (
                          <a href={app.portfolio_url} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold hover:underline">
                            <ArrowUpRight className="w-3 h-3" /> Portfolio
                          </a>
                        )}

                        {statusMsg?.id === app.id && (
                          <p className={`text-xs font-semibold ${statusMsg.ok ? 'text-emerald-700' : 'text-red-600'}`}>{statusMsg.msg}</p>
                        )}

                        {app.status !== 'withdrawn' && app.status !== 'accepted' && (
                          <div className="flex gap-2 pt-1 flex-wrap">
                            {app.status !== 'shortlisted' && (
                              <button
                                onClick={() => handleDecide(app.id, gig.id, 'shortlisted')}
                                disabled={deciding === app.id}
                                className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100 disabled:opacity-50"
                              >
                                <Star className="w-3 h-3" /> Shortlist
                              </button>
                            )}
                            <button
                              onClick={() => handleDecide(app.id, gig.id, 'accepted')}
                              disabled={deciding === app.id}
                              className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 disabled:opacity-50"
                            >
                              <CheckCircle2 className="w-3 h-3" /> Accept
                            </button>
                            {app.status !== 'rejected' && (
                              <button
                                onClick={() => handleDecide(app.id, gig.id, 'rejected')}
                                disabled={deciding === app.id}
                                className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold bg-slate-50 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-50"
                              >
                                <XCircle className="w-3 h-3" /> Decline
                              </button>
                            )}
                            {deciding === app.id && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
