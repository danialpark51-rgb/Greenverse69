import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { MOCK_IMPACT_AUDITS } from '../data/mockData';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { GreenImpactDashboard } from '../components/impact/GreenImpactDashboard';
import { EnvironmentalStatisticsCenter } from '../components/impact/EnvironmentalStatisticsCenter';
import { GreenVerificationEngine } from '../components/impact/GreenVerificationEngine';
import { GreenAchievementsCenter } from '../components/impact/GreenAchievementsCenter';
import { GreenChangeMonitor } from '../components/impact/GreenChangeMonitor';
import { GreenReputationDashboard } from '../components/economy/GreenReputationDashboard';
import {
  CheckCircle2,
  Sprout,
  BarChart3,
  ShieldCheck,
  Award,
  TrendingUp,
  Satellite,
  Layers,
  Download,
  AlertCircle
} from 'lucide-react';

type ImpactTab = 'impact' | 'statistics' | 'verification' | 'achievements' | 'change-monitor' | 'reputation' | 'mrv';

const TABS: { key: ImpactTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'impact', label: 'Impact Dashboard', icon: Sprout },
  { key: 'statistics', label: 'Environmental Stats', icon: BarChart3 },
  { key: 'verification', label: 'Verification Engine', icon: ShieldCheck },
  { key: 'achievements', label: 'Achievements', icon: Award },
  { key: 'change-monitor', label: 'Change Monitor', icon: TrendingUp },
  { key: 'reputation', label: 'Reputation Profile', icon: CheckCircle2 },
  { key: 'mrv', label: 'Satellite MRV', icon: Satellite },
];

export const ImpactPage: React.FC = () => {
  const { user, profile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = (searchParams.get('tab') as ImpactTab) || 'impact';
  const [activeTab, setActiveTab] = useState<ImpactTab>(currentTab);

  useEffect(() => {
    const tab = searchParams.get('tab') as ImpactTab;
    if (tab && TABS.some(t => t.key === tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tab: ImpactTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const currentUserId = user?.id;
  const currentUserName = profile?.full_name || user?.email?.split('@')[0] || 'Verification Officer';

  return (
    <div className="space-y-6">
      {/* Top Navigation Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 border-b border-slate-200/80 scrollbar-hide">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Feature 1: Personal Impact Dashboard */}
      {activeTab === 'impact' && (
        <GreenImpactDashboard currentUserId={currentUserId} />
      )}

      {/* Feature 2: Environmental Statistics */}
      {activeTab === 'statistics' && (
        <EnvironmentalStatisticsCenter />
      )}

      {/* Feature 3: Verification Engine */}
      {activeTab === 'verification' && (
        <GreenVerificationEngine currentUserId={currentUserId} currentUserName={currentUserName} />
      )}

      {/* Feature 5: Achievements & Badges */}
      {activeTab === 'achievements' && (
        <GreenAchievementsCenter currentUserId={currentUserId} />
      )}

      {/* Feature 7: Green Change Monitor */}
      {activeTab === 'change-monitor' && (
        <GreenChangeMonitor />
      )}

      {/* Batch 5: Reputation Dashboard */}
      {activeTab === 'reputation' && (
        <GreenReputationDashboard currentUserId={currentUserId} />
      )}

      {activeTab === 'mrv' && (
        <div className="space-y-6">
          {/* Disclaimer: Satellite MRV is not live-connected */}
          <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Demonstration Mode — Not Live Satellite Data:</span> The figures below are illustrative estimates
              from the Greenverse platform seed data. Real satellite MRV integration requires a configured remote sensing provider
              (e.g., Planet Labs, Sentinel Hub). Values shown are <em>not independently verified</em> and should not be cited as carbon offsets.
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="amber" dot>Demo — Satellite MRV Not Live</Badge>
              <span className="text-xs text-slate-400">Requires Sentinel Hub / Planet Labs API key</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={<Download className="w-4 h-4" />}
              onClick={() => alert('MRV export is not available in demo mode. Connect a satellite data provider first.')}
            >
              Export (Unavailable)
            </Button>
          </div>

          {/* Demo Aggregate Metrics — clearly labeled */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-forest-deep to-forest-rich text-white border border-forest-moss shadow-soft">
              <div className="text-[11px] font-semibold text-lime-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Est. Carbon Sequestered (Demo)
              </div>
              <div className="text-3xl font-extrabold mt-2">44,340 t CO₂e</div>
              <p className="text-xs text-forest-200 mt-1">
                <span className="text-amber-300 font-semibold">DEMO ESTIMATE</span> — Not independently verified.
                Based on platform seed project data × USDA i-Tree equations.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-sage-200 shadow-soft">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Satellite className="w-4 h-4 text-forest-700" />
                Est. Trees (Seed Data)
              </div>
              <div className="text-3xl font-extrabold text-slate-900 mt-2">381,240 Trees</div>
              <p className="text-xs text-slate-500 mt-1">
                <span className="text-amber-700 font-semibold">DEMO</span> — Platform seed project entries only.
                Not real-world satellite count.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-sage-200 shadow-soft">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-600" />
                Avg. Biomass Density (Demo)
              </div>
              <div className="text-3xl font-extrabold text-slate-900 mt-2">48.6 t / ha</div>
              <p className="text-xs text-emerald-700 font-medium mt-1">
                <span className="text-amber-700 font-semibold">DEMO</span> — Illustrative figure only.
              </p>
            </div>
          </div>

          {/* Audit Pipeline Table */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Independent Verification & Audit Ledger</CardTitle>
                <CardDescription>
                  Demo verification records — requires real satellite provider integration to show live audits
                </CardDescription>
              </div>
              <Badge variant="amber" size="sm">Demo Data</Badge>
            </CardHeader>
            <CardContent className="divide-y divide-slate-100 p-0">
              {MOCK_IMPACT_AUDITS.map((audit) => (
                <div key={audit.id} className="p-5 hover:bg-slate-50/60 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{audit.period}</span>
                        <Badge variant="amber" size="sm">Demo</Badge>
                        <Badge variant="emerald" size="sm">{audit.auditStandard}</Badge>
                      </div>
                      <p className="text-xs text-slate-600">
                        Lead Certifier: <strong className="text-slate-800">{audit.auditorOrg}</strong>
                      </p>
                      <div className="text-[10px] font-mono text-slate-400">
                        Report Hash: {audit.verificationReportHash}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold text-forest-800">
                        {audit.tonsCO2eSequestered.toLocaleString()} tons CO2e
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {audit.treesVerifiedCount.toLocaleString()} trees audited
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        Pass Date: {audit.satelliteAuditDate}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
export default ImpactPage;
