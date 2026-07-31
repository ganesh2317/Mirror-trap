import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppProvider } from '@/lib/store';
import { Toaster } from '@/components/ui/Toaster';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { ProtectedRoute } from '@/routes/ProtectedRoute';

const LandingPage = lazy(() => import('@/pages/LandingPage').then((m) => ({ default: m.LandingPage })));
const AuthPage = lazy(() => import('@/pages/AuthPage').then((m) => ({ default: m.AuthPage })));
const DashboardShell = lazy(() => import('@/components/DashboardShell').then((m) => ({ default: m.DashboardShell })));
const DashboardHome = lazy(() => import('@/pages/DashboardHome').then((m) => ({ default: m.DashboardHome })));
const ScanPage = lazy(() => import('@/pages/ScanPage').then((m) => ({ default: m.ScanPage })));
const HackersViewPage = lazy(() => import('@/pages/HackersViewPage').then((m) => ({ default: m.HackersViewPage })));
const PhantomShieldPage = lazy(() => import('@/pages/PhantomShieldPage').then((m) => ({ default: m.PhantomShieldPage })));
const AlertsPage = lazy(() => import('@/pages/AlertsPage').then((m) => ({ default: m.AlertsPage })));
const ReportsPage = lazy(() => import('@/pages/ReportsPage').then((m) => ({ default: m.ReportsPage })));
const SettingsPage = lazy(() => import('@/pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const ProtectPage = lazy(() => import('@/pages/ProtectPage').then((m) => ({ default: m.ProtectPage })));
const ReplayPage = lazy(() => import('@/pages/ReplayPage').then((m) => ({ default: m.ReplayPage })));

function RouteFallback() {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <SkeletonLoader type="stats" rows={4} />
      <SkeletonLoader type="chart" />
      <SkeletonLoader type="feed" rows={3} />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <BrowserRouter>
          <Toaster />
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<AuthPage mode="login" />} />
              <Route path="/signup" element={<AuthPage mode="signup" />} />

              <Route element={<ProtectedRoute />}>
                <Route element={<DashboardShell />}>
                  <Route path="/dashboard" element={<DashboardHome />} />
                  <Route path="/scan" element={<ScanPage />} />
                  <Route path="/hackers-eye" element={<HackersViewPage />} />
                  <Route path="/phantomshield" element={<PhantomShieldPage />} />
                  <Route path="/alerts" element={<AlertsPage />} />
                  <Route path="/protect" element={<ProtectPage />} />
                  <Route path="/reports" element={<ReportsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/replay/:alertId" element={<ReplayPage />} />
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
