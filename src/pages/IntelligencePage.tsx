import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SmartSiteFinder } from '../components/planting/SmartSiteFinder';
import { GreenDeficitAnalyzer } from '../components/planting/GreenDeficitAnalyzer';
import { SpeciesMatchEngine } from '../components/planting/SpeciesMatchEngine';
import { ClimateSuitabilityChecker } from '../components/planting/ClimateSuitabilityChecker';
import { PlantingCalendar } from '../components/planting/PlantingCalendar';
import { PlantSpacingPlanner } from '../components/planting/PlantSpacingPlanner';
import { BiodiversityPlanner } from '../components/planting/BiodiversityPlanner';
import { PlantingRiskScanner } from '../components/planting/PlantingRiskScanner';
import {
  Sparkles,
  Compass,
  PieChart,
  TreeDeciduous,
  Thermometer,
  Calendar,
  Grid3X3,
  ShieldAlert,
  Layers
} from 'lucide-react';

type TabKey =
  | 'site-finder'
  | 'green-deficit'
  | 'species-match'
  | 'climate-checker'
  | 'planting-calendar'
  | 'spacing-planner'
  | 'biodiversity'
  | 'risk-scanner';

interface TabItem {
  key: TabKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  tag?: string;
}

const TABS: TabItem[] = [
  { key: 'site-finder', label: '1. Site Finder', icon: Compass },
  { key: 'green-deficit', label: '2. Green Deficit', icon: PieChart },
  { key: 'species-match', label: '3. Species Match', icon: TreeDeciduous, tag: 'Native AI' },
  { key: 'climate-checker', label: '4. Climate Checker', icon: Thermometer },
  { key: 'planting-calendar', label: '5. Calendar', icon: Calendar },
  { key: 'spacing-planner', label: '6. Spacing Planner', icon: Grid3X3 },
  { key: 'biodiversity', label: '7. Biodiversity', icon: Sparkles },
  { key: 'risk-scanner', label: '8. Risk Scanner', icon: ShieldAlert },
];

export const IntelligencePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as TabKey) || 'site-finder';
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab') as TabKey;
    if (tabFromUrl && TABS.some((t) => t.key === tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const handleTabChange = (key: TabKey) => {
    setActiveTab(key);
    setSearchParams({ tab: key });
  };

  return (
    <div className="space-y-6">
      {/* Unified Suite Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-lime-600" />
            Smart Planting Intelligence Suite
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            End-to-end ecological planning: site suitability, canopy deficit analysis, native species matching, climate stress tests, spacing geometry, and risk audits.
          </p>
        </div>
      </div>

      {/* 8-Feature Horizontal Navigation Tab Bar */}
      <div className="bg-white border border-sage-200 rounded-xl p-1.5 shadow-xs flex items-center gap-1 overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-forest-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-lime-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.tag && (
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider ${
                    isActive ? 'bg-lime-400 text-forest-950' : 'bg-forest-100 text-forest-800'
                  }`}
                >
                  {tab.tag}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Feature Render Component */}
      <div>
        {activeTab === 'site-finder' && <SmartSiteFinder />}
        {activeTab === 'green-deficit' && <GreenDeficitAnalyzer />}
        {activeTab === 'species-match' && <SpeciesMatchEngine />}
        {activeTab === 'climate-checker' && <ClimateSuitabilityChecker />}
        {activeTab === 'planting-calendar' && <PlantingCalendar />}
        {activeTab === 'spacing-planner' && <PlantSpacingPlanner />}
        {activeTab === 'biodiversity' && <BiodiversityPlanner />}
        {activeTab === 'risk-scanner' && <PlantingRiskScanner />}
      </div>
    </div>
  );
};
