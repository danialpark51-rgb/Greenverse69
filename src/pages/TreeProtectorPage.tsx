import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShieldAlert, ShieldCheck, MapPin, AlertTriangle, TreeDeciduous, PlusCircle,
  Clock, CheckCircle2, Eye, ExternalLink, Loader2, Send, X, Filter, AlertCircle
} from 'lucide-react';
import { InteractiveMap, MapMarkerItem } from '../components/map/InteractiveMap';
import { ImageUpload } from '../components/common/ImageUpload';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  fetchProtectionReports,
  createProtectionReport,
  addProtectionUpdate
} from '../services/impactService';
import {
  TreeProtectionReport,
  ThreatCategory,
  ThreatSeverity,
  ThreatUrgency,
  ProtectionStatus
} from '../types/impact';

const THREAT_CATEGORIES: { key: ThreatCategory | 'all'; label: string }[] = [
  { key: 'all', label: 'All Threats' },
  { key: 'construction_threat', label: 'Construction & Excavation Threat' },
  { key: 'unauthorized_cutting', label: 'Unauthorized Cutting / Felling' },
  { key: 'root_damage', label: 'Root Trenching & Soil Damage' },
  { key: 'trunk_branch_damage', label: 'Trunk / Canopy Damage' },
  { key: 'barrier_needed', label: 'Protective Barrier Needed' },
  { key: 'disease_infestation', label: 'Disease / Fungal Infestation' },
  { key: 'heritage_nomination', label: 'Ancient Heritage Tree Nomination' },
  { key: 'expert_needed', label: 'Arborist Emergency Needed' },
];

