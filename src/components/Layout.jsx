import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { storage } from '../utils/storage';
import { showConfirmDialog } from '../utils/alerts';

/**
 * Role-based sidebar navigation config — aligned with PRD Section 3.1 roles.
 */
const ROLE_NAV = {
  admin: {
    label: 'Administrator',
    color: '#6C3CE1',
    sections: [
      {
        title: 'Dashboard',
        icon: '📊',
        items: [
          { icon: '🏠', label: 'Overview', path: '/admin/dashboard' },
        ]
      },
      {
        title: 'Management',
        icon: '⚙️',
        items: [
          { icon: '👥', label: 'User Management', path: '/admin/users' },
          { icon: '🔑', label: 'Role Management', path: '/admin/roles' },
          { icon: '🛡️', label: 'Permissions', path: '/admin/permissions' },
          { icon: '🪪', label: 'Membership', path: '/admin/membership' },
        ]
      },
      {
        title: 'Platform',
        icon: '🌐',
        items: [
          { icon: '📅', label: 'Events', path: '/admin/events' },
          { icon: '🙋', label: 'Volunteers', path: '/admin/volunteers' },
          { icon: '📣', label: 'Announcements', path: '/admin/announcements' },
          { icon: '💳', label: 'Payments', path: '/admin/payments' },
          { icon: '🎫', label: 'Support Tickets', path: '/admin/tickets' },
        ]
      },
      {
        title: 'System',
        icon: '🔧',
        items: [
          { icon: '📈', label: 'Analytics', path: '/admin/analytics' },
          { icon: '⚙️', label: 'Settings', path: '/admin/settings' },
          { icon: '📋', label: 'Audit Logs', path: '/admin/logs' },
        ]
      }
    ]
  },

  finance_admin: {
    label: 'Finance Admin',
    color: '#059669',
    sections: [
      {
        title: 'Dashboard',
        icon: '📊',
        items: [
          { icon: '🏠', label: 'Overview', path: '/finance/dashboard' },
        ]
      },
      {
        title: 'Finances',
        icon: '💰',
        items: [
          { icon: '💳', label: 'Payments', path: '/finance/payments' },
          { icon: '🧾', label: 'Receipts', path: '/finance/receipts' },
          { icon: '🎁', label: 'Donations', path: '/finance/donations' },
          { icon: '📊', label: 'Reports', path: '/finance/reports' },
        ]
      },
      {
        title: 'Membership',
        icon: '🪪',
        items: [
          { icon: '🪪', label: 'Membership Payments', path: '/finance/membership' },
        ]
      }
    ]
  },

  event_manager: {
    label: 'Event Manager',
    color: '#D97706',
    sections: [
      {
        title: 'Dashboard',
        icon: '📊',
        items: [
          { icon: '🏠', label: 'Overview', path: '/events/dashboard' },
        ]
      },
      {
        title: 'Events',
        icon: '📅',
        items: [
          { icon: '📅', label: 'All Events', path: '/events/list' },
          { icon: '➕', label: 'Create Event', path: '/events/create' },
          { icon: '🎫', label: 'Registrations', path: '/events/registrations' },
          { icon: '✅', label: 'Attendance', path: '/events/attendance' },
        ]
      },
      {
        title: 'Volunteers',
        icon: '🙋',
        items: [
          { icon: '🙋', label: 'Volunteer List', path: '/events/volunteers' },
          { icon: '📋', label: 'Duty Rosters', path: '/events/rosters' },
        ]
      },
      {
        title: 'Insights',
        icon: '📈',
        items: [
          { icon: '📊', label: 'Event Analytics', path: '/events/analytics' },
        ]
      }
    ]
  },

  committee_member: {
    label: 'Committee Member',
    color: '#EA580C',
    sections: [
      {
        title: 'Dashboard',
        icon: '📊',
        items: [
          { icon: '🏠', label: 'Overview', path: '/committee/dashboard' },
        ]
      },
      {
        title: 'Content',
        icon: '📝',
        items: [
          { icon: '📣', label: 'Announcements', path: '/committee/announcements' },
          { icon: '📅', label: 'Events', path: '/committee/events' },
        ]
      },
      {
        title: 'Reports',
        icon: '📈',
        items: [
          { icon: '📊', label: 'Reports', path: '/committee/reports' },
        ]
      }
    ]
  },

  moderator: {
    label: 'Moderator',
    color: '#2563EB',
    sections: [
      {
        title: 'Dashboard',
        icon: '📊',
        items: [
          { icon: '🏠', label: 'Overview', path: '/moderator/dashboard' },
        ]
      },
      {
        title: 'Moderation',
        icon: '🛡️',
        items: [
          { icon: '🚩', label: 'Flagged Content', path: '/moderator/flagged' },
          { icon: '👤', label: 'User Reports', path: '/moderator/user-reports' },
          { icon: '📝', label: 'Content Review', path: '/moderator/content' },
        ]
      },
      {
        title: 'Community',
        icon: '🌐',
        items: [
          { icon: '📣', label: 'Announcements', path: '/moderator/announcements' },
        ]
      }
    ]
  },

  member: {
    label: 'Member',
    color: '#059669',
    sections: [
      {
        title: 'Dashboard',
        icon: '📊',
        items: [
          { icon: '🏠', label: 'Overview', path: '/member/dashboard' },
        ]
      },
      {
        title: 'My Account',
        icon: '👤',
        items: [
          { icon: '👤', label: 'Profile', path: '/member/profile' },
          { icon: '🪪', label: 'Membership', path: '/member/membership' },
          { icon: '👨‍👩‍👧‍👦', label: 'Family', path: '/member/family' },
          { icon: '🔔', label: 'Notifications', path: '/member/notifications' },
        ]
      },
      {
        title: 'Community',
        icon: '🌐',
        items: [
          { icon: '📅', label: 'Events', path: '/member/events' },
          { icon: '🙋', label: 'Volunteering', path: '/member/volunteering' },
        ]
      },
      {
        title: 'Financials',
        icon: '💰',
        items: [
          { icon: '💳', label: 'My Payments', path: '/member/payments' },
          { icon: '🧾', label: 'Receipts', path: '/member/receipts' },
          { icon: '🎁', label: 'Donations', path: '/member/donations' },
        ]
      },
      {
        title: 'Support',
        icon: '🎫',
        items: [
          { icon: '🎫', label: 'My Tickets', path: '/member/tickets' },
        ]
      }
    ]
  },

  family_member: {
    label: 'Family Member',
    color: '#7C3AED',
    sections: [
      {
        title: 'Dashboard',
        icon: '📊',
        items: [
          { icon: '🏠', label: 'Overview', path: '/member/dashboard' },
        ]
      },
      {
        title: 'My Account',
        icon: '👤',
        items: [
          { icon: '👤', label: 'Profile', path: '/member/profile' },
        ]
      },
      {
        title: 'Community',
        icon: '🌐',
        items: [
          { icon: '📅', label: 'Events', path: '/member/events' },
        ]
      }
    ]
  },

  volunteer: {
    label: 'Volunteer',
    color: '#EA580C',
    sections: [
      {
        title: 'Dashboard',
        icon: '📊',
        items: [
          { icon: '🏠', label: 'Overview', path: '/member/dashboard' },
        ]
      },
      {
        title: 'My Account',
        icon: '👤',
        items: [
          { icon: '👤', label: 'Profile', path: '/member/profile' },
        ]
      },
      {
        title: 'Volunteering',
        icon: '🙋',
        items: [
          { icon: '📅', label: 'Events', path: '/member/events' },
          { icon: '🙋', label: 'My Assignments', path: '/member/volunteering' },
        ]
      }
    ]
  }
};


