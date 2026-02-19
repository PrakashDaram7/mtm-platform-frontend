/**
 * eventService.js — API calls for events and registrations.
 */

import apiClient from './api';

// ─── Events ─────────────────────────────

export const getPublishedEvents = async (params = {}) => {
    const response = await apiClient.get('/events/', { params });
    return response.data;
};

export const getAllEvents = async (params = {}) => {
    const response = await apiClient.get('/events/manage/all', { params });
    return response.data;
};

export const getEventById = async (eventId) => {
    const response = await apiClient.get(`/events/${eventId}`);
    return response.data;
};

export const createEvent = async (eventData) => {
    const response = await apiClient.post('/events/', eventData);
    return response.data;
};

export const updateEvent = async (eventId, eventData) => {
    const response = await apiClient.put(`/events/${eventId}`, eventData);
    return response.data;
};

export const deleteEvent = async (eventId) => {
    const response = await apiClient.delete(`/events/${eventId}`);
    return response.data;
};

// ─── Registrations ──────────────────────

export const registerForEvent = async (eventId, notes = '') => {
    const response = await apiClient.post('/events/register', { event_id: eventId, notes });
    return response.data;
};

export const getEventRegistrations = async (eventId) => {
    const response = await apiClient.get(`/events/${eventId}/registrations`);
    return response.data;
};

export const getMyRegistrations = async () => {
    const response = await apiClient.get('/events/my/registrations');
    return response.data;
};

// ─── Members ────────────────────────────

export const getProfile = async () => {
    const response = await apiClient.get('/members/profile');
    return response.data;
};

export const updateProfile = async (data) => {
    const response = await apiClient.put('/members/profile', data);
    return response.data;
};

export const getMembershipPlans = async () => {
    const response = await apiClient.get('/members/plans');
    return response.data;
};

export const subscribeToPlan = async (planId) => {
    const response = await apiClient.post('/members/subscribe', { plan_id: planId });
    return response.data;
};

export const getNotifications = async () => {
    const response = await apiClient.get('/members/notifications');
    return response.data;
};

export const markNotificationRead = async (notificationId) => {
    const response = await apiClient.put(`/members/notifications/${notificationId}/read`);
    return response.data;
};

export const getPaymentHistory = async () => {
    const response = await apiClient.get('/members/payments');
    return response.data;
};
