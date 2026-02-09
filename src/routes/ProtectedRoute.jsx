/**
 * ProtectedRoute.jsx
 * 
 * Wrapper component that protects routes requiring authentication.
 * Currently uses a hardcoded isAuthenticated variable.
 * 
 * Students: This demonstrates route protection structure.
 * In production, isAuthenticated would come from context or state,
 * checking if a valid token exists in storage.
 */

import { Navigate } from 'react-router-dom';

/**
 * ProtectedRoute component
 * 
 * @param {object} props - Route props
 * @param {React.Component} props.component - Component to render if authenticated
 * @returns {React.Component} - Either the protected component or redirect to login
 * 
 * TODO: Replace hardcoded isAuthenticated with real auth check
 * TODO: Check for valid token in localStorage
 * TODO: Add loading state while checking authentication
 * TODO: Add logic to refresh token if expired
 */
export default function ProtectedRoute({ component: Component, ...rest }) {
  // HARDCODED for learning purposes - replace with real auth logic
  const isAuthenticated = false;

  // TODO: Real implementation would be:
  // const token = getFromStorage(STORAGE_KEYS.AUTH_TOKEN);
  // const isAuthenticated = !!token && isTokenValid(token);

  if (!isAuthenticated) {
    console.log('User not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  return <Component {...rest} />;
}