/**
 * CollapsibleSection — a sidebar section with collapsible dropdown behavior.
 */
const CollapsibleSection = ({ section, location, navigate, onNavClick }) => {
  const hasActiveChild = section.items.some(item => location.pathname === item.path);
  const [isOpen, setIsOpen] = useState(hasActiveChild);

  return (
    <div className="sidebar-section">
      <button
        className={`sidebar-section-toggle ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="sidebar-section-icon">{section.icon}</span>
        <span className="sidebar-section-title">{section.title}</span>
        <span className={`sidebar-chevron ${isOpen ? 'open' : ''}`}>›</span>
      </button>
      <div className={`sidebar-section-items ${isOpen ? 'expanded' : 'collapsed'}`}>
        {section.items.map((item) => (
          <div
            key={item.path}
            className={`sidebar-nav-item ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => { navigate(item.path); onNavClick(); }}
          >
            <span className="sidebar-nav-icon">{item.icon}</span>
            <span className="sidebar-nav-label">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};


const Layout = ({ children, pageTitle = 'Dashboard', pageSubtitle = '' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const userData = storage.getUserData();
  const userRole = storage.getUserRole() || 'member';

  const navConfig = ROLE_NAV[userRole] || ROLE_NAV.member;

  // Get actual user name from stored data
  const displayName = userData?.full_name || userData?.name || 'User';
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const roleLabel = navConfig.label;

  const handleLogout = async () => {
    const confirmed = await showConfirmDialog(
      'Sign Out',
      'Are you sure you want to sign out of your account?',
      'Sign Out',
      'Cancel'
    );
    if (confirmed) {
      storage.clearTokens();
      navigate('/', { replace: true });
    }
  };

  return (
    <div className={`app-layout ${sidebarCollapsed ? 'sidebar-is-collapsed' : ''}`}>
      {/* Sidebar Backdrop (mobile) */}
      {sidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`}>
        {/* Brand + Close button */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">🕉️</div>
          {!sidebarCollapsed && (
            <div className="sidebar-brand-text">
              <span className="sidebar-brand-name">MTM Platform</span>
              <span className="sidebar-brand-tag">Telugu Mahasabha</span>
            </div>
          )}
          {/* Sidebar collapse toggle — desktop only */}
          <button
            className="sidebar-close-btn"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? '»' : '«'}
          </button>
        </div>

        {/* Navigation with collapsible sections */}
        {!sidebarCollapsed && (
          <nav className="sidebar-nav">
            {navConfig.sections.map((section) => (
              <CollapsibleSection
                key={section.title}
                section={section}
                location={location}
                navigate={navigate}
                onNavClick={() => setSidebarOpen(false)}
              />
            ))}
          </nav>
        )}

        {/* Footer — just logout, no user info */}
        <div className="sidebar-footer">
          <button className="sidebar-logout-btn" onClick={handleLogout}>
            <span>🚪</span>
            {!sidebarCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Navbar */}
      <header className="navbar">
        <div className="navbar-left">
          {/* Mobile menu toggle */}
          <button
            className="navbar-icon-btn mobile-menu-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
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
          <button className="navbar-icon-btn" title="Search">🔍</button>

          <button className="navbar-icon-btn" title="Notifications" style={{ position: 'relative' }}>
            🔔
            <span className="navbar-badge"></span>
          </button>

          <div className="navbar-divider"></div>

          {/* Profile — shows actual user name and role */}
          <div className="navbar-profile" onClick={() => navigate('/profile')}>
            <div className="navbar-avatar">{initials}</div>
            <div className="navbar-profile-info">
              <span className="navbar-profile-name">{displayName}</span>
              <span className="navbar-profile-role">{roleLabel}</span>
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
