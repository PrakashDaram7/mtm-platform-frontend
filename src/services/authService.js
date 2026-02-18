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

/**
 * Send OTP to email or phone
 * 
 * @param {object} payload - { email: string } or { phone: string, country_code: string }
 * @returns {Promise} - OTP expiry time and identifier
 */
export const sendOTP = async (payload) => {
  try {
    const response = await apiClient.post(AUTH_ENDPOINTS.SEND_OTP, payload);
    return response.data;
  } catch (error) {
    console.error('Send OTP error:', error);
    throw error;
  }
};

/**
 * Send OTP for signup (new user)
 * 
 * @param {object} payload - { email: string, otp_type: string }
 * @returns {Promise} - OTP expiry time and account_exists flag
 */
export const sendSignupOTP = async (payload) => {
  try {
    const response = await apiClient.post(AUTH_ENDPOINTS.SIGNUP_SEND_OTP, payload);
    return response.data;
  } catch (error) {
    console.error('Send Signup OTP error:', error);
    throw error;
  }
};

/**
 * Verify OTP and get authentication tokens
 * 
 * @param {object} payload - { identifier: string, otp: string }
 * @returns {Promise} - User data and JWT tokens
 */
export const verifyOTP = async (payload) => {
  try {
    console.log('📤 Calling verify-otp endpoint with payload:', {
      email: payload.email,
      otp: payload.otp,
      has_full_name: !!payload.full_name,
      has_password: !!payload.password
    });
    
    const response = await apiClient.post(AUTH_ENDPOINTS.VERIFY_OTP, payload);
    
    console.log('📥 Verify OTP raw response:', response);
    console.log('📥 Verify OTP response.data:', response.data);
    
    if (!response.data) {
      throw new Error('Empty response from server');
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ Verify OTP error:', error);
    console.error('Error response:', error.response?.data);
    throw error;
  }
};

/**
 * Resend OTP
 * 
 * @param {object} payload - { identifier: string }
 * @returns {Promise} - New OTP expiry time
 */
export const resendOTP = async (payload) => {
  try {
    const response = await apiClient.post(AUTH_ENDPOINTS.RESEND_OTP, payload);
    return response.data;
  } catch (error) {
    console.error('Resend OTP error:', error);
    throw error;
  }
};
