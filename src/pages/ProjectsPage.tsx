import React, { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ProjectHub } from '../components/project/ProjectHub';
import { ProjectCreator } from '../components/project/ProjectCreator';
import { ProjectDetail } from '../components/project/ProjectDetail';
import { TransparencyDashboard } from '../components/project/TransparencyDashboard';
import { VolunteerMatcher } from '../components/project/VolunteerMatcher';
import { MilestoneTracker } from '../components/project/MilestoneTracker';
import { ImpactEstimator } from '../components/project/ImpactEstimator';
import { TrustVerification } from '../components/project/TrustVerification';
import { Project } from '../types/project';
import { ArrowLeft, Layers } from 'lucide-react';

type MainTab = 'hub' | 'transparency' | 'volunteers' | 'milestones' | 'impact' | 'trust';

const PROJECT_TABS: { key: MainTab; label: string }[] = [
  { key: 'hub', label: 'Project Hub' },
  { key: 'transparency', label: 'Transparency' },
  { key: 'volunteers', label: 'Volunteers & Resources' },
  { key: 'milestones', label: 'Milestones' },
  { key: 'impact', label: 'Impact Estimator' },
  { key: 'trust', label: 'Trust & Verification' },
];

export const ProjectsPage: React.FC = () => {
  const { user, profile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = (searchParams.get('tab') as MainTab) || 'hub';
  const [activeTab, setActiveTab] = useState<MainTab>(tabParam);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showCreator, setShowCreator] = useState(false);

  const currentUserId = user?.id;
  const currentUserName = profile?.full_name || user?.email?.split('@')[0] || 'Anonymous';

  const isOwner = selectedProject
    ? selectedProject.owner_id === currentUserId || selectedProject.user_role === 'lead_organizer'
    : false;

  const handleTabChange = useCallback((tab: MainTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  }, [setSearchParams]);

  const handleSelectProject = useCallback((project: Project) => {
    setSelectedProject(project);
    setActiveTab('hub');
    setSearchParams({ tab: 'hub' });
  }, [setSearchParams]);

  const handleBackToHub = useCallback(() => {
    setSelectedProject(null);
    setActiveTab('hub');
    setSearchParams({ tab: 'hub' });
  }, [setSearchParams]);

  const handleProjectCreated = useCallback((project: Project) => {
    setShowCreator(false);
    setSelectedProject(project);
    setActiveTab('hub');
    setSearchParams({ tab: 'hub' });
  }, [setSearchParams]);

  const handleNavigateTab = useCallback((tab: string) => {
    const validTab = tab as MainTab;
    setActiveTab(validTab);
    setSearchParams({ tab: validTab });
  }, [setSearchParams]);

  // Render detail-mode tabs (project selected)
  const renderDetailContent = () => {
    if (!selectedProject) return null;
    switch (activeTab) {
      case 'hub':
        return (
          <ProjectDetail
            project={selectedProject}
            onBack={handleBackToHub}
            currentUserId={currentUserId}
            currentUserName={currentUserName}
            onNavigateTab={handleNavigateTab}
          />
        );
      case 'transparency':
        return (
          <TransparencyDashboard
            project={selectedProject}
            currentUserId={currentUserId}
            isOwner={isOwner}
          />
        );
      case 'volunteers':
        return (
          <VolunteerMatcher
            project={selectedProject}
            currentUserId={currentUserId}
            currentUserName={currentUserName}
          />
        );
      case 'milestones':
        return (
          <MilestoneTracker
            project={selectedProject}
            currentUserId={currentUserId}
            currentUserName={currentUserName}
            isOwner={isOwner}
          />
        );
      case 'impact':
        return (
          <ImpactEstimator
            project={selectedProject}
            currentUserId={currentUserId}
          />
        );
      case 'trust':
        return (
          <TrustVerification
            project={selectedProject}
            currentUserId={currentUserId}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-xl">
              <Layers className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Green Projects</h1>
              <p className="text-sm text-slate-500">
                Discover, support, and manage environmental projects
              </p>
            </div>
          </div>
        </div>

        {/* Detail View: Back + Tab Bar */}
        {selectedProject && (
          <>
            {/* Back bar */}
            <div className="mb-4 flex items-center gap-3">
              <button
                onClick={handleBackToHub}
                className="flex items-center gap-2 text-sm text-slate-500 hover:text-emerald-600 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to All Projects
              </button>
              <span className="text-slate-300">|</span>
              <span className="text-sm font-medium text-slate-700 truncate max-w-xs">
                {selectedProject.title}
              </span>
            </div>

            {/* Project detail tab bar */}
            <div className="flex gap-1 overflow-x-auto pb-1 mb-6 scrollbar-hide">
              {PROJECT_TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.key
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Detail content */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              {renderDetailContent()}
            </div>
          </>
        )}

        {/* Hub View: no project selected */}
        {!selectedProject && !showCreator && (
          <ProjectHub
            currentUserId={currentUserId}
            onSelectProject={handleSelectProject}
            onOpenCreateModal={() => setShowCreator(true)}
          />
        )}

        {/* Project Creator Modal */}
        {showCreator && (
          <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 overflow-y-auto py-8 px-4">
            <div className="w-full max-w-3xl">
              <ProjectCreator
                onClose={() => setShowCreator(false)}
                onCreated={handleProjectCreated}
                currentUserId={currentUserId}
                currentUserName={currentUserName}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsPage;
