import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import {
  getDashboardAnalytics,
  getUsers,
  updateUser,
  deleteUser,
  changeUserRole,
  toggleUserStatus,
  getUserDetail,
  getRoles,
  createRole,
  updateRole,
  deleteRole
} from '../../services/dashboardService';
import { showAlert, showConfirmDialog, showLoader, hideLoader } from '../../utils/alerts';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('view');
  const [formData, setFormData] = useState({});
  const [roles, setRoles] = useState(['admin', 'moderator', 'organizer', 'member', 'user']);

  const [activeTab, setActiveTab] = useState('users');
  const [rolesList, setRolesList] = useState([]);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [roleModalType, setRoleModalType] = useState('create');
  const [roleFormData, setRoleFormData] = useState({ role_name: '', description: '' });
  const [selectedRole, setSelectedRole] = useState(null);

  useEffect(() => {
    loadData();
    loadRoles();
  }, []);

  useEffect(() => {
    loadUsers();
  }, [currentPage, pageSize]);

  const loadData = async () => {
    try {
      showLoader('Loading Dashboard', 'Fetching analytics data...');
      setError('');
      const response = await getDashboardAnalytics();
      hideLoader();
      setAnalytics(response.analytics);
      setLoading(false);
      await loadUsers();
    } catch (err) {
      hideLoader();
      setLoading(false);
      const errorMsg = err.response?.data?.message || err.response?.data?.detail || 'Failed to load dashboard data';
      setError(errorMsg);
      showAlert('error', 'Error', errorMsg);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await getUsers(currentPage * pageSize, pageSize);
      setUsers(response.users || []);
      setTotalUsers(response.total || 0);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.detail || 'Failed to load users';
      console.error(errorMsg);
    }
  };

  const loadRoles = async () => {
    try {
      const response = await getRoles();
      // Handle both `data` and `roles` field from backend
      const rolesData = response.data || response.roles || [];
      setRolesList(rolesData);
      if (rolesData.length > 0) {
        setRoles(rolesData.map(r => r.role_name || r.name));
      }
    } catch (err) {
      console.error('Failed to load roles:', err);
    }
  };

  const handleViewUser = async (user) => {
    try {
      showLoader('Loading Details', 'Fetching user information...');
      const response = await getUserDetail(user.id);
      hideLoader();
      setSelectedUser(response.user);
      setFormData(response.user);
      setModalType('view');
      setShowModal(true);
    } catch (err) {
      hideLoader();
      showAlert('error', 'Error', err.response?.data?.detail || 'Failed to load user details');
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setFormData({ ...user });
    setModalType('edit');
    setShowModal(true);
  };

  const handleChangeRole = (user) => {
    setSelectedUser(user);
    setFormData({ role_name: user.role_name });
    setModalType('changeRole');
    setShowModal(true);
  };

  const handleDeleteUser = async (userId) => {
    const isConfirmed = await showConfirmDialog('Delete User', 'Are you sure you want to permanently delete this user?', 'Delete', 'Cancel');
    if (!isConfirmed) return;
    try {
      showLoader('Deleting User', 'Please wait...');
      const response = await deleteUser(userId);
      hideLoader();
      if (response.success) {
        showAlert('success', 'Deleted!', 'User deleted successfully', async () => { await loadUsers(); });
      } else {
        showAlert('error', 'Error', response.message || 'Failed to delete user');
      }
    } catch (err) {
      hideLoader();
      showAlert('error', 'Error', err.response?.data?.detail || 'Failed to delete user');
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      showLoader(currentStatus ? 'Disabling User' : 'Enabling User', 'Please wait...');
      const action = currentStatus ? 'disable' : 'enable';
      const response = await toggleUserStatus(userId, action);
      hideLoader();
      if (response.success) {
        showAlert('success', 'Success!', `User ${action}d successfully`, async () => { await loadUsers(); });
      } else {
        showAlert('error', 'Error', response.message || `Failed to ${action} user`);
      }
    } catch (err) {
      hideLoader();
      showAlert('error', 'Error', err.response?.data?.detail || 'Failed to update user status');
    }
  };

  const handleSaveChanges = async () => {
    try {
      showLoader('Saving Changes', 'Please wait...');
      if (modalType === 'edit') {
        const response = await updateUser(selectedUser.id, formData);
        hideLoader();
        if (response.success) {
          showAlert('success', 'Success!', 'User updated successfully', async () => { setShowModal(false); await loadUsers(); });
        } else {
          showAlert('error', 'Error', response.message || 'Failed to update user');
        }
      } else if (modalType === 'changeRole') {
        const response = await changeUserRole(selectedUser.id, formData.role_name);
        hideLoader();
        if (response.success) {
          showAlert('success', 'Success!', 'User role changed successfully', async () => { setShowModal(false); await loadUsers(); });
        } else {
          showAlert('error', 'Error', response.message || 'Failed to change role');
        }
      }
    } catch (err) {
      hideLoader();
      showAlert('error', 'Error', err.response?.data?.detail || 'Failed to save changes');
    }
  };

  const handleCreateRole = () => {
    setRoleFormData({ role_name: '', description: '' });
    setSelectedRole(null);
    setRoleModalType('create');
    setShowRoleModal(true);
  };

  const handleEditRole = (role) => {
    setSelectedRole(role);
    setRoleFormData({ role_name: role.role_name || role.name, description: role.description || '' });
    setRoleModalType('edit');
    setShowRoleModal(true);
  };

  const handleDeleteRole = async (roleId) => {
    const isConfirmed = await showConfirmDialog('Delete Role', 'Are you sure you want to delete this role?', 'Delete', 'Cancel');
    if (!isConfirmed) return;
    try {
      showLoader('Deleting Role', 'Please wait...');
      const response = await deleteRole(roleId);
      hideLoader();
      if (response.success) {
        showAlert('success', 'Deleted!', 'Role deleted successfully', async () => { await loadRoles(); });
      } else {
        showAlert('error', 'Error', response.message || 'Failed to delete role');
      }
    } catch (err) {
      hideLoader();
      showAlert('error', 'Error', err.response?.data?.detail || 'Failed to delete role');
    }
  };

  const handleSaveRole = async () => {
    if (!roleFormData.role_name.trim()) {
      showAlert('error', 'Validation Error', 'Role name is required');
      return;
    }
    try {
      showLoader(roleModalType === 'create' ? 'Creating Role' : 'Updating Role', 'Please wait...');
      let response;
      if (roleModalType === 'create') {
        response = await createRole(roleFormData.role_name, roleFormData.description);
      } else {
        response = await updateRole(selectedRole.id || selectedRole.role_id, roleFormData.role_name, roleFormData.description);
      }
      hideLoader();
      if (response.success) {
        showAlert('success', 'Success!', 'Role saved successfully', async () => { setShowRoleModal(false); await loadRoles(); });
      } else {
        showAlert('error', 'Error', response.message || 'Failed to save role');
      }
    } catch (err) {
      hideLoader();
      showAlert('error', 'Error', err.response?.data?.detail || 'Failed to save role');
    }
  };

  const totalPages = Math.ceil(totalUsers / pageSize);

  const getRoleBadgeClass = (roleName) => {
    const map = { admin: 'badge-admin', moderator: 'badge-moderator', organizer: 'badge-organizer', member: 'badge-member', user: 'badge-user' };
    return map[roleName?.toLowerCase()] || 'badge-user';
  };

  if (loading && !users.length) {
    return (
      <Layout pageTitle="Admin Dashboard" pageSubtitle="Manage users and monitor platform analytics">
        <div className="page-loader">
          <div className="spinner"></div>
          <span className="loading-text">Loading dashboard...</span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout pageTitle="Admin Dashboard" pageSubtitle="Manage users and monitor platform analytics">
      {error && (
        <div className="alert alert-error" style={{ marginBottom: '20px' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Analytics Stats */}
      {analytics && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon purple">👥</div>
            <div className="stat-info">
              <div className="stat-label">Total Users</div>
              <div className="stat-value">{analytics.total_users}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green">✅</div>
            <div className="stat-info">
              <div className="stat-label">Active Users</div>
              <div className="stat-value">{analytics.active_users}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon blue">📧</div>
            <div className="stat-info">
              <div className="stat-label">Verified</div>
              <div className="stat-value">{analytics.verified_users}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon orange">🔒</div>
            <div className="stat-info">
              <div className="stat-label">Admins</div>
              <div className="stat-value">{analytics.admin_users}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon teal">🪪</div>
            <div className="stat-info">
              <div className="stat-label">Members</div>
              <div className="stat-value">{analytics.member_users}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon red">⏸️</div>
            <div className="stat-info">
              <div className="stat-label">Inactive</div>
              <div className="stat-value">{analytics.inactive_users}</div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="quick-actions">
        <div className="quick-action-card" onClick={() => navigate('/admin/users/create')}>
          <div className="qa-icon">➕</div>
          <div className="qa-info">
            <h3>Create User</h3>
            <p>Add a new platform user</p>
          </div>
        </div>
        <div className="quick-action-card" onClick={() => navigate('/admin/events')}>
          <div className="qa-icon">📅</div>
          <div className="qa-info">
            <h3>Manage Events</h3>
            <p>View and manage all events</p>
          </div>
        </div>
        <div className="quick-action-card" onClick={() => navigate('/admin/analytics')}>
          <div className="qa-icon">📊</div>
          <div className="qa-info">
            <h3>View Analytics</h3>
            <p>Platform usage insights</p>
          </div>
        </div>
        <div className="quick-action-card" onClick={() => navigate('/admin/settings')}>
          <div className="qa-icon">⚙️</div>
          <div className="qa-info">
            <h3>Settings</h3>
            <p>Configure platform settings</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 User Management <span className="tab-count">{totalUsers}</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'roles' ? 'active' : ''}`}
          onClick={() => setActiveTab('roles')}
        >
          🔑 Roles <span className="tab-count">{rolesList.length}</span>
        </button>
      </div>

      {/* Users Table */}
      {activeTab === 'users' && (
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">All Users</div>
              <div className="card-subtitle">Page {currentPage + 1} of {totalPages || 1}</div>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/admin/users/create')}>
              ➕ Add User
            </button>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Verified</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? users.map((user) => (
                  <tr key={user.id}>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{user.full_name}</td>
                    <td>{user.email}</td>
                    <td>{user.phone || '—'}</td>
                    <td>
                      <span className={`badge ${getRoleBadgeClass(user.role_name)}`}>
                        {user.role_name || 'Unassigned'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${user.is_active ? 'status-active' : 'status-inactive'}`}>
                        {user.is_active ? '● Active' : '● Inactive'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${user.is_verified ? 'status-verified' : 'status-unverified'}`}>
                        {user.is_verified ? '✓ Yes' : '✗ No'}
                      </span>
                    </td>
                    <td>
                      <button className="action-btn view" onClick={() => handleViewUser(user)} title="View Details">👁️</button>
                      <button className="action-btn edit" onClick={() => handleEditUser(user)} title="Edit User">✏️</button>
                      <button className="action-btn role" onClick={() => handleChangeRole(user)} title="Change Role">🔑</button>
                      <button className="action-btn toggle" onClick={() => handleToggleUserStatus(user.id, user.is_active)} title={user.is_active ? 'Disable' : 'Enable'}>
                        {user.is_active ? '🔓' : '🔒'}
                      </button>
                      <button className="action-btn delete" onClick={() => handleDeleteUser(user.id)} title="Delete">🗑️</button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="7" className="no-data">No users found</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="pagination">
            <button className="pagination-btn" onClick={() => setCurrentPage(Math.max(0, currentPage - 1))} disabled={currentPage === 0}>← Previous</button>
            <span className="pagination-info">Page {currentPage + 1} of {totalPages || 1} &nbsp;·&nbsp; {totalUsers} users</span>
            <select className="page-size-select" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(0); }}>
              <option value={5}>5 / page</option>
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
              <option value={50}>50 / page</option>
            </select>
            <button className="pagination-btn" onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))} disabled={currentPage >= totalPages - 1}>Next →</button>
          </div>
        </div>
      )}

      {/* Roles Table */}
      {activeTab === 'roles' && (
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Role Management</div>
              <div className="card-subtitle">Manage platform roles and permissions</div>
            </div>
            <button className="btn btn-primary btn-sm" onClick={handleCreateRole}>
              ➕ Create Role
            </button>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Role Name</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rolesList.length > 0 ? rolesList.map((role) => (
                  <tr key={role.id || role.role_id}>
                    <td>
                      <span className={`badge ${getRoleBadgeClass(role.role_name || role.name)}`}>
                        {role.role_name || role.name}
                      </span>
                    </td>
                    <td>{role.description || '—'}</td>
                    <td>
                      <button className="action-btn edit" onClick={() => handleEditRole(role)} title="Edit Role">✏️</button>
                      <button className="action-btn delete" onClick={() => handleDeleteRole(role.id || role.role_id)} title="Delete Role">🗑️</button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="3" className="no-data">No roles found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {modalType === 'view' && '👁️ User Details'}
                {modalType === 'edit' && '✏️ Edit User'}
                {modalType === 'changeRole' && '🔑 Change Role'}
              </h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              {modalType === 'view' ? (
                <div className="detail-list">
                  {[
                    { label: 'Full Name', value: formData.full_name },
                    { label: 'Email', value: formData.email },
                    { label: 'Phone', value: formData.phone || '—' },
                    { label: 'Role', value: formData.role_name || 'Unassigned' },
                    { label: 'Status', value: formData.is_active ? 'Active' : 'Inactive' },
                    { label: 'Verified', value: formData.is_verified ? 'Yes' : 'No' },
                    { label: 'Created', value: formData.created_at ? new Date(formData.created_at).toLocaleDateString() : '—' },
                  ].map(({ label, value }) => (
                    <div key={label} className="detail-row">
                      <label>{label}</label>
                      <span>{value}</span>
                    </div>
                  ))}
                </div>
              ) : modalType === 'edit' ? (
                <>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" value={formData.full_name || ''} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} placeholder="Full Name" />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" value={formData.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="Email" />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input type="tel" value={formData.phone || ''} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="Phone" />
                  </div>
                </>
              ) : (
                <div className="form-group">
                  <label>Select New Role</label>
                  <select value={formData.role_name || ''} onChange={(e) => setFormData({ ...formData, role_name: e.target.value })}>
                    <option value="">Select a role</option>
                    {roles.map((role) => (
                      <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              {modalType !== 'view' && (
                <button className="btn btn-primary" onClick={handleSaveChanges}>Save Changes</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Role Modal */}
      {showRoleModal && (
        <div className="modal-overlay" onClick={() => setShowRoleModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{roleModalType === 'create' ? '➕ Create Role' : '✏️ Edit Role'}</h2>
              <button className="modal-close" onClick={() => setShowRoleModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Role Name *</label>
                <input type="text" value={roleFormData.role_name || ''} onChange={(e) => setRoleFormData({ ...roleFormData, role_name: e.target.value })} placeholder="e.g., admin, member, organizer" />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea rows="3" value={roleFormData.description || ''} onChange={(e) => setRoleFormData({ ...roleFormData, description: e.target.value })} placeholder="Optional description of this role" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowRoleModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveRole}>
                {roleModalType === 'create' ? 'Create Role' : 'Update Role'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AdminDashboard;
