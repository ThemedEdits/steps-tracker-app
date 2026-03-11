// Main App — routing and auth guard
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from './hooks/useAuth';
import { useAppStore } from './store/appStore';
import { FullPageLoader } from './components/ui/index';
import { AppLayout } from './components/layout/AppLayout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage, SignupPage } from './pages/AuthPages';
import { ProfileSetupPage } from './pages/ProfileSetupPage';
import { DashboardPage } from './pages/DashboardPage';
import { TrackingPage } from './pages/TrackingPage';
import { HistoryPage, ActivityDetailPage } from './pages/HistoryPages';
import { StatsPage } from './pages/StatsPage';
import { ProfilePage, SettingsPage } from './pages/ProfileSettings';

// Auth guard — redirects unauthenticated users
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, authLoading } = useAppStore();
  if (authLoading) return <FullPageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

// Public route — redirects authenticated users to dashboard
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, authLoading } = useAppStore();
  if (authLoading) return <FullPageLoader />;
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

// Animated routes wrapper
const AppRoutes: React.FC = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public pages */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />

        {/* Profile setup — needs auth */}
        <Route path="/setup" element={
          <ProtectedRoute><ProfileSetupPage /></ProtectedRoute>
        } />

        {/* Authenticated app */}
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/track" element={<TrackingPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/activity/:id" element={<ActivityDetailPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* 404 fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

// Auth initializer — runs at top level
const AuthInit: React.FC = () => {
  useAuth(); // Initializes auth state listener
  return null;
};

const App: React.FC = () => {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthInit />
      <AppRoutes />
    </BrowserRouter>
  );
};

export default App;