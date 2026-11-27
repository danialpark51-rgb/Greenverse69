import React, { useState } from 'react';
import {
  Menu,
  Sparkles,
  Plus,
  TreeDeciduous,
  Sprout,
  AlertOctagon,
  Search,
  ExternalLink,
  Satellite,
  User,
  ShieldCheck,
  ChevronDown,
  LogIn,
  LogOut,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { SearchInput } from '../common/SearchInput';
import { NotificationDropdown } from '../common/NotificationDropdown';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { registerTree } from '../../services/treeService';
import { createProtectionReport } from '../../services/impactService';
import { ThreatCategory } from '../../types/impact';

interface HeaderProps {
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const [searchValue, setSearchValue] = useState('');
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isPlantModalOpen, setIsPlantModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [treeFormSpecies, setTreeFormSpecies] = useState('Bur Oak');
  const [treeFormLocation, setTreeFormLocation] = useState('Upper Mississippi Sector 3');
  const [plantLoading, setPlantLoading] = useState(false);
  const [plantSuccess, setPlantSuccess] = useState(false);
  const [plantError, setPlantError] = useState<string | null>(null);
  const [createdPassportCode, setCreatedPassportCode] = useState<string | null>(null);

  const [reportLoading, setReportLoading] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [threatNature, setThreatNature] = useState<ThreatCategory>('unauthorized_cutting');
  const [threatLocation, setThreatLocation] = useState('');
  const [threatDescription, setThreatDescription] = useState('');

  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  const userDisplayName = profile?.full_name || user?.user_metadata?.full_name || (user?.email ? user.email.split('@')[0] : 'Elena R.');

  const handlePlantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlantLoading(true);
    setPlantError(null);
    try {
      const res = await registerTree(
        {
          species: treeFormSpecies,
          location_description: treeFormLocation,
          latitude: 44.9778,
          longitude: -93.265,
          planting_date: new Date().toISOString().split('T')[0],
          health_status: 'thriving',
        },
        user?.id
      );
      if (res.error) {
        setPlantError(res.error.message);
      } else {
        setCreatedPassportCode(res.data?.tree_code || 'GV-TR-LIVE');
        setPlantSuccess(true);
        setTimeout(() => {
          setPlantSuccess(false);
          setIsPlantModalOpen(false);
          navigate('/passport');
        }, 1600);
      }
    } catch (err: any) {
      setPlantError(err?.message || 'Failed to mint digital passport.');
    } finally {
      setPlantLoading(false);
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!threatLocation.trim()) {
      setReportError('Please provide location details.');
      return;
    }
    setReportLoading(true);
    setReportError(null);
    try {
      await createProtectionReport(
        {
          threat_category: threatNature,
          location_name: threatLocation,
          description: threatDescription || 'Urgent canopy alert submitted via Quick Action',
          tree_species: 'Protected Urban Canopy',
          severity: 'high',
          urgency: 'urgent',
        },
        user?.id,
        userDisplayName
      );
      setReportSuccess(true);
      setTimeout(() => {
        setReportSuccess(false);
        setIsReportModalOpen(false);
        navigate('/protector');
      }, 1600);
    } catch (err: any) {
      setReportError(err?.message || 'Failed to dispatch patrol alert.');
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <>
      <header className="h-16 bg-white/90 backdrop-blur-md border-b border-sage-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 shadow-soft-sm">
        {/* Left: Mobile hamburger & breadcrumbs / search */}
        <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-xl">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-sage-100"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Global Search Bar */}
          <div className="w-full">
            <SearchInput
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onClear={() => setSearchValue('')}
              placeholder="Search trees, digital passports, restoration sites, squads..."
            />
          </div>
        </div>

        {/* Right Action Cluster */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-3">
          {/* Planetary MRV Status Indicator */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-forest-50 border border-forest-200 text-xs font-medium text-forest-800">
            <Satellite className="w-3.5 h-3.5 text-forest-600 animate-pulse" />
            <span className="hidden xl:inline">Planetary MRV:</span>
            <span className="font-semibold text-emerald-700">Sentinel-2 Live</span>
          </div>

          {/* Quick Action Button */}
          <div className="relative">
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setIsQuickActionOpen(!isQuickActionOpen)}
              className="gap-1.5 shadow-sm"
            >
              <span className="hidden sm:inline">Action</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-80" />
            </Button>

            {/* Quick Action Dropdown */}
            {isQuickActionOpen && (
              <div
                className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-soft-lg border border-sage-200 py-1.5 z-40 animate-in fade-in slide-in-from-top-2 duration-150"
                onClick={() => setIsQuickActionOpen(false)}
              >
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Direct Field Actions
                </div>
                <button
                  onClick={() => setIsPlantModalOpen(true)}
                  className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-forest-50 hover:text-forest-900 flex items-center gap-2.5 transition-colors"
                >
                  <TreeDeciduous className="w-4 h-4 text-forest-600" />
                  <div>
                    <div className="font-medium">Plant & Register Tree</div>
                    <div className="text-[10px] text-slate-400">Mint digital passport twin</div>
                  </div>
                </button>
                <button
                  onClick={() => navigate('/designer')}
                  className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-forest-50 hover:text-forest-900 flex items-center gap-2.5 transition-colors"
                >
                  <Sprout className="w-4 h-4 text-forest-600" />
                  <div>
                    <div className="font-medium">Design New Plantation</div>
                    <div className="text-[10px] text-slate-400">Miyawaki or agro-corridor</div>
                  </div>
                </button>
                <button
                  onClick={() => setIsReportModalOpen(true)}
                  className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-rose-50 hover:text-rose-900 flex items-center gap-2.5 transition-colors"
                >
                  <AlertOctagon className="w-4 h-4 text-rose-500" />
                  <div>
                    <div className="font-medium">Report Tree Threat</div>
                    <div className="text-[10px] text-slate-400">Illegal felling or disease outbreak</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Notifications */}
          <NotificationDropdown />

          {/* Profile Quick Pill / Sign In Button */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-full border border-sage-200 hover:bg-sage-100 transition-colors focus:outline-none"
              >
                <div className="w-6 h-6 rounded-full bg-forest-700 text-white font-bold text-xs flex items-center justify-center ring-1 ring-forest-600/30">
                  {userDisplayName.charAt(0).toUpperCase()}
                </div>
                <span className="hidden md:inline text-xs font-semibold text-slate-700 max-w-[120px] truncate">
                  {userDisplayName}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isProfileMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-soft-lg border border-sage-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onClick={() => setIsProfileMenuOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-100">
                    <div className="text-xs font-semibold text-slate-900 truncate">{userDisplayName}</div>
                    <div className="text-[10px] text-slate-500 truncate">{user.email}</div>
                  </div>
                  <button
                    onClick={() => navigate('/settings')}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-forest-50 hover:text-forest-900 flex items-center gap-2 transition-colors"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>Profile & Settings</span>
                  </button>
                  <button
                    onClick={async () => {
                      await signOut();
                      navigate('/login');
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors border-t border-slate-100"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                icon={<LogIn className="w-3.5 h-3.5" />}
                onClick={() => navigate('/login')}
                className="text-xs font-medium"
              >
                Sign In
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Quick Action Modal: Plant & Register Tree */}
      <Modal
        isOpen={isPlantModalOpen}
        onClose={() => setIsPlantModalOpen(false)}
        title="Plant & Register Digital Tree Twin"
        description="Assign a tamper-proof digital passport with GPS coordinates and species traits."
      >
        {plantSuccess ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="text-base font-semibold text-slate-900">Tree Twin Successfully Minted!</h4>
            <p className="text-xs text-slate-600">Passport #{createdPassportCode || 'GV-TR-LIVE'} registered. Redirecting to Tree Passport...</p>
          </div>
        ) : (
          <form onSubmit={handlePlantSubmit} className="space-y-4 text-xs">
            {plantError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{plantError}</span>
              </div>
            )}
            <div>
              <label className="block font-medium text-slate-700 mb-1">Tree Species</label>
              <select
                value={treeFormSpecies}
                onChange={(e) => setTreeFormSpecies(e.target.value)}
                className="w-full px-3 py-2 border border-sage-300 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-forest-600"
              >
                <option value="Bur Oak">Bur Oak (Quercus macrocarpa)</option>
                <option value="Western Red Cedar">Western Red Cedar (Thuja plicata)</option>
                <option value="Red Mangrove">Red Mangrove (Rhizophora mangle)</option>
                <option value="Longleaf Pine">Longleaf Pine (Pinus palustris)</option>
                <option value="American Chestnut Hybrid">American Chestnut Hybrid (Castanea dentata)</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Planting Site & Coordinates</label>
              <input
                type="text"
                value={treeFormLocation}
                onChange={(e) => setTreeFormLocation(e.target.value)}
                className="w-full px-3 py-2 border border-sage-300 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-forest-600"
                placeholder="Site name or GPS lat/lng"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Height (Meters)</label>
                <input
                  type="number"
                  step="0.1"
                  defaultValue="1.5"
                  className="w-full px-3 py-2 border border-sage-300 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Stem DBH (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  defaultValue="3.2"
                  className="w-full px-3 py-2 border border-sage-300 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>
            </div>

            <div className="p-3 bg-forest-50 border border-forest-100 rounded-lg flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-forest-700 shrink-0 mt-0.5" />
              <div className="text-[11px] text-forest-800">
                <span className="font-semibold">Automated Verification:</span> A satellite verification task will run during the next Sentinel-2 pass to confirm canopy vigor.
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsPlantModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" disabled={plantLoading}>
                {plantLoading && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />}
                Mint Digital Passport
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Quick Action Modal: Report Tree Threat */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title="Report Urgent Canopy Threat"
        description="Notify the local squad patrol and municipal authorities regarding illegal cutting or disease."
      >
        {reportSuccess ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <h4 className="text-base font-semibold text-slate-900">Canopy Threat Logged</h4>
            <p className="text-xs text-slate-600">Dispatch alert broadcasted to Cascadia Patrol Squad. Redirecting to Tree Protector...</p>
          </div>
        ) : (
          <form onSubmit={handleReportSubmit} className="space-y-4 text-xs">
            {reportError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{reportError}</span>
              </div>
            )}
            <div>
              <label className="block font-medium text-slate-700 mb-1">Threat Nature</label>
              <select
                value={threatNature}
                onChange={(e) => setThreatNature(e.target.value as ThreatCategory)}
                className="w-full px-3 py-2 border border-sage-300 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="unauthorized_cutting">Unauthorized Cutting / Bulldozer Encroachment</option>
                <option value="disease_infestation">Aggressive Foliage Blight / Pest Outbreak</option>
                <option value="root_damage">Severe Root Compaction from Heavy Machinery</option>
                <option value="barrier_needed">Protective Barrier Needed / Construction Hazard</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Location Details *</label>
              <input
                type="text"
                value={threatLocation}
                onChange={(e) => setThreatLocation(e.target.value)}
                placeholder="e.g. St. Anthony Falls Heritage Oak Grove, West Path"
                required
                className="w-full px-3 py-2 border border-sage-300 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Description & Evidence</label>
              <textarea
                rows={3}
                value={threatDescription}
                onChange={(e) => setThreatDescription(e.target.value)}
                placeholder="Describe machinery observed, markings on bark, or symptoms..."
                className="w-full px-3 py-2 border border-sage-300 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsReportModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="danger" size="sm" disabled={reportLoading}>
                {reportLoading && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />}
                Broadcast Patrol Alert
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
};
