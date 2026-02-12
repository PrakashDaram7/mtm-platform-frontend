import { useState } from 'react';
import { loginUser } from '../../services/authService.js';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateForm = () => {
    if (!email || !password) {
      setError('Email and password are required');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const credentials = { email, password };

    try {
      setLoading(true);
      console.log('Attempting to login...');

      const response = await loginUser(credentials);
      console.log('Login successful:', response);
    } catch (err) {
      console.error('Login failed:', err.message);
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Swiggy / Zomato style UI CSS */}
      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .app-container {
          min-height: 100vh;
          display: flex;
        }

        /* Left branding section (like Swiggy/Zomato) */
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

        /* Right login section */
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
          animation: slideUp 0.5s ease;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
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

        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-weight: 600;
          font-size: 14px;
        }

        .form-group input {
          width: 100%;
          padding: 14px;
          border-radius: 8px;
          border: 1px solid #ddd;
          font-size: 14px;
          transition: all 0.2s;
        }

        .form-group input:focus {
          outline: none;
          border-color: #ff6b00;
          box-shadow: 0 0 0 2px rgba(255,107,0,0.15);
        }

        .error-text {
          color: #e11d48;
          font-size: 14px;
          margin-bottom: 12px;
        }

        .login-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #ff6b00, #ff2e63);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.1s ease, opacity 0.2s;
        }

        .login-btn:hover {
          transform: translateY(-1px);
          opacity: 0.95;
        }

        .login-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .back-link {
          margin-top: 18px;
          text-align: center;
        }

        .back-link a {
          color: #ff6b00;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
        }

        .back-link a:hover {
          text-decoration: underline;
        }

        /* Mobile responsive */
        @media (max-width: 768px) {
          .branding-section {
            display: none;
          }

          .login-section {
            flex: 1;
          }
        }
      `}</style>

      <div className="app-container">
        {/* Left side branding */}
        <div className="branding-section">
          <div className="brand-title">Welcome Back</div>
          <div className="brand-subtitle">
            Sign in to continue and explore a fast, modern platform experience.
          </div>
        </div>

        {/* Right side login */}
        <div className="login-section">
          <div className="login-card">
            <div className="login-title">Login</div>
            <div className="login-subtitle">
              Enter your credentials to continue
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />
              </div>

              {error && <div className="error-text">{error}</div>}

              <button
                type="submit"
                disabled={loading}
                className="login-btn"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <div className="back-link">
              <a href="/">Back to Home</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}