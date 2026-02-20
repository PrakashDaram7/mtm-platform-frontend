import React, { useState, useEffect, useRef } from 'react';
import Layout from '../../components/Layout';
import DateRangePicker from '../../components/DateRangePicker';
import { getRoles, createRole, updateRole, deleteRole } from '../../services/dashboardService';
import { showAlert, showConfirmDialog, showLoader, hideLoader } from '../../utils/alerts';

const RoleManagement = () => {
    const [roles, setRoles] = useState([]);
    const [filteredRoles, setFilteredRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('create');
    const [selectedRole, setSelectedRole] = useState(null);
    const [formData, setFormData] = useState({ role_name: '', description: '' });

    const searchTimerRef = useRef(null);

    useEffect(() => { loadRoles(); }, []);

    // Auto-search with debounce
    useEffect(() => {
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        searchTimerRef.current = setTimeout(() => {
            applyFilters();
        }, 300);
        return () => clearTimeout(searchTimerRef.current);
    }, [searchQuery, dateFrom, dateTo, roles]);

    const loadRoles = async () => {
        setLoading(true);
        try {
            const res = await getRoles();
            if (res.success) {
                setRoles(res.roles || []);
                setFilteredRoles(res.roles || []);
            }
        } catch (err) { console.error('Load roles error:', err); }
        finally { setLoading(false); }
    };

    const applyFilters = () => {
        let list = [...roles];
        // Search
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter(r =>
                (r.role_name || r.name || '').toLowerCase().includes(q) ||
                (r.description || '').toLowerCase().includes(q)
            );
        }
        // Date range filter
        if (dateFrom) {
            const from = new Date(dateFrom); from.setHours(0, 0, 0, 0);
            list = list.filter(r => r.created_at && new Date(r.created_at) >= from);
        }
        if (dateTo) {
            const to = new Date(dateTo); to.setHours(23, 59, 59, 999);
            list = list.filter(r => r.created_at && new Date(r.created_at) <= to);
        }
        setFilteredRoles(list);
    };

    const handleCreate = () => {
        setSelectedRole(null);
        setFormData({ role_name: '', description: '' });
        setModalType('create');
        setShowModal(true);
    };

    const handleEdit = (role) => {
        setSelectedRole(role);
        setFormData({ role_name: role.role_name || role.name || '', description: role.description || '' });
        setModalType('edit');
        setShowModal(true);
    };

    const handleDelete = async (role) => {
        const roleId = role.id || role.role_id;
        const roleName = role.role_name || role.name;
        const confirmed = await showConfirmDialog('Delete Role',
            `Delete "${roleName}"? Users with this role will lose their assignment.`, 'Delete', 'Cancel');
        if (!confirmed) return;
        showLoader('Deleting...');
        try {
            const res = await deleteRole(roleId);
            hideLoader();
            if (res.success) { showAlert('success', 'Deleted!', `Role "${roleName}" removed.`); loadRoles(); }
            else showAlert('error', 'Error', res.message || 'Cannot delete');
        } catch (err) {
            hideLoader();
            showAlert('error', 'Error', err?.response?.data?.detail || 'Failed');
        }
    };

    const handleSave = async () => {
        if (!formData.role_name.trim()) { showAlert('error', 'Validation', 'Role name is required.'); return; }
        showLoader('Saving...');
        try {
            let res;
            if (modalType === 'create') res = await createRole(formData.role_name, formData.description);
            else {
                const roleId = selectedRole.id || selectedRole.role_id;
                res = await updateRole(roleId, formData.role_name, formData.description);
            }
            hideLoader();
            if (res?.success) {
                showAlert('success', modalType === 'create' ? 'Created!' : 'Updated!',
                    modalType === 'create' ? `Role "${formData.role_name}" created.` : 'Role updated.',
                    () => { setShowModal(false); loadRoles(); });
            } else showAlert('error', 'Error', res?.message || 'Operation failed');
        } catch (err) {
            hideLoader();
            showAlert('error', 'Error', err?.response?.data?.detail || err.message || 'Operation failed');
        }
    };

    const getRoleBadgeClass = (r) => ({
        admin: 'badge-admin', moderator: 'badge-moderator', event_manager: 'badge-organizer',
        finance_admin: 'badge-admin', committee_member: 'badge-moderator', member: 'badge-member',
        family_member: 'badge-member', volunteer: 'badge-user', user: 'badge-member', organizer: 'badge-organizer'
    }[r?.toLowerCase()] || 'badge-member');

    const systemRoles = ['admin', 'member', 'moderator'];

    return (
        <Layout pageTitle="Role Management" pageSubtitle="Configure roles and permissions for platform users">
            {/* Filter Bar */}
            <div className="filter-bar">
                <div className="filter-row">
                    <input type="text" className="filter-input" value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search roles..." />
                    <div style={{ flex: 1 }} />
                    <DateRangePicker
                        dateFrom={dateFrom} dateTo={dateTo}
                        onChange={(f, t) => { setDateFrom(f); setDateTo(t); }} />
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <div>
                        <div className="card-title">All Roles</div>
                        <div className="card-subtitle">{filteredRoles.length} roles{searchQuery && ` matching "${searchQuery}"`}</div>
                    </div>
                    <button className="btn btn-primary" onClick={handleCreate}>➕ Create Role</button>
                </div>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr><th>S.No</th><th>Role Name</th><th>Description</th><th>Users</th><th>Created</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" className="no-data"><div className="spinner" style={{ margin: '0 auto', width: '24px', height: '24px' }}></div></td></tr>
                            ) : filteredRoles.length > 0 ? filteredRoles.map((role, idx) => {
                                const rName = role.role_name || role.name;
                                const rId = role.id || role.role_id;
                                return (
                                    <tr key={rId}>
                                        <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{idx + 1}</td>
                                        <td><span className={`badge ${getRoleBadgeClass(rName)}`}>{rName}</span></td>
                                        <td style={{ color: 'var(--text-secondary)' }}>{role.description || '—'}</td>
                                        <td>{role.user_count ?? '—'}</td>
                                        <td style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{role.created_at ? new Date(role.created_at).toLocaleDateString() : '—'}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>
                                            <button className="action-btn edit" onClick={() => handleEdit(role)} title="Edit">✏️</button>
                                            {!systemRoles.includes(rName) && (
                                                <button className="action-btn delete" onClick={() => handleDelete(role)} title="Delete">🗑️</button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            }) : <tr><td colSpan="6" className="no-data">No roles found</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Role Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">{modalType === 'create' ? '➕ Create Role' : '✏️ Edit Role'}</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Role Name *</label>
                                <input type="text" value={formData.role_name}
                                    onChange={e => setFormData({ ...formData, role_name: e.target.value })}
                                    placeholder="e.g., event_coordinator" style={{ textTransform: 'lowercase' }} />
                                <small style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                    Use lowercase with underscores (e.g., event_manager)
                                </small>
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea rows="3" value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Brief description of the role's responsibilities" />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleSave}>
                                {modalType === 'create' ? 'Create Role' : 'Update Role'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default RoleManagement;
