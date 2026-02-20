import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { getDashboardAnalytics, getUsers } from '../../services/dashboardService';

const AdminOverview = () => {
    const navigate = useNavigate();
    const [analytics, setAnalytics] = useState(null);
    const [recentUsers, setRecentUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [analyticsRes, usersRes] = await Promise.all([
                getDashboardAnalytics(),
                getUsers(0, 5)
            ]);
            if (analyticsRes.success) setAnalytics(analyticsRes.analytics);
            if (usersRes.success) setRecentUsers(usersRes.users || []);
        } catch (err) {
            console.error('Dashboard load error:', err);
        } finally {
            setLoading(false);
        }
    };

    const getRoleBadgeClass = (r) => ({
        admin: 'badge-admin', moderator: 'badge-moderator', event_manager: 'badge-organizer',
        finance_admin: 'badge-admin', committee_member: 'badge-moderator', member: 'badge-member',
        family_member: 'badge-member', volunteer: 'badge-user'
    }[r?.toLowerCase()] || 'badge-member');

    if (loading) {
        return (
            <Layout pageTitle="Admin Dashboard" pageSubtitle="Platform overview and quick actions">
                <div className="page-loader"><div className="spinner"></div><span className="loading-text">Loading...</span></div>
            </Layout>
        );
    }

    return (
        <Layout pageTitle="Admin Dashboard" pageSubtitle="Platform overview and quick actions">
            {/* Stats Grid */}
            {analytics && (
                <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
                    {[
                        { icon: '👥', label: 'Total Users', value: analytics.total_users, cls: 'purple' },
                        { icon: '✅', label: 'Active', value: analytics.active_users, cls: 'green' },
                        { icon: '📧', label: 'Verified', value: analytics.verified_users, cls: 'blue' },
                        { icon: '🔒', label: 'Admins', value: analytics.admin_users, cls: 'orange' },
                        { icon: '🪪', label: 'Members', value: analytics.member_users, cls: 'teal' },
                        { icon: '⏸️', label: 'Inactive', value: analytics.inactive_users, cls: 'red' },
                    ].map(s => (
                        <div className="stat-card" key={s.label}>
                            <div className={`stat-icon ${s.cls}`}>{s.icon}</div>
                            <div className="stat-info">
                                <div className="stat-label">{s.label}</div>
                                <div className="stat-value">{s.value}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Quick Actions */}
            <div className="quick-actions" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                <div className="quick-action-card" onClick={() => navigate('/admin/users')}>
                    <div className="qa-icon" style={{ background: 'linear-gradient(135deg, #6C3CE1, #8B5CF6)' }}>👥</div>
                    <div className="qa-info"><h3>User Management</h3><p>Manage platform users</p></div>
                </div>
                <div className="quick-action-card" onClick={() => navigate('/admin/roles')}>
                    <div className="qa-icon" style={{ background: 'linear-gradient(135deg, #10B981, #6EE7B7)' }}>🔑</div>
                    <div className="qa-info"><h3>Role Management</h3><p>Configure roles</p></div>
                </div>
                <div className="quick-action-card" onClick={() => navigate('/admin/events')}>
                    <div className="qa-icon" style={{ background: 'linear-gradient(135deg, #F59E0B, #FCD34D)' }}>📅</div>
                    <div className="qa-info"><h3>Events</h3><p>Create & manage events</p></div>
                </div>
                <div className="quick-action-card" onClick={() => navigate('/admin/analytics')}>
                    <div className="qa-icon" style={{ background: 'linear-gradient(135deg, #3B82F6, #60A5FA)' }}>📊</div>
                    <div className="qa-info"><h3>Analytics</h3><p>View insights</p></div>
                </div>
            </div>

            {/* Recent Users Table */}
            <div className="card">
                <div className="card-header">
                    <div className="card-title">Recent Users</div>
                    <button className="btn btn-secondary btn-sm" onClick={() => navigate('/admin/users')}>View All →</button>
                </div>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr><th>S.No</th><th>Name</th><th>Email</th><th>Role</th><th>Status</th></tr>
                        </thead>
                        <tbody>
                            {recentUsers.length > 0 ? recentUsers.map((u, idx) => (
                                <tr key={u.id}>
                                    <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{idx + 1}</td>
                                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{u.full_name}</td>
                                    <td>{u.email}</td>
                                    <td><span className={`badge ${getRoleBadgeClass(u.role_name)}`}>{u.role_name}</span></td>
                                    <td><span className={`badge ${u.is_active ? 'status-active' : 'status-inactive'}`}>{u.is_active ? '● Active' : '● Inactive'}</span></td>
                                </tr>
                            )) : <tr><td colSpan="5" className="no-data">No users yet</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
};

export default AdminOverview;
