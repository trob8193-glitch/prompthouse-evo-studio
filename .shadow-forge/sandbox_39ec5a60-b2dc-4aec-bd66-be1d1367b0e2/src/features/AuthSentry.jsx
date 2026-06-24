import React, { useState, useEffect } from 'react';
import { useSovereignStore } from '../store.js';
import { BRIDGE_URL } from '../config/bridge-config.js';

/**
 * AuthSentry v2 — Evo Studio Access Gate
 * JWT-based auth with Clerk fallback.
 * Shows login/register form when not authenticated.
 */

const PH_AUTH_KEY = 'ph_evo_auth_token';
const PH_USER_KEY = 'ph_evo_user';

function bridgeUrl(path) {
  const configured = import.meta.env.VITE_PROMPTBRIDGE_URL;
  return `${configured || BRIDGE_URL}${path}`;
}

export function useAuth() {
  const isAuthenticated = useSovereignStore((s) => s.isAuthenticated);
  const setAuthenticated = useSovereignStore((s) => s.setAuthenticated);

  const login = (token, user) => {
    localStorage.setItem(PH_AUTH_KEY, token);
    localStorage.setItem(PH_USER_KEY, JSON.stringify(user));
    setAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem(PH_AUTH_KEY);
    localStorage.removeItem(PH_USER_KEY);
    setAuthenticated(false);
  };

  return { isAuthenticated, login, logout };
}

