import React from 'react';
import Layout from '../../components/Layout';

const AuditLogsPage = () => {
    const logs = [
        { time: 'Just now', action: 'Admin viewed audit logs', icon: '📋', type: 'info' },
        { time: '2 min ago', action: 'User registered for event', icon: '🎫', type: 'success' },
        { time: '15 min ago', action: 'New user signed up: user@example.com', icon: '👤', type: 'info' },
        { time: '1 hour ago', action: 'Event published: Ugadi Celebrations', icon: '📅', type: 'success' },
        { time: '2 hours ago', action: 'Role updated: moderator', icon: '🔑', type: 'warning' },
        { time: '3 hours ago', action: 'System backup completed', icon: '💾', type: 'info' },
        { time: '5 hours ago', action: 'User account disabled: test@email.com', icon: '🔒', type: 'warning' },
        { time: '1 day ago', action: 'New role created: event_coordinator', icon: '🔑', type: 'info' },
        { time: '1 day ago', action: 'Payment received: ₹500 membership fee', icon: '💳', type: 'success' },
        { time: '2 days ago', action: 'System maintenance completed', icon: '🔧', type: 'info' },
    ];

    return (
        <Layout pageTitle="Audit Logs" pageSubtitle="View system activity logs">
            <div className="card">
                <div className="card-header">
                    <div className="card-title">System Activity Log</div>
                </div>
                <div className="card-body">
                    {logs.map((log, i) => (
                        <div key={i} style={{
                            display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 0',
                            borderBottom: i < logs.length - 1 ? '1px solid var(--border-color)' : 'none'
                        }}>
                            <span style={{ fontSize: '20px' }}>{log.icon}</span>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>{log.action}</div>
                            </div>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{log.time}</span>
                        </div>
                    ))}
                </div>
            </div>
        </Layout>
    );
};

export default AuditLogsPage;
