/**
 * AccessDenied.jsx
 *
 * Shown when an authenticated user tries to access a route
 * they don't have permission for (PRD Section 3.2).
 */

import { useNavigate } from 'react-router-dom';
import { storage } from '../../utils/storage';

const ROLE_DASHBOARD = {
    admin: '/admin/dashboard',
    finance_admin: '/finance/dashboard',
    event_manager: '/events/dashboard',
    committee_member: '/committee/dashboard',
    moderator: '/moderator/dashboard',
    member: '/member/dashboard',
    family_member: '/member/dashboard',
    volunteer: '/member/dashboard',
};

const ROLE_LABELS = {
    admin: 'Administrator',
    finance_admin: 'Finance Admin',
    event_manager: 'Event Manager',
    committee_member: 'Committee Member',
    moderator: 'Moderator',
    member: 'Member',
    family_member: 'Family Member',
    volunteer: 'Volunteer',
};

export default function AccessDenied() {
    const navigate = useNavigate();
    const userRole = storage.getUserRole();
    const dashboardPath = ROLE_DASHBOARD[userRole] || '/member/dashboard';
    const roleLabel = ROLE_LABELS[userRole] || userRole;

    return (
        <>
            <style>{`
        .access-denied-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          padding: 20px;
        }
        .access-denied-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 48px 40px;
          max-width: 480px;
          width: 100%;
          text-align: center;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        .access-denied-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #ff416c, #ff4b2b);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          font-size: 36px;
          box-shadow: 0 8px 24px rgba(255, 65, 108, 0.4);
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 8px 24px rgba(255, 65, 108, 0.4); }
          50% { transform: scale(1.05); box-shadow: 0 12px 32px rgba(255, 65, 108, 0.6); }
        }
        .access-denied-title {
          font-size: 28px;
          font-weight: 700;
          color: #fff;
          margin: 0 0 8px;
          letter-spacing: -0.5px;
        }
        .access-denied-code {
          font-size: 14px;
          font-weight: 600;
          color: #ff416c;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 16px;
        }
        .access-denied-message {
          font-size: 15px;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.6;
          margin-bottom: 32px;
        }
        .access-denied-role {
          display: inline-block;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          padding: 8px 16px;
          color: rgba(255, 255, 255, 0.8);
          font-size: 13px;
          margin-bottom: 32px;
        }
        .access-denied-role strong {
          color: #a78bfa;
        }
        .access-denied-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .btn-go-back {
          padding: 14px 24px;
          border: none;
          border-radius: 12px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          letter-spacing: 0.5px;
        }
        .btn-go-back:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
        }
        .btn-dashboard {
          padding: 12px 24px;
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          background: transparent;
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
        }
        .btn-dashboard:hover {
          border-color: rgba(255, 255, 255, 0.4);
          color: white;
          background: rgba(255, 255, 255, 0.05);
        }
        @media (max-width: 480px) {
          .access-denied-card { padding: 32px 24px; }
          .access-denied-title { font-size: 24px; }
        }
      `}</style>

            <div className="access-denied-container">
                <div className="access-denied-card">
                    <div className="access-denied-icon">🔒</div>
                    <div className="access-denied-code">Error 403</div>
                    <h1 className="access-denied-title">Access Denied</h1>
                    <p className="access-denied-message">
                        You don't have permission to view this page.
                        This area is restricted to authorized roles only.
                    </p>
                    <div className="access-denied-role">
                        Your role: <strong>{roleLabel}</strong>
                    </div>
                    <div className="access-denied-actions">
                        <button className="btn-go-back" onClick={() => navigate(dashboardPath)}>
                            Go to My Dashboard
                        </button>
                        <button className="btn-dashboard" onClick={() => navigate(-1)}>
                            ← Go Back
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
