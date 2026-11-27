import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, CheckCircle2, XCircle, AlertCircle, Clock, MapPin,
  ExternalLink, Loader2, Filter, Eye, Award
} from 'lucide-react';
import { fetchVerificationQueue, reviewVerificationItem } from '../../services/impactService';
import { VerificationQueueItem, VerificationSubmissionType } from '../../types/impact';

interface GreenVerificationEngineProps {
  currentUserId?: string;
  currentUserName?: string;
}

const SUBMISSION_TYPES: { key: VerificationSubmissionType | 'all'; label: string }[] = [
  { key: 'all', label: 'All Submissions' },
  { key: 'tree_planting', label: 'Tree Planting' },
  { key: 'tree_care', label: 'Tree Care & Irrigation' },
  { key: 'bounty_completion', label: 'Bounty Task Evidence' },
  { key: 'project_milestone', label: 'Project Milestone Evidence' },
  { key: 'tree_protection', label: 'Tree Threat & Protection' },
];

export const GreenVerificationEngine: React.FC<GreenVerificationEngineProps> = ({
  currentUserId,
  currentUserName
}) => {
  const [queue, setQueue] = useState<VerificationQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');

  // Review Modal State
  const [activeItem, setActiveItem] = useState<VerificationQueueItem | null>(null);
  const [reviewDecision, setReviewDecision] = useState<'approved' | 'rejected' | 'needs_more_evidence'>('approved');
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const loadQueue = async () => {
    setLoading(true);
    try {
      const data = await fetchVerificationQueue(selectedType);
      setQueue(data);
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, [selectedType]);

  const handleCommitReview = async () => {
    if (!activeItem) return;
    if (!currentUserId) {
      setReviewError('Authentication required: Please sign in as an authorized reviewer to commit audit decisions.');
      return;
    }
    setReviewLoading(true);
    setReviewError(null);
    try {
      await reviewVerificationItem(
        activeItem.id,
        reviewDecision,
        reviewNotes,
        currentUserId,
        currentUserName || 'Auditing Officer'
      );
      setReviewSuccess(true);
      setTimeout(() => {
        setReviewSuccess(false);
        setActiveItem(null);
        setReviewNotes('');
        loadQueue();
      }, 1500);
    } catch (err: any) {
      setReviewError(err?.message || 'Failed to submit verification decision. Please try again.');
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          Centralized Green Verification & Audit Engine
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Auditor review queue for field evidence, tree planting, maintenance visits, and milestone validations.
        </p>
      </div>

      {/* Rules Notice */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-800 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Strict Audit Protocol:</span> Approval triggers automatic reward points deposition into the submitter's wallet and logs a cryptographically referenced reputation entry. Submissions lacking clear geotagged photo proof must be marked <em>Needs More Evidence</em>.
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {SUBMISSION_TYPES.map(t => (
          <button
            key={t.key}
            onClick={() => setSelectedType(t.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedType === t.key
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Queue Items List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mr-2" />
          <span className="text-sm text-slate-600">Loading verification queue...</span>
        </div>
      ) : queue.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8">
          <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-800">Verification queue is clear</p>
          <p className="text-xs text-slate-400 mt-1">All submitted field actions have been reviewed.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {queue.map(item => (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-emerald-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {item.submission_type.replace(/_/g, ' ')}
                  </span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    item.status === 'approved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : item.status === 'rejected'
                      ? 'bg-red-100 text-red-800'
                      : item.status === 'needs_more_evidence'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {item.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm">{item.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">{item.description}</p>

                <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                  <span>Submitter: <strong className="text-slate-700">{item.submitter_name}</strong></span>
                  {item.location_name && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {item.location_name}
                    </span>
                  )}
                  <span>{new Date(item.submitted_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                <span className="text-xs font-bold text-emerald-700">
                  +{item.reward_points} pts on approval
                </span>
                <button
                  onClick={() => {
                    setActiveItem(item);
                    setReviewDecision('approved');
                    setReviewNotes('');
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Audit Evidence
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Auditor Review Modal */}
      {activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Auditor Review: {activeItem.title}</h3>
            {reviewError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{reviewError}</span>
              </div>
            )}
            {reviewSuccess ? (
              <div className="text-center py-6">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
                <p className="font-bold text-slate-800">Verification Decision Recorded!</p>
                <p className="text-xs text-slate-500 mt-1">
                  The submitter has been notified and reward points have been synced.
                </p>
              </div>
            ) : (
              <>
                <div className="bg-slate-50 p-4 rounded-xl text-xs space-y-2">
                  <div><strong>Submitter:</strong> {activeItem.submitter_name}</div>
                  <div><strong>Description:</strong> {activeItem.description}</div>
                  {activeItem.evidence_urls.length > 0 && (
                    <div>
                      <strong>Photo Evidence:</strong>
                      <div className="mt-2 h-44 rounded-xl overflow-hidden bg-slate-200">
                        <img
                          src={activeItem.evidence_urls[0]}
                          alt="Field Evidence"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Audit Decision *</label>
                    <div className="flex flex-wrap gap-3">
                      <label className="flex items-center gap-1 text-emerald-700 font-medium cursor-pointer">
                        <input
                          type="radio"
                          name="decision"
                          checked={reviewDecision === 'approved'}
                          onChange={() => setReviewDecision('approved')}
                        />
                        Approve (+{activeItem.reward_points} pts)
                      </label>
                      <label className="flex items-center gap-1 text-amber-700 font-medium cursor-pointer">
                        <input
                          type="radio"
                          name="decision"
                          checked={reviewDecision === 'needs_more_evidence'}
                          onChange={() => setReviewDecision('needs_more_evidence')}
                        />
                        Needs More Evidence
                      </label>
                      <label className="flex items-center gap-1 text-red-600 font-medium cursor-pointer">
                        <input
                          type="radio"
                          name="decision"
                          checked={reviewDecision === 'rejected'}
                          onChange={() => setReviewDecision('rejected')}
                        />
                        Reject Submission
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Reviewer Feedback Notes *</label>
                    <textarea
                      rows={3}
                      value={reviewNotes}
                      onChange={e => setReviewNotes(e.target.value)}
                      placeholder="Specify verification confirmation details or reason for request..."
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 resize-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button onClick={() => setActiveItem(null)} className="px-3 py-1.5 text-xs text-slate-600">Close</button>
                  <button
                    onClick={handleCommitReview}
                    disabled={reviewLoading || !reviewNotes.trim()}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {reviewLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Commit Verification Decision
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
