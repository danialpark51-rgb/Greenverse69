import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

// Batch 2 Six Feature Components
import { AIPlantIdentification } from '../components/planting/AIPlantIdentification';
import { AIPlantDiseaseDiagnosis } from '../components/planting/AIPlantDiseaseDiagnosis';
import { SmartPlantCareAdvisor } from '../components/planting/SmartPlantCareAdvisor';
import { SmartPlantingCalendar } from '../components/planting/SmartPlantingCalendar';
import { WeatherPlantingIntelligence } from '../components/planting/WeatherPlantingIntelligence';
import { PlantDatabaseEncyclopedia } from '../components/planting/PlantDatabaseEncyclopedia';
import { MyPlantsCollection } from '../components/planting/MyPlantsCollection';

// Extended Spatial & Micro-planning Tools (Preserved from Suite)
import { SpeciesMatchEngine } from '../components/planting/SpeciesMatchEngine';
import { ClimateSuitabilityChecker } from '../components/planting/ClimateSuitabilityChecker';
import { SoilCompatibilityChecker } from '../components/planting/SoilCompatibilityChecker';
import { WateringIntelligenceTracker } from '../components/planting/WateringIntelligenceTracker';
import { SunlightAnalysisComparator } from '../components/planting/SunlightAnalysisComparator';
import { NativePlantFinder } from '../components/planting/NativePlantFinder';
import { SmartSiteFinder } from '../components/planting/SmartSiteFinder';
import { GreenDeficitAnalyzer } from '../components/planting/GreenDeficitAnalyzer';
import { PlantSpacingPlanner } from '../components/planting/PlantSpacingPlanner';
import { BiodiversityPlanner } from '../components/planting/BiodiversityPlanner';
import { PlantingRiskScanner } from '../components/planting/PlantingRiskScanner';

import {
  Sparkles,
  Stethoscope,
  Bot,
  Calendar,
  CloudSun,
  BookOpen,
  Sprout,
  TreeDeciduous,
  Thermometer,
  Layers,
  Droplets,
  Sun,
  Compass,
  PieChart,
  Grid3X3,
  ShieldAlert
} from 'lucide-react';

type TabKey =
  // 6 Core Features + My Plants
  | 'ai-identification'
  | 'ai-diagnosis'
  | 'care-advisor'
  | 'planting-calendar'
  | 'weather-intelligence'
  | 'plant-encyclopedia'
  | 'my-plants'
  // Preserved Extended Suite Tools
  | 'plant-recommendations'
  | 'climate-intelligence'
  | 'soil-compatibility'
  | 'watering-intelligence'
  | 'sunlight-analysis'
  | 'native-finder'
  | 'site-finder'
  | 'green-deficit'
  | 'spacing-planner'
  | 'biodiversity'
  | 'risk-scanner';

interface TabItem {
  key: TabKey;
  label: string;
  category: 'primary' | 'spatial';
  icon: React.ComponentType<{ className?: string }>;
  tag?: string;
}

const TABS: TabItem[] = [
  // Six Batch 2 Smart Planting Intelligence Features + My Plants
  { key: 'ai-identification', label: 'AI Plant Identification', category: 'primary', icon: Sparkles, tag: 'Vision AI' },
  { key: 'ai-diagnosis', label: 'Plant Disease Diagnosis', category: 'primary', icon: Stethoscope, tag: 'Pathology' },
  { key: 'care-advisor', label: 'Smart Care Advisor', category: 'primary', icon: Bot, tag: 'AI Regimen' },
  { key: 'planting-calendar', label: 'Planting Calendar', category: 'primary', icon: Calendar },
  { key: 'weather-intelligence', label: 'Weather Intelligence', category: 'primary', icon: CloudSun, tag: 'Open-Meteo' },
  { key: 'plant-encyclopedia', label: 'Plant Encyclopedia', category: 'primary', icon: BookOpen, tag: 'Perenual' },
  { key: 'my-plants', label: 'My Plants Collection', category: 'primary', icon: Sprout, tag: 'Saved' },

  // Preserved Spatial & Restoration Suite Tools
  { key: 'plant-recommendations', label: 'Species Match', category: 'spatial', icon: TreeDeciduous },
  { key: 'climate-intelligence', label: 'Climate Suitability', category: 'spatial', icon: Thermometer },
  { key: 'soil-compatibility', label: 'Soil Compatibility', category: 'spatial', icon: Layers },
  { key: 'watering-intelligence', label: 'Moisture Tracker', category: 'spatial', icon: Droplets },
  { key: 'sunlight-analysis', label: 'Solar Irradiance', category: 'spatial', icon: Sun },
  { key: 'native-finder', label: 'Native Species', category: 'spatial', icon: Compass },
  { key: 'site-finder', label: 'Site Assessment', category: 'spatial', icon: Compass },
  { key: 'green-deficit', label: 'Canopy Deficit', category: 'spatial', icon: PieChart },
  { key: 'spacing-planner', label: 'Spacing Planner', category: 'spatial', icon: Grid3X3 },
  { key: 'biodiversity', label: 'Biodiversity', category: 'spatial', icon: Sparkles },
  { key: 'risk-scanner', label: 'Biosecurity Risks', category: 'spatial', icon: ShieldAlert },
];

