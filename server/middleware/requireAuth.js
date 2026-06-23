/**
 * PH EVO STUDIO — Auth Middleware
 * Verifies JWT or Clerk tokens on protected routes.
 */
import jwt from 'jsonwebtoken';
import { Log } from '../../src/core/autonomy/SovereignLogger.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

export function requireAuth(req, res, next) {
  if (process.env.REQUIRE_AUTH !== 'true') return next();

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Missing or invalid Authorization header.' });
  }

  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    Log.warn(`[Auth] Token verification failed: ${err.message}`);
    return res.status(401).json({ success: false, error: 'Invalid or expired token.' });
  }
}

export function requireMasterKey(req, res, next) {
  const key = req.headers['x-master-key'] || req.query.masterKey;
  if (!process.env.PH_EVO_MASTER_KEY) return next();
  if (key !== process.env.PH_EVO_MASTER_KEY) {
    return res.status(403).json({ success: false, error: 'Invalid master key.' });
  }
  next();
}

export function optionalAuth(req, _res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      req.user = jwt.verify(authHeader.slice(7), JWT_SECRET);
    } catch {}
  }
  next();
}
