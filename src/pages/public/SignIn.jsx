import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendOTP, verifyOTP, resendOTP } from '../../services/authService';
import { storage } from '../../utils/storage';
import { showAlert, showLoader, hideLoader } from '../../utils/alerts';

// Constants
const OTP_TIMER_SECONDS = 120; // 2 minutes

// Country codes data
const COUNTRY_CODES = [
  { code: '+230', country: 'Mauritius', flag: '🇲🇺', pattern: /^[245-9]\d{7}$/ },
  { code: '+91', country: 'India', flag: '🇮🇳', pattern: /^[6-9]\d{9}$/ },
  { code: '+1', country: 'USA/Canada', flag: '🇺🇸', pattern: /^\d{10}$/ },
  { code: '+44', country: 'UK', flag: '🇬🇧', pattern: /^\d{10}$/ },
  { code: '+61', country: 'Australia', flag: '🇦🇺', pattern: /^[4-5]\d{8}$/ },
  { code: '+27', country: 'South Africa', flag: '🇿🇦', pattern: /^\d{9}$/ },
  { code: '+971', country: 'UAE', flag: '🇦🇪', pattern: /^[5]\d{8}$/ },
  { code: '+65', country: 'Singapore', flag: '🇸🇬', pattern: /^[8-9]\d{7}$/ },
];

// Validation Functions
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(email) {
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanEmail) {
    return { valid: false, error: "Email is required" };
  }

  if (!EMAIL_REGEX.test(cleanEmail)) {
    return { valid: false, error: "Please enter a valid email address (e.g., name@example.com)" };
  }

  if (cleanEmail.length < 3 || cleanEmail.length > 254) {
    return { valid: false, error: "Email length must be between 3-254 characters" };
  }

  if (cleanEmail.includes('..')) {
    return { valid: false, error: "Email cannot contain consecutive dots" };
  }

  const [localPart, domain] = cleanEmail.split('@');
  if (localPart.length < 1 || domain.length < 3) {
    return { valid: false, error: "Invalid email format" };
  }

  return { valid: true, value: cleanEmail };
}

function validatePhone(phone, countryCode) {
  const cleaned = phone.replace(/\D/g, '');

  if (!cleaned) {
    return { valid: false, error: "Phone number is required" };
  }

  const countryConfig = COUNTRY_CODES.find(c => c.code === countryCode);
  if (!countryConfig) {
    return { valid: false, error: "Invalid country code" };
  }

  if (!countryConfig.pattern.test(cleaned)) {
    return {
      valid: false,
      error: `Invalid ${countryConfig.country} phone number format. Expected: ${getPhoneFormat(countryCode)}`
    };
  }

  const fullNumber = countryCode + cleaned;

  return {
    valid: true,
    value: fullNumber,
    formatted: formatPhone(fullNumber, countryCode)
  };
}

function getPhoneFormat(countryCode) {
  const formats = {
    '+91': '10 digits (e.g., 98765 43210)',
    '+230': '8 digits (e.g., 5123 4567)',
    '+1': '10 digits (e.g., (555) 123-4567)',
    '+44': '10 digits',
    '+61': '9 digits (starting with 4-5)',
    '+27': '9 digits',
    '+971': '9 digits (starting with 5)',
    '+65': '8 digits (starting with 8-9)'
  };
  return formats[countryCode] || '10 digits';
}

function formatPhone(phone, countryCode) {
  const number = phone.replace(countryCode, '');

  if (countryCode === '+230' && number.length === 8) {
    return `${countryCode} ${number.slice(0, 4)} ${number.slice(4)}`;
  } else if (countryCode === '+91' && number.length === 10) {
    return `${countryCode} ${number.slice(0, 5)} ${number.slice(5)}`;
  } else if (countryCode === '+1' && number.length === 10) {
    return `${countryCode} (${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6)}`;
  }

  return `${countryCode} ${number}`;
}

