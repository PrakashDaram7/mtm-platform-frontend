/**
 * authService.js
 * 
 * Handles all authentication-related API calls.
 * Demonstrates how services use the centralized apiClient.
 * 
 * Students: Notice this service ONLY calls apiClient.
 * It doesn't know about axios, storage, or routing.
 */

import apiClient from './api.js';
import { AUTH_ENDPOINTS } from '../constants/constants.jsx';

/**
 * Login user with credentials
 * 
 * @param {object} credentials - { email, password }
 * @returns {Promise} - User data and token from server
 * 
 * TODO: Add input validation
 * TODO: Add error handling for specific error codes (401, 400, 500, etc.)
 */
export const loginUser = async (credentials) => {
  try {
    const response = await apiClient.post(AUTH_ENDPOINTS.LOGIN, credentials);
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Logout user
 * 
 * @returns {Promise} - Server response
 * 
 * TODO: Clear token from storage
 * TODO: Handle logout errors gracefully
 */
export const logoutUser = async () => {
  try {
    const response = await apiClient.post(AUTH_ENDPOINTS.LOGOUT);
    return response.data;
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

// TODO: Add more auth functions as needed
// export const registerUser = async (userData) => { ... };
// export const refreshToken = async () => { ... };
