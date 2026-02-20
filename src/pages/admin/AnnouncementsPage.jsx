import React from 'react';
import Layout from '../../components/Layout';

const AnnouncementsPage = () => {
    return (
        <Layout pageTitle="Announcements" pageSubtitle="Manage platform announcements">
            <div className="card">
                <div className="card-header">
                    <div className="card-title">Platform Announcements</div>
                    <button className="btn btn-primary">➕ New Announcement</button>
                </div>
                <div className="card-body">
                    <div className="empty-state">
                        <div className="empty-state-icon">📣</div>
                        <h3>No Announcements</h3>
                        <p>Create announcements to notify all platform users.</p>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default AnnouncementsPage;
