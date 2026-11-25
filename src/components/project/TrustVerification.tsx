import React, { useState } from 'react';
import {
  ShieldCheck, ShieldAlert, Shield, Clock, Flag, CheckCircle,
  AlertTriangle, ExternalLink, Loader2, AlertCircle, ChevronRight
} from 'lucide-react';
import { submitForReview, reportProject } from '../../services/projectService';
import { Project } from '../../types/project';

interface TrustVerificationProps {
  project: Project;
  currentUserId?: string;
  isAdmin?: boolean;
}

type ReportReason = 'misleading_claims' | 'inaccurate_location' | 'financial_concern' | 'inappropriate_content' | 'other';

const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: 'misleading_claims', label: 'Misleading or false claims' },
  { value: 'inaccurate_location', label: 'Inaccurate or fake location' },
  { value: 'financial_concern', label: 'Financial transparency concern' },
  { value: 'inappropriate_content', label: 'Inappropriate content' },
  { value: 'other', label: 'Other concern' },
];

const STATUS_CONFIG: Record<string, {
  label: string;
  description: string;
  color: string;
  bg: string;
  border: string;
  icon: React.ReactNode;
}> = {
  unverified: {
    label: 'Unverified',
    description: 'This project has not yet been submitted for review.',
    color: 'text-slate-600',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    icon: <Shield className="w-6 h-6 text-slate-400" />,
  },
  submitted_for_review: {
    label: 'Under Review',
    description: 'This project has been submitted and is awaiting review by the Greenverse team.',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: <Clock className="w-6 h-6 text-amber-500" />,
  },
  reviewed: {
    label: 'Reviewed',
    description: 'This project has been reviewed. Additional verification steps may be pending.',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: <ShieldCheck className="w-6 h-6 text-blue-500" />,
  },
  verified: {
    label: 'Verified',
    description: 'This project has been independently verified by the Greenverse review team.',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    icon: <ShieldCheck className="w-6 h-6 text-emerald-500" />,
  },
  flagged: {
    label: 'Flagged',
    description: 'This project has been flagged for review due to reported concerns. Pledge with caution.',
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: <ShieldAlert className="w-6 h-6 text-red-500" />,
  },
};

interface ChecklistItem {
  key: string;
  label: string;
  check: (project: Project) => boolean;
}

const CHECKLIST: ChecklistItem[] = [
  {
    key: 'location',
    label: 'Project location coordinates specified',
    check: p => !!(p.latitude && p.longitude),
  },
  {
    key: 'organizer',
    label: 'Project organizer identity provided',
    check: p => !!(p.owner_name || p.owner_id),
  },
  {
    key: 'problem',
    label: 'Environmental problem statement written',
    check: p => !!(p.problem_statement && p.problem_statement.length > 20),
  },
  {
    key: 'budget',
    label: 'Budget or funding target declared',
    check: p => !!(p.funding_target && p.funding_target > 0),
  },
  {
    key: 'timeline',
    label: 'Project timeline or start date set',
    check: p => !!(p.start_date || p.end_date),
  },
  {
    key: 'milestones',
    label: 'At least one measurable objective documented',
    check: p => !!(p.objectives && p.objectives.length > 10),
  },
];

