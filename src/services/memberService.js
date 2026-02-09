/**
 * memberService.js
 * 
 * Handles all member/user profile-related API calls.
 * Demonstrates the same pattern as authService.js with different endpoints.
 * 
 * Students: Compare with authService.js - same structure, different endpoints.
 */

import apiClient from './api.js';
import { MEMBER_ENDPOINTS } from '../constants/constants.jsx';

/**
 * Fetch current user's profile
 * 
 * @returns {Promise} - User profile data from server
 * 
 * TODO: Add caching to avoid repeated requests
 * TODO: Handle 401 errors (unauthorized)
 */
export const fetchMemberProfile = async () => {
  try {
    const response = await apiClient.get(MEMBER_ENDPOINTS.PROFILE);
    return response.data;
  } catch (error) {
    console.error('Fetch profile error:', error);
    throw error;
  }
};

/**
 * Update member profile
 * 
 * @param {object} profileData - Updated user information
 * @returns {Promise} - Updated profile from server
 * 
 * TODO: Add validation before sending to backend
 * TODO: Add optimistic UI updates
 */
export const updateMemberProfile = async (profileData) => {
  try {
    const response = await apiClient.put(MEMBER_ENDPOINTS.UPDATE_PROFILE, profileData);
    return response.data;
  } catch (error) {
    console.error('Update profile error:', error);
    throw error;
  }
};

// TODO: Add more member functions as needed
// export const deleteMemberAccount = async () => { ... };
// export const uploadProfilePicture = async (file) => { ... };
