/**
 * AppRoutes.jsx
 *
 * Main routing configuration for the MTM Platform.
 * Supports 5 roles: admin, moderator, organizer, member, user
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Public pages
import LandingPage from '../pages/public/LandingPage.jsx';
import SignIn from '../pages/public/SignIn.jsx';
import SignUp from '../pages/public/Signup.jsx';
import NotFound from '../pages/public/NotFound.jsx';

// Protected pages — role dashboards
import AdminDashboard from '../pages/protected/AdminDashboard.jsx';
import ModeratorDashboard from '../pages/protected/ModeratorDashboard.jsx';
import OrganizerDashboard from '../pages/protected/OrganizerDashboard.jsx';
import MemberDashboard from '../pages/protected/MemberDashboard.jsx';
import UserDashboard from '../pages/protected/UserDashboard.jsx';
import Profile from '../pages/protected/Profile.jsx';

import ProtectedRoute from './ProtectedRoute.jsx';

export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* ─── Public Routes ─── */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth/signin" element={<SignIn />} />
        <Route path="/auth/signup" element={<SignUp />} />

        {/* ─── Admin Routes ─── */}
        <Route
          path="/admin/dashboard"
          element={<ProtectedRoute component={AdminDashboard} requiredRole="admin" />}
        />
        {/* placeholder sub-routes — point back to dashboard for now */}
        <Route path="/admin/*" element={<ProtectedRoute component={AdminDashboard} requiredRole="admin" />} />

        {/* ─── Moderator Routes ─── */}
        <Route
          path="/moderator/dashboard"
          element={<ProtectedRoute component={ModeratorDashboard} requiredRole="moderator" />}
        />
        <Route path="/moderator/*" element={<ProtectedRoute component={ModeratorDashboard} requiredRole="moderator" />} />

        {/* ─── Organizer Routes ─── */}
        <Route
          path="/organizer/dashboard"
          element={<ProtectedRoute component={OrganizerDashboard} requiredRole="organizer" />}
        />
        <Route path="/organizer/*" element={<ProtectedRoute component={OrganizerDashboard} requiredRole="organizer" />} />

        {/* ─── Member Routes ─── */}
        <Route
          path="/member/dashboard"
          element={<ProtectedRoute component={MemberDashboard} requiredRole="member" />}
        />
        <Route path="/member/*" element={<ProtectedRoute component={MemberDashboard} requiredRole="member" />} />

        {/* ─── User Routes ─── */}
        <Route
          path="/user/dashboard"
          element={<ProtectedRoute component={UserDashboard} requiredRole="user" />}
        />
        <Route path="/user/*" element={<ProtectedRoute component={UserDashboard} requiredRole="user" />} />

        {/* ─── Shared Protected Routes ─── */}
        <Route path="/profile" element={<ProtectedRoute component={Profile} />} />

        {/* ─── Catch-all ─── */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
