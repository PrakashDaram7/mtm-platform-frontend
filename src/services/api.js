/**
 * api.js
 * 
 * Centralized axios instance for all API requests.
 * This is the ONLY place where axios is configured.
 * 
 * Students: All services use this apiClient.
 * This makes it easy to add logging, auth headers, or error handling later.
 */

import axios from 'axios';
import { BACKEND_BASE_URL } from '../constants/constants.jsx';
import { storage } from '../utils/storage.js';

/**
 * Create a centralized axios instance
 */
const apiClient = axios.create({
  baseURL: BACKEND_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor - Add authorization token to all requests
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = storage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - Handle 401 errors (token expired)
 */
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired - clear storage and redirect to signin
      storage.clearTokens();
      window.location.href = '/auth/signin';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
