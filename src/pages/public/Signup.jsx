import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendSignupOTP, verifyOTP } from '../../services/authService';
import { storage } from '../../utils/storage';
import { showAlert, showLoader, hideLoader } from '../../utils/alerts';

const OTP_TIMER_SECONDS = 120;
const MAX_OTP_ATTEMPTS = 3;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_REGEX = /^[a-zA-Z\s'-]{2,50}$/;

function validateEmail(email) {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) return { valid: false, error: 'Email is required' };
  if (!EMAIL_REGEX.test(cleanEmail)) return { valid: false, error: 'Invalid email format' };
  if (cleanEmail.length < 3 || cleanEmail.length > 254) return { valid: false, error: 'Email length invalid' };
  if (cleanEmail.includes('..')) return { valid: false, error: 'Email cannot contain consecutive dots' };
  const [localPart, domain] = cleanEmail.split('@');
  if (localPart.length < 1 || domain.length < 3) return { valid: false, error: 'Invalid email format' };
  return { valid: true, value: cleanEmail };
}

function validateFullName(name) {
  if (!name) return { valid: false, error: 'Full name is required' };
  const trimmedName = name.trim();
  if (!NAME_REGEX.test(trimmedName)) {
    return { valid: false, error: 'Name must contain only letters, spaces, hyphens, or apostrophes (no digits or special characters)' };
  }
  if (trimmedName.length < 2) return { valid: false, error: 'Name must be at least 2 characters' };
  if (trimmedName.length > 50) return { valid: false, error: 'Name must be less than 50 characters' };
  return { valid: true, value: trimmedName };
}

