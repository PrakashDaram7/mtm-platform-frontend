/**
 * storage.js
 * 
 * Utility functions for browser storage (localStorage, sessionStorage).
 * Centralized storage access to keep components clean.
 * 
 * Students: Use these functions instead of directly accessing localStorage.
 */

// Keys for stored data
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  // TODO: Add more storage keys as needed
};

/**
 * Save data to localStorage
 * 
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 */
export const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving to storage [${key}]:`, error);
  }
};

/**
 * Get data from localStorage
 * 
 * @param {string} key - Storage key
 * @returns {any} - Stored value or null if not found
 */
export const getFromStorage = (key) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error reading from storage [${key}]:`, error);
    return null;
  }
};

/**
 * Remove data from localStorage
 * 
 * @param {string} key - Storage key
 */
export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from storage [${key}]:`, error);
  }
};

/**
 * Clear all stored data
 */
export const clearStorage = () => {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
};

// TODO: Add sessionStorage functions if needed
