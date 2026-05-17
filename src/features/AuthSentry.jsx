import React, { useState } from 'react';
import { useSovereignStore } from '../store';

/**
 * AuthSentry — Sovereign Access Gate
 * ═══════════════════════════════════════════════════════════════
 * Provides a premium, glassmorphic authentication interface for the
 * PromptHouse Evo Studio. Gates access to the foundry and ensures
 * user profile isolation.
 */
export const AuthSentry = ({ children }) => {
  const { isAuthenticated, login, register, authLoading, authError } = useSovereignStore();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  if (isAuthenticated) return children;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLogin) {
      await login(email, password);
    } else {
      await register(email, password, displayName);
    }
  };

  return (
    <div className="auth-sentry-overlay">
      <div className="auth-sentry-card">
        <div className="auth-sentry-header">
          <div className="auth-sentry-logo">
            <span className="logo-icon">☣️</span>
            <span className="logo-text">SOVEREIGN STUDIO</span>
          </div>
          <h1>{isLogin ? 'Establish Reality' : 'Manifest Identity'}</h1>
          <p>{isLogin ? 'Enter your credentials to access the foundry.' : 'Join the autonomous development revolution.'}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-sentry-form">
          {!isLogin && (
            <div className="form-group">
              <label>DISPLAY NAME</label>
              <input 
                type="text" 
                placeholder="Evo Architect" 
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
            </div>
          )}
          <div className="form-group">
            <label>EMAIL ADDRESS</label>
            <input 
              type="email" 
              placeholder="architect@prompthouse.evo" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>ACCESS KEY</label>
            <input 
              type="password" 
              placeholder="••••••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {authError && <div className="auth-error">{authError}</div>}

          <button type="submit" className="auth-submit-btn" disabled={authLoading}>
            {authLoading ? 'Verifying...' : isLogin ? 'INITIATE LOGIN' : 'SIGN UP'}
          </button>
        </form>

        <div className="auth-sentry-footer">
          <button 
            type="button" 
            className="toggle-mode-btn"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "DON'T HAVE AN IDENTITY? MANIFEST ONE" : "ALREADY ESTABLISHED? LOGIN"}
          </button>
        </div>
      </div>

      <style jsx>{`
        .auth-sentry-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at center, #1a1a2e 0%, #0a0a0a 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          font-family: 'Inter', sans-serif;
        }

        .auth-sentry-card {
          width: 420px;
          padding: 40px;
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          animation: fadeInScale 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        .auth-sentry-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .auth-sentry-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 24px;
        }

        .logo-icon {
          font-size: 24px;
          filter: drop-shadow(0 0 8px rgba(0, 255, 255, 0.5));
        }

        .logo-text {
          font-size: 14px;
          font-weight: 800;
          letter-spacing: 0.2em;
          color: #fff;
          opacity: 0.8;
        }

        h1 {
          font-size: 24px;
          font-weight: 700;
          color: #fff;
          margin: 0 0 8px 0;
          letter-spacing: -0.02em;
        }

        p {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.5);
          margin: 0;
        }

        .auth-sentry-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        label {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.1em;
          color: rgba(255, 255, 255, 0.4);
        }

        input {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 12px 16px;
          border-radius: 12px;
          color: #fff;
          font-size: 14px;
          transition: all 0.2s;
        }

        input:focus {
          outline: none;
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(0, 255, 255, 0.3);
          box-shadow: 0 0 0 4px rgba(0, 255, 255, 0.05);
        }

        .auth-error {
          padding: 12px;
          background: rgba(255, 50, 50, 0.1);
          border: 1px solid rgba(255, 50, 50, 0.2);
          border-radius: 12px;
          color: #ff6b6b;
          font-size: 12px;
          text-align: center;
        }

        .auth-submit-btn {
          margin-top: 12px;
          padding: 14px;
          background: #fff;
          color: #000;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .auth-submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px -10px rgba(255, 255, 255, 0.3);
        }

        .auth-submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .auth-sentry-footer {
          margin-top: 24px;
          text-align: center;
        }

        .toggle-mode-btn {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.4);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: color 0.2s;
        }

        .toggle-mode-btn:hover {
          color: #fff;
        }
      `}</style>
    </div>
  );
};