export default function SignIn() {
  const navigate = useNavigate();
  const [inputType, setInputType] = useState('phone');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validatedValue, setValidatedValue] = useState('');
  const [timer, setTimer] = useState(OTP_TIMER_SECONDS);
  const [isTimerExpired, setIsTimerExpired] = useState(false);
  const [verificationInProgress, setVerificationInProgress] = useState(false);
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const otpInputRefs = useRef([]);

  // Timer countdown
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

  const isInputValid = () => {
    if (inputType === 'email') {
      return email && email.trim().length > 0;
    } else {
      return phone && phone.trim().length > 0;
    }
  };

  const handleInputTypeChange = (type) => {
    setInputType(type);
    setError('');
    setValidatedValue('');
  };

  const validateInput = () => {
    if (inputType === 'email') {
      if (!email || email.trim() === '') {
        return { valid: false, error: "Please enter your email address" };
      }

      const result = validateEmail(email);
      if (result.valid) {
        setValidatedValue(result.value);
      }
      return result;
    } else {
      if (!phone || phone.trim() === '') {
        return { valid: false, error: "Please enter your phone number" };
      }

      const result = validatePhone(phone, countryCode);
      if (result.valid) {
        setValidatedValue(result.value);
      }
      return result;
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();

    const validation = validateInput();

    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    const identifierValue = validation.value;
    setValidatedValue(identifierValue);

    setError('');
    showLoader('Sending OTP', 'Please wait...');

    try {
      let payload = {};

      if (inputType === 'email') {
        payload = { email: identifierValue };
      } else {
        const digits = identifierValue.replace(/\D/g, '');
        payload = {
          phone: digits,
          country_code: countryCode
        };
      }

      console.log("Sending OTP payload:", payload);

      const response = await sendOTP(payload);

      hideLoader();

      if (response.success) {
        showAlert(
          'success',
          'OTP Sent!',
          `OTP has been sent to ${identifierValue}`
        );

        setOtpSent(true);
        setTimer(OTP_TIMER_SECONDS);
        setIsTimerExpired(false);
        setOtpDigits(['', '', '', '', '', '']);

        if (otpInputRefs.current[0]) {
          otpInputRefs.current[0].focus();
        }

      } else {
        showAlert(
          'error',
          'Error',
          response.message || 'Failed to send OTP. Please try again.'
        );
      }

    } catch (err) {
      hideLoader();

      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.message ||
        'Failed to send OTP. Please try again.';

      setError(errorMsg);
      showAlert('error', 'Error', errorMsg);
      console.error('Send OTP error:', err);
    }
  };

  const handleOtpInputChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    if (value.length > 1) return;

    const newOtpDigits = [...otpDigits];
    newOtpDigits[index] = value;
    setOtpDigits(newOtpDigits);
    setError('');

    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }

    if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      otpInputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      e.preventDefault();
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const verifyOtpHandler = async (e) => {
    if (e?.preventDefault) e.preventDefault();

    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 6) return;

    if (isSignupMode) {
      if (!fullName.trim()) {
        setError('Full name is required for signup');
        showAlert('error', 'Missing Information', 'Please enter your full name');
        return;
      }
      if (!password.trim()) {
        setError('Password is required for signup');
        showAlert('error', 'Missing Information', 'Please enter a password');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        showAlert('error', 'Weak Password', 'Password must be at least 6 characters');
        return;
      }
    }

    setVerificationInProgress(true);
    showLoader(isSignupMode ? 'Creating Account' : 'Verifying OTP', 'Please wait...');
    setError('');

    try {
      let payload = {
        otp: fullOtp
      };

      if (inputType === 'email') {
        payload.email = validatedValue;
      } else {
        payload.phone = validatedValue;
      }

      if (isSignupMode) {
        payload.full_name = fullName;
        payload.password = password;
      }

      const response = await verifyOTP(payload);
      hideLoader();

      if (response.success) {
        storage.setAccessToken(response.access_token);
        storage.setRefreshToken(response.refresh_token);
        storage.setUserRole(response.role || 'user');
        if (response.user) {
          storage.setUserData(response.user);
        }

        const successMsg = isSignupMode ? 'Account Created Successfully!' : 'Login Successful!';
        const welcomeMsg = isSignupMode ? 'Welcome to MTM Platform!' : 'Welcome back!';

        showAlert('success', successMsg, welcomeMsg, () => {
          const userRole = response.role || 'user';
          const dashboardMap = {
            admin: '/admin/dashboard',
            moderator: '/moderator/dashboard',
            organizer: '/organizer/dashboard',
            member: '/member/dashboard',
            user: '/user/dashboard',
          };
          navigate(dashboardMap[userRole] || '/user/dashboard');
        });
      } else {
        showAlert('error', 'Invalid OTP', response.message || 'Invalid OTP. Please try again.');
        setOtpDigits(['', '', '', '', '', '']);
        otpInputRefs.current[0]?.focus();
      }
    } catch (err) {
      hideLoader();
      const errorMsg = err.response?.data?.message || err.message || 'Invalid OTP. Please try again.';
      setError(errorMsg);
      showAlert('error', 'Error', errorMsg);
      setOtpDigits(['', '', '', '', '', '']);
      otpInputRefs.current[0]?.focus();
      console.error('Verify OTP error:', err);
    } finally {
      setVerificationInProgress(false);
    }
  };

  const handleResendOtp = async () => {
    showLoader('Resending OTP', 'Please wait...');
    setError('');

    try {
      let payload = {};
      if (inputType === 'email') {
        payload.email = validatedValue;
      } else {
        payload.phone = validatedValue;
      }

      const response = await resendOTP(payload);
      hideLoader();

      if (response.success) {
        showAlert('success', 'OTP Resent!', `New OTP has been sent to ${validatedValue}`);
        setTimer(OTP_TIMER_SECONDS);
        setIsTimerExpired(false);
        setOtpDigits(['', '', '', '', '', '']);
        if (otpInputRefs.current[0]) {
          otpInputRefs.current[0].focus();
        }
      } else {
        showAlert('error', 'Error', response.message || 'Failed to resend OTP. Please try again.');
      }
    } catch (err) {
      hideLoader();
      const errorMsg = err.response?.data?.message || err.message || 'Failed to resend OTP. Please try again.';
      setError(errorMsg);
      showAlert('error', 'Error', errorMsg);
      console.error('Resend OTP error:', err);
    }
  };

  const handleChangeIdentifier = () => {
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

  const selectedCountry = COUNTRY_CODES.find(c => c.code === countryCode);

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }

        body {
          margin: 0;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .app-container {
          min-height: 100vh;
          display: flex;
        }

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

        .brand-title {
          font-size: 42px;
          font-weight: bold;
          margin-bottom: 16px;
        }

        .brand-subtitle {
          font-size: 18px;
          text-align: center;
          max-width: 400px;
          opacity: 0.9;
        }

        .signin-section {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          background: #fafafa;
          padding: 20px;
        }

        .signin-card {
          width: 100%;
          max-width: 420px;
          background: white;
          padding: 36px;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }

        .signin-title {
          font-size: 26px;
          font-weight: bold;
          margin-bottom: 8px;
        }

        .signin-subtitle {
          color: #666;
          font-size: 14px;
          margin-bottom: 24px;
          line-height: 1.4;
        }

        .input-type-toggle {
          display: flex;
          gap: 8px;
          margin-bottom: 20px;
          background: #f5f5f5;
          padding: 4px;
          border-radius: 8px;
        }

        .toggle-btn {
          flex: 1;
          padding: 10px;
          border: none;
          background: transparent;
          cursor: pointer;
          border-radius: 6px;
          font-weight: 600;
          font-size: 13px;
          color: #666;
          transition: all 0.3s;
        }

        .toggle-btn.active {
          background: white;
          color: #667eea;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .form-group {
          margin-bottom: 20px;
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

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 12px;
          border: 2px solid #e5e5e5;
          border-radius: 8px;
          font-size: 14px;
          font-family: inherit;
          transition: all 0.3s;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-group input.error,
        .form-group select.error {
          border-color: #e74c3c;
        }

        .form-group.inline {
          display: grid;
          grid-template-columns: 120px 1fr;
          gap: 8px;
          align-items: flex-end;
        }

        .form-group.inline select {
          margin-bottom: 0;
        }

        .form-group.inline input {
          margin-bottom: 0;
        }

        .help-text {
          font-size: 12px;
          color: #999;
          margin-top: 6px;
        }

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

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: white;
          color: #667eea;
          border: 2px solid #667eea;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #f5f5f5;
        }

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

        .otp-input.filled {
          border-color: #667eea;
          background: #f8f9ff;
        }

        .otp-input:disabled {
          background: #f5f5f5;
          cursor: not-allowed;
        }

        .timer-container {
          text-align: center;
          font-size: 13px;
          color: #666;
          margin-bottom: 16px;
        }

        .timer-text {
          font-weight: bold;
          color: #667eea;
          font-variant-numeric: tabular-nums;
        }

        .timer-expired {
          color: #e74c3c;
          font-weight: bold;
        }

        .verification-status {
          text-align: center;
          color: #667eea;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 16px;
        }

        .signup-link {
          text-align: center;
          margin-top: 16px;
          font-size: 13px;
          color: #666;
        }

        .signup-link a {
          color: #667eea;
          text-decoration: none;
          font-weight: 700;
          transition: all 0.3s;
        }

        .signup-link a:hover {
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          .app-container {
            flex-direction: column;
          }

          .branding-section {
            padding: 30px 20px;
            min-height: 200px;
          }

          .brand-title {
            font-size: 32px;
          }

          .signin-section {
            flex: 1;
          }

          .signin-card {
            max-width: 100%;
          }
        }
      `}</style>

      <div className="app-container">
        <div className="branding-section">
          <h2 className="brand-title">MTM Digital</h2>
          <p className="brand-subtitle">
            Secure authentication with OTP. Sign in to your account.
          </p>
        </div>

        <div className="signin-section">
          <div className="signin-card">
            <h2 className="signin-title">Sign In</h2>
            <p className="signin-subtitle">
              Enter your email or phone number to receive a verification code
            </p>

            {!otpSent ? (
              <form onSubmit={handleSendOtp}>
                <div className="input-type-toggle">
                  <button
                    type="button"
                    className={`toggle-btn ${inputType === 'email' ? 'active' : ''}`}
                    onClick={() => handleInputTypeChange('email')}
                  >
                    📧 Email
                  </button>
                  <button
                    type="button"
                    className={`toggle-btn ${inputType === 'phone' ? 'active' : ''}`}
                    onClick={() => handleInputTypeChange('phone')}
                  >
                    📱 Phone
                  </button>
                </div>

                {inputType === 'email' ? (
                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={error ? 'error' : ''}
                      autoComplete="email"
                    />
                  </div>
                ) : (
                  <div>
                    <div className="form-group inline">
                      <label htmlFor="country" style={{ gridColumn: '1', marginBottom: '8px' }}>Country</label>
                      <label htmlFor="phone" style={{ gridColumn: '2', marginBottom: '8px' }}>Phone</label>
                      <select
                        id="country"
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        style={{ gridColumn: '1' }}
                      >
                        {COUNTRY_CODES.map((country) => (
                          <option key={country.code} value={country.code}>
                            {country.flag} {country.country}
                          </option>
                        ))}
                      </select>
                      <input
                        id="phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        style={{ gridColumn: '2' }}
                        className={error ? 'error' : ''}
                        autoComplete="tel"
                      />
                    </div>
                    <div className="help-text">
                      {selectedCountry && `${selectedCountry.country} format - We'll send OTP via WhatsApp/SMS`}
                    </div>
                  </div>
                )}

                {error && (
                  <div className="error-text">
                    ⚠️ {error}
                  </div>
                )}

                <button
                  className="btn"
                  type="submit"
                  disabled={!isInputValid() || loading}
                >
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </form>
            ) : (
              <>
                <div className="verified-info">
                  ✓ OTP sent to: <strong>
                    {inputType === 'email' ? email : `${countryCode} ${phone}`}
                  </strong>
                </div>

                <form onSubmit={verifyOtpHandler}>
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
                          pattern="[0-9]*"
                          className={`otp-input ${digit ? 'filled' : ''}`}
                          value={digit}
                          onChange={(e) => handleOtpInputChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          disabled={verificationInProgress}
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

                  {error && (
                    <div className="error-text">
                      ⚠️ {error}
                    </div>
                  )}

                  {verificationInProgress && (
                    <div className="verification-status">
                      ⏳ Verifying OTP...
                    </div>
                  )}

                  <button
                    className="btn"
                    type="submit"
                    disabled={verificationInProgress || loading || otpDigits.join('').length !== 6}
                  >
                    {verificationInProgress
                      ? 'Verifying OTP...'
                      : 'Verify OTP'}
                  </button>

                  {isTimerExpired && (
                    <button
                      className="btn btn-secondary"
                      type="button"
                      onClick={handleResendOtp}
                      disabled={loading || verificationInProgress}
                    >
                      {loading ? 'Resending OTP...' : 'Resend OTP'}
                    </button>
                  )}

                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={handleChangeIdentifier}
                    disabled={loading || verificationInProgress}
                  >
                    Change {inputType === 'email' ? 'Email' : 'Phone Number'}
                  </button>
                </form>
              </>
            )}

            <div className="signup-link">
              New user? <a href="/auth/signup">Sign up</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}