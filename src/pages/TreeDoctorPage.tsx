import React, { useState } from 'react';
import { MOCK_DIAGNOSTICS } from '../data/mockData';
import { DiagnosticRecord } from '../types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import {
  Stethoscope,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Sparkles,
  Search,
  ShieldCheck,
  FileText
} from 'lucide-react';

export const TreeDoctorPage: React.FC = () => {
  const [selectedRecord, setSelectedRecord] = useState<DiagnosticRecord>(MOCK_DIAGNOSTICS[0]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);

  const simulateAiScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setScanComplete(true);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-forest-700" />
            AI Tree Doctor & Pathogen Diagnostic Clinic
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Computer vision leaf scan, fungal blight diagnosis, and arborist-approved organic treatment protocols.
          </p>
        </div>
        <Badge variant="lime" dot>
          Pathogen Vision v4.1 Active
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Interactive Diagnostic Scanner */}
        <Card className="lg:col-span-1 space-y-4">
          <CardHeader>
            <div>
              <CardTitle>ArborVision Scanner</CardTitle>
              <CardDescription>Upload leaf or bark photo for AI diagnosis</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            {/* Drag & Drop Upload Zone */}
            <div
              onClick={simulateAiScan}
              className="border-2 border-dashed border-sage-300 hover:border-forest-600 rounded-xl p-6 text-center cursor-pointer transition-all bg-sage-50/40 hover:bg-forest-50/30 group"
            >
              <div className="w-12 h-12 rounded-xl bg-forest-100 text-forest-700 flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div className="font-semibold text-slate-800">
                {isScanning ? 'Analyzing Cellular Pathogens...' : 'Click to Upload Symptom Photo'}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                JPG, PNG, or RAW up to 25MB · High resolution leaf close-up recommended
              </p>
            </div>

            {scanComplete && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 space-y-1 animate-in fade-in">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Leaf Symptom Detected (94.2% Confidence)
                </div>
                <p className="text-[11px] text-emerald-800">
                  Foliage desiccation with early tip chlorosis identified. Matched to Western Red Cedar drought strain.
                </p>
              </div>
            )}

            <Button
              variant="primary"
              size="md"
              className="w-full"
              isLoading={isScanning}
              onClick={simulateAiScan}
              icon={<Cpu className="w-4 h-4" />}
            >
              Run Diagnostic Model
            </Button>

            <div className="pt-2 text-[11px] text-slate-400 text-center">
              Diagnoses are validated by accredited agroforestry neural models and peer-reviewed arborist literature.
            </div>
          </CardContent>
        </Card>

        {/* Right 2 Columns: Clinical Triage & Treatment Protocols */}
        <div className="lg:col-span-2 space-y-5">
          {/* Active Diagnostic Report */}
          <Card className="overflow-hidden border-2 border-forest-100">
            <CardHeader className="bg-forest-50/60">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-forest-900">
                    DIAGNOSTIC CASE: #{selectedRecord.id}
                  </span>
                  <Badge variant={selectedRecord.severity === 'severe' ? 'rose' : 'amber'} size="sm">
                    {selectedRecord.severity.toUpperCase()} SEVERITY
                  </Badge>
                </div>
                <CardTitle>{selectedRecord.diagnosis}</CardTitle>
                <CardDescription>
                  Affecting: {selectedRecord.species} ({selectedRecord.treeId}) · Date: {selectedRecord.date}
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-forest-700">{selectedRecord.confidence}% Match</div>
                <div className="text-[10px] text-slate-400">{selectedRecord.prescribedBy}</div>
              </div>
            </CardHeader>

            <CardContent className="p-5 space-y-5">
              {/* Symptoms Identified */}
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Observed Clinical Symptoms:
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedRecord.symptoms.map((symp) => (
                    <span
                      key={symp}
                      className="px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 text-xs font-medium rounded-lg"
                    >
                      {symp}
                    </span>
                  ))}
                </div>
              </div>

              {/* Recommended Treatment Protocol */}
              <div className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Prescribed Organic Treatment Protocol:
                </div>
                <div className="space-y-2">
                  {selectedRecord.treatmentProtocol.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-2.5"
                    >
                      <span className="w-5 h-5 rounded-full bg-forest-100 text-forest-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-2 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => alert('Consultation request dispatched to local certified arborist.')}
                >
                  Consult Master Arborist
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => alert('Order generated for prescribed biostimulants in Green Marketplace.')}
                >
                  Order Treatment Pack
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Previous Clinical Case Histories */}
          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Resolved & Under-Treatment History
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MOCK_DIAGNOSTICS.map((diag) => (
                <div
                  key={diag.id}
                  onClick={() => setSelectedRecord(diag)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    selectedRecord.id === diag.id
                      ? 'bg-forest-50 border-forest-600 shadow-sm'
                      : 'bg-white border-sage-200 hover:border-forest-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-slate-800">{diag.treeId}</span>
                    <Badge variant={diag.status === 'resolved' ? 'emerald' : 'amber'} size="sm">
                      {diag.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-slate-600 mt-1 line-clamp-1">{diag.diagnosis}</div>
                  <div className="text-[10px] text-slate-400 mt-2">{diag.date}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
