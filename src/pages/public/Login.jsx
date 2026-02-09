/**
 * Login.jsx
 * 
 * Public login page component.
 * Demonstrates how a React component calls authService.
 * 
 * Students: Trace the flow:
 * 1. User clicks "Login" button
 * 2. Component calls loginUser() from authService
 * 3. authService calls apiClient.post() from api.js
 * 4. apiClient uses BACKEND_BASE_URL from constants.jsx
 * 5. Response is logged to console
 * 
 * Notice: This component NEVER imports axios directly!
 */

import { loginUser } from '../../services/authService.js';

export default function Login() {
  const handleLoginClick = async () => {
    // TODO: Get email and password from form inputs
    const credentials = {
      email: 'student@example.com',
      password: 'password123',
    };

    try {
      console.log('Attempting to login...');
      const response = await loginUser(credentials);
      console.log('Login successful:', response);
      
      // TODO: Store token in storage or context
      // TODO: Redirect to dashboard or home page
    } catch (error) {
      console.error('Login failed:', error.message);
      // TODO: Show error message to user
    }
  };

  return (
    <div>
      <h1>Login Page</h1>
      <p>This is a public page - anyone can access it</p>
      
      <button onClick={handleLoginClick}>
        Click to Login (Check Console)
      </button>

      <nav>
        <a href="/">Back to Home</a>
      </nav>

      {/* TODO: Add email input field */}
      {/* TODO: Add password input field */}
      {/* TODO: Add form validation */}
      {/* TODO: Add loading state while request is in progress */}
      {/* TODO: Add error message display */}
    </div>
  );
}
