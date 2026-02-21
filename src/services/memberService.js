/**
 * memberService.js
 *
 * Sprint 2 — Full membership service covering:
 *   - Profile management
 *   - Membership status, application, renewal
 *   - Self-service status check (public)
 *   - Membership plans (public listing)
 */

import apiClient from './api.js';

// ─── Plans ────────────────────────────────────────────────────────────────

/**
 * Fetch all active membership plans (public — shown on application wizard)
 */
export const fetchMembershipPlans = async () => {
  try {
    const response = await apiClient.get('/members/plans?active_only=true');
    return response.data;
  } catch (error) {
    console.error('Fetch plans error:', error);
    throw error;
  }
};

// ─── Profile ──────────────────────────────────────────────────────────────

/**
 * Fetch current user's full profile (includes membership)
 */
export const fetchMemberProfile = async () => {
  try {
    const response = await apiClient.get('/members/profile');
    return response.data;
  } catch (error) {
    console.error('Fetch profile error:', error);
    throw error;
  }
};

/**
 * Update member profile fields
 * @param {object} profileData - Fields to update
 */
export const updateMemberProfile = async (profileData) => {
  try {
    const response = await apiClient.put('/members/profile', profileData);
    return response.data;
  } catch (error) {
    console.error('Update profile error:', error);
    throw error;
  }
};

// ─── Membership ───────────────────────────────────────────────────────────

/**
 * Get the current user's own membership record
 */
export const fetchMyMembership = async () => {
  try {
    const response = await apiClient.get('/members/my-membership');
    return response.data;
  } catch (error) {
    console.error('Fetch membership error:', error);
    throw error;
  }
};

/**
 * Apply for a membership (creates pending application)
 * @param {string} planId - Membership plan UUID
 * @param {string} membershipType - 'individual' | 'family'
 */
export const applyForMembership = async (planId, membershipType = 'individual') => {
  try {
    const response = await apiClient.post('/members/apply', {
      plan_id: planId,
      membership_type: membershipType,
    });
    return response.data;
  } catch (error) {
    console.error('Apply membership error:', error);
    throw error;
  }
};

/**
 * Renew existing membership, optionally switching plan
 * @param {string|null} planId - New plan UUID, or null to keep current
 */
export const renewMembership = async (planId = null) => {
  try {
    const payload = planId ? { plan_id: planId } : {};
    const response = await apiClient.post('/members/renew', payload);
    return response.data;
  } catch (error) {
    console.error('Renew membership error:', error);
    throw error;
  }
};

/**
 * Public self-service status check — no auth required
 * @param {string} identifier - Membership number, email, or phone
 */
export const checkMembershipStatus = async (identifier) => {
  try {
    const response = await apiClient.get(`/members/status/${encodeURIComponent(identifier)}`);
    return response.data;
  } catch (error) {
    console.error('Status check error:', error);
    throw error;
  }
};

// ─── Notifications ────────────────────────────────────────────────────────

/**
 * Fetch the current user's notifications
 */
export const fetchNotifications = async () => {
  try {
    const response = await apiClient.get('/members/notifications');
    return response.data;
  } catch (error) {
    console.error('Fetch notifications error:', error);
    throw error;
  }
};

/**
 * Mark a notification as read
 * @param {string} notificationId
 */
