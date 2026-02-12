import { useState } from 'react';

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
  
  if (!EMAIL_REGEX.test(cleanEmail)) {
    return { valid: false, error: "Please enter a valid email address (e.g., name@example.com)" };
  }
  
  if (cleanEmail.length < 3 || cleanEmail.length > 254) {
    return { valid: false, error: "Email length must be between 3-254 characters" };
  }
  
  if (cleanEmail.includes('..')) {
    return { valid: false, error: "Email cannot contain consecutive dots" };
  }
  
  return { valid: true, value: cleanEmail };
}

function validatePhone(phone, countryCode) {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Find country config
  const countryConfig = COUNTRY_CODES.find(c => c.code === countryCode);
  if (!countryConfig) {
    return { valid: false, error: "Invalid country code" };
  }
  
  // Validate against country pattern
  if (!countryConfig.pattern.test(cleaned)) {
    return { 
      valid: false, 
      error: `Invalid ${countryConfig.country} phone number format` 
    };
  }
  
  const fullNumber = countryCode + cleaned;
  
  return { 
    valid: true, 
    value: fullNumber,
    formatted: formatPhone(fullNumber, countryCode)
  };
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
  const [countryCode, setCountryCode] = useState('+230'); // Default to Mauritius
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validatedValue, setValidatedValue] = useState('');

  const handleInputTypeChange = (type) => {
    setInputType(type);
    setError('');
  };

  const validateInput = () => {
    if (inputType === 'email') {
      if (!email.trim()) {
        return { valid: false, error: 'Email is required' };
      }
      const result = validateEmail(email);
      if (result.valid) {
        setValidatedValue(result.value);
      }
      return result;
    } else {
      if (!phone.trim()) {
        return { valid: false, error: 'Phone number is required' };
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

    // Validate input
    const validation = validateInput();
    
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setError('');
    setLoading(true);

    // Simulate API call to send OTP
    try {
      // In real implementation, call your API here:
      // await fetch('/api/auth/send-otp', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ 
      //     [inputType]: validatedValue,
      //     type: 'login'
      //   })
      // });

      setTimeout(() => {
        console.log('OTP sent to:', validatedValue, 'via', inputType);
        setOtpSent(true);
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!otp || otp.trim().length !== 6) {
      setError('Please enter the 6-digit OTP');
      return;
    }

    setError('');
    setLoading(true);

    // Simulate API call to verify OTP
    try {
      setTimeout(() => {
        console.log('OTP verified. Login successful');
        setLoading(false);
        alert('Login successful! (demo)');
      }, 1000);
    } catch (err) {
      setError('Invalid OTP. Please try again.');
      setLoading(false);
    }
  };

  const handleResendOtp = () => {
    setOtpSent(false);
    setOtp('');
    setError('');
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
          cursor: pointer;
        }

        .country-select:focus {
          outline: none;
          border-color: #ff6b00;
        }

        .form-group input {
          width: 100%;
          padding: 14px;
          border-radius: 8px;
          border: 1px solid #ddd;
          font-size: 14px;
          transition: border-color 0.3s;
        }

        .phone-input-wrapper input {
          flex: 1;
        }

        .form-group input:focus {
          outline: none;
          border-color: #ff6b00;
        }

        .form-group input.error {
          border-color: #e11d48;
        }

        .help-text {
          font-size: 12px;
          color: #666;
          margin-top: 4px;
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

        .verified-info {
          background: #f0f9ff;
          border: 1px solid #bae6fd;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 16px;
          font-size: 14px;
          color: #0369a1;
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
                : 'Enter the OTP sent to your ' + inputType
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
                          countryCode === '+230' ? '5123 4567' :
                          countryCode === '+91' ? '98765 43210' :
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

                <form onSubmit={handleLogin}>
                  <div className="form-group">
                    <label htmlFor="otp">Enter 6-Digit OTP</label>
                    <input
                      id="otp"
                      type="text"
                      placeholder="000000"
                      value={otp}
                      onChange={(e) => {
                        // Only allow digits and limit to 6 characters
                        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setOtp(value);
                        setError('');
                      }}
                      maxLength="6"
                      className={error ? 'error' : ''}
                      autoComplete="one-time-code"
                    />
                    <div className="help-text">
                      Check your {inputType === 'email' ? 'email inbox' : 'WhatsApp/SMS'}
                    </div>
                  </div>

                  {error && (
                    <div className="error-text">
                      ⚠️ {error}
                    </div>
                  )}

                  <button className="btn" type="submit" disabled={loading || otp.length !== 6}>
                    {loading ? 'Verifying...' : 'Login'}
                  </button>

                  <button 
                    className="btn btn-secondary" 
                    type="button" 
                    onClick={handleResendOtp}
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