export default function Home() {
  return (
    <>
      <style>{`
        body {
          margin: 0;
          font-family: Arial, Helvetica, sans-serif;
        }

        .home-container {
          height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background: linear-gradient(135deg, #ff6b00, #ff2e63);
          color: white;
          text-align: center;
        }

        .home-title {
          font-size: 56px;
          font-weight: bold;
          margin-bottom: 20px;
        }

        .login-btn {
          padding: 14px 28px;
          font-size: 18px;
          background: white;
          color: #ff2e63;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .login-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.2);
        }
      `}</style>

      <div className="home-container">
        <h1 className="home-title">
          Welcome to MTM Digital Platform
        </h1>

        <a href="/login">
          <button className="login-btn">
            Go to Login
          </button>
        </a>
      </div>
    </>
  );
}
