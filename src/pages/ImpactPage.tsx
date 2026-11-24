import React from 'react';
import { MOCK_IMPACT_AUDITS } from '../data/mockData';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import {
  CheckCircle2,
  Satellite,
  ShieldCheck,
  FileText,
  Award,
  Layers,
  Sparkles,
  Download
} from 'lucide-react';

export const ImpactPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-forest-700" />
            Planetary Impact & Satellite Verification (MRV)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Measurement, Reporting & Verification (MRV) pipeline integrating Sentinel-2 multispectral passes and drone lidar.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="emerald" dot>Tier 1 Satellite Audit Active</Badge>
          <Button
            variant="outline"
            size="sm"
            icon={<Download className="w-4 h-4" />}
            onClick={() => alert('Official Verified Impact Certificate PDF downloaded.')}
          >
            Download Impact Statement
          </Button>
        </div>
      </div>

      {/* Aggregate Impact Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-forest-deep to-forest-rich text-white border border-forest-moss shadow-soft">
          <div className="text-[11px] font-semibold text-lime-400 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            Total Verified Carbon Sequestered
          </div>
          <div className="text-3xl font-extrabold mt-2">44,340 t CO₂e</div>
          <p className="text-xs text-forest-200 mt-1">
            Accredited under Verra VCS + CCB Gold Standard standards.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-sage-200 shadow-soft">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Satellite className="w-4 h-4 text-forest-700" />
            Total Verified Trees Count
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">381,240 Trees</div>
          <p className="text-xs text-slate-500 mt-1">
            Across 64 registered restoration corridors globally.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-sage-200 shadow-soft">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-emerald-600" />
            Biomass Density
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">48.6 t / ha</div>
          <p className="text-xs text-emerald-700 font-medium mt-1">
            ↑ +14.2% increase in photosynthetically active canopy.
          </p>
        </div>
      </div>

      {/* Audit Pipeline Table */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Independent Verification & Audit Ledger</CardTitle>
            <CardDescription>Immutable record of satellite, drone, and field auditor verification passes</CardDescription>
          </div>
          <Badge variant="forest" size="sm">Audited Quarterly</Badge>
        </CardHeader>
        <CardContent className="divide-y divide-slate-100 p-0">
          {MOCK_IMPACT_AUDITS.map((audit) => (
            <div key={audit.id} className="p-5 hover:bg-slate-50/60 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{audit.period}</span>
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
  );
};
