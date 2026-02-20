/**
 * EventManagerDashboard.jsx
 * 
 * Event Manager dashboard — PRD Section 5.5 (Events Management)
 * Manages events, registrations, attendance, and volunteers.
 */

import React from 'react';
import Layout from '../../components/Layout.jsx';

const EventManagerDashboard = () => {
    return (
        <Layout pageTitle="Event Manager Dashboard" pageSubtitle="Events, Registrations & Volunteers">

            {/* Stats Overview */}
            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '28px' }}>
                <div className="stat-card">
                    <div className="stat-card-icon" style={{ background: 'linear-gradient(135deg, #FCD34D, #F59E0B)' }}>📅</div>
                    <div className="stat-card-content">
                        <p className="stat-card-label">Active Events</p>
                        <h3 className="stat-card-value">0</h3>
                        <p className="stat-card-change positive">Coming soon</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-icon" style={{ background: 'linear-gradient(135deg, #60A5FA, #3B82F6)' }}>🎫</div>
                    <div className="stat-card-content">
                        <p className="stat-card-label">Registrations</p>
                        <h3 className="stat-card-value">0</h3>
                        <p className="stat-card-change">Coming soon</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-icon" style={{ background: 'linear-gradient(135deg, #34D399, #059669)' }}>✅</div>
                    <div className="stat-card-content">
                        <p className="stat-card-label">Attendance Rate</p>
                        <h3 className="stat-card-value">0%</h3>
                        <p className="stat-card-change">Coming soon</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-icon" style={{ background: 'linear-gradient(135deg, #F472B6, #EC4899)' }}>🙋</div>
                    <div className="stat-card-content">
                        <p className="stat-card-label">Volunteers</p>
                        <h3 className="stat-card-value">0</h3>
                        <p className="stat-card-change">Coming soon</p>
                    </div>
                </div>
            </div>

            {/* Placeholder content */}
            <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎪</div>
                <h2 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Event Manager Dashboard</h2>
                <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto' }}>
                    This dashboard will manage event creation, RSVP tracking, attendance marking,
                    volunteer assignments, and duty rosters as defined in PRD Sections 5.5 & 5.6.
                </p>
            </div>

        </Layout>
    );
};

export default EventManagerDashboard;
