import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import {
  Settings,
  User,
  Bell,
  Shield,
  Key,
  Database,
  CheckCircle2,
  Save
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, profile, updateProfile } = useAuth();

  const [name, setName] = useState(profile?.full_name || user?.user_metadata?.full_name || 'Elena Rostova');
  const [email, setEmail] = useState(user?.email || 'elena.rostova@canopyguard.org');
  const [organization, setOrganization] = useState(profile?.organization || 'Pacific Canopy Alliance');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.email) setEmail(user.email);
      const currentName = profile?.full_name || user.user_metadata?.full_name;
      if (currentName) setName(currentName);
      if (profile?.organization) setOrganization(profile.organization);
    }
  }, [user, profile]);

  // Preference switches
  const [telemetryAlerts, setTelemetryAlerts] = useState(true);
  const [satellitePassNotice, setSatellitePassNotice] = useState(true);
  const [squadDispatch, setSquadDispatch] = useState(true);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      await updateProfile({
        full_name: name,
        organization,
      });
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-forest-700" />
            Profile & Environmental Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your arborist credentials, telemetry notification thresholds, and API access keys.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Arborist Profile & Credentials</CardTitle>
              <CardDescription>Your identity displayed on digital tree passports and audits</CardDescription>
            </div>
            <Badge variant="emerald">Level 8 Forester</Badge>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="flex items-center gap-4">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover ring-2 ring-forest-600"
              />
              <div>
                <Button type="button" variant="outline" size="sm">
                  Change Photo
                </Button>
                <div className="text-[10px] text-slate-400 mt-1">JPG or PNG under 2MB</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-sage-300 rounded-lg bg-white text-slate-800"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-sage-300 rounded-lg bg-white text-slate-800"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-medium text-slate-700 mb-1">Affiliated Organization</label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full px-3 py-2 border border-sage-300 rounded-lg bg-white text-slate-800"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Telemetry & Alert Thresholds */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Telemetry Alerts & Notifications</CardTitle>
              <CardDescription>Control when you receive critical root moisture warnings</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100">
              <div>
                <div className="font-semibold text-slate-800">Critical Soil Moisture Drops (&lt;45%)</div>
                <div className="text-slate-500 text-[11px]">Send immediate SMS and push notifications to squads</div>
              </div>
              <input
                type="checkbox"
                checked={telemetryAlerts}
                onChange={() => setTelemetryAlerts(!telemetryAlerts)}
                className="w-4 h-4 text-forest-700 rounded"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100">
              <div>
                <div className="font-semibold text-slate-800">Sentinel-2 Multispectral Pass Reminders</div>
                <div className="text-slate-500 text-[11px]">Alert 4 hours prior to orbital verification passes</div>
              </div>
              <input
                type="checkbox"
                checked={satellitePassNotice}
                onChange={() => setSatellitePassNotice(!satellitePassNotice)}
                className="w-4 h-4 text-forest-700 rounded"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100">
              <div>
                <div className="font-semibold text-slate-800">Canopy Threat Citizen Patrol Broadcasts</div>
                <div className="text-slate-500 text-[11px]">Notify when threats are logged within 25km radius</div>
              </div>
              <input
                type="checkbox"
                checked={squadDispatch}
                onChange={() => setSquadDispatch(!squadDispatch)}
                className="w-4 h-4 text-forest-700 rounded"
              />
            </div>
          </CardContent>
        </Card>

        {/* Sensor Array API Keys */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>IoT Sensor Array & Ingestion Keys</CardTitle>
              <CardDescription>LoRaWAN gateway authentication token</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">LoRaWAN Gateway API Token</label>
              <div className="flex gap-2">
                <input
                  type="password"
                  readOnly
                  value="gv_live_sec_89df20194bc882fa1029e001"
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 font-mono text-slate-600"
                />
                <Button type="button" variant="outline" size="sm" onClick={() => alert('API key copied!')}>
                  Copy
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex items-center justify-between pt-2">
          {saved && (
            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" /> Preferences saved successfully!
            </span>
          )}
          <div className="ml-auto">
            <Button type="submit" variant="primary" size="md" icon={<Save className="w-4 h-4" />}>
              Save Settings
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
