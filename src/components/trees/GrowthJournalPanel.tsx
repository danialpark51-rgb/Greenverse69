import React, { useEffect, useState } from 'react';
import { DbGrowthLog, CreateGrowthLogInput, HealthStatus } from '../../types/tree';
import { fetchGrowthLogs, createGrowthLog } from '../../services/treeService';
import { Button } from '../common/Button';
import { TrendingUp, Plus, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface GrowthJournalPanelProps {
  treeId: string;
  userId?: string;
}

const HEALTH_OPTIONS: HealthStatus[] = ['thriving', 'stable', 'attention_required', 'critical'];

export const GrowthJournalPanel: React.FC<GrowthJournalPanelProps> = ({ treeId, userId }) => {
  const [logs, setLogs] = useState<DbGrowthLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'warn'; msg: string } | null>(null);

  const [form, setForm] = useState<CreateGrowthLogInput>({
    tree_id: treeId,
    recorded_date: new Date().toISOString().split('T')[0],
    health_status: 'stable',
    observations: '',
    height_meters: undefined,
    dbh_cm: undefined,
  });

  useEffect(() => {
    setLoading(true);
    fetchGrowthLogs(treeId).then((data) => {
      setLogs(data);
      setLoading(false);
    });
  }, [treeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.observations?.trim()) {
      setFeedback({ type: 'error', msg: 'Please add an observation note.' });
      return;
    }
    setSubmitting(true);
    setFeedback(null);
    const { data, error } = await createGrowthLog(form, userId);
    setSubmitting(false);
    if (data) {
      setLogs((prev) => [data, ...prev]);
      setShowForm(false);
      setFeedback(error
        ? { type: 'warn', msg: 'Logged locally (migration pending — run SQL in Supabase).' }
        : { type: 'success', msg: 'Growth update saved successfully.' }
      );
      setForm({ ...form, observations: '', height_meters: undefined, dbh_cm: undefined });
    } else {
      setFeedback({ type: 'error', msg: error?.message || 'Could not save growth log.' });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-forest-700" />
          Growth Journal
        </div>
        <Button variant="outline" size="sm" icon={<Plus className="w-3.5 h-3.5" />}
          className="text-xs" onClick={() => setShowForm((v) => !v)}>
          Log Update
        </Button>
      </div>

      {feedback && (
        <div className={`flex items-start gap-2 p-3 rounded-lg text-xs border ${
          feedback.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
          feedback.type === 'warn' ? 'bg-amber-50 border-amber-200 text-amber-800' :
          'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{feedback.msg}</span>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="p-4 bg-sage-50 rounded-xl border border-sage-200 space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Date</label>
              <input type="date" value={form.recorded_date}
                onChange={(e) => setForm({ ...form, recorded_date: e.target.value })}
                className="w-full border border-sage-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-forest-500" required />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Health Status</label>
              <select value={form.health_status}
                onChange={(e) => setForm({ ...form, health_status: e.target.value as HealthStatus })}
                className="w-full border border-sage-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-forest-500">
                {HEALTH_OPTIONS.map((o) => (
                  <option key={o} value={o}>{o.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Height (m)</label>
              <input type="number" step="0.01" min="0" placeholder="e.g. 2.4"
                value={form.height_meters ?? ''}
                onChange={(e) => setForm({ ...form, height_meters: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full border border-sage-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-forest-500" />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Stem Diameter / DBH (cm)</label>
              <input type="number" step="0.1" min="0" placeholder="e.g. 5.2"
                value={form.dbh_cm ?? ''}
                onChange={(e) => setForm({ ...form, dbh_cm: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full border border-sage-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-forest-500" />
            </div>
          </div>
          <div>
            <label className="block text-slate-600 font-medium mb-1">Observations <span className="text-rose-500">*</span></label>
            <textarea rows={3} placeholder="Describe leaf health, root exposure, pest signs, new growth..."
              value={form.observations}
              onChange={(e) => setForm({ ...form, observations: e.target.value })}
              className="w-full border border-sage-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-forest-500 resize-none" required />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit" variant="primary" size="sm" isLoading={submitting}>Save Log</Button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-xs text-slate-500 py-4">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading growth history...
        </div>
      ) : logs.length === 0 ? (
        <div className="text-xs text-slate-500 py-4 text-center bg-sage-50/50 rounded-xl border border-dashed border-sage-200">
          No growth entries yet. Log the first update above.
        </div>
      ) : (
        <div className="relative pl-4 space-y-3 border-l-2 border-forest-100">
          {logs.map((log) => (
            <div key={log.id} className="relative">
              <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-forest-600 border-2 border-white" />
              <div className="p-3 bg-white rounded-xl border border-sage-200 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">{log.recorded_date}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    log.health_status === 'thriving' ? 'bg-emerald-100 text-emerald-800' :
                    log.health_status === 'stable' ? 'bg-forest-100 text-forest-800' :
                    log.health_status === 'attention_required' ? 'bg-amber-100 text-amber-800' :
                    'bg-rose-100 text-rose-800'
                  }`}>{log.health_status.replace('_', ' ')}</span>
                </div>
                {(log.height_meters || log.dbh_cm) && (
                  <div className="flex gap-3 text-slate-500">
                    {log.height_meters && <span>↕ {log.height_meters} m</span>}
                    {log.dbh_cm && <span>⌀ {log.dbh_cm} cm DBH</span>}
                  </div>
                )}
                {log.observations && (
                  <p className="text-slate-600 leading-relaxed">{log.observations}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
