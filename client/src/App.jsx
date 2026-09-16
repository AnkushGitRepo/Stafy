import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';

import { LandingPage } from './features/landing/LandingPage.jsx';
import { AuthProvider, useAuth } from './lib/authContext.jsx';

// Route-level code splitting: the landing page (this app's Lighthouse-scored
// route) ships alone; auth forms, the app shell, and dashboards only load
// once a visitor actually navigates there. Cuts ~110KB of unused JS off the
// landing route's initial bundle (see docs/DESIGN.md Open items).
const SignInPage = lazy(() => import('./features/auth/pages/SignInPage.jsx').then((m) => ({ default: m.SignInPage })));
const ActivateAccountPage = lazy(() => import('./features/auth/pages/ActivateAccountPage.jsx').then((m) => ({ default: m.ActivateAccountPage })));
const PrivacyPage = lazy(() => import('./features/landing/pages/PrivacyPage.jsx').then((m) => ({ default: m.PrivacyPage })));
const TermsPage = lazy(() => import('./features/landing/pages/TermsPage.jsx').then((m) => ({ default: m.TermsPage })));
const NotFoundPage = lazy(() => import('./features/landing/pages/NotFoundPage.jsx').then((m) => ({ default: m.NotFoundPage })));
const AppShell = lazy(() => import('./features/app-shell/AppShell.jsx').then((m) => ({ default: m.AppShell })));
const AdminDashboardPage = lazy(() => import('./features/dashboard/pages/AdminDashboardPage.jsx').then((m) => ({ default: m.AdminDashboardPage })));
const ManagerDashboardPage = lazy(() => import('./features/dashboard/pages/ManagerDashboardPage.jsx').then((m) => ({ default: m.ManagerDashboardPage })));
const EmployeeDashboardPage = lazy(() => import('./features/dashboard/pages/EmployeeDashboardPage.jsx').then((m) => ({ default: m.EmployeeDashboardPage })));
const LeavePage = lazy(() => import('./features/leave/pages/LeavePage.jsx').then((m) => ({ default: m.LeavePage })));
const EmployeesPage = lazy(() => import('./features/employees/pages/EmployeesPage.jsx').then((m) => ({ default: m.EmployeesPage })));
const AttendancePage = lazy(() => import('./features/attendance/pages/AttendancePage.jsx').then((m) => ({ default: m.AttendancePage })));
const ApprovalsPage = lazy(() => import('./features/approvals/pages/ApprovalsPage.jsx').then((m) => ({ default: m.ApprovalsPage })));
const TeamPage = lazy(() => import('./features/team/pages/TeamPage.jsx').then((m) => ({ default: m.TeamPage })));
const AuditLogPage = lazy(() => import('./features/audit/pages/AuditLogPage.jsx').then((m) => ({ default: m.AuditLogPage })));
const ProfilePage = lazy(() => import('./features/profile/pages/ProfilePage.jsx').then((m) => ({ default: m.ProfilePage })));

// UX-only guard (ADR-007) — real enforcement is server-side, added in P1.
function RequireAuth({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function RoleDashboard() {
  const { role } = useAuth();
  if (role === 'admin') return <AdminDashboardPage />;
  if (role === 'manager') return <ManagerDashboardPage />;
  return <EmployeeDashboardPage />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<SignInPage />} />
            <Route path="/activate" element={<ActivateAccountPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />

            <Route
              path="/app"
              element={
                <RequireAuth>
                  <AppShell />
                </RequireAuth>
              }
            >
              <Route index element={<RoleDashboard />} />
              <Route path="attendance" element={<AttendancePage />} />
              <Route path="leave" element={<LeavePage />} />
              <Route path="approvals" element={<ApprovalsPage />} />
              <Route path="employees" element={<EmployeesPage />} />
              <Route path="team" element={<TeamPage />} />
              <Route path="audit" element={<AuditLogPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
