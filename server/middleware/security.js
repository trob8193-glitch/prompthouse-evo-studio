/**
 * PH EVO STUDIO — Security Hardening Middleware
 * Helmet-equivalent HTTP headers, CSRF protection, input validation, request tracing.
 */
import crypto from 'crypto';
import { Log } from '../../src/core/autonomy/SovereignLogger.js';

// ─── HELMET-EQUIVALENT SECURITY HEADERS ──────────────────────
export function securityHeaders(_req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  res.removeHeader('X-Powered-By');
  next();
}

// ─── CSRF PROTECTION ─────────────────────────────────────────
const csrfTokens = new Map();
const CSRF_MAX_AGE = 3600_000; // 1 hour

export function csrfGenerate(req, res, next) {
  const token = crypto.randomBytes(32).toString('hex');
  const sessionId = req.headers['x-session-id'] || req.ip || 'anonymous';
  csrfTokens.set(token, { sessionId, createdAt: Date.now() });

  // Cleanup old tokens
  for (const [t, meta] of csrfTokens) {
    if (Date.now() - meta.createdAt > CSRF_MAX_AGE) csrfTokens.delete(t);
  }

  res.setHeader('X-CSRF-Token', token);
  next();
}

export function csrfVerify(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  if (process.env.CSRF_DISABLED === 'true') return next();

  const token = req.headers['x-csrf-token'];
  if (!token || !csrfTokens.has(token)) {
    return res.status(403).json({ success: false, error: 'Invalid or missing CSRF token.' });
  }
  csrfTokens.delete(token);
  next();
}

// ─── INPUT VALIDATION (lightweight zod-like) ─────────────────
export function validateBody(schema) {
  return (req, res, next) => {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ success: false, error: 'Request body must be JSON.' });
    }
    const errors = [];
    for (const [field, rule] of Object.entries(schema)) {
      const value = req.body[field];
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push(`${field} is required.`);
        continue;
      }
      if (value !== undefined && rule.type && typeof value !== rule.type) {
        errors.push(`${field} must be of type ${rule.type}.`);
      }
      if (value !== undefined && rule.maxLength && String(value).length > rule.maxLength) {
        errors.push(`${field} exceeds max length of ${rule.maxLength}.`);
      }
      if (value !== undefined && rule.pattern && !rule.pattern.test(String(value))) {
        errors.push(`${field} has invalid format.`);
      }
    }
    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }
    next();
  };
}

// ─── REQUEST TRACING / CORRELATION IDS ───────────────────────
export function requestTracing(req, res, next) {
  const correlationId = req.headers['x-request-id'] || crypto.randomUUID();
  req.correlationId = correlationId;
  res.setHeader('X-Request-Id', correlationId);
  res.setHeader('X-Response-Time-Start', Date.now().toString());

  const startTime = process.hrtime.bigint();
  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startTime) / 1_000_000;
    if (durationMs > 5000) {
      Log.warn(`[Tracing] Slow request: ${req.method} ${req.path} took ${durationMs.toFixed(0)}ms [${correlationId}]`);
    }
  });

  next();
}
