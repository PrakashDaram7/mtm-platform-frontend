import { useState, useRef, useEffect } from 'react';

// Constants
const OTP_TIMER_SECONDS = 10; // 2 minutes
const MOCK_OTP = '123456'; // Mock OTP for testing

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
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  if (!cleaned) {
    return { valid: false, error: "Phone number is required" };
  }

  // Find country config
  const countryConfig = COUNTRY_CODES.find(c => c.code === countryCode);
  if (!countryConfig) {
    return { valid: false, error: "Invalid country code" };
  }
  
  // Validate against country pattern
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
  // Remove country code for formatting
  const number = phone.replace(countryCode, '');
  
  // Format based on country
  if (countryCode === '+230' && number.length === 8) {
    return `${countryCode} ${number.slice(0, 4)} ${number.slice(4)}`;
  } else if (countryCode === '+91' && number.length === 10) {
    return `${countryCode} ${number.slice(0, 5)} ${number.slice(5)}`;
  } else if (countryCode === '+1' && number.length === 10) {
    return `${countryCode} (${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6)}`;
  }
  
  // Default formatting
  return `${countryCode} ${number}`;
}

function detectInputType(input) {
  const trimmed = input.trim();
  
  // Check if it contains @ (likely email)
  if (trimmed.includes('@')) {
    return 'email';
  }
  
  // Check if it's mostly digits (likely phone)
  const digitCount = (trimmed.match(/\d/g) || []).length;
  if (digitCount >= 8) {
    return 'phone';
  }
  
  // Default to email for other cases
  return 'email';
}

