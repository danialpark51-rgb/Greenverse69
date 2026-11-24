import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Authentication
import { AuthPage } from './pages/AuthPage';

// 15 Modules
import { DashboardPage } from './pages/DashboardPage';
import { GreenMapPage } from './pages/GreenMapPage';
import { IntelligencePage } from './pages/IntelligencePage';
import { DesignerPage } from './pages/DesignerPage';
import { PassportPage } from './pages/PassportPage';
import { TreeCarePage } from './pages/TreeCarePage';
import { TreeDoctorPage } from './pages/TreeDoctorPage';
import { TreeProtectorPage } from './pages/TreeProtectorPage';
import { CommunitiesPage } from './pages/CommunitiesPage';
import { OpportunitiesPage } from './pages/OpportunitiesPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { MarketplacePage } from './pages/MarketplacePage';
import { ImpactPage } from './pages/ImpactPage';
import { WalletPage } from './pages/WalletPage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<AuthPage />} />
          <Route path="/signup" element={<AuthPage />} />
          <Route path="/auth" element={<AuthPage />} />

          {/* Core Application Shell Routes */}
          <Route path="/" element={<AppLayout />}>
            {/* Public Ecological & Community Exploration Routes */}
            <Route index element={<DashboardPage />} />
            <Route path="map" element={<GreenMapPage />} />
            <Route path="intelligence" element={<IntelligencePage />} />
            <Route path="designer" element={<DesignerPage />} />
            <Route path="passport" element={<PassportPage />} />
            <Route path="care" element={<TreeCarePage />} />
            <Route path="doctor" element={<TreeDoctorPage />} />
            <Route path="protector" element={<TreeProtectorPage />} />
            <Route path="communities" element={<CommunitiesPage />} />
            <Route path="opportunities" element={<OpportunitiesPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="marketplace" element={<MarketplacePage />} />
            <Route path="impact" element={<ImpactPage />} />

            {/* Protected Account-Specific Routes */}
            <Route
              path="wallet"
              element={
                <ProtectedRoute>
                  <WalletPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