export const IntelligencePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as TabKey) || 'ai-identification';
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);

  // Pre-fill states for inter-feature navigation
  const [carePlanPlantName, setCarePlanPlantName] = useState('');
  const [carePlanScientificName, setCarePlanScientificName] = useState('');

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

  const handleNavigateToCarePlan = (pName: string, sName?: string) => {
    setCarePlanPlantName(pName);
    setCarePlanScientificName(sName || '');
    handleTabChange('care-advisor');
  };

  const primaryTabs = TABS.filter((t) => t.category === 'primary');
  const spatialTabs = TABS.filter((t) => t.category === 'spatial');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-sage-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-lime-600" />
            Smart Planting Intelligence Suite
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time multimodal Gemini vision plant identification, pathology diagnosis, Open-Meteo microclimate telemetry, and Perenual botanical database.
          </p>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="space-y-3">
        {/* Core Primary Batch 2 Tabs */}
        <div>
          <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-forest-700 block mb-1.5">
            Core Botanical Intelligence & Portfolio
          </span>
          <div className="flex flex-wrap gap-1.5 p-1 bg-sage-100/70 rounded-xl border border-sage-200">
            {primaryTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-white text-forest-900 shadow-soft-sm font-semibold border border-forest-600/30'
                      : 'text-slate-600 hover:text-forest-900 hover:bg-white/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-forest-700' : 'text-slate-500'}`} />
                  <span>{tab.label}</span>
                  {tab.tag && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                        isActive ? 'bg-forest-100 text-forest-800' : 'bg-slate-200 text-slate-600'
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

        {/* Spatial & Restoration Tools Collapsible/Secondary row */}
        <div>
          <span className="text-[10px] uppercase font-mono font-semibold tracking-wider text-slate-400 block mb-1">
            Spatial Canopy Planning & Agronomics
          </span>
          <div className="flex flex-wrap gap-1 overflow-x-auto pb-1 text-xs">
            {spatialTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] transition-colors ${
                    isActive
                      ? 'bg-forest-800 text-white font-medium'
                      : 'text-slate-600 hover:bg-slate-100 bg-white border border-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Panels */}
      <div className="min-h-[500px]">
        {/* 1. AI Plant Identification */}
        {activeTab === 'ai-identification' && (
          <AIPlantIdentification
            onNavigateToCarePlan={handleNavigateToCarePlan}
          />
        )}

        {/* 2. AI Plant Disease Diagnosis */}
        {activeTab === 'ai-diagnosis' && (
          <AIPlantDiseaseDiagnosis />
        )}

        {/* 3. Smart Plant Care Advisor */}
        {activeTab === 'care-advisor' && (
          <SmartPlantCareAdvisor
            initialPlantName={carePlanPlantName}
            initialScientificName={carePlanScientificName}
          />
        )}

        {/* 4. Smart Planting Calendar */}
        {activeTab === 'planting-calendar' && (
          <SmartPlantingCalendar />
        )}

        {/* 5. Weather-Based Planting Intelligence */}
        {activeTab === 'weather-intelligence' && (
          <WeatherPlantingIntelligence
            onNavigateToCalendar={() => handleTabChange('planting-calendar')}
          />
        )}

        {/* 6. Plant & Tree Encyclopedia */}
        {activeTab === 'plant-encyclopedia' && (
          <PlantDatabaseEncyclopedia
            onNavigateToCarePlan={handleNavigateToCarePlan}
          />
        )}

        {/* 7. My Plants Collection */}
        {activeTab === 'my-plants' && (
          <MyPlantsCollection
            onNavigateToTab={(tab, pName) => {
              if (tab === 'smart-assistant' || tab === 'care-advisor') {
                handleNavigateToCarePlan(pName || '');
              } else {
                handleTabChange(tab as TabKey);
              }
            }}
          />
        )}

        {/* Preserved Spatial & Ecological Tools */}
        {activeTab === 'plant-recommendations' && <SpeciesMatchEngine />}
        {activeTab === 'climate-intelligence' && <ClimateSuitabilityChecker />}
        {activeTab === 'soil-compatibility' && <SoilCompatibilityChecker />}
        {activeTab === 'watering-intelligence' && <WateringIntelligenceTracker />}
        {activeTab === 'sunlight-analysis' && <SunlightAnalysisComparator />}
        {activeTab === 'native-finder' && <NativePlantFinder />}
        {activeTab === 'site-finder' && <SmartSiteFinder />}
        {activeTab === 'green-deficit' && <GreenDeficitAnalyzer />}
        {activeTab === 'spacing-planner' && <PlantSpacingPlanner />}
        {activeTab === 'biodiversity' && <BiodiversityPlanner />}
        {activeTab === 'risk-scanner' && <PlantingRiskScanner />}
      </div>
    </div>
  );
};
