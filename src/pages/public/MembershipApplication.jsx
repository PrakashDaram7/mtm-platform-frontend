import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import LandingPage from './LandingPage';
import api from '../../services/api';
import { storage } from '../../utils/storage';

// ─── Wizard steps ──────────────────────────────────────────────────────────
const STEPS = [
    { id: 1, label: 'Personal Info', icon: '👤' },
    { id: 2, label: 'Choose Plan', icon: '🎫' },
    { id: 3, label: 'Verify Email', icon: '📧' },
    { id: 4, label: 'Confirmation', icon: '✅' },
];

const LANG_OPTIONS = ['English', 'Telugu'];
const MEMBER_TYPES = [
    { value: 'individual', label: '👤 Individual' },
    { value: 'family', label: '👨‍👩‍👧 Family' },
];

// ─── Step Bar ─────────────────────────────────────────────────────────────
const StepBar = ({ current }) => (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.75rem', padding: '0 0.25rem' }}>
        {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                    <div style={{
                        width: 38, height: 38, borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: current >= s.id ? 'linear-gradient(135deg,#6C3CE1,#8B5CF6)' : '#F3F4F6',
                        border: `2px solid ${current >= s.id ? '#6C3CE1' : '#E5E7EB'}`,
                        fontSize: '1rem', fontWeight: 700,
                        color: current >= s.id ? '#fff' : '#9CA3AF',
                        boxShadow: current === s.id ? '0 0 0 4px rgba(108,60,225,0.15)' : 'none',
                        transition: 'all 0.3s',
                    }}>
                        {current > s.id ? '✓' : s.icon}
                    </div>
                    <span style={{
                        fontSize: '0.65rem', marginTop: 5, whiteSpace: 'nowrap',
                        color: current >= s.id ? '#6C3CE1' : '#9CA3AF',
                        fontWeight: current === s.id ? 700 : 400,
                    }}>{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                    <div style={{
                        flex: 2, height: 2, marginBottom: 18,
                        background: current > s.id ? 'linear-gradient(90deg,#6C3CE1,#8B5CF6)' : '#E5E7EB',
                        transition: 'all 0.3s',
                    }} />
                )}
            </React.Fragment>
        ))}
    </div>
);

// ─── Shared field wrapper ──────────────────────────────────────────────────
const Field = ({ label, error, required, children }) => (
    <div style={{ marginBottom: '0.9rem' }}>
        <label style={{ display: 'block', marginBottom: 4, color: '#374151', fontSize: '0.8rem', fontWeight: 600 }}>
            {label}{required && <span style={{ color: '#EF4444', marginLeft: 3 }}>*</span>}
        </label>
        {children}
        {error && <p style={{ color: '#EF4444', fontSize: '0.73rem', marginTop: 3 }}>{error}</p>}
    </div>
);

const iS = (err) => ({
    width: '100%', padding: '0.6rem 0.85rem',
    border: `1.5px solid ${err ? '#EF4444' : '#E5E7EB'}`,
    borderRadius: 8, color: '#111827', fontSize: '0.85rem',
    outline: 'none', background: '#FAFAFA',
    boxSizing: 'border-box', fontFamily: 'Inter,sans-serif',
    transition: 'border-color 0.2s',
});

// ─── OTP digit inputs ──────────────────────────────────────────────────────
const OtpRow = ({ otp, setOtp }) => {
    const refs = Array.from({ length: 6 }, () => useRef(null));
    const onChange = (e, i) => {
        const val = e.target.value.replace(/\D/g, '');
        const arr = otp.split(''); arr[i] = val.slice(-1); setOtp(arr.join(''));
        if (val && i < 5) refs[i + 1].current?.focus();
    };
    const onKey = (e, i) => { if (e.key === 'Backspace' && !otp[i] && i > 0) refs[i - 1].current?.focus(); };
    return (
        <div style={{ display: 'flex', gap: 7, justifyContent: 'center', margin: '1.25rem 0' }}>
            {Array.from({ length: 6 }).map((_, i) => (
                <input key={i} ref={refs[i]} maxLength={1}
                    value={otp[i] || ''}
                    onChange={(e) => onChange(e, i)}
                    onKeyDown={(e) => onKey(e, i)}
                    style={{
                        width: 42, height: 50, textAlign: 'center', fontSize: '1.3rem', fontWeight: 700,
                        background: '#F9FAFB', border: `2px solid ${otp[i] ? '#6C3CE1' : '#E5E7EB'}`,
                        borderRadius: 9, color: '#111827', outline: 'none',
                        boxShadow: otp[i] ? '0 0 0 3px rgba(108,60,225,0.12)' : 'none',
                        transition: 'all 0.15s',
                    }}
                />
            ))}
        </div>
    );
};

