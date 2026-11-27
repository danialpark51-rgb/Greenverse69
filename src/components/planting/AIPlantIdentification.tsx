import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { identifyPlantWithAI, saveUserPlant } from '../../services/plantIntelligenceService';
import { PlantIdentificationResult } from '../../types/plantIntelligence';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import {
  Camera,
  Upload,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  BookmarkPlus,
  Sun,
  Droplets,
  Layers,
  HelpCircle,
  Eye,
  X,
  Loader2,
  Info
} from 'lucide-react';

interface AIPlantIdentificationProps {
  onPlantSaved?: () => void;
  onNavigateToCarePlan?: (plantName: string, scientificName?: string) => void;
}

export const AIPlantIdentification: React.FC<AIPlantIdentificationProps> = ({
  onPlantSaved,
  onNavigateToCarePlan
}) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<PlantIdentificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
    setSavedSuccess(false);
    setMimeType(file.type);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    setPreviewImage(null);
    setResult(null);
    setError(null);
    setSavedSuccess(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleIdentify = async () => {
    if (!previewImage) {
      setError('Please select or capture a plant image first.');
      return;
    }

    setAnalyzing(true);
    setError(null);
    setResult(null);
    setSavedSuccess(false);

    const response = await identifyPlantWithAI(previewImage, mimeType);
    setAnalyzing(false);

    if (response.success && response.data) {
      setResult(response.data);
    } else {
      setError(response.error || 'Failed to identify plant. Please retry with a clearer photo.');
    }
  };

  const handleSaveToMyPlants = async () => {
    if (!result || !user?.id) return;
    setIsSaving(true);

    const res = await saveUserPlant({
      user_id: user.id,
      common_name: result.commonName,
      scientific_name: result.scientificName,
      family: result.family,
      category: result.category,
      location_type: 'Outdoor',
      photo_url: previewImage || undefined,
      planting_date: new Date().toISOString().split('T')[0],
      care_status: 'Healthy',
      notes: `Identified via Gemini AI: ${result.confidenceExplanation}`,
    });

    setIsSaving(false);
    if (res.success) {
      setSavedSuccess(true);
      if (onPlantSaved) onPlantSaved();
      setTimeout(() => setSavedSuccess(false), 4000);
    } else {
      setError(res.error || 'Could not save plant.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-lime-600" />
            AI Plant & Botanical Identification
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Multimodal vision analysis powered by Google Gemini. Identify species, botanical families, and observable traits.
          </p>
        </div>
        <Badge variant="lime" className="text-xs" dot>
          Gemini 1.5 Vision
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upload & Preview Section */}
        <div className="lg:col-span-5 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Specimen Photograph</CardTitle>
              <CardDescription className="text-xs">
                Upload a clear photo of the leaves, flowers, bark, or whole plant
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
                id="plant-photo-input"
              />

              {previewImage ? (
                <div className="relative rounded-xl overflow-hidden border border-sage-200 bg-slate-50 group">
                  <img
                    src={previewImage}
                    alt="Plant preview"
                    className="w-full h-64 object-cover object-center"
                  />
                  <button
                    onClick={handleClearImage}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors"
                    title="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-sage-300 hover:border-forest-500 bg-sage-50/40 rounded-xl p-8 text-center cursor-pointer transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-forest-100 text-forest-700 mx-auto flex items-center justify-center mb-3">
                    <Camera className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-semibold text-slate-800">
                    Click to upload or snap plant photo
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Supports JPG, PNG, WEBP up to 10MB
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  icon={<Upload className="w-3.5 h-3.5" />}
                  className="flex-1 text-xs"
                >
                  {previewImage ? 'Replace Photo' : 'Choose Photo'}
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  disabled={!previewImage || analyzing}
                  onClick={handleIdentify}
                  icon={analyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  className="flex-1 text-xs"
                >
                  {analyzing ? 'Analyzing with Vision...' : 'Identify Plant'}
                </Button>
              </div>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold">Identification Notice: </span>
                    {error}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Identification Results Section */}
        <div className="lg:col-span-7">
          {analyzing ? (
            <Card className="h-full flex items-center justify-center p-12 text-center">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-full bg-lime-100 text-lime-700 mx-auto flex items-center justify-center animate-pulse">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-slate-800">Analyzing botanical characteristics</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Extracting leaf venation, phyllotaxy, petal morphology, and growth habit through Gemini multimodal vision...
                </p>
              </div>
            </Card>
          ) : result ? (
            <Card className="space-y-4">
              <CardHeader className="border-b border-sage-100 pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-forest-600 font-semibold">
                      {result.category} • Family: {result.family}
                    </span>
                    <CardTitle className="text-lg text-slate-900 mt-0.5">{result.commonName}</CardTitle>
                    <p className="text-xs font-mono italic text-slate-500">{result.scientificName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        result.confidenceLevel === 'High'
                          ? 'emerald'
                          : result.confidenceLevel === 'Moderate'
                          ? 'amber'
                          : 'slate'
                      }
                    >
                      {result.confidenceLevel} Confidence ({result.confidenceScore}%)
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                {/* Confidence explanation */}
                <div className="p-3 bg-sage-50 rounded-lg border border-sage-200">
                  <div className="font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-forest-700" />
                    Botanical Identification Analysis
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    {result.confidenceExplanation}
                  </p>
                </div>

                {/* Observable characteristics */}
                {result.observableCharacteristics?.length > 0 && (
                  <div>
                    <div className="font-semibold text-slate-800 mb-2">Visible Diagnostic Characteristics</div>
                    <div className="flex flex-wrap gap-1.5">
                      {result.observableCharacteristics.map((trait, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 bg-white border border-sage-200 rounded-md text-[11px] text-slate-700 shadow-sm"
                        >
                          ✓ {trait}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Basic Care Overview */}
                {result.careOverview && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                      <div className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                        <Sun className="w-3 h-3 text-amber-500" /> Sunlight
                      </div>
                      <div className="font-semibold text-slate-800 mt-0.5 text-[11px]">
                        {result.careOverview.sunlight}
                      </div>
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                      <div className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                        <Droplets className="w-3 h-3 text-sky-500" /> Watering
                      </div>
                      <div className="font-semibold text-slate-800 mt-0.5 text-[11px]">
                        {result.careOverview.watering}
                      </div>
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                      <div className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                        <Layers className="w-3 h-3 text-emerald-600" /> Soil
                      </div>
                      <div className="font-semibold text-slate-800 mt-0.5 text-[11px] truncate" title={result.careOverview.soil}>
                        {result.careOverview.soil}
                      </div>
                    </div>
                  </div>
                )}

                {/* Alternative species if uncertain */}
                {result.alternativeSpecies?.length > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <div className="text-[11px] font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                      Alternative Plausible Species:
                    </div>
                    <div className="space-y-1">
                      {result.alternativeSpecies.map((alt, i) => (
                        <div key={i} className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded">
                          <span className="font-medium text-slate-900">{alt.commonName}</span> ({alt.scientificName}) —{' '}
                          <span className="text-slate-500">{alt.distinction}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
                  {savedSuccess ? (
                    <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Added to My Plants!
                    </span>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSaveToMyPlants}
                      disabled={isSaving || !user}
                      icon={<BookmarkPlus className="w-3.5 h-3.5" />}
                      className="text-xs"
                    >
                      {isSaving ? 'Saving...' : user ? 'Save to My Plants' : 'Log in to Save'}
                    </Button>
                  )}

                  {onNavigateToCarePlan && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onNavigateToCarePlan(result.commonName, result.scientificName)}
                      className="text-xs"
                    >
                      Generate Care Plan →
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center p-12 text-center text-slate-400">
              <div className="space-y-2">
                <Eye className="w-10 h-10 mx-auto text-slate-300" />
                <h4 className="text-sm font-semibold text-slate-600">No Specimen Identified Yet</h4>
                <p className="text-xs max-w-xs mx-auto">
                  Upload an image on the left and click "Identify Plant" to see comprehensive botanical taxonomy and care overview.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
