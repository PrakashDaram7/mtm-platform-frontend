/**
 * ProtectedRoute.jsx
 * 
 * Wrapper component that protects routes requiring authentication and handles role-based access.
 */

import { Navigate } from 'react-router-dom';
import { storage } from '../utils/storage';

/**
 * ProtectedRoute component
 * 
 * @param {object} props - Route props
 * @param {React.Component} props.component - Component to render if authenticated
 * @param {string} props.requiredRole - Required role (optional)
 * @returns {React.Component} - Protected component or redirect
 */
export default function ProtectedRoute({ 
  component: Component, 
  requiredRole = null,
  ...rest 
}) {
  // Check if user has valid token
  const accessToken = storage.getAccessToken();
  const userRole = storage.getUserRole();

  // Not authenticated - redirect to signin
  if (!accessToken) {
    console.log('No access token found, redirecting to signin');
    return <Navigate to="/auth/signin" replace />;
  }

  // Authenticated but required role check failed
  if (requiredRole && userRole !== requiredRole) {
    console.log(`User role '${userRole}' does not match required role '${requiredRole}'`);
    
    // Redirect to appropriate dashboard based on actual role
    if (userRole === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (userRole === 'member') {
      return <Navigate to="/member/dashboard" replace />;
    }
    
    return <Navigate to="/auth/signin" replace />;
  }

  // All checks passed - render component
  return <Component {...rest} />;
}
