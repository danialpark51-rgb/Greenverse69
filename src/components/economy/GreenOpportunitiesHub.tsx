import React, { useState, useEffect } from 'react';
import {
  GraduationCap, Search, Bookmark, ExternalLink, Clock, Building2,
  CheckCircle2, AlertCircle, Loader2, Flag, X
} from 'lucide-react';
import {
  fetchOpportunities,
  toggleBookmarkOpportunity,
  trackOpportunityApplication,
  reportOpportunity
} from '../../services/economyService';
import { GreenOpportunity, OpportunityType } from '../../types/economy';

interface GreenOpportunitiesHubProps {
  currentUserId?: string;
  currentUserName?: string;
}

const OPP_TYPES: { key: OpportunityType | 'all'; label: string }[] = [
  { key: 'all', label: 'All Opportunities' },
  { key: 'fellowship', label: 'Fellowships' },
  { key: 'grant', label: 'Grants & Funding' },
  { key: 'internship', label: 'Internships' },
  { key: 'scholarship', label: 'Scholarships' },
  { key: 'competition', label: 'Competitions' },
  { key: 'training', label: 'Training Programs' },
  { key: 'workshop', label: 'Workshops' },
  { key: 'volunteer', label: 'Volunteer Programs' },
];

export const GreenOpportunitiesHub: React.FC<GreenOpportunitiesHubProps> = ({ currentUserId }) => {
  const [opportunities, setOpportunities] = useState<GreenOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected Detail Modal
  const [activeOpp, setActiveOpp] = useState<GreenOpportunity | null>(null);

  // Report Modal
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('expired');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchOpportunities(selectedType, searchTerm);
      setOpportunities(data);
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedType, searchTerm]);

  const handleBookmark = async (e: React.MouseEvent, oppId: string) => {
    e.stopPropagation();
    await toggleBookmarkOpportunity(oppId);
    setOpportunities(prev => prev.map(o => o.id === oppId ? { ...o, is_bookmarked: !o.is_bookmarked } : o));
  };

  const handleTrackStatus = async (oppId: string, status: any) => {
    await trackOpportunityApplication(oppId, status);
    setOpportunities(prev => prev.map(o => o.id === oppId ? { ...o, user_application_status: status } : o));
    if (activeOpp && activeOpp.id === oppId) {
      setActiveOpp(prev => prev ? { ...prev, user_application_status: status } : null);
    }
  };

  const handleReport = async () => {
    if (!activeOpp) return;
    await reportOpportunity(activeOpp.id, reportReason, reportDetails, currentUserId);
    setReportSuccess(true);
    setTimeout(() => {
      setReportSuccess(false);
      setShowReportModal(false);
      setReportDetails('');
    }, 1800);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-emerald-600" />
          Environmental Opportunities & Programs
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Internships, research fellowships, restoration grants, scholarships, and competitive environmental challenges.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search programs by keyword, organization, or focus area..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {OPP_TYPES.map(t => (
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
      </div>

      {/* Opportunities List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mr-2" />
          <span className="text-sm text-slate-600">Loading opportunities...</span>
        </div>
      ) : opportunities.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8">
          <GraduationCap className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-800">No matching opportunities found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {opportunities.map(opp => (
            <div
              key={opp.id}
              onClick={() => setActiveOpp(opp)}
              className="bg-white border border-slate-200 hover:border-emerald-500/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    {opp.opportunity_type}
                  </span>
                  <button
                    onClick={e => handleBookmark(e, opp.id)}
                    className="text-slate-400 hover:text-amber-500 transition p-1"
                  >
                    <Bookmark className={`w-4 h-4 ${opp.is_bookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
                  </button>
                </div>

                <h3 className="font-bold text-slate-900 text-sm line-clamp-2 mb-1">{opp.title}</h3>
                <p className="text-xs text-slate-500 font-medium mb-3 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  {opp.organization_name}
                </p>
                <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                  {opp.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2">
                {opp.funding_or_stipend && (
                  <div className="text-xs font-semibold text-emerald-700">
                    {opp.funding_or_stipend}
                  </div>
                )}
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Deadline: {opp.deadline ? new Date(opp.deadline).toLocaleDateString() : 'Rolling'}
                  </span>
                  {opp.user_application_status && (
                    <span className="font-medium text-emerald-600 uppercase text-[9px] bg-emerald-50 px-2 py-0.5 rounded-full">
                      {opp.user_application_status}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {activeOpp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-medium uppercase text-[10px]">
                  {activeOpp.opportunity_type}
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-1">{activeOpp.title}</h2>
                <p className="text-xs text-slate-500 font-medium">{activeOpp.organization_name}</p>
              </div>
              <button onClick={() => setActiveOpp(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">Program Overview</h4>
                <p>{activeOpp.description}</p>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 mb-1">Eligibility Criteria</h4>
                <p className="bg-slate-50 p-3 rounded-xl text-slate-600 text-xs">{activeOpp.eligibility}</p>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 mb-1">Application Instructions</h4>
                <p className="text-xs text-slate-600">{activeOpp.application_instructions}</p>
              </div>

              {activeOpp.funding_or_stipend && (
                <div className="bg-emerald-50/60 border border-emerald-100 p-3 rounded-xl text-xs text-emerald-800">
                  <strong>Financial Support / Grant:</strong> {activeOpp.funding_or_stipend}
                </div>
              )}

              {/* Personal Application Tracking */}
              <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-2">
                <h4 className="font-semibold text-slate-800">Track Your Application Status</h4>
                <div className="flex flex-wrap gap-1.5">
                  {(['interested', 'applied', 'interviewing', 'accepted', 'declined'] as const).map(st => (
                    <button
                      key={st}
                      onClick={() => handleTrackStatus(activeOpp.id, st)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition ${
                        activeOpp.user_application_status === st
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                onClick={() => setShowReportModal(true)}
                className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1"
              >
                <Flag className="w-3.5 h-3.5" /> Report Issue
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveOpp(null)}
                  className="px-4 py-2 text-xs text-slate-600 hover:text-slate-800"
                >
                  Close
                </button>
                {activeOpp.external_link && (
                  <a
                    href={activeOpp.external_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition"
                  >
                    <span>External Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && activeOpp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-5 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Report Opportunity</h3>
            {reportSuccess ? (
              <p className="text-xs text-emerald-600 font-medium">Thank you. Report received for community moderation.</p>
            ) : (
              <>
                <div className="space-y-2 text-xs">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Reason</label>
                    <select
                      value={reportReason}
                      onChange={e => setReportReason(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                    >
                      <option value="expired">Opportunity has expired / closed</option>
                      <option value="misleading">Misleading or inaccurate requirements</option>
                      <option value="broken_link">Broken or suspicious application link</option>
                      <option value="other">Other concern</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Details</label>
                    <textarea
                      rows={2}
                      value={reportDetails}
                      onChange={e => setReportDetails(e.target.value)}
                      placeholder="Briefly describe the issue..."
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg resize-none"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button onClick={() => setShowReportModal(false)} className="px-3 py-1 text-xs text-slate-500">Cancel</button>
                  <button onClick={handleReport} className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700">
                    Submit Report
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