export default function SignUp() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [otpSent, setOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(OTP_TIMER_SECONDS);
  const [isTimerExpired, setIsTimerExpired] = useState(false);
  const [verificationInProgress, setVerificationInProgress] = useState(false);
  const [otpAttempts, setOtpAttempts] = useState(0);
  const otpInputRefs = useRef([]);

  // Timer effect
  useEffect(() => {
    if (!otpSent) return;
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setIsTimerExpired(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [otpSent]);

  // Auto-verify when all 6 digits are entered
  useEffect(() => {
    if (!otpSent || verificationInProgress) return;
    const fullOtp = otpDigits.join('');
    if (fullOtp.length === 6 && fullOtp !== '') {
      verifyOtpHandler(fullOtp);
    }
  }, [otpDigits, otpSent, verificationInProgress]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');

    // Validate inputs — only name and email required (no password!)
    const nameVal = validateFullName(fullName);
    const emailVal = validateEmail(email);

    if (!nameVal.valid) {
      setError(nameVal.error);
      return;
    }
    if (!emailVal.valid) {
      setError(emailVal.error);
      return;
    }

    // Check OTP attempt limit
    if (otpAttempts >= MAX_OTP_ATTEMPTS) {
      setError(`Maximum ${MAX_OTP_ATTEMPTS} OTP request attempts reached. Please try again later.`);
      return;
    }

    showLoader('Sending OTP', 'Please wait...');
    setLoading(true);

    try {
      const payload = { email: emailVal.value, otp_type: 'email' };
      const response = await sendSignupOTP(payload);
      hideLoader();

      if (!response.success) {
        if (response.account_exists) {
          showAlert('error', 'Account Exists', 'This email is already registered. Please sign in instead.');
          setTimeout(() => navigate('/auth/signin'), 2000);
        } else {
          setError(response.message || 'Failed to send OTP');
        }
      } else {
        setOtpSent(true);
        setTimer(OTP_TIMER_SECONDS);
        setIsTimerExpired(false);
        setOtpDigits(['', '', '', '', '', '']);
        setOtpAttempts(otpAttempts + 1);
        if (otpInputRefs.current[0]) otpInputRefs.current[0].focus();
        showAlert('success', 'OTP Sent!', `OTP sent to ${emailVal.value}`);
      }
    } catch (err) {
      hideLoader();
      const errorMsg = err.response?.data?.message || 'Failed to send OTP';
      setError(errorMsg);
      showAlert('error', 'Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpInputChange = (index, value) => {
    if (isTimerExpired) return;
    if (!/^\d*$/.test(value)) return;
    if (value.length > 1) return;
    const newOtpDigits = [...otpDigits];
    newOtpDigits[index] = value;
    setOtpDigits(newOtpDigits);
    setError('');
    if (value && index < 5) otpInputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) otpInputRefs.current[index - 1]?.focus();
    if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      otpInputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      e.preventDefault();
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const verifyOtpHandler = async (otp) => {
    if (isTimerExpired) {
      setError('OTP has expired. Please request a new one.');
      return;
    }

    showLoader('Creating Account', 'Please wait...');
    setVerificationInProgress(true);
    setError('');

    try {
      // No password in payload — OTP-only authentication
      const payload = {
        email: email.trim(),
        otp: otp,
        full_name: fullName.trim(),
        phone: phone.trim() || null,
      };

      console.log('📤 Sending verification payload:', {
        email: payload.email,
        otp: payload.otp,
        full_name: payload.full_name,
        phone: payload.phone,
      });

      const response = await verifyOTP(payload);
      hideLoader();

      console.log('📥 Verify OTP Response:', response);

      if (response && response.success) {
        // Clear OTP digits immediately to prevent useEffect from re-triggering
        setOtpDigits(['', '', '', '', '', '']);
        setOtpSent(false);

        if (!response.access_token || !response.refresh_token) {
          console.error('❌ Tokens missing from response:', response);
          setError('Server error: Tokens not received. Please try again.');
          setOtpDigits(['', '', '', '', '', '']);
          otpInputRefs.current[0]?.focus();
          return;
        }

        try {
          storage.setAccessToken(response.access_token);
          storage.setRefreshToken(response.refresh_token);
          storage.setUserRole(response.role || 'member');
          console.log('✅ Tokens stored successfully');
        } catch (storageErr) {
          console.error('❌ Error storing tokens:', storageErr);
          setError('Error saving session. Please try again.');
          return;
        }

        showAlert('success', 'Account Created!', 'Welcome to MTM Platform!', () => {
          navigate(response.role === 'admin' ? '/admin/dashboard' : '/member/dashboard');
        });
      } else {
        const errorMsg = response?.message || 'Invalid OTP';
        console.error('❌ OTP verification failed:', errorMsg);
        setError(errorMsg);
        setOtpDigits(['', '', '', '', '', '']);
        otpInputRefs.current[0]?.focus();
      }
    } catch (err) {
      hideLoader();
      console.error('❌ Error in verifyOtpHandler:', err);

      let errorMsg = 'An error occurred. Please try again.';

      if (err?.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err?.response?.data?.detail) {
        errorMsg = err.response.data.detail;
      } else if (err?.message) {
        errorMsg = err.message;
      }

      setError(errorMsg);
      setOtpDigits(['', '', '', '', '', '']);
      otpInputRefs.current[0]?.focus();
    } finally {
      setVerificationInProgress(false);
    }
  };

  const handleChangeEmail = () => {
    setOtpSent(false);
    setOtpDigits(['', '', '', '', '', '']);
    setError('');
    setTimer(OTP_TIMER_SECONDS);
    setIsTimerExpired(false);
  };

  const formatTimer = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };


  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        .app-container { min-height: 100vh; display: flex; }
        .branding-section {
          flex: 1;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 40px;
        }
        .brand-title { font-size: 42px; font-weight: bold; margin-bottom: 16px; }
        .brand-subtitle { font-size: 18px; text-align: center; max-width: 400px; opacity: 0.9; }
        .signup-section {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          background: #fafafa;
          padding: 20px;
          overflow-y: auto;
        }
        .signup-card {
          width: 100%;
          max-width: 420px;
          background: white;
          padding: 36px;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        .signup-title { font-size: 26px; font-weight: bold; margin-bottom: 8px; }
        .signup-subtitle { color: #666; font-size: 14px; margin-bottom: 24px; line-height: 1.4; }
        .form-group {
          margin-bottom: 20px;
          position: relative;
        }
        .form-group label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 8px;
          color: #333;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .form-group input {
          width: 100%;
          padding: 12px;
          border: 2px solid #e5e5e5;
          border-radius: 8px;
          font-size: 14px;
          font-family: inherit;
          transition: all 0.3s;
        }
        .form-group input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        .form-group input.error {
          border-color: #e74c3c;
        }
        .help-text { font-size: 12px; color: #999; margin-top: 6px; }
        .error-text {
          background: #fee;
          color: #c33;
          padding: 10px;
          border-radius: 6px;
          margin-bottom: 16px;
          font-size: 13px;
          border-left: 3px solid #c33;
        }
        .btn {
          width: 100%;
          padding: 12px;
          border: none;
          border-radius: 8px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
        }
        .btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-secondary {
          background: white;
          color: #667eea;
          border: 2px solid #667eea;
        }
        .btn-secondary:hover:not(:disabled) { background: #f5f5f5; }
        .verified-info {
          background: #f0f7ff;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 13px;
          color: #333;
          border-left: 3px solid #667eea;
        }
        .otp-group {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 8px;
          margin-bottom: 16px;
        }
        .otp-input {
          width: 100%;
          aspect-ratio: 1;
          padding: 0;
          border: 2px solid #e5e5e5;
          border-radius: 8px;
          font-size: 20px;
          font-weight: bold;
          text-align: center;
          transition: all 0.3s;
          font-variant-numeric: tabular-nums;
        }
        .otp-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        .otp-input.filled { border-color: #667eea; background: #f8f9ff; }
        .otp-input:disabled { 
          background: #f5f5f5; 
          cursor: not-allowed; 
          border-color: #ccc;
          opacity: 0.6;
          color: #999;
        }
        .timer-container {
          text-align: center;
          font-size: 13px;
          color: #666;
          margin-bottom: 16px;
        }
        .timer-text { font-weight: bold; color: #667eea; font-variant-numeric: tabular-nums; }
        .timer-expired { color: #e74c3c; font-weight: bold; }
        .verification-status {
          text-align: center;
          color: #667eea;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 16px;
        }
        .signin-link {
          text-align: center;
          margin-top: 16px;
          font-size: 13px;
          color: #666;
        }
        .signin-link a {
          color: #667eea;
          text-decoration: none;
          font-weight: 700;
          transition: all 0.3s;
        }
        .signin-link a:hover { text-decoration: underline; }
        @media (max-width: 768px) {
          .app-container { flex-direction: column; }
          .branding-section { padding: 30px 20px; min-height: 200px; }
          .brand-title { font-size: 32px; }
          .signup-section { flex: 1; }
          .signup-card { max-width: 100%; }
        }
      `}</style>

      <div className="app-container">
        <div className="branding-section">
          <h2 className="brand-title">MTM Digital</h2>
          <p className="brand-subtitle">Create your account and start your journey with us today</p>
        </div>

        <div className="signup-section">
          <div className="signup-card">
            <h2 className="signup-title">Sign Up</h2>
            <p className="signup-subtitle">
              {!otpSent
                ? 'Fill in your details to create an account'
                : 'Enter the 6-digit OTP sent to your email'}
            </p>

            {!otpSent ? (
              <form onSubmit={handleSendOtp}>
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number (Optional)</label>
                  <input
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    disabled={loading}
                    maxLength="10"
                    inputMode="numeric"
                  />
                  <div className="help-text">Enter 10 digits only (numbers only, no spaces or special characters)</div>
                </div>

                {error && <div className="error-text">⚠️ {error}</div>}

                <button
                  className="btn"
                  type="submit"
                  disabled={loading || otpAttempts >= MAX_OTP_ATTEMPTS}
                >
                  {loading ? 'Sending OTP...' : `Send OTP (${otpAttempts}/${MAX_OTP_ATTEMPTS})`}
                </button>
              </form>
            ) : (
              <>
                <div className="verified-info">
                  ✓ OTP sent to: <strong>{email}</strong>
                </div>

                <form onSubmit={(e) => e.preventDefault()}>
                  <div className="form-group">
                    <label>Enter 6-Digit OTP</label>
                    <div className="otp-group">
                      {otpDigits.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => (otpInputRefs.current[index] = el)}
                          type="text"
                          maxLength="1"
                          inputMode="numeric"
                          className={`otp-input ${digit ? 'filled' : ''}`}
                          value={digit}
                          onChange={(e) => handleOtpInputChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          disabled={verificationInProgress || isTimerExpired}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="timer-container">
                    {!isTimerExpired ? (
                      <>
                        OTP expires in: <span className="timer-text">{formatTimer(timer)}</span>
                      </>
                    ) : (
                      <span className="timer-expired">OTP has expired</span>
                    )}
                  </div>

                  {error && <div className="error-text">⚠️ {error}</div>}

                  {verificationInProgress && (
                    <div className="verification-status">⏳ Creating account...</div>
                  )}

                  {!isTimerExpired ? (
                    <button
                      className="btn"
                      type="button"
                      onClick={() => verifyOtpHandler(otpDigits.join(''))}
                      disabled={loading || verificationInProgress || otpDigits.filter(d => d).length !== 6}
                    >
                      {verificationInProgress ? 'Verifying...' : `Verify OTP (${otpDigits.filter(d => d).length}/6)`}
                    </button>
                  ) : (
                    <>
                      <div style={{ textAlign: 'center', marginBottom: '16px', padding: '12px', backgroundColor: '#ffe6e6', borderRadius: '6px', color: '#d32f2f', fontWeight: '600' }}>
                        ⏰ OTP has expired. Please request a new one.
                      </div>
                      <button
                        className="btn"
                        type="button"
                        onClick={handleSendOtp}
                        disabled={loading || otpAttempts >= MAX_OTP_ATTEMPTS}
                      >
                        {loading ? 'Resending OTP...' : `Resend OTP (${otpAttempts}/${MAX_OTP_ATTEMPTS})`}
                      </button>
                    </>
                  )}

                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={handleChangeEmail}
                    disabled={loading}
                  >
                    Change Email
                  </button>
                </form>
              </>
            )}

            <div className="signin-link">
              Already have an account? <a href="/auth/signin">Sign in</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}