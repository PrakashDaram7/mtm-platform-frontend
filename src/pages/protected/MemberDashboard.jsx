import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../../utils/storage';

const MemberDashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user data from localStorage (set during login)
    try {
      const accessToken = storage.getAccessToken();
      if (!accessToken) {
        navigate('/auth/signin');
        return;
      }
      
      // Parse user info from token (in real app, fetch from backend)
      // For now, we'll show basic member interface
      setUserData({
        email: 'member@example.com',
        full_name: 'Member User',
        role: 'member'
      });
      setLoading(false);
    } catch (err) {
      console.error(err);
      navigate('/auth/signin');
    }
  }, [navigate]);

  if (loading) {
    return <div className="dashboard"><div className="loading">Loading...</div></div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-top">
          <div>
            <h1>Member Dashboard</h1>
            <p className="subtitle">Welcome to your personal dashboard</p>
          </div>
          <button className="btn-logout" onClick={() => {
            storage.clearTokens();
            navigate('/');
          }}>Logout</button>
        </div>
      </div>

      {/* Welcome Section */}
      <div className="member-welcome">
        <div className="welcome-card">
          <h2>Welcome, {userData?.full_name || 'Member'}! 👋</h2>
          <p>You have access to member-only features</p>
        </div>
      </div>

      {/* Member Features */}
      <div className="member-features">
        <div className="feature-card">
          <div className="feature-icon">👤</div>
          <h3>Profile</h3>
          <p>View and update your profile information</p>
          <button onClick={() => navigate('/profile')}>Go to Profile</button>
        </div>

        <div className="feature-card">
          <div className="feature-icon">⚙️</div>
          <h3>Settings</h3>
          <p>Manage your account settings and preferences</p>
          <button>View Settings</button>
        </div>

        <div className="feature-card">
          <div className="feature-icon">📊</div>
          <h3>Activity</h3>
          <p>Track your account activity and login history</p>
          <button>View Activity</button>
        </div>

        <div className="feature-card">
          <div className="feature-icon">🔐</div>
          <h3>Security</h3>
          <p>Manage security settings and two-factor authentication</p>
          <button>Security Center</button>
        </div>
      </div>

      {/* Account Info Section */}
      <div className="account-section">
        <h3>Account Information</h3>
        <div className="info-grid">
          <div className="info-card">
            <label>Email Address</label>
            <p>{userData?.email}</p>
          </div>
          <div className="info-card">
            <label>Full Name</label>
            <p>{userData?.full_name}</p>
          </div>
          <div className="info-card">
            <label>Account Type</label>
            <p className="capitalize">{userData?.role}</p>
          </div>
          <div className="info-card">
            <label>Account Status</label>
            <p>Active</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;
