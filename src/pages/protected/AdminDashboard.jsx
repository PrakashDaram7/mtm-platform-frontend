import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [modalType, setModalType] = useState('view'); // view, edit, changeRole
  const [formData, setFormData] = useState({});
  const [roles, setRoles] = useState(['admin', 'member']);
  
  // Role management state
  const [activeTab, setActiveTab] = useState('users'); // users or roles
  const [rolesList, setRolesList] = useState([]);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [roleModalType, setRoleModalType] = useState('create'); // create, edit
  const [roleFormData, setRoleFormData] = useState({ role_name: '', description: '' });
  const [selectedRole, setSelectedRole] = useState(null);

  // Load analytics and users on mount
  useEffect(() => {
    loadData();
    loadRoles();
  }, []);

  // Load users when pagination changes
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
      await loadUsers();
    } catch (err) {
      hideLoader();
      const errorMsg = err.response?.data?.message || 'Failed to load dashboard data';
      showAlert('error', 'Error', errorMsg);
      console.error(err);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await getUsers(currentPage * pageSize, pageSize);
      setUsers(response.users);
      setTotalUsers(response.total);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to load users';
      showAlert('error', 'Error', errorMsg);
      console.error(err);
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
      showAlert('error', 'Error', err.response?.data?.message || 'Failed to load user details');
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
    const isConfirmed = await showConfirmDialog(
      'Delete User',
      'Are you sure you want to permanently delete this user?',
      'Delete',
      'Cancel'
    );
    
    if (!isConfirmed) return;

    try {
      showLoader('Deleting User', 'Please wait...');
      const response = await deleteUser(userId);
      hideLoader();
      if (response.success) {
        showAlert('success', 'Deleted!', 'User deleted successfully', async () => {
          await loadUsers();
        });
      } else {
        showAlert('error', 'Error', response.message || 'Failed to delete user');
      }
    } catch (err) {
      hideLoader();
      showAlert('error', 'Error', err.response?.data?.message || 'Failed to delete user');
      console.error(err);
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      showLoader(currentStatus ? 'Disabling User' : 'Enabling User', 'Please wait...');
      const action = currentStatus ? 'disable' : 'enable';
      const response = await toggleUserStatus(userId, action);
      hideLoader();
      if (response.success) {
        showAlert('success', 'Success!', `User ${action}d successfully`, async () => {
          await loadUsers();
        });
      } else {
        showAlert('error', 'Error', response.message || `Failed to ${action} user`);
      }
    } catch (err) {
      hideLoader();
      showAlert('error', 'Error', err.response?.data?.message || `Failed to ${currentStatus ? 'disable' : 'enable'} user`);
      console.error(err);
    }
  };

  const handleSaveChanges = async () => {
    try {
      showLoader('Saving Changes', 'Please wait...');
      if (modalType === 'edit') {
        const response = await updateUser(selectedUser.id, formData);
        hideLoader();
        if (response.success) {
          showAlert('success', 'Success!', 'User updated successfully', async () => {
            setShowModal(false);
            await loadUsers();
          });
        } else {
          showAlert('error', 'Error', response.message || 'Failed to update user');
        }
      } else if (modalType === 'changeRole') {
        const response = await changeUserRole(selectedUser.id, formData.role_name);
        hideLoader();
        if (response.success) {
          showAlert('success', 'Success!', 'User role changed successfully', async () => {
            setShowModal(false);
            await loadUsers();
          });
        } else {
          showAlert('error', 'Error', response.message || 'Failed to change role');
        }
      }
    } catch (err) {
      hideLoader();
      showAlert('error', 'Error', err.response?.data?.message || 'Failed to save changes');
      console.error(err);
    }
  };

  // Role Management Functions
  const loadRoles = async () => {
    try {
      const response = await getRoles();
      if (response.success) {
        setRolesList(response.data || []);
      } else {
        showAlert('error', 'Error', 'Failed to load roles');
      }
    } catch (err) {
      showAlert('error', 'Error', err.response?.data?.message || 'Failed to load roles');
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
    setRoleFormData({ role_name: role.role_name, description: role.description || '' });
    setRoleModalType('edit');
    setShowRoleModal(true);
  };

  const handleDeleteRole = async (roleId) => {
    const isConfirmed = await showConfirmDialog(
      'Delete Role',
      'Are you sure you want to delete this role? This action cannot be undone.',
      'Delete',
      'Cancel'
    );

    if (!isConfirmed) return;

    try {
      showLoader('Deleting Role', 'Please wait...');
      const response = await deleteRole(roleId);
      hideLoader();
      if (response.success) {
        showAlert('success', 'Deleted!', 'Role deleted successfully', async () => {
          await loadRoles();
        });
      } else {
        showAlert('error', 'Error', response.message || 'Failed to delete role');
      }
    } catch (err) {
      hideLoader();
      showAlert('error', 'Error', err.response?.data?.message || 'Failed to delete role');
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
        response = await updateRole(selectedRole.id, roleFormData.role_name, roleFormData.description);
      }
      
      hideLoader();
      if (response.success) {
        showAlert('success', 'Success!', 'Role saved successfully', async () => {
          setShowRoleModal(false);
          await loadRoles();
        });
      } else {
        showAlert('error', 'Error', response.message || 'Failed to save role');
      }
    } catch (err) {
      hideLoader();
      showAlert('error', 'Error', err.response?.data?.message || 'Failed to save role');
    }
  };

  const totalPages = Math.ceil(totalUsers / pageSize);

  if (loading && !users.length) {
    return <div className="dashboard"><div className="loading">Loading...</div></div>;
  }


  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-top">
          <div>
            <h1>Admin Dashboard</h1>
            <p className="subtitle">Manage users and monitor platform analytics</p>
          </div>
          <button className="btn-logout" onClick={() => {
            localStorage.removeItem('accessToken');
            navigate('/');
          }}>Logout</button>
        </div>

        {error && <div className="error-message">{error}</div>}
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="analytics-grid">
          <div className="analytics-card">
            <div className="card-icon">👥</div>
            <div className="card-content">
              <div className="card-label">Total Users</div>
              <div className="card-value">{analytics.total_users}</div>
            </div>
          </div>

          <div className="analytics-card">
            <div className="card-icon">✓</div>
            <div className="card-content">
              <div className="card-label">Active Users</div>
              <div className="card-value">{analytics.active_users}</div>
            </div>
          </div>

          <div className="analytics-card">
            <div className="card-icon">📧</div>
            <div className="card-content">
              <div className="card-label">Verified Users</div>
              <div className="card-value">{analytics.verified_users}</div>
            </div>
          </div>

          <div className="analytics-card">
            <div className="card-icon">🔒</div>
            <div className="card-content">
              <div className="card-label">Admin Users</div>
              <div className="card-value">{analytics.admin_users}</div>
            </div>
          </div>

          <div className="analytics-card">
            <div className="card-icon">👤</div>
            <div className="card-content">
              <div className="card-label">Members</div>
              <div className="card-value">{analytics.member_users}</div>
            </div>
          </div>

          <div className="analytics-card">
            <div className="card-icon">⏸️</div>
            <div className="card-content">
              <div className="card-label">Inactive Users</div>
              <div className="card-value">{analytics.inactive_users}</div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="mb-4" style={{ display: 'flex', gap: '12px' }}>
        <button 
          className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-outline-secondary'}`}
          onClick={() => setActiveTab('users')}
        >
          👥 User Management ({totalUsers})
        </button>
        <button 
          className={`btn ${activeTab === 'roles' ? 'btn-primary' : 'btn-outline-secondary'}`}
          onClick={() => setActiveTab('roles')}
        >
          🔑 Role Management ({rolesList.length})
        </button>
      </div>

      {/* Users Table Section */}
      {activeTab === 'users' && (
      <div className="table-section">
        <div className="section-header">
          <h2>User Management</h2>
          <div className="pagination-info">
            Page {currentPage + 1} of {totalPages || 1}
          </div>
        </div>

        <div className="table-wrapper">
          <table className="users-table">
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
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.full_name}</td>
                    <td>{user.email}</td>
                    <td>{user.phone || 'N/A'}</td>
                    <td>
                      <span className={`role-badge role-${user.role_name?.toLowerCase()}`}>
                        {user.role_name || 'Unassigned'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <span className={`verified-badge ${user.is_verified ? 'verified' : 'unverified'}`}>
                        {user.is_verified ? '✓ Yes' : '✗ No'}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button
                        className="action-btn view-btn"
                        onClick={() => handleViewUser(user)}
                        title="View Details"
                      >
                        👁️
                      </button>
                      <button
                        className="action-btn edit-btn"
                        onClick={() => handleEditUser(user)}
                        title="Edit User"
                      >
                        ✏️
                      </button>
                      <button
                        className="action-btn role-btn"
                        onClick={() => handleChangeRole(user)}
                        title="Change Role"
                      >
                        🔑
                      </button>
                      <button
                        className="action-btn status-btn"
                        onClick={() => handleToggleUserStatus(user.id, user.is_active)}
                        title={user.is_active ? 'Disable User' : 'Enable User'}
                      >
                        {user.is_active ? '🔓' : '🔒'}
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDeleteUser(user.id)}
                        title="Delete User"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="no-data">No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
          >
            ← Previous
          </button>

          <div className="page-info">
            Page {currentPage + 1} of {totalPages || 1} | Total: {totalUsers} users
          </div>

          <select
            className="page-size-select"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(0);
            }}
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>

          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
            disabled={currentPage >= totalPages - 1}
          >
            Next →
          </button>
        </div>
      </div>
      )}

      {/* Roles Table Section */}
      {activeTab === 'roles' && (
      <div className="table-section">
        <div className="section-header">
          <h2>Role Management</h2>
          <button 
            className="btn btn-success"
            onClick={handleCreateRole}
          >
            + Create Role
          </button>
        </div>

        <div className="table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>Role Name</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rolesList.length > 0 ? (
                rolesList.map((role) => (
                  <tr key={role.id}>
                    <td>
                      <span className={`role-badge role-${role.role_name?.toLowerCase()}`}>
                        {role.role_name}
                      </span>
                    </td>
                    <td>{role.description || 'No description'}</td>
                    <td className="actions-cell">
                      <button
                        className="action-btn edit-btn"
                        onClick={() => handleEditRole(role)}
                        title="Edit Role"
                      >
                        ✏️
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDeleteRole(role.id)}
                        title="Delete Role"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="no-data">No roles found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {modalType === 'view' && 'User Details'}
                {modalType === 'edit' && 'Edit User'}
                {modalType === 'changeRole' && 'Change User Role'}
              </h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>

            <div className="modal-body">
              {modalType === 'view' ? (
                <div className="user-details">
                  <div className="detail-row">
                    <label>Name:</label>
                    <span>{formData.full_name}</span>
                  </div>
                  <div className="detail-row">
                    <label>Email:</label>
                    <span>{formData.email}</span>
                  </div>
                  <div className="detail-row">
                    <label>Phone:</label>
                    <span>{formData.phone || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <label>Role:</label>
                    <span>{formData.role_name || 'Unassigned'}</span>
                  </div>
                  <div className="detail-row">
                    <label>Status:</label>
                    <span>{formData.is_active ? 'Active' : 'Inactive'}</span>
                  </div>
                  <div className="detail-row">
                    <label>Verified:</label>
                    <span>{formData.is_verified ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="detail-row">
                    <label>Created:</label>
                    <span>{new Date(formData.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ) : modalType === 'edit' ? (
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={formData.full_name || ''}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Full Name"
                  />
                  <label>Email</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Email"
                  />
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Phone"
                  />
                </div>
              ) : (
                <div className="form-group">
                  <label>Select New Role</label>
                  <select
                    value={formData.role_name || ''}
                    onChange={(e) => setFormData({ ...formData, role_name: e.target.value })}
                  >
                    <option value="">Select a role</option>
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
              {modalType !== 'view' && (
                <button
                  className="btn-save"
                  onClick={handleSaveChanges}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Role Modal */}
      {showRoleModal && (
        <div className="modal-overlay" onClick={() => setShowRoleModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {roleModalType === 'create' ? 'Create New Role' : 'Edit Role'}
              </h2>
              <button className="modal-close" onClick={() => setShowRoleModal(false)}>×</button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Role Name *</label>
                <input
                  type="text"
                  value={roleFormData.role_name || ''}
                  onChange={(e) => setRoleFormData({ ...roleFormData, role_name: e.target.value })}
                  placeholder="Enter role name (e.g., admin, member)"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={roleFormData.description || ''}
                  onChange={(e) => setRoleFormData({ ...roleFormData, description: e.target.value })}
                  placeholder="Enter role description (optional)"
                  rows="3"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowRoleModal(false)}>Cancel</button>
              <button
                className="btn-save"
                onClick={handleSaveRole}
              >
                {roleModalType === 'create' ? 'Create Role' : 'Update Role'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

