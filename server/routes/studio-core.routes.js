import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import fetch from 'node-fetch';
import { runModuleMaturityAudit, writeModuleMaturityReceipt } from '../../src/core/maturity/index.js';
import { listReviews } from '../../src/core/proof/ReviewStore.js';
import { evaluateCostVelocity } from '../../src/core/gateway/CostVelocityMonitor.js';
import { UniversalAIAdaptor } from '../../lib/ai/UniversalAIAdaptor.js';
import { PromptCompressor } from '../../lib/ai/PromptCompressor.js';
import { TruthGate } from '../../src/core/truth/TruthGate.js';
import { hasExplicitOwnerApproval, getApprovalBlockReason } from '../../src/owner-approval.js';

const OLLAMA_BASE = 'http://localhost:11434';

const DATA_DIR = () => path.join(process.cwd(), '.prompthouse-data');
const USERS_FILE = () => path.join(DATA_DIR(), 'users.json');
const CONFIG_FILE = () => path.join(DATA_DIR(), 'config.json');
const LEDGER_FILE = () => path.join(DATA_DIR(), 'sovereign-ledger.jsonl');
const RIFT_URL = process.env.RIFT_URL || 'http://127.0.0.1:3002';

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

function latestJsonIn(dir) {
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir).filter(name => name.endsWith('.json')).sort();
  const latest = files.at(-1);
  if (!latest) return null;
  const file = path.join(dir, latest);
  return { file, data: readJson(file, null) };
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

