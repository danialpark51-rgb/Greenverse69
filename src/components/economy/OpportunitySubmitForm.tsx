import React, { useState } from 'react';
import { GraduationCap, AlertCircle, CheckCircle2, Loader2, ExternalLink, X } from 'lucide-react';
import { submitOpportunity } from '../../services/economyService';

const OPP_TYPES = [
  'internship', 'scholarship', 'grant', 'fellowship', 'volunteer',
  'competition', 'training', 'workshop', 'research', 'course'
];

interface OpportunitySubmitFormProps {
  onClose: () => void;
  onSubmitted?: () => void;
}

export const OpportunitySubmitForm: React.FC<OpportunitySubmitFormProps> = ({ onClose, onSubmitted }) => {
  const [form, setForm] = useState({
    title: '',
    opportunity_type: 'internship',
    organization: '',
    description: '',
    eligibility: '',
    deadline: '',
    external_link: '',
    location_name: '',
    is_remote: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const set = (k: keyof typeof form, v: string | boolean) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.organization.trim() || !form.description.trim()) {
      setError('Title, organization, and description are required.');
      return;
    }
    setSubmitting(true);
    setError(null);
    const result = await submitOpportunity({
      ...form,
      deadline: form.deadline ? new Date(form.deadline).toISOString() : undefined,
    });
    if (result.success) {
      setSuccess(true);
      setTimeout(() => { onSubmitted?.(); onClose(); }, 2000);
    } else {
      setError(result.error || 'Submission failed.');
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 overflow-y-auto py-8 px-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100">
          <X className="w-4 h-4 text-slate-500" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-emerald-100 rounded-2xl flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Submit an Opportunity</h2>
            <p className="text-xs text-slate-500">Submitted listings go into pending review before publication.</p>
          </div>
        </div>

        {success ? (
          <div className="text-center py-8">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <p className="font-bold text-slate-900">Opportunity submitted!</p>
            <p className="text-xs text-slate-500 mt-1">It will appear after moderation review.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Title *</label>
              <input required value={form.title} onChange={e => set('title', e.target.value)}
                placeholder="e.g. Climate Research Fellowship 2027"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-400" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Type *</label>
                <select value={form.opportunity_type} onChange={e => set('opportunity_type', e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-400">
                  {OPP_TYPES.map(t => (
                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Organization *</label>
                <input required value={form.organization} onChange={e => set('organization', e.target.value)}
                  placeholder="Issuing organization"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Description *</label>
              <textarea required rows={3} value={form.description} onChange={e => set('description', e.target.value)}
                placeholder="Describe what this opportunity offers…"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-400" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Eligibility</label>
              <input value={form.eligibility} onChange={e => set('eligibility', e.target.value)}
                placeholder="Who can apply? (e.g. undergraduate students, NGOs…)"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-400" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Application Deadline</label>
                <input type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                <input value={form.location_name} onChange={e => set('location_name', e.target.value)}
                  placeholder="City or Country"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">External Application Link</label>
              <div className="relative">
                <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="url" value={form.external_link} onChange={e => set('external_link', e.target.value)}
                  placeholder="https://…"
                  className="w-full pl-9 pr-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-400" />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">External links open safely in a new tab and are not misrepresented as internal applications.</p>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_remote} onChange={e => set('is_remote', e.target.checked)}
                className="rounded border-slate-300" />
              <span className="text-xs text-slate-700 font-medium">Remote / online participation available</span>
            </label>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />{error}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={onClose} className="px-4 py-2 text-xs text-slate-600 font-semibold">Cancel</button>
              <button type="submit" disabled={submitting}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 disabled:opacity-60">
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Submit for Review
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
