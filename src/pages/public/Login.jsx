import { useState, useRef, useEffect } from 'react';

const OTP_TIMER_SECONDS = 10; // 2 minutes
const MOCK_OTP = '123456'; // Mock OTP for testing

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(OTP_TIMER_SECONDS);
  const [isTimerExpired, setIsTimerExpired] = useState(false);
  const [verificationInProgress, setVerificationInProgress] = useState(false);
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
      verifyOtp(fullOtp);
    }
  }, [otpDigits, otpSent, verificationInProgress]);

  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (!identifier) {
      setError('Email or phone number is required');
      return;
    }

    setError('');
    setLoading(true);

    // Mock API call to send OTP
    setTimeout(() => {
      console.log('OTP sent to:', identifier);
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
      otpInputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
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
        setIdentifier('');
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
      console.log('OTP resent to:', identifier);
      setTimer(OTP_TIMER_SECONDS);
      setIsTimerExpired(false);
      setOtpDigits(['', '', '', '', '', '']);
      setLoading(false);
      if (otpInputRefs.current[0]) {
        otpInputRefs.current[0].focus();
      }
    }, 1000);
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

        .form-group {
          margin-bottom: 18px;
        }

        .form-group input {
          width: 100%;
          padding: 14px;
          border-radius: 8px;
          border: 1px solid #ddd;
          font-size: 14px;
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
        }

        .error-text {
          color: #e11d48;
          font-size: 14px;
          margin-bottom: 12px;
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
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
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
              Enter your email or phone number
            </div>

            {!otpSent ? (
              <form onSubmit={handleSendOtp}>
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Email or phone number"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                  />
                </div>

                {error && <div className="error-text">{error}</div>}

                <button className="btn" disabled={loading}>
                  {loading ? 'Sending OTP...' : 'Login with OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={(e) => e.preventDefault()}>
                <div className="login-subtitle">
                  Enter the 6-digit OTP sent to {identifier}
                </div>

                <div className="otp-group">
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (otpInputRefs.current[index] = el)}
                      type="text"
                      maxLength="1"
                      className={`otp-input ${digit ? 'filled' : ''}`}
                      value={digit}
                      onChange={(e) => handleOtpInputChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      disabled={verificationInProgress}
                    />
                  ))}
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

                {error && <div className="error-text">{error}</div>}

                {verificationInProgress && (
                  <div className="error-text" style={{ color: '#ff6b00', marginBottom: '12px' }}>
                    Verifying OTP...
                  </div>
                )}

                {isTimerExpired && (
                  <button
                    className="resend-button"
                    onClick={handleResendOtp}
                    disabled={loading}
                  >
                    {loading ? 'Resending OTP...' : 'Resend OTP'}
                  </button>
                )}

                <button 
                  className="btn" 
                  disabled={loading || verificationInProgress || isTimerExpired}
                  onClick={() => {
                    const fullOtp = otpDigits.join('');
                    if (fullOtp.length === 6) {
                      verifyOtp(fullOtp);
                    }
                  }}
                >
                  {verificationInProgress ? 'Verifying...' : 'Verify OTP'}
                </button>
              </form>
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
