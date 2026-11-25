import React, { useState, useEffect } from 'react';
import { Coins, TrendingUp, AlertCircle, CheckCircle2, PieChart, Plus, X } from 'lucide-react';
import { Project, BudgetItem, SpendingRecord } from '../../types/project';
import { fetchBudgetAndSpending, addSpendingRecord } from '../../services/projectService';

interface TransparencyDashboardProps {
  project: Project;
  currentUserId?: string;
  currentUserName?: string;
  isOwner?: boolean;
}

export const TransparencyDashboard: React.FC<TransparencyDashboardProps> = ({
  project,
  currentUserId,
  currentUserName,
  isOwner
}) => {
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [spending, setSpending] = useState<SpendingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddSpending, setShowAddSpending] = useState(false);
  const [spendForm, setSpendForm] = useState({ category: '', amount: '', vendor_or_payee: '', description: '', spent_date: new Date().toISOString().split('T')[0] });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { budgetItems: b, spendingRecords: s } = await fetchBudgetAndSpending(project.id);
        setBudgetItems(b);
        setSpending(s);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, [project.id]);

  const totalBudget = budgetItems.reduce((s, b) => s + b.allocated_amount, 0) || project.estimated_budget;
  const totalSpent = spending.filter(s => s.is_verified).reduce((acc, s) => acc + s.amount, 0);
  const remaining = project.current_funding_raised - totalSpent;

  const handleAddSpending = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!spendForm.vendor_or_payee || !spendForm.description || !spendForm.amount) return;
    try {
      setSubmitting(true);
      const rec = await addSpendingRecord({
        project_id: project.id,
        ...spendForm,
        amount: parseFloat(spendForm.amount)
      }, currentUserId, currentUserName);
      setSpending(prev => [rec, ...prev]);
      setShowAddSpending(false);
      setSpendForm({ category: '', amount: '', vendor_or_payee: '', description: '', spent_date: new Date().toISOString().split('T')[0] });
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="text-center py-16"><div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div></div>;

  return (
    <div className="space-y-6">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900 leading-relaxed">
        <strong>Transparency Statement:</strong> This dashboard displays verified spending records submitted by the project financial controller with receipts. <strong>Pledged amounts</strong> are community commitments and have <em>not</em> been received as actual funds. <strong>Verified receipts</strong> represent real, documented expenditure. No payment gateway is currently connected — real payment integration requires Razorpay (India) or Stripe (US/global) account verification.
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Funding Target', value: `${project.currency} ${project.funding_target.toLocaleString()}`, color: 'slate', note: 'Goal set by organizer' },
          { label: 'Verified Receipts', value: `${project.currency} ${project.current_funding_raised.toLocaleString()}`, color: 'emerald', note: 'Documented financial records' },
          { label: 'Community Pledges', value: `${project.currency} ${project.pledged_amount.toLocaleString()}`, color: 'amber', note: 'Not yet received — interest only' },
          { label: 'Spending (Verified)', value: `${project.currency} ${totalSpent.toLocaleString()}`, color: 'rose', note: `${project.currency} ${remaining.toLocaleString()} remaining` }
        ].map(card => (
          <div key={card.label} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="text-xl font-extrabold text-slate-900">{card.value}</div>
            <div className="text-[11px] font-semibold text-slate-700 mt-1">{card.label}</div>
            <div className="text-[10px] text-slate-500 mt-0.5 italic">{card.note}</div>
          </div>
        ))}
      </div>

      {/* Budget Allocation */}
      {budgetItems.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-emerald-600" />Budget Allocation
          </h3>
          <div className="space-y-3">
            {budgetItems.map(item => {
              const pct = Math.min(100, Math.round((item.allocated_amount / totalBudget) * 100));
              return (
                <div key={item.id}>
                  <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                    <span>{item.category}</span>
                    <span>{project.currency} {item.allocated_amount.toLocaleString()} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  {item.notes && <p className="text-[11px] text-slate-500 mt-0.5">{item.notes}</p>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Spending Records */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />Verified Spending Records
          </h3>
          {isOwner && (
            <button onClick={() => setShowAddSpending(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold">
              <Plus className="w-3.5 h-3.5" />Add Record
            </button>
          )}
        </div>

        {showAddSpending && (
          <form onSubmit={handleAddSpending} className="mb-5 p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900">New Spending Record</h4>
              <button type="button" onClick={() => setShowAddSpending(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Category</label>
                <input type="text" required value={spendForm.category} onChange={e => setSpendForm(p => ({ ...p, category: e.target.value }))}
                  placeholder="e.g. Saplings & Bare-Root Seedlings" className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Amount ({project.currency})</label>
                <input type="number" required min="0.01" value={spendForm.amount} onChange={e => setSpendForm(p => ({ ...p, amount: e.target.value }))}
                  placeholder="0.00" className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Vendor / Payee</label>
                <input type="text" required value={spendForm.vendor_or_payee} onChange={e => setSpendForm(p => ({ ...p, vendor_or_payee: e.target.value }))}
                  placeholder="Supplier or contractor name" className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Date Spent</label>
                <input type="date" required value={spendForm.spent_date} onChange={e => setSpendForm(p => ({ ...p, spent_date: e.target.value }))}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg" />
              </div>
              <div className="col-span-2">
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Description</label>
                <input type="text" required value={spendForm.description} onChange={e => setSpendForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="What was purchased and why" className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowAddSpending(false)} className="px-3 py-1.5 text-xs font-semibold text-slate-600">Cancel</button>
              <button type="submit" disabled={submitting} className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50">
                {submitting ? 'Saving...' : 'Save Record'}
              </button>
            </div>
          </form>
        )}

        {spending.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No spending records have been posted by the project organizer yet.</p>
        ) : (
          <div className="space-y-3">
            {spending.map(rec => (
              <div key={rec.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900">{rec.vendor_or_payee}</span>
                    <span className="ml-2 px-1.5 py-0.5 bg-slate-200 text-slate-600 rounded text-[10px]">{rec.category}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-slate-900">{project.currency} {rec.amount.toLocaleString()}</span>
                    {rec.is_verified && <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5 justify-end"><CheckCircle2 className="w-3 h-3" />Verified</div>}
                  </div>
                </div>
                <p className="text-xs text-slate-600 mt-1">{rec.description}</p>
                <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-500">
                  <span>Date: {new Date(rec.spent_date).toLocaleDateString()}</span>
                  {rec.recorded_by_name && <span>By: {rec.recorded_by_name}</span>}
                  {rec.receipt_url && <a href={rec.receipt_url} target="_blank" rel="noopener noreferrer" className="text-emerald-600 font-medium hover:underline">View Receipt</a>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
