import React, { useState, useEffect } from 'react';
import {
  UserCheck, Search, Star, MapPin, Award, CheckCircle2, Bookmark,
  Send, DollarSign, Loader2, Calendar, MessageSquare, X, AlertCircle, PlusCircle
} from 'lucide-react';
import {
  fetchExpertProfiles,
  sendExpertInquiry,
  toggleBookmarkExpert
} from '../../services/economyService';
import { GreenExpertProfile, ExpertSpecialization } from '../../types/economy';
import { ExpertProfileEditor } from './ExpertProfileEditor';

interface GreenExpertDirectoryProps {
  currentUserId?: string;
  currentUserName?: string;
}

const SPECIALIZATIONS: { key: ExpertSpecialization | 'all'; label: string }[] = [
  { key: 'all', label: 'All Specializations' },
  { key: 'arborist', label: 'Certified Arborist' },
  { key: 'botanist', label: 'Botanist & Flora' },
  { key: 'ecologist', label: 'Wetland & Soil Ecologist' },
  { key: 'sustainability_consultant', label: 'Sustainability Consultant' },
  { key: 'gis_remote_sensing', label: 'GIS & Remote Sensing' },
  { key: 'biodiversity_specialist', label: 'Biodiversity Specialist' },
  { key: 'waste_recycling', label: 'Circular Waste Expert' },
];

export const GreenExpertDirectory: React.FC<GreenExpertDirectoryProps> = ({ currentUserId, currentUserName }) => {
  const [experts, setExperts] = useState<GreenExpertProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpec, setSelectedSpec] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Inquiry Modal State
  const [activeExpert, setActiveExpert] = useState<GreenExpertProfile | null>(null);
  const [inquiryForm, setInquiryForm] = useState({
    sender_name: currentUserName || '',
    sender_email: '',
    topic: '',
    message: '',
    preferred_date: '',
  });
  const [inquiryLoading, setInquiryLoading] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const [inquiryError, setInquiryError] = useState<string | null>(null);
  const [showProfileEditor, setShowProfileEditor] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchExpertProfiles(selectedSpec, searchTerm);
      setExperts(data);
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedSpec, searchTerm]);

  const handleBookmark = async (expertId: string) => {
    await toggleBookmarkExpert(expertId);
    setExperts(prev => prev.map(e => e.id === expertId ? { ...e, is_bookmarked: !e.is_bookmarked } : e));
  };

  const handleSendInquiry = async () => {
    if (!activeExpert) return;
    setInquiryLoading(true);
    setInquiryError(null);
    try {
      await sendExpertInquiry(
        activeExpert.id,
        inquiryForm,
        currentUserId
      );
      setInquirySuccess(true);
      setTimeout(() => {
        setInquirySuccess(false);
        setActiveExpert(null);
        setInquiryForm({ sender_name: currentUserName || '', sender_email: '', topic: '', message: '', preferred_date: '' });
      }, 1800);
    } catch (err: any) {
      setInquiryError(err?.message || 'Failed to submit consultation inquiry. Please try again.');
    } finally {
      setInquiryLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-600" />
            Green Expert Directory & Professional Network
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Consult with vetted arborists, ecologists, soil scientists, and spatial sustainability specialists.
          </p>
        </div>
        {currentUserId && (
          <button
            onClick={() => setShowProfileEditor(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition shrink-0"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            List Your Profile
          </button>
        )}
      </div>
      {showProfileEditor && (
        <ExpertProfileEditor
          currentUserId={currentUserId!}
          currentUserName={currentUserName}
          onClose={() => setShowProfileEditor(false)}
          onSaved={() => { setShowProfileEditor(false); loadData(); }}
        />
      )}

      {/* Search & Filter */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search experts by name, specialty, bio, or credentials..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {SPECIALIZATIONS.map(s => (
            <button
              key={s.key}
              onClick={() => setSelectedSpec(s.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedSpec === s.key
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Directory Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mr-2" />
          <span className="text-sm text-slate-600">Loading professional directory...</span>
        </div>
      ) : experts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8">
          <UserCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-800">No experts found in this category</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {experts.map(exp => (
            <div
              key={exp.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900">{exp.full_name}</span>
                    {exp.verification_status === 'verified' && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleBookmark(exp.id)}
                    className="text-slate-400 hover:text-amber-500 transition p-1"
                  >
                    <Bookmark className={`w-4 h-4 ${exp.is_bookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
                  </button>
                </div>

                <p className="text-xs text-emerald-700 font-medium mb-2">{exp.title}</p>
                <p className="text-xs text-slate-600 leading-relaxed mb-4 line-clamp-3">{exp.bio}</p>

                {/* Certifications list */}
                {exp.certifications?.length > 0 && (
                  <div className="mb-4 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Certifications</span>
                    <div className="flex flex-wrap gap-1">
                      {exp.certifications.map((c, i) => (
                        <span key={i} className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="font-semibold text-emerald-700">
                    {exp.hourly_rate > 0 ? `$${exp.hourly_rate} / hr` : 'Pro-Bono / Community'}
                  </span>
                  <span className="flex items-center gap-1 text-slate-500">
                    <MapPin className="w-3.5 h-3.5" />
                    {exp.location_name}
                  </span>
                </div>

                <button
                  onClick={() => setActiveExpert(exp)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Request Consultation / Inquiry
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inquiry Modal */}
      {activeExpert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Contact {activeExpert.full_name}</h3>
                <p className="text-xs text-slate-500 font-medium">{activeExpert.title}</p>
              </div>
              <button onClick={() => setActiveExpert(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {inquiryError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{inquiryError}</span>
              </div>
            )}
            {inquirySuccess ? (
              <div className="text-center py-6">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
                <p className="font-bold text-slate-800">Inquiry Sent!</p>
                <p className="text-xs text-slate-500 mt-1">The expert has received your consultation request.</p>
              </div>
            ) : (
              <>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Your Name *</label>
                    <input
                      type="text"
                      value={inquiryForm.sender_name}
                      onChange={e => setInquiryForm(p => ({ ...p, sender_name: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Email Address *</label>
                    <input
                      type="email"
                      value={inquiryForm.sender_email}
                      onChange={e => setInquiryForm(p => ({ ...p, sender_email: e.target.value }))}
                      placeholder="your@email.com"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Consultation Topic *</label>
                    <input
                      type="text"
                      placeholder="e.g. Riparian tree disease evaluation or soil test review"
                      value={inquiryForm.topic}
                      onChange={e => setInquiryForm(p => ({ ...p, topic: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Project Details / Message *</label>
                    <textarea
                      rows={3}
                      placeholder="Describe your site, species involved, and timeline..."
                      value={inquiryForm.message}
                      onChange={e => setInquiryForm(p => ({ ...p, message: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg resize-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button onClick={() => setActiveExpert(null)} className="px-3 py-1.5 text-xs text-slate-600">Cancel</button>
                  <button
                    onClick={handleSendInquiry}
                    disabled={inquiryLoading || !inquiryForm.sender_name || !inquiryForm.topic || !inquiryForm.message}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {inquiryLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Send Consultation Request
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
