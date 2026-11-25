import React, { useState, useEffect } from 'react';
import {
  TrendingUp, Calendar, MapPin, Eye, Info, CheckCircle2, Loader2, ArrowRight
} from 'lucide-react';
import { fetchGreenChangeRecords } from '../../services/impactService';
import { GreenChangeRecord } from '../../types/impact';

export const GreenChangeMonitor: React.FC = () => {
  const [records, setRecords] = useState<GreenChangeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeRecord, setActiveRecord] = useState<GreenChangeRecord | null>(null);
  const [sliderPos, setSliderPos] = useState<number>(50);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchGreenChangeRecords();
        setRecords(data);
        if (data.length > 0) setActiveRecord(data[0]);
      } catch {
        // handled
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mr-2" />
        <span className="text-sm text-slate-600">Loading temporal change monitoring records...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          Green Change Monitor & Temporal Visualizer
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Empirical before-and-after photographic comparisons and verified canopy recovery timelines.
        </p>
      </div>

      {/* Source Integrity Notice */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-600 flex items-start gap-3">
        <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-800">Ground-Truth Data Transparency:</span> Comparisons are compiled from registered community planting records and ground photogrammetry passes. No synthetic or simulated satellite passes are used without live sensor configuration.
        </div>
      </div>

      {/* Selected Site Before/After Slider */}
      {activeRecord && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {activeRecord.data_source.replace(/_/g, ' ')}
              </span>
              <h3 className="font-bold text-slate-900 text-lg mt-1">{activeRecord.site_name}</h3>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {activeRecord.location_name}
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-emerald-700">+{activeRecord.vegetation_increase_pct}%</span>
              <span className="text-[10px] text-slate-400 block font-medium uppercase">Canopy Growth</span>
            </div>
          </div>

          {/* Interactive Split Viewer */}
          <div className="relative h-80 sm:h-96 rounded-2xl overflow-hidden select-none bg-slate-900">
            {/* Background: Latest (After) Image */}
            <img
              src={activeRecord.latest_photo_url}
              alt="After Restoration"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full">
              Latest: {new Date(activeRecord.latest_date).toLocaleDateString()} ({activeRecord.latest_canopy_pct}% Canopy)
            </div>

            {/* Foreground: Baseline (Before) Image clipped by slider */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${sliderPos}%` }}
            >
              <img
                src={activeRecord.baseline_photo_url}
                alt="Before Restoration"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ width: '100%', maxWidth: 'none' }}
              />
              <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full">
                Baseline: {new Date(activeRecord.baseline_date).toLocaleDateString()} ({activeRecord.baseline_canopy_pct}% Canopy)
              </div>
            </div>

            {/* Vertical Divider Line */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl pointer-events-none"
              style={{ left: `${sliderPos}%` }}
            />

            {/* Slider Control */}
            <input
              type="range"
              min={0}
              max={100}
              value={sliderPos}
              onChange={e => setSliderPos(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>← Drag across photo to compare baseline vs. restored state →</span>
            <span>{activeRecord.trees_planted_count} native trees established</span>
          </div>

          <p className="text-xs text-slate-600 bg-slate-50 p-4 rounded-xl leading-relaxed">
            <strong>Ecological Observation Notes:</strong> {activeRecord.notes}
          </p>
        </div>
      )}

      {/* Change Records List */}
      <div className="space-y-3">
        <h3 className="font-bold text-slate-900 text-sm">Monitored Restoration Sites ({records.length})</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {records.map(r => (
            <div
              key={r.id}
              onClick={() => setActiveRecord(r)}
              className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                activeRecord?.id === r.id
                  ? 'bg-emerald-50/60 border-emerald-500 shadow-sm'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div>
                <h4 className="font-bold text-slate-900 text-xs">{r.site_name}</h4>
                <p className="text-[11px] text-slate-500">{r.location_name}</p>
                <span className="text-[10px] text-emerald-700 font-bold mt-1 inline-block">
                  {r.baseline_date} → {r.latest_date}
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
