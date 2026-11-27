import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { uploadAvatar } from '../services/storageService';
import {
  Settings,
  User,
  Bell,
  Shield,
  Key,
  Database,
  CheckCircle2,
  AlertCircle,
  Save,
  Loader2
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, profile, updateProfile } = useAuth();

  const [name, setName] = useState(
    profile?.full_name || user?.user_metadata?.full_name || (user?.email ? user.email.split('@')[0] : '')
  );
  const [email, setEmail] = useState(user?.email || '');
  const [organization, setOrganization] = useState(profile?.organization || '');
  const [avatarUrl, setAvatarUrl] = useState(
    profile?.avatar_url || (user?.id ? `https://api.dicebear.com/7.x/bottts/svg?seed=${user.id}` : '')
  );
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.email) setEmail(user.email);
      const currentName = profile?.full_name || user.user_metadata?.full_name;
      if (currentName) setName(currentName);
      if (profile?.organization !== undefined && profile?.organization !== null) {
        setOrganization(profile.organization);
      }
      if (profile?.avatar_url) {
        setAvatarUrl(profile.avatar_url);
      }
    }
  }, [user, profile]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    setAvatarUploading(true);
    setAvatarError(null);
    try {
      const newUrl = await uploadAvatar(file, user.id);
      setAvatarUrl(newUrl);
      await updateProfile({ avatar_url: newUrl });
    } catch (err: any) {
      setAvatarError(err.message || 'Failed to upload profile photo.');
    } finally {
      setAvatarUploading(false);
    }
  };

  // Preference switches
  const [telemetryAlerts, setTelemetryAlerts] = useState(true);
  const [satellitePassNotice, setSatellitePassNotice] = useState(true);
  const [squadDispatch, setSquadDispatch] = useState(true);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setSaveError(null);
    const { error } = await updateProfile({
      full_name: name.trim(),
      organization: organization.trim(),
      avatar_url: avatarUrl.trim() || undefined,
    });
    setSaving(false);
    if (error) {
      setSaveError(error.message || 'Failed to persist profile update to database.');
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
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
            <Badge variant="emerald">{(profile as any)?.role || 'Citizen Forester'}</Badge>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-full overflow-hidden ring-2 ring-forest-600 bg-slate-100 flex items-center justify-center shrink-0">
                {avatarUploading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-forest-700" />
                ) : (
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        user?.id
                          ? `https://api.dicebear.com/7.x/bottts/svg?seed=${user.id}`
                          : 'https://api.dicebear.com/7.x/bottts/svg?seed=default';
                    }}
                  />
                )}
              </div>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={avatarUploading || !user}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {avatarUploading ? 'Uploading...' : 'Change Photo'}
                </Button>
                <div className="text-[10px] text-slate-400 mt-1">JPG, PNG, or WEBP under 2MB</div>
                {avatarError && <div className="text-[10px] text-rose-600 mt-0.5">{avatarError}</div>}
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
                  disabled
                  readOnly
                  className="w-full px-3 py-2 border border-sage-200 rounded-lg bg-slate-100 text-slate-500 cursor-not-allowed"
                />
                <p className="text-[10px] text-slate-400 mt-1">Managed securely via Supabase Auth</p>
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          {saved && (
            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" /> Profile & preferences saved successfully!
            </span>
          )}
          {saveError && (
            <span className="text-xs text-rose-700 font-semibold flex items-center gap-1.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4" /> {saveError}
            </span>
          )}
          <div className="ml-auto">
            <Button type="submit" variant="primary" size="md" disabled={saving} icon={<Save className="w-4 h-4" />}>
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