export default function Login() {
  const [inputType, setInputType] = useState('phone'); // 'email' or 'phone'
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91'); // Default to India
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validatedValue, setValidatedValue] = useState('');
  const [timer, setTimer] = useState(OTP_TIMER_SECONDS);
  const [isTimerExpired, setIsTimerExpired] = useState(false);
  const [verificationInProgress, setVerificationInProgress] = useState(false);
  const otpInputRefs = useRef([]);

  // Timer effect - counts down after OTP is sent
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
      verifyOtp(fullOtp);
    }
  }, [otpDigits, otpSent, verificationInProgress]);

  const handleInputTypeChange = (type) => {
    setInputType(type);
    setError('');
  };

  const validateInput = () => {
    if (inputType === 'email') {
      const result = validateEmail(email);
      if (result.valid) {
        setValidatedValue(result.value);
      }
      return result;
    } else {
      const result = validatePhone(phone, countryCode);
      if (result.valid) {
        setValidatedValue(result.value);
      }
      return result;
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();

    // Validate input
    const validation = validateInput();
    
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setError('');
    setLoading(true);

    // Mock API call to send OTP
    setTimeout(() => {
      console.log('OTP sent to:', validatedValue, 'via', inputType);
      console.log('Mock OTP for testing: ' + MOCK_OTP);
      setOtpSent(true);
      setLoading(false);
      setTimer(OTP_TIMER_SECONDS);
      setIsTimerExpired(false);
      setOtpDigits(['', '', '', '', '', '']);
      // Focus on first OTP input
      if (otpInputRefs.current[0]) {
        otpInputRefs.current[0].focus();
      }
    }, 1000);
  };

  const handleOtpInputChange = (index, value) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    // Only allow single character
    if (value.length > 1) return;

    const newOtpDigits = [...otpDigits];
    newOtpDigits[index] = value;
    setOtpDigits(newOtpDigits);
    setError('');

    // Auto-focus to next input if digit is entered
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    // Handle backspace to move to previous input
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }

    // Handle arrow keys for navigation
    if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      otpInputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      e.preventDefault();
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const verifyOtp = async (otp) => {
    setVerificationInProgress(true);
    setError('');

    // Mock API call to verify OTP
    setTimeout(() => {
      console.log('Verifying OTP:', otp);
      
      if (otp === MOCK_OTP) {
        console.log('OTP verified. Login successful');
        alert('Login successful! (Demo - Mock OTP: 123456)');
        // Reset form
        setOtpSent(false);
        setEmail('');
        setPhone('');
        setOtpDigits(['', '', '', '', '', '']);
      } else {
        setError('Invalid OTP. Please try again.');
        setOtpDigits(['', '', '', '', '', '']);
        otpInputRefs.current[0]?.focus();
      }
      
      setVerificationInProgress(false);
    }, 1500);
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError('');

    // Mock API call to resend OTP
    setTimeout(() => {
      console.log('OTP resent to:', validatedValue);
      console.log('Mock OTP for testing: ' + MOCK_OTP);
      setTimer(OTP_TIMER_SECONDS);
      setIsTimerExpired(false);
      setOtpDigits(['', '', '', '', '', '']);
      setLoading(false);
      if (otpInputRefs.current[0]) {
        otpInputRefs.current[0].focus();
      }
    }, 1000);
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
          background: linear-gradient(135deg, #ff6b00, #ff2e63);
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

        .login-section {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          background: #fafafa;
          padding: 20px;
        }

        .login-card {
          width: 100%;
          max-width: 420px;
          background: white;
          padding: 36px;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }

        .login-title {
          font-size: 26px;
          font-weight: bold;
          margin-bottom: 8px;
        }

        .login-subtitle {
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
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          color: #666;
          transition: all 0.3s;
        }

        .toggle-btn.active {
          background: white;
          color: #ff6b00;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .form-group {
          margin-bottom: 18px;
          position: relative;
        }

        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-size: 14px;
          font-weight: 500;
          color: #333;
        }

        .phone-input-wrapper {
          display: flex;
          gap: 8px;
        }

        .country-select {
          width: 140px;
          padding: 14px 10px;
          border-radius: 8px;
          border: 1px solid #ddd;
          font-size: 14px;
          background: white;
          color: #333;
          cursor: pointer;
          transition: border-color 0.3s, box-shadow 0.3s;
        }

        .country-select:focus {
          outline: none;
          border-color: #ff6b00;
          box-shadow: 0 0 0 3px rgba(255, 107, 0, 0.1);
        }

        .country-select option {
          background: white;
          color: #333;
          padding: 8px;
        }

        .form-group input {
          width: 100%;
          padding: 14px;
          border-radius: 8px;
          border: 1px solid #ddd;
          font-size: 14px;
          transition: border-color 0.3s;
          background: white;
          color: #333;
        }

        .phone-input-wrapper input {
          flex: 1;
        }

        .otp-group {
          display: flex;
          gap: 8px;
          margin-bottom: 18px;
          justify-content: center;
        }

        .otp-input {
          width: 50px;
          height: 50px;
          padding: 0;
          text-align: center;
          font-size: 24px;
          font-weight: 600;
          border: 2px solid #ddd;
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .otp-input:focus {
          outline: none;
          border-color: #ff6b00;
          box-shadow: 0 0 0 3px rgba(255, 107, 0, 0.1);
        }

        .otp-input.filled {
          border-color: #ff6b00;
          background: #fff5f0;
        }

        .timer-container {
          text-align: center;
          margin-bottom: 18px;
          font-size: 14px;
          color: #666;
        }

        .timer-text {
          font-weight: 600;
          color: #ff6b00;
        }

        .timer-expired {
          color: #e11d48;
        }

        .resend-button {
          width: 100%;
          padding: 12px;
          background: transparent;
          color: #ff6b00;
          border: 2px solid #ff6b00;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          margin-bottom: 10px;
          transition: all 0.3s ease;
        }

        .resend-button:hover:not(:disabled) {
          background: #fff5f0;
        }

        .resend-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .form-group input:focus {
          outline: none;
          border-color: #ff6b00;
          box-shadow: 0 0 0 3px rgba(255, 107, 0, 0.1);
        }

        .form-group input.error {
          border-color: #e11d48;
        }

        .form-group input::placeholder {
          color: #999;
        }

        .help-text {
          font-size: 12px;
          color: #666;
          margin-top: 4px;
        }

        .otp-group {
          display: flex;
          gap: 8px;
          margin-bottom: 18px;
          justify-content: center;
        }

        .otp-input {
          width: 50px;
          height: 50px;
          padding: 0;
          text-align: center;
          font-size: 24px;
          font-weight: 600;
          border: 2px solid #ddd;
          border-radius: 8px;
          transition: all 0.3s ease;
          background: white;
          color: #333;
        }

        .otp-input:focus {
          outline: none;
          border-color: #ff6b00;
          box-shadow: 0 0 0 3px rgba(255, 107, 0, 0.1);
        }

        .otp-input.filled {
          border-color: #ff6b00;
          background: #fff5f0;
        }

        .otp-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .timer-container {
          text-align: center;
          margin-bottom: 18px;
          font-size: 14px;
          color: #666;
        }

        .timer-text {
          font-weight: 600;
          color: #ff6b00;
          font-size: 16px;
        }

        .timer-expired {
          color: #e11d48;
          font-weight: 600;
        }

        .verification-status {
          color: #ff6b00;
          font-size: 14px;
          margin-bottom: 12px;
          text-align: center;
          font-weight: 500;
        }

        .error-text {
          color: #e11d48;
          font-size: 14px;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #ff6b00, #ff2e63);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          margin-bottom: 10px;
          transition: opacity 0.3s;
        }

        .btn:hover:not(:disabled) {
          opacity: 0.9;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: white;
          color: #ff6b00;
          border: 1px solid #ff6b00;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #fff5f0;
        }

        .verified-info {
          background: #f0f9ff;
          border: 1px solid #bae6fd;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 16px;
          font-size: 14px;
          color: #0369a1;
          word-break: break-all;
        }

        .signup-link {
          width: 100%;
          text-align: center;
          margin-top: 12px;
        }

        .signup-link a {
          color: #ff6b00;
          text-decoration: none;
          font-weight: 600;
          display: inline-block;
          margin: 0 auto;
        }

        @media (max-width: 768px) {
          .branding-section { display: none; }
          
          .login-card {
            padding: 24px;
          }

          .country-select {
            width: 110px;
            padding: 14px 6px;
            font-size: 13px;
          }

          .otp-input {
            width: 45px;
            height: 45px;
            font-size: 20px;
          }
        }
      `}</style>

      <div className="app-container">
        <div className="branding-section">
          <div className="brand-title">Welcome Back</div>
          <div className="brand-subtitle">
            Sign in with OTP for a fast and secure experience.
          </div>
        </div>

        <div className="login-section">
          <div className="login-card">
            <div className="login-title">OTP Login</div>
            <div className="login-subtitle">
              {!otpSent 
                ? 'Choose your login method below' 
                : 'Enter the 6-digit OTP sent to your ' + inputType
              }
            </div>

            {!otpSent ? (
              <form onSubmit={handleSendOtp}>
                <div className="input-type-toggle">
                  <button
                    type="button"
                    className={`toggle-btn ${inputType === 'phone' ? 'active' : ''}`}
                    onClick={() => handleInputTypeChange('phone')}
                  >
                    📱 Phone Number
                  </button>
                  <button
                    type="button"
                    className={`toggle-btn ${inputType === 'email' ? 'active' : ''}`}
                    onClick={() => handleInputTypeChange('email')}
                  >
                    📧 Email
                  </button>
                </div>

                {inputType === 'email' ? (
                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError('');
                      }}
                      className={error ? 'error' : ''}
                      autoComplete="email"
                    />
                    <div className="help-text">
                      We'll send a 6-digit OTP to your email
                    </div>
                  </div>
                ) : (
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <div className="phone-input-wrapper">
                      <select
                        className="country-select"
                        value={countryCode}
                        onChange={(e) => {
                          setCountryCode(e.target.value);
                          setError('');
                        }}
                      >
                        {COUNTRY_CODES.map((country) => (
                          <option key={country.code} value={country.code}>
                            {country.flag} {country.code}
                          </option>
                        ))}
                      </select>
                      <input
                        id="phone"
                        type="tel"
                        placeholder={
                          countryCode ===  '+91' ? '98765 43210' :
                          countryCode ===  '+230' ? '5123 4567':
                          '123 456 7890'
                        }
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          setError('');
                        }}
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

                <button className="btn" type="submit" disabled={loading}>
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

                  {isTimerExpired && (
                    <button
                      className="btn btn-secondary"
                      type="button"
                      onClick={handleResendOtp}
                      disabled={loading}
                    >
                      {loading ? 'Resending OTP...' : 'Resend OTP'}
                    </button>
                  )}

                  {!isTimerExpired && (
                    <button 
                      className="btn" 
                      type="button"
                      disabled={loading || verificationInProgress}
                    >
                      {verificationInProgress ? 'Verifying OTP...' : `Verify OTP (${otpDigits.filter(d => d).length}/6)`}
                    </button>
                  )}

                  <button 
                    className="btn btn-secondary" 
                    type="button" 
                    onClick={handleChangeIdentifier}
                    disabled={loading}
                  >
                    Change {inputType === 'email' ? 'Email' : 'Phone Number'}
                  </button>
                </form>
              </>
            )}

            <div className="signup-link">
              New user? <a href="/signup">Sign up</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}