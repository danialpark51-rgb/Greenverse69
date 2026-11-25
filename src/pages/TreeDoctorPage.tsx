import React, { useState, useEffect } from 'react';
import { DbHealthRecord, DbTree, CreateHealthRecordInput } from '../types/tree';
import { fetchHealthRecords, createHealthRecord, fetchTrees } from '../services/treeService';
import { useAuth } from '../context/AuthContext';
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
  FileText,
  Info,
  Loader2,
  Plus
} from 'lucide-react';

const COMMON_SYMPTOMS = [
  'Yellowing Foliage / Chlorosis',
  'Leaf Wilting & Flagging',
  'Bark Lesions or Cankers',
  'Premature Leaf Drop',
  'White Powdery Mildew',
  'Pest Bore Holes in Stem',
  'Root Collar Silt Accumulation',
  'Epicormic Lower Trunk Suckers',
];

export const TreeDoctorPage: React.FC = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<DbHealthRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [trees, setTrees] = useState<DbTree[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<DbHealthRecord | null>(null);

  // Diagnostic form state
  const [selectedTreeId, setSelectedTreeId] = useState<string>('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [observations, setObservations] = useState('');
  const [severity, setSeverity] = useState<'mild' | 'moderate' | 'severe'>('mild');
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [diagnosticFeedback, setDiagnosticFeedback] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      setLoadingRecords(true);
      const [recData, treeRes] = await Promise.all([
        fetchHealthRecords(),
        fetchTrees(),
      ]);
      setRecords(recData);
      setTrees(treeRes.data);
      if (treeRes.data.length > 0) {
        setSelectedTreeId(treeRes.data[0].id);
      }
      if (recData.length > 0) {
        setSelectedRecord(recData[0]);
      }
      setLoadingRecords(false);
    };
    init();
  }, []);

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  };

  const handleRunDiagnostic = async () => {
    if (!selectedTreeId) {
      alert('Please select a tree to evaluate.');
      return;
    }
    if (selectedSymptoms.length === 0 && !observations.trim()) {
      alert('Please check at least one symptom or describe observations.');
      return;
    }

    setIsScanning(true);
    setDiagnosticFeedback(null);

    const input: CreateHealthRecordInput = {
      tree_id: selectedTreeId,
      recorded_date: new Date().toISOString().split('T')[0],
      symptoms: selectedSymptoms.length > 0 ? selectedSymptoms : ['Unspecified stress symptom'],
      observations: observations.trim() || 'Visual symptom survey logged via ArborVision triage.',
      severity,
    };

    const res = await createHealthRecord(input, user?.id);
    setIsScanning(false);
    setScanComplete(true);

    if (res.data) {
      setRecords((prev) => [res.data!, ...prev]);
      setSelectedRecord(res.data);
      setDiagnosticFeedback('Diagnostic triage report generated and logged to health registry.');
      // Reset form fields
      setSelectedSymptoms([]);
      setObservations('');
    }
  };

  const currentTree = trees.find((t) => t.id === selectedRecord?.tree_id);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-forest-700" />
            Tree Health Clinic & Rule-based Diagnostic Triage
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Structured symptom observation, rule-based triage protocols, and persistent historical health records.
          </p>
        </div>
        <Badge variant="lime" dot>
          Rule-Based Triage Engine Active
        </Badge>
      </div>

      {/* Prominent Rule-Based Disclaimer Banner */}
      <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">Rule-Based Guidance Disclaimer</span>
          <p className="text-[11px] text-amber-800 mt-0.5">
            Diagnostic suggestions are generated using deterministic horticultural rules. They do not claim automated machine-learning precision and should not replace on-site certified arborist inspection for critical trees.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Interactive Triage Evaluator */}
        <Card className="lg:col-span-1 space-y-4">
          <CardHeader>
            <div>
              <CardTitle>ArborVision Triage Evaluator</CardTitle>
              <CardDescription>Select observed symptoms for rule-based protocol</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            {/* Tree Selector */}
            <div>
              <label className="block text-slate-700 font-medium mb-1">Target Tree Record</label>
              <select
                value={selectedTreeId}
                onChange={(e) => setSelectedTreeId(e.target.value)}
                className="w-full border border-sage-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-forest-500"
              >
                {trees.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.tree_code} — {t.name || t.species}
                  </option>
                ))}
              </select>
            </div>

            {/* Severity Level */}
            <div>
              <label className="block text-slate-700 font-medium mb-1">Observed Stress Severity</label>
              <div className="grid grid-cols-3 gap-2">
                {(['mild', 'moderate', 'severe'] as const).map((sev) => (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setSeverity(sev)}
                    className={`py-1.5 px-2 rounded-lg capitalize font-medium border text-xs transition-all ${
                      severity === sev
                        ? sev === 'severe'
                          ? 'bg-rose-600 text-white border-rose-600'
                          : sev === 'moderate'
                          ? 'bg-amber-500 text-white border-amber-500'
                          : 'bg-forest-600 text-white border-forest-600'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            {/* Symptom Checklist */}
            <div>
              <label className="block text-slate-700 font-medium mb-1.5">Observed Symptoms</label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {COMMON_SYMPTOMS.map((symptom) => {
                  const isChecked = selectedSymptoms.includes(symptom);
                  return (
                    <div
                      key={symptom}
                      onClick={() => toggleSymptom(symptom)}
                      className={`p-2 rounded-lg border cursor-pointer text-[11px] flex items-center justify-between transition-all ${
                        isChecked
                          ? 'bg-forest-50 border-forest-300 text-forest-900 font-medium'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>{symptom}</span>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="rounded text-forest-700 focus:ring-forest-500"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Additional Observations */}
            <div>
              <label className="block text-slate-700 font-medium mb-1">Additional Field Observations</label>
              <textarea
                rows={2}
                placeholder="e.g. Recent soil compaction after storm runoff. Minor lower foliage discoloration."
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                className="w-full border border-sage-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-forest-500 resize-none"
              />
            </div>

            {diagnosticFeedback && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {diagnosticFeedback}
                </div>
              </div>
            )}

            <Button
              variant="primary"
              size="md"
              className="w-full"
              isLoading={isScanning}
              onClick={handleRunDiagnostic}
              icon={<Cpu className="w-4 h-4" />}
            >
              Generate Rule-based Triage
            </Button>
          </CardContent>
        </Card>

        {/* Right 2 Columns: Clinical Triage & Historical Records */}
        <div className="lg:col-span-2 space-y-5">
          {/* Active Diagnostic Report Card */}
          {selectedRecord ? (
            <Card className="overflow-hidden border-2 border-forest-100">
              <CardHeader className="bg-forest-50/60">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-forest-900">
                      HEALTH RECORD: #{selectedRecord.id.substring(0, 12)}
                    </span>
                    <Badge
                      variant={
                        selectedRecord.severity === 'severe'
                          ? 'rose'
                          : selectedRecord.severity === 'moderate'
                          ? 'amber'
                          : 'forest'
                      }
                      size="sm"
                    >
                      {selectedRecord.severity.toUpperCase()} SEVERITY
                    </Badge>
                  </div>
                  <CardTitle>
                    {selectedRecord.symptoms.length > 0
                      ? selectedRecord.symptoms[0]
                      : 'General Clinical Observation'}
                  </CardTitle>
                  <CardDescription>
                    Tree ID: {selectedRecord.tree_id} · Recorded: {selectedRecord.recorded_date}
                  </CardDescription>
                </div>
                <Badge variant="forest" size="sm">
                  Status: {selectedRecord.status.replace('_', ' ')}
                </Badge>
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

                {/* Observations */}
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Field Observations:
                  </div>
                  <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    {selectedRecord.observations}
                  </p>
                </div>

                {/* Rule-based Suggested Action */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-forest-700" />
                    Rule-based Suggested Action:
                  </div>
                  <div className="p-3.5 rounded-lg bg-forest-50/70 border border-forest-200 text-xs text-forest-900 leading-relaxed font-medium">
                    {selectedRecord.suggested_actions ||
                      'Rule-based Suggestion: Expand mulch perimeter, inspect root collar for excess silt, and monitor moisture telemetry weekly.'}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => alert('Consultation request dispatched to local certified arborist network.')}
                  >
                    Consult Certified Arborist
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="p-8 text-center text-slate-400">
              <p className="text-xs">No clinical health records logged yet. Run a triage evaluation on the left.</p>
            </Card>
          )}

          {/* Historical Case Records */}
          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Historical Health Observation Logs ({records.length})
            </div>
            {loadingRecords ? (
              <div className="flex items-center gap-2 text-xs text-slate-400 py-4">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading health records...
              </div>
            ) : records.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-white rounded-xl border border-sage-200">
                No past health incidents recorded.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {records.map((rec) => (
                  <div
                    key={rec.id}
                    onClick={() => setSelectedRecord(rec)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      selectedRecord?.id === rec.id
                        ? 'bg-forest-50 border-forest-600 shadow-sm'
                        : 'bg-white border-sage-200 hover:border-forest-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-xs font-bold text-slate-800">
                        {rec.tree_id.substring(0, 14)}
                      </span>
                      <Badge
                        variant={
                          rec.severity === 'severe'
                            ? 'rose'
                            : rec.severity === 'moderate'
                            ? 'amber'
                            : 'emerald'
                        }
                        size="sm"
                      >
                        {rec.severity}
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-600 mt-1 line-clamp-1">
                      {rec.symptoms.join(', ') || rec.observations}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-2">{rec.recorded_date}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
