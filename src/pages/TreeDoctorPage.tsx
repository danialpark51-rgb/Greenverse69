import React, { useState, useEffect } from 'react';
import { DbHealthRecord, DbTree, CreateHealthRecordInput } from '../types/tree';
import { fetchHealthRecords, createHealthRecord, fetchTrees, runAIDiagnosis, AIDiagnosisResponse } from '../services/treeService';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import {
  Stethoscope,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Sparkles,
  ShieldCheck,
  Info,
  Loader2,
  Zap,
  ListChecks,
  ShieldAlert,
  ClipboardList,
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

  // AI diagnosis state
  const [isScanning, setIsScanning] = useState(false);
  const [aiResult, setAiResult] = useState<AIDiagnosisResponse | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [recordSaved, setRecordSaved] = useState(false);

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
    setAiResult(null);
    setAiError(null);
    setRecordSaved(false);

    // Find selected tree's species name for the AI prompt
    const selectedTree = trees.find((t) => t.id === selectedTreeId);
    const speciesName = selectedTree?.species ?? selectedTree?.name ?? undefined;

    // 1. Call AI diagnosis via Supabase Edge Function
    const { data: diagnosis, error: diagError } = await runAIDiagnosis({
      symptoms: selectedSymptoms,
      observations: observations.trim(),
      severity,
      speciesName,
    });

    if (diagError || !diagnosis) {
      setAiError(diagError?.message || 'AI diagnosis failed. Please try again.');
      setIsScanning(false);
      return;
    }

    setAiResult(diagnosis);

    // 2. Also save a health record to the database (regardless of AI result)
    const input: CreateHealthRecordInput = {
      tree_id: selectedTreeId,
      recorded_date: new Date().toISOString().split('T')[0],
      symptoms: selectedSymptoms.length > 0 ? selectedSymptoms : ['Unspecified stress symptom'],
      observations: observations.trim() || 'AI-assisted triage via ArborVision.',
      severity,
    };

    const res = await createHealthRecord(input, user?.id);
    if (res.data) {
      setRecords((prev) => [res.data!, ...prev]);
      setSelectedRecord(res.data);
      setRecordSaved(true);
    }

    setIsScanning(false);

    // Reset form
    setSelectedSymptoms([]);
    setObservations('');
  };

  const confidenceColor = (c: AIDiagnosisResponse['confidence']) =>
    c === 'High' ? 'emerald' : c === 'Moderate' ? 'amber' : 'rose';

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-forest-700" />
            Tree Health Clinic — AI-Powered Diagnostic
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Gemini AI analysis of observed symptoms plus persistent health record logging.
          </p>
        </div>
        <Badge variant="lime" dot>
          Gemini AI Diagnosis Active
        </Badge>
      </div>

      {/* Disclaimer Banner */}
      <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">AI Disclaimer</span>
          <p className="text-[11px] text-amber-800 mt-0.5">
            Diagnostic suggestions are generated by Google Gemini AI based on submitted symptoms and observations.
            They are for informational guidance only and do not replace on-site inspection by a certified arborist for
            critical or high-value trees.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Interactive Triage Evaluator */}
        <Card className="lg:col-span-1 space-y-4">
          <CardHeader>
            <div>
              <CardTitle>ArborVision AI Evaluator</CardTitle>
              <CardDescription>Select symptoms → AI generates diagnosis</CardDescription>
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

            {recordSaved && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Health record saved to your registry.
                </div>
              </div>
            )}

            {aiError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-[11px]">
                <AlertTriangle className="w-4 h-4 inline mr-1" />
                {aiError}
              </div>
            )}

            <Button
              variant="primary"
              size="md"
              className="w-full"
              isLoading={isScanning}
              onClick={handleRunDiagnostic}
              icon={<Zap className="w-4 h-4" />}
            >
              {isScanning ? 'Analysing with Gemini AI…' : 'Run AI Diagnosis'}
            </Button>
          </CardContent>
        </Card>

        {/* Right 2 Columns */}
        <div className="lg:col-span-2 space-y-5">
          {/* AI Result Card */}
          {aiResult && (
            <Card className="overflow-hidden border-2 border-forest-200">
              <CardHeader className="bg-forest-50/60">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-4 h-4 text-forest-700" />
                      <span className="font-semibold text-sm text-forest-900">
                        {aiResult.ai_powered ? 'Gemini AI Diagnosis' : 'Fallback Response'}
                      </span>
                    </div>
                    <CardTitle className="text-sm">{aiResult.diagnosis}</CardTitle>
                  </div>
                  <Badge variant={confidenceColor(aiResult.confidence)} size="sm">
                    {aiResult.confidence} Confidence
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-5 text-xs">
                {/* Likely Causes */}
                {aiResult.likely_causes.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      Likely Causes
                    </div>
                    <ul className="space-y-1">
                      {aiResult.likely_causes.map((c, i) => (
                        <li key={i} className="flex items-start gap-2 text-slate-700">
                          <span className="mt-0.5 w-4 h-4 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-[10px] font-bold shrink-0">
                            {i + 1}
                          </span>
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Treatment Steps */}
                {aiResult.treatment_steps.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-2">
                      <ListChecks className="w-3.5 h-3.5 text-forest-700" />
                      Treatment Steps
                    </div>
                    <ol className="space-y-1.5">
                      {aiResult.treatment_steps.map((step, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 p-2.5 bg-forest-50/70 border border-forest-100 rounded-lg text-forest-900"
                        >
                          <span className="font-bold text-forest-700 shrink-0">{i + 1}.</span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Preventive Measures */}
                {aiResult.preventive_measures.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
                      Preventive Measures
                    </div>
                    <ul className="space-y-1">
                      {aiResult.preventive_measures.map((m, i) => (
                        <li key={i} className="flex items-start gap-2 text-slate-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 shrink-0 mt-0.5" />
                          {m}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Follow-up */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-1">
                    <ClipboardList className="w-3.5 h-3.5" />
                    Follow-up Recommendation
                  </div>
                  <p className="text-slate-700">{aiResult.follow_up}</p>
                </div>

                {/* Disclaimer */}
                <div className="p-2.5 bg-amber-50 border border-amber-100 rounded-lg text-[11px] text-amber-800">
                  <ShieldAlert className="w-3 h-3 inline mr-1" />
                  {aiResult.disclaimer}
                </div>

                {/* Model tag */}
                <div className="text-[10px] text-slate-400 text-right">
                  Model: {aiResult.model} · AI-Powered: {aiResult.ai_powered ? 'Yes' : 'No (Fallback)'}
                </div>

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
                No past health incidents recorded. Run a diagnosis above to create the first record.
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
