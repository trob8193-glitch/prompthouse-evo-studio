/**
 * PH EVO STUDIO — Auth Routes
 * /api/auth/register  POST
 * /api/auth/login     POST
 * /api/auth/me        GET  (requires JWT)
 * /api/auth/refresh   POST
 */

import { registerUser, loginUser, getUserById, verifyToken } from '../services/auth-service.js';

export function registerAuthRoutes(app) {
  // ── REGISTER ───────────────────────────────────────────────────
  app.post('/api/auth/register', async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ ok: false, error: 'Email and password are required.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ ok: false, error: 'Password must be at least 8 characters.' });
    }
    try {
      const { user, token } = await registerUser(email, password);
      return res.status(201).json({ ok: true, user, token });
    } catch (err) {
      return res.status(409).json({ ok: false, error: err.message });
    }
  });

  // ── LOGIN ──────────────────────────────────────────────────────
  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ ok: false, error: 'Email and password are required.' });
    }
    try {
      const { user, token } = await loginUser(email, password);
      return res.json({ ok: true, user, token });
    } catch (err) {
      return res.status(401).json({ ok: false, error: err.message });
    }
  });

  // ── ME (verify token) ──────────────────────────────────────────
  app.get('/api/auth/me', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ ok: false, error: 'Not authenticated.' });
    }
    try {
      const decoded = verifyToken(authHeader.slice(7));
      const user = getUserById(decoded.id);
      if (!user) return res.status(404).json({ ok: false, error: 'User not found.' });
      return res.json({ ok: true, user });
    } catch {
      return res.status(401).json({ ok: false, error: 'Invalid or expired token.' });
    }
  });

  // ── LOGOUT (client-side clears token, this just confirms) ─────
  app.post('/api/auth/logout', (_req, res) => {
    return res.json({ ok: true, message: 'Logged out. Clear your local token.' });
  });
}
