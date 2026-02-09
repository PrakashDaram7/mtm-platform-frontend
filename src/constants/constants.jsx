/**
 * constants.jsx
 * 
 * Centralized configuration for backend URLs and API endpoints.
 * Contains ONLY constant values - NO logic, NO imports, NO axios.
 * 
 * Students: This file defines WHERE to send requests, not HOW to send them.
 */

// Backend base URL - change this when connecting to real backend
export const BACKEND_BASE_URL = 'http://localhost:8000/api';

/**
 * Authentication API endpoints
 */
export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  // TODO: Add REFRESH_TOKEN, REGISTER, FORGOT_PASSWORD when needed
};

/**
 * Member/User API endpoints
 */
export const MEMBER_ENDPOINTS = {
  PROFILE: '/members/profile',
  UPDATE_PROFILE: '/members/profile',
  // TODO: Add more member endpoints when needed
};

// TODO: Add more endpoint groups as needed
// export const COURSE_ENDPOINTS = { ... };
// export const STUDENT_ENDPOINTS = { ... };
