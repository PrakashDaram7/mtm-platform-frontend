import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { getDashboardAnalytics, getUsers } from '../../services/dashboardService';

const AnalyticsPage = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        try {
            const res = await getDashboardAnalytics();
            if (res.success) setAnalytics(res.analytics);
        } catch (err) {
            console.error('Analytics error:', err);
        } finally { setLoading(false); }
    };

    if (loading) {
        return (
            <Layout pageTitle="Analytics" pageSubtitle="Platform usage and performance metrics">
                <div className="page-loader"><div className="spinner"></div></div>
            </Layout>
        );
    }

    const metrics = analytics ? [
        { icon: '👥', label: 'Total Users', value: analytics.total_users, color: '#6C3CE1' },
        { icon: '✅', label: 'Active Users', value: analytics.active_users, color: '#10B981' },
        { icon: '📧', label: 'Verified Users', value: analytics.verified_users, color: '#3B82F6' },
        { icon: '⏸️', label: 'Inactive Users', value: analytics.inactive_users, color: '#EF4444' },
        { icon: '🔒', label: 'Admin Users', value: analytics.admin_users, color: '#F59E0B' },
        { icon: '🪪', label: 'Members', value: analytics.member_users, color: '#06B6D4' },
    ] : [];

    const activePct = analytics && analytics.total_users > 0
        ? Math.round((analytics.active_users / analytics.total_users) * 100) : 0;
    const verifiedPct = analytics && analytics.total_users > 0
        ? Math.round((analytics.verified_users / analytics.total_users) * 100) : 0;

    return (
        <Layout pageTitle="Analytics" pageSubtitle="Platform usage and performance metrics">
            {/* Stats */}
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', marginBottom: '24px' }}>
                {metrics.map(m => (
                    <div className="stat-card" key={m.label}>
                        <div className={`stat-icon`} style={{ background: `${m.color}15`, color: m.color }}>{m.icon}</div>
                        <div className="stat-info"><div className="stat-label">{m.label}</div><div className="stat-value">{m.value}</div></div>
                    </div>
                ))}
            </div>

            {/* Charts Placeholder */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="card">
                    <div className="card-header"><div className="card-title">User Activity</div></div>
                    <div className="card-body">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                                    <span>Active Users</span><span style={{ fontWeight: 600 }}>{activePct}%</span>
                                </div>
                                <div style={{ background: 'var(--bg-tertiary)', borderRadius: '8px', height: '10px', overflow: 'hidden' }}>
                                    <div style={{ width: `${activePct}%`, height: '100%', background: 'linear-gradient(90deg, #10B981, #6EE7B7)', borderRadius: '8px', transition: 'width 0.6s ease' }}></div>
                                </div>
                            </div>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                                    <span>Verified Users</span><span style={{ fontWeight: 600 }}>{verifiedPct}%</span>
                                </div>
                                <div style={{ background: 'var(--bg-tertiary)', borderRadius: '8px', height: '10px', overflow: 'hidden' }}>
                                    <div style={{ width: `${verifiedPct}%`, height: '100%', background: 'linear-gradient(90deg, #3B82F6, #60A5FA)', borderRadius: '8px', transition: 'width 0.6s ease' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="card">
                    <div className="card-header"><div className="card-title">Role Distribution</div></div>
                    <div className="card-body">
                        {analytics && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {[
                                    { role: 'Admin', count: analytics.admin_users, color: '#F59E0B' },
                                    { role: 'Members', count: analytics.member_users, color: '#6C3CE1' },
                                    { role: 'Other', count: Math.max(0, analytics.total_users - analytics.admin_users - analytics.member_users), color: '#06B6D4' },
                                ].map(r => (
                                    <div key={r.role} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: r.color, flexShrink: 0 }}></div>
                                        <span style={{ fontSize: '13px', flex: 1 }}>{r.role}</span>
                                        <span style={{ fontWeight: 700, fontSize: '14px' }}>{r.count}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default AnalyticsPage;
