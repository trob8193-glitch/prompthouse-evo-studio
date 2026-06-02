import express from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export default function createAuthRouter({
  db,
  authRateLimit,
  enforceJsonObjectBody,
  sanitizeEmail,
  sanitizeDisplayName,
  createAuthToken,
  requireAuth,
  loadRevokedTokens,
  saveRevokedTokens
}) {
  const router = express.Router();

  router.post('/register', authRateLimit, enforceJsonObjectBody, async (req, res) => {
    try {
      const email = sanitizeEmail(req.body?.email);
      const password = String(req.body?.password || '');
      const displayName = sanitizeDisplayName(req.body?.displayName || '');

      if (!email || !email.includes('@')) return res.status(400).json({ error: 'Valid email is required.' });
      if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });

      const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
      if (existing) return res.status(409).json({ error: 'User already exists.' });

      const id = crypto.randomUUID();
      const passwordHash = await bcrypt.hash(password, 10);
      db.prepare('INSERT INTO users (id, email, display_name, role, password_hash) VALUES (?, ?, ?, ?, ?)')
        .run(id, email, displayName || null, 'user', passwordHash);

      const token = createAuthToken({ userId: id, email, role: 'user' });
      return res.status(201).json({
        success: true,
        user: { id, email, displayName, role: 'user' },
        token
      });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  });

  router.post('/login', authRateLimit, enforceJsonObjectBody, async (req, res) => {
    try {
      const email = sanitizeEmail(req.body?.email);
      const password = String(req.body?.password || '');
      if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

      const user = db.prepare('SELECT id, email, display_name, role, password_hash FROM users WHERE email = ?').get(email);
      if (!user || !user.password_hash) return res.status(401).json({ error: 'Invalid credentials.' });

      const passwordValid = await bcrypt.compare(password, user.password_hash);
      if (!passwordValid) return res.status(401).json({ error: 'Invalid credentials.' });

      const token = createAuthToken({ userId: user.id, email: user.email, role: user.role || 'user' });
      return res.json({
        success: true,
        user: { id: user.id, email: user.email, displayName: user.display_name, role: user.role || 'user' },
        token
      });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  });

  router.get('/me', requireAuth, (req, res) => {
    try {
      const user = db.prepare('SELECT id, email, display_name, role FROM users WHERE id = ?').get(req.user.sub);
      if (!user) return res.status(404).json({ error: 'User not found.' });
      return res.json({
        success: true,
        user: { id: user.id, email: user.email, displayName: user.display_name, role: user.role || 'user' }
      });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  });

  router.post('/logout', authRateLimit, requireAuth, (req, res) => {
    try {
      const header = req.headers.authorization || '';
      const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : '';
      const revoked = loadRevokedTokens();
      revoked.push(token);
      saveRevokedTokens(revoked);
      return res.json({ success: true });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  });

  return router;
}