const PBtn = ({ children, onClick, disabled, style: s = {} }) => (
    <button onClick={onClick} disabled={disabled} style={{
        padding: '0.7rem 1.8rem', borderRadius: 9, fontWeight: 700, fontSize: '0.875rem',
        cursor: disabled ? 'not-allowed' : 'pointer', border: 'none',
        background: 'linear-gradient(135deg,#6C3CE1,#8B5CF6)',
        color: '#fff', opacity: disabled ? 0.6 : 1, fontFamily: 'Inter,sans-serif',
        boxShadow: '0 4px 12px rgba(108,60,225,0.3)', ...s,
    }}>{children}</button>
);

const GBtn = ({ children, onClick }) => (
    <button onClick={onClick} style={{
        padding: '0.7rem 1.4rem', borderRadius: 9, fontWeight: 600, fontSize: '0.85rem',
        cursor: 'pointer', border: '1.5px solid #E5E7EB', background: '#F9FAFB',
        color: '#6B7280', fontFamily: 'Inter,sans-serif',
    }}>{children}</button>
);

// ═══════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════
const MembershipApplication = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [otp, setOtp] = useState('');
    const [otpTimer, setOtpTimer] = useState(0);
    const [errors, setErrors] = useState({});
    const [submittedMembership, setSubmittedMembership] = useState(null);
    const [form, setForm] = useState({
        full_name: '', email: '', phone: '', address: '',
        date_of_birth: '', occupation: '', preferred_language: 'English',
        consent_whatsapp: false, consent_email: true, consent_emergency: false,
    });
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [memberType, setMemberType] = useState('individual');

    useEffect(() => {
        api.get('/members/plans?active_only=true').then(r => setPlans(r.data.plans || [])).catch(() => { });
        // Prevent background scroll while modal is open
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    useEffect(() => {
        if (otpTimer <= 0) return;
        const t = setTimeout(() => setOtpTimer(v => v - 1), 1000);
        return () => clearTimeout(t);
    }, [otpTimer]);

    const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

    const validateStep1 = () => {
        const e = {};
        if (!form.full_name.trim()) e.full_name = 'Full name is required';
        if (!form.email.trim()) e.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email address';
        if (form.phone && !/^\+?[\d\s\-]{7,15}$/.test(form.phone)) e.phone = 'Invalid phone number';
        setErrors(e); return Object.keys(e).length === 0;
    };

    const goToStep2 = () => { if (validateStep1()) setStep(2); };

    const sendOtp = async () => {
        if (!selectedPlan) { setErrors({ plan: 'Please select a plan' }); return; }
        setLoading(true);
        try {
            const r = await api.post('/auth/signup-send-otp', { email: form.email, otp_type: 'email' });
            if (r.data.success) { setOtpTimer(300); setOtp(''); setStep(3); }
            else if (r.data.account_exists) { setErrors({ email: 'Email already registered. Please sign in.' }); setStep(1); }
            else setErrors({ otp: r.data.message || 'Failed to send OTP' });
        } catch (e) { setErrors({ otp: e.response?.data?.detail || 'Failed to send OTP.' }); }
        setLoading(false);
    };

    const verifyAndApply = async () => {
        if (otp.length !== 6) { setErrors({ otp: 'Enter the complete 6-digit code' }); return; }
        setLoading(true);
        try {
            const vr = await api.post('/auth/verify-otp', { email: form.email, otp, full_name: form.full_name, phone: form.phone || null });
            if (!vr.data.success) { setErrors({ otp: vr.data.detail || 'Invalid OTP' }); setLoading(false); return; }
            const { access_token, refresh_token, role } = vr.data;
            storage.setAccessToken(access_token); storage.setRefreshToken(refresh_token); storage.setUserRole(role || 'member');
            storage.setUserData(vr.data.user || { id: vr.data.user_id, full_name: form.full_name, email: form.email, role });
            await api.put('/members/profile', { address: form.address, date_of_birth: form.date_of_birth || null, occupation: form.occupation, preferred_language: form.preferred_language, consent_whatsapp: form.consent_whatsapp, consent_email: form.consent_email, consent_emergency: form.consent_emergency });
            const mr = await api.post('/members/apply', { plan_id: selectedPlan.id, membership_type: memberType });
            setSubmittedMembership(mr.data.membership); setStep(4);
        } catch (e) { setErrors({ otp: e.response?.data?.detail || 'Verification failed.' }); }
        setLoading(false);
    };

    const resendOtp = async () => {
        setLoading(true);
        try { const r = await api.post('/auth/resend-otp', { email: form.email }); if (r.data.success) { setOtpTimer(300); setOtp(''); } } catch (_) { }
        setLoading(false);
    };

    const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

    const filteredPlans = plans.filter(p => memberType === 'family' ? p.membership_type === 'family' : p.membership_type !== 'family');

    return (
        <>
            {/* ── Background: LandingPage rendered underneath ────────────── */}
            <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                <LandingPage />
            </div>

            {/* ── Overlay: blurred backdrop ─────────────────────────────── */}
            <div style={{
                position: 'fixed', inset: 0, zIndex: 1000,
                background: 'rgba(15, 12, 41, 0.55)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
                padding: '5rem 1rem 2rem',
                overflowY: 'auto',
            }}
                onClick={() => navigate('/')}  /* close on backdrop click */
            >

                {/* ── Dialog card ─────────────────────────────────────────── */}
                <div style={{
                    background: '#fff', borderRadius: 20,
                    boxShadow: '0 40px 100px rgba(0,0,0,0.45)',
                    width: '100%', maxWidth: 620,
                    overflow: 'hidden',
                    animation: 'slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                    position: 'relative',
                }}
                    onClick={e => e.stopPropagation()}  /* prevent close on card click */
                >
                    {/* Purple header strip */}
                    <div style={{
                        background: 'linear-gradient(135deg,#6C3CE1 0%,#8B5CF6 100%)',
                        padding: '1.25rem 1.5rem',
                        display: 'flex', alignItems: 'center', gap: 12,
                    }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: 10,
                            background: 'rgba(255,255,255,0.18)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.3rem', flexShrink: 0,
                        }}>🕉️</div>
                        <div style={{ flex: 1 }}>
                            <h2 style={{ margin: 0, color: '#fff', fontSize: '1rem', fontWeight: 800, letterSpacing: '-0.2px' }}>
                                Membership Application
                            </h2>
                            <p style={{ margin: 0, color: 'rgba(255,255,255,0.65)', fontSize: '0.75rem' }}>
                                Mauritius Telugu Mahasabha
                            </p>
                        </div>
                        <button onClick={() => navigate('/')} style={{
                            width: 30, height: 30, borderRadius: 8, border: 'none',
                            background: 'rgba(255,255,255,0.18)', color: '#fff',
                            cursor: 'pointer', fontSize: '1rem', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            transition: 'background 0.15s',
                        }}>✕</button>
                    </div>

                    {/* Progress bar */}
                    <div style={{ height: 3, background: '#F3F4F6' }}>
                        <div style={{
                            height: '100%', transition: 'width 0.4s ease',
                            background: 'linear-gradient(90deg,#6C3CE1,#8B5CF6)',
                            width: `${((step - 1) / (STEPS.length - 1)) * 100}%`,
                        }} />
                    </div>

                    {/* Form body */}
                    <div style={{ padding: '1.75rem 1.75rem 1.5rem' }}>
                        <StepBar current={step} />

                        {/* ── STEP 1 ─────────────────────────────────────────── */}
                        {step === 1 && (
                            <div>
                                <h3 style={{ color: '#111827', fontSize: '1rem', fontWeight: 700, marginBottom: '1.1rem' }}>
                                    Personal Information
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
                                    <Field label="Full Name" required error={errors.full_name}>
                                        <input style={iS(errors.full_name)} placeholder="Your full name"
                                            value={form.full_name} onChange={e => set('full_name', e.target.value)} />
                                    </Field>
                                    <Field label="Email Address" required error={errors.email}>
                                        <input style={iS(errors.email)} type="email" placeholder="your@email.com"
                                            value={form.email} onChange={e => set('email', e.target.value)} />
                                    </Field>
                                    <Field label="Phone Number" error={errors.phone}>
                                        <input style={iS(errors.phone)} placeholder="+230 1234 5678"
                                            value={form.phone} onChange={e => set('phone', e.target.value)} />
                                    </Field>
                                    <Field label="Date of Birth">
                                        <input style={iS(false)} type="date"
                                            value={form.date_of_birth} onChange={e => set('date_of_birth', e.target.value)} />
                                    </Field>
                                </div>
                                <Field label="Address">
                                    <input style={iS(false)} placeholder="Residential address"
                                        value={form.address} onChange={e => set('address', e.target.value)} />
                                </Field>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
                                    <Field label="Occupation">
                                        <input style={iS(false)} placeholder="e.g. Engineer"
                                            value={form.occupation} onChange={e => set('occupation', e.target.value)} />
                                    </Field>
                                    <Field label="Preferred Language">
                                        <select style={iS(false)} value={form.preferred_language}
                                            onChange={e => set('preferred_language', e.target.value)}>
                                            {LANG_OPTIONS.map(l => <option key={l}>{l}</option>)}
                                        </select>
                                    </Field>
                                </div>

                                {/* Consent */}
                                <div style={{ background: '#F5F3FF', borderRadius: 10, padding: '0.8rem 1rem', marginBottom: '1.1rem' }}>
                                    <p style={{ color: '#6C3CE1', fontSize: '0.72rem', fontWeight: 700, marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        Communication Preferences
                                    </p>
                                    {[
                                        { k: 'consent_email', label: '📧 Email notifications (recommended)' },
                                        { k: 'consent_whatsapp', label: '💬 WhatsApp messages' },
                                        { k: 'consent_emergency', label: '🚨 Emergency broadcasts' },
                                    ].map(({ k, label }) => (
                                        <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 5, color: '#374151', fontSize: '0.82rem' }}>
                                            <input type="checkbox" checked={form[k]} onChange={e => set(k, e.target.checked)} style={{ accentColor: '#6C3CE1', width: 14, height: 14 }} />
                                            {label}
                                        </label>
                                    ))}
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <p style={{ margin: 0, fontSize: '0.82rem', color: '#9CA3AF' }}>
                                        Already a member?{' '}
                                        <button onClick={() => navigate('/auth/signin')} style={{ background: 'none', border: 'none', color: '#6C3CE1', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem', padding: 0 }}>
                                            Sign In
                                        </button>
                                    </p>
                                    <PBtn onClick={goToStep2}>Next: Choose Plan →</PBtn>
                                </div>
                            </div>
                        )}

                        {/* ── STEP 2 ─────────────────────────────────────────── */}
                        {step === 2 && (
                            <div>
                                <h3 style={{ color: '#111827', fontSize: '1rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                                    Choose Membership Plan
                                </h3>
                                <p style={{ color: '#6B7280', fontSize: '0.8rem', marginBottom: '0.9rem' }}>
                                    All plans include access to MTM events and community features.
                                </p>

                                <div style={{ display: 'flex', gap: 6, marginBottom: '0.9rem', background: '#F3F4F6', padding: 3, borderRadius: 9 }}>
                                    {MEMBER_TYPES.map(t => (
                                        <button key={t.value} onClick={() => setMemberType(t.value)} style={{
                                            flex: 1, padding: '0.5rem', border: 'none', borderRadius: 7, cursor: 'pointer',
                                            fontWeight: 600, fontSize: '0.82rem',
                                            background: memberType === t.value ? '#fff' : 'transparent',
                                            color: memberType === t.value ? '#6C3CE1' : '#9CA3AF',
                                            boxShadow: memberType === t.value ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                                            transition: 'all 0.18s',
                                        }}>{t.label}</button>
                                    ))}
                                </div>

                                {errors.plan && <p style={{ color: '#EF4444', fontSize: '0.8rem', marginBottom: 8 }}>{errors.plan}</p>}

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: '1.1rem', maxHeight: 280, overflowY: 'auto', paddingRight: 2 }}>
                                    {filteredPlans.length === 0 ? (
                                        <div style={{ textAlign: 'center', color: '#9CA3AF', padding: '1.5rem', background: '#F9FAFB', borderRadius: 10, fontSize: '0.875rem' }}>
                                            No {memberType} plans available yet.
                                        </div>
                                    ) : filteredPlans.map(plan => (
                                        <div key={plan.id}
                                            onClick={() => { setSelectedPlan(plan); setErrors(e => ({ ...e, plan: '' })); }}
                                            style={{
                                                padding: '0.9rem 1.1rem', borderRadius: 10, cursor: 'pointer',
                                                border: `2px solid ${selectedPlan?.id === plan.id ? '#6C3CE1' : '#E5E7EB'}`,
                                                background: selectedPlan?.id === plan.id ? '#F5F3FF' : '#fff',
                                                transition: 'all 0.18s',
                                                boxShadow: selectedPlan?.id === plan.id ? '0 0 0 3px rgba(108,60,225,0.1)' : 'none',
                                            }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 2 }}>
                                                        <p style={{ margin: 0, color: '#111827', fontWeight: 700, fontSize: '0.9rem' }}>{plan.name}</p>
                                                        {selectedPlan?.id === plan.id && <span style={{ color: '#6C3CE1', fontSize: '0.72rem', fontWeight: 700, background: 'rgba(108,60,225,0.1)', padding: '1px 6px', borderRadius: 20 }}>✓ Selected</span>}
                                                    </div>
                                                    <p style={{ margin: '0 0 6px', color: '#9CA3AF', fontSize: '0.75rem' }}>{plan.description}</p>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                                        {(plan.features || []).map((f, i) => (
                                                            <span key={i} style={{ fontSize: '0.68rem', background: 'rgba(108,60,225,0.08)', color: '#6C3CE1', padding: '1px 6px', borderRadius: 20 }}>✓ {f}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 10 }}>
                                                    <p style={{ margin: 0, color: '#6C3CE1', fontWeight: 800, fontSize: '1.1rem' }}>
                                                        {plan.currency || 'MUR'} {Number(plan.price).toLocaleString()}
                                                    </p>
                                                    <p style={{ margin: '2px 0 0', color: '#9CA3AF', fontSize: '0.7rem' }}>
                                                        {plan.is_lifetime ? 'One-time' : `per ${plan.duration_months} months`}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <GBtn onClick={() => setStep(1)}>← Back</GBtn>
                                    <PBtn onClick={sendOtp} disabled={loading}>
                                        {loading ? 'Sending OTP…' : 'Next: Verify Email →'}
                                    </PBtn>
                                </div>
                            </div>
                        )}

                        {/* ── STEP 3 ─────────────────────────────────────────── */}
                        {step === 3 && (
                            <div style={{ textAlign: 'center' }}>
                                <div style={{
                                    width: 68, height: 68, borderRadius: '50%', margin: '0 auto 1rem',
                                    background: 'linear-gradient(135deg,#6C3CE1,#8B5CF6)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.8rem', boxShadow: '0 8px 24px rgba(108,60,225,0.3)',
                                }}>📧</div>
                                <h3 style={{ color: '#111827', fontSize: '1rem', fontWeight: 700, marginBottom: 6 }}>Verify Your Email</h3>
                                <p style={{ color: '#6B7280', fontSize: '0.84rem', lineHeight: 1.5, marginBottom: 2 }}>We sent a 6-digit code to</p>
                                <p style={{ color: '#6C3CE1', fontWeight: 700, fontSize: '0.9rem', marginBottom: 0 }}>{form.email}</p>

                                <OtpRow otp={otp} setOtp={(v) => { setOtp(v); setErrors(e => ({ ...e, otp: '' })); }} />

                                {errors.otp && (
                                    <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '0.55rem 0.9rem', marginBottom: '0.9rem', color: '#991B1B', fontSize: '0.8rem' }}>
                                        {errors.otp}
                                    </div>
                                )}

                                <PBtn onClick={verifyAndApply} disabled={loading || otp.length !== 6} style={{ width: '100%', marginBottom: '0.75rem' }}>
                                    {loading ? 'Verifying…' : 'Verify & Submit Application ✓'}
                                </PBtn>

                                <p style={{ fontSize: '0.8rem', color: '#9CA3AF', margin: '0 0 0.9rem' }}>
                                    {otpTimer > 0
                                        ? `Resend in ${Math.floor(otpTimer / 60)}:${String(otpTimer % 60).padStart(2, '0')}`
                                        : <button onClick={resendOtp} disabled={loading} style={{ background: 'none', border: 'none', color: '#6C3CE1', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>Resend OTP</button>
                                    }
                                </p>
                                <GBtn onClick={() => setStep(2)}>← Back to Plans</GBtn>
                            </div>
                        )}

                        {/* ── STEP 4 ─────────────────────────────────────────── */}
                        {step === 4 && (
                            <div style={{ textAlign: 'center' }}>
                                <div style={{
                                    width: 76, height: 76, borderRadius: '50%', margin: '0 auto 1.25rem',
                                    background: 'linear-gradient(135deg,#10B981,#059669)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '2.2rem', boxShadow: '0 12px 32px rgba(16,185,129,0.35)',
                                }}>🎉</div>
                                <h3 style={{ color: '#111827', fontSize: '1.15rem', fontWeight: 800, marginBottom: 8 }}>Application Submitted!</h3>

                                {submittedMembership?.status === 'active' ? (
                                    <>
                                        <p style={{ color: '#6B7280', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1rem' }}>
                                            Your membership has been <strong style={{ color: '#059669' }}>auto-approved</strong>!
                                        </p>
                                        <div style={{ background: '#ECFDF5', border: '1.5px solid #A7F3D0', borderRadius: 12, padding: '0.9rem 1.1rem', margin: '0 0 1.25rem', textAlign: 'left' }}>
                                            <p style={{ color: '#065F46', fontWeight: 700, marginBottom: 6, fontSize: '0.875rem' }}>Membership Details</p>
                                            <p style={{ margin: '3px 0', color: '#374151', fontSize: '0.83rem' }}><strong>Member #:</strong> {submittedMembership.membership_number}</p>
                                            <p style={{ margin: '3px 0', color: '#374151', fontSize: '0.83rem' }}><strong>Plan:</strong> {submittedMembership.plan_name}</p>
                                        </div>
                                    </>
                                ) : (
                                    <p style={{ color: '#6B7280', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                                        Your application is <strong style={{ color: '#D97706' }}>under review</strong>.<br />
                                        You'll be notified by email once approved.
                                    </p>
                                )}

                                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                                    <PBtn onClick={() => navigate('/member/dashboard')}>Go to Member Portal →</PBtn>
                                    <GBtn onClick={() => navigate('/')}>Back to Home</GBtn>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Animation keyframes */}
            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(30px) scale(0.97); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </>
    );
};

export default MembershipApplication;
