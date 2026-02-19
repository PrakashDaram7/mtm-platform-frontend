import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../../components/Layout';
import { showAlert } from '../../utils/alerts';
import apiClient from '../../services/api';
import { storage } from '../../utils/storage';

const MemberDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;
  const activePage = path.includes('/profile') ? 'profile'
    : path.includes('/card') ? 'card'
      : path.includes('/notifications') ? 'notifications'
        : path.includes('/events') ? 'events'
          : path.includes('/forums') ? 'forums'
            : path.includes('/resources') ? 'resources'
              : path.includes('/payments') ? 'payments'
                : path.includes('/receipts') ? 'receipts'
                  : 'dashboard';
  const PAGE_TITLES = {
    dashboard: ['Member Dashboard', 'Welcome to your Telugu Mahasabha member portal'],
    profile: ['My Profile', 'View and manage your profile'],
    card: ['Membership Card', 'Your digital membership card'],
    notifications: ['Notifications', 'Stay updated'],
    events: ['My Events', 'Events you are registered for'],
    forums: ['Forums', 'Join community discussions'],
    resources: ['Resources', 'Telugu learning materials'],
    payments: ['My Payments', 'Payment & billing history'],
    receipts: ['Receipts', 'Download your payment receipts'],
  };
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const activeTab = activePage === 'events' ? 'events'
    : activePage === 'notifications' ? 'notifications'
      : activePage === 'payments' ? 'payments'
        : 'overview';

  const userData = storage.getUserData();
  const [upcomingEvents] = useState([
    { id: 1, title: 'Ugadi Celebrations 2026', date: '2026-03-30', location: 'Hyderabad', status: 'registered', type: 'Cultural' },
    { id: 2, title: 'Telugu Literature Meet', date: '2026-04-10', location: 'Bangalore', status: 'interested', type: 'Education' },
    { id: 3, title: 'Annual Conference', date: '2026-06-15', location: 'Mumbai', status: 'registered', type: 'Conference' },
  ]);

  const [notifications] = useState([
    { id: 1, icon: '📅', text: 'Your registration for Ugadi Celebrations is confirmed!', time: '2 hours ago', read: false },
    { id: 2, icon: '💳', text: 'Your membership has been renewed for 2026.', time: '1 day ago', read: false },
    { id: 3, icon: '📢', text: 'New event: Telugu Cultural Night in Mumbai on Apr 14.', time: '2 days ago', read: true },
    { id: 4, icon: '✅', text: 'Profile verification successful.', time: '1 week ago', read: true },
  ]);

  const [payments] = useState([
    { id: 1, desc: 'Annual Membership 2026', amount: 1200, date: '2026-01-10', status: 'paid' },
    { id: 2, desc: 'Ugadi Event Registration', amount: 200, date: '2026-02-15', status: 'paid' },
    { id: 3, desc: 'Annual Conference 2026', amount: 500, date: '2026-02-18', status: 'pending' },
  ]);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await apiClient.get('/members/profile');
      setProfile(response.data);
    } catch (err) {
      // Use from localStorage as fallback
      setProfile(userData);
    } finally {
      setLoading(false);
    }
  };

  const displayName = userData?.full_name || userData?.name || 'Member';
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <Layout pageTitle={PAGE_TITLES[activePage]?.[0] || 'Member'} pageSubtitle={PAGE_TITLES[activePage]?.[1] || ''}>
      {/* Coming Soon for unbuilt pages */}
      {!['dashboard', 'profile', 'events', 'notifications', 'payments'].includes(activePage) && (
        <div className="card"><div className="card-header"><div className="card-title">{PAGE_TITLES[activePage]?.[0]}</div></div>
          <div className="card-body"><div className="empty-state"><div className="empty-state-icon">🚧</div><h3>Coming Soon</h3><p>This section is under development.</p>
            <button className="btn btn-primary" onClick={() => navigate('/member/dashboard')}>← Back to Dashboard</button></div></div></div>
      )}
      {['dashboard', 'profile', 'events', 'notifications', 'payments'].includes(activePage) && (
        <>
          {/* Membership Card Hero */}
          <div style={{
            background: 'linear-gradient(135deg, #0F0E1A 0%, #1a1040 40%, #2d1b69 100%)',
            border: '1px solid rgba(108,60,225,0.4)',
            borderRadius: '20px',
            padding: '28px 32px',
            marginBottom: '24px',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{
              position: 'absolute', top: '-60px', right: '-40px',
              width: '200px', height: '200px',
              background: 'radial-gradient(circle, rgba(108,60,225,0.3) 0%, transparent 70%)',
              pointerEvents: 'none'
            }} />
            <div style={{
              position: 'absolute', bottom: '-80px', left: '30%',
              width: '200px', height: '200px',
              background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
              pointerEvents: 'none'
            }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', zIndex: 1 }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '28px', fontWeight: '700', color: 'white',
                border: '3px solid rgba(108,60,225,0.6)',
                boxShadow: '0 0 24px rgba(108,60,225,0.4)'
              }}>
                {initials}
              </div>
              <div>
                <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
                  {displayName}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--primary-light)', fontWeight: '500', marginTop: '2px' }}>
                  🪪 Active Member · MTM Platform
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  📧 {userData?.email || 'member@mtm.com'}
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right', zIndex: 1 }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Membership Valid</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--accent)' }}>Dec 2026</div>
              <span className="badge status-active" style={{ marginTop: '8px', display: 'inline-flex' }}>● Active</span>
            </div>
          </div>

          {/* Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon purple">📅</div>
              <div className="stat-info">
                <div className="stat-label">Events Registered</div>
                <div className="stat-value">{upcomingEvents.filter(e => e.status === 'registered').length}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon orange">🔔</div>
              <div className="stat-info">
                <div className="stat-label">Notifications</div>
                <div className="stat-value">{notifications.filter(n => !n.read).length}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green">💳</div>
              <div className="stat-info">
                <div className="stat-label">Total Paid</div>
                <div className="stat-value">₹{payments.filter(p => p.status === 'paid').reduce((a, b) => a + b.amount, 0).toLocaleString()}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon blue">📚</div>
              <div className="stat-info">
                <div className="stat-label">Membership Year</div>
                <div className="stat-value">2026</div>
              </div>
            </div>
          </div>

          {/* Tabs - visible on dashboard page */}
          {activePage === 'dashboard' && (
            <div className="tabs">
              <button className={`tab-btn active`} onClick={() => navigate('/member/dashboard')}>🏠 Overview</button>
              <button className={`tab-btn`} onClick={() => navigate('/member/events')}>
                📅 Events <span className="tab-count">{upcomingEvents.length}</span>
              </button>
              <button className={`tab-btn`} onClick={() => navigate('/member/notifications')}>
                🔔 Notifications <span className="tab-count">{notifications.filter(n => !n.read).length}</span>
              </button>
              <button className={`tab-btn`} onClick={() => navigate('/member/payments')}>💳 Payments</button>
            </div>
          )}

          {/* Overview Tab */}
          {(activeTab === 'overview' || activePage === 'dashboard') && activePage === 'dashboard' && (
            <div>
              <div className="quick-actions">
                <div className="quick-action-card">
                  <div className="qa-icon" style={{ background: 'linear-gradient(135deg, #6C3CE1, #8B5CF6)' }}>📅</div>
                  <div className="qa-info"><h3>Browse Events</h3><p>Find events near you</p></div>
                </div>
                <div className="quick-action-card">
                  <div className="qa-icon" style={{ background: 'linear-gradient(135deg, #10B981, #6EE7B7)' }}>🪪</div>
                  <div className="qa-info"><h3>Membership Card</h3><p>View your digital card</p></div>
                </div>
                <div className="quick-action-card">
                  <div className="qa-icon" style={{ background: 'linear-gradient(135deg, #3B82F6, #60A5FA)' }}>💬</div>
                  <div className="qa-info"><h3>Forums</h3><p>Join discussions</p></div>
                </div>
                <div className="quick-action-card">
                  <div className="qa-icon" style={{ background: 'linear-gradient(135deg, #F59E0B, #FCD34D)' }}>📚</div>
                  <div className="qa-info"><h3>Resources</h3><p>Telugu learning materials</p></div>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <div className="card-title">Recent Notifications</div>
                </div>
                <div className="card-body" style={{ padding: 0 }}>
                  {notifications.slice(0, 3).map(notification => (
                    <div key={notification.id} style={{
                      display: 'flex', alignItems: 'center', gap: '14px',
                      padding: '16px 24px', borderBottom: '1px solid var(--border-color)',
                      background: notification.read ? 'transparent' : 'rgba(108,60,225,0.04)'
                    }}>
                      <span style={{ fontSize: '22px' }}>{notification.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', color: notification.read ? 'var(--text-secondary)' : 'var(--text-primary)', fontWeight: notification.read ? 400 : 500 }}>
                          {notification.text}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>{notification.time}</div>
                      </div>
                      {!notification.read && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary-light)', flexShrink: 0 }} />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Events Tab */}
          {(activeTab === 'events' || activePage === 'events') && (
            <div className="card">
              <div className="card-header">
                <div className="card-title">My Events</div>
              </div>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Event</th>
                      <th>Date</th>
                      <th>Location</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcomingEvents.map(event => (
                      <tr key={event.id}>
                        <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{event.title}</td>
                        <td>{new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                        <td>{event.location}</td>
                        <td><span className="badge badge-info">{event.type}</span></td>
                        <td>
                          {event.status === 'registered'
                            ? <span className="badge status-active">● Registered</span>
                            : <span className="badge status-unverified">◌ Interested</span>
                          }
                        </td>
                        <td>
                          <button className="action-btn view" title="View">👁️</button>
                          {event.status !== 'registered' && <button className="action-btn toggle" title="Register">🎫</button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {(activeTab === 'notifications' || activePage === 'notifications') && (
            <div className="card">
              <div className="card-header">
                <div className="card-title">All Notifications</div>
              </div>
              <div style={{ padding: 0 }}>
                {notifications.map(notification => (
                  <div key={notification.id} style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '16px 24px', borderBottom: '1px solid var(--border-color)',
                    background: notification.read ? 'transparent' : 'rgba(108,60,225,0.04)'
                  }}>
                    <span style={{ fontSize: '24px' }}>{notification.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', color: notification.read ? 'var(--text-secondary)' : 'var(--text-primary)', fontWeight: notification.read ? 400 : 500 }}>
                        {notification.text}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{notification.time}</div>
                    </div>
                    {!notification.read && (
                      <span className="badge" style={{ background: 'rgba(108,60,225,0.2)', color: 'var(--primary-light)', border: '1px solid rgba(108,60,225,0.3)' }}>New</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payments Tab */}
          {(activeTab === 'payments' || activePage === 'payments') && (
            <div className="card">
              <div className="card-header">
                <div className="card-title">Payment History</div>
              </div>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Amount</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map(payment => (
                      <tr key={payment.id}>
                        <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{payment.desc}</td>
                        <td style={{ color: 'var(--success)', fontWeight: 600 }}>₹{payment.amount}</td>
                        <td>{new Date(payment.date).toLocaleDateString('en-IN')}</td>
                        <td>
                          {payment.status === 'paid'
                            ? <span className="badge status-active">✓ Paid</span>
                            : <span className="badge badge-warning">⏳ Pending</span>
                          }
                        </td>
                        <td>
                          {payment.status === 'paid' ? (
                            <button className="action-btn view" title="Download Receipt">🧾</button>
                          ) : (
                            <button className="btn btn-primary btn-sm">Pay Now</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </Layout>
  );
};

export default MemberDashboard;
