import React, { useState } from 'react';
import { X, MapPin, TreePine, Calendar, Coins, Users, Target } from 'lucide-react';
import { Project, ProjectCategory, ProjectType, ProjectStatus } from '../../types/project';
import { createProject } from '../../services/projectService';
import { InteractiveMap } from '../map/InteractiveMap';
import { ImageUpload } from '../common/ImageUpload';

interface ProjectCreatorProps {
  onClose: () => void;
  onCreated: (project: Project) => void;
  currentUserId?: string;
  currentUserName?: string;
}

const STEPS = ['Basics', 'Location', 'Goals & Budget', 'Resources', 'Preview'];

export const ProjectCreator: React.FC<ProjectCreatorProps> = ({
  onClose,
  onCreated,
  currentUserId,
  currentUserName
}) => {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    description: '',
    problem_statement: '',
    proposed_solution: '',
    category: 'tree_planting' as ProjectCategory,
    project_type: 'community' as ProjectType,
    status: 'draft' as ProjectStatus,
    location_name: '',
    latitude: 44.9778,
    longitude: -93.265,
    region: '',
    country: 'USA',
    start_date: '',
    end_date: '',
    estimated_timeline: '',
    currency: 'USD',
    estimated_budget: '',
    funding_target: '',
    volunteers_needed: '',
    cover_image_url: '',
    objectives_raw: '',
    expected_outcomes_raw: '',
    resource_requirements_raw: '',
  });

  const set = (k: keyof typeof form, v: string | number) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const handleSubmit = async () => {
    if (!form.title.trim()) { setError('Project title is required'); return; }
    if (!form.description.trim()) { setError('Project description is required'); return; }
    if (!form.location_name.trim()) { setError('Project location is required'); return; }

    try {
      setSubmitting(true);
      setError(null);
      const res = await createProject(
        {
          ...form,
          estimated_budget: parseFloat(form.estimated_budget) || 10000,
          funding_target: parseFloat(form.funding_target) || 8000,
          volunteers_needed: parseInt(form.volunteers_needed) || 20,
          objectives: form.objectives_raw.split('\n').map(s => s.trim()).filter(Boolean),
          expected_outcomes: form.expected_outcomes_raw.split('\n').map(s => s.trim()).filter(Boolean),
          resource_requirements: form.resource_requirements_raw.split('\n').map(s => s.trim()).filter(Boolean),
        },
        currentUserId,
        currentUserName
      );
      if (res.data) onCreated(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  const categories: { id: ProjectCategory; label: string; emoji: string }[] = [
    { id: 'tree_planting', label: 'Tree Planting', emoji: '🌱' },
    { id: 'forest_restoration', label: 'Forest Restoration', emoji: '🌲' },
    { id: 'biodiversity', label: 'Biodiversity', emoji: '🦋' },
    { id: 'recycling', label: 'Recycling', emoji: '♻️' },
    { id: 'water_conservation', label: 'Water Conservation', emoji: '💧' },
    { id: 'urban_greening', label: 'Urban Greening', emoji: '🏙️' },
    { id: 'climate_action', label: 'Climate Action', emoji: '🌍' },
    { id: 'clean_energy', label: 'Clean Energy', emoji: '☀️' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 rounded-t-3xl flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Propose a Green Project</h2>
            <div className="flex items-center gap-1 mt-1">
              {STEPS.map((s, i) => (
                <div key={s} className={`flex items-center gap-1`}>
                  <div className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center transition-colors ${
                    i < step ? 'bg-emerald-600 text-white' :
                    i === step ? 'bg-slate-900 text-white' :
                    'bg-slate-100 text-slate-500'
                  }`}>{i < step ? '✓' : i + 1}</div>
                  {i < STEPS.length - 1 && <div className={`w-6 h-px ${i < step ? 'bg-emerald-400' : 'bg-slate-200'}`} />}
                </div>
              ))}
              <span className="ml-2 text-xs text-slate-500 font-medium">{STEPS[step]}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">{error}</div>
          )}

          {/* Step 0: Basics */}
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Project Title *</label>
                <input type="text" value={form.title} onChange={e => set('title', e.target.value)}
                  placeholder="e.g. Blue Ridge Native Hardwood Canopy Restoration"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">One-Line Subtitle</label>
                <input type="text" value={form.subtitle} onChange={e => set('subtitle', e.target.value)}
                  placeholder="Compelling single sentence describing the ecological goal"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Project Category *</label>
                <div className="grid grid-cols-4 gap-2">
                  {categories.map(cat => (
                    <button key={cat.id} type="button"
                      onClick={() => set('category', cat.id)}
                      className={`p-2.5 rounded-xl text-xs font-medium border text-center transition-all ${
                        form.category === cat.id
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-semibold ring-1 ring-emerald-500'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}>
                      <div className="text-lg">{cat.emoji}</div>
                      <div className="mt-0.5 leading-tight">{cat.label}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Project Type</label>
                  <select value={form.project_type} onChange={e => set('project_type', e.target.value)}
                    className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-700">
                    <option value="community">Community-Led</option>
                    <option value="institutional">Institutional / NGO</option>
                    <option value="grassroots">Grassroots Guild</option>
                    <option value="research">Research Initiative</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Status</label>
                  <select value={form.status} onChange={e => set('status', e.target.value as ProjectStatus)}
                    className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-700">
                    <option value="draft">Save as Draft</option>
                    <option value="active">Publish Now (Active)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Project Description *</label>
                <textarea rows={4} value={form.description} onChange={e => set('description', e.target.value)}
                  placeholder="Explain the ecological scope, methodology, and community impact of your initiative..."
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Environmental Problem Statement</label>
                <textarea rows={2} value={form.problem_statement} onChange={e => set('problem_statement', e.target.value)}
                  placeholder="Describe the ecological issue this project addresses..."
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Proposed Solution</label>
                <textarea rows={2} value={form.proposed_solution} onChange={e => set('proposed_solution', e.target.value)}
                  placeholder="Outline your specific, actionable solution to the problem..."
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
              <div>
                <ImageUpload
                  label="Project Cover Image (Optional)"
                  value={form.cover_image_url}
                  onChange={url => set('cover_image_url', url)}
                  bucket="projects"
                  userId={currentUserId}
                  folder="covers"
                  placeholderText="Click or drop project cover photo"
                  aspectRatio="video"
                />
              </div>
            </div>
          )}

          {/* Step 1: Location */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Location Name / Address *</label>
                <input type="text" value={form.location_name} onChange={e => set('location_name', e.target.value)}
                  placeholder="e.g. Blue Ridge Parkway, Sector 12, Asheville, NC"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Region / State</label>
                  <input type="text" value={form.region} onChange={e => set('region', e.target.value)}
                    placeholder="e.g. Southeast, Pacific Northwest" className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Country</label>
                  <input type="text" value={form.country} onChange={e => set('country', e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  <MapPin className="w-3.5 h-3.5 inline mr-1 text-emerald-600" />
                  Pin Project Location on OpenStreetMap
                </label>
                <div className="rounded-xl overflow-hidden border border-slate-200">
                  <InteractiveMap
                    center={[form.latitude, form.longitude]}
                    zoom={12}
                    height="260px"
                    enableClickToPick={true}
                    enableSearch={true}
                    selectedLocation={{ lat: form.latitude, lng: form.longitude }}
                    onLocationSelect={(loc) => {
                      setForm(prev => ({
                        ...prev,
                        latitude: loc.lat,
                        longitude: loc.lng,
                        location_name: prev.location_name || loc.address,
                      }));
                    }}
                  />
                </div>
                <div className="text-[11px] text-slate-500 mt-1 flex justify-between">
                  <span>Coordinates: {form.latitude.toFixed(4)}°, {form.longitude.toFixed(4)}°</span>
                  <span>Click anywhere to place project pin</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Goals & Budget */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Project Objectives (one per line)</label>
                <textarea rows={4} value={form.objectives_raw} onChange={e => set('objectives_raw', e.target.value)}
                  placeholder={"Establish 5,000 native trees along 3km watershed\nDeploy 15 soil moisture telemetry probes\nEngage 100 local volunteers across 4 field drives"}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl font-mono" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Expected Outcomes (one per line)</label>
                <textarea rows={3} value={form.expected_outcomes_raw} onChange={e => set('expected_outcomes_raw', e.target.value)}
                  placeholder={"5,000 trees cataloged in Greenverse Passport ledger\n95% target survival rate after Year 1 audit\n60 tons estimated CO2 sequestration per year"}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl font-mono" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
                  <input type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target End Date</label>
                  <input type="date" value={form.end_date} onChange={e => set('end_date', e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Estimated Timeline Summary</label>
                <input type="text" value={form.estimated_timeline} onChange={e => set('estimated_timeline', e.target.value)}
                  placeholder="e.g. 6 Months Active Planting + 18 Months Monitoring"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Currency</label>
                  <select value={form.currency} onChange={e => set('currency', e.target.value)}
                    className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl">
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="CAD">CAD ($)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="AUD">AUD ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Estimated Budget</label>
                  <input type="number" min="0" value={form.estimated_budget} onChange={e => set('estimated_budget', e.target.value)}
                    placeholder="25000" className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Funding Target</label>
                  <input type="number" min="0" value={form.funding_target} onChange={e => set('funding_target', e.target.value)}
                    placeholder="20000" className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Resources */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Volunteers Needed</label>
                <input type="number" min="1" value={form.volunteers_needed} onChange={e => set('volunteers_needed', e.target.value)}
                  placeholder="20" className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Resource Requirements (one per line)</label>
                <textarea rows={5} value={form.resource_requirements_raw} onChange={e => set('resource_requirements_raw', e.target.value)}
                  placeholder={"200 Planting shovels and dibble bars\nOrganic bark mulch (60 cubic yards)\nRefrigerated nursery transport van\nArborist safety harnesses & gear"}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl font-mono" />
              </div>
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
                <strong>Payment Gateway Notice:</strong> Greenverse funding campaigns currently track verified receipts and community pledges transparently. Real payment processing is not yet activated. For India-region projects, Razorpay or Cashfree can be integrated — these require business KYC registration, bank account verification, and standard platform fees (~2%). For US projects, Stripe requires account verification, identity confirmation, and payout setup. No charges are incurred until you activate a live payment gateway key. Contact your Greenverse administrator to request payment integration activation.
              </div>
            </div>
          )}

          {/* Step 4: Preview */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-3">
                  {form.cover_image_url && (
                    <img src={form.cover_image_url} alt="Cover" className="w-16 h-16 rounded-xl object-cover border border-slate-200" />
                  )}
                  <div>
                    <h3 className="font-bold text-slate-900">{form.title || 'Untitled Project'}</h3>
                    <p className="text-xs text-slate-500">{form.subtitle}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-700">
                  <div><span className="text-slate-500">Category:</span> <strong>{form.category.replace('_', ' ')}</strong></div>
                  <div><span className="text-slate-500">Type:</span> <strong>{form.project_type}</strong></div>
                  <div><span className="text-slate-500">Location:</span> <strong>{form.location_name || 'Not set'}</strong></div>
                  <div><span className="text-slate-500">Funding Target:</span> <strong>{form.currency} {parseFloat(form.funding_target || '0').toLocaleString()}</strong></div>
                  <div><span className="text-slate-500">Volunteers Needed:</span> <strong>{form.volunteers_needed || 'Not set'}</strong></div>
                  <div><span className="text-slate-500">Initial Status:</span> <strong className="capitalize">{form.status}</strong></div>
                </div>
                {form.objectives_raw && (
                  <div>
                    <div className="text-xs font-semibold text-slate-700 mb-1">Objectives:</div>
                    <ul className="space-y-0.5">
                      {form.objectives_raw.split('\n').filter(Boolean).map((o, i) => (
                        <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                          <span className="text-emerald-600 mt-0.5">•</span> {o}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 leading-relaxed">
                <strong>Transparency Commitment:</strong> By submitting this project, you agree to maintain honest funding records, accurate ecological outcome reporting, and timely milestone updates within the Greenverse verification framework.
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-4 rounded-b-3xl flex items-center justify-between">
          <button onClick={() => step > 0 ? setStep(s => s - 1) : onClose()}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900">
            {step === 0 ? 'Cancel' : '← Back'}
          </button>

          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep(s => s + 1)}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold transition-colors">
              Continue →
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50">
              {submitting ? 'Submitting...' : 'Submit Project'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