export const AuthSentry = ({ children }) => {
  const isAuthenticated = useSovereignStore((s) => s.isAuthenticated);
  const setAuthenticated = useSovereignStore((s) => s.setAuthenticated);
  const clerkEnabled = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);

  // Check for stored token on mount
  useEffect(() => {
    const token = localStorage.getItem(PH_AUTH_KEY);
    if (token) {
      // Verify token is still valid
      fetch(bridgeUrl('/api/auth/me'), {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(r => r.json())
        .then(data => {
          if (data.ok) setAuthenticated(true);
          else {
            localStorage.removeItem(PH_AUTH_KEY);
            localStorage.removeItem(PH_USER_KEY);
          }
        })
        .catch(() => setAuthenticated(true)); // offline mode: trust local token
    }
  }, []);

  if (isAuthenticated) return <>{children}</>;

  return <AuthGate onSuccess={() => setAuthenticated(true)} />;
};

function AuthGate({ onSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const setAuthenticated = useSovereignStore((s) => s.setAuthenticated);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'register' && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const res = await fetch(bridgeUrl(endpoint), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Authentication failed.');
      localStorage.setItem(PH_AUTH_KEY, data.token);
      localStorage.setItem(PH_USER_KEY, JSON.stringify(data.user));
      onSuccess();
    } catch (err) {
      // If bridge is offline, offer demo mode
      if (err.message.includes('fetch') || err.message.includes('Failed')) {
        setError('Bridge offline. Use Demo Mode to continue locally.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const enterDemoMode = () => {
    localStorage.setItem(PH_AUTH_KEY, 'demo_mode');
    localStorage.setItem(PH_USER_KEY, JSON.stringify({ id: 'demo', email: 'demo@evo.studio', plan: 'pro' }));
    setAuthenticated(true);
  };

  return (
    <div style={styles.overlay}>
      {/* Animated background */}
      <div style={styles.bg} />
      <div style={styles.bgGlow1} />
      <div style={styles.bgGlow2} />

      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoWrap}>
          <div style={styles.logoIcon}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <polygon points="14,2 26,9 26,19 14,26 2,19 2,9" stroke="#00f0ff" strokeWidth="1.5" fill="none"/>
              <circle cx="14" cy="14" r="4" fill="#00f0ff" opacity="0.8"/>
            </svg>
          </div>
          <div>
            <div style={styles.logoTitle}>PROMPTHOUSE</div>
            <div style={styles.logoSub}>EVO STUDIO</div>
          </div>
        </div>

        <h2 style={styles.heading}>
          {mode === 'login' ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p style={styles.subheading}>
          {mode === 'login'
            ? 'Sign in to your sovereign workspace'
            : 'Join the evolution. Build with AI.'}
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={styles.input}
              onFocus={e => e.target.style.borderColor = '#00f0ff'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={8}
              style={styles.input}
              onFocus={e => e.target.style.borderColor = '#00f0ff'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>

          {mode === 'register' && (
            <div style={styles.field}>
              <label style={styles.label}>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={styles.input}
                onFocus={e => e.target.style.borderColor = '#00f0ff'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>
          )}

          {error && (
            <div style={styles.error}>{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ ...styles.primaryBtn, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? '...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div style={styles.divider}>
          <span style={styles.dividerLine} />
          <span style={styles.dividerText}>or</span>
          <span style={styles.dividerLine} />
        </div>

        <button onClick={enterDemoMode} style={styles.demoBtn}>
          Enter Demo Mode
        </button>

        <p style={styles.switchText}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
            style={styles.switchLink}
          >
            {mode === 'login' ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: '#050508',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 9999,
    fontFamily: "'Inter', -apple-system, sans-serif",
    overflow: 'hidden',
  },
  bg: {
    position: 'absolute', inset: 0,
    background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,240,255,0.06) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  bgGlow1: {
    position: 'absolute', width: 600, height: 600,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0,240,255,0.04) 0%, transparent 70%)',
    top: '-200px', left: '-200px', pointerEvents: 'none',
    animation: 'glowPulse 8s ease-in-out infinite',
  },
  bgGlow2: {
    position: 'absolute', width: 400, height: 400,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)',
    bottom: '-100px', right: '-100px', pointerEvents: 'none',
  },
  card: {
    position: 'relative',
    width: 'min(420px, calc(100vw - 32px))',
    padding: '40px 36px',
    background: 'rgba(255,255,255,0.03)',
    backdropFilter: 'blur(24px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 24,
    boxShadow: '0 32px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,240,255,0.05)',
    animation: 'fadeInUp 0.5s cubic-bezier(0.16,1,0.3,1)',
  },
  logoWrap: {
    display: 'flex', alignItems: 'center', gap: 12,
    marginBottom: 28,
  },
  logoIcon: {
    width: 44, height: 44,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(0,240,255,0.08)',
    border: '1px solid rgba(0,240,255,0.2)',
    borderRadius: 12,
  },
  logoTitle: {
    fontSize: 11, fontWeight: 900,
    letterSpacing: '0.2em', color: '#fff',
  },
  logoSub: {
    fontSize: 10, fontWeight: 600,
    letterSpacing: '0.15em', color: 'rgba(0,240,255,0.7)',
  },
  heading: {
    margin: '0 0 6px', fontSize: 26, fontWeight: 800,
    color: '#fff', letterSpacing: '-0.02em',
  },
  subheading: {
    margin: '0 0 28px', fontSize: 13,
    color: 'rgba(255,255,255,0.45)',
  },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: {
    fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
    color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase',
  },
  input: {
    padding: '12px 14px', borderRadius: 10,
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff', fontSize: 14, outline: 'none',
    transition: 'border-color 0.2s',
    fontFamily: 'inherit',
  },
  error: {
    padding: '10px 14px', borderRadius: 10,
    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
    color: '#f87171', fontSize: 12, fontWeight: 600,
  },
  primaryBtn: {
    padding: '14px', borderRadius: 12,
    background: 'linear-gradient(135deg, #00f0ff, #7c3aed)',
    border: 'none', color: '#000', fontSize: 14, fontWeight: 900,
    cursor: 'pointer', letterSpacing: '0.04em',
    transition: 'opacity 0.2s, transform 0.1s',
    marginTop: 4,
  },
  divider: {
    display: 'flex', alignItems: 'center', gap: 12,
    margin: '20px 0',
  },
  dividerLine: {
    flex: 1, height: 1,
    background: 'rgba(255,255,255,0.08)',
  },
  dividerText: {
    fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 600,
  },
  demoBtn: {
    width: '100%', padding: '12px',
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12, color: 'rgba(255,255,255,0.6)',
    fontSize: 13, fontWeight: 700, cursor: 'pointer',
    transition: 'all 0.2s',
    fontFamily: 'inherit',
  },
  switchText: {
    textAlign: 'center', fontSize: 12,
    color: 'rgba(255,255,255,0.35)', marginTop: 20, marginBottom: 0,
  },
  switchLink: {
    background: 'none', border: 'none',
    color: '#00f0ff', cursor: 'pointer',
    fontSize: 12, fontWeight: 700,
    fontFamily: 'inherit',
  },
};

export default AuthSentry;
