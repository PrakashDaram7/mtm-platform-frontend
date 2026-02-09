/**
 * Dashboard.jsx
 * 
 * Protected dashboard page component.
 * Only accessible to authenticated users.
 * 
 * Students: This page demonstrates how protected routes work.
 * If not authenticated, user is redirected to /login by ProtectedRoute.
 */

import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // TODO: Call logoutUser() from authService
    // TODO: Clear token from storage
    // TODO: Redirect to login
    console.log('Logout clicked');
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <p>This is a protected page - only logged in users can see this</p>

      <nav>
        <button onClick={() => navigate('/profile')}>
          Go to Profile
        </button>
        <button onClick={() => navigate('/')}>
          Go to Home
        </button>
        <button onClick={handleLogout}>
          Logout
        </button>
      </nav>

      {/* TODO: Add user welcome message */}
      {/* TODO: Add dashboard widgets */}
      {/* TODO: Add loading state for data */}
    </div>
  );
}
