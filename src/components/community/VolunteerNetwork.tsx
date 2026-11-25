import React, { useState, useEffect, useCallback } from 'react';
import {
  Heart,
  MapPin,
  Calendar,
  Users,
  Clock,
  Plus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Filter,
  RefreshCw,
} from 'lucide-react';
import {
  fetchVolunteerOpportunities,
  createVolunteerOpportunity,
  registerForOpportunity,
  cancelVolunteerRegistration,
  fetchMyVolunteerRegistrations,
} from '../../services/communityService';import type { DbVolunteerOpportunity } from '../../types/community';

// ─── Badge variants matching design system ────────────────────────────────────
const STATUS_STYLES: Record<string, string> = {
  open: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
  full: 'bg-amber-50 text-amber-800 border border-amber-200',
  completed: 'bg-slate-100 text-slate-600 border border-slate-200',
  cancelled: 'bg-rose-50 text-rose-700 border border-rose-200',
};

function CapacityBar({ current, max }: { current: number; max: number }) {
  const pct = max > 0 ? Math.min(100, Math.round((current / max) * 100)) : 0;
  const color = pct >= 100 ? 'bg-rose-500' : pct >= 75 ? 'bg-amber-500' : 'bg-emerald-500';
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-slate-500 mb-1">
        <span>{current} registered</span>
        <span>{max} spots</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

interface OpportunityCardProps {
  opp: DbVolunteerOpportunity;
  userId: string;
  userName: string;
  registeredIds: Set<string>;
  onRegistered: (id: string) => void;
  onCancelled: (id: string) => void;
}

function OpportunityCard({ opp, userId, userName, registeredIds, onRegistered, onCancelled }: OpportunityCardProps) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const isRegistered = registeredIds.has(opp.id);

  const handleRegister = async () => {
    if (!userId || userId === 'demo-user-id') {
      setMsg({ type: 'error', text: 'You must be signed in to volunteer.' });
      return;
    }
    setLoading(true);
    setMsg(null);
    const { success, error } = await registerForOpportunity(opp.id, userId, userName);
    setLoading(false);
    if (success) {
      onRegistered(opp.id);
      setMsg({ type: 'success', text: 'You\'re registered! Check your email for details.' });
    } else {
      setMsg({ type: 'error', text: error ?? 'Registration failed.' });
    }
  };

  const handleCancel = async () => {
    setLoading(true);
    setMsg(null);
    const { success, error } = await cancelVolunteerRegistration(opp.id, userId);
    setLoading(false);
    if (success) {
      onCancelled(opp.id);
      setMsg({ type: 'success', text: 'Registration cancelled.' });
    } else {
      setMsg({ type: 'error', text: error ?? 'Could not cancel.' });
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide mb-1.5 ${STATUS_STYLES[opp.status]}`}>
            {opp.status}
          </span>
          <h3 className="text-sm font-bold text-slate-900 leading-tight line-clamp-2">{opp.title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">by {opp.organizer_name}</p>
        </div>
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
          <Heart className="w-5 h-5 text-emerald-600" />
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">{opp.description}</p>

      {/* Meta */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span>
            {new Date(opp.opportunity_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            {opp.start_time ? ` · ${opp.start_time}` : ''}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span className="truncate">{opp.location_name}</span>
        </div>
        {opp.skills_needed.length > 0 && (
          <div className="flex items-start gap-2 text-xs text-slate-500">
            <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
            <div className="flex flex-wrap gap-1">
              {opp.skills_needed.map(s => (
                <span key={s} className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] text-slate-700">{s}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Capacity */}
      <CapacityBar current={opp.current_volunteers_count} max={opp.max_volunteers} />

      {/* Feedback */}
      {msg && (
        <div className={`flex items-center gap-2 text-xs rounded-lg px-3 py-2 ${
          msg.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
        }`}>
          {msg.type === 'success' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
          {msg.text}
        </div>
      )}

      {/* Action */}
      {opp.status === 'open' && (
        isRegistered ? (
          <button
            onClick={handleCancel}
            disabled={loading}
            className="w-full py-2 px-4 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
            Cancel Registration
          </button>
        ) : (
          <button
            onClick={handleRegister}
            disabled={loading || opp.current_volunteers_count >= opp.max_volunteers}
            className="w-full py-2 px-4 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Heart className="w-3.5 h-3.5" />}
            {opp.current_volunteers_count >= opp.max_volunteers ? 'Full' : 'Volunteer'}
          </button>
        )
      )}
    </div>
  );
}

// ─── Create Opportunity Form ──────────────────────────────────────────────────
interface CreateFormProps {
  userId: string;
  userName: string;
  onCreated: (opp: DbVolunteerOpportunity) => void;
  onClose: () => void;
}

function CreateOpportunityForm({ userId, userName, onCreated, onClose }: CreateFormProps) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    location_name: '',
    opportunity_date: '',
    start_time: '',
    max_volunteers: 20,
    skills_needed: '',
    organizer_name: userName,
  });
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.location_name || !form.opportunity_date) {
      setErr('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    setErr(null);
    const skills = form.skills_needed.split(',').map(s => s.trim()).filter(Boolean);
    const { data, error } = await createVolunteerOpportunity(
      {
        community_id: null,
        organizer_id: userId,
        organizer_name: form.organizer_name || userName,
        title: form.title,
        description: form.description,
        location_name: form.location_name,
        latitude: null,
        longitude: null,
        opportunity_date: form.opportunity_date,
        start_time: form.start_time || null,
        skills_needed: skills,
        max_volunteers: Number(form.max_volunteers),
        status: 'open',
      },
      userId
    );
    setSubmitting(false);
    if (data) {
      onCreated(data);
    } else {
      setErr(error ?? 'Failed to create opportunity.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 md:p-8">
        <h3 className="text-lg font-bold text-slate-900 mb-1">Post a Volunteer Opportunity</h3>
        <p className="text-xs text-slate-500 mb-6">
          Opportunities are visible to all Greenverse members. Only post real environmental activities.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Title *</label>
            <input
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g., Tree Planting Drive at City Park"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description *</label>
            <textarea
              rows={3}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Describe the activity, what volunteers will do, and what to bring."
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date *</label>
              <input
                type="date"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={form.opportunity_date}
                onChange={e => setForm(f => ({ ...f, opportunity_date: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time</label>
              <input
                type="time"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={form.start_time}
                onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Location *</label>
            <input
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={form.location_name}
              onChange={e => setForm(f => ({ ...f, location_name: e.target.value }))}
              placeholder="e.g., Cubbon Park, Bangalore"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Max Volunteers</label>
              <input
                type="number"
                min={1}
                max={500}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={form.max_volunteers}
                onChange={e => setForm(f => ({ ...f, max_volunteers: Number(e.target.value) }))}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name</label>
              <input
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={form.organizer_name}
                onChange={e => setForm(f => ({ ...f, organizer_name: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Skills Needed (comma-separated)</label>
            <input
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={form.skills_needed}
              onChange={e => setForm(f => ({ ...f, skills_needed: e.target.value }))}
              placeholder="e.g., Digging, Watering, Photography"
            />
          </div>

          {err && (
            <div className="flex items-center gap-2 text-xs text-rose-700 bg-rose-50 rounded-xl px-3 py-2">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              {err}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              Post Opportunity
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface VolunteerNetworkProps {
  userId: string;
  userName: string;
}

export const VolunteerNetwork: React.FC<VolunteerNetworkProps> = ({ userId, userName }) => {
  const [opportunities, setOpportunities] = useState<DbVolunteerOpportunity[]>([]);
  const [registeredIds, setRegisteredIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [fromSupabase, setFromSupabase] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('open');
  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await fetchVolunteerOpportunities({ status: statusFilter || undefined });
    setOpportunities(result.data);
    setFromSupabase(result.fromSupabase);
    setLoading(false);

    // Load user registrations
    if (userId && userId !== 'demo-user-id') {
      const regs = await fetchMyVolunteerRegistrations(userId);
      setRegisteredIds(new Set(regs.filter(r => r.status === 'registered').map(r => r.opportunity_id)));
    }
  }, [userId, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleRegistered = (id: string) => {
    setRegisteredIds(prev => new Set([...prev, id]));
    setOpportunities(prev =>
      prev.map(o => o.id === id ? { ...o, current_volunteers_count: o.current_volunteers_count + 1 } : o)
    );
  };

  const handleCancelled = (id: string) => {
    setRegisteredIds(prev => { const s = new Set(prev); s.delete(id); return s; });
    setOpportunities(prev =>
      prev.map(o => o.id === id ? { ...o, current_volunteers_count: Math.max(0, o.current_volunteers_count - 1) } : o)
    );
  };

  const handleCreated = (opp: DbVolunteerOpportunity) => {
    setOpportunities(prev => [opp, ...prev]);
    setShowCreate(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-2 border border-emerald-100">
              <Heart className="w-3.5 h-3.5" />
              Volunteer Network
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">Environmental Volunteer Opportunities</h2>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              Opportunities submitted by community organizers.{' '}
              <span className="text-amber-700 font-medium">Greenverse does not verify or guarantee real-world event details.</span>
            </p>
          </div>
          {userId && userId !== 'demo-user-id' && (
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Post Opportunity
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="mt-5 flex items-center gap-2 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          {(['', 'open', 'full', 'completed', 'cancelled'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                statusFilter === s
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
          <button
            onClick={load}
            className="ml-auto p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Offline notice */}
      {!fromSupabase && (
        <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          Could not reach Supabase. Showing locally created opportunities only. Connect to load full data.
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      ) : opportunities.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-50 flex items-center justify-center">
            <Heart className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-2">No opportunities yet</h3>
          <p className="text-sm text-slate-500 max-w-xs mx-auto">
            {userId && userId !== 'demo-user-id'
              ? 'Be the first to post a volunteer opportunity for the Greenverse community.'
              : 'Sign in to post a volunteer opportunity.'}
          </p>
          {userId && userId !== 'demo-user-id' && (
            <button
              onClick={() => setShowCreate(true)}
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Post First Opportunity
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {opportunities.map(opp => (
            <OpportunityCard
              key={opp.id}
              opp={opp}
              userId={userId}
              userName={userName}
              registeredIds={registeredIds}
              onRegistered={handleRegistered}
              onCancelled={handleCancelled}
            />
          ))}
        </div>
      )}

      {showCreate && (
        <CreateOpportunityForm
          userId={userId}
          userName={userName}
          onCreated={handleCreated}
          onClose={() => setShowCreate(false)}
        />
      )}
    </div>
  );
};
