import jwt from 'jsonwebtoken';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { hasExplicitOwnerApproval, getApprovalBlockReason } from '../../owner-approval.js';

const JWT_SECRET = process.env.JWT_SECRET || '';
const REQUIRE_AUTH_FOR_MUTATIONS = process.env.REQUIRE_AUTH_MUTATIONS !== 'false';
const DATA_DIR = join(process.cwd(), '.prompthouse-data');
const AUTH_TOKENS_FILE = join(DATA_DIR, 'revoked_tokens.json');

function ensureJsonWebTokenSecret() {
  if (!JWT_SECRET || JWT_SECRET.length < 24) {
    throw new Error('JWT_SECRET is missing or too short. Configure a 24+ char secret.');
  }
}

function loadRevokedTokens() {
  if (!existsSync(AUTH_TOKENS_FILE)) return [];
  try {
    const data = JSON.parse(readFileSync(AUTH_TOKENS_FILE, 'utf8'));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function saveRevokedTokens(tokens = []) {
  writeFileSync(AUTH_TOKENS_FILE, JSON.stringify(tokens.slice(-10000), null, 2), 'utf8');
}

function createAuthToken({ userId, email, role = 'user' }) {
  ensureJsonWebTokenSecret();
  return jwt.sign({ sub: userId, email, role }, JWT_SECRET, { expiresIn: '7d' });
}

function verifyAuthToken(token) {
  ensureJsonWebTokenSecret();
  return jwt.verify(token, JWT_SECRET);
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : '';
  if (!token) return res.status(401).json({ error: 'Missing bearer token.' });

  const revoked = loadRevokedTokens();
  if (revoked.includes(token)) return res.status(401).json({ error: 'Token revoked.' });

  try {
    const payload = verifyAuthToken(token);
    req.user = payload;
    return next();
  } catch (e) {
    return res.status(401).json({ error: `Invalid token: ${e.message}` });
  }
}

function requireMasterKey(req, res, next) {
  const headerKey = String(req.headers['x-master-key'] || '');
  const configured = String(process.env.PH_EVO_MASTER_KEY || '');
  if (!configured) return res.status(503).json({ error: 'Master key not configured on server.' });
  if (!headerKey || headerKey !== configured) return res.status(403).json({ error: 'Invalid master key.' });
  return next();
}

function requireAuthOrMaster(req, res, next) {
  const headerKey = String(req.headers['x-master-key'] || '');
  const configured = String(process.env.PH_EVO_MASTER_KEY || '');
  if (configured && headerKey && headerKey === configured) return next();
  return requireAuth(req, res, next);
}

function maybeRequireAuthOrMaster(req, res, next) {
  if (!REQUIRE_AUTH_FOR_MUTATIONS) return next();
  return requireAuthOrMaster(req, res, next);
}

function attachOptionalAuthUser(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : '';
  if (!token) return;
  try {
    req.user = verifyAuthToken(token);
  } catch {
    // Optional auth should not fail route execution.
  }
}

function requireOwnerApprovalScope(scope) {
  return (req, res, next) => {
    const ownerApproval = req.body?.ownerApproval || {};
    if (!hasExplicitOwnerApproval(ownerApproval, scope)) {
      return res.status(403).json({ blocked: true, error: getApprovalBlockReason(scope) });
    }
    return next();
  };
}

function enforceJsonObjectBody(req, res, next) {
  const body = req.body;
  if (!body || Array.isArray(body) || typeof body !== 'object') {
    return res.status(400).json({ error: 'Request body must be a JSON object.' });
  }
  return next();
}

export {
  ensureJsonWebTokenSecret,
  loadRevokedTokens,
  saveRevokedTokens,
  createAuthToken,
  verifyAuthToken,
  requireAuth,
  requireMasterKey,
  requireAuthOrMaster,
  maybeRequireAuthOrMaster,
  attachOptionalAuthUser,
  requireOwnerApprovalScope,
  enforceJsonObjectBody
};
