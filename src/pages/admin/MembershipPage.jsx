import React from 'react';
import Layout from '../../components/Layout';

const MembershipPage = () => {
    return (
        <Layout pageTitle="Membership" pageSubtitle="Manage membership registrations and renewals">
            <div className="card">
                <div className="card-header">
                    <div className="card-title">Membership Management</div>
                    <button className="btn btn-primary">➕ Register Member</button>
                </div>
                <div className="card-body">
                    <div className="empty-state">
                        <div className="empty-state-icon">🪪</div>
                        <h3>No Members Registered</h3>
                        <p>Members will appear here once the membership registration flow is implemented.</p>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default MembershipPage;
