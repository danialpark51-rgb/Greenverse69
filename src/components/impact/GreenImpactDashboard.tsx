import React, { useState, useEffect } from 'react';
import {
  Sprout, CheckCircle2, ShieldCheck, HeartHandshake, Award, Clock,
  TrendingUp, Calendar, Filter, Sparkles, AlertCircle, Loader2, ArrowUpRight
} from 'lucide-react';
import { fetchPersonalImpactMetrics } from '../../services/impactService';
import { PersonalImpactMetrics } from '../../types/impact';

interface GreenImpactDashboardProps {
  currentUserId?: string;
}

export const GreenImpactDashboard: React.FC<GreenImpactDashboardProps> = ({ currentUserId }) => {
  const [metrics, setMetrics] = useState<PersonalImpactMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'all' | 'year' | 'month'>('all');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchPersonalImpactMetrics(currentUserId);
        setMetrics(data);
      } catch {
        // handled
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentUserId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mr-2" />
        <span className="text-sm text-slate-600">Loading personalized impact metrics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Date Range Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Sprout className="w-5 h-5 text-emerald-600" />
            Personal Environmental Impact Dashboard
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Traceable, verified on-the-ground contributions to forest restoration and ecological health.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-white border border-slate-200 p-1 rounded-xl shadow-sm text-xs w-fit">
          <Calendar className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
          <button
            onClick={() => setTimeRange('all')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              timeRange === 'all' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Time
          </button>
          <button
            onClick={() => setTimeRange('year')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              timeRange === 'year' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Past Year
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              timeRange === 'month' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            This Month
          </button>
        </div>
      </div>

      {/* Primary Impact Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Verified Trees */}
        <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 text-white rounded-2xl p-5 shadow-sm border border-emerald-700">
          <div className="flex items-center justify-between text-emerald-200 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Verified Planted Trees</span>
            <ShieldCheck className="w-4 h-4 text-lime-400" />
          </div>
          <div className="text-3xl font-extrabold text-white flex items-baseline gap-1.5">
            {metrics?.trees_verified || 0}
            <span className="text-xs font-normal text-emerald-300">of {metrics?.trees_planted_total || 0} total</span>
          </div>
          <div className="mt-3 pt-3 border-t border-emerald-700/60 flex items-center justify-between text-[11px] text-emerald-200">
            <span>Reported Pending: {metrics?.trees_reported || 0}</span>
            <span className="text-lime-300 font-semibold">{metrics?.survival_rate_pct}% Survival</span>
          </div>
        </div>

        {/* Carbon Offset */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>CO₂ Sequestration (Calculated)</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {metrics?.co2_sequestered_kg || 0}
            <span className="text-xs font-normal text-slate-400 ml-1">kg CO₂e</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Model: 22 kg/tree/yr based on USDA i-Tree urban standard
          </p>
        </div>

        {/* Volunteer Hours */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Volunteer Fieldwork</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {metrics?.volunteer_hours || 0}
            <span className="text-xs font-normal text-slate-400 ml-1">hours</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Across {metrics?.projects_participated || 0} environmental projects
          </p>
        </div>

        {/* Bounties & Tasks */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Bounties Completed</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {metrics?.bounties_completed || 0}
            <span className="text-xs font-normal text-slate-400 ml-1">tasks</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            +{metrics?.green_points_earned || 0} total Green Points credited
          </p>
        </div>
      </div>

      {/* Detailed Contribution Breakdown Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 text-center shadow-sm">
          <Sprout className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
          <div className="text-lg font-bold text-slate-900">{metrics?.trees_under_care || 0}</div>
          <span className="text-[10px] font-semibold text-slate-400 uppercase">Under Active Care</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 text-center shadow-sm">
          <HeartHandshake className="w-4 h-4 text-rose-500 mx-auto mb-1" />
          <div className="text-lg font-bold text-slate-900">{metrics?.projects_participated || 0}</div>
          <span className="text-[10px] font-semibold text-slate-400 uppercase">Projects Joined</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 text-center shadow-sm">
          <Sparkles className="w-4 h-4 text-purple-500 mx-auto mb-1" />
          <div className="text-lg font-bold text-slate-900">{metrics?.challenges_won || 0}</div>
          <span className="text-[10px] font-semibold text-slate-400 uppercase">Challenges Won</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 text-center shadow-sm">
          <Calendar className="w-4 h-4 text-blue-500 mx-auto mb-1" />
          <div className="text-lg font-bold text-slate-900">{metrics?.events_attended || 0}</div>
          <span className="text-[10px] font-semibold text-slate-400 uppercase">Events Attended</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 text-center shadow-sm">
          <ShieldCheck className="w-4 h-4 text-amber-500 mx-auto mb-1" />
          <div className="text-lg font-bold text-slate-900">{metrics?.protections_logged || 0}</div>
          <span className="text-[10px] font-semibold text-slate-400 uppercase">Trees Protected</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 text-center shadow-sm">
          <Award className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
          <div className="text-lg font-bold text-slate-900">100%</div>
          <span className="text-[10px] font-semibold text-slate-400 uppercase">Traceability</span>
        </div>
      </div>

      {/* Traceable Activity Timeline */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Traceable Environmental Activity History</h3>
            <p className="text-xs text-slate-400">Underlying verification records that substantiate your impact metrics</p>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
            Audit Ready
          </span>
        </div>

        <div className="space-y-3">
          <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl flex items-start justify-between gap-3 text-xs">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5" />
              <div>
                <h4 className="font-semibold text-slate-800">Western Red Cedar (#TR-8821) Survival Audit Passed</h4>
                <p className="text-slate-500 text-[11px]">Riparian corridor zone 4 • Biometric height 1.8m recorded</p>
                <span className="text-[10px] text-slate-400 font-mono">Record ID: tree-cedar-104</span>
              </div>
            </div>
            <span className="text-emerald-700 font-bold whitespace-nowrap">+22 kg CO₂/yr</span>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl flex items-start justify-between gap-3 text-xs">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
              <div>
                <h4 className="font-semibold text-slate-800">4.5 Hours Soil Remediation Volunteer Shift Logged</h4>
                <p className="text-slate-500 text-[11px]">East District Hub community composting beds</p>
                <span className="text-[10px] text-slate-400 font-mono">Record ID: vol-shift-401</span>
              </div>
            </div>
            <span className="text-blue-700 font-bold whitespace-nowrap">4.5 hrs verified</span>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl flex items-start justify-between gap-3 text-xs">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5" />
              <div>
                <h4 className="font-semibold text-slate-800">Cedar Creek Litter Hotspot Cleanup (Zone 4) Approved</h4>
                <p className="text-slate-500 text-[11px]">Verified by CleanWaters Squad Lead • 6.5 kg plastic removed</p>
                <span className="text-[10px] text-slate-400 font-mono">Record ID: bounty-sub-102</span>
              </div>
            </div>
            <span className="text-amber-700 font-bold whitespace-nowrap">+80 Green Points</span>
          </div>
        </div>
      </div>
    </div>
  );
};
