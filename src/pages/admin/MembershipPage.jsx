import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout';
import api from '../../services/api';

// ─── Shared helpers ────────────────────────────────────────────────────────
const STATUS_META = {
    active: { bg: '#D1FAE5', color: '#065F46', label: 'Active' },
    pending: { bg: '#FEF3C7', color: '#92400E', label: 'Pending' },
    expired: { bg: '#F3F4F6', color: '#374151', label: 'Expired' },
    blocked: { bg: '#FEE2E2', color: '#991B1B', label: 'Blocked' },
    rejected: { bg: '#FEE2E2', color: '#B91C1C', label: 'Rejected' },
};

const Badge = ({ status }) => {
    const m = STATUS_META[status] || { bg: '#F3F4F6', color: '#374151', label: status };
    return (
        <span style={{
            display: 'inline-block', padding: '3px 10px', borderRadius: 999,
            fontSize: '0.72rem', fontWeight: 700, background: m.bg, color: m.color,
        }}>{m.label}</span>
    );
};

const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

// ─── Shared input styles (light theme) ────────────────────────────────────
const inp = {
    width: '100%', padding: '0.65rem 0.9rem',
    border: '1.5px solid #E5E7EB', borderRadius: 8,
    color: '#1F2937', fontSize: '0.875rem', outline: 'none',
    background: '#fff', boxSizing: 'border-box', marginBottom: '0.9rem',
    fontFamily: 'Inter, sans-serif',
};

// ─── Feedback bar ──────────────────────────────────────────────────────────
const Alert = ({ msg, onClose, type = 'info' }) => {
    if (!msg) return null;
    const colors = {
        info: { bg: '#EFF6FF', border: '#BFDBFE', text: '#1E40AF' },
        success: { bg: '#ECFDF5', border: '#A7F3D0', text: '#065F46' },
        error: { bg: '#FEF2F2', border: '#FECACA', text: '#991B1B' },
    };
    const c = colors[type] || colors.info;
    return (
        <div style={{
            background: c.bg, border: `1px solid ${c.border}`, borderRadius: 10,
            padding: '0.7rem 1rem', marginBottom: '1rem', color: c.text,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            fontSize: '0.875rem', fontWeight: 500,
        }}>
            {msg}
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: c.text, cursor: 'pointer', fontSize: '1rem', lineHeight: 1 }}>✕</button>
        </div>
    );
};

// ─── Modal (light) ─────────────────────────────────────────────────────────
const Modal = ({ open, onClose, title, children }) => {
    if (!open) return null;
    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(17,24,39,0.5)', backdropFilter: 'blur(3px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
        }} onClick={onClose}>
            <div style={{
                background: '#fff', borderRadius: 16, padding: '1.75rem',
                width: '100%', maxWidth: 500, maxHeight: '92vh', overflowY: 'auto',
                boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h3 style={{ margin: 0, color: '#111827', fontSize: '1rem', fontWeight: 700 }}>{title}</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
                </div>
                {children}
            </div>
        </div>
    );
};

const BtnPrimary = ({ children, onClick, disabled }) => (
    <button onClick={onClick} disabled={disabled} style={{
        padding: '0.6rem 1.2rem', background: 'linear-gradient(135deg, #6C3CE1, #8B5CF6)',
        border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer', fontSize: '0.875rem',
        opacity: disabled ? 0.6 : 1, fontFamily: 'Inter, sans-serif',
    }}>{children}</button>
);
const BtnGhost = ({ children, onClick, style: s = {} }) => (
    <button onClick={onClick} style={{
        padding: '0.6rem 1.2rem', background: '#F9FAFB',
        border: '1.5px solid #E5E7EB', borderRadius: 8, color: '#374151', fontWeight: 600,
        cursor: 'pointer', fontSize: '0.875rem', fontFamily: 'Inter, sans-serif', ...s,
    }}>{children}</button>
);
const BtnDanger = ({ children, onClick }) => (
    <button onClick={onClick} style={{
        padding: '0.6rem 1.2rem', background: '#EF4444',
        border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700,
        cursor: 'pointer', fontSize: '0.875rem', fontFamily: 'Inter, sans-serif',
    }}>{children}</button>
);
const BtnSuccess = ({ children, onClick, disabled }) => (
    <button onClick={onClick} disabled={disabled} style={{
        padding: '0.6rem 1.2rem', background: '#10B981',
        border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer', fontSize: '0.875rem',
        opacity: disabled ? 0.6 : 1, fontFamily: 'Inter, sans-serif',
    }}>{children}</button>
);

