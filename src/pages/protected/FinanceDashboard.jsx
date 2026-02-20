/**
 * FinanceDashboard.jsx
 * 
 * Finance Admin dashboard — PRD Section 5.8 (Payments & Receipts)
 * Manages payments, receipts, donation reports.
 */

import React from 'react';
import Layout from '../../components/Layout.jsx';

const FinanceDashboard = () => {
    return (
        <Layout pageTitle="Finance Dashboard" pageSubtitle="Payments, Receipts & Donations">

            {/* Stats Overview */}
            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '28px' }}>
                <div className="stat-card">
                    <div className="stat-card-icon" style={{ background: 'linear-gradient(135deg, #34D399, #059669)' }}>💳</div>
                    <div className="stat-card-content">
                        <p className="stat-card-label">Total Payments</p>
                        <h3 className="stat-card-value">₹0</h3>
                        <p className="stat-card-change positive">Coming soon</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-icon" style={{ background: 'linear-gradient(135deg, #60A5FA, #3B82F6)' }}>🧾</div>
                    <div className="stat-card-content">
                        <p className="stat-card-label">Receipts Generated</p>
                        <h3 className="stat-card-value">0</h3>
                        <p className="stat-card-change">Coming soon</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-icon" style={{ background: 'linear-gradient(135deg, #F472B6, #EC4899)' }}>🎁</div>
                    <div className="stat-card-content">
                        <p className="stat-card-label">Donations</p>
                        <h3 className="stat-card-value">₹0</h3>
                        <p className="stat-card-change">Coming soon</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-icon" style={{ background: 'linear-gradient(135deg, #A78BFA, #7C3AED)' }}>📊</div>
                    <div className="stat-card-content">
                        <p className="stat-card-label">Pending</p>
                        <h3 className="stat-card-value">0</h3>
                        <p className="stat-card-change">Coming soon</p>
                    </div>
                </div>
            </div>

            {/* Placeholder content */}
            <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>💰</div>
                <h2 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Finance Admin Dashboard</h2>
                <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto' }}>
                    This dashboard will manage all payment processing, receipt generation, donation tracking,
                    and financial reports as defined in PRD Section 5.8.
                </p>
            </div>

        </Layout>
    );
};

export default FinanceDashboard;