export const TrustVerification: React.FC<TrustVerificationProps> = ({
  project, currentUserId, isAdmin,
}) => {
  const status = project.verification_status || 'unverified';
  const statusCfg = STATUS_CONFIG[status] || STATUS_CONFIG.unverified;
  const isOwner = currentUserId && project.owner_id === currentUserId;

  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [reportReason, setReportReason] = useState<ReportReason>('misleading_claims');
  const [reportDetails, setReportDetails] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [showReportForm, setShowReportForm] = useState(false);

  const handleSubmitForReview = async () => {
    setSubmitLoading(true);
    setSubmitError(null);
    try {
      await submitForReview(project.id);
      setSubmitSuccess(true);
      // Optimistically update local display — parent may not re-fetch
    } catch (err: any) {
      setSubmitError(err?.message || 'Failed to submit for review.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleReport = async () => {
    if (!reportDetails.trim()) return;
    setReportLoading(true);
    setReportError(null);
    try {
      await reportProject(
        { project_id: project.id, reason: reportReason, details: reportDetails },
        currentUserId,
      );
      setReportSuccess(true);
      setTimeout(() => {
        setShowReportForm(false);
        setReportSuccess(false);
        setReportDetails('');
      }, 3000);
    } catch (err: any) {
      setReportError(err?.message || 'Failed to submit report. Please try again.');
    } finally {
      setReportLoading(false);
    }
  };

  const checklist = CHECKLIST.map(item => ({
    ...item,
    passed: item.check(project),
  }));
  const passedCount = checklist.filter(c => c.passed).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-slate-800">Trust & Verification</h2>
        <p className="text-sm text-slate-500 mt-1">
          Transparency information and verification status for this project.
        </p>
      </div>

      {/* Verification Status Card */}
      <div className={`flex items-start gap-4 p-5 rounded-xl border ${statusCfg.bg} ${statusCfg.border}`}>
        <div className="flex-shrink-0 mt-0.5">{statusCfg.icon}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className={`text-lg font-semibold ${statusCfg.color}`}>
              {statusCfg.label}
            </h3>
            {status === 'verified' && (
              <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full font-medium">
                ✓ Verified
              </span>
            )}
            {status === 'flagged' && (
              <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-medium">
                ⚠ Flagged
              </span>
            )}
          </div>
          <p className={`text-sm mt-1 ${statusCfg.color} opacity-80`}>{statusCfg.description}</p>
        </div>
      </div>

      {/* Flagged Warning */}
      {status === 'flagged' && (
        <div className="flex gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">
            This project has been flagged for review. Pledges and commitments are paused pending investigation. Please do not transfer any funds or resources outside the platform.
          </p>
        </div>
      )}

      {/* Submit for Review */}
      {isOwner && (status === 'unverified') && !submitSuccess && (
        <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
          <h3 className="font-semibold text-slate-700">Submit for Verification</h3>
          <p className="text-sm text-slate-500">
            Complete the checklist below, then submit your project for review by the Greenverse team. Verification increases supporter trust.
          </p>
          <p className="text-xs text-slate-400">
            Note: Verification is a human review process. Submitting does not guarantee approval.
          </p>
          {submitError && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {submitError}
            </p>
          )}
          <button
            onClick={handleSubmitForReview}
            disabled={submitLoading || passedCount < 3}
            className="flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50"
          >
            {submitLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Submit for Review
            <ChevronRight className="w-4 h-4" />
          </button>
          {passedCount < 3 && (
            <p className="text-xs text-amber-600">
              Complete at least 3 checklist items before submitting.
            </p>
          )}
        </div>
      )}

      {submitSuccess && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          <p className="text-sm text-emerald-700 font-medium">
            Submitted for review! The Greenverse team will assess your project.
          </p>
        </div>
      )}

      {/* Transparency Checklist */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-700">Transparency Checklist</h3>
          <span className={`text-sm font-medium ${passedCount >= 5 ? 'text-emerald-600' : passedCount >= 3 ? 'text-amber-600' : 'text-slate-500'}`}>
            {passedCount}/{checklist.length} complete
          </span>
        </div>
        <div className="divide-y divide-slate-50">
          {checklist.map(item => (
            <div key={item.key} className="flex items-center gap-3 px-5 py-3">
              {item.passed ? (
                <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-slate-300 flex-shrink-0" />
              )}
              <span className={`text-sm ${item.passed ? 'text-slate-700' : 'text-slate-400'}`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Evidence Documentation */}
      {project.cover_image_url && (
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="font-semibold text-slate-700 mb-3">Project Documentation</h3>
          <div className="flex items-center gap-3">
            <a
              href={project.cover_image_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700"
            >
              <ExternalLink className="w-4 h-4" />
              View Cover Image / Evidence
            </a>
          </div>
        </div>
      )}

      {/* Report Section */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-700 flex items-center gap-2">
            <Flag className="w-4 h-4 text-red-400" />
            Report a Concern
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Use this only for genuine concerns about this project's legitimacy.
          </p>
        </div>
        <div className="p-5">
          {reportSuccess ? (
            <div className="flex items-center gap-3 text-sm text-emerald-600">
              <CheckCircle className="w-4 h-4" />
              Report submitted. Our team will review it shortly.
            </div>
          ) : !showReportForm ? (
            <button
              onClick={() => setShowReportForm(true)}
              className="text-sm text-red-500 hover:text-red-600 font-medium flex items-center gap-1"
            >
              <Flag className="w-4 h-4" /> Report this project
            </button>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reason *</label>
                <select
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  value={reportReason}
                  onChange={e => setReportReason(e.target.value as ReportReason)}
                >
                  {REPORT_REASONS.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Details *</label>
                <textarea
                  rows={3}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
                  placeholder="Describe what you believe is inaccurate or concerning..."
                  value={reportDetails}
                  onChange={e => setReportDetails(e.target.value)}
                />
              </div>
              {reportError && <p className="text-sm text-red-600">{reportError}</p>}
              <div className="flex gap-2">
                <button
                  onClick={handleReport}
                  disabled={reportLoading || !reportDetails.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 disabled:opacity-50 font-medium"
                >
                  {reportLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Submit Report
                </button>
                <button
                  onClick={() => { setShowReportForm(false); setReportDetails(''); setReportError(null); }}
                  className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
