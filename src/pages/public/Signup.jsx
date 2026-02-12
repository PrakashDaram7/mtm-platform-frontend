import { useState } from 'react';

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !phone) {
      setError('All fields are required');
      return;
    }

    setError('');
    setLoading(true);

    // Simulate signup API
    setTimeout(() => {
      console.log('User registered:', { name, email, phone });
      alert('Signup successful (demo)');
      setLoading(false);
    }, 1000);
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

        .signup-section {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          background: #fafafa;
          padding: 20px;
        }

        .signup-card {
          width: 100%;
          max-width: 420px;
          background: white;
          padding: 36px;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }

        .signup-title {
          font-size: 26px;
          font-weight: bold;
          margin-bottom: 8px;
        }

        .signup-subtitle {
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
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .login-link {
          width: 100%;
          text-align: center;
          margin-top: 12px;
          font-size: 14px;
        }

        .login-link a {
          color: #ff6b00;
          text-decoration: none;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .branding-section { display: none; }
        }
      `}</style>

      <div className="app-container">
        <div className="branding-section">
          <div className="brand-title">Join Us</div>
          <div className="brand-subtitle">
            Create your account and start your journey with us.
          </div>
        </div>

        <div className="signup-section">
          <div className="signup-card">
            <div className="signup-title">Sign Up</div>
            <div className="signup-subtitle">
              Enter your details to create an account
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <input
                  type="tel"
                  placeholder="Phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              {error && <div className="error-text">{error}</div>}

              <button className="btn" disabled={loading}>
                {loading ? 'Creating account...' : 'Sign Up'}
              </button>
            </form>

            <div className="login-link">
              Already have an account? <a href="/login">Login</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}