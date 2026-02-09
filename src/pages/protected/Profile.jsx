/**
 * Profile.jsx
 * 
 * Protected profile page component.
 * Demonstrates how a protected page calls memberService.
 * 
 * Students: Notice this component structure is similar to Login.jsx,
 * but it calls memberService instead of authService.
 * Both follow the same pattern: Component → Service → Axios Client → Constants
 * 
 * This component NEVER imports axios directly!
 */

import { fetchMemberProfile } from '../../services/memberService.js';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const navigate = useNavigate();

  const handleFetchProfileClick = async () => {
    try {
      console.log('Fetching profile...');
      const profileData = await fetchMemberProfile();
      console.log('Profile data:', profileData);
      
      // TODO: Store profile data in state or context
      // TODO: Display profile information on the page
    } catch (error) {
      console.error('Failed to fetch profile:', error.message);
      // TODO: Show error message to user
    }
  };

  return (
    <div>
      <h1>User Profile</h1>
      <p>This is a protected page - only logged in users can see this</p>

      <button onClick={handleFetchProfileClick}>
        Fetch My Profile (Check Console)
      </button>

      <nav>
        <button onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
        <button onClick={() => navigate('/')}>
          Go to Home
        </button>
      </nav>

      {/* TODO: Display profile data here */}
      {/* TODO: Add edit profile functionality */}
      {/* TODO: Add profile picture upload */}
      {/* TODO: Add loading state while fetching */}
    </div>
  );
}
