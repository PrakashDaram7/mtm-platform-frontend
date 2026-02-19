import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { showAlert } from '../../utils/alerts';

const ModeratorDashboard = () => {
    const navigate = useNavigate();
    const [stats] = useState({
        pendingReports: 3,
        reviewedToday: 12,
        bannedUsers: 2,
        activePosts: 156,
        flaggedContent: 7,
        resolvedThisWeek: 34
    });

    const [reports, setReports] = useState([
        { id: 1, type: 'spam', reporter: 'John Smith', content: 'Inappropriate message in forum', status: 'pending', date: '2026-02-19', priority: 'high' },
        { id: 2, type: 'harassment', reporter: 'Priya K.', content: 'Abusive comments on events page', status: 'pending', date: '2026-02-18', priority: 'high' },
        { id: 3, type: 'misinformation', reporter: 'Raju M.', content: 'Fake event listing', status: 'under_review', date: '2026-02-17', priority: 'medium' },
        { id: 4, type: 'spam', reporter: 'Anitha R.', content: 'Repeated promotional messages', status: 'resolved', date: '2026-02-16', priority: 'low' },
        { id: 5, type: 'offensive', reporter: 'Suresh B.', content: 'Offensive language in discussion', status: 'resolved', date: '2026-02-15', priority: 'medium' },
    ]);

    const [activeTab, setActiveTab] = useState('reports');

    const handleResolve = (reportId) => {
        setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: 'resolved' } : r));
        showAlert('success', 'Resolved!', 'Report has been marked as resolved.');
    };

    const handleDismiss = (reportId) => {
        setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: 'dismissed' } : r));
    };

    const getPriorityStyle = (priority) => {
        if (priority === 'high') return { background: 'rgba(239,68,68,0.2)', color: '#F87171', border: '1px solid rgba(239,68,68,0.3)' };
        if (priority === 'medium') return { background: 'rgba(245,158,11,0.2)', color: '#FCD34D', border: '1px solid rgba(245,158,11,0.3)' };
        return { background: 'rgba(107,114,128,0.2)', color: '#9CA3AF', border: '1px solid rgba(107,114,128,0.3)' };
    };

    const getStatusStyle = (status) => {
        if (status === 'pending') return { background: 'rgba(245,158,11,0.2)', color: '#FCD34D', border: '1px solid rgba(245,158,11,0.3)' };
        if (status === 'under_review') return { background: 'rgba(59,130,246,0.2)', color: '#60A5FA', border: '1px solid rgba(59,130,246,0.3)' };
        if (status === 'resolved') return { background: 'rgba(16,185,129,0.2)', color: '#6EE7B7', border: '1px solid rgba(16,185,129,0.3)' };
        return { background: 'rgba(107,114,128,0.2)', color: '#9CA3AF', border: '1px solid rgba(107,114,128,0.3)' };
    };

    const visibleReports = activeTab === 'reports'
        ? reports.filter(r => r.status === 'pending')
        : reports;

    return (
        <Layout pageTitle="Moderator Dashboard" pageSubtitle="Review content and manage community reports">
            {/* Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon orange">🚩</div>
                    <div className="stat-info">
                        <div className="stat-label">Pending Reports</div>
                        <div className="stat-value">{stats.pendingReports}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon green">✅</div>
                    <div className="stat-info">
                        <div className="stat-label">Reviewed Today</div>
                        <div className="stat-value">{stats.reviewedToday}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon blue">💬</div>
                    <div className="stat-info">
                        <div className="stat-label">Active Posts</div>
                        <div className="stat-value">{stats.activePosts}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon red">⚠️</div>
                    <div className="stat-info">
                        <div className="stat-label">Flagged Content</div>
                        <div className="stat-value">{stats.flaggedContent}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon purple">🔨</div>
                    <div className="stat-info">
                        <div className="stat-label">Banned Users</div>
                        <div className="stat-value">{stats.bannedUsers}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon teal">📋</div>
                    <div className="stat-info">
                        <div className="stat-label">Resolved (week)</div>
                        <div className="stat-value">{stats.resolvedThisWeek}</div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
                <div className="quick-action-card">
                    <div className="qa-icon" style={{ background: 'linear-gradient(135deg, #EF4444, #F87171)' }}>🚩</div>
                    <div className="qa-info">
                        <h3>Review Reports</h3>
                        <p>3 reports awaiting review</p>
                    </div>
                </div>
                <div className="quick-action-card">
                    <div className="qa-icon" style={{ background: 'linear-gradient(135deg, #3B82F6, #60A5FA)' }}>💬</div>
                    <div className="qa-info">
                        <h3>Forum Moderation</h3>
                        <p>Monitor discussions</p>
                    </div>
                </div>
                <div className="quick-action-card">
                    <div className="qa-icon" style={{ background: 'linear-gradient(135deg, #F59E0B, #FCD34D)' }}>📢</div>
                    <div className="qa-info">
                        <h3>Announcements</h3>
                        <p>Post community updates</p>
                    </div>
                </div>
                <div className="quick-action-card">
                    <div className="qa-icon" style={{ background: 'linear-gradient(135deg, #10B981, #6EE7B7)' }}>🏷️</div>
                    <div className="qa-info">
                        <h3>Manage Tags</h3>
                        <p>Organize content categories</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs">
                <button className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
                    🚩 Reports <span className="tab-count">{reports.filter(r => r.status === 'pending').length}</span>
                </button>
                <button className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
                    📋 All Reports <span className="tab-count">{reports.length}</span>
                </button>
            </div>

            {/* Reports Table */}
            <div className="card">
                <div className="card-header">
                    <div>
                        <div className="card-title">Content Reports</div>
                        <div className="card-subtitle">
                            {activeTab === 'reports' ? 'Pending reports requiring action' : 'All submitted reports'}
                        </div>
                    </div>
                </div>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Type</th>
                                <th>Reporter</th>
                                <th>Content Description</th>
                                <th>Priority</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visibleReports.map(report => (
                                <tr key={report.id}>
                                    <td style={{ color: 'var(--text-primary)', fontWeight: 500, textTransform: 'capitalize' }}>{report.type}</td>
                                    <td>{report.reporter}</td>
                                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{report.content}</td>
                                    <td>
                                        <span className="badge" style={getPriorityStyle(report.priority)}>
                                            {report.priority}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="badge" style={getStatusStyle(report.status)}>
                                            {report.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td>{report.date}</td>
                                    <td>
                                        {report.status === 'pending' && (
                                            <>
                                                <button className="action-btn view" onClick={() => handleResolve(report.id)} title="Resolve">✅</button>
                                                <button className="action-btn delete" onClick={() => handleDismiss(report.id)} title="Dismiss">❌</button>
                                            </>
                                        )}
                                        <button className="action-btn" title="View">👁️</button>
                                    </td>
                                </tr>
                            ))}
                            {visibleReports.length === 0 && (
                                <tr><td colSpan="7" className="no-data">No reports found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
};

export default ModeratorDashboard;
