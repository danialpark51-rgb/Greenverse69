import React, { useState, useEffect } from 'react';
import {
  UserCheck, Save, AlertCircle, CheckCircle2, Loader2, X, Edit3, Plus
} from 'lucide-react';
import { fetchMyExpertProfile, upsertExpertProfile } from '../../services/economyService';
import { GreenExpertProfile, ExpertSpecialization } from '../../types/economy';

const SPECIALIZATIONS: { value: ExpertSpecialization; label: string }[] = [
  { value: 'arborist',                 label: 'Certified Arborist' },
  { value: 'botanist',                 label: 'Botanist & Flora' },
  { value: 'ecologist',                label: 'Ecologist / Soil Scientist' },
  { value: 'sustainability_consultant',label: 'Sustainability Consultant' },
  { value: 'gis_remote_sensing',       label: 'GIS & Remote Sensing' },
  { value: 'waste_recycling',          label: 'Circular Economy / Waste' },
  { value: 'climate_resilience',       label: 'Climate Resilience' },
  { value: 'biodiversity_specialist',  label: 'Biodiversity Specialist' },
];

const AVAILABILITY_OPTIONS = [
  { value: 'consultation_available', label: 'Available for Consultation' },
  { value: 'limited',                label: 'Limited Availability' },
  { value: 'unavailable',            label: 'Currently Unavailable' },
];

interface ExpertProfileEditorProps {
  currentUserId: string;
  currentUserName?: string;
  onClose: () => void;
  onSaved?: (profile: GreenExpertProfile) => void;
}

export const ExpertProfileEditor: React.FC<ExpertProfileEditorProps> = ({
  currentUserId, currentUserName, onClose, onSaved
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [certInput, setCertInput] = useState('');

  const [form, setForm] = useState({
    full_name:           currentUserName || '',
    title:               '',
    specialization:      'ecologist' as ExpertSpecialization,
    bio:                 '',
    years_experience:    0,
    hourly_rate:         0,
    currency:            'USD',
    availability:        'consultation_available' as GreenExpertProfile['availability'],
    location_name:       '',
    remote_available:    true,
    certifications:      [] as string[],
  });

  useEffect(() => {
    fetchMyExpertProfile(currentUserId).then(profile => {
      if (profile) {
        setForm({
          full_name:        profile.full_name,
          title:            profile.title,
          specialization:   profile.specialization,
          bio:              profile.bio,
          years_experience: profile.years_experience,
          hourly_rate:      profile.hourly_rate,
          currency:         profile.currency,
          availability:     profile.availability,
          location_name:    profile.location_name || '',
          remote_available: profile.remote_available,
          certifications:   profile.certifications,
        });
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [currentUserId]);

  const set = (k: keyof typeof form, v: any) => setForm(prev => ({ ...prev, [k]: v }));

  const addCert = () => {
    if (!certInput.trim()) return;
    setForm(prev => ({ ...prev, certifications: [...prev.certifications, certInput.trim()] }));
    setCertInput('');
  };

  const removeCert = (i: number) =>
    setForm(prev => ({ ...prev, certifications: prev.certifications.filter((_, idx) => idx !== i) }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name.trim() || !form.title.trim() || !form.bio.trim()) {
      setError('Name, title, and bio are required.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const saved = await upsertExpertProfile(form, currentUserId);
      setSaveSuccess(true);
      onSaved?.(saved);
      setTimeout(() => { setSaveSuccess(false); onClose(); }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mr-2" />
        <span className="text-sm text-slate-500">Loading profile…</span>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 overflow-y-auto py-8 px-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100">
          <X className="w-4 h-4 text-slate-500" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-emerald-100 rounded-2xl flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Expert Profile</h2>
            <p className="text-xs text-slate-500">Create or update your green expert listing. Verification is applied by moderators.</p>
          </div>
        </div>

        {saveSuccess ? (
          <div className="text-center py-8">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <p className="font-bold text-slate-900">Profile saved!</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                <input required value={form.full_name} onChange={e => set('full_name', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Professional Title *</label>
                <input required value={form.title} onChange={e => set('title', e.target.value)}
                  placeholder="e.g. Senior Ecologist"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-400" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Specialization *</label>
                <select value={form.specialization} onChange={e => set('specialization', e.target.value as ExpertSpecialization)}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-400">
                  {SPECIALIZATIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Availability</label>
                <select value={form.availability} onChange={e => set('availability', e.target.value as any)}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-400">
                  {AVAILABILITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Bio / Professional Summary *</label>
              <textarea required rows={3} value={form.bio} onChange={e => set('bio', e.target.value)}
                placeholder="Describe your expertise, background, and what you offer…"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-400" />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Years Experience</label>
                <input type="number" min={0} max={60} value={form.years_experience} onChange={e => set('years_experience', parseInt(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Hourly Rate</label>
                <input type="number" min={0} value={form.hourly_rate} onChange={e => set('hourly_rate', parseFloat(e.target.value) || 0)}
                  placeholder="0 = negotiable"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Currency</label>
                <select value={form.currency} onChange={e => set('currency', e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-400">
                  {['USD', 'EUR', 'GBP', 'INR', 'AUD', 'CAD'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
              <input value={form.location_name} onChange={e => set('location_name', e.target.value)}
                placeholder="City, Country (optional)"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-400" />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.remote_available} onChange={e => set('remote_available', e.target.checked)} className="rounded" />
              <span className="text-xs text-slate-700 font-medium">Available for remote consultations</span>
            </label>

            {/* Certifications */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Certifications / Credentials</label>
              <div className="flex gap-2 mb-2">
                <input value={certInput} onChange={e => setCertInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCert(); } }}
                  placeholder="e.g. ISA Certified Arborist"
                  className="flex-1 px-3.5 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-400" />
                <button type="button" onClick={addCert}
                  className="px-3 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {form.certifications.map((c, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[11px] border border-blue-200">
                    {c}
                    <button type="button" onClick={() => removeCert(i)} className="ml-0.5 hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                ⚠ Credentials are self-reported. "Verified" status is only shown after moderation confirms them.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />{error}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={onClose} className="px-4 py-2 text-xs text-slate-600 font-semibold">Cancel</button>
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 disabled:opacity-60">
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save Profile
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