// ═══════════════════════════════════════════════════════════════════════════
// PLANS TAB
// ═══════════════════════════════════════════════════════════════════════════
const PlansTab = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [editPlan, setEditPlan] = useState(null);
    const [delPlan, setDelPlan] = useState(null);
    const [feedback, setFeedback] = useState('');

    const blankPlan = { name: '', description: '', membership_type: 'individual', price: '', duration_months: 12, is_lifetime: false, currency: 'MUR', features: '', is_active: true };
    const [form, setForm] = useState(blankPlan);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const r = await api.get('/members/admin/plans');
            setPlans(r.data.plans || []);
        } catch { setPlans([]); }
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const save = async () => {
        try {
            const payload = {
                ...form, price: parseFloat(form.price),
                duration_months: form.is_lifetime ? null : parseInt(form.duration_months),
                features: form.features ? form.features.split(',').map(f => f.trim()).filter(Boolean) : [],
            };
            if (editPlan) { await api.put(`/members/admin/plans/${editPlan.id}`, payload); setFeedback('Plan updated!'); }
            else { await api.post('/members/admin/plans', payload); setFeedback('Plan created!'); }
            setShowAdd(false); setEditPlan(null); load();
        } catch (e) { setFeedback(e.response?.data?.detail || 'Error saving plan'); }
    };

    const openEdit = (p) => {
        setForm({ name: p.name, description: p.description || '', membership_type: p.membership_type, price: p.price, duration_months: p.duration_months || 12, is_lifetime: p.is_lifetime, currency: p.currency || 'MUR', features: (p.features || []).join(', '), is_active: p.is_active });
        setEditPlan(p); setShowAdd(true);
    };

    const F = ({ label, k, type = 'text', placeholder = '' }) => (
        <div style={{ marginBottom: 4 }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#374151', marginBottom: 4 }}>{label}</label>
            <input style={inp} type={type} placeholder={placeholder} value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
        </div>
    );

    return (
        <div>
            <Alert msg={feedback} onClose={() => setFeedback('')} type="success" />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <BtnPrimary onClick={() => { setForm(blankPlan); setEditPlan(null); setShowAdd(true); }}>+ Add Plan</BtnPrimary>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', color: '#9CA3AF', padding: '3rem' }}>Loading plans…</div>
            ) : plans.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#9CA3AF', padding: '3rem' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🎫</div>
                    No plans yet. Create your first plan.
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                    {plans.map(p => (
                        <div key={p.id} style={{ background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: 16, padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                <span style={{ fontWeight: 700, color: '#111827', fontSize: '1rem' }}>{p.name}</span>
                                <Badge status={p.is_active ? 'active' : 'expired'} />
                            </div>
                            <p style={{ color: '#6C3CE1', fontWeight: 800, fontSize: '1.5rem', margin: '4px 0' }}>
                                {p.currency} {Number(p.price).toLocaleString()}
                            </p>
                            <p style={{ color: '#6B7280', fontSize: '0.8rem', margin: '0 0 8px' }}>
                                {p.is_lifetime ? 'Lifetime' : `${p.duration_months} months`} · {p.membership_type}
                            </p>
                            <p style={{ color: '#4B5563', fontSize: '0.82rem', lineHeight: 1.5, margin: '0 0 12px' }}>{p.description}</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
                                {(p.features || []).map((f, i) => (
                                    <span key={i} style={{ fontSize: '0.72rem', background: 'rgba(108,60,225,0.08)', color: '#6C3CE1', padding: '2px 8px', borderRadius: 20 }}>✓ {f}</span>
                                ))}
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button onClick={() => openEdit(p)} style={{ flex: 1, padding: '0.45rem', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 8, color: '#1D4ED8', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}>Edit</button>
                                <button onClick={() => setDelPlan(p)} style={{ flex: 1, padding: '0.45rem', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, color: '#DC2626', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}>Delete</button>
                            </div>
                            <p style={{ color: '#9CA3AF', fontSize: '0.72rem', marginTop: 10 }}>{p.member_count || 0} active member(s)</p>
                        </div>
                    ))}
                </div>
            )}

            <Modal open={showAdd} onClose={() => { setShowAdd(false); setEditPlan(null); }} title={editPlan ? 'Edit Plan' : 'Create New Plan'}>
                <F label="Plan Name *" k="name" placeholder="e.g. Annual Individual" />
                <F label="Description" k="description" placeholder="Brief description" />
                <F label="Price" k="price" type="number" placeholder="1500" />

                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#374151', marginBottom: 4 }}>Membership Type</label>
                <select style={inp} value={form.membership_type} onChange={e => setForm(f => ({ ...f, membership_type: e.target.value }))}>
                    <option value="individual">Individual</option>
                    <option value="family">Family</option>
                </select>

                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#374151', marginBottom: 4 }}>Currency</label>
                <select style={inp} value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}>
                    <option value="MUR">MUR</option><option value="USD">USD</option><option value="EUR">EUR</option>
                </select>

                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: '#374151', marginBottom: '0.9rem', fontSize: '0.875rem' }}>
                    <input type="checkbox" checked={form.is_lifetime} onChange={e => setForm(f => ({ ...f, is_lifetime: e.target.checked }))} style={{ accentColor: '#6C3CE1' }} />
                    Lifetime plan (no expiry)
                </label>

                {!form.is_lifetime && (
                    <F label="Duration (months)" k="duration_months" type="number" />
                )}

                <div style={{ marginBottom: 4 }}>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#374151', marginBottom: 4 }}>Features (comma-separated)</label>
                    <input style={inp} value={form.features} onChange={e => setForm(f => ({ ...f, features: e.target.value }))} placeholder="All events access, Digital card, Directory" />
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: '#374151', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
                    <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} style={{ accentColor: '#6C3CE1' }} />
                    Plan is active (visible to applicants)
                </label>

                <div style={{ display: 'flex', gap: 10 }}>
                    <BtnGhost onClick={() => { setShowAdd(false); setEditPlan(null); }} style={{ flex: 1 }}>Cancel</BtnGhost>
                    <BtnPrimary onClick={save}>
                        {editPlan ? 'Update Plan' : 'Create Plan'}
                    </BtnPrimary>
                </div>
            </Modal>

            <Modal open={!!delPlan} onClose={() => setDelPlan(null)} title="Delete Plan">
                <p style={{ color: '#4B5563', marginBottom: '1rem' }}>
                    Delete plan <strong style={{ color: '#111827' }}>{delPlan?.name}</strong>? This cannot be undone.
                </p>
                <div style={{ display: 'flex', gap: 10 }}>
                    <BtnGhost onClick={() => setDelPlan(null)} style={{ flex: 1 }}>Cancel</BtnGhost>
                    <BtnDanger onClick={async () => { try { await api.delete(`/members/admin/plans/${delPlan.id}`); setFeedback('Plan deleted'); setDelPlan(null); load(); } catch (e) { setFeedback(e.response?.data?.detail || 'Error'); } }}>Delete</BtnDanger>
                </div>
            </Modal>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// PENDING APPLICATIONS TAB
