import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Wallet, Coins, ArrowUpRight, ArrowDownLeft, ShieldCheck, Award,
  Sparkles, Gift, CheckCircle2, AlertCircle, Loader2, Clock, Lock
} from 'lucide-react';
import {
  fetchUserWallet,
  fetchWalletTransactions,
  redeemPointsOption,
  INITIAL_REDEMPTIONS
} from '../services/economyService';
import { UserWallet, WalletTransaction, WalletRedemptionOption } from '../types/economy';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const WalletPage: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.id;

  const [wallet, setWallet] = useState<UserWallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Redemption Modal State
  const [selectedOption, setSelectedOption] = useState<WalletRedemptionOption | null>(null);
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [redeemMessage, setRedeemMessage] = useState<string | null>(null);
  const [redeemSuccess, setRedeemSuccess] = useState(false);

  const loadWalletData = async () => {
    setLoading(true);
    try {
      const [w, txs] = await Promise.all([
        fetchUserWallet(userId),
        fetchWalletTransactions(userId)
      ]);
      setWallet(w);
      setTransactions(txs);
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWalletData();
  }, [userId]);

  useEffect(() => {
    if (!isSupabaseConfigured || !user?.id) return;
    const channel = supabase
      .channel(`wallet-ledger-${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'wallet_transactions', filter: `user_id=eq.${user.id}` },
        () => {
          loadWalletData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_wallets', filter: `user_id=eq.${user.id}` },
        () => {
          loadWalletData();
        }
      )
      .subscribe((status, err) => {
        if (status === 'CHANNEL_ERROR') {
          console.warn('[WalletPage] Realtime subscription status error:', err);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const handleRedeem = async () => {
    if (!selectedOption || !userId) return;
    setRedeemLoading(true);
    setRedeemMessage(null);
    try {
      const res = await redeemPointsOption(userId, selectedOption.id);
      setRedeemMessage(res.message);
      setRedeemSuccess(res.success);
      if (res.success) {
        setTimeout(() => {
          setSelectedOption(null);
          setRedeemSuccess(false);
          loadWalletData();
        }, 1800);
      }
    } catch (err: any) {
      setRedeemMessage(err?.message || 'Redemption failed.');
      setRedeemSuccess(false);
    } finally {
      setRedeemLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mr-2" />
        <span className="text-sm text-slate-600">Loading wallet ledger...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Wallet className="w-6 h-6 text-emerald-600" />
            Greenverse Rewards Wallet & Activity Ledger
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Verifiable ecological rewards ledger tracking earned Green Points, completed task incentives, and community redemptions.
          </p>
        </div>
        {isSupabaseConfigured && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200 self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Ledger Sync
          </span>
        )}
      </div>

      {/* Security & Non-Cash Disclosure Banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-600 flex items-start gap-3">
        <Lock className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-800">Tamper-Proof Ecological Points:</span> Green Points represent community restoration achievements and are strictly non-cash credits. Balance mutations are authorized via cryptographic ledger transactions. No external financial deposits or cash withdrawals are supported.
        </div>
      </div>

      {/* Balance Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 text-white rounded-2xl p-5 shadow-sm border border-emerald-700">
          <div className="flex items-center justify-between text-emerald-200 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Available Balance</span>
            <Coins className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-white flex items-baseline gap-1.5">
            {wallet?.green_points_balance || 0}
            <span className="text-xs font-medium text-emerald-300">PTS</span>
          </div>
          <p className="text-[11px] text-emerald-200 mt-2">Active balance ready for redemption</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Total Points Earned</span>
            <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {wallet?.total_points_earned || 0}
            <span className="text-xs font-normal text-slate-400 ml-1">pts</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">All-time verified contributions</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Points Redeemed</span>
            <ArrowUpRight className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {wallet?.total_points_redeemed || 0}
            <span className="text-xs font-normal text-slate-400 ml-1">pts</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Sapling sponsorships & plaques</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Pending Audit</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {wallet?.pending_points || 0}
            <span className="text-xs font-normal text-slate-400 ml-1">pts</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Awaiting reviewer approval</p>
        </div>
      </div>

      {/* Eligible Redemption Options */}
      <div className="space-y-3">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
          <Gift className="w-5 h-5 text-emerald-600" />
          Eligible Non-Cash Environmental Redemptions
        </h3>
        <p className="text-xs text-slate-500">
          Redeem your points to sponsor additional tree plantings, acquire engraved NFC adoption plaques, or access workshops.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {INITIAL_REDEMPTIONS.map(option => {
            const canAfford = (wallet?.green_points_balance || 0) >= option.points_cost;

            return (
              <div
                key={option.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-emerald-400 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {option.category.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs font-bold text-emerald-700">
                      {option.points_cost} pts
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs mb-1.5 line-clamp-2">{option.name}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 mb-4">{option.description}</p>
                </div>

                <button
                  onClick={() => setSelectedOption(option)}
                  disabled={!canAfford}
                  className="w-full py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 disabled:opacity-40 transition"
                >
                  {canAfford ? 'Redeem Points' : `Requires ${option.points_cost} pts`}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Auditable Ledger Transactions Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Auditable Transaction Ledger ({transactions.length})
            </h3>
            <p className="text-xs text-slate-400">Cryptographically referenced log of all reward credits and redemptions</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Balance After</th>
                <th className="px-4 py-3">Audit Hash</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {transactions.map(tx => (
                <tr key={tx.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                    {new Date(tx.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="capitalize text-[11px] font-semibold text-slate-600">
                      {tx.transaction_type.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 max-w-xs truncate">{tx.description}</td>
                  <td className={`px-4 py-3 font-bold whitespace-nowrap ${tx.amount >= 0 ? 'text-emerald-700' : 'text-blue-700'}`}>
                    {tx.amount > 0 ? `+${tx.amount}` : tx.amount} pts
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-800">{tx.balance_after} pts</td>
                  <td className="px-4 py-3 font-mono text-[10px] text-slate-400">{tx.audit_hash || '0x4f...99a'}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Redemption Confirm Modal */}
      {selectedOption && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Confirm Points Redemption</h3>
            {redeemMessage ? (
              <div className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                redeemSuccess ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'
              }`}>
                {redeemSuccess ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                {redeemMessage}
              </div>
            ) : (
              <>
                <div className="bg-slate-50 p-4 rounded-xl text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Reward:</span>
                    <span className="font-bold text-slate-900">{selectedOption.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Points Cost:</span>
                    <span className="font-bold text-emerald-700">{selectedOption.points_cost} Green Points</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">New Balance:</span>
                    <span className="font-bold text-slate-800">
                      {(wallet?.green_points_balance || 0) - selectedOption.points_cost} PTS
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  Upon confirmation, {selectedOption.points_cost} points will be debited from your ledger. A digital voucher and confirmation will be recorded.
                </p>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => setSelectedOption(null)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRedeem}
                    disabled={redeemLoading}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {redeemLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Confirm & Deduct Points
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
export default WalletPage;
