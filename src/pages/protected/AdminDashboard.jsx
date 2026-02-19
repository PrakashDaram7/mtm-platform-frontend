import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
import { getAllEvents, createEvent, updateEvent, deleteEvent } from '../../services/eventService';
import { showAlert, showConfirmDialog, showLoader, hideLoader } from '../../utils/alerts';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active page from URL
  const path = location.pathname;
  const activePage = path.includes('/admin/users') ? 'users'
    : path.includes('/admin/roles') ? 'roles'
      : path.includes('/admin/permissions') ? 'permissions'
        : path.includes('/admin/events') ? 'events'
          : path.includes('/admin/analytics') ? 'analytics'
            : path.includes('/admin/settings') ? 'settings'
              : path.includes('/admin/logs') ? 'logs'
                : path.includes('/admin/announcements') ? 'announcements'
                  : path.includes('/admin/payments') ? 'payments'
                    : 'dashboard';

  const PAGE_TITLES = {
    dashboard: ['Admin Dashboard', 'Platform overview and quick actions'],
    users: ['User Management', 'View and manage all platform users'],
    roles: ['Role Management', 'Configure roles and permissions'],
    permissions: ['Permissions', 'Manage access controls'],
    events: ['Events Management', 'Create, edit, and manage all events'],
    analytics: ['Analytics', 'Platform usage and performance metrics'],
    settings: ['Settings', 'Configure platform settings'],
    logs: ['Audit Logs', 'View system activity logs'],
    announcements: ['Announcements', 'Manage platform announcements'],
    payments: ['Payments', 'View payment transactions'],
  };

  // State
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
  const [rolesList, setRolesList] = useState([]);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [roleModalType, setRoleModalType] = useState('create');
  const [roleFormData, setRoleFormData] = useState({ role_name: '', description: '' });
  const [selectedRole, setSelectedRole] = useState(null);

  // Events state
  const [events, setEvents] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventModalType, setEventModalType] = useState('create');
  const [eventFormData, setEventFormData] = useState({
    title: '', description: '', event_type: 'cultural', status: 'draft',
    start_date: '', end_date: '', location: '', city: '', venue: '',
    is_online: false, meeting_link: '', max_capacity: '', fee: '0',
    is_free: true, members_only: false
  });

  useEffect(() => { loadData(); loadRoles(); }, []);
  useEffect(() => { if (activePage === 'users') loadUsers(); }, [currentPage, pageSize, activePage]);
  useEffect(() => { if (activePage === 'events') loadEvents(); }, [activePage]);

  // ─── Data loaders ───
  const loadData = async () => {
    try {
      showLoader('Loading Dashboard', 'Fetching analytics...');
      setError('');
      const res = await getDashboardAnalytics();
      hideLoader();
      if (res.success) setAnalytics(res.analytics);
      else setError(res.message || 'Failed to load analytics');
    } catch (err) {
      hideLoader();
      setError(err.response?.data?.detail || 'Failed to load dashboard');
    } finally { setLoading(false); }
  };

  const loadUsers = async () => {
    try {
      const res = await getUsers(currentPage * pageSize, pageSize);
      if (res.success) { setUsers(res.users || []); setTotalUsers(res.total || 0); }
    } catch (err) { console.error('Failed to load users:', err); }
  };

  const loadRoles = async () => {
    try { const res = await getRoles(); if (res.success) setRolesList(res.roles || []); }
    catch (err) { console.error('Failed to load roles:', err); }
  };

  const loadEvents = async () => {
    try {
      const res = await getAllEvents({ limit: 50 });
      if (res.success) setEvents(res.events || []);
    } catch (err) { console.error('Failed to load events:', err); }
  };

  // ─── User handlers ───
  const handleViewUser = async (user) => {
    try {
      const res = await getUserDetail(user.id);
      setFormData(res.success ? res.user : user);
    } catch { setFormData(user); }
    setModalType('view'); setShowModal(true);
  };
  const handleEditUser = (user) => { setSelectedUser(user); setFormData({ ...user }); setModalType('edit'); setShowModal(true); };
  const handleChangeRole = (user) => { setSelectedUser(user); setFormData({ ...user }); setModalType('changeRole'); setShowModal(true); };
  const handleDeleteUser = async (userId) => {
    const ok = await showConfirmDialog('Delete User', 'Are you sure you want to permanently delete this user?', 'Delete', 'Cancel');
    if (ok) { showLoader('Deleting...'); const r = await deleteUser(userId); hideLoader(); if (r.success) { showAlert('success', 'Deleted!', 'User deleted.', loadUsers); } else showAlert('error', 'Error', r.message); }
  };
  const handleToggleUserStatus = async (userId, currentStatus) => {
    showLoader(currentStatus ? 'Disabling...' : 'Enabling...');
    const action = currentStatus ? 'disable' : 'enable';
    const r = await toggleUserStatus(userId, action); hideLoader();
    if (r.success) showAlert('success', 'Done!', `User ${action}d.`, loadUsers);
    else showAlert('error', 'Error', r.message);
  };
  const handleSaveChanges = async () => {
    showLoader('Saving...');
    if (modalType === 'edit') {
      const r = await updateUser(selectedUser.id, formData); hideLoader();
      if (r.success) showAlert('success', 'Saved!', 'User updated.', () => { setShowModal(false); loadUsers(); });
      else showAlert('error', 'Error', r.message);
    } else if (modalType === 'changeRole') {
      const r = await changeUserRole(selectedUser.id, formData.role_name); hideLoader();
      if (r.success) showAlert('success', 'Done!', 'Role changed.', () => { setShowModal(false); loadUsers(); });
      else showAlert('error', 'Error', r.message);
    }
  };

  // ─── Role handlers ───
  const handleCreateRole = () => { setRoleFormData({ role_name: '', description: '' }); setRoleModalType('create'); setShowRoleModal(true); };
  const handleEditRole = (role) => { setSelectedRole(role); setRoleFormData({ role_name: role.role_name || role.name, description: role.description || '' }); setRoleModalType('edit'); setShowRoleModal(true); };
  const handleDeleteRole = async (roleId) => {
    const ok = await showConfirmDialog('Delete Role', 'Are you sure?', 'Delete', 'Cancel');
    if (ok) { showLoader('Deleting...'); const r = await deleteRole(roleId); hideLoader(); if (r.success) { showAlert('success', 'Deleted!', 'Role deleted.', loadRoles); } else showAlert('error', 'Error', r.message); }
  };
  const handleSaveRole = async () => {
    if (!roleFormData.role_name) { showAlert('error', 'Error', 'Role name is required'); return; }
    showLoader('Saving...');
    if (roleModalType === 'create') {
      const r = await createRole(roleFormData); hideLoader();
      if (r.success) showAlert('success', 'Created!', 'Role created.', () => { setShowRoleModal(false); loadRoles(); });
      else showAlert('error', 'Error', r.message);
    } else {
      const r = await updateRole(selectedRole.id || selectedRole.role_id, roleFormData); hideLoader();
      if (r.success) showAlert('success', 'Updated!', 'Role updated.', () => { setShowRoleModal(false); loadRoles(); });
      else showAlert('error', 'Error', r.message);
    }
  };

  // ─── Event handlers ───
  const handleCreateEvent = () => {
    setEventFormData({ title: '', description: '', event_type: 'cultural', status: 'draft', start_date: '', end_date: '', location: '', city: '', venue: '', is_online: false, meeting_link: '', max_capacity: '', fee: '0', is_free: true, members_only: false });
    setEventModalType('create'); setShowEventModal(true);
  };
  const handleEditEvent = (event) => {
    setEventFormData({
      ...event,
      start_date: event.start_date ? event.start_date.slice(0, 16) : '',
      end_date: event.end_date ? event.end_date.slice(0, 16) : '',
      max_capacity: event.max_capacity || '',
      fee: event.fee || '0',
    });
    setEventModalType('edit'); setShowEventModal(true);
  };
  const handleDeleteEvent = async (eventId) => {
    const ok = await showConfirmDialog('Delete Event', 'Are you sure?', 'Delete', 'Cancel');
    if (ok) { showLoader('Deleting...'); try { const r = await deleteEvent(eventId); hideLoader(); if (r.success) showAlert('success', 'Deleted!', 'Event deleted.', loadEvents); else showAlert('error', 'Error', r.message); } catch (e) { hideLoader(); showAlert('error', 'Error', e.response?.data?.detail || 'Failed'); } }
  };
  const handleSaveEvent = async () => {
    if (!eventFormData.title || !eventFormData.start_date) { showAlert('error', 'Error', 'Title and Start Date are required'); return; }
    showLoader('Saving...');
    const data = { ...eventFormData, fee: parseFloat(eventFormData.fee) || 0, max_capacity: eventFormData.max_capacity ? parseInt(eventFormData.max_capacity) : null };
    try {
      if (eventModalType === 'create') {
        const r = await createEvent(data); hideLoader();
        if (r.success) showAlert('success', 'Created!', 'Event created.', () => { setShowEventModal(false); loadEvents(); });
        else showAlert('error', 'Error', r.message);
      } else {
        const r = await updateEvent(eventFormData.id, data); hideLoader();
        if (r.success) showAlert('success', 'Updated!', 'Event updated.', () => { setShowEventModal(false); loadEvents(); });
        else showAlert('error', 'Error', r.message);
      }
    } catch (e) { hideLoader(); showAlert('error', 'Error', e.response?.data?.detail || 'Failed'); }
  };

  const totalPages = Math.ceil(totalUsers / pageSize);
  const getRoleBadgeClass = (r) => ({ admin: 'badge-admin', moderator: 'badge-moderator', organizer: 'badge-organizer', member: 'badge-member', user: 'badge-user' }[r?.toLowerCase()] || 'badge-user');

  if (loading && !analytics) {
    return (
      <Layout pageTitle={PAGE_TITLES[activePage]?.[0]} pageSubtitle={PAGE_TITLES[activePage]?.[1]}>
        <div className="page-loader"><div className="spinner"></div><span className="loading-text">Loading...</span></div>
      </Layout>
    );
  }

  return (
    <Layout pageTitle={PAGE_TITLES[activePage]?.[0] || 'Admin'} pageSubtitle={PAGE_TITLES[activePage]?.[1] || ''}>
      {error && <div className="alert alert-error" style={{ marginBottom: '16px' }}>⚠️ {error}</div>}

      {/* ═══ OVERVIEW DASHBOARD ═══ */}
      {activePage === 'dashboard' && (
        <>
          {analytics && (
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
              {[
                { icon: '👥', label: 'Total Users', value: analytics.total_users, cls: 'purple' },
                { icon: '✅', label: 'Active', value: analytics.active_users, cls: 'green' },
                { icon: '📧', label: 'Verified', value: analytics.verified_users, cls: 'blue' },
                { icon: '🔒', label: 'Admins', value: analytics.admin_users, cls: 'orange' },
                { icon: '🪪', label: 'Members', value: analytics.member_users, cls: 'teal' },
                { icon: '⏸️', label: 'Inactive', value: analytics.inactive_users, cls: 'red' },
              ].map(s => (
                <div className="stat-card" key={s.label}>
                  <div className={`stat-icon ${s.cls}`}>{s.icon}</div>
                  <div className="stat-info"><div className="stat-label">{s.label}</div><div className="stat-value">{s.value}</div></div>
                </div>
              ))}
            </div>
          )}
          <div className="quick-actions" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <div className="quick-action-card" onClick={() => navigate('/admin/users')}><div className="qa-icon" style={{ background: 'linear-gradient(135deg, #6C3CE1, #8B5CF6)' }}>👥</div><div className="qa-info"><h3>User Management</h3><p>{totalUsers || '—'} users</p></div></div>
            <div className="quick-action-card" onClick={() => navigate('/admin/events')}><div className="qa-icon" style={{ background: 'linear-gradient(135deg, #F59E0B, #FCD34D)' }}>📅</div><div className="qa-info"><h3>Manage Events</h3><p>Create & manage events</p></div></div>
            <div className="quick-action-card" onClick={() => navigate('/admin/roles')}><div className="qa-icon" style={{ background: 'linear-gradient(135deg, #10B981, #6EE7B7)' }}>🔑</div><div className="qa-info"><h3>Role Management</h3><p>Manage roles</p></div></div>
            <div className="quick-action-card" onClick={() => navigate('/admin/analytics')}><div className="qa-icon" style={{ background: 'linear-gradient(135deg, #3B82F6, #60A5FA)' }}>📊</div><div className="qa-info"><h3>Analytics</h3><p>View insights</p></div></div>
          </div>
          {/* Recent Users */}
          <div className="card">
            <div className="card-header"><div className="card-title">Recent Users</div><button className="btn btn-secondary btn-sm" onClick={() => navigate('/admin/users')}>View All →</button></div>
            <div className="table-wrapper">
              <table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th></tr></thead>
                <tbody>{users.slice(0, 5).map(u => (
                  <tr key={u.id}><td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{u.full_name}</td><td>{u.email}</td><td><span className={`badge ${getRoleBadgeClass(u.role_name)}`}>{u.role_name}</span></td><td><span className={`badge ${u.is_active ? 'status-active' : 'status-inactive'}`}>{u.is_active ? '● Active' : '● Inactive'}</span></td></tr>
                ))}{users.length === 0 && <tr><td colSpan="4" className="no-data">No users</td></tr>}</tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ═══ USER MANAGEMENT ═══ */}
      {activePage === 'users' && (
        <div className="card">
          <div className="card-header">
            <div><div className="card-title">All Users</div><div className="card-subtitle">Page {currentPage + 1} of {totalPages || 1} · {totalUsers} total</div></div>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/admin/users/create')}>➕ Add User</button>
          </div>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th><th>Verified</th><th>Actions</th></tr></thead>
              <tbody>
                {users.length > 0 ? users.map(u => (
                  <tr key={u.id}>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{u.full_name}</td>
                    <td>{u.email}</td><td>{u.phone || '—'}</td>
                    <td><span className={`badge ${getRoleBadgeClass(u.role_name)}`}>{u.role_name || 'Unassigned'}</span></td>
                    <td><span className={`badge ${u.is_active ? 'status-active' : 'status-inactive'}`}>{u.is_active ? '● Active' : '● Inactive'}</span></td>
                    <td><span className={`badge ${u.is_verified ? 'status-verified' : 'status-unverified'}`}>{u.is_verified ? '✓ Yes' : '✗ No'}</span></td>
                    <td>
                      <button className="action-btn view" onClick={() => handleViewUser(u)} title="View">👁️</button>
                      <button className="action-btn edit" onClick={() => handleEditUser(u)} title="Edit">✏️</button>
                      <button className="action-btn role" onClick={() => handleChangeRole(u)} title="Change Role">🔑</button>
                      <button className="action-btn toggle" onClick={() => handleToggleUserStatus(u.id, u.is_active)} title={u.is_active ? 'Disable' : 'Enable'}>{u.is_active ? '🔓' : '🔒'}</button>
                      <button className="action-btn delete" onClick={() => handleDeleteUser(u.id)} title="Delete">🗑️</button>
                    </td>
                  </tr>
                )) : <tr><td colSpan="7" className="no-data">No users found</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="pagination">
            <button className="pagination-btn" onClick={() => setCurrentPage(Math.max(0, currentPage - 1))} disabled={currentPage === 0}>← Previous</button>
            <span className="pagination-info">Page {currentPage + 1} of {totalPages || 1}</span>
            <select className="page-size-select" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(0); }}>
              <option value={5}>5</option><option value={10}>10</option><option value={20}>20</option><option value={50}>50</option>
            </select>
            <button className="pagination-btn" onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))} disabled={currentPage >= totalPages - 1}>Next →</button>
          </div>
        </div>
      )}

      {/* ═══ ROLE MANAGEMENT ═══ */}
      {activePage === 'roles' && (
        <div className="card">
          <div className="card-header">
            <div><div className="card-title">All Roles</div><div className="card-subtitle">{rolesList.length} roles configured</div></div>
            <button className="btn btn-primary btn-sm" onClick={handleCreateRole}>➕ Create Role</button>
          </div>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Role Name</th><th>Description</th><th>Actions</th></tr></thead>
              <tbody>
                {rolesList.length > 0 ? rolesList.map(role => (
                  <tr key={role.id || role.role_id}>
                    <td><span className={`badge ${getRoleBadgeClass(role.role_name || role.name)}`}>{role.role_name || role.name}</span></td>
                    <td>{role.description || '—'}</td>
                    <td>
                      <button className="action-btn edit" onClick={() => handleEditRole(role)} title="Edit">✏️</button>
                      <button className="action-btn delete" onClick={() => handleDeleteRole(role.id || role.role_id)} title="Delete">🗑️</button>
                    </td>
                  </tr>
                )) : <tr><td colSpan="3" className="no-data">No roles found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══ EVENTS MANAGEMENT ═══ */}
      {activePage === 'events' && (
        <div className="card">
          <div className="card-header">
            <div><div className="card-title">All Events</div><div className="card-subtitle">{events.length} events</div></div>
            <button className="btn btn-primary btn-sm" onClick={handleCreateEvent}>➕ Create Event</button>
          </div>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Title</th><th>Type</th><th>Date</th><th>City</th><th>Fee</th><th>Capacity</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {events.length > 0 ? events.map(ev => (
                  <tr key={ev.id}>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{ev.title}</td>
                    <td><span className="badge badge-info">{ev.event_type}</span></td>
                    <td>{ev.start_date ? new Date(ev.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</td>
                    <td>{ev.city || ev.location || '—'}</td>
                    <td style={{ color: ev.is_free ? 'var(--success)' : 'var(--text-primary)', fontWeight: 600 }}>{ev.is_free ? 'Free' : `₹${ev.fee}`}</td>
                    <td>{ev.registration_count || 0}{ev.max_capacity ? ` / ${ev.max_capacity}` : ''}</td>
                    <td><span className={`badge ${ev.status === 'published' ? 'status-active' : ev.status === 'cancelled' ? 'status-inactive' : 'status-unverified'}`}>{ev.status}</span></td>
                    <td>
                      <button className="action-btn edit" onClick={() => handleEditEvent(ev)} title="Edit">✏️</button>
                      <button className="action-btn delete" onClick={() => handleDeleteEvent(ev.id)} title="Delete">🗑️</button>
                    </td>
                  </tr>
                )) : <tr><td colSpan="8" className="no-data">No events found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══ ANALYTICS ═══ */}
      {activePage === 'analytics' && analytics && (
        <>
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div className="stat-card"><div className="stat-icon purple">👥</div><div className="stat-info"><div className="stat-label">Total Users</div><div className="stat-value">{analytics.total_users}</div></div></div>
            <div className="stat-card"><div className="stat-icon green">✅</div><div className="stat-info"><div className="stat-label">Active Users</div><div className="stat-value">{analytics.active_users}</div></div></div>
            <div className="stat-card"><div className="stat-icon blue">📧</div><div className="stat-info"><div className="stat-label">Verified Users</div><div className="stat-value">{analytics.verified_users}</div></div></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="card">
              <div className="card-header"><div className="card-title">Role Distribution</div></div>
              <div className="card-body">
                {analytics.role_distribution?.map(([role, count]) => (
                  <div key={role} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                    <span className={`badge ${getRoleBadgeClass(role)}`}>{role}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '120px', height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${(count / analytics.total_users) * 100}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--primary-light))', borderRadius: '3px' }} />
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', minWidth: '28px', textAlign: 'right' }}>{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <div className="card-header"><div className="card-title">Platform Health</div></div>
              <div className="card-body">
                {[
                  { label: 'Active Rate', value: `${analytics.total_users ? Math.round((analytics.active_users / analytics.total_users) * 100) : 0}%`, color: 'var(--success)' },
                  { label: 'Verification Rate', value: `${analytics.total_users ? Math.round((analytics.verified_users / analytics.total_users) * 100) : 0}%`, color: 'var(--primary-light)' },
                  { label: 'Total Events', value: events.length || '—', color: 'var(--accent)' },
                  { label: 'Total Roles', value: rolesList.length, color: 'var(--text-primary)' },
                ].map(m => (
                  <div key={m.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{m.label}</span>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: m.color }}>{m.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ═══ PERMISSIONS ═══ */}
      {activePage === 'permissions' && (
        <div className="card">
          <div className="card-header"><div className="card-title">Access Control</div></div>
          <div className="card-body">
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Role</th><th>Users</th><th>Events</th><th>Payments</th><th>Settings</th><th>Analytics</th></tr></thead>
                <tbody>
                  {[
                    { role: 'admin', users: '✅ Full', events: '✅ Full', payments: '✅ Full', settings: '✅ Full', analytics: '✅ Full' },
                    { role: 'moderator', users: '🔍 View', events: '🔍 View', payments: '❌ No', settings: '❌ No', analytics: '🔍 View' },
                    { role: 'organizer', users: '❌ No', events: '✅ Full', payments: '🔍 Own', settings: '❌ No', analytics: '🔍 Own' },
                    { role: 'member', users: '❌ No', events: '🔍 View', payments: '🔍 Own', settings: '❌ No', analytics: '❌ No' },
                    { role: 'user', users: '❌ No', events: '🔍 Public', payments: '❌ No', settings: '❌ No', analytics: '❌ No' },
                  ].map(p => (
                    <tr key={p.role}><td><span className={`badge ${getRoleBadgeClass(p.role)}`}>{p.role}</span></td><td>{p.users}</td><td>{p.events}</td><td>{p.payments}</td><td>{p.settings}</td><td>{p.analytics}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══ PAYMENTS ═══ */}
      {activePage === 'payments' && (
        <div className="card">
          <div className="card-header"><div className="card-title">Payment Transactions</div></div>
          <div className="card-body">
            <div className="empty-state"><div className="empty-state-icon">💳</div><h3>No Payments Yet</h3><p>Payment transactions will appear here once the payment gateway is integrated.</p></div>
          </div>
        </div>
      )}

      {/* ═══ ANNOUNCEMENTS ═══ */}
      {activePage === 'announcements' && (
        <div className="card">
          <div className="card-header"><div className="card-title">Platform Announcements</div><button className="btn btn-primary btn-sm">➕ New Announcement</button></div>
          <div className="card-body">
            <div className="empty-state"><div className="empty-state-icon">📣</div><h3>No Announcements</h3><p>Create announcements to notify all platform users.</p></div>
          </div>
        </div>
      )}

      {/* ═══ SETTINGS ═══ */}
      {activePage === 'settings' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="card">
            <div className="card-header"><div className="card-title">General Settings</div></div>
            <div className="card-body">
              <div className="detail-list">
                <div className="detail-row"><label>Platform Name</label><span>MTM Platform</span></div>
                <div className="detail-row"><label>Organization</label><span>Telugu Mahasabha</span></div>
                <div className="detail-row"><label>Default Role</label><span className="badge badge-user">user</span></div>
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
                <div className="detail-row"><label>OTP Template</label><span>Active</span></div>
                <div className="detail-row"><label>Welcome Email</label><span>Active</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ AUDIT LOGS ═══ */}
      {activePage === 'logs' && (
        <div className="card">
          <div className="card-header"><div className="card-title">System Activity Log</div></div>
          <div className="card-body">
            {[
              { time: 'Just now', action: 'Admin viewed audit logs', icon: '📋', type: 'info' },
              { time: '2 min ago', action: 'User registered for event', icon: '🎫', type: 'success' },
              { time: '15 min ago', action: 'New user signed up: user@example.com', icon: '👤', type: 'info' },
              { time: '1 hour ago', action: 'Event published: Ugadi Celebrations', icon: '📅', type: 'success' },
              { time: '2 hours ago', action: 'Role updated: moderator', icon: '🔑', type: 'warning' },
              { time: '3 hours ago', action: 'System backup completed', icon: '💾', type: 'info' },
            ].map((log, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '18px' }}>{log.icon}</span>
                <div style={{ flex: 1 }}><div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>{log.action}</div></div>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{log.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ USER MODAL ═══ */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{modalType === 'view' ? '👁️ User Details' : modalType === 'edit' ? '✏️ Edit User' : '🔑 Change Role'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              {modalType === 'view' ? (
                <div className="detail-list">
                  {[{ l: 'Full Name', v: formData.full_name }, { l: 'Email', v: formData.email }, { l: 'Phone', v: formData.phone || '—' }, { l: 'Role', v: formData.role_name }, { l: 'Status', v: formData.is_active ? 'Active' : 'Inactive' }, { l: 'Verified', v: formData.is_verified ? 'Yes' : 'No' }, { l: 'Created', v: formData.created_at ? new Date(formData.created_at).toLocaleDateString() : '—' }].map(({ l, v }) => (
                    <div key={l} className="detail-row"><label>{l}</label><span>{v}</span></div>
                  ))}
                </div>
              ) : modalType === 'edit' ? (
                <>
                  <div className="form-group"><label>Full Name</label><input type="text" value={formData.full_name || ''} onChange={e => setFormData({ ...formData, full_name: e.target.value })} /></div>
                  <div className="form-group"><label>Email</label><input type="email" value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} /></div>
                  <div className="form-group"><label>Phone</label><input type="tel" value={formData.phone || ''} onChange={e => setFormData({ ...formData, phone: e.target.value })} /></div>
                </>
              ) : (
                <div className="form-group"><label>Select New Role</label>
                  <select value={formData.role_name || ''} onChange={e => setFormData({ ...formData, role_name: e.target.value })}>
                    <option value="">Select a role</option>
                    {roles.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                  </select>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              {modalType !== 'view' && <button className="btn btn-primary" onClick={handleSaveChanges}>Save Changes</button>}
            </div>
          </div>
        </div>
      )}

      {/* ═══ ROLE MODAL ═══ */}
      {showRoleModal && (
        <div className="modal-overlay" onClick={() => setShowRoleModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{roleModalType === 'create' ? '➕ Create Role' : '✏️ Edit Role'}</h2>
              <button className="modal-close" onClick={() => setShowRoleModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group"><label>Role Name *</label><input type="text" value={roleFormData.role_name || ''} onChange={e => setRoleFormData({ ...roleFormData, role_name: e.target.value })} placeholder="e.g., admin, member" /></div>
              <div className="form-group"><label>Description</label><textarea rows="3" value={roleFormData.description || ''} onChange={e => setRoleFormData({ ...roleFormData, description: e.target.value })} placeholder="Optional description" /></div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowRoleModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveRole}>{roleModalType === 'create' ? 'Create' : 'Update'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ EVENT MODAL ═══ */}
      {showEventModal && (
        <div className="modal-overlay" onClick={() => setShowEventModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <h2 className="modal-title">{eventModalType === 'create' ? '➕ Create Event' : '✏️ Edit Event'}</h2>
              <button className="modal-close" onClick={() => setShowEventModal(false)}>×</button>
            </div>
            <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              <div className="form-group"><label>Title *</label><input type="text" value={eventFormData.title} onChange={e => setEventFormData({ ...eventFormData, title: e.target.value })} placeholder="Event title" /></div>
              <div className="form-group"><label>Description</label><textarea rows="3" value={eventFormData.description || ''} onChange={e => setEventFormData({ ...eventFormData, description: e.target.value })} placeholder="Event description" /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group"><label>Type</label>
                  <select value={eventFormData.event_type} onChange={e => setEventFormData({ ...eventFormData, event_type: e.target.value })}>
                    <option value="cultural">Cultural</option><option value="education">Education</option><option value="conference">Conference</option>
                    <option value="workshop">Workshop</option><option value="social">Social</option><option value="sports">Sports</option><option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group"><label>Status</label>
                  <select value={eventFormData.status} onChange={e => setEventFormData({ ...eventFormData, status: e.target.value })}>
                    <option value="draft">Draft</option><option value="published">Published</option><option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group"><label>Start Date *</label><input type="datetime-local" value={eventFormData.start_date} onChange={e => setEventFormData({ ...eventFormData, start_date: e.target.value })} /></div>
                <div className="form-group"><label>End Date</label><input type="datetime-local" value={eventFormData.end_date || ''} onChange={e => setEventFormData({ ...eventFormData, end_date: e.target.value })} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group"><label>City</label><input type="text" value={eventFormData.city || ''} onChange={e => setEventFormData({ ...eventFormData, city: e.target.value })} placeholder="City" /></div>
                <div className="form-group"><label>Venue</label><input type="text" value={eventFormData.venue || ''} onChange={e => setEventFormData({ ...eventFormData, venue: e.target.value })} placeholder="Venue name" /></div>
              </div>
              <div className="form-group"><label>Full Location</label><input type="text" value={eventFormData.location || ''} onChange={e => setEventFormData({ ...eventFormData, location: e.target.value })} placeholder="Full address" /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div className="form-group"><label>Max Capacity</label><input type="number" value={eventFormData.max_capacity} onChange={e => setEventFormData({ ...eventFormData, max_capacity: e.target.value })} placeholder="No limit" /></div>
                <div className="form-group"><label>Fee (₹)</label><input type="number" value={eventFormData.fee} onChange={e => setEventFormData({ ...eventFormData, fee: e.target.value, is_free: Number(e.target.value) === 0 })} /></div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', paddingBottom: '4px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px' }}>
                    <input type="checkbox" checked={eventFormData.members_only} onChange={e => setEventFormData({ ...eventFormData, members_only: e.target.checked })} /> Members Only
                  </label>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowEventModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveEvent}>{eventModalType === 'create' ? 'Create Event' : 'Update Event'}</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AdminDashboard;
