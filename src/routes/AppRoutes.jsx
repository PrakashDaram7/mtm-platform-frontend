/**
 * AppRoutes.jsx
 *
 * Main routing configuration for the MTM Platform.
 * Aligned with PRD Section 3.1 roles:
 *   admin, finance_admin, event_manager, committee_member,
 *   moderator, member, family_member, volunteer
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Public pages
import LandingPage from '../pages/public/LandingPage.jsx';
import SignIn from '../pages/public/SignIn.jsx';
import SignUp from '../pages/public/Signup.jsx';
import NotFound from '../pages/public/NotFound.jsx';

// Admin pages — split components
import AdminOverview from '../pages/admin/AdminOverview.jsx';
import UserManagement from '../pages/admin/UserManagement.jsx';
import RoleManagement from '../pages/admin/RoleManagement.jsx';
import EventManagement from '../pages/admin/EventManagement.jsx';
import PermissionsPage from '../pages/admin/PermissionsPage.jsx';
import MembershipPage from '../pages/admin/MembershipPage.jsx';
import AnalyticsPage from '../pages/admin/AnalyticsPage.jsx';
import SettingsPage from '../pages/admin/SettingsPage.jsx';
import AuditLogsPage from '../pages/admin/AuditLogsPage.jsx';
import PaymentsPage from '../pages/admin/PaymentsPage.jsx';
import AnnouncementsPage from '../pages/admin/AnnouncementsPage.jsx';

// Protected pages — role dashboards
import ModeratorDashboard from '../pages/protected/ModeratorDashboard.jsx';
import MemberDashboard from '../pages/protected/MemberDashboard.jsx';
import Profile from '../pages/protected/Profile.jsx';
import FinanceDashboard from '../pages/protected/FinanceDashboard.jsx';
import EventManagerDashboard from '../pages/protected/EventManagerDashboard.jsx';
import CommitteeDashboard from '../pages/protected/CommitteeDashboard.jsx';

import ProtectedRoute from './ProtectedRoute.jsx';

export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* ─── Public Routes ─── */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth/signin" element={<SignIn />} />
        <Route path="/auth/signup" element={<SignUp />} />

        {/* ─── Admin Routes (each page is its own component) ─── */}
        <Route path="/admin/dashboard" element={<ProtectedRoute component={AdminOverview} requiredRole="admin" />} />
        <Route path="/admin/users" element={<ProtectedRoute component={UserManagement} requiredRole="admin" />} />
        <Route path="/admin/roles" element={<ProtectedRoute component={RoleManagement} requiredRole="admin" />} />
        <Route path="/admin/events" element={<ProtectedRoute component={EventManagement} requiredRole="admin" />} />
        <Route path="/admin/permissions" element={<ProtectedRoute component={PermissionsPage} requiredRole="admin" />} />
        <Route path="/admin/membership" element={<ProtectedRoute component={MembershipPage} requiredRole="admin" />} />
        <Route path="/admin/analytics" element={<ProtectedRoute component={AnalyticsPage} requiredRole="admin" />} />
        <Route path="/admin/settings" element={<ProtectedRoute component={SettingsPage} requiredRole="admin" />} />
        <Route path="/admin/logs" element={<ProtectedRoute component={AuditLogsPage} requiredRole="admin" />} />
        <Route path="/admin/payments" element={<ProtectedRoute component={PaymentsPage} requiredRole="admin" />} />
        <Route path="/admin/announcements" element={<ProtectedRoute component={AnnouncementsPage} requiredRole="admin" />} />

        {/* ─── Finance Admin Routes ─── */}
        <Route path="/finance/dashboard" element={<ProtectedRoute component={FinanceDashboard} allowedRoles={['finance_admin']} />} />
        <Route path="/finance/*" element={<ProtectedRoute component={FinanceDashboard} allowedRoles={['finance_admin']} />} />

        {/* ─── Event Manager Routes ─── */}
        <Route path="/events/dashboard" element={<ProtectedRoute component={EventManagerDashboard} allowedRoles={['event_manager']} />} />
        <Route path="/events/*" element={<ProtectedRoute component={EventManagerDashboard} allowedRoles={['event_manager']} />} />

        {/* ─── Committee Member Routes ─── */}
        <Route path="/committee/dashboard" element={<ProtectedRoute component={CommitteeDashboard} allowedRoles={['committee_member']} />} />
        <Route path="/committee/*" element={<ProtectedRoute component={CommitteeDashboard} allowedRoles={['committee_member']} />} />

        {/* ─── Moderator Routes ─── */}
        <Route path="/moderator/dashboard" element={<ProtectedRoute component={ModeratorDashboard} allowedRoles={['moderator']} />} />
        <Route path="/moderator/*" element={<ProtectedRoute component={ModeratorDashboard} allowedRoles={['moderator']} />} />

        {/* ─── Member Routes (member, family_member, volunteer) ─── */}
        <Route path="/member/dashboard" element={<ProtectedRoute component={MemberDashboard} allowedRoles={['member', 'family_member', 'volunteer']} />} />
        <Route path="/member/*" element={<ProtectedRoute component={MemberDashboard} allowedRoles={['member', 'family_member', 'volunteer']} />} />

        {/* ─── Shared Protected Routes ─── */}
        <Route path="/profile" element={<ProtectedRoute component={Profile} />} />

        {/* ─── Catch-all ─── */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
