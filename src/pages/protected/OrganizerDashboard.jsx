import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../../components/Layout';
import { showAlert, showConfirmDialog } from '../../utils/alerts';

const OrganizerDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const path = location.pathname;
    const activePage = path.includes('/events/create') ? 'create'
        : path.includes('/events') ? 'events'
            : path.includes('/registrations') ? 'registrations'
                : path.includes('/invitations') ? 'invitations'
                    : path.includes('/analytics') ? 'analytics'
                        : path.includes('/revenue') ? 'revenue'
                            : 'dashboard';
    const PAGE_TITLES = {
        dashboard: ['Organizer Dashboard', 'Create and manage Telugu Mahasabha events'],
        events: ['My Events', 'Manage all your created events'],
        create: ['Create Event', 'Plan a new event'],
        registrations: ['Registrations', 'View event registrations'],
        invitations: ['Invitations', 'Send event invitations'],
        analytics: ['Event Analytics', 'View event performance'],
        revenue: ['Revenue', 'Track event revenue'],
    };
    const [activeTab, setActiveTab] = useState('events');

    const [events, setEvents] = useState([
        { id: 1, title: 'Ugadi Celebrations 2026', date: '2026-03-30', location: 'Hyderabad Convention Center', registered: 248, capacity: 500, status: 'published', revenue: 49600 },
        { id: 2, title: 'Telugu Cultural Night', date: '2026-04-14', location: 'Mumbai', registered: 125, capacity: 300, status: 'published', revenue: 25000 },
        { id: 3, title: 'Language Workshop – Beginners', date: '2026-05-01', location: 'Online (Zoom)', registered: 60, capacity: 100, status: 'draft', revenue: 0 },
        { id: 4, title: 'Annual Mahasabha Conference', date: '2026-06-15', location: 'Bangalore International', registered: 0, capacity: 1000, status: 'draft', revenue: 0 },
    ]);

    const stats = {
        totalEvents: events.length,
        publishedEvents: events.filter(e => e.status === 'published').length,
        totalRegistrations: events.reduce((a, b) => a + b.registered, 0),
        totalRevenue: events.reduce((a, b) => a + b.revenue, 0),
        avgAttendance: Math.round(events.filter(e => e.registered > 0).reduce((a, b) => a + (b.registered / b.capacity) * 100, 0) / events.filter(e => e.registered > 0).length),
    };

    const handleDeleteEvent = async (eventId) => {
        const confirmed = await showConfirmDialog('Delete Event', 'Are you sure you want to delete this event?', 'Delete', 'Cancel');
        if (confirmed) {
            setEvents(prev => prev.filter(e => e.id !== eventId));
            showAlert('success', 'Deleted!', 'Event deleted successfully.');
        }
    };

    const handlePublish = (eventId) => {
        setEvents(prev => prev.map(e => e.id === eventId ? { ...e, status: 'published' } : e));
        showAlert('success', 'Published!', 'Event is now live.');
    };

    return (
        <Layout pageTitle={PAGE_TITLES[activePage]?.[0] || 'Organizer'} pageSubtitle={PAGE_TITLES[activePage]?.[1] || ''}>
            {!['dashboard', 'events', 'registrations'].includes(activePage) && (
                <div className="card"><div className="card-header"><div className="card-title">{PAGE_TITLES[activePage]?.[0]}</div></div>
                    <div className="card-body"><div className="empty-state"><div className="empty-state-icon">🚧</div><h3>Coming Soon</h3><p>This section is under development.</p>
                        <button className="btn btn-primary" onClick={() => navigate('/organizer/dashboard')}>← Back to Dashboard</button></div></div></div>
            )}
            {['dashboard', 'events', 'registrations'].includes(activePage) && (
                <>
                    {/* Stats */}
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon purple">📅</div>
                            <div className="stat-info">
                                <div className="stat-label">Total Events</div>
                                <div className="stat-value">{stats.totalEvents}</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon green">✅</div>
                            <div className="stat-info">
                                <div className="stat-label">Published</div>
                                <div className="stat-value">{stats.publishedEvents}</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon blue">🎫</div>
                            <div className="stat-info">
                                <div className="stat-label">Registrations</div>
                                <div className="stat-value">{stats.totalRegistrations}</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon orange">💰</div>
                            <div className="stat-info">
                                <div className="stat-label">Total Revenue</div>
                                <div className="stat-value">₹{stats.totalRevenue.toLocaleString()}</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon teal">📊</div>
                            <div className="stat-info">
                                <div className="stat-label">Avg Attendance</div>
                                <div className="stat-value">{stats.avgAttendance}%</div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="quick-actions">
                        <div className="quick-action-card" onClick={() => navigate('/organizer/events/create')}>
                            <div className="qa-icon" style={{ background: 'linear-gradient(135deg, #6C3CE1, #8B5CF6)' }}>➕</div>
                            <div className="qa-info">
                                <h3>Create Event</h3>
                                <p>Start planning a new event</p>
                            </div>
                        </div>
                        <div className="quick-action-card">
                            <div className="qa-icon" style={{ background: 'linear-gradient(135deg, #F59E0B, #FCD34D)' }}>🎫</div>
                            <div className="qa-info">
                                <h3>View Registrations</h3>
                                <p>See who's attending</p>
                            </div>
                        </div>
                        <div className="quick-action-card">
                            <div className="qa-icon" style={{ background: 'linear-gradient(135deg, #10B981, #6EE7B7)' }}>✉️</div>
                            <div className="qa-info">
                                <h3>Send Invitations</h3>
                                <p>Invite members to events</p>
                            </div>
                        </div>
                        <div className="quick-action-card">
                            <div className="qa-icon" style={{ background: 'linear-gradient(135deg, #3B82F6, #60A5FA)' }}>📊</div>
                            <div className="qa-info">
                                <h3>Analytics</h3>
                                <p>View event performance</p>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="tabs">
                        <button className={`tab-btn ${activeTab === 'events' ? 'active' : ''}`} onClick={() => setActiveTab('events')}>
                            📅 My Events <span className="tab-count">{events.length}</span>
                        </button>
                        <button className={`tab-btn ${activeTab === 'registrations' ? 'active' : ''}`} onClick={() => setActiveTab('registrations')}>
                            🎫 Registrations <span className="tab-count">{stats.totalRegistrations}</span>
                        </button>
                    </div>

                    {/* Events Table */}
                    {activeTab === 'events' && (
                        <div className="card">
                            <div className="card-header">
                                <div>
                                    <div className="card-title">My Events</div>
                                    <div className="card-subtitle">Manage all your created events</div>
                                </div>
                                <button className="btn btn-primary btn-sm" onClick={() => navigate('/organizer/events/create')}>
                                    ➕ Create Event
                                </button>
                            </div>
                            <div className="table-wrapper">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Event Title</th>
                                            <th>Date</th>
                                            <th>Location</th>
                                            <th>Registered</th>
                                            <th>Revenue</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {events.map(event => (
                                            <tr key={event.id}>
                                                <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{event.title}</td>
                                                <td>{new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                                <td>{event.location}</td>
                                                <td>
                                                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{event.registered}</span>
                                                    <span style={{ color: 'var(--text-muted)' }}> / {event.capacity}</span>
                                                </td>
                                                <td style={{ color: 'var(--success)', fontWeight: 600 }}>₹{event.revenue.toLocaleString()}</td>
                                                <td>
                                                    {event.status === 'published' ? (
                                                        <span className="badge status-active">● Published</span>
                                                    ) : (
                                                        <span className="badge status-unverified">◌ Draft</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <button className="action-btn view" title="View">👁️</button>
                                                    <button className="action-btn edit" title="Edit">✏️</button>
                                                    {event.status === 'draft' && (
                                                        <button className="action-btn toggle" title="Publish" onClick={() => handlePublish(event.id)}>🚀</button>
                                                    )}
                                                    <button className="action-btn delete" title="Delete" onClick={() => handleDeleteEvent(event.id)}>🗑️</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Registrations Tab */}
                    {activeTab === 'registrations' && (
                        <div className="card">
                            <div className="card-header">
                                <div className="card-title">Event Registrations</div>
                            </div>
                            <div className="card-body">
                                {events.filter(e => e.registered > 0).map(event => (
                                    <div key={event.id} style={{
                                        background: 'var(--bg-tertiary)',
                                        borderRadius: '12px',
                                        padding: '16px',
                                        marginBottom: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        border: '1px solid var(--border-color)'
                                    }}>
                                        <div>
                                            <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>{event.title}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(event.date).toLocaleDateString()}</div>
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--primary-light)' }}>{event.registered}</div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>registered</div>
                                        </div>
                                        <div style={{ width: '120px' }}>
                                            <div style={{ background: 'var(--border-color)', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                                                <div style={{
                                                    background: 'linear-gradient(90deg, var(--primary), var(--primary-light))',
                                                    width: `${Math.min((event.registered / event.capacity) * 100, 100)}%`,
                                                    height: '100%',
                                                    borderRadius: '4px'
                                                }} />
                                            </div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', textAlign: 'center' }}>
                                                {Math.round((event.registered / event.capacity) * 100)}% full
                                            </div>
                                        </div>
                                        <button className="btn btn-secondary btn-sm">View List</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </Layout>
    );
};

export default OrganizerDashboard;
