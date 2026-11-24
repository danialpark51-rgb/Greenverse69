import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import {
  Droplets,
  Thermometer,
  HeartPulse,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock,
  Sparkles,
  Wifi,
  Waves
} from 'lucide-react';

export const TreeCarePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'sensors' | 'tasks'>('schedule');
  const [taskDone, setTaskDone] = useState<Record<number, boolean>>({});

  const toggleTask = (id: number) => {
    setTaskDone((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const survivalAlerts = [
    {
      id: 1,
      plot: 'Cascadia Sector 4 (Western Red Cedar)',
      issue: 'Volumetric Soil Moisture dropped to 38% (Threshold: 45%)',
      urgency: 'high',
      action: 'Trickle irrigation cycle recommended within 24 hours',
    },
    {
      id: 2,
      plot: 'Mississippi Upper Plot (Bur Oak)',
      issue: 'Root flair covered with excess silt post-rainstorm',
      urgency: 'medium',
      action: 'Clear root collar to prevent fungal collar rot',
    },
  ];

  const careTasks = [
    { id: 1, title: 'Apply organic cedar woodchip mulch (3-inch collar)', plot: 'Skykomish Sector 2', due: 'Today' },
    { id: 2, title: 'Inspect LoRaWAN moisture probe batteries', plot: 'Pelican Shoals Estuary', due: 'Tomorrow' },
    { id: 3, title: 'Apply symbiotic mycorrhizal biostimulant soak', plot: 'Cedar Bend District', due: 'Dec 02, 2026' },
    { id: 4, title: 'Prune dead lower suckers to direct sap flow to leader', plot: 'Pine Barrens Sanctuary', due: 'Dec 05, 2026' },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Droplets className="w-6 h-6 text-forest-700" />
            Tree Care & Survival Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time IoT root hydration sensors, predictive drought warnings, and seasonal maintenance protocols.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="emerald" dot>Survival Index: 94.2%</Badge>
          <Badge variant="lime">IoT Connected</Badge>
        </div>
      </div>

      {/* Real-time Survival KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-sage-200 shadow-soft">
          <div className="text-[11px] font-semibold uppercase text-slate-500 flex items-center gap-1.5">
            <HeartPulse className="w-4 h-4 text-emerald-600" />
            Average Survival Rate
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">94.2%</div>
          <div className="text-[10px] text-emerald-600 font-medium mt-1">↑ +2.1% higher than regional baseline</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-sage-200 shadow-soft">
          <div className="text-[11px] font-semibold uppercase text-slate-500 flex items-center gap-1.5">
            <Droplets className="w-4 h-4 text-blue-500" />
            Root Zone Hydration
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">68%</div>
          <div className="text-[10px] text-slate-500 mt-1">Optimal moisture zone (50-80%)</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-sage-200 shadow-soft">
          <div className="text-[11px] font-semibold uppercase text-slate-500 flex items-center gap-1.5">
            <Thermometer className="w-4 h-4 text-amber-500" />
            Canopy Temperature
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">16.4°C</div>
          <div className="text-[10px] text-slate-500 mt-1">Normal transpiration cooling</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-sage-200 shadow-soft">
          <div className="text-[11px] font-semibold uppercase text-slate-500 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            Active Care Alerts
          </div>
          <div className="text-2xl font-bold text-rose-600 mt-1">2 Plots</div>
          <div className="text-[10px] text-rose-500 mt-1">Attention requested within 48h</div>
        </div>
      </div>

      {/* Main Care Modules Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Moisture & Survival Alerts */}
        <div className="lg:col-span-2 space-y-5">
          {/* Urgent Survival Alerts */}
          <Card className="border-rose-200 bg-rose-50/20">
            <CardHeader className="bg-rose-50/50">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <CardTitle className="text-rose-950">Mortality Risk Early Warnings</CardTitle>
              </div>
              <Badge variant="rose" size="sm">2 Needs Action</Badge>
            </CardHeader>
            <CardContent className="divide-y divide-rose-100 p-0">
              {survivalAlerts.map((alt) => (
                <div key={alt.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-slate-900">{alt.plot}</div>
                    <div className="text-xs text-rose-800 font-medium">{alt.issue}</div>
                    <div className="text-[11px] text-slate-600">{alt.action}</div>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    className="shrink-0 text-xs"
                    onClick={() => alert(`Dispatching care instructions to squad for ${alt.plot}`)}
                  >
                    Dispatch Care Order
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Maintenance Protocols & IoT Telemetry Chart */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>48-Hour Soil Moisture Forecast vs Actuals</CardTitle>
                <CardDescription>Continuous telemetry from LoRaWAN probe arrays</CardDescription>
              </div>
              <Badge variant="forest" size="sm">Active Stream</Badge>
            </CardHeader>
            <CardContent>
              {/* Simulated Moisture Wave Chart */}
              <div className="h-44 bg-slate-50 rounded-xl border border-slate-200 p-4 flex flex-col justify-between">
                <div className="flex justify-between text-xs text-slate-500 font-mono">
                  <span>Target Zone: 60 - 80% Moisture</span>
                  <span className="text-forest-700 font-bold">Current: 68%</span>
                </div>

                <div className="flex items-end justify-between h-24 gap-2 pt-2">
                  {[55, 62, 70, 68, 64, 59, 68, 72, 74, 69, 66, 68].map((val, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                      <div
                        className="w-full bg-forest-600 rounded-t group-hover:bg-lime-500 transition-all"
                        style={{ height: `${val}%` }}
                      />
                      <span className="text-[9px] text-slate-400">{idx * 4}h</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Care Action Checklist */}
        <Card className="space-y-2">
          <CardHeader>
            <div>
              <CardTitle>Stewardship Task Checklist</CardTitle>
              <CardDescription>Seasonal vitalization schedule</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 p-4">
            {careTasks.map((t) => {
              const isChecked = !!taskDone[t.id];
              return (
                <div
                  key={t.id}
                  onClick={() => toggleTask(t.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-3 ${
                    isChecked
                      ? 'bg-forest-50/50 border-forest-200 opacity-60'
                      : 'bg-white border-sage-200 hover:border-forest-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    className="mt-0.5 rounded text-forest-700 focus:ring-forest-500"
                  />
                  <div className="flex-1">
                    <div className={`text-xs font-semibold ${isChecked ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                      {t.title}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                      <span>{t.plot}</span>
                      <span className="font-medium text-forest-700">{t.due}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs mt-3"
              onClick={() => alert('New maintenance task added to field log.')}
            >
              + Add Custom Care Task
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
