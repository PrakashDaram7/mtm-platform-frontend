/**
 * ProtectedRoute.jsx
 *
 * Wrapper component that protects routes requiring authentication and handles role-based access.
 * Supports PRD roles: admin, finance_admin, event_manager, committee_member, moderator, member, volunteer
 *
 * PRD Section 3.2:
 *   - Admin: full access (can access ALL routes)
 *   - Each other role: restricted to their designated routes only
 *
 * If a user tries to access a route they don't have permission for,
 * they see an Access Denied page (not a silent redirect).
 */

import { Navigate } from 'react-router-dom';
import { storage } from '../utils/storage';
import AccessDenied from '../pages/public/AccessDenied';

export default function ProtectedRoute({
  component: Component,
  requiredRole = null,
  allowedRoles = null,
  ...rest
}) {
  const accessToken = storage.getAccessToken();
  const userRole = storage.getUserRole();

  // Not authenticated — send to sign in
  if (!accessToken) {
    return <Navigate to="/auth/signin" replace />;
  }

  // PRD 3.2: Admin has full access — bypass all role checks
  if (userRole === 'admin') {
    return <Component {...rest} />;
  }

  // Check against allowedRoles array (multiple roles allowed)
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <AccessDenied />;
  }

  // Check against single requiredRole
  if (requiredRole && userRole !== requiredRole) {
    return <AccessDenied />;
  }

  // All checks passed — render component
  return <Component {...rest} />;
}
