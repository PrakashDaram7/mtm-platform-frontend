import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { storage } from '../utils/storage';
import { showConfirmDialog } from '../utils/alerts';

// Role-based sidebar navigation config
const ROLE_NAV = {
  admin: {
    label: 'Administrator',
    color: '#A78BFA',
    sections: [
      {
        title: 'Dashboard',
        items: [
          { icon: '🏠', label: 'Overview', path: '/admin/dashboard' },
        ]
      },
      {
        title: 'Management',
        items: [
          { icon: '👥', label: 'User Management', path: '/admin/users' },
          { icon: '🔑', label: 'Role Management', path: '/admin/roles' },
          { icon: '🛡️', label: 'Permissions', path: '/admin/permissions' },
        ]
      },
      {
        title: 'Platform',
        items: [
          { icon: '📅', label: 'Events', path: '/admin/events' },
          { icon: '📣', label: 'Announcements', path: '/admin/announcements' },
          { icon: '💳', label: 'Payments', path: '/admin/payments' },
          { icon: '📊', label: 'Analytics', path: '/admin/analytics' },
        ]
      },
      {
        title: 'System',
        items: [
          { icon: '⚙️', label: 'Settings', path: '/admin/settings' },
          { icon: '📋', label: 'Audit Logs', path: '/admin/logs' },
        ]
      }
    ]
  },
  moderator: {
    label: 'Moderator',
    color: '#60A5FA',
    sections: [
      {
        title: 'Dashboard',
        items: [
          { icon: '🏠', label: 'Overview', path: '/moderator/dashboard' },
        ]
      },
      {
        title: 'Content',
        items: [
          { icon: '💬', label: 'Forums', path: '/moderator/forums' },
          { icon: '🚩', label: 'Reports', path: '/moderator/reports', badge: 3 },
          { icon: '📝', label: 'Content Review', path: '/moderator/content' },
          { icon: '👤', label: 'User Reports', path: '/moderator/user-reports' },
        ]
      },
      {
        title: 'Community',
        items: [
          { icon: '📣', label: 'Announcements', path: '/moderator/announcements' },
          { icon: '🏷️', label: 'Tags & Categories', path: '/moderator/tags' },
        ]
      }
    ]
  },
  organizer: {
    label: 'Organizer',
    color: '#FCD34D',
    sections: [
      {
        title: 'Dashboard',
        items: [
          { icon: '🏠', label: 'Overview', path: '/organizer/dashboard' },
        ]
      },
      {
        title: 'Events',
        items: [
          { icon: '📅', label: 'My Events', path: '/organizer/events' },
          { icon: '➕', label: 'Create Event', path: '/organizer/events/create' },
          { icon: '🎫', label: 'Registrations', path: '/organizer/registrations' },
          { icon: '✉️', label: 'Invitations', path: '/organizer/invitations' },
        ]
      },
      {
        title: 'Insights',
        items: [
          { icon: '📊', label: 'Event Analytics', path: '/organizer/analytics' },
          { icon: '💳', label: 'Revenue', path: '/organizer/revenue' },
        ]
      }
    ]
  },
  member: {
    label: 'Member',
    color: '#6EE7B7',
    sections: [
      {
        title: 'Dashboard',
        items: [
          { icon: '🏠', label: 'Overview', path: '/member/dashboard' },
        ]
      },
      {
        title: 'My Account',
        items: [
          { icon: '👤', label: 'Profile', path: '/member/profile' },
          { icon: '🪪', label: 'Membership Card', path: '/member/card' },
          { icon: '🔔', label: 'Notifications', path: '/member/notifications', badge: 2 },
        ]
      },
      {
        title: 'Community',
        items: [
          { icon: '📅', label: 'Events', path: '/member/events' },
          { icon: '💬', label: 'Forums', path: '/member/forums' },
          { icon: '📚', label: 'Resources', path: '/member/resources' },
        ]
      },
      {
        title: 'Financials',
        items: [
          { icon: '💳', label: 'My Payments', path: '/member/payments' },
          { icon: '🧾', label: 'Receipts', path: '/member/receipts' },
        ]
      }
    ]
  },
  user: {
    label: 'User',
    color: '#9CA3AF',
    sections: [
      {
        title: 'Dashboard',
        items: [
          { icon: '🏠', label: 'Home', path: '/user/dashboard' },
        ]
      },
      {
        title: 'My Account',
        items: [
          { icon: '👤', label: 'Profile', path: '/user/profile' },
          { icon: '🔔', label: 'Notifications', path: '/user/notifications' },
        ]
      },
      {
        title: 'Explore',
        items: [
          { icon: '📅', label: 'Events', path: '/user/events' },
          { icon: '🪙', label: 'Membership', path: '/user/membership' },
          { icon: '📚', label: 'Resources', path: '/user/resources' },
        ]
      }
    ]
  }
};

