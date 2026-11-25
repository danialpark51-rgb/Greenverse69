import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GreenGigsHub } from '../components/economy/GreenGigsHub';
import { GreenBountiesHub } from '../components/economy/GreenBountiesHub';
import { GreenOpportunitiesHub } from '../components/economy/GreenOpportunitiesHub';
import { SkillsMatcherHub } from '../components/economy/SkillsMatcherHub';
import { GreenExpertDirectory } from '../components/economy/GreenExpertDirectory';
import { Briefcase, Award, GraduationCap, Sparkles, UserCheck } from 'lucide-react';

type EconomyTab = 'gigs' | 'bounties' | 'opportunities' | 'matching' | 'experts';

const TABS: { key: EconomyTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'gigs', label: 'Green Gigs', icon: Briefcase },
  { key: 'bounties', label: 'Bounties & Tasks', icon: Award },
  { key: 'opportunities', label: 'Programs & Grants', icon: GraduationCap },
  { key: 'matching', label: 'Skills Matcher', icon: Sparkles },
  { key: 'experts', label: 'Expert Directory', icon: UserCheck },
];

export const OpportunitiesPage: React.FC = () => {
  const { user, profile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = (searchParams.get('tab') as EconomyTab) || 'gigs';
  const [activeTab, setActiveTab] = useState<EconomyTab>(currentTab);

  const currentUserId = user?.id;
  const currentUserName = profile?.full_name || user?.email?.split('@')[0] || 'Community Planter';

  useEffect(() => {
    const tab = searchParams.get('tab') as EconomyTab;
    if (tab && TABS.some(t => t.key === tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tab: EconomyTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 border-b border-slate-200/80 scrollbar-hide">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      {activeTab === 'gigs' && (
        <GreenGigsHub currentUserId={currentUserId} currentUserName={currentUserName} />
      )}
      {activeTab === 'bounties' && (
        <GreenBountiesHub currentUserId={currentUserId} currentUserName={currentUserName} />
      )}
      {activeTab === 'opportunities' && (
        <GreenOpportunitiesHub currentUserId={currentUserId} currentUserName={currentUserName} />
      )}
      {activeTab === 'matching' && (
        <SkillsMatcherHub currentUserId={currentUserId} currentUserName={currentUserName} />
      )}
      {activeTab === 'experts' && (
        <GreenExpertDirectory currentUserId={currentUserId} currentUserName={currentUserName} />
      )}
    </div>
  );
};
export default OpportunitiesPage;
