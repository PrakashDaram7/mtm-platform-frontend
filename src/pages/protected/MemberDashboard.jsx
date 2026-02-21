import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../../components/Layout';
import apiClient from '../../services/api';
import { storage } from '../../utils/storage';

// ─── Helpers ──────────────────────────────────────────────────────────────
const STATUS_STYLES = {
  active: { bg: 'rgba(16,185,129,0.15)', color: '#10b981', dot: '●', label: 'Active' },
  pending: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', dot: '◌', label: 'Pending Approval' },
  expired: { bg: 'rgba(107,114,128,0.15)', color: '#9ca3af', dot: '○', label: 'Expired' },
  blocked: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', dot: '✗', label: 'Blocked' },
  rejected: { bg: 'rgba(239,68,68,0.12)', color: '#fca5a5', dot: '✗', label: 'Rejected' },
};

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';

const daysRemaining = (expiry) => {
  if (!expiry) return null;
  const diff = Math.ceil((new Date(expiry) - new Date()) / (1000 * 60 * 60 * 24));
  return diff;
};

// ─────────────────────────────────────────────────────────────────────────────
// MEMBERSHIP STATUS BANNER
// ─────────────────────────────────────────────────────────────────────────────
const MembershipBanner = ({ membership, onApply, onRenew }) => {
  if (!membership) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #0f0c29, #302b63)',
        border: '1px solid rgba(167,139,250,0.25)',
        borderRadius: 20, padding: '28px 32px', marginBottom: 24,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
      }}>
        <div>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>No Membership Found</p>
          <h3 style={{ margin: '4px 0 8px', color: '#fff', fontSize: '1.3rem', fontWeight: 800 }}>
            Join MTM Today 🕉️
          </h3>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '0.88rem' }}>
            Apply for membership to unlock all community features and events.
          </p>
        </div>
        <button onClick={onApply} style={{
          padding: '0.75rem 1.8rem', background: 'linear-gradient(135deg, #667eea, #764ba2)',
          border: 'none', borderRadius: 12, color: '#fff', fontWeight: 700,
          cursor: 'pointer', fontSize: '0.95rem', whiteSpace: 'nowrap',
        }}>
          🎫 Apply for Membership
        </button>
      </div>
    );
  }

  const s = STATUS_STYLES[membership.status] || STATUS_STYLES.expired;
  const days = daysRemaining(membership.expiry_date);
  const expiringSoon = days !== null && days <= 30 && days >= 0;
  const isExpired = days !== null && days < 0;

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0F0E1A 0%, #1a1040 40%, #2d1b69 100%)',
      border: '1px solid rgba(108,60,225,0.4)',
      borderRadius: 20, padding: '28px 32px', marginBottom: 24,
      position: 'relative', overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
    }}>
      {/* Glow orbs */}
      <div style={{ position: 'absolute', top: -60, right: -40, width: 200, height: 200, background: 'radial-gradient(circle, rgba(108,60,225,0.3) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -80, left: '30%', width: 200, height: 200, background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Left: Avatar + info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, zIndex: 1 }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'linear-gradient(135deg, #6C3CE1, #8B5CF6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, fontWeight: 700, color: '#fff',
          border: '3px solid rgba(108,60,225,0.6)',
          boxShadow: '0 0 24px rgba(108,60,225,0.4)',
        }}>
          {(storage.getUserData()?.full_name || 'M').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
        </div>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
            {storage.getUserData()?.full_name || 'Member'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
            {membership.membership_number && (
              <span style={{ fontSize: '0.8rem', color: '#a78bfa', fontFamily: 'monospace', fontWeight: 700 }}>
                🪪 {membership.membership_number}
              </span>
            )}
            <span style={{
              fontSize: '0.78rem', padding: '3px 10px', borderRadius: 20, fontWeight: 700,
              background: s.bg, color: s.color,
            }}>
              {s.dot} {s.label}
            </span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>
            {storage.getUserData()?.email}
          </div>
        </div>
      </div>

      {/* Right: Plan + Expiry + Action */}
      <div style={{ textAlign: 'right', zIndex: 1 }}>
        {membership.plan_name && (
          <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
            {membership.plan_name}
          </div>
        )}
        {membership.expiry_date ? (
          <>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', marginBottom: 2 }}>
              {isExpired ? 'Expired on' : 'Valid until'}
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: expiringSoon || isExpired ? '#f59e0b' : '#a78bfa' }}>
              {fmtDate(membership.expiry_date)}
            </div>
            {expiringSoon && !isExpired && (
              <div style={{ fontSize: '0.75rem', color: '#f59e0b', marginTop: 4 }}>
                ⚠️ Expires in {days} days
              </div>
            )}
          </>
        ) : membership.status === 'active' ? (
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#10b981' }}>Lifetime Member 🌟</div>
        ) : null}

        {(expiringSoon || isExpired || membership.status === 'expired') && (
          <button onClick={onRenew} style={{
            marginTop: 10, padding: '0.5rem 1.2rem',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            border: 'none', borderRadius: 10, color: '#fff',
            fontWeight: 700, cursor: 'pointer', fontSize: '0.82rem',
          }}>
            🔄 Renew Now
          </button>
        )}

        {membership.status === 'pending' && (
          <div style={{ marginTop: 8, fontSize: '0.78rem', color: '#f59e0b', maxWidth: 180 }}>
            Your application is under review. You'll be notified once approved.
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// RENEW MODAL
// ─────────────────────────────────────────────────────────────────────────────
const RenewModal = ({ open, plans, currentPlanId, onRenew, onClose }) => {
  const [selectedPlan, setSelected] = useState(currentPlanId);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const doRenew = async () => {
    setLoading(true);
    await onRenew(selectedPlan);
    setLoading(false);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999,
      background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    }} onClick={onClose}>
      <div style={{
        background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 20, padding: '2rem', width: '100%', maxWidth: 480,
      }} onClick={e => e.stopPropagation()}>
        <h3 style={{ color: '#fff', margin: '0 0 1.5rem' }}>🔄 Renew Membership</h3>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.88rem', marginBottom: '1rem' }}>
          Select a plan to renew with:
        </p>
        {plans.filter(p => p.is_active).map(p => (
          <div key={p.id} onClick={() => setSelected(p.id)}
            style={{
              padding: '1rem', borderRadius: 12, cursor: 'pointer', marginBottom: 8,
              border: `2px solid ${selectedPlan === p.id ? '#a78bfa' : 'rgba(255,255,255,0.08)'}`,
              background: selectedPlan === p.id ? 'rgba(167,139,250,0.1)' : 'rgba(255,255,255,0.03)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
            <div>
              <p style={{ margin: 0, color: '#fff', fontWeight: 700 }}>{p.name}</p>
              <p style={{ margin: '2px 0 0', color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem' }}>
                {p.is_lifetime ? 'Lifetime' : `${p.duration_months} months`}
              </p>
            </div>
            <span style={{ color: '#a78bfa', fontWeight: 800, fontSize: '1.1rem' }}>
              {p.currency} {Number(p.price).toLocaleString()}
            </span>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 10, marginTop: '1.5rem' }}>
          <button onClick={onClose}
            style={{ flex: 1, padding: '0.75rem', background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 10, color: '#fff', cursor: 'pointer' }}>
            Cancel
          </button>
          <button onClick={doRenew} disabled={loading}
            style={{ flex: 1, padding: '0.75rem', background: 'linear-gradient(135deg, #667eea, #764ba2)', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Renewing…' : 'Confirm Renewal'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const MemberDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;
  const activePage = path.includes('/profile') ? 'profile'
    : path.includes('/card') ? 'card'
      : path.includes('/notifications') ? 'notifications'
        : path.includes('/events') ? 'events'
          : path.includes('/payments') ? 'payments'
            : 'dashboard';

  const PAGE_TITLES = {
    dashboard: ['Member Dashboard', 'Welcome to your Telugu Mahasabha member portal'],
    profile: ['My Profile', 'View and manage your profile'],
    card: ['Membership Card', 'Your digital membership card'],
    notifications: ['Notifications', 'Stay updated'],
    events: ['My Events', 'Events you are registered for'],
    payments: ['My Payments', 'Payment & billing history'],
  };

  const [membership, setMembership] = useState(undefined); // undefined = loading, null = none
  const [plans, setPlans] = useState([]);
  const [notifications, setNotifs] = useState([]);
  const [payments, setPayments] = useState([]);
  const [showRenew, setShowRenew] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);

  const userData = storage.getUserData();
  const displayName = userData?.full_name || userData?.name || 'Member';

  // ── Load all data ─────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [mRes, nRes, pRes, plRes] = await Promise.allSettled([
        apiClient.get('/members/my-membership'),
        apiClient.get('/members/notifications'),
        apiClient.get('/members/payments'),
        apiClient.get('/members/plans?active_only=true'),
      ]);

      if (mRes.status === 'fulfilled') {
        setMembership(mRes.value.data.membership);
      } else {
        setMembership(null);
      }
      if (nRes.status === 'fulfilled') setNotifs(nRes.value.data.notifications || []);
      if (pRes.status === 'fulfilled') setPayments(pRes.value.data.payments || []);
      if (plRes.status === 'fulfilled') setPlans(plRes.value.data.plans || []);
    } catch (_) {
      setMembership(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Renewal ────────────────────────────────────────────────────────────────
  const handleRenew = async (planId) => {
    try {
      const r = await apiClient.post('/members/renew', planId ? { plan_id: planId } : {});
      if (r.data.success) {
        setFeedback('🎉 Membership renewed successfully!');
        setShowRenew(false);
        loadData();
      } else {
        setFeedback(r.data.message || 'Renewal failed');
      }
    } catch (e) {
      setFeedback(e.response?.data?.detail || 'Renewal failed');
    }
  };

  // ── Mark notification read ────────────────────────────────────────────────
  const markRead = async (id) => {
    try {
      await apiClient.put(`/members/notifications/${id}/read`);
      setNotifs(ns => ns.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (_) { }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <Layout
      pageTitle={PAGE_TITLES[activePage]?.[0] || 'Member'}
      pageSubtitle={PAGE_TITLES[activePage]?.[1] || ''}
    >
      {/* Feedback banner */}
      {feedback && (
        <div style={{
          background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.3)',
          borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1rem',
          color: '#a78bfa', display: 'flex', justifyContent: 'space-between',
        }}>
          {feedback}
          <button onClick={() => setFeedback('')} style={{ background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {/* Membership Banner — always on dashboard */}
      {(activePage === 'dashboard' || activePage === 'card') && (
        loading
          ? <div style={{ height: 140, background: 'rgba(255,255,255,0.03)', borderRadius: 20, marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)' }}>Loading membership…</div>
          : <MembershipBanner
            membership={membership}
            onApply={() => navigate('/membership/apply')}
            onRenew={() => setShowRenew(true)}
          />
      )}

      {/* ── Stats ─────────────────────────────────── */}
      {activePage === 'dashboard' && (
        <div className="stats-grid" style={{ marginBottom: 24 }}>
          {[
            { icon: '🪪', label: 'Membership Status', value: membership ? (STATUS_STYLES[membership.status]?.label || membership.status) : 'None', color: membership ? STATUS_STYLES[membership.status]?.color : '#9ca3af' },
            { icon: '🔔', label: 'Unread Notifications', value: unreadCount, color: '#f59e0b' },
            { icon: '💳', label: 'Payments Made', value: payments.length, color: '#10b981' },
            { icon: '📅', label: 'Member Since', value: membership?.start_date ? new Date(membership.start_date).getFullYear() : '—', color: '#818cf8' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-icon purple" style={{ fontSize: '1.4rem' }}>{s.icon}</div>
              <div className="stat-info">
                <div className="stat-label">{s.label}</div>
                <div className="stat-value" style={{ color: s.color, fontSize: '1.2rem' }}>{s.value}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Tab Bar ─────────────────────────────────── */}
      {activePage === 'dashboard' && (
        <div className="tabs" style={{ marginBottom: 20 }}>
          <button className="tab-btn active" onClick={() => navigate('/member/dashboard')}>🏠 Overview</button>
          <button className="tab-btn" onClick={() => navigate('/member/notifications')}>
            🔔 Notifications {unreadCount > 0 && <span className="tab-count">{unreadCount}</span>}
          </button>
          <button className="tab-btn" onClick={() => navigate('/member/payments')}>💳 Payments</button>
        </div>
      )}

      {/* ── Dashboard Overview ────────────────────── */}
      {activePage === 'dashboard' && (
        <div>
          {/* Quick Actions */}
          <div className="quick-actions" style={{ marginBottom: 24 }}>
            {[
              { icon: '🎫', title: 'Apply / Renew', desc: 'Manage your membership', onClick: membership ? () => setShowRenew(true) : () => navigate('/membership/apply'), gradient: 'linear-gradient(135deg, #6C3CE1, #8B5CF6)' },
              { icon: '📅', title: 'Browse Events', desc: 'Find events near you', onClick: () => { }, gradient: 'linear-gradient(135deg, #10B981, #6EE7B7)' },
              { icon: '🔍', title: 'Check Status', desc: 'Self-service status lookup', onClick: () => navigate('/membership/status'), gradient: 'linear-gradient(135deg, #3B82F6, #60A5FA)' },
              { icon: '👤', title: 'My Profile', desc: 'Update your details', onClick: () => navigate('/profile'), gradient: 'linear-gradient(135deg, #F59E0B, #FCD34D)' },
            ].map(qa => (
              <div key={qa.title} className="quick-action-card" onClick={qa.onClick} style={{ cursor: 'pointer' }}>
                <div className="qa-icon" style={{ background: qa.gradient }}>{qa.icon}</div>
                <div className="qa-info"><h3>{qa.title}</h3><p>{qa.desc}</p></div>
              </div>
            ))}
          </div>

          {/* Recent Notifications Preview */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Recent Notifications</div>
              {unreadCount > 0 && <span style={{ background: 'rgba(167,139,250,0.15)', color: '#a78bfa', padding: '2px 10px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700 }}>{unreadCount} new</span>}
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              {notifications.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: '2rem' }}>No notifications yet</div>
              ) : notifications.slice(0, 4).map(n => (
                <div key={n.id} onClick={() => !n.is_read && markRead(n.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 24px', borderBottom: '1px solid var(--border-color)',
                    background: n.is_read ? 'transparent' : 'rgba(108,60,225,0.04)',
                    cursor: n.is_read ? 'default' : 'pointer',
                  }}>
                  <span style={{ fontSize: 20 }}>{n.type === 'membership' ? '🪪' : n.type === 'event' ? '📅' : '🔔'}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.88rem', color: n.is_read ? 'var(--text-secondary)' : 'var(--text-primary)', fontWeight: n.is_read ? 400 : 600 }}>
                      {n.title || n.message}
                    </div>
                    {n.message && n.title && (
                      <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{n.message}</div>
                    )}
                  </div>
                  {!n.is_read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#a78bfa', flexShrink: 0 }} />}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Notifications Page ─────────────────────── */}
      {activePage === 'notifications' && (
        <div className="card">
          <div className="card-header"><div className="card-title">All Notifications</div></div>
          <div style={{ padding: 0 }}>
            {notifications.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: '3rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🔕</div>
                No notifications yet
              </div>
            ) : notifications.map(n => (
              <div key={n.id} onClick={() => !n.is_read && markRead(n.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '16px 24px',
                  borderBottom: '1px solid var(--border-color)',
                  background: n.is_read ? 'transparent' : 'rgba(108,60,225,0.04)',
                  cursor: n.is_read ? 'default' : 'pointer',
                }}>
                <span style={{ fontSize: 24 }}>{n.type === 'membership' ? '🪪' : n.type === 'event' ? '📅' : '🔔'}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: n.is_read ? 400 : 600, color: n.is_read ? 'var(--text-secondary)' : 'var(--text-primary)' }}>{n.title || n.message}</div>
                  {n.message && n.title && <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)', marginTop: 3 }}>{n.message}</div>}
                  <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)', marginTop: 3 }}>
                    {n.created_at ? new Date(n.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                  </div>
                </div>
                {!n.is_read && <span style={{ background: 'rgba(167,139,250,0.15)', color: '#a78bfa', padding: '2px 8px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700 }}>New</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Payments Page ─────────────────────────── */}
      {activePage === 'payments' && (
        <div className="card">
          <div className="card-header"><div className="card-title">Payment History</div></div>
          <div className="table-wrapper">
            {payments.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: '3rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>💳</div>
                No payment records found
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map(p => (
                    <tr key={p.id}>
                      <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{p.description || p.payment_type}</td>
                      <td style={{ color: 'var(--success)', fontWeight: 600 }}>MUR {Number(p.amount).toLocaleString()}</td>
                      <td>{p.created_at ? new Date(p.created_at).toLocaleDateString('en-GB') : '—'}</td>
                      <td>
                        {p.status === 'completed' || p.status === 'paid'
                          ? <span className="badge status-active">✓ Paid</span>
                          : <span className="badge badge-warning">⏳ {p.status}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ── Profile Page ─────────────────────────── */}
      {activePage === 'profile' && (
        <ProfileSection membership={membership} onRefresh={loadData} />
      )}

      {/* ── Membership Card Page ─────────────────── */}
      {activePage === 'card' && membership?.status === 'active' && (
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <div style={{
            background: 'linear-gradient(135deg, #0f0c29, #302b63)',
            border: '1px solid rgba(167,139,250,0.3)', borderRadius: 20, padding: '2rem',
            boxShadow: '0 20px 60px rgba(102,126,234,0.3)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: 2 }}>MAURITIUS TELUGU MAHASABHA</div>
                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>Digital Membership Card</div>
              </div>
              <div style={{ fontSize: '2.5rem' }}>🕉️</div>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginBottom: 4 }}>{displayName}</div>
            <div style={{ fontSize: '0.85rem', color: '#a78bfa', fontFamily: 'monospace', fontWeight: 700, marginBottom: '2rem' }}>
              {membership.membership_number}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', fontWeight: 700, letterSpacing: 1 }}>PLAN</div>
                <div style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 600, marginTop: 2 }}>{membership.plan_name || 'Standard'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', fontWeight: 700, letterSpacing: 1 }}>TYPE</div>
                <div style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 600, marginTop: 2, textTransform: 'capitalize' }}>{membership.membership_type}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', fontWeight: 700, letterSpacing: 1 }}>
                  {membership.expiry_date ? 'VALID UNTIL' : 'MEMBERSHIP'}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#10b981', fontWeight: 600, marginTop: 2 }}>
                  {membership.expiry_date ? fmtDate(membership.expiry_date) : 'Lifetime'}
                </div>
              </div>
            </div>
            <div style={{ marginTop: '1.5rem', padding: '0.75rem 1rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#10b981', fontWeight: 800 }}>●</span>
              <span style={{ color: '#10b981', fontWeight: 700, fontSize: '0.82rem' }}>Active Member</span>
            </div>
          </div>
        </div>
      )}

      {/* Renew Modal */}
      <RenewModal
        open={showRenew}
        plans={plans}
        currentPlanId={membership?.plan_id}
        onRenew={handleRenew}
        onClose={() => setShowRenew(false)}
      />
    </Layout>
  );
};

// ─── Profile Section ─────────────────────────────────────────────────────────
const ProfileSection = ({ membership, onRefresh }) => {
  const userData = storage.getUserData();
  const [form, setForm] = useState({
    full_name: '', phone: '', address: '', occupation: '',
    preferred_language: 'English',
    consent_whatsapp: false, consent_email: true, consent_emergency: false,
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    apiClient.get('/members/profile')
      .then(r => {
        const u = r.data.user || {};
        setForm({
          full_name: u.full_name || '',
          phone: u.phone || '',
          address: u.address || '',
          occupation: u.occupation || '',
          preferred_language: u.preferred_language || 'English',
          consent_whatsapp: u.consent_whatsapp || false,
          consent_email: u.consent_email !== false,
          consent_emergency: u.consent_emergency || false,
        });
      })
      .catch(() => { });
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await apiClient.put('/members/profile', form);
      setMsg('Profile updated successfully!');
      onRefresh();
    } catch (e) {
      setMsg(e.response?.data?.detail || 'Error saving profile');
    }
    setSaving(false);
  };

  const inp = {
    width: '100%', padding: '0.7rem 1rem',
    background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.1)',
    borderRadius: 10, color: '#fff', fontSize: '0.88rem', outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <div>
      {msg && (
        <div style={{ background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.3)', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1rem', color: '#a78bfa', display: 'flex', justifyContent: 'space-between' }}>
          {msg}
          <button onClick={() => setMsg('')} style={{ background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Profile Details */}
        <div className="card">
          <div className="card-header"><div className="card-title">Personal Details</div></div>
          <div className="card-body">
            {[
              ['Full Name', 'full_name', 'text'],
              ['Phone', 'phone', 'tel'],
              ['Occupation', 'occupation', 'text'],
            ].map(([label, key, type]) => (
              <div key={key} style={{ marginBottom: 16 }}>
                <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>{label}</label>
                <input style={inp} type={type} value={form[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
              </div>
            ))}

            <div style={{ marginBottom: 16 }}>
              <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>Address</label>
              <textarea style={{ ...inp, resize: 'vertical', minHeight: 72 }} value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>Preferred Language</label>
              <select style={{ ...inp, cursor: 'pointer' }} value={form.preferred_language}
                onChange={e => setForm(f => ({ ...f, preferred_language: e.target.value }))}>
                <option value="English">English</option>
                <option value="Telugu">Telugu</option>
              </select>
            </div>

            <div style={{ background: 'rgba(167,139,250,0.08)', borderRadius: 12, padding: '1rem', marginBottom: 20 }}>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem', marginBottom: 10 }}>Communication Preferences</p>
              {[
                ['consent_email', '📧 Email notifications'],
                ['consent_whatsapp', '💬 WhatsApp messages'],
                ['consent_emergency', '🚨 Emergency broadcasts'],
              ].map(([k, label]) => (
                <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 8, color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
                  <input type="checkbox" checked={form[k]}
                    onChange={e => setForm(f => ({ ...f, [k]: e.target.checked }))}
                    style={{ accentColor: '#a78bfa' }} />
                  {label}
                </label>
              ))}
            </div>

            <button onClick={save} disabled={saving}
              style={{ width: '100%', padding: '0.75rem', background: 'linear-gradient(135deg, #667eea, #764ba2)', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
              {saving ? 'Saving…' : 'Save Profile'}
            </button>
          </div>
        </div>

        {/* Membership Info */}
        <div className="card">
          <div className="card-header"><div className="card-title">Membership Details</div></div>
          <div className="card-body">
            {membership ? (
              <div className="detail-list">
                {[
                  ['Membership #', membership.membership_number || '—'],
                  ['Status', STATUS_STYLES[membership.status]?.label || membership.status],
                  ['Plan', membership.plan_name || '—'],
                  ['Type', membership.membership_type || '—'],
                  ['Member Since', fmtDate(membership.start_date)],
                  ['Valid Until', membership.expiry_date ? fmtDate(membership.expiry_date) : 'Lifetime'],
                ].map(([label, value]) => (
                  <div key={label} className="detail-row">
                    <label>{label}</label>
                    <span style={{ fontWeight: label === 'Status' ? 700 : 400, color: label === 'Status' ? (STATUS_STYLES[membership.status]?.color || '#fff') : 'inherit' }}>
                      {value}
                    </span>
                  </div>
                ))}
                {membership.status === 'pending' && (
                  <div style={{ marginTop: 16, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 10, padding: '0.75rem', color: '#f59e0b', fontSize: '0.82rem' }}>
                    ⏳ Your application is being reviewed by admin.
                  </div>
                )}
                {membership.rejection_reason && (
                  <div style={{ marginTop: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '0.75rem', color: '#f87171', fontSize: '0.82rem' }}>
                    ✗ Rejected: {membership.rejection_reason}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: 12 }}>🪪</div>
                <p style={{ color: 'rgba(255,255,255,0.4)' }}>No membership found</p>
                <a href="/membership/apply" style={{ color: '#a78bfa', fontWeight: 700, fontSize: '0.88rem' }}>Apply for Membership →</a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;
