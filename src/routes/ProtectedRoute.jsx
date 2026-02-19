/**
 * ProtectedRoute.jsx
 *
 * Wrapper component that protects routes requiring authentication and handles role-based access.
 * Supports all 5 roles: admin, moderator, organizer, member, user
 */

import { Navigate } from 'react-router-dom';
import { storage } from '../utils/storage';

// Map each role to its home dashboard path
const ROLE_DASHBOARD = {
  admin: '/admin/dashboard',
  moderator: '/moderator/dashboard',
  organizer: '/organizer/dashboard',
  member: '/member/dashboard',
  user: '/user/dashboard',
};

export default function ProtectedRoute({
  component: Component,
  requiredRole = null,
  ...rest
}) {
  const accessToken = storage.getAccessToken();
  const userRole = storage.getUserRole();

  // Not authenticated — send to sign in
  if (!accessToken) {
    console.log('No access token found, redirecting to signin');
    return <Navigate to="/auth/signin" replace />;
  }

  // Role check failed
  if (requiredRole && userRole !== requiredRole) {
    console.log(`User role '${userRole}' does not match required role '${requiredRole}'`);

    // Redirect to their correct dashboard
    const dashboardPath = ROLE_DASHBOARD[userRole];
    if (dashboardPath) {
      return <Navigate to={dashboardPath} replace />;
    }

    return <Navigate to="/auth/signin" replace />;
  }

  // All checks passed — render component
  return <Component {...rest} />;
}