export const markNotificationRead = async (notificationId) => {
  try {
    const response = await apiClient.put(`/members/notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    console.error('Mark read error:', error);
    throw error;
  }
};

// ─── Payments ─────────────────────────────────────────────────────────────

/**
 * Fetch the current user's payment history
 */
export const fetchPaymentHistory = async () => {
  try {
    const response = await apiClient.get('/members/payments');
    return response.data;
  } catch (error) {
    console.error('Fetch payments error:', error);
    throw error;
  }
};

// ─── Admin: Settings ─────────────────────────────────────────────────────

/**
 * Admin: get all platform settings
 */
export const fetchPlatformSettings = async () => {
  try {
    const response = await apiClient.get('/members/admin/settings');
    return response.data;
  } catch (error) {
    console.error('Fetch settings error:', error);
    throw error;
  }
};

/**
 * Admin: update a platform setting
 * @param {string} key
 * @param {string} value
 */
export const updatePlatformSetting = async (key, value) => {
  try {
    const response = await apiClient.put(`/members/admin/settings/${key}`, { value: String(value) });
    return response.data;
  } catch (error) {
    console.error('Update setting error:', error);
    throw error;
  }
};

// ─── Admin: Membership management ────────────────────────────────────────

/**
 * Admin: list all memberships
 * @param {{ status?, search?, skip?, limit? }} filters
 */
export const adminListMemberships = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    if (filters.skip) params.append('skip', filters.skip);
    if (filters.limit) params.append('limit', filters.limit);
    const response = await apiClient.get(`/members/admin/all?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Admin list memberships error:', error);
    throw error;
  }
};

/**
 * Admin: membership stats
 */
export const adminMembershipStats = async () => {
  try {
    const response = await apiClient.get('/members/admin/stats');
    return response.data;
  } catch (error) {
    console.error('Admin stats error:', error);
    throw error;
  }
};

/**
 * Admin: approve a pending membership
 * @param {string} membershipId
 * @param {string} notes - Optional admin notes
 */
export const adminApproveMembership = async (membershipId, notes = '') => {
  try {
    const response = await apiClient.post(`/members/admin/${membershipId}/approve`, { notes });
    return response.data;
  } catch (error) {
    console.error('Admin approve error:', error);
    throw error;
  }
};

/**
 * Admin: reject a pending membership
 * @param {string} membershipId
 * @param {string} reason - Required rejection reason
 */
export const adminRejectMembership = async (membershipId, reason) => {
  try {
    const response = await apiClient.post(`/members/admin/${membershipId}/reject`, { reason });
    return response.data;
  } catch (error) {
    console.error('Admin reject error:', error);
    throw error;
  }
};

/**
 * Admin: extend a membership by N months
 * @param {string} membershipId
 * @param {number} extendMonths
 * @param {string} reason
 */
export const adminExtendMembership = async (membershipId, extendMonths, reason = '') => {
  try {
    const response = await apiClient.post(`/members/admin/${membershipId}/extend`, {
      extend_months: extendMonths,
      reason,
    });
    return response.data;
  } catch (error) {
    console.error('Admin extend error:', error);
    throw error;
  }
};

/**
 * Admin: block a membership
 * @param {string} membershipId
 * @param {string} reason
 */
export const adminBlockMembership = async (membershipId, reason) => {
  try {
    const response = await apiClient.post(`/members/admin/${membershipId}/block`, { reason });
    return response.data;
  } catch (error) {
    console.error('Admin block error:', error);
    throw error;
  }
};

/**
 * Admin: unblock a membership
 * @param {string} membershipId
 */
export const adminUnblockMembership = async (membershipId) => {
  try {
    const response = await apiClient.post(`/members/admin/${membershipId}/unblock`);
    return response.data;
  } catch (error) {
    console.error('Admin unblock error:', error);
    throw error;
  }
};

// ─── Admin: Membership Plans ──────────────────────────────────────────────

/**
 * Admin: list all plans (including inactive)
 */
export const adminListPlans = async () => {
  try {
    const response = await apiClient.get('/members/admin/plans');
    return response.data;
  } catch (error) {
    console.error('Admin list plans error:', error);
    throw error;
  }
};

/**
 * Admin: create a membership plan
 * @param {object} planData
 */
export const adminCreatePlan = async (planData) => {
  try {
    const response = await apiClient.post('/members/admin/plans', planData);
    return response.data;
  } catch (error) {
    console.error('Admin create plan error:', error);
    throw error;
  }
};

/**
 * Admin: update a membership plan
 * @param {string} planId
 * @param {object} planData
 */
export const adminUpdatePlan = async (planId, planData) => {
  try {
    const response = await apiClient.put(`/members/admin/plans/${planId}`, planData);
    return response.data;
  } catch (error) {
    console.error('Admin update plan error:', error);
    throw error;
  }
};

/**
 * Admin: delete a membership plan
 * @param {string} planId
 */
export const adminDeletePlan = async (planId) => {
  try {
    const response = await apiClient.delete(`/members/admin/plans/${planId}`);
    return response.data;
  } catch (error) {
    console.error('Admin delete plan error:', error);
    throw error;
  }
};

// ─── Admin: CSV Migration ─────────────────────────────────────────────────

/**
 * Admin: preview CSV import
 * @param {string} csvContent - Raw CSV string
 * @param {object} columnMap - { csvColumn: modelField }
 */
export const previewCsvImport = async (csvContent, columnMap) => {
  try {
    const response = await apiClient.post('/members/admin/import/preview', {
      csv_content: csvContent,
      column_map: columnMap,
    });
    return response.data;
  } catch (error) {
    console.error('CSV preview error:', error);
    throw error;
  }
};

/**
 * Admin: execute CSV import
 * @param {string} csvContent
 * @param {object} columnMap
 * @param {string|null} defaultPlanId
 */
export const executeCsvImport = async (csvContent, columnMap, defaultPlanId = null) => {
  try {
    const response = await apiClient.post('/members/admin/import/execute', {
      csv_content: csvContent,
      column_map: columnMap,
      default_plan_id: defaultPlanId,
    });
    return response.data;
  } catch (error) {
    console.error('CSV import error:', error);
    throw error;
  }
};