// ═══════════════════════════════════════════════════════════════════════════
const ApplicationsTab = () => {
    const [memberships, setMemberships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [action, setAction] = useState(null);
    const [reason, setReason] = useState('');
    const [feedback, setFeedback] = useState('');
    const [fbType, setFbType] = useState('success');

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const r = await api.get('/members/admin/all?status=pending&limit=100');
            setMemberships(r.data.memberships || []);
        } catch { setMemberships([]); }
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const doAction = async () => {
        try {
            if (action === 'approve') {
                await api.post(`/members/admin/${selected.id}/approve`, { notes: reason });
                setFeedback(`Approved! Membership issued.`); setFbType('success');
            } else {
                if (!reason.trim()) { setFeedback('Rejection reason is required'); setFbType('error'); return; }
                await api.post(`/members/admin/${selected.id}/reject`, { reason });
                setFeedback('Application rejected.'); setFbType('info');
            }
            setSelected(null); setAction(null); setReason(''); load();
        } catch (e) { setFeedback(e.response?.data?.detail || 'Error'); setFbType('error'); }
    };

    return (
        <div>
            <Alert msg={feedback} onClose={() => setFeedback('')} type={fbType} />

            {loading ? (
                <div style={{ textAlign: 'center', color: '#9CA3AF', padding: '3rem' }}>Loading…</div>
            ) : memberships.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#6B7280' }}>
                    <div style={{ fontSize: '3rem', marginBottom: 12 }}>🎉</div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>All caught up!</div>
                    <div style={{ fontSize: '0.875rem' }}>No pending applications at the moment.</div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {memberships.map(m => (
                        <div key={m.id} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            background: '#fff', border: '1.5px solid #E5E7EB',
                            borderLeft: '4px solid #F59E0B',
                            borderRadius: 12, padding: '1rem 1.25rem', flexWrap: 'wrap', gap: 12,
                            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                <div style={{
                                    width: 44, height: 44, borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #6C3CE1, #8B5CF6)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1rem', fontWeight: 800, color: '#fff', flexShrink: 0,
                                }}>
                                    {(m.user?.full_name || 'M').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                </div>
                                <div>
                                    <p style={{ margin: 0, color: '#111827', fontWeight: 700, fontSize: '0.95rem' }}>{m.user?.full_name || '—'}</p>
                                    <p style={{ margin: '2px 0', color: '#6B7280', fontSize: '0.8rem' }}>
                                        {m.user?.email} {m.user?.phone ? `· ${m.user.phone}` : ''}
                                    </p>
                                    <p style={{ margin: '4px 0 0', color: '#6C3CE1', fontSize: '0.8rem', fontWeight: 500 }}>
                                        {m.plan_name} · {m.membership_type} · Applied {fmtDate(m.created_at)}
                                    </p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button onClick={() => { setSelected(m); setAction('approve'); setReason(''); }}
                                    style={{ padding: '0.5rem 1.1rem', background: '#ECFDF5', border: '1.5px solid #A7F3D0', borderRadius: 8, color: '#065F46', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem' }}>
                                    ✓ Approve
                                </button>
                                <button onClick={() => { setSelected(m); setAction('reject'); setReason(''); }}
                                    style={{ padding: '0.5rem 1.1rem', background: '#FEF2F2', border: '1.5px solid #FECACA', borderRadius: 8, color: '#991B1B', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem' }}>
                                    ✗ Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal open={!!selected && !!action} onClose={() => { setSelected(null); setAction(null); }}
                title={action === 'approve' ? 'Approve Application' : 'Reject Application'}>
                {selected && (
                    <>
                        <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 10, padding: '0.9rem', marginBottom: '1rem' }}>
                            <p style={{ margin: 0, fontWeight: 700, color: '#111827' }}>{selected.user?.full_name}</p>
                            <p style={{ margin: '2px 0 0', color: '#6B7280', fontSize: '0.8rem' }}>{selected.user?.email} · {selected.plan_name}</p>
                        </div>
                        <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#374151', marginBottom: 4 }}>
                            {action === 'approve' ? 'Admin Notes (optional)' : 'Reason for rejection *'}
                        </label>
                        <textarea value={reason} onChange={e => setReason(e.target.value)}
                            style={{ ...inp, resize: 'vertical', minHeight: 80 }}
                            placeholder={action === 'approve' ? 'Optional notes for this member…' : 'Please provide a reason…'} />
                        <div style={{ display: 'flex', gap: 10 }}>
                            <BtnGhost onClick={() => { setSelected(null); setAction(null); }} style={{ flex: 1 }}>Cancel</BtnGhost>
                            {action === 'approve'
                                ? <BtnSuccess onClick={doAction}>Approve & Issue Number</BtnSuccess>
                                : <BtnDanger onClick={doAction}>Reject Application</BtnDanger>}
                        </div>
                    </>
                )}
            </Modal>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// ALL MEMBERS TAB
// ═══════════════════════════════════════════════════════════════════════════
const AllMembersTab = () => {
    const [memberships, setMemberships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatus] = useState('');
    const [search, setSearch] = useState('');
    const [actionMod, setActionMod] = useState(null);
    const [actionValue, setActionValue] = useState('');
    const [extendMonths, setExtMonths] = useState(1);
    const [feedback, setFeedback] = useState('');
    const [fbType, setFbType] = useState('success');

    const load = useCallback(async () => {
        setLoading(true);
        try {
            let url = `/members/admin/all?limit=100`;
            if (statusFilter) url += `&status=${statusFilter}`;
            if (search) url += `&search=${encodeURIComponent(search)}`;
            const r = await api.get(url);
            setMemberships(r.data.memberships || []);
        } catch { setMemberships([]); }
        setLoading(false);
    }, [statusFilter, search]);

    useEffect(() => { load(); }, [load]);

    const doAction = async () => {
        const { type, membership } = actionMod;
        try {
            if (type === 'extend') { await api.post(`/members/admin/${membership.id}/extend`, { extend_months: extendMonths, reason: actionValue }); setFeedback(`Extended by ${extendMonths} months.`); setFbType('success'); }
            else if (type === 'block') { await api.post(`/members/admin/${membership.id}/block`, { reason: actionValue }); setFeedback('Membership blocked.'); setFbType('info'); }
            else if (type === 'unblock') { await api.post(`/members/admin/${membership.id}/unblock`); setFeedback('Membership unblocked.'); setFbType('success'); }
            setActionMod(null); setActionValue(''); setExtMonths(1); load();
        } catch (e) { setFeedback(e.response?.data?.detail || 'Error'); setFbType('error'); }
    };

    const th = { padding: '0.6rem 0.85rem', color: '#6B7280', textAlign: 'left', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1.5px solid #E5E7EB', whiteSpace: 'nowrap' };
    const td = { padding: '0.85rem', verticalAlign: 'middle', borderBottom: '1px solid #F3F4F6', fontSize: '0.875rem' };

    return (
        <div>
            <Alert msg={feedback} onClose={() => setFeedback('')} type={fbType} />

            <div style={{ display: 'flex', gap: 10, marginBottom: '1.2rem', flexWrap: 'wrap' }}>
                <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search name, email, phone, membership #…"
                    style={{ ...inp, marginBottom: 0, flex: '1 1 220px', minWidth: 200 }} />
                <select value={statusFilter} onChange={e => setStatus(e.target.value)}
                    style={{ ...inp, marginBottom: 0, width: 160 }}>
                    <option value="">All Statuses</option>
                    {Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', color: '#9CA3AF', padding: '3rem' }}>Loading…</div>
            ) : (
                <div style={{ overflowX: 'auto', background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                {['Member', 'Membership #', 'Plan', 'Type', 'Status', 'Expiry', 'Actions'].map(h => (
                                    <th key={h} style={th}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {memberships.length === 0 ? (
                                <tr><td colSpan={7} style={{ ...td, textAlign: 'center', color: '#9CA3AF', padding: '3rem' }}>No records found</td></tr>
                            ) : memberships.map(m => (
                                <tr key={m.id} style={{ transition: 'background 0.15s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                                    onMouseLeave={e => e.currentTarget.style.background = ''}>
                                    <td style={td}>
                                        <p style={{ margin: 0, fontWeight: 600, color: '#111827' }}>{m.user?.full_name || '—'}</p>
                                        <p style={{ margin: 0, color: '#9CA3AF', fontSize: '0.75rem' }}>{m.user?.email}</p>
                                    </td>
                                    <td style={{ ...td, color: '#6C3CE1', fontWeight: 700, fontFamily: 'monospace', fontSize: '0.8rem' }}>{m.membership_number || '—'}</td>
                                    <td style={{ ...td, color: '#374151' }}>{m.plan_name || '—'}</td>
                                    <td style={{ ...td, color: '#6B7280', textTransform: 'capitalize' }}>{m.membership_type}</td>
                                    <td style={td}><Badge status={m.status} /></td>
                                    <td style={{ ...td, color: '#6B7280', whiteSpace: 'nowrap' }}>{fmtDate(m.expiry_date)}</td>
                                    <td style={td}>
                                        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                                            {m.status === 'active' && (
                                                <>
                                                    <button onClick={() => { setActionMod({ type: 'extend', membership: m }); setActionValue(''); setExtMonths(1); }}
                                                        style={{ padding: '3px 10px', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 6, color: '#065F46', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>Extend</button>
                                                    <button onClick={() => { setActionMod({ type: 'block', membership: m }); setActionValue(''); }}
                                                        style={{ padding: '3px 10px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 6, color: '#DC2626', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>Block</button>
                                                </>
                                            )}
                                            {m.status === 'blocked' && (
                                                <button onClick={() => { setActionMod({ type: 'unblock', membership: m }); }}
                                                    style={{ padding: '3px 10px', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 6, color: '#065F46', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>Unblock</button>
                                            )}
                                            {(m.status === 'expired' || m.status === 'pending') && (
                                                <button onClick={() => { setActionMod({ type: 'extend', membership: m }); setActionValue(''); setExtMonths(12); }}
                                                    style={{ padding: '3px 10px', background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 6, color: '#92400E', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>Renew</button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Extend / Block Modal */}
            <Modal open={!!actionMod && actionMod.type !== 'unblock'} onClose={() => setActionMod(null)}
                title={actionMod?.type === 'extend' ? 'Extend Membership' : 'Block Membership'}>
                {actionMod && (
                    <>
                        <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 10, padding: '0.9rem', marginBottom: '1rem' }}>
                            <p style={{ margin: 0, fontWeight: 700, color: '#111827' }}>{actionMod.membership?.user?.full_name}</p>
                        </div>
                        {actionMod.type === 'extend' && (
                            <div style={{ marginBottom: 4 }}>
                                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#374151', marginBottom: 4 }}>Extend by (months)</label>
                                <input type="number" min={1} max={24} value={extendMonths} onChange={e => setExtMonths(parseInt(e.target.value))} style={inp} />
                            </div>
                        )}
                        <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#374151', marginBottom: 4 }}>
                            {actionMod.type === 'extend' ? 'Reason (optional)' : 'Reason for blocking *'}
                        </label>
                        <textarea value={actionValue} onChange={e => setActionValue(e.target.value)}
                            style={{ ...inp, resize: 'vertical', minHeight: 80 }} placeholder="Enter reason…" />
                        <div style={{ display: 'flex', gap: 10 }}>
                            <BtnGhost onClick={() => setActionMod(null)} style={{ flex: 1 }}>Cancel</BtnGhost>
                            {actionMod.type === 'block'
                                ? <BtnDanger onClick={doAction}>Block Membership</BtnDanger>
                                : <BtnSuccess onClick={doAction}>Extend Membership</BtnSuccess>}
                        </div>
                    </>
                )}
            </Modal>

            {/* Unblock Modal */}
            <Modal open={!!actionMod && actionMod.type === 'unblock'} onClose={() => setActionMod(null)} title="Unblock Membership">
                {actionMod && (
                    <>
                        <p style={{ color: '#4B5563', marginBottom: '1.25rem' }}>
                            Unblock membership for <strong style={{ color: '#111827' }}>{actionMod.membership?.user?.full_name}</strong>?
                        </p>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <BtnGhost onClick={() => setActionMod(null)} style={{ flex: 1 }}>Cancel</BtnGhost>
                            <BtnSuccess onClick={doAction}>Unblock</BtnSuccess>
                        </div>
                    </>
                )}
            </Modal>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// CSV MIGRATION TAB
// ═══════════════════════════════════════════════════════════════════════════
const CsvMigrationTab = () => {
    const [csvText, setCsvText] = useState('');
    const [preview, setPreview] = useState(null);
    const [plans, setPlans] = useState([]);
    const [defaultPlan, setDefPlan] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const DEFAULT_MAP = { full_name: 'full_name', email: 'email', phone: 'phone', address: 'address', occupation: 'occupation', membership_number: 'membership_number', membership_type: 'membership_type', status: 'status', start_date: 'start_date', expiry_date: 'expiry_date', amount_paid: 'amount_paid' };

    useEffect(() => {
        api.get('/members/admin/plans').then(r => setPlans(r.data.plans || [])).catch(() => { });
    }, []);

    const doPreview = async () => {
        setLoading(true);
        try { const r = await api.post('/members/admin/import/preview', { csv_content: csvText, column_map: DEFAULT_MAP }); setPreview(r.data); }
        catch (e) { setPreview({ success: false, error: e.response?.data?.detail || 'Error previewing' }); }
        setLoading(false);
    };

    const doImport = async () => {
        setLoading(true);
        try { const r = await api.post('/members/admin/import/execute', { csv_content: csvText, column_map: DEFAULT_MAP, default_plan_id: defaultPlan || null }); setResult(r.data); }
        catch (e) { setResult({ success: false, message: e.response?.data?.detail || 'Error' }); }
        setLoading(false);
    };

    return (
        <div>
            {/* Info box */}
            <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
                <p style={{ margin: 0, color: '#92400E', fontWeight: 700, fontSize: '0.875rem' }}>📋 CSV Format Requirements</p>
                <p style={{ margin: '6px 0 0', color: '#78350F', fontSize: '0.8rem', lineHeight: 1.7 }}>
                    Required: <code style={{ background: '#FEF3C7', padding: '1px 5px', borderRadius: 4 }}>full_name, email</code><br />
                    Optional: <code style={{ background: '#FEF3C7', padding: '1px 5px', borderRadius: 4 }}>phone, address, occupation, membership_number, membership_type, status, start_date, expiry_date, amount_paid</code><br />
                    Dates: <code style={{ background: '#FEF3C7', padding: '1px 5px', borderRadius: 4 }}>YYYY-MM-DD</code>
                </p>
            </div>

            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#374151', marginBottom: 4 }}>Default Plan (for rows without plan info)</label>
            <select value={defaultPlan} onChange={e => setDefPlan(e.target.value)} style={{ ...inp, width: 300 }}>
                <option value="">— No default plan —</option>
                {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>

            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#374151', marginBottom: 4 }}>Paste CSV Content</label>
            <textarea value={csvText} onChange={e => setCsvText(e.target.value)}
                style={{ ...inp, minHeight: 200, resize: 'vertical', fontFamily: 'monospace', fontSize: '0.78rem' }}
                placeholder={'full_name,email,phone,membership_number,status,expiry_date\nRavi Kumar,ravi@example.com,+230 5555 1234,MTM-2024-00001,active,2025-12-31'} />

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                <button onClick={doPreview} disabled={loading || !csvText.trim()}
                    style={{ padding: '0.65rem 1.4rem', background: '#EFF6FF', border: '1.5px solid #BFDBFE', borderRadius: 10, color: '#1D4ED8', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem', opacity: !csvText.trim() ? 0.5 : 1 }}>
                    {loading ? 'Previewing…' : '🔍 Preview Import'}
                </button>
                {preview?.valid_count > 0 && (
                    <BtnSuccess onClick={doImport} disabled={loading}>
                        {loading ? 'Importing…' : `⬆ Import ${preview.valid_count} Records`}
                    </BtnSuccess>
                )}
            </div>

            {preview && !result && (
                <div style={{ background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: 14, padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', gap: 24, marginBottom: 14 }}>
                        {[{ l: 'Total Rows', v: preview.total_rows, c: '#374151' }, { l: 'Valid', v: preview.valid_count, c: '#065F46' }, { l: 'Errors', v: preview.error_count, c: '#DC2626' }].map(s => (
                            <div key={s.l}>
                                <p style={{ margin: 0, color: '#9CA3AF', fontSize: '0.75rem' }}>{s.l}</p>
                                <p style={{ margin: 0, color: s.c, fontWeight: 800, fontSize: '1.5rem' }}>{s.v}</p>
                            </div>
                        ))}
                    </div>
                    {preview.errors?.length > 0 && (
                        <>
                            <p style={{ color: '#DC2626', fontWeight: 700, marginBottom: 8, fontSize: '0.875rem' }}>Errors:</p>
                            <div style={{ maxHeight: 200, overflowY: 'auto', fontSize: '0.78rem' }}>
                                {preview.errors.map((e, i) => (
                                    <div key={i} style={{ padding: '4px 0', borderBottom: '1px solid #F3F4F6', color: '#6B7280' }}>
                                        Row {e.row}: {e.errors?.join(', ') || e.error}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}

            {result && (
                <div style={{ background: result.success ? '#ECFDF5' : '#FEF2F2', border: `1.5px solid ${result.success ? '#A7F3D0' : '#FECACA'}`, borderRadius: 14, padding: '1.25rem' }}>
                    <p style={{ fontWeight: 700, color: result.success ? '#065F46' : '#DC2626', marginBottom: 8 }}>{result.message}</p>
                    {result.success && (
                        <div style={{ display: 'flex', gap: 24 }}>
                            <div><p style={{ margin: 0, color: '#065F46', fontWeight: 800, fontSize: '1.4rem' }}>{result.imported}</p><p style={{ margin: 0, color: '#6B7280', fontSize: '0.75rem' }}>Imported</p></div>
                            <div><p style={{ margin: 0, color: '#92400E', fontWeight: 800, fontSize: '1.4rem' }}>{result.skipped}</p><p style={{ margin: 0, color: '#6B7280', fontSize: '0.75rem' }}>Skipped</p></div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════
const MembershipPage = () => {
    const [tab, setTab] = useState('applications');
    const [stats, setStats] = useState(null);

    useEffect(() => {
        api.get('/members/admin/stats').then(r => setStats(r.data.stats)).catch(() => { });
    }, []);

    const TABS = [
        { id: 'applications', label: 'Pending Applications', icon: '⏳' },
        { id: 'members', label: 'All Members', icon: '👥' },
        { id: 'plans', label: 'Membership Plans', icon: '🎫' },
        { id: 'csv', label: 'CSV Migration', icon: '📤' },
    ];

    const STAT_CARDS = stats ? [
        { label: 'Total', val: stats.total, color: '#6C3CE1', icon: '🪪', iconBg: 'rgba(108,60,225,0.1)' },
        { label: 'Active', val: stats.active, color: '#059669', icon: '✅', iconBg: 'rgba(16,185,129,0.1)' },
        { label: 'Pending', val: stats.pending, color: '#D97706', icon: '⏳', iconBg: 'rgba(245,158,11,0.1)' },
        { label: 'Expired', val: stats.expired, color: '#6B7280', icon: '📅', iconBg: 'rgba(107,114,128,0.1)' },
        { label: 'Blocked', val: stats.blocked, color: '#DC2626', icon: '🚫', iconBg: 'rgba(239,68,68,0.1)' },
        { label: 'Expiring Soon', val: stats.expiring_soon, color: '#EA580C', icon: '⚠️', iconBg: 'rgba(249,115,22,0.1)' },
    ] : [];

    return (
        <Layout pageTitle="Membership Management" pageSubtitle="Plans, applications, approvals & migration tools">

            {/* Stats Row */}
            {stats && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginBottom: '1.5rem' }}>
                    {STAT_CARDS.map(s => (
                        <div key={s.label} style={{
                            background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: 14,
                            padding: '1rem', display: 'flex', alignItems: 'center', gap: 12,
                            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                        }}>
                            <div style={{ width: 40, height: 40, borderRadius: 10, background: s.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
                                {s.icon}
                            </div>
                            <div>
                                <p style={{ margin: 0, color: '#9CA3AF', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</p>
                                <p style={{ margin: '2px 0 0', color: s.color, fontWeight: 800, fontSize: '1.5rem', lineHeight: 1 }}>{s.val}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Tab Bar */}
            <div style={{
                display: 'flex', gap: 2, background: '#F3F4F6',
                border: '1.5px solid #E5E7EB', borderRadius: 12,
                padding: 4, marginBottom: '1.5rem', overflowX: 'auto',
                width: 'fit-content', maxWidth: '100%',
            }}>
                {TABS.map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)} style={{
                        whiteSpace: 'nowrap', padding: '0.55rem 1rem',
                        border: 'none', cursor: 'pointer', borderRadius: 8,
                        fontWeight: 600, fontSize: '0.82rem', transition: 'all 0.18s',
                        fontFamily: 'Inter, sans-serif',
                        background: tab === t.id ? '#fff' : 'transparent',
                        color: tab === t.id ? '#6C3CE1' : '#6B7280',
                        boxShadow: tab === t.id ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                    }}>
                        {t.icon} {t.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div style={{ background: '#F8F9FC', borderRadius: 16, padding: '1.5rem', border: '1.5px solid #E5E7EB', minHeight: 300 }}>
                {tab === 'applications' && <ApplicationsTab />}
                {tab === 'members' && <AllMembersTab />}
                {tab === 'plans' && <PlansTab />}
                {tab === 'csv' && <CsvMigrationTab />}
            </div>
        </Layout>
    );
};

export default MembershipPage;