async function fetchRiftJson(pathname) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 2500);
  try {
    const response = await fetch(`${RIFT_URL}${pathname}`, { signal: controller.signal });
    const data = await response.json();
    return { ok: response.ok, status: response.status, data };
  } finally {
    clearTimeout(timer);
  }
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

  app.get('/api/runtime-health', (_req, res) => {
    const maturity = runModuleMaturityAudit({ rootDir: process.cwd() });
    const reviews = listReviews({ rootDir: process.cwd(), limit: 10 });
    const velocity = evaluateCostVelocity({ rootDir: process.cwd(), orgId: 'studio_owner' });
    const latestRoute = latestJsonIn(path.join(DATA_DIR(), 'routes'));
    res.json({
      success: true,
      truthState: latestRoute?.data?.truthState || 'RUNTIME_HEALTH_READY',
      checkedAt: new Date().toISOString(),
      bridge: { truthState: 'RECOVERY_BRIDGE_READY' },
      maturity: { averageScore: maturity.averageScore, moduleCount: maturity.moduleCount, truthState: maturity.truthState },
      reviews: { count: reviews.length, latest: reviews[0] || null },
      costVelocity: velocity,
      routeVerification: latestRoute,
      proofDocs: {
        proofLedger: Boolean(readDoc('docs/proof-ledger-summary.md')),
        maturity: Boolean(readDoc('docs/module-maturity-status.md')),
        selfEvolution: Boolean(readDoc('docs/self-evolution-readiness.md'))
      }
    });
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

  app.post('/api/auth/logout', (req, res) => {
    const auth = req.headers.authorization || '';
    const token = auth.replace(/^Bearer\s+/i, '');
    const users = readJson(USERS_FILE(), []);
    const nextUsers = users.map(user => (
      user.token === token ? { ...user, token: safeToken(user.email) } : user
    ));
    if (token) writeJson(USERS_FILE(), nextUsers);
    res.json({ success: true, truthState: 'AUTH_SESSION_CLEARED' });
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

  app.post('/api/commerce/checkout', async (req, res) => {
    const { approval, priceId, successUrl, cancelUrl, quantity = 1 } = req.body || {};
    if (!hasExplicitOwnerApproval(approval, 'commerce')) {
      return res.status(403).json({
        success: false,
        truthState: 'OWNER_APPROVAL_REQUIRED',
        error: getApprovalBlockReason('commerce')
      });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(503).json({
        success: false,
        truthState: 'PROVIDER_GATED',
        error: 'STRIPE_SECRET_KEY missing.'
      });
    }

    if (!priceId || !successUrl || !cancelUrl) {
      return res.status(400).json({
        success: false,
        truthState: 'CHECKOUT_INPUT_REQUIRED',
        error: 'priceId, successUrl, and cancelUrl are required.'
      });
    }

    try {
      const Stripe = (await import('stripe')).default;
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: [{ price: priceId, quantity: Number(quantity) || 1 }],
        success_url: successUrl,
        cancel_url: cancelUrl
      });
      res.json({ success: true, truthState: 'CHECKOUT_SESSION_CREATED', id: session.id, url: session.url });
    } catch (error) {
      res.status(502).json({ success: false, truthState: 'CHECKOUT_PROVIDER_ERROR', error: error.message });
    }
  });

  app.post('/api/studio-os/proof/intercept', (req, res) => {
    const payload = req.body || {};
    const entry = {
      id: `proof_${Date.now()}`,
      createdAt: new Date().toISOString(),
      digest: crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex'),
      payload
    };
    const proofFile = path.join(DATA_DIR(), 'proof-intercepts.jsonl');
    fs.writeFileSync(proofFile, `${JSON.stringify(entry)}\n`, { flag: 'a', encoding: 'utf8' });
    res.json({ success: true, truthState: 'PROOF_INTERCEPT_RECORDED', entry });
  });

  app.post('/api/maintenance/run', (_req, res) => {
    const receipt = writeModuleMaturityReceipt({ rootDir: process.cwd() });
    res.json({ success: true, truthState: 'MAINTENANCE_COMPLETE', receipt: receipt.file, report: receipt.report });
  });

  app.get('/api/truth/probe', (_req, res) => {
    const maturity = runModuleMaturityAudit({ rootDir: process.cwd() });
    res.json({ success: true, truthState: 'TRUTH_PROBE_READY', results: { averageScore: maturity.averageScore, moduleCount: maturity.moduleCount, blockers: maturity.blockers.slice(0, 25) } });
  });

  app.post('/api/evo-lm/chat', async (req, res) => {
    const { messages = [], systemPrompt = '' } = req.body;
    
    let processedSystemPrompt = systemPrompt;
    if (systemPrompt.length > 200) {
      const compressor = new PromptCompressor();
      processedSystemPrompt = await compressor.compress(systemPrompt);
    }
  
    const ollamaModels = ['evo-lm', 'llama3', 'mistral', 'phi3', 'gemma'];
  
    for (const model of ollamaModels) {
      try {
        const ollamaMessages = processedSystemPrompt
          ? [{ role: 'system', content: processedSystemPrompt }, ...messages]
          : messages;
        const response = await fetch(`${OLLAMA_BASE}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model, messages: ollamaMessages, stream: false }),
          signal: AbortSignal.timeout(30000),
        });
        if (!response.ok) continue;
        const data = await response.json();
        const content = data.message?.content || data.response || '';
        
        // Activate Guardrails
        const truthGate = new TruthGate();
        truthGate.enforce(content, 'Evo LM Chat');
  
        if (content) return res.json({ message: content, model, transport: 'evo_lm_ollama' });
      } catch (err) { 
        console.warn(`⚠️ [Ollama] Failed for model ${model}:`, err.message);
        continue; 
      }
    }
  
    // Fallback to primary AI provider
    try {
      const config = readJson(CONFIG_FILE(), {});
      const keys = config.keys || {};
      const ai = new UniversalAIAdaptor(keys);
      const msgs = processedSystemPrompt
        ? [{ role: 'system', content: processedSystemPrompt }, ...messages]
        : messages;
      
      const response = await ai.generate(msgs, 'auto');
      const truthGate = new TruthGate();
      truthGate.enforce(response.text, 'Evo LM Cloud Fallback');
      
      res.json({ message: response.text, model: response.model, transport: 'universal_ai_adaptor' });
    } catch (fallbackErr) {
      res.status(500).json({ error: 'All AI bridges failed', details: fallbackErr.message });
    }
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

  app.get('/api/rift/status', async (_req, res) => {
    try {
      const rift = await fetchRiftJson('/status');
      res.status(rift.ok ? 200 : 502).json({ success: rift.ok, truthState: rift.ok ? 'RIFT_PROXY_READY' : 'RIFT_PROXY_UPSTREAM_ERROR', data: rift.data });
    } catch (error) {
      res.status(503).json({ success: false, truthState: 'RIFT_PROXY_OFFLINE', error: error.message, data: null });
    }
  });

  app.get('/api/evopulse/nodes', async (_req, res) => {
    try {
      const rift = await fetchRiftJson('/api/evopulse/nodes');
      res.status(rift.ok ? 200 : 502).json(rift.data);
    } catch (error) {
      res.status(503).json({ success: false, truthState: 'EVOPULSE_NODES_OFFLINE', error: error.message, data: { nodes: [] } });
    }
  });

  app.get('/api/evopulse/routes', async (_req, res) => {
    try {
      const rift = await fetchRiftJson('/api/evopulse/routes');
      res.status(rift.ok ? 200 : 502).json(rift.data);
    } catch (error) {
      res.status(503).json({ success: false, truthState: 'EVOPULSE_ROUTES_OFFLINE', error: error.message, data: { routes: [] } });
    }
  });
}

export default registerStudioCoreRoutes;
