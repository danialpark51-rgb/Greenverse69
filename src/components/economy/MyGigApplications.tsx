import React, { useState, useEffect } from 'react';
import {
  Briefcase, Clock, CheckCircle2, XCircle, AlertCircle, Loader2,
  ArrowUpRight, ChevronDown, ChevronUp, Undo2
} from 'lucide-react';
import { fetchMyGigApplications, withdrawGigApplication } from '../../services/economyService';
import { GigApplication } from '../../types/economy';

interface MyGigApplicationsProps {
  currentUserId?: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  submitted:   { label: 'Submitted',   color: 'text-blue-700',    bg: 'bg-blue-50 border-blue-200',    icon: <Clock className="w-3.5 h-3.5" /> },
  reviewing:   { label: 'Under Review',color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-200',  icon: <AlertCircle className="w-3.5 h-3.5" /> },
  shortlisted: { label: 'Shortlisted', color: 'text-purple-700',  bg: 'bg-purple-50 border-purple-200',icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  accepted:    { label: 'Accepted ✓',  color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  rejected:    { label: 'Not Selected',color: 'text-slate-600',   bg: 'bg-slate-50 border-slate-200',  icon: <XCircle className="w-3.5 h-3.5" /> },
  withdrawn:   { label: 'Withdrawn',   color: 'text-slate-400',   bg: 'bg-slate-50 border-slate-200',  icon: <Undo2 className="w-3.5 h-3.5" /> },
};

export const MyGigApplications: React.FC<MyGigApplicationsProps> = ({ currentUserId }) => {
  const [applications, setApplications] = useState<GigApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [withdrawing, setWithdrawing] = useState<string | null>(null);
  const [withdrawMsg, setWithdrawMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUserId) { setLoading(false); return; }
    fetchMyGigApplications(currentUserId).then(apps => {
      setApplications(apps);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [currentUserId]);

  const handleWithdraw = async (appId: string) => {
    setWithdrawing(appId);
    setWithdrawMsg(null);
    const result = await withdrawGigApplication(appId);
    if (result.success) {
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: 'withdrawn' } : a));
      setWithdrawMsg('Application withdrawn.');
    } else {
      setWithdrawMsg(result.error || 'Could not withdraw.');
    }
    setWithdrawing(null);
    setTimeout(() => setWithdrawMsg(null), 3000);
  };

  if (!currentUserId) {
    return (
      <div className="text-center py-16 text-slate-500">
        <Briefcase className="w-10 h-10 mx-auto mb-3 text-slate-300" />
        <p className="text-sm font-medium">Sign in to view your applications.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-7 h-7 animate-spin text-emerald-600 mr-2" />
        <span className="text-sm text-slate-500">Loading applications…</span>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="text-center py-16 text-slate-500">
        <Briefcase className="w-10 h-10 mx-auto mb-3 text-slate-300" />
        <p className="text-sm font-semibold text-slate-700">No applications yet</p>
        <p className="text-xs text-slate-400 mt-1">Browse Green Gigs and apply to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-base font-bold text-slate-900">My Applications</h2>
        <span className="text-xs text-slate-500">{applications.length} total</span>
      </div>

      {withdrawMsg && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">{withdrawMsg}</div>
      )}

      {applications.map(app => {
        const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG['submitted'];
        const isOpen = expanded === app.id;
        const gigInfo = (app as any).gigs;

        return (
          <div key={app.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <button
              className="w-full text-left p-4 hover:bg-slate-50 transition-colors"
              onClick={() => setExpanded(isOpen ? null : app.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">
                    {gigInfo?.title || 'Green Gig'}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    {gigInfo?.employer_name || ''} · Applied {new Date(app.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${cfg.bg} ${cfg.color}`}>
                    {cfg.icon}{cfg.label}
                  </span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
              </div>
            </button>

            {isOpen && (
              <div className="px-4 pb-4 border-t border-slate-100 pt-3 space-y-3">
                {app.cover_note && (
                  <div>
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Cover Note</p>
                    <p className="text-xs text-slate-700 leading-relaxed">{app.cover_note}</p>
                  </div>
                )}
                {app.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {app.skills.map((s, i) => (
                      <span key={i} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-semibold border border-emerald-100">{s}</span>
                    ))}
                  </div>
                )}
                {app.portfolio_url && (
                  <a href={app.portfolio_url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-emerald-700 font-semibold hover:underline">
                    <ArrowUpRight className="w-3.5 h-3.5" /> Portfolio / Work Sample
                  </a>
                )}
                <div className="flex items-center gap-2 pt-1">
                  {app.status === 'submitted' || app.status === 'reviewing' ? (
                    <button
                      onClick={() => handleWithdraw(app.id)}
                      disabled={withdrawing === app.id}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 flex items-center gap-1"
                    >
                      {withdrawing === app.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Undo2 className="w-3 h-3" />}
                      Withdraw
                    </button>
                  ) : null}
                  {app.status === 'accepted' && (
                    <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Congratulations! Contact the employer to proceed.
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