export const TreeProtectorPage: React.FC = () => {
  const { user, profile } = useAuth();
  const currentUserId = user?.id;
  const currentUserName = profile?.full_name || user?.email?.split('@')[0] || 'Citizen Protector';

  const [reports, setReports] = useState<TreeProtectionReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeReport, setActiveReport] = useState<TreeProtectionReport | null>(null);

  // New Report Modal State
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportForm, setReportForm] = useState({
    tree_species: '',
    threat_category: 'construction_threat' as ThreatCategory,
    severity: 'high' as ThreatSeverity,
    urgency: 'routine' as ThreatUrgency,
    location_name: '',
    latitude: 45.5152,
    longitude: -122.6784,
    description: '',
    photo_url: '',
    is_heritage: false,
  });
  const [reportLoading, setReportLoading] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  // Responder Update State
  const [updateText, setUpdateText] = useState('');
  const [newStatus, setNewStatus] = useState<ProtectionStatus>('in_progress');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await fetchProtectionReports(selectedCategory);
      setReports(data);
      if (data.length > 0 && !activeReport) {
        setActiveReport(data[0]);
      }
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  };

  const loadReportsRef = useRef(loadReports);
  useEffect(() => {
    loadReportsRef.current = loadReports;
  });

  useEffect(() => {
    loadReports();

    if (!isSupabaseConfigured) return;
    const channel = supabase
      .channel('protection-reports-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tree_protection_reports' },
        () => {
          loadReportsRef.current();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tree_protection_updates' },
        () => {
          loadReportsRef.current();
        }
      )
      .subscribe((status, err) => {
        if (status === 'CHANNEL_ERROR') {
          console.warn('[TreeProtector] Realtime subscription status error:', err);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedCategory]);

  const mapMarkers: MapMarkerItem[] = reports.map(r => ({
    id: r.id,
    lat: r.latitude,
    lng: r.longitude,
    title: r.tree_species || 'Protected Canopy',
    subtitle: `${r.threat_category.replace(/_/g, ' ')} (${r.severity})`,
    variant: r.severity === 'critical' ? 'rose' : r.severity === 'high' ? 'amber' : 'emerald',
    badge: r.status.replace(/_/g, ' '),
    data: r
  }));

  const handleMarkerClick = (marker: MapMarkerItem) => {
    const r = reports.find(item => item.id === marker.id);
    if (r) setActiveReport(r);
  };

  const handleMapLocationSelect = (loc: { lat: number; lng: number; address: string }) => {
    setReportForm(prev => ({
      ...prev,
      latitude: loc.lat,
      longitude: loc.lng,
      location_name: loc.address || prev.location_name
    }));
  };

  const handleCreateReport = async () => {
    if (!reportForm.tree_species.trim()) {
      setReportError('Please specify the tree species or landmark name.');
      return;
    }
    if (!reportForm.location_name.trim()) {
      setReportError('Please provide the location or address.');
      return;
    }
    if (!reportForm.description.trim()) {
      setReportError('Please provide details regarding the threat.');
      return;
    }

    setReportLoading(true);
    setReportError(null);
    try {
      await createProtectionReport(
        {
          ...reportForm,
          photo_urls: reportForm.photo_url ? [reportForm.photo_url] : [],
        },
        currentUserId,
        currentUserName
      );
      setReportSuccess(true);
      setTimeout(() => {
        setReportSuccess(false);
        setShowReportModal(false);
        setReportForm({
          tree_species: '',
          threat_category: 'construction_threat',
          severity: 'high',
          urgency: 'routine',
          location_name: '',
          latitude: 45.5152,
          longitude: -122.6784,
          description: '',
          photo_url: '',
          is_heritage: false,
        });
        loadReports();
      }, 1500);
    } catch (err: any) {
      setReportError(err?.message || 'Failed to submit report. Please try again.');
    } finally {
      setReportLoading(false);
    }
  };

  const handleAddUpdate = async () => {
    if (!activeReport || !updateText.trim()) return;
    setUpdateLoading(true);
    setUpdateError(null);
    try {
      await addProtectionUpdate(
        activeReport.id,
        updateText,
        newStatus,
        undefined,
        currentUserName
      );
      setUpdateText('');
      loadReports();
    } catch (err: any) {
      setUpdateError(err?.message || 'Failed to submit responder update.');
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-600" />
            Tree Protector & Existing Canopy Defense Network
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Community-driven surveillance, legal heritage tree registry, and rapid defense against unauthorized felling and root damage.
          </p>
        </div>
        <button
          onClick={() => setShowReportModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-xl text-sm font-semibold hover:bg-rose-700 transition shadow-sm w-fit"
        >
          <PlusCircle className="w-4 h-4" />
          Report Tree Threat / Nominate
        </button>
      </div>

      {/* Realism Notice */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-800 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Citizen Defense Protocol:</span> Reports submitted here alert local Greenverse arbor squads and accredited responders for on-site verification. Reports do not automatically file legal injunctions or contact municipal code enforcement unless dispatched by authorized coordinators.
        </div>
      </div>

      {/* Main Map & Threat Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Map */}
        <div className="lg:col-span-2 space-y-3">
          <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-rose-500" />
                Live Tree Threat & Protection Map
              </span>
              <span className="text-xs text-slate-400">{reports.length} trees flagged</span>
            </div>

            <InteractiveMap
              height="450px"
              center={[45.5152, -122.6784]}
              zoom={12}
              markers={mapMarkers}
              onMarkerClick={handleMarkerClick}
              enableSearch={true}
              searchPlaceholder="Search address or coordinate zone..."
            />
          </div>

          {/* Filter Pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {THREAT_CATEGORIES.map(c => (
              <button
                key={c.key}
                onClick={() => setSelectedCategory(c.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === c.key
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right Col: Active Report Detail & Responder Updates */}
        <div className="space-y-4">
          {activeReport ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      activeReport.severity === 'critical'
                        ? 'bg-rose-100 text-rose-800'
                        : activeReport.severity === 'high'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {activeReport.severity} severity
                    </span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {activeReport.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">{activeReport.tree_species}</h3>
                  <p className="text-xs text-slate-500">{activeReport.location_name}</p>
                </div>
              </div>

              {activeReport.photo_urls.length > 0 && (
                <div className="h-44 rounded-2xl overflow-hidden bg-slate-100">
                  <img
                    src={activeReport.photo_urls[0]}
                    alt={activeReport.tree_species || 'Reported Tree'}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="text-xs space-y-2 text-slate-600 leading-relaxed">
                <p><strong>Threat Category:</strong> {activeReport.threat_category.replace(/_/g, ' ')}</p>
                <p><strong>Description:</strong> {activeReport.description}</p>
                {activeReport.responder_notes && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 font-mono text-[11px] whitespace-pre-wrap">
                    {activeReport.responder_notes}
                  </div>
                )}
              </div>

              {/* Responder Progress Action */}
              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                <span className="font-bold text-slate-800 block">Log Responder Action / Update Status</span>
                {updateError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{updateError}</span>
                  </div>
                )}
                <textarea
                  rows={2}
                  value={updateText}
                  onChange={e => setUpdateText(e.target.value)}
                  placeholder="e.g. Dispatched squad with protective barrier lumber..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg resize-none"
                />
                <div className="flex items-center justify-between gap-2">
                  <select
                    value={newStatus}
                    onChange={e => setNewStatus(e.target.value as ProtectionStatus)}
                    className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-700"
                  >
                    <option value="under_review">Under Review</option>
                    <option value="action_needed">Action Needed</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved / Protected</option>
                    <option value="closed">Closed</option>
                  </select>
                  <button
                    onClick={handleAddUpdate}
                    disabled={updateLoading || !updateText.trim()}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 disabled:opacity-50"
                  >
                    {updateLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                    Log Update
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 bg-white border border-slate-200 rounded-3xl text-center text-slate-400">
              <TreeDeciduous className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold">Select a tree marker on the map</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Protection Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-slate-900 text-base">Report Tree Threat or Landmark Nomination</h3>
            {reportError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{reportError}</span>
              </div>
            )}
            {reportSuccess ? (
              <div className="text-center py-6">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
                <p className="font-bold text-slate-800">Threat Report Logged!</p>
                <p className="text-xs text-slate-500 mt-1">Local canopy squads have been notified on the map.</p>
              </div>
            ) : (
              <>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Tree Species or Identification *</label>
                    <input
                      type="text"
                      placeholder="e.g. Mature Oregon White Oak or Douglas Fir"
                      value={reportForm.tree_species}
                      onChange={e => setReportForm(p => ({ ...p, tree_species: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">Threat Category</label>
                      <select
                        value={reportForm.threat_category}
                        onChange={e => setReportForm(p => ({ ...p, threat_category: e.target.value as ThreatCategory }))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                      >
                        {THREAT_CATEGORIES.filter(c => c.key !== 'all').map(c => (
                          <option key={c.key} value={c.key}>{c.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">Severity Level</label>
                      <select
                        value={reportForm.severity}
                        onChange={e => setReportForm(p => ({ ...p, severity: e.target.value as ThreatSeverity }))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                      >
                        <option value="low">Low (Monitoring)</option>
                        <option value="medium">Medium</option>
                        <option value="high">High Threat</option>
                        <option value="critical">Critical / Imminent Destruction</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Location / Landmark Description *</label>
                    <input
                      type="text"
                      placeholder="e.g. Oak Creek Corridor, Corner of Lot 14"
                      value={reportForm.location_name}
                      onChange={e => setReportForm(p => ({ ...p, location_name: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">Latitude</label>
                      <input
                        type="number"
                        step="any"
                        value={reportForm.latitude}
                        onChange={e => setReportForm(p => ({ ...p, latitude: Number(e.target.value) }))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">Longitude</label>
                      <input
                        type="number"
                        step="any"
                        value={reportForm.longitude}
                        onChange={e => setReportForm(p => ({ ...p, longitude: Number(e.target.value) }))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <ImageUpload
                      label="Threat Photo Evidence"
                      value={reportForm.photo_url}
                      onChange={url => setReportForm(p => ({ ...p, photo_url: url }))}
                      bucket="evidence"
                      userId={currentUserId}
                      folder="threats"
                      placeholderText="Click or drop canopy damage / threat photo"
                      aspectRatio="video"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Threat Details & Notes *</label>
                    <textarea
                      rows={3}
                      value={reportForm.description}
                      onChange={e => setReportForm(p => ({ ...p, description: e.target.value }))}
                      placeholder="Detail visible root cuts, excavator activity, pruning damage, or heritage landmark details..."
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg resize-none"
                    />
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={reportForm.is_heritage}
                      onChange={e => setReportForm(p => ({ ...p, is_heritage: e.target.checked }))}
                      className="rounded text-rose-600 focus:ring-rose-500"
                    />
                    <span className="text-slate-800 font-medium">Nominate as Ancient / Heritage Landmark Tree</span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button onClick={() => setShowReportModal(false)} className="px-3 py-1.5 text-xs text-slate-600">Cancel</button>
                  <button
                    onClick={handleCreateReport}
                    disabled={reportLoading || !reportForm.tree_species || !reportForm.description}
                    className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold hover:bg-rose-700 disabled:opacity-50"
                  >
                    {reportLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Submit Protection Report
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default TreeProtectorPage;
