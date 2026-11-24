import React, { useState } from 'react';
import { MOCK_TRANSACTIONS } from '../data/mockData';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import {
  Wallet,
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  Award,
  Sparkles,
  Gift,
  CheckCircle2
} from 'lucide-react';

export const WalletPage: React.FC = () => {
  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);
  const [redeemSuccess, setRedeemSuccess] = useState(false);

  const rewards = [
    { title: 'Tree Adoption Certificate & Metal NFC Plaque', cost: 150, category: 'Recognition' },
    { title: 'TerraSense LoRaWAN Moisture Sensor Probe', cost: 220, category: 'Hardware' },
    { title: 'Native Hardwood 10-Sapling Reforestation Pack', cost: 300, category: 'Restoration' },
    { title: 'Annual Global Planetary Forestry Summit Ticket', cost: 500, category: 'Conference' },
  ];

  const handleRedeem = () => {
    setRedeemSuccess(true);
    setTimeout(() => {
      setRedeemSuccess(false);
      setIsRedeemModalOpen(false);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Wallet className="w-6 h-6 text-forest-700" />
            Rewards & Green Wallet
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your verified environmental earnings, $VERD token balance, and ecological rewards.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="lime" dot>Wallet Connected</Badge>
          <Button
            variant="lime"
            size="sm"
            icon={<Gift className="w-4 h-4" />}
            onClick={() => setIsRedeemModalOpen(true)}
          >
            Redeem Rewards
          </Button>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-forest-deep via-forest-rich to-forest-moss text-white border border-forest-moss shadow-soft">
          <div className="text-[10px] font-mono uppercase tracking-widest text-lime-400 font-bold">
            $VERD TOKEN BALANCE
          </div>
          <div className="text-3xl font-extrabold mt-2 flex items-baseline gap-2">
            1,840.00
            <span className="text-sm font-semibold text-lime-400">$VERD</span>
          </div>
          <div className="text-xs text-forest-200 mt-1">
            Approximate Value: <strong className="text-white">$920.00 USD</strong>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-sage-200 shadow-soft">
          <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">
            CARBON CREDITS ACCRUED
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2 flex items-baseline gap-2">
            14.2
            <span className="text-sm font-semibold text-forest-700">VCS Credits</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Minted from Year 2 Cascadia Tree Survival
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-sage-200 shadow-soft">
          <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">
            STAKING APY YIELD
          </div>
          <div className="text-3xl font-extrabold text-emerald-700 mt-2 flex items-baseline gap-2">
            8.4%
            <span className="text-sm font-semibold text-slate-500">Eco-Stake</span>
          </div>
          <div className="text-xs text-emerald-800 font-medium mt-1">
            Compounded quarterly based on survival index
          </div>
        </div>
      </div>

      {/* Transaction History Ledger */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Eco-Ledger Activity</CardTitle>
            <CardDescription>Verified rewards, token grants, and marketplace expenditures</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="divide-y divide-slate-100 p-0">
          {MOCK_TRANSACTIONS.map((tx) => (
            <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-50/60 transition-colors">
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    tx.amount > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tx.amount > 0 ? (
                    <ArrowDownLeft className="w-5 h-5" />
                  ) : (
                    <ArrowUpRight className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-800">{tx.description}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    TX: {tx.txHash} · {tx.timestamp}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div
                  className={`text-sm font-bold ${
                    tx.amount > 0 ? 'text-emerald-700' : 'text-slate-800'
                  }`}
                >
                  {tx.amount > 0 ? `+${tx.amount}` : tx.amount} $VERD
                </div>
                <Badge variant="emerald" size="sm">
                  {tx.status}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Redeem Modal */}
      <Modal
        isOpen={isRedeemModalOpen}
        onClose={() => setIsRedeemModalOpen(false)}
        title="Redeem Ecological Rewards"
        description="Exchange your earned $VERD tokens for restoration supplies and perks."
      >
        {redeemSuccess ? (
          <div className="py-6 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-slate-900">Reward Claimed!</h4>
            <p className="text-xs text-slate-500">Your redemption has been processed and deducted from your balance.</p>
          </div>
        ) : (
          <div className="space-y-3 text-xs">
            {rewards.map((r) => (
              <div
                key={r.title}
                className="p-3 rounded-lg border border-sage-200 hover:border-forest-400 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="font-semibold text-slate-800">{r.title}</div>
                  <div className="text-[10px] text-slate-400">{r.category}</div>
                </div>
                <Button variant="secondary" size="sm" onClick={handleRedeem}>
                  {r.cost} $VERD
                </Button>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
};
