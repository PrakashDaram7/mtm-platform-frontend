import React from 'react';
import Layout from '../../components/Layout';

const PermissionsPage = () => {
    const permissions = [
        { role: 'admin', users: '✅ Full', events: '✅ Full', payments: '✅ Full', settings: '✅ Full', analytics: '✅ Full', description: 'Full system access' },
        { role: 'finance_admin', users: '❌ No', events: '🔍 View', payments: '✅ Full', settings: '❌ No', analytics: '🔍 Finance', description: 'Financial operations only' },
        { role: 'event_manager', users: '❌ No', events: '✅ Full', payments: '🔍 Own', settings: '❌ No', analytics: '🔍 Events', description: 'Event CRUD & own payments' },
        { role: 'committee_member', users: '❌ No', events: '✅ CRUD', payments: '❌ No', settings: '❌ No', analytics: '🔍 Limited', description: 'Events & announcements' },
        { role: 'moderator', users: '🔍 View', events: '🔍 View', payments: '❌ No', settings: '❌ No', analytics: '🔍 View', description: 'Content moderation' },
        { role: 'member', users: '❌ No', events: '🔍 View', payments: '🔍 Own', settings: '❌ No', analytics: '❌ No', description: 'Basic member access' },
        { role: 'family_member', users: '❌ No', events: '🔍 View', payments: '❌ No', settings: '❌ No', analytics: '❌ No', description: 'Linked to a member' },
        { role: 'volunteer', users: '❌ No', events: '🔍 View', payments: '❌ No', settings: '❌ No', analytics: '❌ No', description: 'Volunteer event access' },
    ];

    const getRoleBadgeClass = (r) => ({
        admin: 'badge-admin', moderator: 'badge-moderator', event_manager: 'badge-organizer',
        finance_admin: 'badge-admin', committee_member: 'badge-moderator', member: 'badge-member',
        family_member: 'badge-member', volunteer: 'badge-user'
    }[r] || 'badge-member');

    return (
        <Layout pageTitle="Permissions" pageSubtitle="Role-based access control matrix (PRD Section 3.2)">
            <div className="card">
                <div className="card-header">
                    <div className="card-title">Access Control Matrix</div>
                </div>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr><th>S.No</th><th>Role</th><th>Description</th><th>Users</th><th>Events</th><th>Payments</th><th>Settings</th><th>Analytics</th></tr>
                        </thead>
                        <tbody>
                            {permissions.map((p, idx) => (
                                <tr key={p.role}>
                                    <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{idx + 1}</td>
                                    <td><span className={`badge ${getRoleBadgeClass(p.role)}`}>{p.role}</span></td>
                                    <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{p.description}</td>
                                    <td>{p.users}</td><td>{p.events}</td><td>{p.payments}</td><td>{p.settings}</td><td>{p.analytics}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
};

export default PermissionsPage;
