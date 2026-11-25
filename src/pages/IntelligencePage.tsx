import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

// 8 Primary Batch 2 Feature Components
import { SpeciesMatchEngine } from '../components/planting/SpeciesMatchEngine';
import { ClimateSuitabilityChecker } from '../components/planting/ClimateSuitabilityChecker';
import { SoilCompatibilityChecker } from '../components/planting/SoilCompatibilityChecker';
import { PlantingCalendar } from '../components/planting/PlantingCalendar';
import { WateringIntelligenceTracker } from '../components/planting/WateringIntelligenceTracker';
import { SunlightAnalysisComparator } from '../components/planting/SunlightAnalysisComparator';
import { NativePlantFinder } from '../components/planting/NativePlantFinder';
import { SmartPlantingAssistant } from '../components/planting/SmartPlantingAssistant';

// Extended Spatial & Micro-planning Tools (Preserved from Suite)
import { SmartSiteFinder } from '../components/planting/SmartSiteFinder';
import { GreenDeficitAnalyzer } from '../components/planting/GreenDeficitAnalyzer';
import { PlantSpacingPlanner } from '../components/planting/PlantSpacingPlanner';
import { BiodiversityPlanner } from '../components/planting/BiodiversityPlanner';
import { PlantingRiskScanner } from '../components/planting/PlantingRiskScanner';

import {
  Sparkles,
  TreeDeciduous,
  Thermometer,
  Layers,
  Calendar,
  Droplets,
  Sun,
  Compass,
  Bot,
  PieChart,
  Grid3X3,
  ShieldAlert
} from 'lucide-react';

type TabKey =
  | 'plant-recommendations'
  | 'climate-intelligence'
  | 'soil-compatibility'
  | 'planting-calendar'
  | 'watering-intelligence'
  | 'sunlight-analysis'
  | 'native-finder'
  | 'smart-assistant'
  // Extended Suite Tabs
  | 'site-finder'
  | 'green-deficit'
  | 'spacing-planner'
  | 'biodiversity'
  | 'risk-scanner';

interface TabItem {
  key: TabKey;
  label: string;
  category: 'core' | 'extended';
  icon: React.ComponentType<{ className?: string }>;
  tag?: string;
}

const TABS: TabItem[] = [
  // 8 Mandatory Batch 2 Features
  { key: 'plant-recommendations', label: '1. Plant Recommendations', category: 'core', icon: TreeDeciduous, tag: 'Native' },
  { key: 'climate-intelligence', label: '2. Climate Intelligence', category: 'core', icon: Thermometer },
  { key: 'soil-compatibility', label: '3. Soil Compatibility', category: 'core', icon: Layers },
  { key: 'planting-calendar', label: '4. Planting Calendar', category: 'core', icon: Calendar },
  { key: 'watering-intelligence', label: '5. Watering Intelligence', category: 'core', icon: Droplets },
  { key: 'sunlight-analysis', label: '6. Sunlight Analysis', category: 'core', icon: Sun },
  { key: 'native-finder', label: '7. Native Plant Finder', category: 'core', icon: Compass, tag: 'Verified' },
  { key: 'smart-assistant', label: '8. Smart Assistant', category: 'core', icon: Bot, tag: 'Advisor' },

  // Preserved Spatial Restoration Suite Tools
  { key: 'site-finder', label: 'Site Assessment', category: 'extended', icon: Compass },
  { key: 'green-deficit', label: 'Green Deficit', category: 'extended', icon: PieChart },
  { key: 'spacing-planner', label: 'Spacing Planner', category: 'extended', icon: Grid3X3 },
  { key: 'biodiversity', label: 'Biodiversity', category: 'extended', icon: Sparkles },
  { key: 'risk-scanner', label: 'Risk Scanner', category: 'extended', icon: ShieldAlert },
];

export const IntelligencePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as TabKey) || 'plant-recommendations';
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

  const coreTabs = TABS.filter(t => t.category === 'core');
  const extendedTabs = TABS.filter(t => t.category === 'extended');

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
            Batch 2 Intelligence: personalized recommendations, bioclimatic suitability, soil compatibility, seasonal calendars, watering tracking, sunlight comparison, native flora search, and unified advisory.
          </p>
        </div>
      </div>

      {/* Main 8-Feature Horizontal Navigation Tab Bar */}
      <div className="space-y-2">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Core Batch 2 Intelligence Modules
        </div>
        <div className="bg-white border border-sage-200 rounded-xl p-1.5 shadow-xs flex items-center gap-1 overflow-x-auto">
          {coreTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
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
      </div>

      {/* Extended Planning Tools (Preserved) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 text-[10px] font-bold uppercase whitespace-nowrap">
          Spatial & Geometry Tools:
        </span>
        {extendedTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-forest-700 text-white font-semibold'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Feature Render Component */}
      <div>
        {/* Core 8 Features */}
        {activeTab === 'plant-recommendations' && <SpeciesMatchEngine />}
        {activeTab === 'climate-intelligence' && <ClimateSuitabilityChecker />}
        {activeTab === 'soil-compatibility' && <SoilCompatibilityChecker />}
        {activeTab === 'planting-calendar' && <PlantingCalendar />}
        {activeTab === 'watering-intelligence' && <WateringIntelligenceTracker />}
        {activeTab === 'sunlight-analysis' && <SunlightAnalysisComparator />}
        {activeTab === 'native-finder' && <NativePlantFinder />}
        {activeTab === 'smart-assistant' && <SmartPlantingAssistant />}

        {/* Extended Suite Tools */}
        {activeTab === 'site-finder' && <SmartSiteFinder />}
        {activeTab === 'green-deficit' && <GreenDeficitAnalyzer />}
        {activeTab === 'spacing-planner' && <PlantSpacingPlanner />}
        {activeTab === 'biodiversity' && <BiodiversityPlanner />}
        {activeTab === 'risk-scanner' && <PlantingRiskScanner />}
      </div>
    </div>
  );
};
