import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { diagnosePlantHealthWithAI, savePlantDiagnosis } from '../../services/plantIntelligenceService';
import { PlantDiagnosisResult } from '../../types/plantIntelligence';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import {
  Stethoscope,
  Upload,
  Camera,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  Info,
  X,
  Loader2,
  Save,
  Activity,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';

const COMMON_SYMPTOM_TAGS = [
  'Yellowing Foliage / Chlorosis',
  'Leaf Spots (Brown / Black)',
  'Powdery White Mildew',
  'Wilting or Drooping',
  'Curling Leaves',
  'Stunted Growth',
  'Premature Leaf Drop',
  'Browning Leaf Tips / Margins',
  'Pest Webbing or Holes',
  'Soft or Mushy Stems',
  'Root Rot Odor'
];

interface AIPlantDiseaseDiagnosisProps {
  initialPlantName?: string;
  onDiagnosisSaved?: () => void;
}

export const AIPlantDiseaseDiagnosis: React.FC<AIPlantDiseaseDiagnosisProps> = ({
  initialPlantName = '',
  onDiagnosisSaved
}) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [plantName, setPlantName] = useState(initialPlantName);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [customObservations, setCustomObservations] = useState('');

  const [diagnosing, setDiagnosing] = useState(false);
  const [result, setResult] = useState<PlantDiagnosisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, or WEBP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image file is too large. Maximum size is 10MB.');
      return;
    }

    setError(null);
    setResult(null);
    setSaveSuccess(false);
    setMimeType(file.type);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  };

  const handleDiagnose = async () => {
    if (!previewImage && selectedSymptoms.length === 0 && !customObservations.trim()) {
      setError('Please upload a photo or select/describe observed symptoms to run diagnosis.');
      return;
    }

    setDiagnosing(true);
    setError(null);
    setResult(null);
    setSaveSuccess(false);

    const response = await diagnosePlantHealthWithAI({
      imageBase64: previewImage || undefined,
      mimeType,
      plantName: plantName.trim() || undefined,
      symptoms: selectedSymptoms,
      observations: customObservations.trim() || undefined,
    });

    setDiagnosing(false);

    if (response.success && response.data) {
      setResult(response.data);
    } else {
      setError(response.error || 'Failed to complete AI plant diagnosis. Please verify image and symptoms.');
    }
  };

  const handleSaveDiagnosis = async () => {
    if (!result || !user?.id) return;
    setSaving(true);

    const res = await savePlantDiagnosis({
      user_id: user.id,
      plant_name: plantName.trim() || result.plantIdentified || 'Specimen',
      photo_url: previewImage || undefined,
      symptoms: selectedSymptoms,
      observations: customObservations,
      primary_issue: result.primaryIssue,
      category: result.category,
      severity: result.severity,
      confidence: result.confidence,
      treatment_recommendations: result.treatmentRecommendations,
      prevention_advice: result.preventionAdvice,
      full_diagnosis_json: result,
      status: 'active',
    });

    setSaving(false);
    if (res.success) {
      setSaveSuccess(true);
      if (onDiagnosisSaved) onDiagnosisSaved();
      setTimeout(() => setSaveSuccess(false), 4000);
    } else {
      setError(res.error || 'Could not save diagnosis.');
    }
  };

  const handleReset = () => {
    setPreviewImage(null);
    setResult(null);
    setError(null);
    setSaveSuccess(false);
    setSelectedSymptoms([]);
    setCustomObservations('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-emerald-600" />
            AI Plant Disease & Health Diagnosis
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pathological symptom scanning powered by Gemini 1.5. Detect fungal infections, pests, nutrient deficits, and watering stress.
          </p>
        </div>
        <Badge variant="emerald" className="text-xs" dot>
          Pathology Engine
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Photo & Symptoms */}
        <div className="lg:col-span-5 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Specimen Details & Observed Symptoms</CardTitle>
              <CardDescription className="text-xs">
                Provide a photo of the affected area and select observed symptoms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Plant Name or Species (Optional)</label>
                <input
                  type="text"
                  value={plantName}
                  onChange={(e) => setPlantName(e.target.value)}
                  placeholder="e.g. Fiddle Leaf Fig, Tomato, Monstera"
                  className="w-full px-3 py-2 border border-sage-300 rounded-lg text-slate-800 bg-white"
                />
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block font-medium text-slate-700 mb-1">Affected Area Photo</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {previewImage ? (
                  <div className="relative rounded-xl overflow-hidden border border-sage-200 bg-slate-50">
                    <img
                      src={previewImage}
                      alt="Affected area"
                      className="w-full h-44 object-cover object-center"
                    />
                    <button
                      onClick={() => setPreviewImage(null)}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-sage-300 hover:border-emerald-500 bg-sage-50/40 rounded-xl p-5 text-center cursor-pointer transition-colors"
                  >
                    <Camera className="w-6 h-6 text-emerald-600 mx-auto mb-1.5" />
                    <p className="text-xs font-semibold text-slate-800">
                      Upload photo of affected leaves or stems
                    </p>
                    <p className="text-[10px] text-slate-500">JPG, PNG, WEBP up to 10MB</p>
                  </div>
                )}
              </div>

              {/* Observed Symptoms Tag Selection */}
              <div>
                <label className="block font-medium text-slate-700 mb-1.5">
                  Observed Symptoms ({selectedSymptoms.length} selected)
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-1">
                  {COMMON_SYMPTOM_TAGS.map((symptom) => {
                    const isSelected = selectedSymptoms.includes(symptom);
                    return (
                      <button
                        key={symptom}
                        type="button"
                        onClick={() => toggleSymptom(symptom)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors border ${
                          isSelected
                            ? 'bg-emerald-100 border-emerald-400 text-emerald-800'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {symptom}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Additional observations textarea */}
              <div>
                <label className="block font-medium text-slate-700 mb-1">Additional Observations (Optional)</label>
                <textarea
                  rows={2}
                  value={customObservations}
                  onChange={(e) => setCustomObservations(e.target.value)}
                  placeholder="e.g. Started after repotting 10 days ago, located near drafty window..."
                  className="w-full px-3 py-2 border border-sage-300 rounded-lg text-slate-800 bg-white"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  icon={<RotateCcw className="w-3.5 h-3.5" />}
                  className="text-xs"
                >
                  Reset
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  disabled={diagnosing || (!previewImage && selectedSymptoms.length === 0)}
                  onClick={handleDiagnose}
                  icon={diagnosing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Stethoscope className="w-3.5 h-3.5" />}
                  className="flex-1 text-xs"
                >
                  {diagnosing ? 'Running AI Pathology...' : 'Diagnose Plant Health'}
                </Button>
              </div>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold">Diagnosis Alert: </span>
                    {error}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Diagnosis Results */}
        <div className="lg:col-span-7">
          {diagnosing ? (
            <Card className="h-full flex items-center justify-center p-12 text-center">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center animate-pulse">
                  <Activity className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-slate-800">Evaluating Plant Pathogens & Stresses</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Cross-referencing observed necrosis, chlorosis, fungal spore patterns, and moisture stress with botanical pathology databases...
                </p>
              </div>
            </Card>
          ) : result ? (
            <Card className="space-y-4">
              <CardHeader className="border-b border-sage-100 pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 font-semibold">
                      Category: {result.category}
                    </span>
                    <CardTitle className="text-lg text-slate-900 mt-0.5">{result.primaryIssue}</CardTitle>
                    <p className="text-xs text-slate-500">Specimen: {result.plantIdentified}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        result.severity === 'Severe'
                          ? 'amber'
                          : result.severity === 'Moderate'
                          ? 'emerald'
                          : 'slate'
                      }
                    >
                      {result.severity} Severity
                    </Badge>
                    <Badge variant="slate">{result.confidence} Confidence</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                {/* Visible Evidence */}
                {result.visibleEvidence?.length > 0 && (
                  <div>
                    <div className="font-semibold text-slate-800 mb-1.5">Identified Diagnostic Markers</div>
                    <div className="flex flex-wrap gap-1.5">
                      {result.visibleEvidence.map((ev, i) => (
                        <span key={i} className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-700">
                          • {ev}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Immediate Actions */}
                {result.immediateActions?.length > 0 && (
                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg">
                    <div className="font-semibold text-amber-900 mb-1.5 flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                      Immediate First-Response Actions
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-amber-800 text-[11px]">
                      {result.immediateActions.map((action, i) => (
                        <li key={i}>{action}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Treatment Recommendations */}
                {result.treatmentRecommendations?.length > 0 && (
                  <div>
                    <div className="font-semibold text-slate-800 mb-1.5 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Eco-Friendly Treatment Protocols
                    </div>
                    <div className="space-y-1.5">
                      {result.treatmentRecommendations.map((treatment, i) => (
                        <div key={i} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-[11px]">
                          {i + 1}. {treatment}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Prevention Advice */}
                {result.preventionAdvice?.length > 0 && (
                  <div>
                    <div className="font-semibold text-slate-800 mb-1">Long-Term Prevention Strategy</div>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-600 text-[11px]">
                      {result.preventionAdvice.map((prev, i) => (
                        <li key={i}>{prev}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Monitoring Guidance */}
                {result.monitoringGuidance && (
                  <div className="p-2.5 bg-slate-100 rounded text-slate-700 text-[11px]">
                    <span className="font-semibold">Inspection Schedule: </span>
                    {result.monitoringGuidance}
                  </div>
                )}

                {/* Disclaimer */}
                <div className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-100">
                  {result.disclaimer}
                </div>

                {/* Save button */}
                <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                  {saveSuccess ? (
                    <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Diagnosis Saved to Plant History!
                    </span>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSaveDiagnosis}
                      disabled={saving || !user}
                      icon={<Save className="w-3.5 h-3.5" />}
                      className="text-xs"
                    >
                      {saving ? 'Saving...' : user ? 'Save Diagnosis Record' : 'Log in to Save Record'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center p-12 text-center text-slate-400">
              <div className="space-y-2">
                <Stethoscope className="w-10 h-10 mx-auto text-slate-300" />
                <h4 className="text-sm font-semibold text-slate-600">No Diagnosis Active</h4>
                <p className="text-xs max-w-xs mx-auto">
                  Upload a photo of stressed leaves or check observed symptoms on the left to generate an AI pathology evaluation.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
