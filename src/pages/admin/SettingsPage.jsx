import React from 'react';
import Layout from '../../components/Layout';

const SettingsPage = () => {
    return (
        <Layout pageTitle="Settings" pageSubtitle="Configure platform settings">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="card">
                    <div className="card-header"><div className="card-title">General Settings</div></div>
                    <div className="card-body">
                        <div className="detail-list">
                            <div className="detail-row"><label>Platform Name</label><span>MTM Platform</span></div>
                            <div className="detail-row"><label>Organization</label><span>Mauritius Telugu Mahasabha</span></div>
                            <div className="detail-row"><label>Default Role</label><span className="badge badge-member">member</span></div>
                            <div className="detail-row"><label>OTP Expiry</label><span>5 minutes</span></div>
                            <div className="detail-row"><label>Max Login Attempts</label><span>5</span></div>
                        </div>
                    </div>
                </div>
                <div className="card">
                    <div className="card-header"><div className="card-title">Email Configuration</div></div>
                    <div className="card-body">
                        <div className="detail-list">
                            <div className="detail-row"><label>SMTP Provider</label><span>Configured</span></div>
                            <div className="detail-row"><label>From Email</label><span>noreply@mtm.com</span></div>
                            <div className="detail-row"><label>OTP Template</label><span className="badge status-active">Active</span></div>
                            <div className="detail-row"><label>Welcome Email</label><span className="badge status-active">Active</span></div>
                        </div>
                    </div>
                </div>
                <div className="card">
                    <div className="card-header"><div className="card-title">Payment Gateway</div></div>
                    <div className="card-body">
                        <div className="detail-list">
                            <div className="detail-row"><label>Gateway</label><span>Razorpay</span></div>
                            <div className="detail-row"><label>Mode</label><span className="badge badge-draft">Test Mode</span></div>
                            <div className="detail-row"><label>Key ID</label><span>rzp_test_***</span></div>
                            <div className="detail-row"><label>Webhooks</label><span className="badge status-active">Configured</span></div>
                        </div>
                    </div>
                </div>
                <div className="card">
                    <div className="card-header"><div className="card-title">Security</div></div>
                    <div className="card-body">
                        <div className="detail-list">
                            <div className="detail-row"><label>Authentication</label><span>OTP-only (No passwords)</span></div>
                            <div className="detail-row"><label>JWT Token Expiry</label><span>30 minutes</span></div>
                            <div className="detail-row"><label>Refresh Token Expiry</label><span>7 days</span></div>
                            <div className="detail-row"><label>CORS</label><span className="badge status-active">Enabled</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default SettingsPage;
