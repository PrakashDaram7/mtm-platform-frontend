import React, { useState, useEffect, useRef } from 'react';
import Layout from '../../components/Layout';
import DateRangePicker from '../../components/DateRangePicker';
import { getAllEvents, createEvent, updateEvent, deleteEvent } from '../../services/eventService';
import { showAlert, showConfirmDialog, showLoader, hideLoader } from '../../utils/alerts';

const EventManagement = () => {
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('create');
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [formData, setFormData] = useState({
        title: '', description: '', event_type: 'cultural', status: 'draft',
        start_date: '', end_date: '', location: '', city: '', venue: '',
        is_online: false, meeting_link: '', max_capacity: '', fee: '0',
        is_free: true, members_only: false
    });

    const searchTimerRef = useRef(null);

    useEffect(() => { loadEvents(); }, []);

    useEffect(() => {
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        searchTimerRef.current = setTimeout(() => applyFilters(), 300);
        return () => clearTimeout(searchTimerRef.current);
    }, [searchQuery, filterType, filterStatus, dateFrom, dateTo, events]);

    const loadEvents = async () => {
        setLoading(true);
        try {
            const res = await getAllEvents();
            if (res.success) { setEvents(res.events || []); setFilteredEvents(res.events || []); }
        } catch (err) { console.error('Load events error:', err); }
        finally { setLoading(false); }
    };

    const applyFilters = () => {
        let list = [...events];
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter(e => (e.title || '').toLowerCase().includes(q) || (e.city || '').toLowerCase().includes(q));
        }
        if (filterType) list = list.filter(e => e.event_type === filterType);
        if (filterStatus) list = list.filter(e => e.status === filterStatus);
        if (dateFrom) {
            const from = new Date(dateFrom); from.setHours(0, 0, 0, 0);
            list = list.filter(e => e.start_date && new Date(e.start_date) >= from);
        }
        if (dateTo) {
            const to = new Date(dateTo); to.setHours(23, 59, 59, 999);
            list = list.filter(e => e.start_date && new Date(e.start_date) <= to);
        }
        setFilteredEvents(list);
    };

    const resetForm = () => ({
        title: '', description: '', event_type: 'cultural', status: 'draft',
        start_date: '', end_date: '', location: '', city: '', venue: '',
        is_online: false, meeting_link: '', max_capacity: '', fee: '0',
        is_free: true, members_only: false
    });

    const handleCreate = () => { setSelectedEvent(null); setFormData(resetForm()); setModalType('create'); setShowModal(true); };

    const handleEdit = (ev) => {
        setSelectedEvent(ev);
        setFormData({
            title: ev.title || '', description: ev.description || '', event_type: ev.event_type || 'cultural',
            status: ev.status || 'draft', start_date: ev.start_date ? ev.start_date.slice(0, 16) : '',
            end_date: ev.end_date ? ev.end_date.slice(0, 16) : '', location: ev.location || '',
            city: ev.city || '', venue: ev.venue || '', is_online: ev.is_online || false,
            meeting_link: ev.meeting_link || '', max_capacity: ev.max_capacity || '',
            fee: ev.fee || '0', is_free: ev.is_free ?? true, members_only: ev.members_only || false
        });
        setModalType('edit'); setShowModal(true);
    };

    const handleDelete = async (evId) => {
        const confirmed = await showConfirmDialog('Delete Event', 'Delete this event permanently?', 'Delete', 'Cancel');
        if (!confirmed) return;
        showLoader('Deleting...');
        try {
            const res = await deleteEvent(evId);
            hideLoader();
            if (res.success) { showAlert('success', 'Deleted!', 'Event removed.'); loadEvents(); }
            else showAlert('error', 'Error', res.message);
        } catch (err) { hideLoader(); showAlert('error', 'Error', err?.response?.data?.detail || 'Failed'); }
    };

    const handleSave = async () => {
        if (!formData.title || !formData.start_date) { showAlert('error', 'Validation', 'Title and start date required.'); return; }
        showLoader('Saving...');
        try {
            const payload = { ...formData, fee: Number(formData.fee) || 0, max_capacity: formData.max_capacity ? Number(formData.max_capacity) : null };
            const res = modalType === 'create' ? await createEvent(payload) : await updateEvent(selectedEvent.id || selectedEvent.event_id, payload);
            hideLoader();
            if (res?.success) showAlert('success', modalType === 'create' ? 'Created!' : 'Updated!', 'Event saved.', () => { setShowModal(false); loadEvents(); });
            else showAlert('error', 'Error', res?.message || 'Failed');
        } catch (err) { hideLoader(); showAlert('error', 'Error', err?.response?.data?.detail || 'Failed'); }
    };

    const getStatusBadge = (s) => ({ draft: 'badge-draft', published: 'status-active', cancelled: 'status-inactive' }[s] || 'badge-member');

    return (
        <Layout pageTitle="Events Management" pageSubtitle="Create, edit, and manage all events">
            <div className="filter-bar">
                <div className="filter-row">
                    <input type="text" className="filter-input" value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)} placeholder="Search events..." />
                    <div style={{ flex: 1 }} />
                    <select className="filter-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
                        <option value="">All Types</option>
                        <option value="cultural">Cultural</option><option value="education">Education</option>
                        <option value="conference">Conference</option><option value="workshop">Workshop</option>
                        <option value="social">Social</option><option value="sports">Sports</option><option value="other">Other</option>
                    </select>
                    <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                        <option value="">All Status</option>
                        <option value="draft">Draft</option><option value="published">Published</option><option value="cancelled">Cancelled</option>
                    </select>
                    <DateRangePicker
                        dateFrom={dateFrom} dateTo={dateTo}
                        onChange={(f, t) => { setDateFrom(f); setDateTo(t); }} />
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <div>
                        <div className="card-title">All Events</div>
                        <div className="card-subtitle">{filteredEvents.length} events{searchQuery && ` matching "${searchQuery}"`}</div>
                    </div>
                    <button className="btn btn-primary" onClick={handleCreate}>➕ Create Event</button>
                </div>
                <div className="table-wrapper">
                    <table>
                        <thead><tr><th>S.No</th><th>Title</th><th>Type</th><th>Date</th><th>City</th><th>Fee</th><th>Capacity</th><th>Status</th><th>Actions</th></tr></thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="9" className="no-data"><div className="spinner" style={{ margin: '0 auto', width: '24px', height: '24px' }}></div></td></tr>
                            ) : filteredEvents.length > 0 ? filteredEvents.map((ev, idx) => (
                                <tr key={ev.id || ev.event_id}>
                                    <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{idx + 1}</td>
                                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{ev.title}</td>
                                    <td><span className="badge badge-member">{ev.event_type}</span></td>
                                    <td style={{ whiteSpace: 'nowrap', fontSize: '12px' }}>{ev.start_date ? new Date(ev.start_date).toLocaleDateString() : '—'}</td>
                                    <td>{ev.city || '—'}</td>
                                    <td>{ev.is_free ? 'Free' : `₹${ev.fee}`}</td>
                                    <td>{ev.max_capacity || '∞'}</td>
                                    <td><span className={`badge ${getStatusBadge(ev.status)}`}>{ev.status}</span></td>
                                    <td style={{ whiteSpace: 'nowrap' }}>
                                        <button className="action-btn edit" onClick={() => handleEdit(ev)} title="Edit">✏️</button>
                                        <button className="action-btn delete" onClick={() => handleDelete(ev.id || ev.event_id)} title="Delete">🗑️</button>
                                    </td>
                                </tr>
                            )) : <tr><td colSpan="9" className="no-data">No events found</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Event Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '620px' }}>
                        <div className="modal-header">
                            <h2 className="modal-title">{modalType === 'create' ? '➕ Create Event' : '✏️ Edit Event'}</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                            <div className="form-group"><label>Title *</label><input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Event title" /></div>
                            <div className="form-group"><label>Description</label><textarea rows="3" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Event description" /></div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group"><label>Type</label>
                                    <select value={formData.event_type} onChange={e => setFormData({ ...formData, event_type: e.target.value })}>
                                        <option value="cultural">Cultural</option><option value="education">Education</option><option value="conference">Conference</option>
                                        <option value="workshop">Workshop</option><option value="social">Social</option><option value="sports">Sports</option><option value="other">Other</option>
                                    </select>
                                </div>
                                <div className="form-group"><label>Status</label>
                                    <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                        <option value="draft">Draft</option><option value="published">Published</option><option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group"><label>Start Date *</label><input type="datetime-local" value={formData.start_date} onChange={e => setFormData({ ...formData, start_date: e.target.value })} /></div>
                                <div className="form-group"><label>End Date</label><input type="datetime-local" value={formData.end_date} onChange={e => setFormData({ ...formData, end_date: e.target.value })} /></div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group"><label>City</label><input type="text" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} /></div>
                                <div className="form-group"><label>Venue</label><input type="text" value={formData.venue} onChange={e => setFormData({ ...formData, venue: e.target.value })} /></div>
                            </div>
                            <div className="form-group"><label>Full Location</label><input type="text" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} placeholder="Full address" /></div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                                <div className="form-group"><label>Max Capacity</label><input type="number" value={formData.max_capacity} onChange={e => setFormData({ ...formData, max_capacity: e.target.value })} placeholder="No limit" /></div>
                                <div className="form-group"><label>Fee (₹)</label><input type="number" value={formData.fee} onChange={e => setFormData({ ...formData, fee: e.target.value, is_free: Number(e.target.value) === 0 })} /></div>
                                <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', paddingBottom: '4px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px' }}>
                                        <input type="checkbox" checked={formData.members_only} onChange={e => setFormData({ ...formData, members_only: e.target.checked })} /> Members Only
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleSave}>{modalType === 'create' ? 'Create Event' : 'Update Event'}</button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default EventManagement;
