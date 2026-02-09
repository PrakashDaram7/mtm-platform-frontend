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
import Home from '../pages/public/Home.jsx';
import Login from '../pages/public/Login.jsx';
import NotFound from '../pages/public/NotFound.jsx';
import Dashboard from '../pages/protected/Dashboard.jsx';
import Profile from '../pages/protected/Profile.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';

export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route 
          path="/dashboard" 
          element={<ProtectedRoute component={Dashboard} />} 
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
