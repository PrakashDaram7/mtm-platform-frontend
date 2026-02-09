/**
 * NotFound.jsx
 * 
 * Fallback page for undefined routes.
 * Shown when user navigates to a non-existent URL.
 * 
 * Students: This is a catch-all page using wildcard routing (*).
 */

import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div>
      <h1>404 - Page Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
      
      <button onClick={() => navigate('/')}>
        Go to Home
      </button>

      {/* TODO: Add more navigation links */}
      {/* TODO: Add error tracking/logging */}
    </div>
  );
}
