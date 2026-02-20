import React, { useState, useEffect, useRef } from 'react';
import Layout from '../../components/Layout';
import DateRangePicker from '../../components/DateRangePicker';
import {
    createUser, getUsers, getUserDetail, updateUser, deleteUser,
    changeUserRole, toggleUserStatus, getRoles
} from '../../services/dashboardService';
import { showAlert, showConfirmDialog, showLoader, hideLoader } from '../../utils/alerts';

const UserManagement = () => {
    const [allUsers, setAllUsers] = useState([]);
    const [displayUsers, setDisplayUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');
    const [placeholderIdx, setPlaceholderIdx] = useState(0);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [filterRole, setFilterRole] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [roles, setRoles] = useState([]);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('view');
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({});

    const searchTimerRef = useRef(null);

    useEffect(() => { loadUsers(); loadRoles(); }, []);

    // Re-filter whenever filters or allUsers change
    useEffect(() => {
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        searchTimerRef.current = setTimeout(() => {
            applyAllFilters();
        }, 300);
        return () => clearTimeout(searchTimerRef.current);
    }, [searchQuery, filterRole, filterStatus, dateFrom, dateTo, allUsers]);

    // Cycle placeholder text
    const placeholders = ['Search by name...', 'Search by email...', 'Search by phone...'];
    useEffect(() => {
        const interval = setInterval(() => setPlaceholderIdx(i => (i + 1) % 3), 2500);
        return () => clearInterval(interval);
    }, []);

    const loadUsers = async () => {
        setLoading(true);
        try {
            // Fetch ALL users (high limit) for client-side filtering
            const res = await getUsers(0, 200);
            if (res.success) {
                setAllUsers(res.users || []);
            }
        } catch (err) {
            console.error('Load users error:', err);
        } finally { setLoading(false); }
    };

    const loadRoles = async () => {
        try {
            const res = await getRoles();
            if (res.success && res.roles) setRoles(res.roles.map(r => r.role_name || r.name));
        } catch (err) { console.error('Load roles error:', err); }
    };

    const applyAllFilters = () => {
        let filtered = [...allUsers];

        // Text search — filter across name, email, and phone
        if (searchQuery.trim()) {
            const q = searchQuery.trim().toLowerCase();
            filtered = filtered.filter(u =>
                (u.full_name || '').toLowerCase().includes(q) ||
                (u.email || '').toLowerCase().includes(q) ||
                (u.phone || '').toLowerCase().includes(q)
            );
        }

        // Role filter
        if (filterRole) {
            filtered = filtered.filter(u => u.role_name === filterRole);
        }

        // Status filter
        if (filterStatus === 'active') filtered = filtered.filter(u => u.is_active);
        else if (filterStatus === 'inactive') filtered = filtered.filter(u => !u.is_active);
        else if (filterStatus === 'verified') filtered = filtered.filter(u => u.is_verified);
        else if (filterStatus === 'unverified') filtered = filtered.filter(u => !u.is_verified);

        // Date range filter
        if (dateFrom) {
            const from = new Date(dateFrom);
            from.setHours(0, 0, 0, 0);
            filtered = filtered.filter(u => {
                if (!u.created_at) return false;
                return new Date(u.created_at) >= from;
            });
        }
        if (dateTo) {
            const to = new Date(dateTo);
            to.setHours(23, 59, 59, 999);
            filtered = filtered.filter(u => {
                if (!u.created_at) return false;
                return new Date(u.created_at) <= to;
            });
        }

        setDisplayUsers(filtered);
        setCurrentPage(0); // reset to page 1 when filters change
    };

    // Pagination computed
    const totalFiltered = displayUsers.length;
    const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
    const paginatedUsers = displayUsers.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

    // ─── CRUD Handlers ───
    const handleCreate = () => {
        setSelectedUser(null);
        setFormData({ full_name: '', email: '', phone: '', role_name: 'member' });
        setModalType('create');
        setShowModal(true);
    };

    const handleView = async (user) => {
        try {
            const res = await getUserDetail(user.id);
            setFormData(res.success ? res.user : user);
        } catch { setFormData(user); }
        setModalType('view');
        setShowModal(true);
    };

    const handleEdit = (user) => {
        setSelectedUser(user);
        setFormData({ ...user });
        setModalType('edit');
        setShowModal(true);
    };

    const handleChangeRole = (user) => {
        setSelectedUser(user);
        setFormData({ ...user });
        setModalType('changeRole');
        setShowModal(true);
    };

    const handleToggleStatus = async (userId, isActive) => {
        const action = isActive ? 'disable' : 'enable';
        const confirmed = await showConfirmDialog(
            `${action.charAt(0).toUpperCase() + action.slice(1)} User`,
            `Are you sure you want to ${action} this user?`, 'Confirm', 'Cancel'
        );
        if (!confirmed) return;
        showLoader('Updating...');
        try {
            const res = await toggleUserStatus(userId, action);
            hideLoader();
            if (res.success) { showAlert('success', 'Done!', `User ${action}d.`); loadUsers(); }
            else showAlert('error', 'Error', res.message);
        } catch (err) {
            hideLoader();
            showAlert('error', 'Error', err?.response?.data?.detail || 'Failed');
        }
    };

    const handleDelete = async (userId) => {
        const confirmed = await showConfirmDialog('Delete User', 'Permanently delete this user?', 'Delete', 'Cancel');
        if (!confirmed) return;
        showLoader('Deleting...');
        try {
            const res = await deleteUser(userId);
            hideLoader();
            if (res.success) { showAlert('success', 'Deleted!', 'User removed.'); loadUsers(); }
            else showAlert('error', 'Error', res.message);
        } catch (err) {
            hideLoader();
            showAlert('error', 'Error', err?.response?.data?.detail || 'Failed');
        }
    };

    const handleSave = async () => {
        showLoader('Saving...');
        try {
            let res;
            if (modalType === 'create') {
                if (!formData.full_name || !formData.email) {
                    hideLoader(); showAlert('error', 'Validation', 'Full name and email are required.'); return;
                }
                res = await createUser(formData);
            } else if (modalType === 'edit') {
                res = await updateUser(selectedUser.id, { full_name: formData.full_name, email: formData.email, phone: formData.phone });
            } else if (modalType === 'changeRole') {
                res = await changeUserRole(selectedUser.id, formData.role_name);
            }
            hideLoader();
            if (res?.success) {
                showAlert('success', modalType === 'create' ? 'Created!' : 'Saved!',
                    modalType === 'create' ? 'User created successfully.' : 'Changes saved.',
                    () => { setShowModal(false); loadUsers(); });
            } else showAlert('error', 'Error', res?.message || 'Operation failed');
        } catch (err) {
            hideLoader();
            showAlert('error', 'Error', err?.response?.data?.detail || err.message || 'Operation failed');
        }
    };

    const getRoleBadgeClass = (r) => ({
        admin: 'badge-admin', moderator: 'badge-moderator', event_manager: 'badge-organizer',
        finance_admin: 'badge-admin', committee_member: 'badge-moderator', member: 'badge-member',
        family_member: 'badge-member', volunteer: 'badge-user', user: 'badge-user', organizer: 'badge-organizer'
    }[r?.toLowerCase()] || 'badge-member');

    return (
        <Layout pageTitle="User Management" pageSubtitle="View, create, edit, and manage all platform users">
            {/* Filter Bar */}
            <div className="filter-bar">
                <div className="filter-row">
                    <input type="text" className="filter-input" value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder={placeholders[placeholderIdx]} />
                    <div style={{ flex: 1 }} />
                    <select className="filter-select" value={filterRole} onChange={e => setFilterRole(e.target.value)}>
                        <option value="">All Roles</option>
                        {roles.map(r => <option key={r} value={r}>{r.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
                    </select>
                    <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="verified">Verified</option>
                        <option value="unverified">Unverified</option>
                    </select>
                    <DateRangePicker
                        dateFrom={dateFrom} dateTo={dateTo}
                        onChange={(f, t) => { setDateFrom(f); setDateTo(t); }} />
                </div>
            </div>

            {/* Users Table */}
            <div className="card">
                <div className="card-header">
                    <div>
                        <div className="card-title">All Users</div>
                        <div className="card-subtitle">
                            {totalFiltered} of {allUsers.length} users
                            {searchQuery && ` · searching "${searchQuery}"`}
                            {filterRole && ` · ${filterRole}`}
                            {filterStatus && ` · ${filterStatus}`}
                            {(dateFrom || dateTo) && ` · date filtered`}
                        </div>
                    </div>
                    <button className="btn btn-primary" onClick={handleCreate}>➕ Add User</button>
                </div>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>S.No</th><th>Name</th><th>Email</th><th>Phone</th><th>Role</th>
                                <th>Status</th><th>Verified</th><th>Created</th><th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="9" className="no-data"><div className="spinner" style={{ margin: '0 auto', width: '24px', height: '24px' }}></div></td></tr>
                            ) : paginatedUsers.length > 0 ? paginatedUsers.map((u, idx) => (
                                <tr key={u.id}>
                                    <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{currentPage * pageSize + idx + 1}</td>
                                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{u.full_name}</td>
                                    <td>{u.email}</td>
                                    <td>{u.phone || '—'}</td>
                                    <td><span className={`badge ${getRoleBadgeClass(u.role_name)}`}>{u.role_name || '—'}</span></td>
                                    <td><span className={`badge ${u.is_active ? 'status-active' : 'status-inactive'}`}>{u.is_active ? '● Active' : '● Inactive'}</span></td>
                                    <td><span className={`badge ${u.is_verified ? 'status-verified' : 'status-unverified'}`}>{u.is_verified ? '✓ Yes' : '✗ No'}</span></td>
                                    <td style={{ fontSize: '12px', whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</td>
                                    <td style={{ whiteSpace: 'nowrap' }}>
                                        <button className="action-btn view" onClick={() => handleView(u)} title="View">👁️</button>
                                        <button className="action-btn edit" onClick={() => handleEdit(u)} title="Edit">✏️</button>
                                        <button className="action-btn role" onClick={() => handleChangeRole(u)} title="Change Role">🔑</button>
                                        <button className="action-btn toggle" onClick={() => handleToggleStatus(u.id, u.is_active)} title={u.is_active ? 'Disable' : 'Enable'}>{u.is_active ? '🔓' : '🔒'}</button>
                                        <button className="action-btn delete" onClick={() => handleDelete(u.id)} title="Delete">🗑️</button>
                                    </td>
                                </tr>
                            )) : <tr><td colSpan="9" className="no-data">No users found</td></tr>}
                        </tbody>
                    </table>
                </div>
                <div className="pagination">
                    <button className="pagination-btn" onClick={() => setCurrentPage(Math.max(0, currentPage - 1))} disabled={currentPage === 0}>← Prev</button>
                    <span className="pagination-info">Page {currentPage + 1} of {totalPages}</span>
                    <select className="page-size-select" value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(0); }}>
                        <option value={5}>5</option><option value={10}>10</option><option value={20}>20</option><option value={50}>50</option>
                    </select>
                    <button className="pagination-btn" onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))} disabled={currentPage >= totalPages - 1}>Next →</button>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">
                                {modalType === 'view' && '👁️ User Details'}
                                {modalType === 'create' && '➕ Add New User'}
                                {modalType === 'edit' && '✏️ Edit User'}
                                {modalType === 'changeRole' && '🔑 Change Role'}
                            </h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            {modalType === 'view' ? (
                                <div className="detail-list">
                                    {[
                                        { l: 'Full Name', v: formData.full_name }, { l: 'Email', v: formData.email },
                                        { l: 'Phone', v: formData.phone || '—' }, { l: 'Role', v: formData.role_name },
                                        { l: 'Status', v: formData.is_active ? 'Active' : 'Inactive' },
                                        { l: 'Verified', v: formData.is_verified ? 'Yes' : 'No' },
                                        { l: 'Created', v: formData.created_at ? new Date(formData.created_at).toLocaleDateString() : '—' },
                                        { l: 'Last Login', v: formData.last_login ? new Date(formData.last_login).toLocaleString() : '—' },
                                    ].map(({ l, v }) => <div key={l} className="detail-row"><label>{l}</label><span>{v}</span></div>)}
                                </div>
                            ) : modalType === 'create' || modalType === 'edit' ? (
                                <>
                                    <div className="form-group"><label>Full Name *</label>
                                        <input type="text" value={formData.full_name || ''} onChange={e => setFormData({ ...formData, full_name: e.target.value })} placeholder="Enter full name" /></div>
                                    <div className="form-group"><label>Email *</label>
                                        <input type="email" value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="Enter email address" /></div>
                                    <div className="form-group"><label>Phone</label>
                                        <input type="tel" value={formData.phone || ''} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="Enter phone number" /></div>
                                    {modalType === 'create' && (
                                        <div className="form-group"><label>Role</label>
                                            <select value={formData.role_name || 'member'} onChange={e => setFormData({ ...formData, role_name: e.target.value })}>
                                                {roles.length > 0 ? roles.map(r => <option key={r} value={r}>{r.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)
                                                    : <><option value="member">Member</option><option value="admin">Admin</option></>}
                                            </select>
                                        </div>
                                    )}
                                </>
                            ) : modalType === 'changeRole' && (
                                <div className="form-group">
                                    <label>Current Role: <strong>{selectedUser?.role_name}</strong></label>
                                    <select value={formData.role_name || ''} onChange={e => setFormData({ ...formData, role_name: e.target.value })} style={{ marginTop: '8px' }}>
                                        <option value="">Select a role</option>
                                        {roles.map(r => <option key={r} value={r}>{r.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
                                    </select>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>{modalType === 'view' ? 'Close' : 'Cancel'}</button>
                            {modalType !== 'view' && (
                                <button className="btn btn-primary" onClick={handleSave}>
                                    {modalType === 'create' ? 'Create User' : modalType === 'edit' ? 'Save Changes' : 'Update Role'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default UserManagement;
