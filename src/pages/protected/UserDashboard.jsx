import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { storage } from '../../utils/storage';

const UserDashboard = () => {
    const navigate = useNavigate();
    const userData = storage.getUserData();
    const displayName = userData?.full_name || userData?.name || 'User';

    const [events] = useState([
        { id: 1, title: 'Ugadi Celebrations 2026', date: '2026-03-30', location: 'Hyderabad', type: 'Cultural', fee: 200 },
        { id: 2, title: 'Telugu Literature Meet', date: '2026-04-10', location: 'Bangalore', type: 'Education', fee: 0 },
        { id: 3, title: 'Cultural Night', date: '2026-04-14', location: 'Mumbai', type: 'Cultural', fee: 350 },
        { id: 4, title: 'Annual Conference 2026', date: '2026-06-15', location: 'Bangalore', type: 'Conference', fee: 500 },
    ]);

    const [activeTab, setActiveTab] = useState('home');

    return (
        <Layout pageTitle="Welcome Back!" pageSubtitle={`Good to see you, ${displayName}`}>
            {/* Welcome Banner */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(108,60,225,0.15) 0%, rgba(139,92,246,0.08) 100%)',
                border: '1px solid rgba(108,60,225,0.25)',
                borderRadius: '20px',
                padding: '28px 32px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute', right: '-20px', top: '-20px',
                    fontSize: '120px', opacity: 0.06, transform: 'rotate(-15deg)',
                    pointerEvents: 'none', userSelect: 'none'
                }}>🕉️</div>
                <div>
                    <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)' }}>
                        నమస్కారం, {displayName}!
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '400px', lineHeight: 1.6 }}>
                        Welcome to the Digital Telugu Mahasabha Platform. Become a member to access exclusive events,
                        resources, and connect with the Telugu community worldwide.
                    </p>
                    <button
                        className="btn btn-primary"
                        style={{ marginTop: '16px' }}
                        onClick={() => navigate('/user/membership')}
                    >
                        🪙 Upgrade to Member
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
                <div className="stat-card">
                    <div className="stat-icon purple">📅</div>
                    <div className="stat-info">
                        <div className="stat-label">Events Available</div>
                        <div className="stat-value">{events.length}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon green">🆓</div>
                    <div className="stat-info">
                        <div className="stat-label">Free Events</div>
                        <div className="stat-value">{events.filter(e => e.fee === 0).length}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon orange">🌍</div>
                    <div className="stat-info">
                        <div className="stat-label">Cities</div>
                        <div className="stat-value">4+</div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs">
                <button className={`tab-btn ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>🏠 Home</button>
                <button className={`tab-btn ${activeTab === 'events' ? 'active' : ''}`} onClick={() => setActiveTab('events')}>
                    📅 Events <span className="tab-count">{events.length}</span>
                </button>
                <button className={`tab-btn ${activeTab === 'membership' ? 'active' : ''}`} onClick={() => setActiveTab('membership')}>🪙 Membership</button>
            </div>

            {/* Home Tab */}
            {activeTab === 'home' && (
                <div>
                    <div className="quick-actions">
                        <div className="quick-action-card" onClick={() => setActiveTab('events')}>
                            <div className="qa-icon" style={{ background: 'linear-gradient(135deg, #6C3CE1, #8B5CF6)' }}>📅</div>
                            <div className="qa-info"><h3>Browse Events</h3><p>{events.length} events available</p></div>
                        </div>
                        <div className="quick-action-card">
                            <div className="qa-icon" style={{ background: 'linear-gradient(135deg, #10B981, #6EE7B7)' }}>📚</div>
                            <div className="qa-info"><h3>Learn Telugu</h3><p>Access free resources</p></div>
                        </div>
                        <div className="quick-action-card" onClick={() => setActiveTab('membership')}>
                            <div className="qa-icon" style={{ background: 'linear-gradient(135deg, #F59E0B, #FCD34D)' }}>🪙</div>
                            <div className="qa-info"><h3>Join as Member</h3><p>Unlock exclusive benefits</p></div>
                        </div>
                        <div className="quick-action-card">
                            <div className="qa-icon" style={{ background: 'linear-gradient(135deg, #3B82F6, #60A5FA)' }}>👤</div>
                            <div className="qa-info"><h3>My Profile</h3><p>Update your information</p></div>
                        </div>
                    </div>

                    {/* Feature highlights */}
                    <div className="card">
                        <div className="card-header">
                            <div className="card-title">Why Become a Member?</div>
                        </div>
                        <div className="card-body">
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                                {[
                                    { icon: '🎫', title: 'Priority Event Access', desc: 'Get early access and discounts on all events' },
                                    { icon: '🗓️', title: 'Exclusive Events', desc: 'Members-only cultural gatherings and programs' },
                                    { icon: '📚', title: 'Learning Resources', desc: 'Full access to Telugu language & culture resources' },
                                    { icon: '🤝', title: 'Community Network', desc: 'Connect with Telugu professionals worldwide' },
                                    { icon: '🪪', title: 'Digital Membership Card', desc: 'Official MTM membership identification' },
                                    { icon: '💬', title: 'Forum Access', desc: 'Participate in community discussions' },
                                ].map(feature => (
                                    <div key={feature.title} style={{
                                        background: 'var(--bg-tertiary)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '12px',
                                        padding: '16px'
                                    }}>
                                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>{feature.icon}</div>
                                        <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>{feature.title}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>{feature.desc}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Events Tab */}
            {activeTab === 'events' && (
                <div className="card">
                    <div className="card-header">
                        <div className="card-title">Upcoming Events</div>
                    </div>
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Event</th>
                                    <th>Date</th>
                                    <th>Location</th>
                                    <th>Type</th>
                                    <th>Fee</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {events.map(event => (
                                    <tr key={event.id}>
                                        <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{event.title}</td>
                                        <td>{new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                        <td>{event.location}</td>
                                        <td><span className="badge badge-info">{event.type}</span></td>
                                        <td style={{ color: event.fee === 0 ? 'var(--success)' : 'var(--text-primary)', fontWeight: 600 }}>
                                            {event.fee === 0 ? 'Free' : `₹${event.fee}`}
                                        </td>
                                        <td>
                                            <button className="btn btn-primary btn-sm">Register</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Membership Tab */}
            {activeTab === 'membership' && (
                <div className="card">
                    <div className="card-header">
                        <div className="card-title">Membership Plans</div>
                        <div className="card-subtitle">Join the Telugu Mahasabha community</div>
                    </div>
                    <div className="card-body">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
                            {[
                                { name: 'Annual Membership', price: '₹1,200', period: '/year', features: ['All events access', 'Digital membership card', 'Forum participation', 'Learning resources', 'Community directory'], highlight: false },
                                { name: 'Lifetime Membership', price: '₹10,000', period: ' one-time', features: ['Everything in Annual', 'Lifetime access', 'Priority event seating', 'Exclusive badge', 'Dedicated support'], highlight: true },
                            ].map(plan => (
                                <div key={plan.name} style={{
                                    background: plan.highlight ? 'linear-gradient(135deg, rgba(108,60,225,0.15) 0%, rgba(139,92,246,0.08) 100%)' : 'var(--bg-tertiary)',
                                    border: `1px solid ${plan.highlight ? 'rgba(108,60,225,0.4)' : 'var(--border-color)'}`,
                                    borderRadius: '16px',
                                    padding: '24px',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    {plan.highlight && (
                                        <div style={{
                                            position: 'absolute', top: '12px', right: '12px',
                                            background: 'var(--accent)', color: 'var(--text-inverse)',
                                            fontSize: '10px', fontWeight: '700', padding: '3px 8px',
                                            borderRadius: '9999px'
                                        }}>POPULAR</div>
                                    )}
                                    <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>{plan.name}</div>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '20px' }}>
                                        <span style={{ fontSize: '32px', fontWeight: '800', color: plan.highlight ? 'var(--primary-light)' : 'var(--text-primary)' }}>{plan.price}</span>
                                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{plan.period}</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                                        {plan.features.map(f => (
                                            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                                                <span style={{ color: 'var(--success)', fontWeight: '700' }}>✓</span> {f}
                                            </div>
                                        ))}
                                    </div>
                                    <button className={`btn w-full ${plan.highlight ? 'btn-primary' : 'btn-secondary'}`} style={{ width: '100%', justifyContent: 'center' }}>
                                        Join Now
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default UserDashboard;
