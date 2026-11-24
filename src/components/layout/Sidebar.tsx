import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  MapPin,
  Sparkles,
  Grid3X3,
  QrCode,
  Droplets,
  Stethoscope,
  ShieldAlert,
  Users,
  Briefcase,
  Sprout,
  ShoppingBag,
  CheckCircle2,
  Wallet,
  Settings,
  ChevronLeft,
  ChevronRight,
  Leaf,
  ShieldCheck,
  TrendingUp,
  LogIn,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeVariant?: 'forest' | 'lime' | 'emerald' | 'amber';
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onMobileClose,
}) => {
  const location = useLocation();
  const { user, profile } = useAuth();
  const userName = profile?.full_name || user?.user_metadata?.full_name || (user?.email ? user.email.split('@')[0] : null);

  const navigationGroups: NavGroup[] = [
    {
      label: 'OVERVIEW',
      items: [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Green Map', path: '/map', icon: MapPin, badge: 'Live', badgeVariant: 'emerald' },
      ],
    },
    {
      label: 'PLANTING & DESIGN INTELLIGENCE',
      items: [
        { name: 'Planting Intelligence', path: '/intelligence', icon: Sparkles, badge: 'AI', badgeVariant: 'lime' },
        { name: 'Plantation Designer', path: '/designer', icon: Grid3X3 },
      ],
    },
    {
      label: 'TREE LIFECYCLE & CARE',
      items: [
        { name: 'Tree Passport', path: '/passport', icon: QrCode, badge: 'NFC', badgeVariant: 'forest' },
        { name: 'Care & Survival', path: '/care', icon: Droplets },
        { name: 'Tree Doctor', path: '/doctor', icon: Stethoscope, badge: 'Vision', badgeVariant: 'lime' },
        { name: 'Tree Protector', path: '/protector', icon: ShieldAlert },
      ],
    },
    {
      label: 'COMMUNITY & ACTION',
      items: [
        { name: 'Communities & Squads', path: '/communities', icon: Users },
        { name: 'Green Opportunities', path: '/opportunities', icon: Briefcase, badge: 'New', badgeVariant: 'emerald' },
        { name: 'Projects & Funding', path: '/projects', icon: Sprout },
      ],
    },
    {
      label: 'ECONOMY & VERIFICATION',
      items: [
        { name: 'Green Marketplace', path: '/marketplace', icon: ShoppingBag },
        { name: 'Impact & Verification', path: '/impact', icon: CheckCircle2, badge: 'MRV', badgeVariant: 'forest' },
        { name: 'Rewards & Wallet', path: '/wallet', icon: Wallet, badge: '$VERD', badgeVariant: 'lime' },
      ],
    },
    {
      label: 'PREFERENCES',
      items: [
        { name: 'Profile & Settings', path: '/settings', icon: Settings },
      ],
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-forest-deep text-white border-r border-forest-moss/40 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-forest-moss/50 shrink-0">
        <NavLink
          to="/"
          onClick={onMobileClose}
          className="flex items-center gap-3 group focus:outline-none"
        >
          <div className="w-9 h-9 rounded-xl bg-forest-600/30 border border-forest-400/40 flex items-center justify-center shadow-inner group-hover:border-lime-400 transition-colors">
            <Leaf className="w-5 h-5 text-lime-400 group-hover:scale-110 transition-transform" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-wide text-white group-hover:text-lime-300 transition-colors flex items-center gap-1.5">
                GREENVERSE
                <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-forest-600/40 text-forest-300 font-mono tracking-wider border border-forest-500/30">
                  PRO
                </span>
              </span>
              <span className="text-[10px] text-forest-300 font-medium tracking-tight">
                Planetary Tree Intelligence
              </span>
            </div>
          )}
        </NavLink>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-forest-300 hover:text-white hover:bg-forest-rich/80 transition-colors focus:outline-none"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation Links Scrollable Area */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navigationGroups.map((group) => (
          <div key={group.label} className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 text-[10px] font-bold tracking-wider text-forest-400 uppercase mb-2">
                {group.label}
              </div>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.path);

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onMobileClose}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all group relative',
                    isActive
                      ? 'bg-forest-600/40 text-white font-semibold shadow-inner border border-forest-500/30'
                      : 'text-forest-200 hover:text-white hover:bg-forest-rich/60'
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  {/* Active Indicator Bar */}
                  {isActive && (
                    <div className="absolute left-0 top-2 bottom-2 w-1 bg-lime-400 rounded-r-full shadow-glow-lime" />
                  )}

                  <Icon
                    className={cn(
                      'w-4 h-4 shrink-0 transition-transform group-hover:scale-110',
                      isActive ? 'text-lime-400' : 'text-forest-300 group-hover:text-forest-100'
                    )}
                  />

                  {!isCollapsed && (
                    <span className="flex-1 truncate tracking-tight">{item.name}</span>
                  )}

                  {!isCollapsed && item.badge && (
                    <span
                      className={cn(
                        'text-[10px] px-1.5 py-0.5 rounded-full font-mono font-medium uppercase tracking-wider shrink-0',
                        item.badgeVariant === 'lime' && 'bg-lime-400/20 text-lime-300 border border-lime-400/30',
                        item.badgeVariant === 'emerald' && 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
                        item.badgeVariant === 'forest' && 'bg-forest-400/20 text-forest-200 border border-forest-400/30',
                        item.badgeVariant === 'amber' && 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* Planetary Impact Footprint Widget */}
      {!isCollapsed && (
        <div className="p-3 m-3 rounded-xl bg-forest-rich/90 border border-forest-emerald/40 text-xs">
          <div className="flex items-center justify-between text-forest-300 mb-2">
            <span className="font-semibold text-[11px] text-white flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-lime-400" />
              Verified Biomass
            </span>
            <span className="text-[10px] text-lime-400 font-mono">91.8%</span>
          </div>
          <div className="w-full bg-forest-deep rounded-full h-1.5 overflow-hidden mb-2">
            <div
              className="bg-lime-accent h-full rounded-full transition-all duration-500"
              style={{ width: '91.8%' }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-forest-300">
            <span>381.2k / 428.9k trees</span>
            <span className="text-forest-400 font-mono">+12.4t CO2e</span>
          </div>
        </div>
      )}

      {/* User / Org Bottom Strip */}
      <div className="p-3 border-t border-forest-moss/50 shrink-0">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-forest-600 border border-lime-400/50 text-white font-bold text-xs flex items-center justify-center shrink-0">
              {(userName || 'F').charAt(0).toUpperCase()}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-white truncate">{userName}</div>
                <div className="text-[10px] text-lime-400 truncate">Verified Forester · Active</div>
              </div>
            )}
          </div>
        ) : (
          <NavLink
            to="/login"
            onClick={onMobileClose}
            className="flex items-center gap-3 text-forest-200 hover:text-white group"
          >
            <div className="w-8 h-8 rounded-full bg-forest-rich border border-forest-moss flex items-center justify-center shrink-0 text-forest-300 group-hover:text-lime-400 group-hover:border-lime-400/50 transition-colors">
              <LogIn className="w-4 h-4" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-white group-hover:text-lime-300 transition-colors">Sign In</div>
                <div className="text-[10px] text-forest-300 truncate">Connect account</div>
              </div>
            )}
          </NavLink>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:block h-screen sticky top-0 transition-all duration-300 z-30 shrink-0',
          isCollapsed ? 'w-20' : 'w-64'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Backdrop & Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={onMobileClose}
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
