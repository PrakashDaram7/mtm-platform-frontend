import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../services/api';

const SettingsPage = () => {
    const [settings, setSettings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState({});
    const [feedback, setFeedback] = useState({ type: '', msg: '' });
    const [localVals, setLocalVals] = useState({});

    const load = async () => {
        setLoading(true);
        try {
            const r = await api.get('/members/admin/settings');
            const list = r.data.settings || [];
            setSettings(list);
            const vals = {};
            list.forEach(s => { vals[s.key] = s.value; });
            setLocalVals(vals);
        } catch { setSettings([]); }
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const save = async (key, value) => {
        setSaving(s => ({ ...s, [key]: true }));
        try {
            await api.put(`/members/admin/settings/${key}`, { value: String(value) });
            setFeedback({ type: 'success', msg: `Setting "${key}" updated successfully!` });
            load();
        } catch (e) {
            setFeedback({ type: 'error', msg: e.response?.data?.detail || `Error updating ${key}` });
        }
        setSaving(s => ({ ...s, [key]: false }));
        setTimeout(() => setFeedback({ type: '', msg: '' }), 4000);
    };

    const toggle = (key, current) => {
        const newVal = current === 'true' ? 'false' : 'true';
        setLocalVals(v => ({ ...v, [key]: newVal }));
        save(key, newVal);
    };

    const MEMBERSHIP_KEYS = ['auto_approve_membership', 'membership_renewal_reminder_days'];
    const PLATFORM_KEYS = ['platform_name', 'contact_email', 'currency'];
    const AUTH_KEYS = ['otp_expiry_minutes', 'max_login_attempts'];

    const get = (key) => localVals[key] ?? '';

    const groups = [
        {
            title: '🎫 Membership Settings',
            desc: 'Control membership workflow and reminder behaviour.',
            keys: MEMBERSHIP_KEYS,
            accent: '#6C3CE1',
            bg: '#F5F3FF',
            border: '#DDD6FE',
        },
        {
            title: '🌐 Platform Settings',
            desc: 'General platform information shown to members.',
            keys: PLATFORM_KEYS,
            accent: '#0284C7',
            bg: '#F0F9FF',
            border: '#BAE6FD',
        },
        {
            title: '🔒 Security & Auth',
            desc: 'OTP and authentication configuration.',
            keys: AUTH_KEYS,
            accent: '#DC2626',
            bg: '#FFF1F2',
            border: '#FECDD3',
        },
    ];

    const SETTING_META = {
        auto_approve_membership: {
            label: 'Auto-Approve Memberships',
            type: 'bool',
            desc: 'When ON, new membership applications are automatically approved without admin review and membership number is immediately issued.',
            icon: '⚡',
        },
        membership_renewal_reminder_days: {
            label: 'Renewal Reminder Days',
            type: 'text',
            desc: 'Comma-separated days before expiry to send reminders. E.g. "60,30,7,0"',
            icon: '🔔',
        },
        platform_name: {
            label: 'Platform Name',
            type: 'text',
            desc: 'Display name shown in emails and the member portal.',
            icon: '🏷️',
        },
        contact_email: {
            label: 'Contact Email',
            type: 'text',
            desc: 'Email address displayed to members for support queries.',
            icon: '📧',
        },
        currency: {
            label: 'Default Currency',
            type: 'text',
            desc: 'Currency code for membership fees (e.g. MUR, USD, EUR).',
            icon: '💰',
        },
        otp_expiry_minutes: {
            label: 'OTP Expiry (minutes)',
            type: 'text',
            desc: 'How long a one-time password remains valid before expiring.',
            icon: '⏱️',
        },
        max_login_attempts: {
            label: 'Max Login Attempts',
            type: 'text',
            desc: 'Number of failed OTP attempts before account is temporarily locked.',
            icon: '🛡️',
        },
    };

    // ─── Sub-components ────────────────────────────────────────────────────────

    const BoolToggle = ({ settingKey, accent }) => {
        const val = get(settingKey);
        const isOn = val === 'true';
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                    onClick={() => toggle(settingKey, val)}
                    style={{
                        width: 50, height: 28, borderRadius: 14, cursor: 'pointer',
                        background: isOn ? accent : '#D1D5DB',
                        position: 'relative', transition: 'background 0.3s',
                        boxShadow: isOn ? `0 0 0 3px ${accent}22` : 'none',
                    }}
                >
                    <div style={{
                        width: 22, height: 22, borderRadius: '50%',
                        background: '#fff',
                        position: 'absolute', top: 3,
                        left: isOn ? 25 : 3,
                        transition: 'left 0.25s',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                    }} />
                </div>
                <span style={{
                    color: isOn ? accent : '#6B7280',
                    fontSize: '0.82rem', fontWeight: 700,
                    background: isOn ? `${accent}12` : '#F3F4F6',
                    padding: '2px 10px', borderRadius: 20,
                    border: `1px solid ${isOn ? `${accent}30` : '#E5E7EB'}`,
                }}>
                    {isOn ? '✓ Enabled' : 'Disabled'}
                </span>
                {saving[settingKey] && (
                    <span style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>saving…</span>
                )}
            </div>
        );
    };

    const TextSetting = ({ settingKey }) => {
        const [editing, setEditing] = useState(false);
        const [val, setVal] = useState(get(settingKey));
        useEffect(() => { setVal(get(settingKey)); }, [localVals[settingKey]]);

        return editing ? (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                    value={val}
                    onChange={e => setVal(e.target.value)}
                    autoFocus
                    style={{
                        flex: 1, minWidth: 160,
                        padding: '0.45rem 0.75rem',
                        border: '1.5px solid #6C3CE1',
                        borderRadius: 8, color: '#111827',
                        fontSize: '0.88rem', outline: 'none',
                        background: '#fff',
                        boxShadow: '0 0 0 3px rgba(108,60,225,0.1)',
                    }}
                    onKeyDown={e => {
                        if (e.key === 'Enter') { setLocalVals(v => ({ ...v, [settingKey]: val })); save(settingKey, val); setEditing(false); }
                        if (e.key === 'Escape') setEditing(false);
                    }}
                />
                <button
                    onClick={() => { setLocalVals(v => ({ ...v, [settingKey]: val })); save(settingKey, val); setEditing(false); }}
                    style={{
                        padding: '0.45rem 1rem', background: '#6C3CE1',
                        border: 'none', borderRadius: 8, color: '#fff',
                        fontWeight: 700, cursor: 'pointer', fontSize: '0.82rem',
                    }}
                >
                    Save
                </button>
                <button
                    onClick={() => setEditing(false)}
                    style={{
                        padding: '0.45rem 0.75rem', background: '#F3F4F6',
                        border: '1px solid #E5E7EB', borderRadius: 8,
                        color: '#6B7280', cursor: 'pointer', fontSize: '0.82rem',
                    }}
                >
                    Cancel
                </button>
            </div>
        ) : (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{
                    color: '#111827', fontSize: '0.9rem', fontWeight: 600,
                    background: '#F9FAFB', border: '1px solid #E5E7EB',
                    padding: '4px 12px', borderRadius: 8,
                    minWidth: 80, display: 'inline-block',
                }}>
                    {get(settingKey) || <span style={{ color: '#9CA3AF', fontStyle: 'italic' }}>Not set</span>}
                </span>
                <button
                    onClick={() => setEditing(true)}
                    style={{
                        padding: '4px 12px', background: '#EDE9FE',
                        border: '1px solid #C4B5FD', borderRadius: 6,
                        color: '#6C3CE1', cursor: 'pointer',
                        fontWeight: 700, fontSize: '0.75rem',
                    }}
                >
                    Edit
                </button>
                {saving[settingKey] && (
                    <span style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>saving…</span>
                )}
            </div>
        );
    };

    // ─── Render ────────────────────────────────────────────────────────────────

    return (
        <Layout pageTitle="Platform Settings" pageSubtitle="Configure platform behaviour, membership workflow, and security">

            <div style={{ maxWidth: 900, margin: '0 auto' }}>

                {/* ── Feedback Banner ──────────────────────────────────────── */}
                {feedback.msg && (
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '0.85rem 1.25rem', borderRadius: 12, marginBottom: '1.5rem',
                        background: feedback.type === 'success' ? '#ECFDF5' : '#FEF2F2',
                        border: `1px solid ${feedback.type === 'success' ? '#A7F3D0' : '#FECACA'}`,
                        color: feedback.type === 'success' ? '#065F46' : '#991B1B',
                        fontSize: '0.875rem', fontWeight: 600,
                    }}>
                        <span>{feedback.type === 'success' ? '✅' : '❌'} {feedback.msg}</span>
                        <button
                            onClick={() => setFeedback({ type: '', msg: '' })}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', lineHeight: 1, color: 'inherit', opacity: 0.6 }}
                        >✕</button>
                    </div>
                )}

                {loading ? (
                    <div style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        justifyContent: 'center', padding: '4rem',
                        background: '#fff', borderRadius: 16,
                        border: '1px solid #F3F4F6',
                    }}>
                        <div style={{
                            width: 48, height: 48, border: '3px solid #E5E7EB',
                            borderTopColor: '#6C3CE1', borderRadius: '50%',
                            animation: 'spin 0.8s linear infinite', marginBottom: '1rem',
                        }} />
                        <p style={{ color: '#9CA3AF', fontSize: '0.9rem', margin: 0 }}>Loading settings…</p>
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                        {/* ── Setting Groups ─────────────────────────────────── */}
                        {groups.map(group => (
                            <div key={group.title} style={{
                                background: '#fff',
                                border: '1px solid #F3F4F6',
                                borderRadius: 16,
                                overflow: 'hidden',
                                boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                            }}>
                                {/* Group Header */}
                                <div style={{
                                    padding: '1rem 1.5rem',
                                    borderBottom: '1px solid #F3F4F6',
                                    background: group.bg,
                                    display: 'flex', alignItems: 'center', gap: 12,
                                }}>
                                    <div style={{
                                        width: 40, height: 40, borderRadius: 10,
                                        background: '#fff', border: `1.5px solid ${group.border}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '1.2rem', flexShrink: 0,
                                    }}>
                                        {group.title.split(' ')[0]}
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, color: '#111827', fontSize: '0.95rem', fontWeight: 700 }}>
                                            {group.title.split(' ').slice(1).join(' ')}
                                        </h3>
                                        <p style={{ margin: '2px 0 0', color: '#6B7280', fontSize: '0.78rem' }}>
                                            {group.desc}
                                        </p>
                                    </div>
                                </div>

                                {/* Setting Rows */}
                                {group.keys.map((key, i) => {
                                    const meta = SETTING_META[key] || { label: key, type: 'text', desc: '', icon: '⚙️' };
                                    const isLast = i === group.keys.length - 1;
                                    return (
                                        <div key={key} style={{
                                            padding: '1.1rem 1.5rem',
                                            borderBottom: isLast ? 'none' : '1px solid #F9FAFB',
                                            display: 'flex', alignItems: 'center',
                                            justifyContent: 'space-between',
                                            gap: '1.5rem', flexWrap: 'wrap',
                                            transition: 'background 0.15s',
                                        }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            {/* Label + Description */}
                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1, minWidth: 200 }}>
                                                <span style={{
                                                    width: 34, height: 34, borderRadius: 8,
                                                    background: group.bg, border: `1px solid ${group.border}`,
                                                    display: 'flex', alignItems: 'center',
                                                    justifyContent: 'center', fontSize: '1rem',
                                                    flexShrink: 0, marginTop: 2,
                                                }}>
                                                    {meta.icon}
                                                </span>
                                                <div>
                                                    <p style={{ margin: 0, color: '#111827', fontWeight: 600, fontSize: '0.875rem' }}>
                                                        {meta.label}
                                                    </p>
                                                    <p style={{ margin: '3px 0 0', color: '#9CA3AF', fontSize: '0.75rem', lineHeight: 1.5 }}>
                                                        {meta.desc}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Control */}
                                            <div style={{ flexShrink: 0 }}>
                                                {meta.type === 'bool'
                                                    ? <BoolToggle settingKey={key} accent={group.accent} />
                                                    : <TextSetting settingKey={key} />
                                                }
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}

                        {/* ── Read-only Info Cards ────────────────────────────── */}
                        <div>
                            <h4 style={{ margin: '0 0 1rem', color: '#374151', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                System Information
                            </h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
                                {[
                                    {
                                        title: 'Authentication', icon: '🔐',
                                        items: [['Method', 'OTP-only (no passwords)'], ['JWT Expiry', '30 minutes'], ['Refresh Token', '7 days']],
                                        accent: '#6C3CE1', bg: '#F5F3FF', border: '#DDD6FE',
                                    },
                                    {
                                        title: 'Email Service', icon: '📧',
                                        items: [['Provider', 'SMTP (configured)'], ['OTP Template', 'Active'], ['Welcome Email', 'Active']],
                                        accent: '#0284C7', bg: '#F0F9FF', border: '#BAE6FD',
                                    },
                                    {
                                        title: 'API / CORS', icon: '🌐',
                                        items: [['Status', 'Enabled'], ['Origins', 'All (*)'], ['Methods', 'All']],
                                        accent: '#059669', bg: '#ECFDF5', border: '#A7F3D0',
                                    },
                                ].map(card => (
                                    <div key={card.title} style={{
                                        background: '#fff',
                                        border: '1px solid #F3F4F6',
                                        borderRadius: 14, overflow: 'hidden',
                                        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                                    }}>
                                        {/* Card header */}
                                        <div style={{
                                            padding: '0.75rem 1rem',
                                            background: card.bg,
                                            borderBottom: `1px solid ${card.border}`,
                                            display: 'flex', alignItems: 'center', gap: 8,
                                        }}>
                                            <span style={{ fontSize: '1rem' }}>{card.icon}</span>
                                            <p style={{ margin: 0, color: '#111827', fontWeight: 700, fontSize: '0.85rem' }}>
                                                {card.title}
                                            </p>
                                            <span style={{
                                                marginLeft: 'auto', fontSize: '0.68rem', fontWeight: 700,
                                                color: card.accent, background: `${card.accent}15`,
                                                padding: '2px 8px', borderRadius: 20,
                                                border: `1px solid ${card.accent}25`,
                                            }}>
                                                READ-ONLY
                                            </span>
                                        </div>
                                        {/* Card rows */}
                                        <div style={{ padding: '0.75rem 1rem' }}>
                                            {card.items.map(([k, v]) => (
                                                <div key={k} style={{
                                                    display: 'flex', justifyContent: 'space-between',
                                                    alignItems: 'center', marginBottom: 8,
                                                    paddingBottom: 8,
                                                    borderBottom: '1px solid #F9FAFB',
                                                }}>
                                                    <span style={{ color: '#6B7280', fontSize: '0.78rem' }}>{k}</span>
                                                    <span style={{
                                                        color: '#111827', fontSize: '0.78rem', fontWeight: 600,
                                                        background: '#F3F4F6', padding: '1px 8px', borderRadius: 6,
                                                    }}>{v}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </Layout>
    );
};

export default SettingsPage;
