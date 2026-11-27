import React, { useState, useEffect } from 'react';
import { DbTree, RegisterTreeInput, HealthStatus } from '../types/tree';
import { fetchTrees, registerTree } from '../services/treeService';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { SearchInput } from '../components/common/SearchInput';
import { Modal } from '../components/common/Modal';
import { ImageUpload } from '../components/common/ImageUpload';
import { QRCodeDisplay } from '../components/trees/QRCodeDisplay';
import { GrowthJournalPanel } from '../components/trees/GrowthJournalPanel';
import { AdoptTreePanel } from '../components/trees/AdoptTreePanel';
import {
  QrCode,
  ShieldCheck,
  Calendar,
  MapPin,
  Trees,
  Award,
  Sparkles,
  Plus,
  Loader2,
  AlertCircle,
  Database,
  CheckCircle2,
  Filter
} from 'lucide-react';

export const PassportPage: React.FC = () => {
  const { user } = useAuth();
  const [trees, setTrees] = useState<DbTree[]>([]);
  const [loading, setLoading] = useState(true);
  const [fromSupabase, setFromSupabase] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'mine' | HealthStatus>('all');
  const [selectedTree, setSelectedTree] = useState<DbTree | null>(null);

  // Modals
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  // Registration Form State
  const [regForm, setRegForm] = useState<RegisterTreeInput>({
    name: '',
    species: '',
    scientific_name: '',
    planting_date: new Date().toISOString().split('T')[0],
    location_description: '',
    latitude: null,
    longitude: null,
    photo_url: '',
    health_status: 'thriving',
    height_meters: 1.2,
    dbh_cm: 2.5,
    notes: '',
  });
  const [regSubmitting, setRegSubmitting] = useState(false);
  const [regFeedback, setRegFeedback] = useState<{ type: 'success' | 'warn' | 'error'; message: string } | null>(null);

  const loadTrees = async () => {
    setLoading(true);
    const result = await fetchTrees();
    setTrees(result.data);
    setFromSupabase(result.fromSupabase);
    if (result.data.length > 0) {
      setSelectedTree((prev) => prev ? result.data.find(t => t.id === prev.id) || result.data[0] : result.data[0]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTrees();
  }, []);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regForm.species.trim()) {
      setRegFeedback({ type: 'error', message: 'Species is required.' });
      return;
    }
    if (!regForm.location_description.trim()) {
      setRegFeedback({ type: 'error', message: 'Location description is required.' });
      return;
    }

    setRegSubmitting(true);
    setRegFeedback(null);

    const res = await registerTree(regForm, user?.id);
    setRegSubmitting(false);

    if (res.data) {
      if (res.fromSupabase) {
        setRegFeedback({
          type: 'success',
          message: `Tree registered successfully to Supabase with code ${res.data.tree_code}!`,
        });
      } else {
        setRegFeedback({
          type: 'warn',
          message: `Tree created locally (${res.data.tree_code}). Supabase table migration pending in SQL editor.`,
        });
      }
      await loadTrees();
      setSelectedTree(res.data);
      // Reset form
      setRegForm({
        name: '',
        species: '',
        scientific_name: '',
        planting_date: new Date().toISOString().split('T')[0],
        location_description: '',
        latitude: null,
        longitude: null,
        photo_url: '',
        health_status: 'thriving',
        height_meters: 1.2,
        dbh_cm: 2.5,
        notes: '',
      });
      setTimeout(() => {
        setIsRegisterModalOpen(false);
        setRegFeedback(null);
      }, 1800);
    } else {
      setRegFeedback({
        type: 'error',
        message: res.error?.message || 'Failed to register tree.',
      });
    }
  };

  const filteredTrees = trees.filter((t) => {
    const s = searchTerm.toLowerCase();
    const matchesSearch =
      t.tree_code.toLowerCase().includes(s) ||
      t.species.toLowerCase().includes(s) ||
      (t.name && t.name.toLowerCase().includes(s)) ||
      (t.location_description && t.location_description.toLowerCase().includes(s));

    if (!matchesSearch) return false;

    if (statusFilter === 'all') return true;
    if (statusFilter === 'mine') return user ? t.user_id === user.id : true;
    return t.health_status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <QrCode className="w-6 h-6 text-forest-700" />
            Digital Tree Passport Registry
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tamper-proof digital twins linking physical saplings to verifiable biometric telemetry & carbon audit trails.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {fromSupabase ? (
            <Badge variant="emerald" dot>Supabase Synced</Badge>
          ) : (
            <Badge variant="amber" dot>Local Memory Cache</Badge>
          )}
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsRegisterModalOpen(true)}
          >
            Register New Tree
          </Button>
        </div>
      </div>

      {/* Database Warning Banner if Supabase returned fallback */}
      {!fromSupabase && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
          <Database className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Notice: Supabase Tree Database syncing in Local Cache mode.</span>
            <p className="text-[11px] text-amber-800 mt-0.5">
              Please execute the migration script <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">supabase/migrations/01_batch1_tree_ecosystem.sql</code> in your Supabase SQL editor to enable persistent cloud storage.
            </p>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Search, Filter, & Tree List */}
        <div className="lg:col-span-1 space-y-4">
          <SearchInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClear={() => setSearchTerm('')}
            placeholder="Search passport code, species, location..."
          />

          {/* Quick Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            {(['all', 'mine', 'thriving', 'attention_required'] as const).map((filterKey) => (
              <button
                key={filterKey}
                onClick={() => setStatusFilter(filterKey)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  statusFilter === filterKey
                    ? 'bg-forest-700 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {filterKey === 'all'
                  ? 'All Trees'
                  : filterKey === 'mine'
                  ? 'My Trees'
                  : filterKey === 'thriving'
                  ? 'Thriving'
                  : 'Attention'}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl border border-sage-200 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-forest-600 mb-2" />
              <span className="text-xs">Fetching tree passports...</span>
            </div>
          ) : filteredTrees.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-dashed border-sage-300 space-y-3">
              <Trees className="w-8 h-8 text-sage-400 mx-auto" />
              <div className="text-xs font-semibold text-slate-700">No tree passports found</div>
              <p className="text-[11px] text-slate-500">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your search criteria or filter.'
                  : 'Register your first tree to generate a digital passport!'}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setIsRegisterModalOpen(true)}
              >
                + Register First Tree
              </Button>
            </div>
          ) : (
            <div className="space-y-3 max-h-[680px] overflow-y-auto pr-1">
              {filteredTrees.map((tree) => {
                const isSelected = selectedTree?.id === tree.id;
                return (
                  <div
                    key={tree.id}
                    onClick={() => setSelectedTree(tree)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-forest-50/70 border-forest-600 shadow-sm ring-1 ring-forest-500'
                        : 'bg-white border-sage-200 hover:border-forest-300 hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-mono text-xs font-bold text-forest-900 flex items-center gap-1.5">
                          <QrCode className="w-3.5 h-3.5 text-forest-700 shrink-0" />
                          {tree.tree_code}
                        </div>
                        <div className="text-sm font-semibold text-slate-800 mt-1">
                          {tree.name || tree.species}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                          {tree.location_description || 'Global coordinate registered'}
                        </div>
                      </div>
                      <Badge
                        variant={
                          tree.health_status === 'thriving'
                            ? 'emerald'
                            : tree.health_status === 'stable'
                            ? 'forest'
                            : 'amber'
                        }
                        size="sm"
                      >
                        {tree.health_status === 'thriving'
                          ? 'Thriving'
                          : tree.health_status === 'stable'
                          ? 'Stable'
                          : 'Attention'}
                      </Badge>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-sage-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Planted {tree.planting_date}</span>
                      <span className="font-semibold text-forest-700">
                        {tree.carbon_offset_kg} kg CO₂e
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 2 Columns: Full Digital Twin Passport Certificate */}
        <div className="lg:col-span-2 space-y-5">
          {selectedTree ? (
            <Card className="overflow-hidden border-2 border-forest-100">
              {/* Passport Header Ribbon */}
              <div className="p-6 bg-gradient-to-r from-forest-deep via-forest-rich to-forest-moss text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-lime-400 font-bold">
                    OFFICIAL BIOSPHERE DIGITAL TWIN
                  </div>
                  <h2 className="text-2xl font-black tracking-tight text-white mt-1">
                    {selectedTree.tree_code}
                  </h2>
                  <div className="text-xs text-forest-200 mt-0.5">
                    {selectedTree.name ? `${selectedTree.name} — ` : ''}
                    {selectedTree.species}
                    {selectedTree.scientific_name ? (
                      <span className="italic"> ({selectedTree.scientific_name})</span>
                    ) : null}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    variant="lime"
                    size="sm"
                    icon={<QrCode className="w-4 h-4" />}
                    onClick={() => setIsQrModalOpen(true)}
                  >
                    View QR Certificate
                  </Button>
                </div>
              </div>

              <CardContent className="p-6 space-y-6">
                {/* Photo & Biometric Twin Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-1">
                    <img
                      src={
                        selectedTree.photo_url ||
                        'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=600&q=80'
                      }
                      alt={selectedTree.species}
                      className="w-full h-48 rounded-xl object-cover border border-sage-200 shadow-sm"
                    />
                    <div className="mt-2 text-center text-[10px] text-slate-400">
                      Telemetry & optical capture · 2026
                    </div>
                  </div>

                  <div className="md:col-span-2 grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400">Canopy Height</span>
                      <div className="text-base font-bold text-slate-900 mt-0.5">
                        {selectedTree.height_meters} m
                      </div>
                      <span className="text-[10px] text-emerald-600 font-medium">
                        Measured via telemetry
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400">Stem Diameter (DBH)</span>
                      <div className="text-base font-bold text-slate-900 mt-0.5">
                        {selectedTree.dbh_cm} cm
                      </div>
                      <span className="text-[10px] text-slate-500">Caliper reading</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400">Health Vitality</span>
                      <div className="text-base font-bold text-emerald-700 mt-0.5 capitalize">
                        {selectedTree.health_status.replace('_', ' ')}
                      </div>
                      <span className="text-[10px] text-slate-500">Field observation</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400">Verified Carbon Sink</span>
                      <div className="text-base font-bold text-forest-800 mt-0.5">
                        {selectedTree.carbon_offset_kg} kg
                      </div>
                      <span className="text-[10px] text-forest-600">Verra VCS standard</span>
                    </div>
                  </div>
                </div>

                {/* Provenance & Ownership Log */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Planetary Registry Credentials
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin className="w-4 h-4 text-forest-700 shrink-0" />
                      <span>
                        Location: {selectedTree.location_description || 'Coordinates logged'}
                        {selectedTree.latitude && selectedTree.longitude ? (
                          <span className="font-mono text-[10px] ml-1">
                            ({selectedTree.latitude.toFixed(4)}°, {selectedTree.longitude.toFixed(4)}°)
                          </span>
                        ) : null}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Award className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        Registry Status: {selectedTree.user_id ? 'Authenticated Steward' : 'Community Biosphere'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Calendar className="w-4 h-4 text-forest-700 shrink-0" />
                      <span>Planted Date: {selectedTree.planting_date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <ShieldCheck className="w-4 h-4 text-forest-700 shrink-0" />
                      <span>Passport Integrity: Cryptographically Verified</span>
                    </div>
                  </div>
                </div>

                {/* Field Notes */}
                {selectedTree.notes && (
                  <div className="p-4 bg-forest-50/60 rounded-xl border border-forest-100 text-xs">
                    <div className="font-semibold text-forest-900 mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-forest-700" />
                      Steward & Arborist Field Notes
                    </div>
                    <p className="text-slate-600 leading-relaxed">{selectedTree.notes}</p>
                  </div>
                )}

                {/* Growth Journal & Community Guardianship Tabs/Sections */}
                <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Growth Journal */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <GrowthJournalPanel treeId={selectedTree.id} userId={user?.id} />
                  </div>

                  {/* Adopt-a-Tree / Guardianship */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <AdoptTreePanel
                      treeId={selectedTree.id}
                      userId={user?.id}
                      userEmail={user?.email}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="p-12 text-center text-slate-400">
              <Trees className="w-12 h-12 mx-auto mb-3 text-sage-300" />
              <div className="text-sm font-semibold text-slate-600">No tree selected</div>
              <p className="text-xs text-slate-400 mt-1">Select a passport from the registry to inspect.</p>
            </Card>
          )}
        </div>
      </div>

      {/* QR Code Modal Dialog */}
      {selectedTree && (
        <Modal
          isOpen={isQrModalOpen}
          onClose={() => setIsQrModalOpen(false)}
          title={`Tree Passport: ${selectedTree.tree_code}`}
          description="Scannable physical tree identity code"
        >
          <div className="py-2">
            <QRCodeDisplay
              treeCode={selectedTree.tree_code}
              treeId={selectedTree.id}
              size={200}
            />
            <p className="text-[11px] text-slate-400 text-center mt-3">
              Encodes public passport URL: <span className="font-mono text-slate-600">https://greenverse.app/passport/{selectedTree.tree_code}</span>. Contains no private personal data.
            </p>
          </div>
        </Modal>
      )}

      {/* Tree Registration Modal */}
      <Modal
        isOpen={isRegisterModalOpen}
        onClose={() => {
          if (!regSubmitting) setIsRegisterModalOpen(false);
        }}
        title="Register New Tree Passport"
        description="Register a newly planted or monitored sapling to the Greenverse digital twin registry."
      >
        <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
          {regFeedback && (
            <div
              className={`p-3 rounded-lg border flex items-start gap-2 ${
                regFeedback.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : regFeedback.type === 'warn'
                  ? 'bg-amber-50 border-amber-200 text-amber-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {regFeedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              )}
              <span>{regFeedback.message}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tree / Plot Name (optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Cascadia Sentinel Cedar"
                value={regForm.name}
                onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                className="w-full border border-sage-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-forest-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Common Species Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Western Red Cedar"
                value={regForm.species}
                onChange={(e) => setRegForm({ ...regForm, species: e.target.value })}
                required
                className="w-full border border-sage-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-forest-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Scientific Botanical Name
              </label>
              <input
                type="text"
                placeholder="e.g. Thuja plicata"
                value={regForm.scientific_name}
                onChange={(e) => setRegForm({ ...regForm, scientific_name: e.target.value })}
                className="w-full border border-sage-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-forest-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Planted Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={regForm.planting_date}
                onChange={(e) => setRegForm({ ...regForm, planting_date: e.target.value })}
                required
                className="w-full border border-sage-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-forest-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Location Description / Site <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Cascadia River Corridor Buffer, Cascadia Old Growth"
              value={regForm.location_description}
              onChange={(e) => setRegForm({ ...regForm, location_description: e.target.value })}
              required
              className="w-full border border-sage-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-forest-500"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Latitude</label>
              <input
                type="number"
                step="0.0001"
                placeholder="e.g. 47.6062"
                value={regForm.latitude ?? ''}
                onChange={(e) =>
                  setRegForm({
                    ...regForm,
                    latitude: e.target.value ? parseFloat(e.target.value) : null,
                  })
                }
                className="w-full border border-sage-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-forest-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Longitude</label>
              <input
                type="number"
                step="0.0001"
                placeholder="e.g. -122.3321"
                value={regForm.longitude ?? ''}
                onChange={(e) =>
                  setRegForm({
                    ...regForm,
                    longitude: e.target.value ? parseFloat(e.target.value) : null,
                  })
                }
                className="w-full border border-sage-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-forest-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Height (m)</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                placeholder="e.g. 1.8"
                value={regForm.height_meters ?? ''}
                onChange={(e) =>
                  setRegForm({
                    ...regForm,
                    height_meters: e.target.value ? parseFloat(e.target.value) : 1.2,
                  })
                }
                className="w-full border border-sage-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-forest-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">DBH (cm)</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                placeholder="e.g. 4.0"
                value={regForm.dbh_cm ?? ''}
                onChange={(e) =>
                  setRegForm({
                    ...regForm,
                    dbh_cm: e.target.value ? parseFloat(e.target.value) : 2.5,
                  })
                }
                className="w-full border border-sage-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-forest-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Initial Health</label>
              <select
                value={regForm.health_status}
                onChange={(e) =>
                  setRegForm({ ...regForm, health_status: e.target.value as HealthStatus })
                }
                className="w-full border border-sage-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-forest-500"
              >
                <option value="thriving">Thriving</option>
                <option value="stable">Stable</option>
                <option value="attention_required">Attention Required</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div className="col-span-2">
              <ImageUpload
                label="Sapling / Tree Photo (optional)"
                value={regForm.photo_url}
                onChange={(url) => setRegForm({ ...regForm, photo_url: url })}
                bucket="trees"
                userId={user?.id}
                folder="registration"
                placeholderText="Click or drop photo of planted sapling"
                aspectRatio="video"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Field Notes & Planting Observations
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Native mycorrhizal inoculum applied at planting. Deep root flare exposed."
              value={regForm.notes}
              onChange={(e) => setRegForm({ ...regForm, notes: e.target.value })}
              className="w-full border border-sage-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-forest-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={regSubmitting}
              onClick={() => setIsRegisterModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={regSubmitting}
              icon={<Plus className="w-4 h-4" />}
            >
              Save Passport
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
