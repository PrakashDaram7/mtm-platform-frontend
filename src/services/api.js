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
 * TODO: Add request interceptor
 * - Log requests
 * - Add authorization token from storage
 * - Add request timestamps
 */
// apiClient.interceptors.request.use((config) => { ... });

/**
 * TODO: Add response interceptor
 * - Log responses
 * - Handle 401 errors (token expired)
 * - Format error responses
 */
// apiClient.interceptors.response.use((response) => { ... }, (error) => { ... });

export default apiClient;
