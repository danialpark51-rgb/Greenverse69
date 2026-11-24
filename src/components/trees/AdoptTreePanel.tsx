import React, { useEffect, useState } from 'react';
import { DbAdoption, AdoptTreeInput } from '../../types/tree';
import { fetchTreeAdoptions, adoptTree } from '../../services/treeService';
import { Button } from '../common/Button';
import { Heart, User2, AlertCircle, CheckCircle2, Loader2, Plus } from 'lucide-react';

interface AdoptTreePanelProps {
  treeId: string;
  userId?: string;
  userEmail?: string;
}

export const AdoptTreePanel: React.FC<AdoptTreePanelProps> = ({ treeId, userId, userEmail }) => {
  const [adoptions, setAdoptions] = useState<DbAdoption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'warn'; msg: string } | null>(null);
  const [form, setForm] = useState<Omit<AdoptTreeInput, 'tree_id'>>({
    guardian_name: '',
    guardian_message: '',
  });

  useEffect(() => {
    fetchTreeAdoptions(treeId).then((data) => {
      setAdoptions(data);
      setLoading(false);
    });
  }, [treeId]);

  const alreadyAdopted = userId
    ? adoptions.some((a) => a.user_id === userId && a.status === 'active')
    : false;

  const handleAdopt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      setFeedback({ type: 'error', msg: 'You must be signed in to become a guardian.' });
      return;
    }
    if (!form.guardian_name.trim()) {
      setFeedback({ type: 'error', msg: 'Please enter your guardian name.' });
      return;
    }
    setSubmitting(true);
    setFeedback(null);
    const { data, error } = await adoptTree(
      { tree_id: treeId, guardian_name: form.guardian_name, guardian_message: form.guardian_message },
      userId
    );
    setSubmitting(false);
    if (data) {
      setAdoptions((prev) => [data, ...prev]);
      setShowForm(false);
      setFeedback(error
        ? { type: 'warn', msg: 'Recorded locally (Supabase migration may still be pending).' }
        : { type: 'success', msg: 'You are now a community guardian of this tree!' }
      );
    } else {
      setFeedback({ type: 'error', msg: error?.message || 'Could not complete adoption.' });
    }
  };

  const activeGuardians = adoptions.filter((a) => a.status === 'active');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
          <Heart className="w-4 h-4 text-rose-500" />
          Community Guardians
          {activeGuardians.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-rose-100 text-rose-700 rounded-full text-[10px] font-bold">
              {activeGuardians.length}
            </span>
          )}
        </div>
        {!alreadyAdopted && userId && (
          <Button variant="outline" size="sm" icon={<Plus className="w-3.5 h-3.5" />}
            className="text-xs" onClick={() => setShowForm((v) => !v)}>
            Become Guardian
          </Button>
        )}
      </div>

      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-800">
        <strong>Note:</strong> Community guardianship is a voluntary commitment within the Greenverse platform. It does not constitute legal tree protection or ownership.
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
        <form onSubmit={handleAdopt} className="p-4 bg-rose-50/60 rounded-xl border border-rose-200 space-y-3 text-xs">
          <div>
            <label className="block text-slate-600 font-medium mb-1">Your Guardian Name <span className="text-rose-500">*</span></label>
            <input type="text" placeholder="e.g. Elena Vasquez"
              value={form.guardian_name}
              onChange={(e) => setForm({ ...form, guardian_name: e.target.value })}
              className="w-full border border-rose-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-rose-400" required />
          </div>
          <div>
            <label className="block text-slate-600 font-medium mb-1">Message (optional)</label>
            <textarea rows={2} placeholder="Why are you adopting this tree?"
              value={form.guardian_message}
              onChange={(e) => setForm({ ...form, guardian_message: e.target.value })}
              className="w-full border border-rose-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none" />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit" variant="primary" size="sm" isLoading={submitting}
              icon={<Heart className="w-3.5 h-3.5" />}>
              Confirm Guardianship
            </Button>
          </div>
        </form>
      )}

      {alreadyAdopted && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          You are an active guardian of this tree.
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-xs text-slate-500 py-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading guardians...
        </div>
      ) : activeGuardians.length === 0 ? (
        <div className="text-xs text-slate-500 py-4 text-center bg-sage-50/50 rounded-xl border border-dashed border-sage-200">
          No guardians yet — be the first to protect this tree.
        </div>
      ) : (
        <div className="space-y-2">
          {activeGuardians.map((a) => (
            <div key={a.id} className="flex items-start gap-3 p-3 bg-white rounded-xl border border-sage-200 text-xs">
              <div className="w-7 h-7 rounded-full bg-forest-100 text-forest-800 flex items-center justify-center font-bold text-[11px] shrink-0">
                {a.guardian_name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-slate-800">{a.guardian_name}</div>
                {a.guardian_message && (
                  <p className="text-slate-500 mt-0.5 italic">"{a.guardian_message}"</p>
                )}
                <div className="text-[10px] text-slate-400 mt-1">
                  Since {new Date(a.adoption_date).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
