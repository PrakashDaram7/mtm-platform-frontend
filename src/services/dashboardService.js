/**
 * dashboardService.js
 * 
 * Handles all dashboard-related API calls (analytics, user management).
 */

import apiClient from './api.js';

/**
 * Get dashboard analytics
 * 
 * @returns {Promise} - Analytics data
 */
export const getDashboardAnalytics = async () => {
  try {
    const response = await apiClient.get('/admin/analytics');
    return response.data;
  } catch (error) {
    console.error('Get analytics error:', error);
    throw error;
  }
};

/**
 * Create a new user (admin only)
 * 
 * @param {object} userData - { full_name, email, phone, role_name }
 * @returns {Promise} - Created user
 */
export const createUser = async (userData) => {
  try {
    const response = await apiClient.post('/admin/users', userData);
    return response.data;
  } catch (error) {
    console.error('Create user error:', error);
    throw error;
  }
};

/**
 * Get users list with pagination
 * 
 * @param {number} skip - Records to skip
 * @param {number} limit - Records per page
 * @returns {Promise} - Users data
 */
export const getUsers = async (skip = 0, limit = 10) => {
  try {
    const response = await apiClient.get(`/admin/users?skip=${skip}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Get users error:', error);
    throw error;
  }
};

/**
 * Get user detail
 * 
 * @param {string} userId - User ID
 * @returns {Promise} - User detail data
 */
export const getUserDetail = async (userId) => {
  try {
    const response = await apiClient.get(`/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Get user detail error:', error);
    throw error;
  }
};

/**
 * Update user
 * 
 * @param {string} userId - User ID
 * @param {object} userData - Updated user data
 * @returns {Promise} - Updated user
 */
export const updateUser = async (userId, userData) => {
  try {
    const response = await apiClient.put(`/admin/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error('Update user error:', error);
    throw error;
  }
};

/**
 * Delete user
 * 
 * @param {string} userId - User ID
 * @returns {Promise} - Delete result
 */
export const deleteUser = async (userId) => {
  try {
    const response = await apiClient.delete(`/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Delete user error:', error);
    throw error;
  }
};

/**
 * Change user role
 * 
 * @param {string} userId - User ID
 * @param {string} roleName - New role name
 * @returns {Promise} - Updated user with new role
 */
export const changeUserRole = async (userId, roleName) => {
  try {
    const response = await apiClient.put(`/admin/users/${userId}/role`, {
      role_name: roleName
    });
    return response.data;
  } catch (error) {
    console.error('Change role error:', error);
    throw error;
  }
};

/**
 * Enable/Disable user
 * 
 * @param {string} userId - User ID
 * @param {string} action - 'enable' or 'disable'
 * @returns {Promise} - Updated user
 */
export const toggleUserStatus = async (userId, action) => {
  try {
    const response = await apiClient.post(`/admin/users/${userId}/${action}`);
    return response.data;
  } catch (error) {
    console.error(`${action} user error:`, error);
    throw error;
  }
};

/**
 * Search users
 * 
 * @param {string} query - Search query
 * @param {string} field - Field to search (email, full_name, phone)
 * @returns {Promise} - Matching users
 */
export const searchUsers = async (query, field = 'email') => {
  try {
    const response = await apiClient.get(`/admin/users/search?query=${query}&field=${field}`);
    return response.data;
  } catch (error) {
    console.error('Search users error:', error);
    throw error;
  }
};

/**
 * Get all roles
 * 
 * @returns {Promise} - List of roles
 */
export const getRoles = async () => {
  try {
    const response = await apiClient.get('/admin/roles');
    return response.data;
  } catch (error) {
    console.error('Get roles error:', error);
    throw error;
  }
};

/**
 * Create a new role
 * 
 * @param {string} roleName - Role name
 * @param {string} description - Role description (optional)
 * @returns {Promise} - Created role
 */
export const createRole = async (roleName, description = '') => {
  try {
    const response = await apiClient.post('/admin/roles', {
      role_name: roleName,
      description: description
    });
    return response.data;
  } catch (error) {
    console.error('Create role error:', error);
    throw error;
  }
};

/**
 * Update a role
 * 
 * @param {string} roleId - Role ID
 * @param {string} roleName - New role name (optional)
 * @param {string} description - New description (optional)
 * @returns {Promise} - Updated role
 */
export const updateRole = async (roleId, roleName = null, description = null) => {
  try {
    const payload = {};
    if (roleName) payload.role_name = roleName;
    if (description) payload.description = description;

    const response = await apiClient.put(`/admin/roles/${roleId}`, payload);
    return response.data;
  } catch (error) {
    console.error('Update role error:', error);
    throw error;
  }
};

/**
 * Delete a role
 * 
 * @param {string} roleId - Role ID
 * @returns {Promise} - Delete result
 */
export const deleteRole = async (roleId) => {
  try {
    const response = await apiClient.delete(`/admin/roles/${roleId}`);
    return response.data;
  } catch (error) {
    console.error('Delete role error:', error);
    throw error;
  }
};
