import React, { useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ChevronRight, Home } from 'lucide-react';

const routeTitleMap: Record<string, { title: string; category: string }> = {
  '/': { title: 'Biosphere Intelligence Dashboard', category: 'Overview' },
  '/map': { title: 'Global Green Map & Biome Monitor', category: 'Overview' },
  '/intelligence': { title: 'Smart Planting Intelligence Engine', category: 'Planting Intelligence' },
  '/designer': { title: 'Plantation Grid & Canopy Designer', category: 'Planting Intelligence' },
  '/passport': { title: 'Digital Tree Passport Registry', category: 'Tree Stewardship' },
  '/care': { title: 'Tree Care, Telemetry & Survival Analytics', category: 'Tree Stewardship' },
  '/doctor': { title: 'AI Tree Doctor & Pathogen Diagnostic Clinic', category: 'Tree Stewardship' },
  '/protector': { title: 'Existing Tree Protector & Heritage Canopy', category: 'Tree Stewardship' },
  '/communities': { title: 'Eco-Communities & Planting Squads', category: 'Community Action' },
  '/opportunities': { title: 'Green Career & Reforestation Opportunities', category: 'Community Action' },
  '/projects': { title: 'Reforestation Projects & Transparent Funding', category: 'Community Action' },
  '/marketplace': { title: 'Green Marketplace & Restoration Supplies', category: 'Economy & Verification' },
  '/impact': { title: 'Planetary Impact & Satellite Verification', category: 'Economy & Verification' },
  '/wallet': { title: 'Green Wallet & Carbon Credit Rewards', category: 'Economy & Verification' },
  '/settings': { title: 'Profile & Environmental System Settings', category: 'Account' },
};

export const AppLayout: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const currentRouteMeta = routeTitleMap[location.pathname] || {
    title: 'Greenverse Platform',
    category: 'System',
  };

  return (
    <div className="flex min-h-screen bg-[#f7f9f6] text-slate-900 font-sans antialiased">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Header */}
        <Header onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />

        {/* Breadcrumb Navigation Strip */}
        <div className="bg-white/60 border-b border-sage-200/80 px-4 sm:px-6 py-2.5 flex items-center gap-1.5 text-xs text-slate-500">
          <Link
            to="/"
            className="hover:text-forest-800 transition-colors flex items-center gap-1"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Greenverse</span>
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="text-slate-400">{currentRouteMeta.category}</span>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="font-semibold text-slate-800 truncate">
            {currentRouteMeta.title}
          </span>
        </div>

        {/* Page Content Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="border-t border-sage-200/80 bg-white/50 px-4 sm:px-6 py-4 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Greenverse</span>
            <span>· Open Environmental Intelligence Foundation</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              MRV Engine v2.4 Active
            </span>
            <span>·</span>
            <span>All demo data simulated for research</span>
          </div>
        </footer>
      </div>
    </div>
  );
};
