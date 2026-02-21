import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../services/api';

const SettingsPage = () => {
    const [settings, setSettings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState({});
    const [feedback, setFeedback] = useState('');
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
            setFeedback(`Setting "${key}" updated successfully!`);
            load();
        } catch (e) {
            setFeedback(e.response?.data?.detail || `Error updating ${key}`);
        }
        setSaving(s => ({ ...s, [key]: false }));
    };

    const toggle = (key, current) => {
        const newVal = current === 'true' ? 'false' : 'true';
        setLocalVals(v => ({ ...v, [key]: newVal }));
        save(key, newVal);
    };

    // ─── Group settings ───────────────────────────────────────────────────
    const MEMBERSHIP_KEYS = ['auto_approve_membership', 'membership_renewal_reminder_days'];
    const PLATFORM_KEYS = ['platform_name', 'contact_email', 'currency'];
    const AUTH_KEYS = ['otp_expiry_minutes', 'max_login_attempts'];

    const get = (key) => localVals[key] ?? '';

    const groups = [
        {
            title: '🎫 Membership Settings',
            desc: 'Control membership workflow and reminder behaviour.',
            keys: MEMBERSHIP_KEYS,
        },
        {
            title: '🌐 Platform Settings',
            desc: 'General platform information shown to members.',
            keys: PLATFORM_KEYS,
        },
        {
            title: '🔒 Security & Auth',
            desc: 'OTP and authentication configuration.',
            keys: AUTH_KEYS,
        },
    ];

    const BoolToggle = ({ settingKey }) => {
        const val = get(settingKey);
        const isOn = val === 'true';
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                    onClick={() => toggle(settingKey, val)}
                    style={{
                        width: 48, height: 26, borderRadius: 13, cursor: 'pointer',
                        background: isOn
                            ? 'linear-gradient(90deg, #667eea, #764ba2)'
                            : 'rgba(255,255,255,0.1)',
                        position: 'relative', transition: 'background 0.3s',
                        border: '1.5px solid rgba(255,255,255,0.12)',
                    }}>
                    <div style={{
                        width: 20, height: 20, borderRadius: '50%',
                        background: '#fff',
                        position: 'absolute', top: 1,
                        left: isOn ? 24 : 2,
                        transition: 'left 0.25s',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                    }} />
                </div>
                <span style={{ color: isOn ? '#a78bfa' : 'rgba(255,255,255,0.35)', fontSize: '0.85rem', fontWeight: 600 }}>
                    {isOn ? 'Enabled' : 'Disabled'}
                </span>
                {saving[settingKey] && (
                    <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.78rem' }}>saving…</span>
                )}
            </div>
        );
    };

    const TextSetting = ({ settingKey, placeholder }) => {
        const [editing, setEditing] = useState(false);
        const [val, setVal] = useState(get(settingKey));
        useEffect(() => { setVal(get(settingKey)); }, [localVals[settingKey]]);

        return editing ? (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input value={val} onChange={e => setVal(e.target.value)}
                    style={{
                        flex: 1, padding: '0.5rem 0.8rem',
                        background: 'rgba(255,255,255,0.08)',
                        border: '1.5px solid rgba(167,139,250,0.4)',
                        borderRadius: 8, color: '#fff', fontSize: '0.88rem', outline: 'none',
                    }} />
                <button onClick={() => { setLocalVals(v => ({ ...v, [settingKey]: val })); save(settingKey, val); setEditing(false); }}
                    style={{ padding: '0.5rem 1rem', background: '#667eea', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.82rem' }}>
                    Save
                </button>
                <button onClick={() => setEditing(false)}
                    style={{ padding: '0.5rem 0.8rem', background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 8, color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '0.82rem' }}>
                    Cancel
                </button>
            </div>
        ) : (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600 }}>{get(settingKey) || placeholder}</span>
                <button onClick={() => setEditing(true)}
                    style={{ padding: '3px 10px', background: 'rgba(102,126,234,0.12)', border: '1px solid rgba(102,126,234,0.25)', borderRadius: 6, color: '#818cf8', cursor: 'pointer', fontWeight: 600, fontSize: '0.75rem' }}>
                    Edit
                </button>
            </div>
        );
    };

    const SETTING_META = {
        auto_approve_membership: { label: 'Auto-Approve Memberships', type: 'bool', desc: 'When ON, new membership applications are automatically approved without admin review and membership number is immediately issued.' },
        membership_renewal_reminder_days: { label: 'Renewal Reminder Days', type: 'text', desc: 'Comma-separated: days before expiry to send reminders. E.g. "60,30,7,0" means 60 days before, 30 days before, 7 days before, and on expiry day.' },
        platform_name: { label: 'Platform Name', type: 'text', desc: 'Display name of the platform shown in emails and the member portal.' },
        contact_email: { label: 'Contact Email', type: 'text', desc: 'Email address displayed to members for support queries.' },
        currency: { label: 'Default Currency', type: 'text', desc: 'Currency code used for membership fees (e.g. MUR, USD, EUR).' },
        otp_expiry_minutes: { label: 'OTP Expiry (minutes)', type: 'text', desc: 'How long a one-time password remains valid before expiring.' },
        max_login_attempts: { label: 'Max Login Attempts', type: 'text', desc: 'Number of failed OTP attempts before account is temporarily locked.' },
    };

    return (
        <Layout pageTitle="Platform Settings" pageSubtitle="Configure platform behaviour, membership workflow, and security">

            {feedback && (
                <div style={{
                    background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.3)',
                    borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1.5rem',
                    color: '#a78bfa', display: 'flex', justifyContent: 'space-between',
                }}>
                    {feedback}
                    <button onClick={() => setFeedback('')} style={{ background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer' }}>✕</button>
                </div>
            )}

            {loading ? (
                <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: '3rem' }}>Loading settings…</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {groups.map(group => (
                        <div key={group.title} style={{
                            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: 18, overflow: 'hidden',
                        }}>
                            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                <h3 style={{ margin: 0, color: '#fff', fontSize: '1rem', fontWeight: 700 }}>{group.title}</h3>
                                <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem' }}>{group.desc}</p>
                            </div>

                            {group.keys.map((key, i) => {
                                const meta = SETTING_META[key] || { label: key, type: 'text', desc: '' };
                                const isLast = i === group.keys.length - 1;
                                return (
                                    <div key={key} style={{
                                        padding: '1.2rem 1.5rem',
                                        borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.05)',
                                        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                                        gap: '1rem', flexWrap: 'wrap',
                                    }}>
                                        <div style={{ flex: 1, minWidth: 200 }}>
                                            <p style={{ margin: 0, color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>{meta.label}</p>
                                            <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem', lineHeight: 1.5 }}>{meta.desc}</p>
                                        </div>
                                        <div style={{ marginTop: 4 }}>
                                            {meta.type === 'bool'
                                                ? <BoolToggle settingKey={key} />
                                                : <TextSetting settingKey={key} placeholder="—" />
                                            }
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}

                    {/* Read-only info cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                        {[
                            { title: 'Authentication', items: [['Method', 'OTP-only (no passwords)'], ['JWT Expiry', '30 minutes'], ['Refresh Token', '7 days']] },
                            { title: 'Email Service', items: [['Provider', 'SMTP (configured)'], ['OTP Template', 'Active'], ['Welcome Email', 'Active']] },
                            { title: 'CORS', items: [['Status', 'Enabled'], ['Origins', 'All (*)'], ['Methods', 'All']] },
                        ].map(card => (
                            <div key={card.title} style={{
                                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                                borderRadius: 14, padding: '1.25rem',
                            }}>
                                <p style={{ margin: '0 0 12px', color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>{card.title}</p>
                                {card.items.map(([k, v]) => (
                                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' }}>
                                        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem' }}>{k}</span>
                                        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.78rem', fontWeight: 600, textAlign: 'right' }}>{v}</span>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default SettingsPage;
