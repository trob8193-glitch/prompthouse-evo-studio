import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { runModuleMaturityAudit, writeModuleMaturityReceipt } from '../../src/core/maturity/index.js';
import { listReviews } from '../../src/core/proof/ReviewStore.js';
import { evaluateCostVelocity } from '../../src/core/gateway/CostVelocityMonitor.js';

const DATA_DIR = () => path.join(process.cwd(), '.prompthouse-data');
const USERS_FILE = () => path.join(DATA_DIR(), 'users.json');
const CONFIG_FILE = () => path.join(DATA_DIR(), 'config.json');
const LEDGER_FILE = () => path.join(DATA_DIR(), 'sovereign-ledger.jsonl');

function ensureDataDir() {
  fs.mkdirSync(DATA_DIR(), { recursive: true });
}

function readJson(file, fallback) {
  try {
    return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2), 'utf8');
}

function safeToken(email) {
  return crypto.createHash('sha256').update(`${email}:${Date.now()}:${Math.random()}`).digest('hex');
}

function publicUser(user) {
  if (!user) return null;
  return { id: user.id, email: user.email, displayName: user.displayName || user.email, role: user.role || 'owner' };
}

function readDoc(relPath) {
  const full = path.join(process.cwd(), relPath);
  if (!fs.existsSync(full)) return null;
  return fs.readFileSync(full, 'utf8');
}

export function registerStudioCoreRoutes(app) {
  ensureDataDir();

  app.get('/status', (_req, res) => {
    res.json({ success: true, service: 'PromptBridge Recovery Runtime', truthState: 'RECOVERY_BRIDGE_READY', checkedAt: new Date().toISOString() });
  });

  app.get('/api/metrics', (_req, res) => {
    const maturity = runModuleMaturityAudit({ rootDir: process.cwd() });
    const reviews = listReviews({ rootDir: process.cwd(), limit: 25 });
    const velocity = evaluateCostVelocity({ rootDir: process.cwd(), orgId: 'studio_owner' });
    res.json({ success: true, truthState: 'METRICS_READY', maturity, reviewCount: reviews.length, costVelocity: velocity, checkedAt: new Date().toISOString() });
  });

  app.post('/api/auth/register', (req, res) => {
    const { email, password, displayName } = req.body || {};
    if (!email || !password) return res.status(400).json({ success: false, error: 'email and password are required' });
    const users = readJson(USERS_FILE(), []);
    if (users.some(user => user.email === email)) return res.status(409).json({ success: false, error: 'account already exists' });
    const user = { id: `user_${Date.now()}`, email, displayName: displayName || email, role: 'owner', token: safeToken(email), createdAt: new Date().toISOString() };
    users.push(user);
    writeJson(USERS_FILE(), users);
    res.json({ success: true, token: user.token, user: publicUser(user) });
  });

  app.post('/api/auth/login', (req, res) => {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ success: false, error: 'email is required' });
    const users = readJson(USERS_FILE(), []);
    let user = users.find(item => item.email === email);
    if (!user) {
      user = { id: `user_${Date.now()}`, email, displayName: email, role: 'owner', token: safeToken(email), createdAt: new Date().toISOString() };
      users.push(user);
      writeJson(USERS_FILE(), users);
    }
    res.json({ success: true, token: user.token, user: publicUser(user) });
  });

  app.get('/api/auth/me', (req, res) => {
    const auth = req.headers.authorization || '';
    const token = auth.replace(/^Bearer\s+/i, '');
    const users = readJson(USERS_FILE(), []);
    const user = users.find(item => item.token === token) || users[0] || null;
    if (!user) return res.status(401).json({ success: false, error: 'not authenticated' });
    res.json({ success: true, user: publicUser(user) });
  });

  app.post('/api/config/keys', (req, res) => {
    const current = readJson(CONFIG_FILE(), {});
    const keys = req.body?.keys || {};
    const saved = { ...current, keys: { ...(current.keys || {}), ...keys }, updatedAt: new Date().toISOString() };
    writeJson(CONFIG_FILE(), saved);
    res.json({ success: true, truthState: 'CONFIG_KEYS_SAVED', savedKeys: Object.keys(keys) });
  });

  app.post('/api/sovereign-ledger/log', (req, res) => {
    const entry = { id: `ledger_${Date.now()}`, ...(req.body || {}), createdAt: new Date().toISOString() };
    fs.writeFileSync(LEDGER_FILE(), `${JSON.stringify(entry)}\n`, { flag: 'a', encoding: 'utf8' });
    res.json({ success: true, truthState: 'LEDGER_ENTRY_RECORDED', entry });
  });

  app.post('/api/maintenance/run', (_req, res) => {
    const receipt = writeModuleMaturityReceipt({ rootDir: process.cwd() });
    res.json({ success: true, truthState: 'MAINTENANCE_COMPLETE', receipt: receipt.file, report: receipt.report });
  });

  app.get('/api/truth/probe', (_req, res) => {
    const maturity = runModuleMaturityAudit({ rootDir: process.cwd() });
    res.json({ success: true, truthState: 'TRUTH_PROBE_READY', results: { averageScore: maturity.averageScore, moduleCount: maturity.moduleCount, blockers: maturity.blockers.slice(0, 25) } });
  });

  app.post('/api/evo-lm/chat', (req, res) => {
    const messages = Array.isArray(req.body?.messages) ? req.body.messages : [];
    const last = messages.at(-1)?.content || '';
    res.json({ success: true, truth_state: 'LOCAL_CHAT_FALLBACK_READY', message: `Local bridge fallback received: ${last.slice(0, 600)}` });
  });

  app.get('/api/reviews', (_req, res) => {
    res.json({ success: true, truthState: 'REVIEWS_READY', reviews: listReviews({ rootDir: process.cwd(), limit: 100 }) });
  });

  app.get('/api/proof-docs', (_req, res) => {
    res.json({
      success: true,
      truthState: 'PROOF_DOCS_READY',
      docs: {
        proofLedger: readDoc('docs/proof-ledger-summary.md'),
        maturity: readDoc('docs/module-maturity-status.md'),
        selfEvolution: readDoc('docs/self-evolution-readiness.md')
      }
    });
  });
}

export default registerStudioCoreRoutes;
