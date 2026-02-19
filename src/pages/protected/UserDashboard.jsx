import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../../components/Layout';
import { storage } from '../../utils/storage';
import { getPublishedEvents, registerForEvent, getProfile, getMembershipPlans, getNotifications, subscribeToPlan } from '../../services/eventService';
import { showAlert } from '../../utils/alerts';

const UserDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const userData = storage.getUserData();
    const displayName = userData?.full_name || userData?.name || 'User';

    const [events, setEvents] = useState([]);
    const [plans, setPlans] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(false);

    // Determine active page from URL path
    const path = location.pathname;
    const activePage = path.includes('/profile') ? 'profile'
        : path.includes('/events') ? 'events'
            : path.includes('/membership') ? 'membership'
                : path.includes('/notifications') ? 'notifications'
                    : 'home';

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [evtRes] = await Promise.allSettled([
                getPublishedEvents({ limit: 10 }),
            ]);
            if (evtRes.status === 'fulfilled' && evtRes.value?.events) setEvents(evtRes.value.events);

            try { const pRes = await getMembershipPlans(); if (pRes?.plans) setPlans(pRes.plans); } catch { }
            try { const nRes = await getNotifications(); if (nRes?.notifications) setNotifications(nRes.notifications); } catch { }
            try { const prRes = await getProfile(); if (prRes?.user) setProfile(prRes.user); } catch { }
        } catch (err) { console.error('Load error:', err); }
        setLoading(false);
    };

    const handleRegister = async (eventId) => {
        try {
            const res = await registerForEvent(eventId);
            if (res.success) showAlert('success', 'Registered!', 'You have been registered for this event.');
            else showAlert('error', 'Failed', res.message || 'Could not register');
        } catch (err) {
            showAlert('error', 'Error', err.response?.data?.detail || 'Registration failed');
        }
    };

    const handleSubscribe = async (planId) => {
        try {
            const res = await subscribeToPlan(planId);
            if (res.success) {
                showAlert('success', 'Subscribed!', res.message);
                loadData();
            } else showAlert('error', 'Failed', res.message);
        } catch (err) {
            showAlert('error', 'Error', err.response?.data?.detail || 'Subscription failed');
        }
    };

    const getPageTitle = () => {
        const titles = { home: 'Welcome Back!', profile: 'My Profile', events: 'Browse Events', membership: 'Membership', notifications: 'Notifications' };
        return titles[activePage] || 'Dashboard';
    };
    const getPageSubtitle = () => {
        const subs = { home: `Good to see you, ${displayName}`, profile: 'View and manage your profile', events: 'Explore upcoming events', membership: 'Join the Telugu Mahasabha community', notifications: 'Stay updated' };
        return subs[activePage] || '';
    };

    if (loading) return <Layout pageTitle="Loading..." pageSubtitle=""><div className="page-loader"><div className="spinner"></div></div></Layout>;

    return (
        <Layout pageTitle={getPageTitle()} pageSubtitle={getPageSubtitle()}>
            {/* ═══ HOME ═══ */}
            {activePage === 'home' && (
                <>
                    {/* Welcome Banner — compact */}
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(108,60,225,0.15), rgba(139,92,246,0.08))',
                        border: '1px solid rgba(108,60,225,0.25)', borderRadius: '16px',
                        padding: '20px 24px', marginBottom: '16px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        position: 'relative', overflow: 'hidden'
                    }}>
                        <div style={{ position: 'absolute', right: '-10px', top: '-10px', fontSize: '80px', opacity: 0.06, pointerEvents: 'none' }}>🕉️</div>
                        <div>
                            <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '4px', color: 'var(--text-primary)' }}>
                                నమస్కారం, {displayName}!
                            </h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', maxWidth: '380px', lineHeight: 1.5 }}>
                                Welcome to the Digital Telugu Mahasabha Platform. Become a member for exclusive access.
                            </p>
                            <button className="btn btn-primary" style={{ marginTop: '10px', padding: '7px 16px', fontSize: '12px' }}
                                onClick={() => navigate('/user/membership')}>🪙 Upgrade to Member</button>
                        </div>
                    </div>

                    {/* Stats — full width, single row */}
                    <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                        <div className="stat-card">
                            <div className="stat-icon purple">📅</div>
                            <div className="stat-info"><div className="stat-label">Events</div><div className="stat-value">{events.length}</div></div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon green">🆓</div>
                            <div className="stat-info"><div className="stat-label">Free Events</div><div className="stat-value">{events.filter(e => e.is_free).length}</div></div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon orange">🔔</div>
                            <div className="stat-info"><div className="stat-label">Notifications</div><div className="stat-value">{notifications.length}</div></div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon blue">🌍</div>
                            <div className="stat-info"><div className="stat-label">Cities</div><div className="stat-value">{new Set(events.map(e => e.city).filter(Boolean)).size || '4+'}</div></div>
                        </div>
                    </div>

                    {/* Quick actions + Upcoming events side by side */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <div className="quick-actions" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: '0' }}>
                                <div className="quick-action-card" onClick={() => navigate('/user/events')}>
                                    <div className="qa-icon" style={{ background: 'linear-gradient(135deg, #6C3CE1, #8B5CF6)' }}>📅</div>
                                    <div className="qa-info"><h3>Browse Events</h3><p>{events.length} available</p></div>
                                </div>
                                <div className="quick-action-card" onClick={() => navigate('/user/membership')}>
                                    <div className="qa-icon" style={{ background: 'linear-gradient(135deg, #F59E0B, #FCD34D)' }}>🪙</div>
                                    <div className="qa-info"><h3>Membership</h3><p>Join now</p></div>
                                </div>
                                <div className="quick-action-card" onClick={() => navigate('/user/profile')}>
                                    <div className="qa-icon" style={{ background: 'linear-gradient(135deg, #3B82F6, #60A5FA)' }}>👤</div>
                                    <div className="qa-info"><h3>My Profile</h3><p>Update info</p></div>
                                </div>
                                <div className="quick-action-card" onClick={() => navigate('/user/notifications')}>
                                    <div className="qa-icon" style={{ background: 'linear-gradient(135deg, #10B981, #6EE7B7)' }}>🔔</div>
                                    <div className="qa-info"><h3>Notifications</h3><p>{notifications.filter(n => !n.is_read).length} unread</p></div>
                                </div>
                            </div>
                        </div>
                        <div className="card">
                            <div className="card-header"><div className="card-title">Upcoming Events</div></div>
                            <div className="card-body" style={{ padding: '12px 16px' }}>
                                {events.length === 0 ? (
                                    <p className="text-muted">No events available right now.</p>
                                ) : events.slice(0, 4).map(event => (
                                    <div key={event.id} style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        padding: '8px 0', borderBottom: '1px solid var(--border-color)'
                                    }}>
                                        <div>
                                            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{event.title}</div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{event.city} • {new Date(event.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                                        </div>
                                        <span className="badge" style={{ background: event.is_free ? 'rgba(16,185,129,0.2)' : 'rgba(108,60,225,0.2)', color: event.is_free ? '#6EE7B7' : '#A78BFA', border: 'none', fontSize: '10px' }}>
                                            {event.is_free ? 'Free' : `₹${event.fee}`}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* ═══ EVENTS ═══ */}
            {activePage === 'events' && (
                <div className="card">
                    <div className="card-header">
                        <div className="card-title">All Events</div>
                        <span className="badge badge-info">{events.length} events</span>
                    </div>
                    <div className="table-wrapper">
                        <table>
                            <thead><tr><th>Event</th><th>Date</th><th>Location</th><th>Type</th><th>Fee</th><th>Action</th></tr></thead>
                            <tbody>
                                {events.map(event => (
                                    <tr key={event.id}>
                                        <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{event.title}</td>
                                        <td>{new Date(event.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                        <td>{event.city || event.location || 'Online'}</td>
                                        <td><span className="badge badge-info">{event.event_type}</span></td>
                                        <td style={{ color: event.is_free ? 'var(--success)' : 'var(--text-primary)', fontWeight: 600 }}>
                                            {event.is_free ? 'Free' : `₹${event.fee}`}
                                        </td>
                                        <td><button className="btn btn-primary btn-sm" onClick={() => handleRegister(event.id)}>Register</button></td>
                                    </tr>
                                ))}
                                {events.length === 0 && <tr><td colSpan="6" className="no-data">No events available</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ═══ MEMBERSHIP ═══ */}
            {activePage === 'membership' && (
                <div className="card">
                    <div className="card-header"><div className="card-title">Membership Plans</div></div>
                    <div className="card-body">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                            {(plans.length > 0 ? plans : [
                                { id: 'annual', name: 'Annual Membership', price: 1200, duration_months: 12, is_lifetime: false, features: ['All events access', 'Digital membership card', 'Forum participation', 'Learning resources', 'Community directory'] },
                                { id: 'lifetime', name: 'Lifetime Membership', price: 10000, is_lifetime: true, features: ['Everything in Annual', 'Lifetime access', 'Priority seating', 'Exclusive badge', 'Dedicated support'] },
                            ]).map(plan => (
                                <div key={plan.id} style={{
                                    background: plan.is_lifetime ? 'linear-gradient(135deg, rgba(108,60,225,0.15), rgba(139,92,246,0.08))' : 'var(--bg-tertiary)',
                                    border: `1px solid ${plan.is_lifetime ? 'rgba(108,60,225,0.4)' : 'var(--border-color)'}`,
                                    borderRadius: '16px', padding: '24px', position: 'relative'
                                }}>
                                    {plan.is_lifetime && <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'var(--accent)', color: 'var(--text-inverse)', fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '9999px' }}>POPULAR</div>}
                                    <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>{plan.name}</div>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '16px' }}>
                                        <span style={{ fontSize: '28px', fontWeight: 800, color: plan.is_lifetime ? 'var(--primary-light)' : 'var(--text-primary)' }}>₹{plan.price?.toLocaleString()}</span>
                                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{plan.is_lifetime ? ' one-time' : `/${plan.duration_months || 12}mo`}</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                                        {(plan.features || []).map(f => (
                                            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                                                <span style={{ color: 'var(--success)', fontWeight: 700 }}>✓</span> {f}
                                            </div>
                                        ))}
                                    </div>
                                    <button className={`btn ${plan.is_lifetime ? 'btn-primary' : 'btn-secondary'}`} style={{ width: '100%' }}
                                        onClick={() => handleSubscribe(plan.id)}>Join Now</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ PROFILE ═══ */}
            {activePage === 'profile' && (
                <div className="card">
                    <div className="card-header"><div className="card-title">My Profile</div></div>
                    <div className="card-body">
                        <div className="detail-list">
                            <div className="detail-row"><label>Full Name</label><span>{profile?.full_name || displayName}</span></div>
                            <div className="detail-row"><label>Email</label><span>{profile?.email || userData?.email || '—'}</span></div>
                            <div className="detail-row"><label>Phone</label><span>{profile?.phone || '—'}</span></div>
                            <div className="detail-row"><label>Role</label><span className="badge badge-user">{profile?.role_name || 'user'}</span></div>
                            <div className="detail-row"><label>Verified</label><span className={`badge ${profile?.is_verified ? 'status-verified' : 'status-unverified'}`}>{profile?.is_verified ? 'Yes' : 'No'}</span></div>
                            <div className="detail-row"><label>Member Since</label><span>{profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-IN') : '—'}</span></div>
                            {profile?.membership && (
                                <div className="detail-row"><label>Membership</label><span className="badge badge-member">{profile.membership.plan_name} — {profile.membership.status}</span></div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ NOTIFICATIONS ═══ */}
            {activePage === 'notifications' && (
                <div className="card">
                    <div className="card-header"><div className="card-title">Notifications</div><span className="badge badge-info">{notifications.filter(n => !n.is_read).length} unread</span></div>
                    <div className="card-body" style={{ padding: 0 }}>
                        {notifications.length === 0 ? (
                            <div className="empty-state"><div className="empty-state-icon">🔔</div><h3>No notifications</h3><p>You're all caught up!</p></div>
                        ) : notifications.map(n => (
                            <div key={n.id} style={{
                                display: 'flex', alignItems: 'center', gap: '12px',
                                padding: '12px 16px', borderBottom: '1px solid var(--border-color)',
                                background: n.is_read ? 'transparent' : 'rgba(108,60,225,0.05)'
                            }}>
                                <div style={{ fontSize: '20px' }}>{n.type === 'event' ? '📅' : n.type === 'payment' ? '💳' : '🔔'}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{n.title}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{n.message}</div>
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                    {n.created_at ? new Date(n.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default UserDashboard;
