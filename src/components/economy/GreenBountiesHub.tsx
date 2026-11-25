import React, { useState, useEffect } from 'react';
import {
  Award, CheckCircle2, Clock, MapPin, Upload, AlertCircle, Loader2,
  ShieldCheck, Coins, Camera, FileText, ChevronRight, X
} from 'lucide-react';
import { fetchBounties, claimBounty, submitBountyEvidence, reviewBountySubmission } from '../../services/economyService';
import { GreenBounty, BountyCategory, BountySubmission } from '../../types/economy';

interface GreenBountiesHubProps {
  currentUserId?: string;
  currentUserName?: string;
}

const BOUNTY_CATEGORIES: { key: BountyCategory | 'all'; label: string }[] = [
  { key: 'all', label: 'All Bounties' },
  { key: 'litter_cleanup', label: 'Litter Cleanup' },
  { key: 'tree_planting', label: 'Plant & Document' },
  { key: 'biodiversity_survey', label: 'Biodiversity Survey' },
  { key: 'garden_maintenance', label: 'Community Garden' },
  { key: 'recycling_drive', label: 'Recycling Drive' },
];

export const GreenBountiesHub: React.FC<GreenBountiesHubProps> = ({ currentUserId, currentUserName }) => {
  const [bounties, setBounties] = useState<GreenBounty[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState<string>('all');

  // Submit Evidence Modal State
  const [activeBounty, setActiveBounty] = useState<GreenBounty | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [evidenceForm, setEvidenceForm] = useState({
    evidence_text: '',
    evidence_url: '',
    location_evidence: '',
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Review Submissions Modal State (Simulating Squad Lead / Reviewer role)
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewDecision, setReviewDecision] = useState<'approved' | 'rejected'>('approved');
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  const loadBounties = async () => {
    setLoading(true);
    try {
      const data = await fetchBounties(selectedCat);
      setBounties(data);
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBounties();
  }, [selectedCat]);

  const handleClaim = async (bountyId: string) => {
    await claimBounty(bountyId, currentUserId, currentUserName);
    setBounties(prev => prev.map(b => b.id === bountyId ? { ...b, is_claimed_by_user: true, spots_claimed: b.spots_claimed + 1 } : b));
  };

  const handleSubmitEvidence = async () => {
    if (!activeBounty) return;
    setSubmitLoading(true);
    setSubmitError(null);
    try {
      await submitBountyEvidence(
        activeBounty.id,
        evidenceForm,
        currentUserId,
        currentUserName
      );
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setShowSubmitModal(false);
        loadBounties();
      }, 1800);
    } catch (err: any) {
      setSubmitError(err?.message || 'Failed to submit evidence.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleReviewSubmission = async (submissionId: string) => {
    setReviewLoading(true);
    try {
      await reviewBountySubmission(submissionId, reviewDecision, reviewNotes, currentUserId);
      setShowReviewModal(false);
      loadBounties();
    } catch {
      // handled
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            Green Bounties & Verified Tasks
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Complete high-impact ecological actions, submit auditable photo proof, and earn Green Points into your wallet.
          </p>
        </div>
      </div>

      {/* Rules Banner */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-800 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Transparent Verification Required:</span> Green Points are awarded only upon review of photographic or geotagged evidence. Duplicate submissions and fake claims are filtered to safeguard community integrity.
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {BOUNTY_CATEGORIES.map(c => (
          <button
            key={c.key}
            onClick={() => setSelectedCat(c.key)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedCat === c.key
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Bounty Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mr-2" />
          <span className="text-sm text-slate-600">Loading bounties...</span>
        </div>
      ) : bounties.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8">
          <Award className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-800">No bounties in this category</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bounties.map(bounty => {
            const isFull = bounty.spots_claimed >= bounty.spots_available;
            const hasSubmitted = !!bounty.user_submission;

            return (
              <div
                key={bounty.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                      {bounty.category.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                      <Coins className="w-3.5 h-3.5 text-amber-500" />
                      +{bounty.reward_value} pts
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm mb-1">{bounty.title}</h3>
                  <p className="text-xs text-slate-400 mb-2 font-medium">By {bounty.creator_name}</p>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">{bounty.description}</p>

                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-[11px] text-slate-600 space-y-1.5 mb-4">
                    <div className="flex items-center gap-1.5 font-medium text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Verification: {bounty.verification_requirements}
                    </div>
                    {bounty.location_name && (
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <MapPin className="w-3.5 h-3.5" />
                        {bounty.location_name}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>
                      Spots: <strong className="text-slate-800">{bounty.spots_claimed}/{bounty.spots_available}</strong>
                    </span>
                    <span>
                      Completed: <strong className="text-emerald-700">{bounty.spots_completed}</strong>
                    </span>
                  </div>

                  {hasSubmitted ? (
                    <div className="flex items-center justify-between px-3 py-2 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700 font-medium">
                      <span>Status: Under Review</span>
                      <button
                        onClick={() => {
                          setActiveBounty(bounty);
                          setShowReviewModal(true);
                        }}
                        className="text-[11px] underline text-blue-800 font-semibold"
                      >
                        Auditor View
                      </button>
                    </div>
                  ) : bounty.is_claimed_by_user ? (
                    <button
                      onClick={() => {
                        setActiveBounty(bounty);
                        setShowSubmitModal(true);
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-2 bg-amber-500 text-white rounded-xl text-xs font-semibold hover:bg-amber-600 transition shadow-sm"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Submit Verification Evidence
                    </button>
                  ) : (
                    <button
                      onClick={() => handleClaim(bounty.id)}
                      disabled={isFull}
                      className="w-full flex items-center justify-center gap-1.5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 disabled:opacity-50 transition"
                    >
                      {isFull ? 'All Spots Claimed' : 'Claim Bounty Task'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Submit Evidence Modal */}
      {showSubmitModal && activeBounty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Submit Evidence: {activeBounty.title}</h3>
            {submitSuccess ? (
              <div className="text-center py-6">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
                <p className="font-bold text-slate-800">Evidence Received!</p>
                <p className="text-xs text-slate-500 mt-1">
                  Upon reviewer approval, +{activeBounty.reward_value} Green Points will be deposited into your wallet ledger.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Task Summary & Output Details *</label>
                    <textarea
                      rows={3}
                      value={evidenceForm.evidence_text}
                      onChange={e => setEvidenceForm(p => ({ ...p, evidence_text: e.target.value }))}
                      placeholder="e.g. Collected 3 bags of plastic debris near Cedar Creek, total weight ~6.2 kg. Handled recycling at depot."
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Photo / Verification Evidence URL *</label>
                    <input
                      type="url"
                      value={evidenceForm.evidence_url}
                      onChange={e => setEvidenceForm(p => ({ ...p, evidence_url: e.target.value }))}
                      placeholder="https://images.unsplash.com/... or cloud link"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    />
                    <p className="text-[10px] text-slate-400 mt-0.5">Please provide an accessible image link displaying your completed task.</p>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Location Coordinates / Notes</label>
                    <input
                      type="text"
                      value={evidenceForm.location_evidence}
                      onChange={e => setEvidenceForm(p => ({ ...p, location_evidence: e.target.value }))}
                      placeholder="e.g. Lat: 45.5152, Lng: -122.6784"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>

                {submitError && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {submitError}
                  </p>
                )}

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button onClick={() => setShowSubmitModal(false)} className="px-3 py-1.5 text-xs text-slate-600">Cancel</button>
                  <button
                    onClick={handleSubmitEvidence}
                    disabled={submitLoading || !evidenceForm.evidence_text}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {submitLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Submit for Review
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Review / Auditor Modal */}
      {showReviewModal && activeBounty && activeBounty.user_submission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Auditor Review: Evidence Audit</h3>
            <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1.5">
              <p><strong>Volunteer:</strong> {activeBounty.user_submission.user_name}</p>
              <p><strong>Notes:</strong> {activeBounty.user_submission.evidence_text}</p>
              {activeBounty.user_submission.evidence_url && (
                <p>
                  <strong>Proof Link:</strong>{' '}
                  <a href={activeBounty.user_submission.evidence_url} target="_blank" rel="noopener noreferrer" className="text-emerald-600 underline">
                    View Uploaded Evidence Photo
                  </a>
                </p>
              )}
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Audit Decision</label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-1 text-emerald-700 font-medium">
                    <input
                      type="radio"
                      name="decision"
                      checked={reviewDecision === 'approved'}
                      onChange={() => setReviewDecision('approved')}
                    />
                    Approve (+{activeBounty.reward_value} pts)
                  </label>
                  <label className="flex items-center gap-1 text-red-600 font-medium">
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
                <label className="block text-slate-700 font-medium mb-1">Audit Feedback / Reason</label>
                <textarea
                  rows={2}
                  value={reviewNotes}
                  onChange={e => setReviewNotes(e.target.value)}
                  placeholder="e.g. Verified clear debris removal photos. Excellent effort!"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button onClick={() => setShowReviewModal(false)} className="px-3 py-1.5 text-xs text-slate-600">Close</button>
              <button
                onClick={() => handleReviewSubmission(activeBounty.user_submission!.id)}
                disabled={reviewLoading}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 disabled:opacity-50"
              >
                {reviewLoading ? 'Updating...' : 'Commit Audit Decision'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
