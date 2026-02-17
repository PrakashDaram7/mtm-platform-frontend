/**
 * alerts.js
 * 
 * Centralized utility for SweetAlert2 notifications and loaders
 * Handles success, error, warning, and info alerts
 */

import Swal from 'sweetalert2';

/**
 * Show success alert
 * 
 * @param {string} title - Alert title
 * @param {string} message - Alert message (optional)
 * @param {function} onConfirm - Callback when confirmed (optional)
 */
export const showSuccessAlert = (title, message = '', onConfirm = null) => {
  Swal.fire({
    icon: 'success',
    title: title,
    text: message,
    confirmButtonColor: '#667eea',
    confirmButtonText: 'OK',
  }).then((result) => {
    if (result.isConfirmed && onConfirm) {
      onConfirm();
    }
  });
};

/**
 * Show error alert
 * 
 * @param {string} title - Alert title
 * @param {string} message - Alert message (optional)
 * @param {function} onConfirm - Callback when confirmed (optional)
 */
export const showErrorAlert = (title, message = '', onConfirm = null) => {
  Swal.fire({
    icon: 'error',
    title: title,
    text: message,
    confirmButtonColor: '#667eea',
    confirmButtonText: 'OK',
  }).then((result) => {
    if (result.isConfirmed && onConfirm) {
      onConfirm();
    }
  });
};

/**
 * Show warning alert
 * 
 * @param {string} title - Alert title
 * @param {string} message - Alert message (optional)
 */
export const showWarningAlert = (title, message = '') => {
  Swal.fire({
    icon: 'warning',
    title: title,
    text: message,
    confirmButtonColor: '#667eea',
    confirmButtonText: 'OK',
  });
};

/**
 * Show info alert
 * 
 * @param {string} title - Alert title
 * @param {string} message - Alert message (optional)
 */
export const showInfoAlert = (title, message = '') => {
  Swal.fire({
    icon: 'info',
    title: title,
    text: message,
    confirmButtonColor: '#667eea',
    confirmButtonText: 'OK',
  });
};

/**
 * Show confirmation dialog with Yes/No buttons
 * 
 * @param {string} title - Dialog title
 * @param {string} message - Dialog message
 * @param {string} confirmText - Confirm button text (default: 'Yes')
 * @param {string} cancelText - Cancel button text (default: 'No')
 * @returns {Promise<boolean>} - true if confirmed, false if cancelled
 */
export const showConfirmDialog = (
  title,
  message,
  confirmText = 'Yes',
  cancelText = 'No'
) => {
  return Swal.fire({
    icon: 'question',
    title: title,
    text: message,
    showCancelButton: true,
    confirmButtonColor: '#667eea',
    cancelButtonColor: '#ddd',
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
  }).then((result) => result.isConfirmed);
};

/**
 * Show loading spinner
 * 
 * @param {string} title - Loading title (default: 'Loading...')
 * @param {string} message - Loading message (optional)
 */
export const showLoader = (title = 'Loading...', message = '') => {
  Swal.fire({
    title: title,
    html: message,
    icon: 'info',
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: async () => {
      await Swal.showLoading();
    },
  });
};

/**
 * Hide the loader/current alert
 */
export const hideLoader = () => {
  Swal.close();
};

/**
 * Show generic alert (auto-detects icon based on type)
 * 
 * @param {string} type - Alert type: 'success', 'error', 'warning', 'info', 'question'
 * @param {string} title - Alert title
 * @param {string} message - Alert message (optional)
 * @param {function} onConfirm - Callback when confirmed (optional)
 */
export const showAlert = (type = 'info', title, message = '', onConfirm = null) => {
  switch (type) {
    case 'success':
      return showSuccessAlert(title, message, onConfirm);
    case 'error':
      return showErrorAlert(title, message, onConfirm);
    case 'warning':
      return showWarningAlert(title, message);
    case 'question':
      return showConfirmDialog(title, message);
    case 'info':
    default:
      return showInfoAlert(title, message);
  }
};

/**
 * Toast notification (small, non-intrusive)
 * 
 * @param {string} type - Alert type: 'success', 'error', 'warning', 'info'
 * @param {string} message - Toast message
 * @param {number} timer - Auto-close timer in milliseconds (default: 3000)
 */
export const showToast = (type = 'info', message, timer = 3000) => {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: timer,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
  });

  Toast.fire({
    icon: type,
    title: message,
  });
};

/**
 * Handle API errors and show appropriate alert
 * 
 * @param {Error} error - The error object
 * @param {string} defaultMessage - Default message if error message not available
 */
export const handleError = (error, defaultMessage = 'Something went wrong') => {
  let errorMessage = defaultMessage;

  if (error.response?.data?.message) {
    errorMessage = error.response.data.message;
  } else if (error.response?.data?.detail) {
    errorMessage = error.response.data.detail;
  } else if (error.message) {
    errorMessage = error.message;
  }

  showErrorAlert('Error', errorMessage);
};

/**
 * Handle API success and show alert
 * 
 * @param {Object} response - API response object
 * @param {string} defaultMessage - Default message if response message not available
 * @param {function} onConfirm - Callback on confirmation
 */
export const handleSuccess = (response, defaultMessage = 'Success!', onConfirm = null) => {
  const successMessage = response.message || defaultMessage;
  showSuccessAlert('Success', successMessage, onConfirm);
};
