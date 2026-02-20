/**
 * CommitteeDashboard.jsx
 * 
 * Committee Member dashboard — PRD Section 3.1.5
 * Can create announcements/events and view limited reports.
 */

import React from 'react';
import Layout from '../../components/Layout.jsx';

const CommitteeDashboard = () => {
    return (
        <Layout pageTitle="Committee Dashboard" pageSubtitle="Announcements, Events & Reports">

            {/* Stats Overview */}
            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '28px' }}>
                <div className="stat-card">
                    <div className="stat-card-icon" style={{ background: 'linear-gradient(135deg, #F97316, #EA580C)' }}>📣</div>
                    <div className="stat-card-content">
                        <p className="stat-card-label">Announcements</p>
                        <h3 className="stat-card-value">0</h3>
                        <p className="stat-card-change positive">Coming soon</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-icon" style={{ background: 'linear-gradient(135deg, #60A5FA, #3B82F6)' }}>📅</div>
                    <div className="stat-card-content">
                        <p className="stat-card-label">Upcoming Events</p>
                        <h3 className="stat-card-value">0</h3>
                        <p className="stat-card-change">Coming soon</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-icon" style={{ background: 'linear-gradient(135deg, #34D399, #059669)' }}>👥</div>
                    <div className="stat-card-content">
                        <p className="stat-card-label">Active Members</p>
                        <h3 className="stat-card-value">0</h3>
                        <p className="stat-card-change">Coming soon</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-icon" style={{ background: 'linear-gradient(135deg, #A78BFA, #7C3AED)' }}>📊</div>
                    <div className="stat-card-content">
                        <p className="stat-card-label">Reports</p>
                        <h3 className="stat-card-value">0</h3>
                        <p className="stat-card-change">Coming soon</p>
                    </div>
                </div>
            </div>

            {/* Placeholder content */}
            <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏛️</div>
                <h2 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Committee Dashboard</h2>
                <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto' }}>
                    This dashboard allows committee members to manage announcements,
                    create events, and view limited community reports as defined in PRD Section 3.2.
                </p>
            </div>

        </Layout>
    );
};

export default CommitteeDashboard;
