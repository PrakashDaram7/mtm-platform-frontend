/**
 * AppRoutes.jsx
 * 
 * Main routing configuration for the application.
 * Demonstrates structure of public vs protected routes.
 * 
 * Students: This file ties everything together:
 * - Public routes: accessible to anyone
 * - Protected routes: only accessible if authenticated
 * - Wildcard route: catches undefined URLs
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from '../pages/public/LandingPage.jsx';
import SignIn from '../pages/public/SignIn.jsx';
import SignUp from '../pages/public/SignUp.jsx';
import NotFound from '../pages/public/NotFound.jsx';
import AdminDashboard from '../pages/protected/AdminDashboard.jsx';
import MemberDashboard from '../pages/protected/MemberDashboard.jsx';
import Profile from '../pages/protected/Profile.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';

export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth/signin" element={<SignIn />} />
        <Route path="/auth/signup" element={<SignUp />} />

        {/* Protected Routes */}
        <Route 
          path="/admin/dashboard" 
          element={<ProtectedRoute component={AdminDashboard} requiredRole="admin" />} 
        />
        <Route 
          path="/member/dashboard" 
          element={<ProtectedRoute component={MemberDashboard} requiredRole="member" />} 
        />
        <Route 
          path="/profile" 
          element={<ProtectedRoute component={Profile} />} 
        />

        {/* Catch-all Route for undefined paths */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

/**
 * TODO: Add more routes as needed
 * - /courses
 * - /students
 * - /settings
 * - /teacher/courses
 * - /admin/users
 */