const Layout = ({ children, pageTitle = 'Dashboard', pageSubtitle = '' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const userData = storage.getUserData();
  const userRole = storage.getUserRole() || 'user';

  const navConfig = ROLE_NAV[userRole] || ROLE_NAV.user;

  const displayName = userData?.full_name || userData?.name || 'User';
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const handleLogout = async () => {
    const confirmed = await showConfirmDialog(
      'Sign Out',
      'Are you sure you want to sign out of your account?',
      'Sign Out',
      'Cancel'
    );
    if (confirmed) {
      storage.clearTokens();
      navigate('/auth/signin', { replace: true });
    }
  };

  return (
    <div className="app-layout">
      {/* Sidebar Backdrop (mobile) */}
      {sidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 99 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">🕉️</div>
          <div className="sidebar-brand-text">
            <span className="sidebar-brand-name">MTM Platform</span>
            <span className="sidebar-brand-tag">Telugu Mahasabha</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navConfig.sections.map((section) => (
            <div key={section.title} className="sidebar-section">
              <p className="sidebar-section-title">{section.title}</p>
              {section.items.map((item) => (
                <div
                  key={item.path}
                  className={`sidebar-nav-item ${location.pathname === item.path ? 'active' : ''}`}
                  onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                >
                  <span className="sidebar-nav-icon">{item.icon}</span>
                  <span className="sidebar-nav-label">{item.label}</span>
                  {item.badge && (
                    <span className="sidebar-nav-badge">{item.badge}</span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </nav>

        {/* User info + Logout */}
        <div className="sidebar-footer">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 12px',
            marginBottom: '8px',
            borderRadius: '8px',
            background: 'rgba(255,255,255,0.04)'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: '700',
              color: 'white',
              flexShrink: 0
            }}>
              {initials}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {displayName}
              </div>
              <div style={{ fontSize: '11px', color: navConfig.color, textTransform: 'capitalize', fontWeight: '500' }}>
                {navConfig.label}
              </div>
            </div>
          </div>
          <button className="sidebar-logout-btn" onClick={handleLogout}>
            <span>🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Navbar */}
      <header className="navbar">
        <div className="navbar-left">
          {/* Mobile menu toggle */}
          <button
            className="navbar-icon-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ display: 'none' }}
            id="menu-toggle"
          >
            ☰
          </button>
          <div>
            <div className="navbar-title">{pageTitle}</div>
            {pageSubtitle && <div className="navbar-subtitle">{pageSubtitle}</div>}
          </div>
        </div>

        <div className="navbar-right">
          {/* Search */}
          <button className="navbar-icon-btn" title="Search">
            🔍
          </button>

          {/* Notifications */}
          <button className="navbar-icon-btn" title="Notifications" style={{ position: 'relative' }}>
            🔔
            <span className="navbar-badge"></span>
          </button>

          {/* Messages */}
          <button className="navbar-icon-btn" title="Messages">
            ✉️
          </button>

          <div className="navbar-divider"></div>

          {/* Profile */}
          <div className="navbar-profile" onClick={() => navigate(`/${userRole}/profile`)}>
            <div className="navbar-avatar">{initials}</div>
            <div className="navbar-profile-info">
              <span className="navbar-profile-name">{displayName}</span>
              <span className="navbar-profile-role">{navConfig.label}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;
