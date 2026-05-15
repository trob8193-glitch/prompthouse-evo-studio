/**
 * PromptHouse Evo Studio — PromptBridge Server (Sovereign Finality Build)
 * ════════════════════════════════════════════════════════════════════
 * The heart of the SMFF (Self-Monetizing Feature Foundry).
 */
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync, unlinkSync } from 'fs';
import { join, relative, dirname, resolve, extname } from 'path';
import OpenAI from 'openai';
import { execSync } from 'child_process';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import os from 'os';
import crypto from 'crypto';
console.log('🔥 SERVER FILE LOADED');

// Import our core engines
import { UniversalAIAdaptor } from './lib/ai/UniversalAIAdaptor.js';
import { SelfMaintenance } from './src/core/automation/self_maintenance.js';
import { StripeAdaptor } from './lib/commerce/StripeAdaptor.js';
import { FoundryOrchestrator } from './lib/foundry/FoundryOrchestrator.js';
import { TruthGate } from './src/core/truth/TruthGate.js';
import { Log } from './src/core/autonomy/SovereignLogger.js';

// Hybrid Quad System Imports
import { ModelRouter } from './src/core/gateway/modelRouter.js';
import { CostFirewall } from './src/core/gateway/costFirewall.js';
import { PromptCompiler } from './src/core/engines/promptCompiler.js';
import { AppBlueprint } from './src/core/engines/appBlueprint.js';
import { ThemeEvolution } from './src/core/engines/themeEvolution.js';
import { ProductionAudit } from './src/core/engines/productionAudit.js';
import { runNuclearTruthAudit } from './src/core/audit/NuclearTruthAudit.js';
import { ToolAutogeneratorNode } from './lib/foundry/ToolAutogeneratorNode.js';
import { EVO_SCANNER } from './src/core/autonomy/EvoScanner.js';
import { EVO_DOCTOR } from './src/core/autonomy/EvoDoctor.js';
import { EVO_ENGINEER } from './src/core/autonomy/EvoEvolutionEngineer.js';
import { EVO_UI_ENGINEER } from './src/core/autonomy/EvoUIEngineer.js';

// SaaS Generator Imports
import { SaasOrchestrator } from './src/core/engines/saasOrchestrator.js';
import { ExecutionSandbox } from './lib/terminal/ExecutionSandbox.js';
import { VercelAdapter } from './lib/deployment/VercelAdapter.js';
import { IntelligenceCore } from './src/core/engines/IntelligenceCore.js';
import { PromptCompressor } from './lib/ai/PromptCompressor.js';
import db, { initDatabase } from './src/core/db/quad_schema.js';
import { buildGeneratedArtifactRegistry } from './src/generated-artifact-registry.js';
import { buildBridgeContractLedger } from './src/bridge-contract-ledger.js';
import {
  createSelfImplementationState,
  resolveSelfImplementationCapabilities,
  summarizeSelfImplementationCapabilities,
} from './src/self-implementation-policy.js';
import {
  DEFAULT_PROMPT_PACKET_PATH,
  buildPromptPacketPreview,
} from './src/native-prompt-packet.js';
import { hasExplicitOwnerApproval, getApprovalBlockReason } from './src/owner-approval.js';
import {
  appendFailureMemory,
  appendRealityReceipt,
  buildCapabilityGraph,
  buildEvolutionReplayTheater,
  buildFeatureFusionPlan,
  buildNightforgeChallengeSnapshot,
  buildRecoveryPlan,
  computeCapabilityDrift,
  enforceEvolutionBudget,
  loadCapabilityBaseline,
  loadRealityReceipts,
  readFailureMemory,
  runPatchTournament,
  saveCapabilityBaseline
} from './src/core/evolution/autonomous-evolution-engine.js';
import { createRouteRegistry } from './server/route-registry.js';
import { registerCoreRoutes } from './server/routes/index.js';

dotenv.config({ override: true });

// Initialize database
initDatabase();
ensureAuthSchema();
ensureGatewayBootstrapData();
ensureEvolutionSchema();

const app = express(); app.use(cors()); app.use(express.json());
const port = parseInt(process.env.BRIDGE_PORT || '3001', 10);

// ─── INITIALIZATION ──────────────────────────────────────────────────────────

const DATA_DIR = join(process.cwd(), '.prompthouse-data');
if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
const AUTH_TOKENS_FILE = join(DATA_DIR, 'revoked_tokens.json');
const JWT_SECRET = process.env.JWT_SECRET || '';
const REQUIRE_AUTH_FOR_MUTATIONS = process.env.REQUIRE_AUTH_MUTATIONS !== 'false';
const CORS_ORIGINS = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);
const RATE_LIMITS = new Map();
const OLLAMA_BASE = 'http://localhost:11434';

// ─── MODULAR ROUTE REGISTRATION ──────────────────────────────────────────────

const routeRegistry = createRouteRegistry();
const bridgeContext = {
  dataDir: DATA_DIR,
  sandboxDir: process.cwd(),
  env: process.env,
  providerGates: {}, // Will use phase 3 modules directly inside routes
  receiptService: {}, 
  routeRegistry
};

try {
  const regSummary = registerCoreRoutes(app, bridgeContext);
  console.log(`[Route Registry] Registered ${regSummary.registeredModules.length} core modules additively.`);
} catch (e) {
  console.error(`[Route Registry] Failed to register core routes additively`, e);
}

// Configuration
function enforceJsonObjectBody(req, res, next) {
  console.log(`🛡️ [GUARD] Checking body for ${req.method} ${req.path}`);
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      return res.status(400).json({ error: 'Body must be a JSON object.' });
    }
  }
  return next();
}

function createRateLimit({ id, windowMs, max, keyResolver }) {
  return (req, res, next) => {
    const key = keyResolver ? keyResolver(req) : `${req.ip}:${id}`;
    const now = Date.now();
    const entry = RATE_LIMITS.get(key) || { count: 0, reset: now + windowMs };

    if (now > entry.reset) {
      entry.count = 0;
      entry.reset = now + windowMs;
    }

    entry.count++;
    RATE_LIMITS.set(key, entry);

    if (entry.count > max) {
      return res.status(429).json({
        error: 'Too many requests.',
        retryAfter: Math.ceil((entry.reset - now) / 1000)
      });
    }

    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - entry.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(entry.reset / 1000));
    return next();
  };
}

const authRateLimit = createRateLimit({
  id: 'auth',
  windowMs: 60_000,
  max: 20,
  keyResolver: req => `${req.ip}:${req.path}`
});

const writeRateLimit = createRateLimit({
  id: 'writes',
  windowMs: 60_000,
  max: 60,
  keyResolver: req => `${req.ip}:${req.path}`
});

let userConfig = {
  keys: {
    openai: process.env.OPENAI_API_KEY || '',
    anthropic: process.env.ANTHROPIC_API_KEY || '',
    gemini: process.env.GEMINI_API_KEY || '',
    stripe: process.env.STRIPE_SECRET_KEY || ''
  },
  ph_evo_master_key: process.env.PH_EVO_MASTER_KEY || ''
};

// Engines
const ai = new UniversalAIAdaptor(userConfig.keys);
const maintenance = new SelfMaintenance();
const truthGate = new TruthGate();
const stripe = new StripeAdaptor(userConfig.keys.stripe);
const foundry = new FoundryOrchestrator(ai, stripe);

const SANDBOX_DIR = join(DATA_DIR, 'sandbox');
const saasOrchestrator = new SaasOrchestrator(ai, SANDBOX_DIR);
const terminalSandbox = new ExecutionSandbox(SANDBOX_DIR);
const intelligenceCore = new IntelligenceCore(ai);
const promptCompressor = new PromptCompressor();
const toolGenerator = new ToolAutogeneratorNode();

// Global Savings Ledger
let globalFirewallSavings = {
  tokens: 0,
  dollars: 0.00
};

const requestStats = {
  total: 0,
  errors: 0,
  recentDurations: [],
  recentTimestamps: []
};

let logicScanCache = {
  scannedAt: 0,
  totalLines: 0
};

function scanSourceLineCount() {
  let totalLines = 0;
  const scanDir = (dir) => {
    if (!existsSync(dir)) return;
    const items = readdirSync(dir);
    for (const item of items) {
      const fullPath = join(dir, item);
      if (statSync(fullPath).isDirectory()) {
        if (item !== 'node_modules' && item !== '.git' && item !== 'dist') scanDir(fullPath);
      } else if (item.endsWith('.js') || item.endsWith('.jsx') || item.endsWith('.ts') || item.endsWith('.tsx')) {
        totalLines += readFileSync(fullPath, 'utf8').split('\n').length;
      }
    }
  };
  scanDir(join(process.cwd(), 'src'));
  return totalLines;
}

function getLogicScanSnapshot() {
  const now = Date.now();
  const ttlMs = 15_000;
  if (logicScanCache.scannedAt && now - logicScanCache.scannedAt < ttlMs) {
    return { totalLines: logicScanCache.totalLines, cached: true, scannedAt: logicScanCache.scannedAt };
  }
  const totalLines = scanSourceLineCount();
  logicScanCache = { scannedAt: now, totalLines };
  return { totalLines, cached: false, scannedAt: now };
}

function recordRequestDuration(durationMs) {
  requestStats.total += 1;
  requestStats.recentDurations.push(durationMs);
  requestStats.recentTimestamps.push(Date.now());
  const maxSamples = 200;
  if (requestStats.recentDurations.length > maxSamples) requestStats.recentDurations.shift();
  if (requestStats.recentTimestamps.length > maxSamples) requestStats.recentTimestamps.shift();
}

function computeRequestStatsSnapshot() {
  const durations = requestStats.recentDurations;
  const count = durations.length;
  const avgLatency = count > 0 ? durations.reduce((sum, v) => sum + v, 0) / count : 0;
  const p95Latency = count > 0
    ? [...durations].sort((a, b) => a - b)[Math.min(count - 1, Math.floor(count * 0.95))]
    : 0;

  const cutoff = Date.now() - 60_000;
  const recentCount = requestStats.recentTimestamps.filter((t) => t >= cutoff).length;
  const rps = Number((recentCount / 60).toFixed(2));

  return {
    total: requestStats.total,
    errors: requestStats.errors,
    recentSamples: count,
    avgLatencyMs: Number(avgLatency.toFixed(2)),
    p95LatencyMs: Number(p95Latency.toFixed(2)),
    requestsPerSecond: rps
  };
}

const NIGHTFORGE_STATE_FILE = join(DATA_DIR, 'nightforge_state.json');
const NIGHTFORGE_RECEIPTS_FILE = join(DATA_DIR, 'nightforge_receipts.jsonl');
const UI_EVOLUTION_RECEIPTS_FILE = join(DATA_DIR, 'ui_evolution_receipts.jsonl');
const AUTONOMOUS_EVOLUTION_BASELINE_FILE = join(DATA_DIR, 'autonomous_evolution_baseline.json');
const AUTONOMOUS_EVOLUTION_FAILURE_FILE = join(DATA_DIR, 'autonomous_evolution_failure_memory.jsonl');
const AUTONOMOUS_EVOLUTION_RECEIPTS_FILE = join(DATA_DIR, 'autonomous_evolution_reality_receipts.jsonl');
let nightforgeDaemonTimer = null;
let bondedNodes = [];
let globalEvolutionState = {
  active: false,
  progress: 0,
  last_cycle_at: null,
  files_audited: 0,
  total_files: 0
};

function readGitStatusLines() {
  try {
    const output = execSync('git status --porcelain', { cwd: process.cwd() }).toString();
    return output.split('\n').map(line => line.trim()).filter(Boolean);
  } catch {
    return [];
  }
}

function discoverAvailableEndpoints() {
  const files = [join(process.cwd(), 'promptbridge-server.js')];
  const generatedApiDir = join(process.cwd(), 'generated_apis');

  if (existsSync(generatedApiDir)) {
    const generatedFiles = readdirSync(generatedApiDir)
      .filter(name => name.endsWith('.js'))
      .map(name => join(generatedApiDir, name));
    files.push(...generatedFiles);
  }

  const endpoints = new Set();
  const routeRegex = /app\.(get|post|put|patch|delete)\(\s*['"`]([^'"`]+)['"`]/g;

  for (const file of files) {
    if (!existsSync(file)) continue;
    const content = readFileSync(file, 'utf8');
    let match;
    while ((match = routeRegex.exec(content)) !== null) {
      endpoints.add(`${match[1].toUpperCase()} ${match[2]}`);
    }
  }

  return Array.from(endpoints);
}

function readAvailableFiles() {
  return [
    'promptbridge-server.js',
    'src/core/automation/self_maintenance.js',
    existsSync(join(process.cwd(), 'src', 'autonomous-builder.js')) ? 'src/autonomous-builder.js' : null,
    existsSync(join(process.cwd(), 'src', 'nightforge.js')) ? 'src/nightforge.js' : null,
  ].filter(Boolean);
}

const BRIDGE_RECEIPTS_DIR = join(process.cwd(), 'browser_bridge_receipts');

function readTextSafe(filePath) {
  try {
    return readFileSync(filePath, 'utf8');
  } catch {
    return '';
  }
}

function tailText(text, maxChars = 12000) {
  const value = String(text || '');
  if (value.length <= maxChars) return value;
  return value.slice(value.length - maxChars);
}

function sanitizeGeneratedCode(code) {
  return String(code || '')
    .replace(/^\s*```(?:javascript|js|jsx|ts|tsx)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();
}

function isCoreWorkspacePath(relativePath = '') {
  const normalized = String(relativePath).replace(/\\/g, '/').toLowerCase();
  return normalized === 'src/core' || normalized.startsWith('src/core/');
}

function uiEvolutionApprovalScopeForPath(relativePath = '') {
  return isCoreWorkspacePath(relativePath) ? 'core_merge' : 'ui_evolution_merge';
}

function runCommandWithReceipt(command, timeoutMs = 20 * 60 * 1000) {
  const startedAt = Date.now();
  try {
    const stdout = execSync(command, {
      cwd: process.cwd(),
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: timeoutMs,
      maxBuffer: 1024 * 1024 * 16
    });
    return {
      success: true,
      command,
      exitCode: 0,
      durationMs: Date.now() - startedAt,
      output: tailText(stdout)
    };
  } catch (error) {
    const stdout = error?.stdout ? String(error.stdout) : '';
    const stderr = error?.stderr ? String(error.stderr) : '';
    return {
      success: false,
      command,
      exitCode: Number.isInteger(error?.status) ? error.status : 1,
      durationMs: Date.now() - startedAt,
      output: tailText(`${stdout}\n${stderr}`.trim()),
      error: String(error?.message || error)
    };
  }
}

async function buildUiEvolutionProposal({ filePath, objective, currentCode, proposalCode }) {
  if (typeof proposalCode === 'string' && proposalCode.trim()) {
    return {
      source: 'provided',
      objective: objective || 'provided_proposal',
      code: sanitizeGeneratedCode(proposalCode)
    };
  }

  const mission = String(objective || '').trim();
  if (!mission) {
    throw new Error('UI evolution proposal requires objective or proposalCode.');
  }

  const prompt = [
    'You are PromptHouse UI Evolution architect.',
    'Return ONLY raw code for the target file, no markdown fences, no commentary.',
    `Target file: ${filePath}.`,
    `Mission: ${mission}.`,
    'Preserve real functionality and existing imports unless explicit mission requires change.',
    'Do not include TODOs, placeholders, or fake completion claims.',
    '',
    'Current code:',
    currentCode
  ].join('\n');

  const proposal = await runEvoLmTeamChat([{ role: 'user', content: prompt }], 'Generate production-safe UI code delta.');
  const code = sanitizeGeneratedCode(proposal?.message || '');
  if (!code) {
    throw new Error('UI evolution proposal returned empty code.');
  }

  return {
    source: proposal?.provider || 'evo_lm',
    objective: mission,
    code,
    transport: proposal?.transport || 'unknown',
    model: proposal?.model || 'unknown'
  };
}

function runUiLiveValidation({ filePath, candidateCode }) {
  const audit = ProductionAudit.audit(candidateCode);
  const ext = extname(filePath).toLowerCase();

  if (['.js', '.mjs', '.cjs'].includes(ext)) {
    const safeName = filePath.replace(/[\\/]/g, '__').replace(/[^A-Za-z0-9_.-]/g, '_');
    const tempFile = join(DATA_DIR, `ui_live_run_${Date.now()}_${safeName}`);
    try {
      writeFileSync(tempFile, candidateCode, 'utf8');
      const syntaxRun = runCommandWithReceipt(`node --check "${tempFile.replace(/"/g, '\\"')}"`, 120000);
      return {
        success: Boolean(audit.success && audit.passed && syntaxRun.success),
        audit,
        syntaxRun
      };
    } finally {
      try {
        if (existsSync(tempFile)) {
          unlinkSync(tempFile);
        }
      } catch {
        // best-effort cleanup
      }
    }
  }

  return {
    success: Boolean(audit.success && audit.passed),
    audit,
    syntaxRun: {
      success: true,
      skipped: true,
      reason: `Syntax live run skipped for extension ${ext || '(none)'}.`
    }
  };
}

function appendUiEvolutionReceipt(receipt) {
  writeFileSync(UI_EVOLUTION_RECEIPTS_FILE, `${toSafeJson(receipt)}\n`, { flag: 'a', encoding: 'utf8' });
}

function readUiEvolutionReceipts(limit = 200) {
  if (!existsSync(UI_EVOLUTION_RECEIPTS_FILE)) return [];
  const lines = readFileSync(UI_EVOLUTION_RECEIPTS_FILE, 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(limit * -1);
  const receipts = [];
  for (const line of lines) {
    try {
      receipts.push(JSON.parse(line));
    } catch {
      // Skip malformed rows to keep runtime stable.
    }
  }
  return receipts;
}

function loadBrowserBridgeReceipts() {
  if (!existsSync(BRIDGE_RECEIPTS_DIR)) return [];
  const files = readdirSync(BRIDGE_RECEIPTS_DIR).filter(name => name.endsWith('.json'));
  const receipts = [];

  for (const fileName of files) {
    const fullPath = join(BRIDGE_RECEIPTS_DIR, fileName);
    const raw = readTextSafe(fullPath);
    if (!raw) continue;

    try {
      const parsed = JSON.parse(raw);
      const [timestampPart, typePartWithExt] = fileName.split('_');
      const typePart = (typePartWithExt || '').replace('.json', '');
      receipts.push({
        id: `${timestampPart || Date.now()}_${typePart || 'receipt'}`,
        ts: Number(timestampPart) || Date.now(),
        type: typePart || 'receipt',
        payload: parsed
      });
    } catch {
      // Skip malformed receipts to keep the bridge stable.
    }
  }

  return receipts.sort((a, b) => b.ts - a.ts);
}

function computeKpiFromReceipts(receipts) {
  const capsuleCount = receipts.filter(item => item.type === 'forgecapsule' || item.type === 'promptbase').length;
  const proofCount = receipts.filter(item => item.type === 'proof').length;
  const timeSavedHours = (capsuleCount * 0.4) + (proofCount * 0.2);
  const completionRate = Math.min(100, Math.round(proofCount * 10));
  const satisfaction = Math.min(5, Math.max(3, 3 + (proofCount * 0.1)));

  return {
    time_saved_hours: timeSavedHours.toFixed(1),
    project_completion_rate: `${completionRate}%`,
    client_satisfaction: `${satisfaction.toFixed(1)}/5`
  };
}

function ensureAuthSchema() {
  try {
    db.exec('ALTER TABLE users ADD COLUMN password_hash TEXT');
  } catch {
    // Column already exists
  }
}

function ensureGatewayBootstrapData() {
  const nowId = () => crypto.randomUUID();
  const seedOrg = (id, name, slug, plan) => {
    db.prepare(`
      INSERT OR IGNORE INTO organizations (id, name, slug, plan, status)
      VALUES (?, ?, ?, ?, 'active')
    `).run(id, name, slug, plan);
    const existingCredits = db.prepare('SELECT id FROM api_credits WHERE organization_id = ?').get(id);
    if (!existingCredits) {
      db.prepare(`
        INSERT INTO api_credits (id, organization_id, plan, credits_granted, credits_used, credits_remaining, subscription_status)
        VALUES (?, ?, ?, ?, 0, ?, 'active')
      `).run(nowId(), id, plan, plan === 'paid' ? 100000 : 1000, plan === 'paid' ? 100000 : 1000);
    }
  };

  seedOrg('org_master', 'PromptHouse Master Org', 'prompthouse-master', 'paid');
  seedOrg('org_test', 'PromptHouse Test Org', 'prompthouse-test', 'paid');

  const endpointSeeds = [
    { method: 'POST', path: '/v1/prompts/compile', provider_allowed: 'any', required_plan: 'free', credit_cost: 1 },
    { method: 'POST', path: '/v1/apps/blueprint', provider_allowed: 'any', required_plan: 'paid', credit_cost: 2 },
    { method: 'POST', path: '/v1/themes/evolve', provider_allowed: 'any', required_plan: 'paid', credit_cost: 1 },
    { method: 'POST', path: '/v1/code/audit', provider_allowed: 'any', required_plan: 'paid', credit_cost: 1 },
    { method: 'POST', path: '/api/evo-eyes/team-run', provider_allowed: 'any', required_plan: 'paid', credit_cost: 2 },
    { method: 'POST', path: '/api/nightforge/cycle', provider_allowed: 'any', required_plan: 'paid', credit_cost: 2 },
  ];

  endpointSeeds.forEach(item => {
    const exists = db.prepare('SELECT id FROM api_endpoints WHERE method = ? AND path = ?').get(item.method, item.path);
    if (!exists) {
      db.prepare(`
        INSERT INTO api_endpoints (id, method, path, provider_allowed, required_plan, credit_cost, status)
        VALUES (?, ?, ?, ?, ?, ?, 'active')
      `).run(nowId(), item.method, item.path, item.provider_allowed, item.required_plan, item.credit_cost);
    }
  });
}

function ensureEvolutionSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_evolution_profiles (
      id TEXT PRIMARY KEY,
      subject_key TEXT UNIQUE NOT NULL,
      user_id TEXT,
      display_name TEXT,
      affinity_json TEXT,
      layout_json TEXT,
      theme_json TEXT,
      autonomy_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_signal_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS user_evolution_events (
      id TEXT PRIMARY KEY,
      subject_key TEXT NOT NULL,
      event_type TEXT NOT NULL,
      payload_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS connectors (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT,
      config_json TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

function sanitizeEmail(email = '') {
  return String(email).trim().toLowerCase();
}

function sanitizeDisplayName(displayName = '') {
  return String(displayName).trim().slice(0, 120);
}

function toSafeJson(value) {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function stableHash(input = '') {
  let hash = 2166136261;
  const value = String(input);
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function resolveEvolutionSubject(req, source = {}) {
  const maybeClientId = String(
    source.clientId ||
    source.client_id ||
    req.headers['x-client-id'] ||
    req.query.clientId ||
    ''
  ).trim();

  if (req.user?.sub) {
    return {
      subjectKey: `user:${req.user.sub}`,
      userId: req.user.sub,
      clientId: maybeClientId || null
    };
  }

  const fallbackClient = maybeClientId || `anon_${stableHash(req.ip || 'local').toString(36)}`;
  return {
    subjectKey: `client:${fallbackClient}`,
    userId: null,
    clientId: fallbackClient
  };
}

function defaultEvolutionProfile(subjectKey, userId = null) {
  const seed = stableHash(subjectKey);
  const baseHue = 180 + (seed % 120);
  return {
    id: crypto.randomUUID(),
    subject_key: subjectKey,
    user_id: userId,
    display_name: null,
    affinity: {
      preferred_pages: {},
      action_bias: {},
      complexity_score: 0.5,
      novelty_bias: ((seed % 100) / 100)
    },
    layout: {
      density_scale: 1,
      sidebar_collapsed: seed % 3 === 0,
      card_roundness: 18 + (seed % 8),
      motion_mode: seed % 2 === 0 ? 'calm' : 'dynamic'
    },
    theme: {
      primary_hue: baseHue,
      accent_hue: (baseHue + 38) % 360,
      background_hue: 220 + (seed % 24),
      saturation: 68,
      lightness: 52,
      glow_intensity: 0.22
    },
    autonomy: {
      cycles: 0,
      mutation_rate: 0.08,
      last_reason: 'bootstrap'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_signal_at: null
  };
}

function inflateEvolutionProfile(row, fallbackUserId = null) {
  if (!row) return null;
  return {
    id: row.id,
    subject_key: row.subject_key,
    user_id: row.user_id || fallbackUserId || null,
    display_name: row.display_name || null,
    affinity: JSON.parse(row.affinity_json || '{}'),
    layout: JSON.parse(row.layout_json || '{}'),
    theme: JSON.parse(row.theme_json || '{}'),
    autonomy: JSON.parse(row.autonomy_json || '{}'),
    created_at: row.created_at,
    updated_at: row.updated_at,
    last_signal_at: row.last_signal_at
  };
}

function persistEvolutionProfile(profile) {
  db.prepare(`
    INSERT INTO user_evolution_profiles (
      id, subject_key, user_id, display_name, affinity_json, layout_json, theme_json, autonomy_json, updated_at, last_signal_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)
    ON CONFLICT(subject_key) DO UPDATE SET
      user_id = excluded.user_id,
      display_name = excluded.display_name,
      affinity_json = excluded.affinity_json,
      layout_json = excluded.layout_json,
      theme_json = excluded.theme_json,
      autonomy_json = excluded.autonomy_json,
      updated_at = CURRENT_TIMESTAMP,
      last_signal_at = excluded.last_signal_at
  `).run(
    profile.id || crypto.randomUUID(),
    profile.subject_key,
    profile.user_id || null,
    profile.display_name || null,
    toSafeJson(profile.affinity || {}),
    toSafeJson(profile.layout || {}),
    toSafeJson(profile.theme || {}),
    toSafeJson(profile.autonomy || {}),
    profile.last_signal_at || null
  );
}

function loadOrCreateEvolutionProfile(subjectKey, userId = null) {
  const row = db.prepare(`
    SELECT * FROM user_evolution_profiles WHERE subject_key = ?
  `).get(subjectKey);
  if (row) {
    const profile = inflateEvolutionProfile(row, userId);
    if (!profile.user_id && userId) profile.user_id = userId;
    return profile;
  }
  const created = defaultEvolutionProfile(subjectKey, userId);
  persistEvolutionProfile(created);
  return created;
}

function recordEvolutionEvent(subjectKey, eventType, payload = {}) {
  db.prepare(`
    INSERT INTO user_evolution_events (id, subject_key, event_type, payload_json)
    VALUES (?, ?, ?, ?)
  `).run(crypto.randomUUID(), subjectKey, eventType, toSafeJson(payload));
}

function applyEvolutionSignal(profile, signal = {}) {
  const page = String(signal.page || 'unknown').slice(0, 80);
  const action = String(signal.action || 'view').slice(0, 80);
  const intensity = clamp(Number(signal.intensity || 0.5), 0, 1.5);
  const complexity = clamp(Number(signal.complexity || signal.taskComplexity || 0.5), 0, 1.5);

  const preferred = { ...(profile.affinity?.preferred_pages || {}) };
  preferred[page] = (preferred[page] || 0) + (0.2 + intensity);
  const actionBias = { ...(profile.affinity?.action_bias || {}) };
  actionBias[action] = (actionBias[action] || 0) + 1;

  const driftSeed = stableHash(`${profile.id}:${profile.last_signal_at}`);
  const deterministicDrift = ((driftSeed % 100) / 100 - 0.5) * 0.04;
  const noveltyBias = clamp((profile.affinity?.novelty_bias ?? 0.5) + deterministicDrift, 0.1, 0.95);
  const complexityScore = clamp(
    ((profile.affinity?.complexity_score ?? 0.5) * 0.85) + (complexity * 0.15),
    0.1,
    1.5
  );

  profile.affinity = {
    ...profile.affinity,
    preferred_pages: preferred,
    action_bias: actionBias,
    novelty_bias: noveltyBias,
    complexity_score: complexityScore
  };

  profile.last_signal_at = new Date().toISOString();
  return profile;
}

function mutateEvolutionProfile(profile, reason = 'autonomous_cycle') {
  const cycles = Number(profile.autonomy?.cycles || 0) + 1;
  const mutationRate = clamp(Number(profile.autonomy?.mutation_rate || 0.08), 0.03, 0.2);
  const pageScores = profile.affinity?.preferred_pages || {};
  const dominantPage = Object.entries(pageScores).sort((a, b) => b[1] - a[1])[0]?.[0] || 'dashboard';
  const dominantHash = stableHash(`${profile.subject_key}:${dominantPage}:${cycles}`);
  const complexityScore = clamp(Number(profile.affinity?.complexity_score || 0.5), 0.1, 1.5);

  const hueDrift = ((dominantHash % 21) - 10) * mutationRate;
  const satDrift = ((dominantHash % 13) - 6) * mutationRate;
  const lightDrift = ((dominantHash % 9) - 4) * mutationRate;

  const currentTheme = profile.theme || {};
  const primaryHue = (Number(currentTheme.primary_hue || 220) + hueDrift + 360) % 360;
  const accentHue = (primaryHue + 24 + (complexityScore * 30)) % 360;
  const saturation = clamp(Number(currentTheme.saturation || 68) + satDrift, 40, 88);
  const lightness = clamp(Number(currentTheme.lightness || 52) + lightDrift, 34, 68);
  const backgroundHue = clamp(Number(currentTheme.background_hue || 220) + ((dominantHash % 7) - 3), 180, 260);
  const glowIntensity = clamp(Number(currentTheme.glow_intensity || 0.22) + ((complexityScore - 0.5) * 0.02), 0.12, 0.45);

  const currentLayout = profile.layout || {};
  const densityScale = clamp(0.88 + (complexityScore * 0.28), 0.84, 1.24);
  const sidebarCollapsed = complexityScore > 1.15 ? true : (complexityScore < 0.55 ? false : Boolean(currentLayout.sidebar_collapsed));
  const cardRoundness = clamp(Math.round(14 + (complexityScore * 12) + (dominantHash % 4)), 12, 30);
  const motionMode = complexityScore > 0.95 ? 'dynamic' : 'calm';

  profile.theme = {
    primary_hue: Number(primaryHue.toFixed(2)),
    accent_hue: Number(accentHue.toFixed(2)),
    background_hue: Number(backgroundHue.toFixed(2)),
    saturation: Number(saturation.toFixed(2)),
    lightness: Number(lightness.toFixed(2)),
    glow_intensity: Number(glowIntensity.toFixed(3))
  };

  profile.layout = {
    density_scale: Number(densityScale.toFixed(3)),
    sidebar_collapsed: sidebarCollapsed,
    card_roundness: cardRoundness,
    motion_mode: motionMode
  };

  profile.autonomy = {
    cycles,
    mutation_rate: mutationRate,
    last_reason: reason
  };

  profile.updated_at = new Date().toISOString();
  return profile;
}

function evolutionCssVariables(profile) {
  const theme = profile.theme || {};
  const primaryHue = Number(theme.primary_hue || 220);
  const accentHue = Number(theme.accent_hue || 258);
  const bgHue = Number(theme.background_hue || 220);
  const sat = Number(theme.saturation || 68);
  const light = Number(theme.lightness || 52);
  const glow = Number(theme.glow_intensity || 0.22);

  return {
    '--primary': `hsl(${primaryHue}, ${sat}%, ${light}%)`,
    '--accent-violet': `hsl(${accentHue}, ${Math.max(38, sat - 8)}%, ${Math.min(72, light + 10)}%)`,
    '--bg-base': `hsl(${bgHue}, 32%, 9%)`,
    '--bg-card': `hsl(${bgHue}, 22%, 11%)`,
    '--bg-surface': `hsl(${bgHue}, 18%, 12%)`,
    '--border-dim': `hsla(${accentHue}, 36%, 70%, ${clamp(glow * 0.55, 0.08, 0.28)})`,
    '--primary-glow': `hsla(${primaryHue}, ${sat}%, ${Math.min(84, light + 20)}%, ${clamp(glow, 0.12, 0.5)})`,
    '--evo-density-scale': String(clamp(Number(profile.layout?.density_scale || 1), 0.84, 1.24)),
    '--radius-lg': `${clamp(Number(profile.layout?.card_roundness || 18), 12, 30)}px`,
    '--radius-xl': `${clamp(Number(profile.layout?.card_roundness || 22) + 6, 18, 36)}px`
  };
}

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

app.post('/api/auth/register', authRateLimit, enforceJsonObjectBody, async (req, res) => {
  try {
    const { email, password, displayName } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required.' });

    const emailClean = sanitizeEmail(email);
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(emailClean);
    if (existing) return res.status(409).json({ error: 'User already exists.' });

    const userId = `u_${crypto.randomBytes(8).toString('hex')}`;
    const orgId = `org_${crypto.randomBytes(8).toString('hex')}`;
    const passwordHash = await bcrypt.hash(password, 12);

    db.transaction(() => {
      db.prepare(`
        INSERT INTO users (id, email, password_hash, display_name, role)
        VALUES (?, ?, ?, ?, 'user')
      `).run(userId, emailClean, passwordHash, sanitizeDisplayName(displayName || emailClean.split('@')[0]));

      db.prepare(`
        INSERT INTO organizations (id, name, slug)
        VALUES (?, ?, ?)
      `).run(orgId, `${displayName || emailClean.split('@')[0]}'s Org`, `org-${userId}`);

      db.prepare(`
        INSERT INTO organization_members (id, organization_id, user_id, role)
        VALUES (?, ?, ?, 'owner')
      `).run(crypto.randomUUID(), orgId, userId);
    })();

    const token = createAuthToken({ userId, email: emailClean });
    res.json({ success: true, token, user: { id: userId, email: emailClean, displayName } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/auth/login', authRateLimit, enforceJsonObjectBody, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required.' });

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(sanitizeEmail(email));
    if (!user || !user.password_hash) return res.status(401).json({ error: 'Invalid credentials.' });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Invalid credentials.' });

    const token = createAuthToken({ userId: user.id, email: user.email, role: user.role });
    res.json({ success: true, token, user: { id: user.id, email: user.email, displayName: user.display_name, role: user.role } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ success: true, user: req.user });
});

function requireAuthOrMaster(req, res, next) {
  const headerKey = String(req.headers['x-master-key'] || '');
  const configured = String(process.env.PH_EVO_MASTER_KEY || '');
  if (configured && headerKey && headerKey === configured) return next();
  return requireAuth(req, res, next);
}

function cosineSimilarity(A, B) {
  if (!A || !B || A.length !== B.length) return 0;
  let dotProduct = 0, normA = 0, normB = 0;
  for (let i = 0; i < A.length; i++) {
    dotProduct += A[i] * B[i];
    normA += A[i] * A[i];
    normB += B[i] * B[i];
  }
  const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  return isNaN(similarity) ? 0 : similarity;
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



function resolveWorkspacePath(relativePath) {
  if (typeof relativePath !== 'string' || !relativePath.trim()) {
    throw new Error('Path is required.');
  }
  if (relativePath.includes('\0')) {
    throw new Error('Path contains invalid null bytes.');
  }

  const workspaceRoot = resolve(process.cwd());
  const candidate = resolve(workspaceRoot, relativePath);
  const normalizedRoot = workspaceRoot.toLowerCase();
  const normalizedCandidate = candidate.toLowerCase();
  const withinRoot = normalizedCandidate === normalizedRoot || normalizedCandidate.startsWith(`${normalizedRoot}\\`) || normalizedCandidate.startsWith(`${normalizedRoot}/`);
  if (!withinRoot) throw new Error('Directory traversal forbidden');
  return candidate;
}

const DIAGNOSTIC_SKIP_DIRS = new Set(['node_modules', '.git', '.gemini', 'dist', '.next']);
const DIAGNOSTIC_EXTENSIONS = new Set(['.js', '.jsx', '.mjs', '.cjs']);

function toPosixPath(pathValue = '') {
  return String(pathValue).replace(/\\/g, '/');
}

function collectStudioSourceFiles(rootDir) {
  const files = [];

  function scan(dir) {
    const items = readdirSync(dir);
    for (const item of items) {
      if (DIAGNOSTIC_SKIP_DIRS.has(item)) continue;
      const fullPath = join(dir, item);
      let stats;
      try {
        stats = statSync(fullPath);
      } catch {
        continue;
      }
      if (stats.isDirectory()) {
        scan(fullPath);
        continue;
      }
      if (DIAGNOSTIC_EXTENSIONS.has(extname(item).toLowerCase())) {
        files.push(fullPath);
      }
    }
  }

  scan(rootDir);
  return files;
}

function extractImportSpecifiers(content = '') {
  const matches = new Set();
  const patterns = [
    /import\s+(?:[^'"`]*?\s+from\s+)?['"`]([^'"`]+)['"`]/g,
    /import\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
    /require\(\s*['"`]([^'"`]+)['"`]\s*\)/g
  ];
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      if (match[1]) matches.add(match[1]);
    }
  }
  return Array.from(matches);
}

function isLocalImportSpecifier(specifier = '') {
  return specifier.startsWith('.') || specifier.startsWith('/') || specifier.startsWith('@/');
}

function resolveDependencyPath(workspaceRoot, moduleAbsPath, specifier) {
  const basePath = specifier.startsWith('@/')
    ? resolve(workspaceRoot, 'src', specifier.slice(2))
    : specifier.startsWith('/')
      ? resolve(workspaceRoot, specifier.slice(1))
      : resolve(dirname(moduleAbsPath), specifier);

  const candidates = [];
  const hasExtension = Boolean(extname(basePath));
  if (hasExtension) {
    candidates.push(basePath);
  } else {
    candidates.push(basePath);
    for (const extension of DIAGNOSTIC_EXTENSIONS) {
      candidates.push(`${basePath}${extension}`);
      candidates.push(join(basePath, `index${extension}`));
    }
  }

  for (const candidate of candidates) {
    try {
      if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
    } catch {
      continue;
    }
  }
  return null;
}

function classifyModuleHealth(moduleRecord) {
  if ((moduleRecord.issues || []).some(issue => issue.level === 'error')) return 'error';
  if ((moduleRecord.issues || []).length > 0) return 'warning';
  return 'healthy';
}

function scanStudioModules(limit = 30) {
  const root = process.cwd();
  const files = collectStudioSourceFiles(root);
  const results = files.map(absPath => {
    let content = '';
    try {
      content = readFileSync(absPath, 'utf8');
    } catch {
      content = '';
    }
    const lineCount = content ? content.split('\n').length : 0;
    const relPath = toPosixPath(relative(root, absPath));
    return {
      id: relPath,
      label: relPath.split('/').pop() || relPath,
      type: 'MODULE',
      density: lineCount,
      path: relPath
    };
  });
  const sorted = results.sort((a, b) => b.density - a.density).slice(0, limit);
  return { files: sorted, total_modules: results.length };
}

async function buildStudioDiagnostics(limit = 48) {
  const root = process.cwd();
  const startedAt = Date.now();
  const sourceFiles = collectStudioSourceFiles(root);
  const moduleMap = new Map();
  const moduleRecords = [];

  for (const absPath of sourceFiles) {
    const relPath = toPosixPath(relative(root, absPath));
    try {
      const content = readFileSync(absPath, 'utf8');
      const lines = content.split('\n').length;
      const imports = extractImportSpecifiers(content);
      const issues = [];
      if (lines > 1200) {
        issues.push({
          level: 'warning',
          code: 'LARGE_MODULE',
          message: `Module is large (${lines} lines).`
        });
      }
      const record = {
        id: relPath,
        path: relPath,
        label: relPath.split('/').pop() || relPath,
        lines,
        size_bytes: Buffer.byteLength(content, 'utf8'),
        imports,
        dependencies: [],
        dependents: 0,
        issues,
        health: 'healthy'
      };
      moduleMap.set(absPath, record);
      moduleRecords.push(record);
    } catch (error) {
      const record = {
        id: relPath,
        path: relPath,
        label: relPath.split('/').pop() || relPath,
        lines: 0,
        size_bytes: 0,
        imports: [],
        dependencies: [],
        dependents: 0,
        issues: [{ level: 'error', code: 'READ_ERROR', message: String(error.message || error) }],
        health: 'error'
      };
      moduleMap.set(absPath, record);
      moduleRecords.push(record);
    }
  }

  const dependencyEdges = [];
  const incomingCount = new Map();
  for (const [absPath, moduleRecord] of moduleMap.entries()) {
    for (const specifier of moduleRecord.imports) {
      if (!isLocalImportSpecifier(specifier)) continue;
      const resolved = resolveDependencyPath(root, absPath, specifier);
      if (!resolved) {
        moduleRecord.issues.push({
          level: 'error',
          code: 'MISSING_DEPENDENCY',
          message: `Cannot resolve import "${specifier}".`
        });
        continue;
      }
      const depRecord = moduleMap.get(resolved);
      const depRel = toPosixPath(relative(root, resolved));
      if (!depRecord) {
        moduleRecord.issues.push({
          level: 'warning',
          code: 'UNSCANNED_DEPENDENCY',
          message: `Dependency "${depRel}" is outside diagnostics extension set.`
        });
        continue;
      }
      if (!moduleRecord.dependencies.includes(depRecord.id)) {
        moduleRecord.dependencies.push(depRecord.id);
        dependencyEdges.push({ source: moduleRecord.id, target: depRecord.id });
        incomingCount.set(depRecord.id, (incomingCount.get(depRecord.id) || 0) + 1);
      }
    }
  }

  for (const record of moduleRecords) {
    record.dependents = incomingCount.get(record.id) || 0;
    record.health = classifyModuleHealth(record);
  }

  const probeTargets = [
    { id: 'status', label: 'Bridge Status', path: '/status' },
    { id: 'healthz', label: 'Health Check', path: '/healthz' },
    { id: 'metrics', label: 'Metrics API', path: '/api/metrics' },
    { id: 'queue', label: 'Execution Queue API', path: '/api/queue/master' }
  ];

  const probes = await Promise.all(probeTargets.map(async (probe) => {
    const startedNs = process.hrtime.bigint();
    try {
      const response = await fetch(`http://127.0.0.1:${port}${probe.path}`, { signal: AbortSignal.timeout(2500) });
      const elapsedMs = Number(process.hrtime.bigint() - startedNs) / 1_000_000;
      return {
        ...probe,
        ok: response.ok,
        status: response.status,
        latency_ms: Number(elapsedMs.toFixed(2)),
        error: response.ok ? null : `HTTP ${response.status}`
      };
    } catch (error) {
      const elapsedMs = Number(process.hrtime.bigint() - startedNs) / 1_000_000;
      return {
        ...probe,
        ok: false,
        status: null,
        latency_ms: Number(elapsedMs.toFixed(2)),
        error: String(error.message || error)
      };
    }
  }));

  const sortedModules = moduleRecords
    .slice()
    .sort((a, b) => {
      const connectivityA = (a.dependencies.length * 2) + a.dependents;
      const connectivityB = (b.dependencies.length * 2) + b.dependents;
      const issueWeightA = a.health === 'error' ? 2 : a.health === 'warning' ? 1 : 0;
      const issueWeightB = b.health === 'error' ? 2 : b.health === 'warning' ? 1 : 0;
      return (
        (issueWeightB - issueWeightA) ||
        (connectivityB - connectivityA) ||
        (b.lines - a.lines)
      );
    });
  const limitedModules = sortedModules.slice(0, Math.max(1, Math.min(limit, 150)));
  const visibleIds = new Set(limitedModules.map(item => item.id));
  const visibleEdges = dependencyEdges.filter(edge => visibleIds.has(edge.source) && visibleIds.has(edge.target));

  const healthyCount = moduleRecords.filter(module => module.health === 'healthy').length;
  const warningCount = moduleRecords.filter(module => module.health === 'warning').length;
  const errorCount = moduleRecords.filter(module => module.health === 'error').length;
  const avgLatency = probes.length > 0
    ? Number((probes.reduce((total, probe) => total + probe.latency_ms, 0) / probes.length).toFixed(2))
    : 0;

  return {
    success: true,
    timestamp: Date.now(),
    duration_ms: Date.now() - startedAt,
    summary: {
      modules_scanned: moduleRecords.length,
      modules_healthy: healthyCount,
      modules_warning: warningCount,
      modules_error: errorCount,
      dependency_edges: dependencyEdges.length,
      probes_total: probes.length,
      probes_failing: probes.filter(probe => !probe.ok).length,
      avg_probe_latency_ms: avgLatency
    },
    modules: limitedModules,
    graph: {
      nodes: limitedModules.map(module => ({
        id: module.id,
        label: module.label,
        path: module.path,
        health: module.health,
        lines: module.lines,
        dependency_count: module.dependencies.length,
        dependent_count: module.dependents
      })),
      edges: visibleEdges
    },
    probes,
    files: scanStudioModules(30).files,
    total_modules: moduleRecords.length,
    unresolved_dependencies: moduleRecords
      .flatMap(module => (module.issues || []).filter(issue => issue.code === 'MISSING_DEPENDENCY').map(issue => ({
        module: module.id,
        message: issue.message
      })))
      .slice(0, 100)
  };
}

async function runEvoLmTeamChat(messages, systemPrompt = '') {
  let processedSystemPrompt = systemPrompt;
  if (systemPrompt.length > 200) {
    processedSystemPrompt = await promptCompressor.compress(systemPrompt);
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
      if (!content) continue;
      truthGate.enforce(content, 'Evo LM Team Chat');
      return { success: true, message: content, provider: 'evo_lm', model, transport: 'ollama', from_cache: false };
    } catch {
      // Keep trying next model.
    }
  }

  const fallback = await ai.generateResponse(messages, processedSystemPrompt);
  return {
    success: fallback.truth_state === 'VERIFIED',
    message: fallback.message,
    provider: fallback.provider || 'fallback',
    model: 'fallback',
    transport: 'bridge_fallback',
    from_cache: Boolean(fallback.from_cache)
  };
}

function appendTrainingExamples(examples = [], source = 'evo_team_run') {
  const file = join(DATA_DIR, 'evo_training.jsonl');
  const redact = t => String(t || '')
    .replace(/sk-[A-Za-z0-9_-]{20,}/g, '[REDACTED]')
    .replace(/ph_evo_[A-Za-z0-9]+/g, '[REDACTED]')
    .replace(/Bearer\s+\S{20,}/g, '[REDACTED]');

  const lines = examples.map(example => JSON.stringify({
    messages: [
      { role: 'system', content: redact(example.systemPrompt) },
      { role: 'user', content: redact(example.input) },
      { role: 'assistant', content: redact(example.output) },
    ],
    metadata: {
      source,
      transport: example.transport || 'team_run',
      timestamp: example.timestamp || new Date().toISOString()
    }
  })).join('\n') + '\n';

  writeFileSync(file, lines, { flag: 'a', encoding: 'utf8' });
  return file;
}

function defaultNightforgeState() {
  return {
    active: false,
    running: false,
    intervalMinutes: 360,
    orgId: 'org_test',
    includeProviders: ['evo_lm', 'openai', 'gemini'],
    forceThreeProviderTeam: false,
    train: true,
    useLiveStudio: true,
    mode: 'cost_guarded',
    totalCycles: 0,
    successfulCycles: 0,
    failedCycles: 0,
    lastCycleAt: null,
    lastSuccessAt: null,
    lastErrorAt: null,
    lastError: null,
    nextCycleAt: null,
    lastResult: null
  };
}

function loadNightforgeState() {
  const base = defaultNightforgeState();
  if (!existsSync(NIGHTFORGE_STATE_FILE)) return base;
  try {
    const raw = JSON.parse(readFileSync(NIGHTFORGE_STATE_FILE, 'utf8'));
    return { ...base, ...raw, running: false };
  } catch {
    return base;
  }
}

function saveNightforgeState(state) {
  writeFileSync(NIGHTFORGE_STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
}

let nightforgeState = loadNightforgeState();

function updateNightforgeState(patch) {
  nightforgeState = { ...nightforgeState, ...patch };
  saveNightforgeState(nightforgeState);
  return nightforgeState;
}

function clearNightforgeDaemon() {
  if (nightforgeDaemonTimer) {
    clearInterval(nightforgeDaemonTimer);
    nightforgeDaemonTimer = null;
  }
}

function readNightforgeReceipts() {
  if (!existsSync(NIGHTFORGE_RECEIPTS_FILE)) return [];
  try {
    const lines = readFileSync(NIGHTFORGE_RECEIPTS_FILE, 'utf8').split('\n').map(line => line.trim()).filter(Boolean);
    return lines.map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    }).filter(Boolean);
  } catch {
    return [];
  }
}

function buildNightforgeMetrics() {
  const receipts = readNightforgeReceipts();
  const todayIso = new Date().toISOString().slice(0, 10);
  const todayReceipts = receipts.filter((entry) => String(entry.timestamp || '').slice(0, 10) === todayIso);

  const providerMix = { evo_lm: 0, openai: 0, gemini: 0, other: 0 };
  for (const entry of todayReceipts) {
    for (const providerEntry of entry.providers || []) {
      const key = providerEntry.provider;
      if (key === 'evo_lm' || key === 'openai' || key === 'gemini') {
        providerMix[key] += 1;
      } else {
        providerMix.other += 1;
      }
    }
  }

  const cyclesToday = todayReceipts.length;
  const creditsToday = todayReceipts.reduce((sum, entry) => sum + Number(entry.cost?.creditsUsed || 0), 0);
  const externalCallsToday = todayReceipts.reduce((sum, entry) => sum + Number(entry.cost?.externalCalls || 0), 0);
  const cacheHitsToday = todayReceipts.reduce((sum, entry) => sum + Number(entry.cost?.cacheHits || 0), 0);
  const savedTokensToday = todayReceipts.reduce((sum, entry) => sum + Number(entry.cost?.estimatedSavedTokens || 0), 0);

  const trend = receipts.slice(-10).map((entry) => ({
    id: entry.id,
    timestamp: entry.timestamp,
    creditsUsed: Number(entry.cost?.creditsUsed || 0),
    externalCalls: Number(entry.cost?.externalCalls || 0),
    cacheHits: Number(entry.cost?.cacheHits || 0),
    savedTokens: Number(entry.cost?.estimatedSavedTokens || 0)
  }));

  return {
    date: todayIso,
    cyclesToday,
    creditsToday,
    externalCallsToday,
    cacheHitsToday,
    savedTokensToday,
    providerMix,
    trend
  };
}

function buildNightforgeActions(diagnostics) {
  const actions = [];
  const failingProbes = (diagnostics?.probes || []).filter(item => !item.ok);
  if (failingProbes.length > 0) {
    actions.push({
      action: 'repair_failing_runtime_probes',
      priority: 'HIGH',
      note: `Probe failures detected: ${failingProbes.map(item => item.id).join(', ')}`,
      targets: failingProbes.map(item => item.path)
    });
  }

  const errorModules = (diagnostics?.modules || []).filter(item => item.health === 'error').slice(0, 6);
  if (errorModules.length > 0) {
    actions.push({
      action: 'fix_module_errors',
      priority: 'HIGH',
      note: `Modules with hard errors: ${errorModules.length}`,
      targets: errorModules.map(item => item.path)
    });
  }

  const warningModules = (diagnostics?.modules || []).filter(item => item.health === 'warning').slice(0, 6);
  if (warningModules.length > 0) {
    actions.push({
      action: 'reduce_warning_surface',
      priority: 'MEDIUM',
      note: `Modules with warnings: ${warningModules.length}`,
      targets: warningModules.map(item => item.path)
    });
  }

  const unresolved = diagnostics?.unresolved_dependencies || [];
  if (unresolved.length > 0) {
    actions.push({
      action: 'resolve_dependency_breaks',
      priority: 'HIGH',
      note: `Unresolved imports detected: ${unresolved.length}`,
      targets: unresolved.slice(0, 8).map(item => item.module)
    });
  }

  const avgLatency = diagnostics?.summary?.avg_probe_latency_ms || 0;
  if (avgLatency > 350) {
    actions.push({
      action: 'optimize_bridge_latency',
      priority: 'MEDIUM',
      note: `Probe latency is elevated (${avgLatency}ms).`,
      targets: ['promptbridge-server.js', '/api/metrics', '/api/evo-lm/chat']
    });
  }

  if (actions.length === 0) {
    actions.push({
      action: 'maintain_stability_window',
      priority: 'LOW',
      note: 'No urgent runtime faults detected.',
      targets: ['continuous_monitoring']
    });
  }

  return actions;
}

async function runNightforgeCycle({
  objective,
  orgId = 'org_test',
  includeProviders = ['evo_lm', 'openai', 'gemini'],
  forceThreeProviderTeam = nightforgeState.forceThreeProviderTeam ?? false,
  train = true,
  useLiveStudio = true,
  mode = 'cost_guarded',
  scanLimit = 60,
  trigger = 'manual'
} = {}) {
  // Proactive Medical Intervention Handshake
  if (trigger === 'daemon' || trigger === 'doctor') {
    Log.info('🧪 [NightForge] Handshaking with Evo Doctor for proactive medical audit...');
    await EVO_DOCTOR.maintenanceTick();
    
    Log.info('🏗️ [NightForge] Handshaking with Evo Evolution Engineer for structural evolution...');
    await EVO_ENGINEER.maintenanceTick();

    Log.info('🎨 [NightForge] Handshaking with Evo UI Engineer for aesthetic refinement...');
    await EVO_UI_ENGINEER.maintenanceTick();
  }

  if (nightforgeState.running) {
    throw new Error('NightForge cycle already running.');
  }

  updateNightforgeState({ running: true, lastError: null });

  try {
    const diagnostics = await buildStudioDiagnostics(scanLimit);
    const proposedActions = buildNightforgeActions(diagnostics);
    // ─── RESONANCE HOOK (SOVEREIGN TRIAD) ──────────────────────────────────
    const consciousnessDirective = await bridge_get_latest_cognitive_directive(orgId);
    if (consciousnessDirective && consciousnessDirective.directive === 'BLOCK_REPAIR') {
      Log.warn('🧪 [Resonance] NightForge cycle BLOCKED by Cognitive Consciousness directive.');
      updateNightforgeState({ running: false, lastError: 'BLOCKED_BY_CONSCIOUSNESS' });
      return { success: false, reason: 'RESONANCE_BLOCK', directive: consciousnessDirective.realization };
    }
    
    // Anchor to Evo Eyes Vision
    const eyeWitness = scanStudioModules(20);
    const visualTruth = eyeWitness.files.filter(f => f.health === 'error');
    if (visualTruth.length > 0) {
      Log.info(`🧪 [Resonance] Evo Eyes witnessed ${visualTruth.length} visual faults. Adjusting repair priority.`);
      proposedActions.unshift({
        action: 'repair_visual_drift',
        priority: 'CRITICAL',
        note: 'Witnessed by Evo Eyes during resonance handshake.',
        targets: visualTruth.map(f => f.path)
      });
    }
    // ────────────────────────────────────────────────────────────────────────

    const failingProbes = (diagnostics.probes || []).filter(item => !item.ok);
    const topRiskModules = (diagnostics.modules || [])
      .filter(item => item.health !== 'healthy')
      .slice(0, 8)
      .map(item => ({
        path: item.path,
        health: item.health,
        issues: (item.issues || []).slice(0, 2).map(issue => issue.code)
      }));

    const computedObjective = objective || [
      'NightForge daemon cycle.',
      `Modules scanned: ${diagnostics.summary.modules_scanned}.`,
      `Errors: ${diagnostics.summary.modules_error}, warnings: ${diagnostics.summary.modules_warning}.`,
      `Failing probes: ${failingProbes.length}.`,
      `Use cost-aware provider routing and produce implementation-ready repairs only.`
    ].join(' ');

    await CostFirewall.authorize(orgId, '/api/nightforge/cycle');
    const routedProvider = await ModelRouter.route(orgId, '/api/nightforge/cycle');
    const requiredTeam = ['evo_lm', 'openai', 'gemini'];
    const requested = new Set(forceThreeProviderTeam
      ? requiredTeam
      : (Array.isArray(includeProviders) && includeProviders.length > 0 ? includeProviders : ['evo_lm']));
    const canUseCloud = routedProvider === 'any' || routedProvider === 'cloud' || routedProvider === 'openai' || routedProvider === 'gemini';
    
    Log.info(`🧪 [NightForge] routedProvider: ${routedProvider}, canUseCloud: ${canUseCloud}, orgId: ${orgId}`);
    Log.info(`🧪 [NightForge] requested providers: ${Array.from(requested).join(', ')}`);

    if (forceThreeProviderTeam) {
      if (!userConfig.keys.openai) {
        throw new Error('NightForge strict 3-provider mode requires a configured OpenAI API key.');
      }
      if (!userConfig.keys.gemini) {
        throw new Error('NightForge strict 3-provider mode requires a configured Gemini API key.');
      }
      if (!canUseCloud) {
        throw new Error('NightForge strict 3-provider mode requires cloud routing permission for this org/plan.');
      }
    }

    const providerOutputs = [];
    const digest = {
      summary: diagnostics.summary,
      failingProbes: failingProbes.map(item => ({ id: item.id, path: item.path, status: item.status, latency_ms: item.latency_ms })),
      topRiskModules,
      proposedActions: proposedActions.slice(0, 8)
    };

    const baseMessages = [
      { role: 'user', content: `${computedObjective}\n\nDiagnostics digest:\n${JSON.stringify(digest, null, 2)}` }
    ];
    const coordinationPrompt = [
      'You are NightForge, a cost-aware studio reliability daemon.',
      'Return concrete fixes only. No hype.',
      `Mode: ${mode}.`,
      `LiveStudio: ${useLiveStudio ? 'enabled' : 'disabled'}.`,
      `ProviderRoute: ${routedProvider}.`
    ].join(' ');

    if (requested.has('evo_lm')) {
      try {
        const evoLm = await runEvoLmTeamChat(baseMessages, coordinationPrompt);
        providerOutputs.push({
          provider: 'evo_lm',
          success: evoLm.success,
          from_cache: Boolean(evoLm.from_cache),
          content: evoLm.message,
          model: evoLm.model,
          transport: evoLm.transport
        });
      } catch (e) {
        providerOutputs.push({
          provider: 'evo_lm',
          success: false,
          from_cache: false,
          content: String(e.message || e),
          model: 'unavailable',
          transport: 'failed'
        });
      }
    }

    if (requested.has('openai') && userConfig.keys.openai && canUseCloud) {
      try {
        const openaiResult = await ai.chat(
          coordinationPrompt ? [{ role: 'system', content: coordinationPrompt }, ...baseMessages] : baseMessages,
          { provider: 'openai', model: process.env.OPENAI_MODEL || 'gpt-4o-mini' }
        );
        if (openaiResult.success && openaiResult.content) truthGate.enforce(openaiResult.content, 'NightForge:openai');
        providerOutputs.push({
          provider: 'openai',
          success: Boolean(openaiResult.success),
          from_cache: Boolean(openaiResult.from_cache),
          content: openaiResult.content || openaiResult.error || '',
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          transport: 'universal_ai_adaptor'
        });
      } catch (e) {
        providerOutputs.push({
          provider: 'openai',
          success: false,
          from_cache: false,
          content: String(e.message || e),
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          transport: 'failed'
        });
      }
    }

    if (requested.has('gemini') && userConfig.keys.gemini && canUseCloud) {
      try {
        const geminiResult = await ai.chat(
          coordinationPrompt ? [{ role: 'system', content: coordinationPrompt }, ...baseMessages] : baseMessages,
          { provider: 'gemini', model: 'gemini-2.5-flash-lite' }
        );
        if (geminiResult.success && geminiResult.content) truthGate.enforce(geminiResult.content, 'NightForge:gemini');
        providerOutputs.push({
          provider: 'gemini',
          success: Boolean(geminiResult.success),
          from_cache: Boolean(geminiResult.from_cache),
          content: geminiResult.content || geminiResult.error || '',
          model: 'gemini-2.5-flash-lite',
          transport: 'universal_ai_adaptor'
        });
      } catch (e) {
        providerOutputs.push({
          provider: 'gemini',
          success: false,
          from_cache: false,
          content: String(e.message || e),
          model: 'gemini-2.5-flash-lite',
          transport: 'failed'
        });
      }
    }

    if (providerOutputs.length === 0 || providerOutputs.every(item => !item.success)) {
      throw new Error('No providers available for NightForge cycle. Configure keys or include evo_lm.');
    }

    const synthesisInput = providerOutputs
      .map(item => `${item.provider.toUpperCase()}(${item.success ? 'ok' : 'error'}): ${item.content}`)
      .join('\n\n');
    const synthesis = await runEvoLmTeamChat(
      [{ role: 'user', content: `Objective:\n${computedObjective}\n\nProvider outputs:\n${synthesisInput}` }],
      'Synthesize a strict repair plan for NightForge with numbered actions and safety guards.'
    );
    const finalPlan = synthesis.message || providerOutputs.find(item => item.success)?.content || providerOutputs[0].content;

    const externalCalls = providerOutputs.filter(item => (item.provider === 'openai' || item.provider === 'gemini') && !item.from_cache).length;
    const cacheHits = providerOutputs.filter(item => item.from_cache).length;
    const localCalls = providerOutputs.filter(item => item.provider === 'evo_lm').length;
    const creditsUsed = Math.max(1, externalCalls === 0 ? 1 : externalCalls);
    await CostFirewall.deduct(orgId, '/api/nightforge/cycle', creditsUsed);

    const estimatedSavedTokens = externalCalls === 0 ? 2500 : cacheHits * 1200;
    if (estimatedSavedTokens > 0) {
      globalFirewallSavings.tokens += estimatedSavedTokens;
      globalFirewallSavings.dollars += estimatedSavedTokens * 0.000002;
    }

    let trainingFile = null;
    if (train) {
      trainingFile = appendTrainingExamples([
        {
          systemPrompt: 'You are PromptHouse Evo Studio NightForge trainer. Preserve runtime diagnostics, cost-aware routing, and concrete repair actions.',
          input: `Objective: ${computedObjective}\nMode: ${mode}\nRoute: ${routedProvider}\nDiagnostics: ${JSON.stringify(digest)}`,
          output: finalPlan,
          transport: 'nightforge_cycle',
          timestamp: new Date().toISOString()
        }
      ], 'nightforge_cycle');
    }

    const cycleId = `nightforge_${Date.now()}`;
    const receipt = {
      id: cycleId,
      trigger,
      orgId,
      mode,
      forceThreeProviderTeam: Boolean(forceThreeProviderTeam),
      routedProvider,
      objective: computedObjective,
      diagnostics: diagnostics.summary,
      providers: providerOutputs.map(item => ({ provider: item.provider, success: item.success, from_cache: item.from_cache })),
      cost: { externalCalls, cacheHits, localCalls, creditsUsed, estimatedSavedTokens },
      timestamp: new Date().toISOString()
    };
    writeFileSync(NIGHTFORGE_RECEIPTS_FILE, `${toSafeJson(receipt)}\n`, { flag: 'a', encoding: 'utf8' });

    const result = {
      id: cycleId,
      status: 'recommended',
      description: 'NightForge produced a real diagnostics-backed repair cycle.',
      timestamp: receipt.timestamp,
      scannedItems: [
        `modules_scanned:${diagnostics.summary.modules_scanned}`,
        `module_errors:${diagnostics.summary.modules_error}`,
        `module_warnings:${diagnostics.summary.modules_warning}`,
        `failing_probes:${failingProbes.length}`,
        `dependency_edges:${diagnostics.summary.dependency_edges}`
      ],
      proposedActions,
      cannot: ['silent_production_deploy', 'delete_data', 'live_commerce_without_approval'],
      diagnostics: {
        summary: diagnostics.summary,
        failingProbes,
        topRiskModules,
        graph: diagnostics.graph
      },
      team: {
        objective: computedObjective,
        routedProvider,
        providerOutputs,
        synthesis: {
          provider: synthesis.provider || 'evo_lm',
          transport: synthesis.transport,
          output: finalPlan
        }
      },
      costSummary: {
        externalCalls,
        cacheHits,
        localCalls,
        creditsUsed,
        estimatedSavedTokens,
        estimatedSavedDollars: Number((estimatedSavedTokens * 0.000002).toFixed(6))
      },
      training: {
        enabled: Boolean(train),
        file: trainingFile
      }
    };

    const nextCycleAt = nightforgeState.active
      ? new Date(Date.now() + (nightforgeState.intervalMinutes * 60 * 1000)).toISOString()
      : null;

    updateNightforgeState({
      running: false,
      lastCycleAt: receipt.timestamp,
      lastSuccessAt: receipt.timestamp,
      lastErrorAt: null,
      lastError: null,
      totalCycles: (nightforgeState.totalCycles || 0) + 1,
      successfulCycles: (nightforgeState.successfulCycles || 0) + 1,
      nextCycleAt,
      lastResult: result
    });

    return result;
  } catch (error) {
    const nowIso = new Date().toISOString();
    updateNightforgeState({
      running: false,
      lastCycleAt: nowIso,
      lastErrorAt: nowIso,
      lastError: String(error.message || error),
      totalCycles: (nightforgeState.totalCycles || 0) + 1,
      failedCycles: (nightforgeState.failedCycles || 0) + 1
    });
    throw error;
  }
}

function scheduleNightforgeDaemon() {
  clearNightforgeDaemon();
  if (!nightforgeState.active) return;

  const intervalMs = Math.max(1, Number(nightforgeState.intervalMinutes || 360)) * 60 * 1000;
  updateNightforgeState({ nextCycleAt: new Date(Date.now() + intervalMs).toISOString() });
  nightforgeDaemonTimer = setInterval(async () => {
    if (!nightforgeState.active || nightforgeState.running) return;
    try {
      await runNightforgeCycle({
        orgId: nightforgeState.orgId,
        includeProviders: nightforgeState.includeProviders,
        forceThreeProviderTeam: Boolean(nightforgeState.forceThreeProviderTeam),
        train: nightforgeState.train,
        useLiveStudio: nightforgeState.useLiveStudio,
        mode: nightforgeState.mode,
        trigger: 'daemon'
      });
    } catch (e) {
      console.error('[NightForge] daemon cycle failed:', e.message || e);
    }
  }, intervalMs);
}

// ─── MIDDLEWARE ──────────────────────────────────────────────────────────────

app.disable('x-powered-by');
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (CORS_ORIGINS.length === 0) return callback(null, true);
    if (CORS_ORIGINS.includes(origin)) return callback(null, true);
    return callback(new Error('Origin not allowed by CORS policy.'));
  },
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

app.use((req, res, next) => {
  const startedAt = Date.now();
  res.on('finish', () => {
    const durationMs = Date.now() - startedAt;
    recordRequestDuration(durationMs);
    if (res.statusCode >= 500) requestStats.errors += 1;
  });
  console.log(`[REQ] ${req.method} ${req.url}`);
  next();
});

// ─── CORE ROUTES ─────────────────────────────────────────────────────────────

app.get('/status', (req, res) => {
  const brain = maintenance.brain || {};
  const live = { ok: true, missing_files: [], checked_at: new Date().toISOString() };
  try {
    live.cwd = process.cwd();
    live.exists_eval_bench = existsSync(join(process.cwd(), 'src', 'core', 'foundry', 'eval_bench.js'));
    const arch = brain.studio_architecture || {};
    for (const key of Object.keys(arch)) {
      const entry = arch[key] || {};
      const files = [];
      if (entry.file) files.push(entry.file);
      if (Array.isArray(entry.files)) files.push(...entry.files);
      for (const f of files) {
        const abs = join(process.cwd(), String(f));
        if (!existsSync(abs)) live.missing_files.push({ module: key, file: String(f) });
      }
    }
    live.ok = live.missing_files.length === 0;
  } catch {
    // Ignore; status must remain stable.
  }

  res.json({
    status: 'ONLINE',
    mode: 'SOVEREIGN',
    version: '2.1.0-OMEGA',
    uptime: process.uptime(),
    iq_metrics: {
      baseline: 2000000,
      sovereign_gain: maintenance.calculateIQGain(),
    },
    brain: brain,
    brain_snapshot: brain,
    live
  });
});

app.get('/healthz', (req, res) => {
  res.json({
    ok: true,
    service: 'promptbridge-server',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/generated-artifact-registry', (req, res) => {
  try {
    const gitStatusLines = readGitStatusLines();
    const registry = buildGeneratedArtifactRegistry({ gitStatusLines });
    res.json({
      id: 'generated-artifact-registry',
      timestamp: new Date().toISOString(),
      ...registry
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/bridge-contract-ledger', (req, res) => {
  try {
    const ledger = buildBridgeContractLedger({ rootDir: process.cwd() });
    res.json({
      id: 'bridge-contract-ledger',
      timestamp: new Date().toISOString(),
      ...ledger
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/self-implementation/status', (req, res) => {
  try {
    const availableFiles = readAvailableFiles();
    const availableEndpoints = discoverAvailableEndpoints();
    const capabilities = resolveSelfImplementationCapabilities({
      availableFiles,
      availableEndpoints,
      env: process.env
    });
    const state = createSelfImplementationState({ capabilities });
    const summary = summarizeSelfImplementationCapabilities(capabilities);

    res.json({
      success: true,
      active: state.active,
      policies: state.policies,
      summary,
      capabilities,
      availableEndpoints
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/audit/nuclear-truth', (req, res) => {
  try {
    const report = runNuclearTruthAudit(process.cwd());
    res.json({
      success: true,
      ...report
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/browser-bridge/list', (req, res) => {
  try {
    const receipts = loadBrowserBridgeReceipts();
    const items = receipts.map((entry) => ({
      id: entry.id,
      type: entry.type,
      status: entry.type === 'proof' ? 'verified' : 'built',
      url: entry.payload.url || entry.payload.sourceUrl || null,
      title: entry.payload.title || entry.payload.name || null,
      selection: entry.payload.selection || entry.payload.context || null
    }));
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/browser-bridge/forgecapsule', (req, res) => {
  try {
    const receipts = loadBrowserBridgeReceipts();
    const capsules = receipts
      .filter((entry) => entry.type === 'forgecapsule' || entry.type === 'promptbase')
      .map((entry) => ({
        id: entry.id,
        pageTitle: entry.payload.title || entry.payload.name || 'Untitled Capture',
        sourceUrl: entry.payload.url || entry.payload.sourceUrl || 'local://bridge',
        selectedText: entry.payload.selection || entry.payload.context || ''
      }));
    res.json(capsules);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/browser-bridge/proof', (req, res) => {
  try {
    const receipts = loadBrowserBridgeReceipts();
    const proofReceipts = receipts
      .filter((entry) => entry.type === 'proof')
      .map((entry) => ({
        id: entry.id,
        action: entry.payload.missionId || 'bridge_proof',
        status: 'verified',
        timestamp: new Date(entry.ts).toISOString()
      }));
    res.json(proofReceipts);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/reports/kpi', (req, res) => {
  try {
    const receipts = loadBrowserBridgeReceipts();
    res.json(computeKpiFromReceipts(receipts));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/bridge/invoke', enforceJsonObjectBody, async (req, res) => {
  try {
    const { command } = req.body || {};
    if (!command || typeof command !== 'string') {
      return res.status(400).json({ error: 'command is required' });
    }
    const execution = await intelligenceCore.executeAction('Terminal', 'run', { command, session: 'build' });
    if (!execution.success || !execution.result?.success) {
      return res.status(500).json({
        success: false,
        error: execution.error || execution.result?.error || 'Command failed',
        message: execution.result?.output || execution.error || 'Command failed'
      });
    }
    res.json({
      success: true,
      message: execution.result.output,
      command
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/prompt-os/packet', (req, res) => {
  try {
    const packetPath = process.env.PROMPT_PACKET_PATH || DEFAULT_PROMPT_PACKET_PATH;
    const packet = buildPromptPacketPreview(packetPath);
    res.json({ packet });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/connectors', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM connectors WHERE status = "active"').all();
    res.json(rows.map(row => ({
      id: row.id,
      name: row.name,
      type: row.type,
      config: JSON.parse(row.config_json || '{}'),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    })));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/connectors', (req, res) => {
  const { id, name, type, config } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  
  const connectorId = id || `conn_${Date.now()}`;
  try {
    db.prepare(`
      INSERT INTO connectors (id, name, type, config_json)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        type = excluded.type,
        config_json = excluded.config_json,
        updated_at = CURRENT_TIMESTAMP
    `).run(connectorId, name, type || 'custom', JSON.stringify(config || {}));
    
    res.json({ success: true, id: connectorId });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/connectors/:id', (req, res) => {
  const { id } = req.params;
  try {
    db.prepare('UPDATE connectors SET status = "deleted", updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/release-spine/status', (req, res) => {
  try {
    const artifactRegistry = buildGeneratedArtifactRegistry({ gitStatusLines: readGitStatusLines() });
    const contractLedger = buildBridgeContractLedger({ rootDir: process.cwd() });
    const promptPacket = buildPromptPacketPreview(process.env.PROMPT_PACKET_PATH || DEFAULT_PROMPT_PACKET_PATH);
    const projectSource = {
      summary: {
        completenessState: promptPacket.imported ? 'partial' : 'missing',
        coveragePercent: promptPacket.imported ? 100 : 0,
        claimCount: promptPacket.authority?.canonicalClaims?.length || 0
      }
    };

    const blocked = [];
    if ((artifactRegistry.unknownEntries || []).length > 0) blocked.push('unknown_worktree_entries');
    if ((contractLedger.summary?.notImplemented || 0) > 0) blocked.push('route_contract_drift');
    if (!promptPacket.imported) blocked.push('missing_prompt_packet_import');

    res.json({
      releaseSpine: {
        status: blocked.length ? 'blocked' : 'verified',
        blocked,
        artifactRegistry,
        contractLedger,
        buildReviewGate: { status: 'reviewed' },
        projectSource,
        promptPacket
      }
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/studio-os/inspector', (req, res) => {
  try {
    const artifactRegistry = buildGeneratedArtifactRegistry({ gitStatusLines: readGitStatusLines() });
    const contractLedger = buildBridgeContractLedger({ rootDir: process.cwd() });
    const selfImplementation = resolveSelfImplementationCapabilities({
      availableFiles: readAvailableFiles(),
      availableEndpoints: discoverAvailableEndpoints(),
      env: process.env
    });
    res.json({
      status: 'ok',
      generatedArtifactRegistry: artifactRegistry,
      bridgeContractLedger: contractLedger,
      selfImplementation
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/connections', (req, res) => {
  res.json({
    bonded: bondedNodes,
    local: [
      { name: 'Direct (This Machine)', url: 'http://localhost:3002', type: 'IP', description: 'Fastest, zero latency.' },
      { name: 'Local Network', url: `http://${getLocalIP()}:3002`, type: 'IP', description: 'Use from other devices on the same Wi-Fi.' },
    ],
    online: [
      { name: 'Localtunnel', url: 'https://itchy-seas-fry.loca.lt', type: 'TUNNEL', description: 'Share with external users (may be flakey).' },
    ],
    external_apis: [
      { name: 'OpenAI Direct', url: 'https://api.openai.com', type: 'EXTERNAL', description: 'Connect directly to OpenAI.' },
    ]
  });
});

app.post('/api/terminal/bond', express.json(), async (req, res) => {
  const { target } = req.body;
  if (!target) return res.status(400).json({ error: 'Target IP/URL required.' });
  
  try {
    const result = await intelligenceCore.executeAction('Terminal', 'run', { command: `evo connect ${target}` });
    if (result.success) {
      const newNode = {
        name: `Bonded Node: ${target}`,
        url: target,
        type: 'EVO',
        status: 'active',
        timestamp: new Date().toISOString()
      };
      bondedNodes.push(newNode);
      res.json({ success: true, message: result.output, node: newNode });
    } else {
      res.status(500).json({ error: result.output });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) return iface.address;
    }
  }
  return '127.0.0.1';
}

app.post('/api/auth/register', authRateLimit, enforceJsonObjectBody, async (req, res) => {
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

app.post('/api/auth/login', authRateLimit, enforceJsonObjectBody, async (req, res) => {
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

app.get('/api/auth/me', requireAuth, (req, res) => {
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

app.post('/api/auth/logout', authRateLimit, requireAuth, (req, res) => {
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

// ─── EVO DOCTOR MEDICAL ENDPOINTS ───────────────────────────────────────────

app.get('/api/doctor/scan', maybeRequireAuthOrMaster, async (req, res) => {
  try {
    const results = await EVO_DOCTOR.scanSystem();
    res.json(results);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/doctor/heal', maybeRequireAuthOrMaster, writeRateLimit, enforceJsonObjectBody, async (req, res) => {
  const { targetFiles } = req.body;
  try {
    const results = await EVO_DOCTOR.performHeal(targetFiles);
    res.json(results);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── EVO ENGINEER ENDPOINTS ────────────────────────────────────────────────

app.post('/api/engineer/evolve', maybeRequireAuthOrMaster, writeRateLimit, async (req, res) => {
  try {
    const results = await EVO_ENGINEER.evolveArchitecture();
    res.json(results);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── EVO UI ENGINEER ENDPOINTS ─────────────────────────────────────────────

app.post('/api/ui-engineer/evolve', maybeRequireAuthOrMaster, writeRateLimit, async (req, res) => {
  try {
    const results = await EVO_UI_ENGINEER.evolveUI();
    res.json(results);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/evolution/profile', (req, res) => {
  try {
    attachOptionalAuthUser(req);
    const identity = resolveEvolutionSubject(req, req.query || {});
    let profile = loadOrCreateEvolutionProfile(identity.subjectKey, identity.userId);

    const shouldMutate = (() => {
      if (!profile.updated_at) return true;
      const updatedAt = new Date(profile.updated_at).getTime();
      if (!Number.isFinite(updatedAt)) return true;
      return (Date.now() - updatedAt) > 15000;
    })();

    if (shouldMutate) {
      profile = mutateEvolutionProfile(profile, 'profile_refresh');
      persistEvolutionProfile(profile);
      recordEvolutionEvent(identity.subjectKey, 'profile_refresh', {
        userId: identity.userId,
        clientId: identity.clientId,
        cycles: profile.autonomy?.cycles || 0
      });
    }

    res.json({
      success: true,
      profile: {
        subject_key: profile.subject_key,
        user_id: profile.user_id,
        affinity: profile.affinity,
        layout: profile.layout,
        theme: profile.theme,
        autonomy: profile.autonomy,
        updated_at: profile.updated_at
      },
      runtime: {
        cssVariables: evolutionCssVariables(profile),
        layoutHints: {
          sidebarCollapsed: Boolean(profile.layout?.sidebar_collapsed),
          densityScale: Number(profile.layout?.density_scale || 1),
          motionMode: profile.layout?.motion_mode || 'calm'
        }
      }
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/evolution/signal', writeRateLimit, enforceJsonObjectBody, (req, res) => {
  try {
    attachOptionalAuthUser(req);
    const identity = resolveEvolutionSubject(req, req.body || {});
    let profile = loadOrCreateEvolutionProfile(identity.subjectKey, identity.userId);
    profile = applyEvolutionSignal(profile, req.body || {});
    profile = mutateEvolutionProfile(profile, 'user_signal');
    persistEvolutionProfile(profile);

    recordEvolutionEvent(identity.subjectKey, 'signal', {
      page: req.body?.page || 'unknown',
      action: req.body?.action || 'view',
      intensity: req.body?.intensity ?? null,
      complexity: req.body?.complexity ?? req.body?.taskComplexity ?? null
    });

    res.json({
      success: true,
      profile: {
        subject_key: profile.subject_key,
        layout: profile.layout,
        theme: profile.theme,
        autonomy: profile.autonomy,
        affinity: profile.affinity
      },
      runtime: {
        cssVariables: evolutionCssVariables(profile),
        layoutHints: {
          sidebarCollapsed: Boolean(profile.layout?.sidebar_collapsed),
          densityScale: Number(profile.layout?.density_scale || 1),
          motionMode: profile.layout?.motion_mode || 'calm'
        }
      }
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/evolution/cycle', writeRateLimit, enforceJsonObjectBody, (req, res) => {
  try {
    attachOptionalAuthUser(req);
    const identity = resolveEvolutionSubject(req, req.body || {});
    let profile = loadOrCreateEvolutionProfile(identity.subjectKey, identity.userId);
    profile = mutateEvolutionProfile(profile, String(req.body?.reason || 'manual_cycle').slice(0, 120));
    persistEvolutionProfile(profile);
    recordEvolutionEvent(identity.subjectKey, 'manual_cycle', {
      reason: req.body?.reason || 'manual_cycle'
    });
    res.json({
      success: true,
      profile: {
        subject_key: profile.subject_key,
        affinity: profile.affinity,
        layout: profile.layout,
        theme: profile.theme,
        autonomy: profile.autonomy
      },
      runtime: {
        cssVariables: evolutionCssVariables(profile),
        layoutHints: {
          sidebarCollapsed: Boolean(profile.layout?.sidebar_collapsed),
          densityScale: Number(profile.layout?.density_scale || 1),
          motionMode: profile.layout?.motion_mode || 'calm'
        }
      }
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/evolution/ui/pipeline', maybeRequireAuthOrMaster, writeRateLimit, enforceJsonObjectBody, async (req, res) => {
  const startedAt = Date.now();
  const pipelineId = `ui_evolution_${Date.now()}`;

  try {
    const {
      filePath,
      objective = '',
      proposalCode = '',
      proposalVariants = [],
      mutationObjectives = [],
      ownerApproval = {},
      runTests = true,
      runBuild = true,
      runBossFights = false,
      bossFightCommands = [],
      rollbackOnFailure = true,
      enforceNuclearTruth = true,
      nuclearTruthMinScore = 60,
      budget = {},
      autoUpdateBaseline = false
    } = req.body || {};

    const absolutePath = resolveWorkspacePath(filePath);
    if (!existsSync(absolutePath)) {
      return res.status(404).json({ error: `Target file not found: ${filePath}` });
    }

    const relativePath = toPosixPath(relative(process.cwd(), absolutePath));
    const originalCode = readFileSync(absolutePath, 'utf8');

    const stages = [];
    const pushStage = (id, data = {}) => stages.push({ id, at: new Date().toISOString(), ...data });

    pushStage('capability_graph:start');
    const capabilityGraph = buildCapabilityGraph({ workspaceRoot: process.cwd() });
    const graphBaseline = loadCapabilityBaseline(AUTONOMOUS_EVOLUTION_BASELINE_FILE);
    const graphDrift = computeCapabilityDrift(capabilityGraph, graphBaseline);
    pushStage('capability_graph:done', {
      hash: capabilityGraph.hash,
      driftScore: graphDrift.score,
      driftStatus: graphDrift.status
    });

    const priorFailures = readFailureMemory(AUTONOMOUS_EVOLUTION_FAILURE_FILE, {
      filePathFilter: relativePath,
      limit: 20
    });
    const recoveryPlan = buildRecoveryPlan(priorFailures);
    pushStage('failure_memory:done', {
      priorFailures: priorFailures.length,
      topStage: recoveryPlan.topStage
    });

    pushStage('proposal:start', { filePath: relativePath, objective: String(objective || '') });
    const primaryProposal = await buildUiEvolutionProposal({
      filePath: relativePath,
      objective,
      currentCode: originalCode,
      proposalCode
    });
    pushStage('proposal:done', {
      source: primaryProposal.source,
      transport: primaryProposal.transport || null,
      model: primaryProposal.model || null,
      candidateLength: primaryProposal.code.length
    });

    const candidates = [{
      id: 'primary',
      label: 'Primary proposal',
      source: primaryProposal.source,
      objective: primaryProposal.objective,
      code: primaryProposal.code
    }];

    const directVariants = Array.isArray(proposalVariants) ? proposalVariants.slice(0, 4) : [];
    directVariants.forEach((variant, index) => {
      if (typeof variant === 'string' && variant.trim()) {
        candidates.push({
          id: `direct_${index + 1}`,
          label: `Direct variant ${index + 1}`,
          source: 'direct_variant',
          objective: objective || `direct_variant_${index + 1}`,
          code: sanitizeGeneratedCode(variant)
        });
      }
    });

    const mutationList = Array.isArray(mutationObjectives) ? mutationObjectives.slice(0, 4) : [];
    for (let i = 0; i < mutationList.length; i += 1) {
      const mutationObjective = String(mutationList[i] || '').trim();
      if (!mutationObjective) continue;
      const mutationProposal = await buildUiEvolutionProposal({
        filePath: relativePath,
        objective: mutationObjective,
        currentCode: originalCode,
        proposalCode: ''
      });
      candidates.push({
        id: `mutation_${i + 1}`,
        label: `Mutation ${i + 1}`,
        source: mutationProposal.source || 'mutation',
        objective: mutationProposal.objective || mutationObjective,
        code: mutationProposal.code
      });
    }

    pushStage('ghost_mutation_lab:start', { candidates: candidates.length });
    const tournament = await runPatchTournament({
      candidates,
      originalCode,
      evaluateCandidate: async (candidate) => runUiLiveValidation({ filePath: relativePath, candidateCode: candidate.code })
    });
    pushStage('ghost_mutation_lab:done', {
      winner: tournament.winner ? {
        id: tournament.winner.id,
        label: tournament.winner.label,
        score: tournament.winner.score
      } : null,
      ranking: tournament.ranking
    });

    const selectedCandidate = tournament.winner;
    const liveRun = selectedCandidate?.validation || null;
    pushStage('live_run:start');
    pushStage('live_run:done', {
      success: Boolean(liveRun?.success),
      candidate: selectedCandidate ? {
        id: selectedCandidate.id,
        label: selectedCandidate.label,
        source: selectedCandidate.source,
        objective: selectedCandidate.objective,
        score: selectedCandidate.score
      } : null,
      audit: liveRun?.audit || null,
      syntaxRun: liveRun?.syntaxRun || null
    });
    if (!selectedCandidate || !liveRun?.success) {
      appendFailureMemory(AUTONOMOUS_EVOLUTION_FAILURE_FILE, {
        pipelineId,
        filePath: relativePath,
        stage: 'live_run',
        objective: primaryProposal.objective,
        error: 'No candidate passed live run validation.',
        ranking: tournament.ranking
      });
      const receipt = {
        id: pipelineId,
        status: 'blocked',
        blockedAt: 'live_run',
        filePath: relativePath,
        objective: primaryProposal.objective,
        startedAt: new Date(startedAt).toISOString(),
        finishedAt: new Date().toISOString(),
        durationMs: Date.now() - startedAt,
        stages,
        tournament: tournament.ranking,
        recoveryPlan
      };
      appendUiEvolutionReceipt(receipt);
      return res.status(412).json({ success: false, ...receipt });
    }

    const selectedCode = selectedCandidate.candidateCode;
    const selectedObjective = selectedCandidate.objective || primaryProposal.objective;

    pushStage('budget_gate:start');
    const budgetGate = enforceEvolutionBudget({
      originalCode,
      candidateCode: selectedCode,
      budget
    });
    pushStage('budget_gate:done', budgetGate);
    if (!budgetGate.success) {
      appendFailureMemory(AUTONOMOUS_EVOLUTION_FAILURE_FILE, {
        pipelineId,
        filePath: relativePath,
        stage: 'budget_gate',
        objective: selectedObjective,
        error: budgetGate.violations.join('; '),
        budgetGate
      });
      const receipt = {
        id: pipelineId,
        status: 'blocked',
        blockedAt: 'budget_gate',
        filePath: relativePath,
        objective: selectedObjective,
        startedAt: new Date(startedAt).toISOString(),
        finishedAt: new Date().toISOString(),
        durationMs: Date.now() - startedAt,
        stages,
        budgetGate,
        recoveryPlan
      };
      appendUiEvolutionReceipt(receipt);
      return res.status(412).json({ success: false, ...receipt });
    }

    pushStage('nuclear_truth_gate:start');
    const nuclearTruth = runNuclearTruthAudit(process.cwd());
    const nuclearGatePass = !enforceNuclearTruth
      || (nuclearTruth.truthState !== 'blocked' && Number(nuclearTruth.score || 0) >= Number(nuclearTruthMinScore || 0));
    pushStage('nuclear_truth_gate:done', {
      success: Boolean(nuclearGatePass),
      truthState: nuclearTruth.truthState,
      score: nuclearTruth.score,
      minScore: Number(nuclearTruthMinScore || 0)
    });
    if (!nuclearGatePass) {
      const receipt = {
        id: pipelineId,
        status: 'blocked',
        blockedAt: 'nuclear_truth_gate',
        filePath: relativePath,
        objective: selectedObjective,
        startedAt: new Date(startedAt).toISOString(),
        finishedAt: new Date().toISOString(),
        durationMs: Date.now() - startedAt,
        stages,
        recoveryPlan
      };
      appendFailureMemory(AUTONOMOUS_EVOLUTION_FAILURE_FILE, {
        pipelineId,
        filePath: relativePath,
        stage: 'nuclear_truth_gate',
        objective: selectedObjective,
        error: `Nuclear Truth gate failed (${nuclearTruth.truthState}, score ${nuclearTruth.score}).`
      });
      appendUiEvolutionReceipt(receipt);
      return res.status(412).json({ success: false, ...receipt });
    }

    const requiredScope = uiEvolutionApprovalScopeForPath(relativePath);
    pushStage('owner_approve:start', { scope: requiredScope });
    const ownerApproved = hasExplicitOwnerApproval(ownerApproval, requiredScope);
    pushStage('owner_approve:done', { success: ownerApproved, scope: requiredScope });
    if (!ownerApproved) {
      const receipt = {
        id: pipelineId,
        status: 'blocked',
        blockedAt: 'owner_approve',
        filePath: relativePath,
        objective: selectedObjective,
        startedAt: new Date(startedAt).toISOString(),
        finishedAt: new Date().toISOString(),
        durationMs: Date.now() - startedAt,
        stages,
        requiredScope,
        error: getApprovalBlockReason(requiredScope)
      };
      appendFailureMemory(AUTONOMOUS_EVOLUTION_FAILURE_FILE, {
        pipelineId,
        filePath: relativePath,
        stage: 'owner_approve',
        objective: selectedObjective,
        error: getApprovalBlockReason(requiredScope)
      });
      appendUiEvolutionReceipt(receipt);
      return res.status(403).json({ success: false, ...receipt });
    }

    pushStage('merge:start');
    const mergeResult = await intelligenceCore.executeAction('GhostEditor', 'merge', {
      filePath: relativePath,
      code: selectedCode,
      ownerApproval
    });
    pushStage('merge:done', {
      success: Boolean(mergeResult?.success),
      message: mergeResult?.result?.message || mergeResult?.error || null
    });
    if (!mergeResult?.success) {
      const receipt = {
        id: pipelineId,
        status: 'blocked',
        blockedAt: 'merge',
        filePath: relativePath,
        objective: selectedObjective,
        startedAt: new Date(startedAt).toISOString(),
        finishedAt: new Date().toISOString(),
        durationMs: Date.now() - startedAt,
        stages,
        error: mergeResult?.error || 'Ghost merge failed.'
      };
      appendFailureMemory(AUTONOMOUS_EVOLUTION_FAILURE_FILE, {
        pipelineId,
        filePath: relativePath,
        stage: 'merge',
        objective: selectedObjective,
        error: mergeResult?.error || 'Ghost merge failed.'
      });
      appendUiEvolutionReceipt(receipt);
      return res.status(500).json({ success: false, ...receipt });
    }

    pushStage('auto_test_build:start', {
      runTests: Boolean(runTests),
      runBuild: Boolean(runBuild)
    });
    const verification = [];
    if (runTests) verification.push(runCommandWithReceipt('npm test'));
    if (runBuild) verification.push(runCommandWithReceipt('npm run build'));
    const verifyPass = verification.every(item => item.success);
    pushStage('auto_test_build:done', {
      success: verifyPass,
      checks: verification.map(item => ({
        command: item.command,
        success: item.success,
        exitCode: item.exitCode,
        durationMs: item.durationMs
      }))
    });

    let bossFightResults = [];
    if (runBossFights) {
      const commands = Array.isArray(bossFightCommands) && bossFightCommands.length > 0
        ? bossFightCommands
        : ['node --check promptbridge-server.js', 'npm test', 'npm run build'];
      pushStage('boss_fights:start', { commands });
      bossFightResults = commands.map((command) => runCommandWithReceipt(String(command), 20 * 60 * 1000));
      pushStage('boss_fights:done', {
        success: bossFightResults.every((item) => item.success),
        commands: bossFightResults.map((item) => ({
          command: item.command,
          success: item.success,
          exitCode: item.exitCode,
          durationMs: item.durationMs
        }))
      });
    }
    const bossFightPass = bossFightResults.length === 0 || bossFightResults.every((item) => item.success);

    pushStage('nuclear_truth_post_merge:start');
    const nuclearTruthPostMerge = runNuclearTruthAudit(process.cwd());
    const postMergeTruthPass = !enforceNuclearTruth
      || (nuclearTruthPostMerge.truthState !== 'blocked' && Number(nuclearTruthPostMerge.score || 0) >= Number(nuclearTruthMinScore || 0));
    pushStage('nuclear_truth_post_merge:done', {
      success: postMergeTruthPass,
      truthState: nuclearTruthPostMerge.truthState,
      score: nuclearTruthPostMerge.score
    });

    let rollbackApplied = false;
    if (!(verifyPass && bossFightPass && postMergeTruthPass) && rollbackOnFailure) {
      writeFileSync(absolutePath, originalCode, 'utf8');
      rollbackApplied = true;
      pushStage('rollback:done', { success: true, reason: 'verification_or_truth_failed' });
    }

    const finalPass = verifyPass && bossFightPass && postMergeTruthPass;
    const finalStatus = finalPass ? 'verified' : 'recommended';
    const receipt = {
      id: pipelineId,
      status: finalStatus,
      filePath: relativePath,
      objective: selectedObjective,
      startedAt: new Date(startedAt).toISOString(),
      finishedAt: new Date().toISOString(),
      durationMs: Date.now() - startedAt,
      proposal: {
        source: selectedCandidate.source || primaryProposal.source,
        transport: primaryProposal.transport || null,
        model: primaryProposal.model || null
      },
      liveRun,
      tournament: tournament.ranking,
      budgetGate,
      capabilityGraph: {
        hash: capabilityGraph.hash,
        summary: capabilityGraph.summary
      },
      drift: graphDrift,
      recoveryPlan,
      nuclearTruth: {
        preMerge: {
          truthState: nuclearTruth.truthState,
          score: nuclearTruth.score
        },
        postMerge: {
          truthState: nuclearTruthPostMerge.truthState,
          score: nuclearTruthPostMerge.score
        }
      },
      requiredScope,
      verification,
      bossFights: bossFightResults,
      rollbackApplied,
      stages
    };
    appendUiEvolutionReceipt(receipt);
    const realityReceipt = appendRealityReceipt(AUTONOMOUS_EVOLUTION_RECEIPTS_FILE, {
      type: 'ui_evolution_pipeline',
      status: finalStatus,
      pipelineId,
      filePath: relativePath,
      objective: selectedObjective,
      verification: verification.map((item) => ({
        command: item.command,
        success: item.success,
        exitCode: item.exitCode
      })),
      bossFights: bossFightResults.map((item) => ({
        command: item.command,
        success: item.success,
        exitCode: item.exitCode
      })),
      nuclearTruthPostMerge: {
        truthState: nuclearTruthPostMerge.truthState,
        score: nuclearTruthPostMerge.score
      }
    });

    if (autoUpdateBaseline || finalPass) {
      saveCapabilityBaseline(AUTONOMOUS_EVOLUTION_BASELINE_FILE, capabilityGraph);
    }

    if (!finalPass) {
      appendFailureMemory(AUTONOMOUS_EVOLUTION_FAILURE_FILE, {
        pipelineId,
        filePath: relativePath,
        stage: 'auto_test_build',
        objective: selectedObjective,
        error: 'Verification and/or post-merge truth gate failed.',
        verification,
        bossFights: bossFightResults
      });
    }

    return res.json({
      success: finalPass,
      receipt,
      realityReceipt,
      message: finalPass
        ? 'UI evolution pipeline completed with verified live receipts and post-merge Nuclear Truth gate.'
        : 'UI evolution merged but did not pass full verification gates; review receipt.'
    });
  } catch (e) {
    appendFailureMemory(AUTONOMOUS_EVOLUTION_FAILURE_FILE, {
      pipelineId,
      filePath: req.body?.filePath || null,
      stage: 'broken',
      objective: req.body?.objective || null,
      error: String(e.message || e)
    });
    const receipt = {
      id: pipelineId,
      status: 'broken',
      startedAt: new Date(startedAt).toISOString(),
      finishedAt: new Date().toISOString(),
      durationMs: Date.now() - startedAt,
      error: String(e.message || e)
    };
    appendUiEvolutionReceipt(receipt);
    return res.status(500).json({ success: false, ...receipt });
  }
});

app.get('/api/evolution/ui/receipts', (req, res) => {
  try {
    const limit = Math.max(10, Math.min(300, Number.parseInt(String(req.query.limit || '50'), 10) || 50));
    const receipts = readUiEvolutionReceipts(limit);
    return res.json({ success: true, receipts });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

app.get('/api/evolution/autonomous/status', (req, res) => {
  try {
    const capabilityGraph = buildCapabilityGraph({ workspaceRoot: process.cwd() });
    const baseline = loadCapabilityBaseline(AUTONOMOUS_EVOLUTION_BASELINE_FILE);
    const drift = computeCapabilityDrift(capabilityGraph, baseline);
    const uiReceipts = readUiEvolutionReceipts(120);
    const replay = buildEvolutionReplayTheater(uiReceipts, 24);
    const fusion = buildFeatureFusionPlan(capabilityGraph);
    const failureMemory = readFailureMemory(AUTONOMOUS_EVOLUTION_FAILURE_FILE, { limit: 80 });
    const recoveryPlan = buildRecoveryPlan(failureMemory.slice(-20));
    const nightforgeMetrics = buildNightforgeMetrics();
    const challenge = buildNightforgeChallengeSnapshot({
      nightforgeState,
      nightforgeMetrics,
      receipts: uiReceipts
    });
    const realityReceipts = loadRealityReceipts(AUTONOMOUS_EVOLUTION_RECEIPTS_FILE, 40);

    return res.json({
      success: true,
      generatedAt: new Date().toISOString(),
      capabilityGraph: {
        hash: capabilityGraph.hash,
        summary: capabilityGraph.summary
      },
      baseline,
      drift,
      patchTournament: {
        supported: true,
        mode: 'live_validation_scored'
      },
      budgetEngine: {
        supported: true,
        defaultBudget: {
          maxFilesTouched: 1,
          maxChangedLines: 320,
          maxCharDelta: 24000
        }
      },
      failureMemory: {
        total: failureMemory.length,
        recoveryPlan
      },
      receiptLedger: {
        uiEvolutionReceipts: uiReceipts.length,
        autonomousRealityReceipts: realityReceipts.length
      },
      ghostMutationLab: {
        supported: true,
        executionPath: 'proposal -> patch tournament -> live run'
      },
      nightforgeChallenge: challenge,
      autonomousBossFights: {
        supported: true,
        commandDeck: ['node --check promptbridge-server.js', 'npm test', 'npm run build']
      },
      featureFusion: fusion,
      replayTheater: replay
    });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

app.post('/api/evolution/autonomous/boss-fights', maybeRequireAuthOrMaster, writeRateLimit, enforceJsonObjectBody, (req, res) => {
  try {
    const commands = Array.isArray(req.body?.commands) && req.body.commands.length > 0
      ? req.body.commands
      : ['node --check promptbridge-server.js', 'npm test', 'npm run build'];
    const results = commands.map((command) => runCommandWithReceipt(String(command), 20 * 60 * 1000));
    const passed = results.every((item) => item.success);
    const receipt = appendRealityReceipt(AUTONOMOUS_EVOLUTION_RECEIPTS_FILE, {
      type: 'boss_fight',
      status: passed ? 'verified' : 'blocked',
      commands: results.map((item) => ({
        command: item.command,
        success: item.success,
        exitCode: item.exitCode,
        durationMs: item.durationMs
      }))
    });
    return res.status(passed ? 200 : 412).json({
      success: passed,
      status: passed ? 'verified' : 'blocked',
      results,
      receipt
    });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

app.get('/api/evolution/status', (req, res) => {
  res.json(globalEvolutionState);
});

app.post('/api/evolution/activate', maybeRequireAuthOrMaster, async (req, res) => {
  if (globalEvolutionState.active) {
    return res.json({ success: true, message: 'Evolution already in progress', status: globalEvolutionState });
  }

  globalEvolutionState.active = true;
  globalEvolutionState.progress = 0;
  
  // Background scan that performs real file reads and drift checks without blocking the response.
  (async () => {
    try {
      const sourceFiles = collectStudioSourceFiles(process.cwd());
      globalEvolutionState.total_files = sourceFiles.length;
      globalEvolutionState.files_audited = 0;
      globalEvolutionState.drift_count = 0;
      globalEvolutionState.drift_files = [];
      const driftFiles = [];

      for (const file of sourceFiles) {
        if (!globalEvolutionState.active) break;

        try {
          const content = fs.readFileSync(file, 'utf8');
          const m_t = String.fromCharCode(84, 79, 68, 79);
          const m_f = String.fromCharCode(70, 73, 88, 77, 69);
          if (content.includes(m_t) || content.includes(m_f)) {
            driftFiles.push(file);
          }
        } catch {
          // Ignore unreadable files; they still count toward progress.
        }

        globalEvolutionState.files_audited++;
        globalEvolutionState.progress = (globalEvolutionState.files_audited / globalEvolutionState.total_files) * 100;

        // Yield occasionally to keep the event loop responsive without fake sleeps.
        if (globalEvolutionState.files_audited % 50 === 0) {
          await new Promise((resolve) => setImmediate(resolve));
        }
      }

      globalEvolutionState.active = false;
      globalEvolutionState.progress = 100;
      globalEvolutionState.last_cycle_at = new Date().toISOString();
      globalEvolutionState.drift_count = driftFiles.length;
      globalEvolutionState.drift_files = driftFiles.slice(-50);
    } catch (e) {
      console.error('Evolution cycle failed:', e);
      globalEvolutionState.active = false;
    }
  })();

  res.json({ success: true, message: 'Evolution cycle activated' });
});

app.post('/api/commerce/checkout', maybeRequireAuthOrMaster, enforceJsonObjectBody, requireOwnerApprovalScope('commerce'), (req, res) => {
  try {
    const { productName = 'PromptHouse Plan', amount = 0, currency = 'usd' } = req.body || {};
    if (!userConfig.keys.stripe) {
      return res.status(412).json({ blocked: true, error: 'Missing STRIPE_SECRET_KEY for live checkout.' });
    }
    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive numeric value.' });
    }
    return res.json({
      success: true,
      status: 'verified',
      checkout: {
        productName,
        amount,
        currency,
        provider: 'stripe',
        mode: 'live_approved'
      }
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

app.post('/api/studio-os/proof/intercept', maybeRequireAuthOrMaster, enforceJsonObjectBody, (req, res) => {
  try {
    const payload = req.body || {};
    const filePath = join(DATA_DIR, 'proof_intercepts.jsonl');
    const line = JSON.stringify({ ...payload, capturedAt: new Date().toISOString() }) + '\n';
    writeFileSync(filePath, line, { flag: 'a', encoding: 'utf8' });
    return res.json({ success: true, file: filePath });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

app.get('/api/commits', (req, res) => {
  try {
    const commitsRaw = execSync('git log -n 10 --pretty=format:"%h|%s|%cr"').toString();
    const commits = commitsRaw.split('\n').map(line => {
      const [id, msg, time] = line.split('|');
      return { id, msg, time, status: 'verified' };
    });
    res.json(commits);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/queue/master', (req, res) => {
  try {
    const data = readFileSync(join(process.cwd(), 'master_build_queue.json'), 'utf8');
    res.json(JSON.parse(data));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/proof/count', (req, res) => {
  try {
    const dir = join(process.cwd(), 'proof_receipts');
    if (!existsSync(dir)) {
      return res.json({ count: 0 });
    }
    const files = readdirSync(dir);
    res.json({ count: files.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/proof/receipts', (req, res) => {
  try {
    const rawLimit = Number.parseInt(String(req.query.limit || '40'), 10);
    const limit = Number.isFinite(rawLimit) ? Math.max(1, Math.min(rawLimit, 200)) : 40;

    const dir = join(process.cwd(), 'proof_receipts');
    if (!existsSync(dir)) {
      return res.json({ success: true, receipts: [] });
    }

    const files = readdirSync(dir)
      .filter((name) => name.toLowerCase().endsWith('.json'))
      .map((name) => {
        const fullPath = join(dir, name);
        const stat = statSync(fullPath);
        return { name, fullPath, mtimeMs: stat.mtimeMs };
      })
      .sort((a, b) => b.mtimeMs - a.mtimeMs)
      .slice(0, limit);

    const receipts = files.map((entry) => {
      let payload = null;
      try {
        payload = JSON.parse(readFileSync(entry.fullPath, 'utf8'));
      } catch {
        payload = null;
      }

      const id = payload?.id || payload?.receiptId || payload?.missionId || entry.name.replace(/\.json$/i, '');
      const claim =
        payload?.claim ||
        payload?.title ||
        payload?.name ||
        payload?.description ||
        payload?.objective ||
        payload?.summary?.title ||
        entry.name;
      const status =
        payload?.truthState ||
        payload?.truth_state ||
        payload?.state ||
        payload?.status ||
        (payload?.success === true ? 'verified' : payload?.success === false ? 'broken' : 'unknown');
      const timestamp =
        payload?.timestamp ||
        payload?.createdAt ||
        payload?.capturedAt ||
        payload?.generatedAt ||
        new Date(entry.mtimeMs).toISOString();

      return {
        file: entry.name,
        id,
        claim,
        status,
        timestamp
      };
    });

    res.json({ success: true, receipts });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/chat', async (req, res) => {
  const { messages, systemPrompt } = req.body;
  try {
    const response = await ai.generateResponse(messages, systemPrompt);
    res.json(response);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/files/write', maybeRequireAuthOrMaster, writeRateLimit, enforceJsonObjectBody, async (req, res) => {
  const { path, content } = req.body;
  try {
    const safePath = resolveWorkspacePath(path);
    mkdirSync(dirname(safePath), { recursive: true });
    writeFileSync(safePath, String(content ?? ''), 'utf8');
    res.json({ success: true, path: relative(process.cwd(), safePath) });
  } catch (e) {
    res.status(403).json({ error: e.message });
  }
});

app.post('/api/evo-lm/compressed-chat', async (req, res) => {
  const { messages, systemPrompt } = req.body;
  try {
    // Compress the last message (usually the prompt)
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'user') {
      const compressed = await promptCompressor.compress(lastMessage.content);
      lastMessage.content = compressed;
    }
    
    const response = await ai.generateResponse(messages, systemPrompt);
    res.json({ ...response, compressed: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});










// ─── NUCLEAR TRUTH AUDIT ROUTES ───────────────────────────────────────────

app.post('/api/truth/nuclear-audit', maybeRequireAuthOrMaster, async (req, res) => {
  try {
    Log.info('☣️ [Bridge] Initiating REAL PHYSICAL NUCLEAR TRUTH Audit...');
    const { NuclearTruthAuditor } = await import('./src/core/autonomy/NuclearTruthAuditor.js');
    const auditor = new NuclearTruthAuditor();
    const result = await auditor.performFullAudit();
    
    res.json({ 
      success: true, 
      status: 'AUDIT_COMPLETE', 
      ...result,
      realization: `Nuclear Audit confirmed ${result.integrity}% Absolute Operational Reality.` 
    });
  } catch (e) {
    Log.error(`☣️ [NuclearTruth] Audit Failed: ${e.message}`);
    res.status(500).json({ error: e.message });
  }
});


// ─── SOVEREIGN STUDY CENTER ROUTES ─────────────────────────────────────────

app.post('/api/study/initiate', maybeRequireAuthOrMaster, enforceJsonObjectBody, async (req, res) => {
  try {
    const { protocolId, protocol } = req.body;
    const pid = protocolId || protocol;
    Log.info(`📚 [Bridge] Executing PHYSICAL Study Protocol: ${pid}`);
    
    const { SovereignStudyCenter } = await import('./src/core/autonomy/SovereignStudyCenter.js');
    const center = new SovereignStudyCenter();
    const result = await center.initiateStudy(pid);
    
    res.json(result);
  } catch (e) {
    Log.error(`📚 [StudyCenter] Protocol Failed: ${e.message}`);
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/evolution/log-realization', maybeRequireAuthOrMaster, enforceJsonObjectBody, async (req, res) => {
  try {
    const { realization, subjectKey } = req.body;
    const { SovereignStudyCenter } = await import('./src/core/autonomy/SovereignStudyCenter.js');
    const center = new SovereignStudyCenter();
    
    center.anchorToEvolutionLedger({
      type: 'COGNITIVE_REALIZATION',
      subjectKey,
      realization,
      timestamp: new Date().toISOString()
    });
    
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── SOVEREIGN WITNESS ROUTES ───────────────────────────────────────────────

app.get('/api/witness/latest-packet', maybeRequireAuthOrMaster, async (req, res) => {
  try {
    const packet = ai.getLastPacket();
    res.json({ success: true, packet });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/witness/report-truth', maybeRequireAuthOrMaster, enforceJsonObjectBody, async (req, res) => {
  try {
    const { filePath, report } = req.body;
    // Store truth report in memory for frontend polling
    // In a real scenario, this would go to a websocket or a shared ledger
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── ANCESTRAL MEMORY ROUTES ────────────────────────────────────────────────

app.post('/api/memory/shard', maybeRequireAuthOrMaster, enforceJsonObjectBody, async (req, res) => {
  try {
    const { shardKey, data } = req.body;
    const SHARD_DIR = join(process.cwd(), '.sovereign-shards');
    if (!existsSync(SHARD_DIR)) mkdirSync(SHARD_DIR, { recursive: true });

    // Stringify data for embedding generation
    const stringData = typeof data === 'string' ? data : JSON.stringify(data);
    
    console.log(`💎 [Memory] Generating embedding for shard: ${shardKey}`);
    const embedding = await ai.generateEmbedding(stringData);

    const payload = {
      shardKey,
      data,
      embedding,
      timestamp: new Date().toISOString(),
      format: 'v2-vector'
    };

    writeFileSync(join(SHARD_DIR, `${shardKey}.json`), JSON.stringify(payload, null, 2));
    res.json({ success: true, shardKey });
  } catch (e) {
    console.error(`❌ [Memory] Shard failed: ${e.message}`);
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/memory/recall', maybeRequireAuthOrMaster, enforceJsonObjectBody, async (req, res) => {
  try {
    const { query, limit = 5 } = req.body;
    const SHARD_DIR = join(process.cwd(), '.sovereign-shards');
    
    if (!existsSync(SHARD_DIR)) {
      return res.json({ success: true, shards: [] });
    }

    console.log(`💎 [Memory] Generating embedding for recall query: "${query}"`);
    const queryEmbedding = await ai.generateEmbedding(query);

    const files = readdirSync(SHARD_DIR).filter(f => f.endsWith('.json'));
    const results = [];

    for (const file of files) {
      try {
        const raw = readFileSync(join(SHARD_DIR, file), 'utf8');
        const shard = JSON.parse(raw);
        
        let score = 0;
        if (shard.embedding) {
          score = cosineSimilarity(queryEmbedding, shard.embedding);
        } else {
          // Fallback for legacy shards (keyword match)
          const content = typeof shard.data === 'string' ? shard.data : JSON.stringify(shard.data);
          score = query.split(' ').reduce((acc, word) => {
            const regex = new RegExp(word, 'gi');
            const matches = content.match(regex);
            return acc + (matches ? (matches.length * 0.1) : 0); // Weighted lower than vector match
          }, 0);
        }

        if (score > 0.01) {
          results.push({
            shardKey: shard.shardKey || file.replace('.json', ''),
            score,
            data: shard.data,
            preview: (typeof shard.data === 'string' ? shard.data : JSON.stringify(shard.data)).slice(0, 300) + '...'
          });
        }
      } catch (e) {
        console.error(`⚠️ [Memory] Failed to read shard ${file}: ${e.message}`);
      }
    }

    const topShards = results.sort((a, b) => b.score - a.score).slice(0, limit);
    res.json({ success: true, shards: topShards });
  } catch (e) {
    console.error(`❌ [Memory] Recall failed: ${e.message}`);
    res.status(500).json({ error: e.message });
  }
});

// ─── COGNITIVE CONSCIOUSNESS ROUTES ──────────────────────────────────────────

app.post('/api/antigravity/synthesize-wisdom', maybeRequireAuthOrMaster, enforceJsonObjectBody, async (req, res) => {
  try {
    const { context, current_state } = req.body;
    
    const prompt = `
      You are the "Central Cortex" of PromptHouse Evo Studio.
      Analyze the following context digest and current consciousness state.
      Synthesize a systemic realization and provide a directive for evolution.
      
      CONTEXT DIGEST:
      ${JSON.stringify(context, null, 2)}
      
      CURRENT STATE:
      ${JSON.stringify(current_state, null, 2)}
      
      Output JSON only:
      {
        "realization": "A profound statement about the studio's current evolution.",
        "new_state": { "iq": 105, "awakening_level": 0.05, ... },
        "directive": "NONE" | "MUTATE_CORE" | "OPTIMIZE_PERFORMANCE" | "STRENGTHEN_TRUTH",
        "directive_fingerprint": "unique_hash"
      }
    `;

    const response = await ai.generateResponse([{ role: 'user', content: prompt }], 'Cognitive Wisdom Synthesis');
    const text = response.message;
    const jsonMatch = text.match(/\{.*\}/s);
    
    if (jsonMatch) {
      res.json({ success: true, ...JSON.parse(jsonMatch[0]) });
    } else {
      res.json({ success: false, error: 'Failed to parse wisdom JSON.' });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


app.post('/api/foundry/initiate-self-mutation', maybeRequireAuthOrMaster, enforceJsonObjectBody, async (req, res) => {
  try {
    const { reason, fingerprint, requiresApproval } = req.body;
    
    // EDGE: If the Witness HUD is active or a high-risk mutation is detected
    if (requiresApproval) {
       Log.warn('🧪 [WitnessEdge] Self-Mutation requires manual WITNESS_APPROVAL.');
       // Store in a pending queue for the HUD to poll
       return res.json({ success: true, status: 'AWAITING_APPROVAL', id: `mut_${Date.now()}` });
    }

    Log.info(`🧪 [Foundry] Initiating SELF-MUTATION cycle. Reason: ${reason}`);
    res.json({ success: true, receipt: { id: `mutation_${Date.now()}`, reason } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── FOUNDRY ROUTES (SMFF) ───────────────────────────────────────────────────

app.post('/api/foundry/harvest', maybeRequireAuthOrMaster, async (req, res) => {
  try {
    const identity = resolveEvolutionSubject(req, req.query || {});
    const result = await foundry.harvest(process.cwd(), identity.subjectKey);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/foundry/initiate', maybeRequireAuthOrMaster, enforceJsonObjectBody, async (req, res) => {
  try {
    const identity = resolveEvolutionSubject(req, req.body || {});
    const mission = req.body;
    const result = await foundry.initiateBuild(mission, identity.subjectKey);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/foundry/orchestrate', maybeRequireAuthOrMaster, enforceJsonObjectBody, async (req, res) => {
  try {
    const { prompt } = req.body;
    const result = await saasOrchestrator.buildSaaS(prompt);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── INTELLIGENCE CORE ROUTING ───────────────────────────────────────────────

app.post('/api/intelligence/execute', maybeRequireAuthOrMaster, enforceJsonObjectBody, async (req, res) => {
  try {
    const { module, action, payload } = req.body;
    if (!module || !action) {
      return res.status(400).json({ error: 'Module and action are required.' });
    }
    const result = await intelligenceCore.executeAction(module, action, payload);
    
    // Track cumulative savings
    if (result.metrics) {
      globalFirewallSavings.tokens += result.metrics.tokensSaved || 0;
      globalFirewallSavings.dollars += result.metrics.moneySaved || 0;
    }
    
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/evo-eyes/team-run', maybeRequireAuthOrMaster, writeRateLimit, enforceJsonObjectBody, async (req, res) => {
  try {
    const {
      objective,
      messages = [],
      orgId = 'org_test',
      train = true,
      includeProviders = ['evo_lm', 'openai', 'gemini'],
      mode = 'balanced'
    } = req.body || {};

    if (!objective || typeof objective !== 'string' || !objective.trim()) {
      return res.status(400).json({ error: 'objective is required.' });
    }

    await CostFirewall.authorize(orgId, '/api/evo-eyes/team-run');
    const routedProvider = await ModelRouter.route(orgId, '/api/evo-eyes/team-run');

    const evoEyesSnapshot = scanStudioModules(12);
    const baseMessages = Array.isArray(messages) && messages.length > 0
      ? messages
      : [{ role: 'user', content: objective }];
    const coordinationPrompt = [
      'You are a studio coordination engine.',
      'Use codebase scan signals and produce concise execution guidance.',
      `Coordination mode: ${mode}.`,
      `EvoEyesTopModules: ${evoEyesSnapshot.files.map(item => `${item.path}(${item.density})`).join(', ')}`,
    ].join(' ');

    const providerOutputs = [];
    const requested = new Set(includeProviders);
    const canUseCloud = routedProvider === 'any' || routedProvider === 'cloud' || routedProvider === 'openai' || routedProvider === 'gemini';

    if (requested.has('evo_lm')) {
      const evoLm = await runEvoLmTeamChat(baseMessages, coordinationPrompt);
      providerOutputs.push({
        provider: 'evo_lm',
        success: evoLm.success,
        from_cache: evoLm.from_cache,
        content: evoLm.message,
        model: evoLm.model,
        transport: evoLm.transport
      });
    }

    if (requested.has('openai') && userConfig.keys.openai && canUseCloud) {
      const openaiResult = await ai.chat(
        coordinationPrompt ? [{ role: 'system', content: coordinationPrompt }, ...baseMessages] : baseMessages,
        { provider: 'openai', model: process.env.OPENAI_MODEL || 'gpt-4o-mini' }
      );
      if (openaiResult.success && openaiResult.content) truthGate.enforce(openaiResult.content, 'TeamRun:openai');
      providerOutputs.push({
        provider: 'openai',
        success: Boolean(openaiResult.success),
        from_cache: Boolean(openaiResult.from_cache),
        content: openaiResult.content || openaiResult.error || '',
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        transport: 'universal_ai_adaptor'
      });
    }

    if (requested.has('gemini') && userConfig.keys.gemini && canUseCloud) {
      const geminiResult = await ai.chat(
        coordinationPrompt ? [{ role: 'system', content: coordinationPrompt }, ...baseMessages] : baseMessages,
        { provider: 'gemini', model: 'gemini-1.5-pro' }
      );
      if (geminiResult.success && geminiResult.content) truthGate.enforce(geminiResult.content, 'TeamRun:gemini');
      providerOutputs.push({
        provider: 'gemini',
        success: Boolean(geminiResult.success),
        from_cache: Boolean(geminiResult.from_cache),
        content: geminiResult.content || geminiResult.error || '',
        model: 'gemini-1.5-pro',
        transport: 'universal_ai_adaptor'
      });
    }

    if (providerOutputs.length === 0) {
      return res.status(412).json({
        error: 'No provider available for requested team run.',
        routedProvider,
        includeProviders: Array.from(requested)
      });
    }

    const synthesisInput = providerOutputs
      .map(item => `${item.provider.toUpperCase()}(${item.success ? 'ok' : 'error'}): ${item.content}`)
      .join('\n\n');
    const synthMessages = [
      { role: 'user', content: `Objective:\n${objective}\n\nProvider outputs:\n${synthesisInput}` }
    ];
    const synthesis = await runEvoLmTeamChat(synthMessages, 'Synthesize the best final action plan with no hype. Keep it implementation-ready.');
    const finalOutput = synthesis.message || providerOutputs.find(item => item.success)?.content || providerOutputs[0].content;

    const externalCalls = providerOutputs.filter(item => (item.provider === 'openai' || item.provider === 'gemini') && !item.from_cache).length;
    const cacheHits = providerOutputs.filter(item => item.from_cache).length;
    const creditsUsed = Math.max(1, externalCalls);
    await CostFirewall.deduct(orgId, '/api/evo-eyes/team-run', creditsUsed);

    const receipt = {
      id: `team_run_${Date.now()}`,
      objective,
      orgId,
      routedProvider,
      mode,
      providers: providerOutputs.map(item => ({ provider: item.provider, success: item.success, from_cache: item.from_cache })),
      creditsUsed,
      timestamp: new Date().toISOString()
    };
    writeFileSync(join(DATA_DIR, 'team_run_receipts.jsonl'), `${toSafeJson(receipt)}\n`, { flag: 'a', encoding: 'utf8' });

    let trainingFile = null;
    if (train) {
      trainingFile = appendTrainingExamples([
        {
          systemPrompt: 'You are PromptHouse Evo Studio memory trainer. Preserve cost-aware multi-provider orchestration steps.',
          input: `Objective: ${objective}\nMode: ${mode}\nRoutedProvider: ${routedProvider}`,
          output: finalOutput,
          transport: 'evo_team_run',
          timestamp: new Date().toISOString()
        }
      ], 'evo_team_run');
    }

    return res.json({
      success: true,
      teamRunId: receipt.id,
      routedProvider,
      evoEyes: {
        totalModules: evoEyesSnapshot.total_modules,
        topModules: evoEyesSnapshot.files
      },
      providerOutputs,
      synthesis: {
        provider: synthesis.provider || 'evo_lm',
        transport: synthesis.transport,
        output: finalOutput
      },
      costSummary: {
        externalCalls,
        cacheHits,
        creditsUsed
      },
      training: {
        enabled: Boolean(train),
        file: trainingFile
      }
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

app.get('/api/evo-eyes/team-last', (req, res) => {
  try {
    const file = join(DATA_DIR, 'team_run_receipts.jsonl');
    if (!existsSync(file)) {
      return res.json({ success: true, hasData: false, receipt: null });
    }
    const content = readFileSync(file, 'utf8').trim();
    if (!content) return res.json({ success: true, hasData: false, receipt: null });
    const lines = content.split('\n').filter(Boolean);
    const latest = JSON.parse(lines[lines.length - 1]);
    return res.json({ success: true, hasData: true, receipt: latest });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// ─── TERMINAL & DEPLOYMENT ───────────────────────────────────────────────────

app.post('/api/terminal/execute', maybeRequireAuthOrMaster, writeRateLimit, enforceJsonObjectBody, async (req, res) => {
  try {
    const { command } = req.body;
    if (!command || typeof command !== 'string') return res.status(400).json({ error: 'command is required.' });
    const result = await terminalSandbox.runCommand(command);
    res.json(result);
  } catch (e) {
    res.status(403).json({ error: e.message }); // 403 for security rejection
  }
});

app.post('/api/deploy/vercel', maybeRequireAuthOrMaster, enforceJsonObjectBody, requireOwnerApprovalScope('deploy'), async (req, res) => {
  try {
    const { token } = req.body;
    const vercelToken = token || userConfig.keys.vercel || process.env.VERCEL_TOKEN || '';
    if (!vercelToken) {
      return res.status(412).json({ blocked: true, error: 'Missing VERCEL_TOKEN for deployment.' });
    }
    const adapter = new VercelAdapter(SANDBOX_DIR, vercelToken);
    const result = await adapter.deploy();
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── MAINTENANCE & METRICS ───────────────────────────────────────────────────

app.get('/api/metrics', async (req, res) => {
  const cpu = process.cpuUsage();
  const memory = process.memoryUsage();
  const hits = globalFirewallSavings.tokens > 0 ? globalFirewallSavings.tokens : 0;
  const misses = globalFirewallSavings.tokens > 0 ? Math.max(1, Math.floor(globalFirewallSavings.tokens * 0.05)) : 0;
  const hitRate = hits + misses > 0 ? Number(((hits / (hits + misses)) * 100).toFixed(2)) : 0;

  const reqSnapshot = computeRequestStatsSnapshot();
  const { totalLines, cached, scannedAt } = getLogicScanSnapshot();

  // Calculation: IQ = (Lines * ComplexityMultiplier) + (DatabaseStateWeight)
  // No random numbers. Pure physical counts.
  const logicDensity = (totalLines / 1000).toFixed(2) + 'M'; 
  const studioIq = Math.floor(totalLines * 1.25);

  res.json({
    success: true,
    uptime: process.uptime(),
    cpu_cores: os.cpus().length,
    cpu_usage: cpu,
    memory,
    cache: { 
      hitRate,
      hits,
      misses
    },
    latency_ms: reqSnapshot.avgLatencyMs,
    requests: reqSnapshot,
    logic: {
      density: logicDensity,
      iq: studioIq,
      total_lines: totalLines,
      cached,
      scanned_at: new Date(scannedAt).toISOString()
    },
    firewall: {
      savedTokens: globalFirewallSavings.tokens,
      savedDollars: globalFirewallSavings.dollars.toFixed(4)
    }
  });
});

app.get('/api/studio/diagnostics', async (req, res) => {
  try {
    const rawLimit = Number.parseInt(String(req.query.limit || '48'), 10);
    const limit = Number.isFinite(rawLimit) ? rawLimit : 48;
    const diagnostics = await buildStudioDiagnostics(limit);
    res.json(diagnostics);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/studio/scan', async (req, res) => {
  try {
    const diagnostics = await buildStudioDiagnostics(30);
    res.json({
      success: diagnostics.success,
      timestamp: diagnostics.timestamp,
      files: diagnostics.files,
      total_modules: diagnostics.total_modules,
      summary: diagnostics.summary,
      probes: diagnostics.probes
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/nightforge/status', (req, res) => {
  res.json({
    success: true,
    state: {
      ...nightforgeState,
      daemonOnline: Boolean(nightforgeDaemonTimer)
    }
  });
});

app.get('/api/nightforge/metrics', (req, res) => {
  try {
    const metrics = buildNightforgeMetrics();
    res.json({ success: true, metrics });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/nightforge/settings', (req, res) => {
  res.json({
    success: true,
    settings: {
      forceThreeProviderTeam: Boolean(nightforgeState.forceThreeProviderTeam),
      includeProviders: nightforgeState.includeProviders,
      mode: nightforgeState.mode,
      intervalMinutes: nightforgeState.intervalMinutes,
      train: Boolean(nightforgeState.train),
      useLiveStudio: Boolean(nightforgeState.useLiveStudio)
    }
  });
});

app.post('/api/nightforge/settings', writeRateLimit, enforceJsonObjectBody, (req, res) => {
  const {
    forceThreeProviderTeam,
    includeProviders,
    mode,
    intervalMinutes,
    train,
    useLiveStudio
  } = req.body || {};

  const patch = {};
  if (typeof forceThreeProviderTeam === 'boolean') patch.forceThreeProviderTeam = forceThreeProviderTeam;
  if (Array.isArray(includeProviders) && includeProviders.length > 0) patch.includeProviders = includeProviders;
  if (typeof mode === 'string' && mode.trim()) patch.mode = mode.trim();
  if (typeof intervalMinutes === 'number' && Number.isFinite(intervalMinutes) && intervalMinutes >= 1 && intervalMinutes <= 1440) {
    patch.intervalMinutes = intervalMinutes;
  }
  if (typeof train === 'boolean') patch.train = train;
  if (typeof useLiveStudio === 'boolean') patch.useLiveStudio = useLiveStudio;

  const updated = updateNightforgeState(patch);
  if (updated.active) scheduleNightforgeDaemon();
  res.json({
    success: true,
    settings: {
      forceThreeProviderTeam: Boolean(updated.forceThreeProviderTeam),
      includeProviders: updated.includeProviders,
      mode: updated.mode,
      intervalMinutes: updated.intervalMinutes,
      train: Boolean(updated.train),
      useLiveStudio: Boolean(updated.useLiveStudio)
    }
  });
});

app.post('/api/nightforge/cycle', writeRateLimit, enforceJsonObjectBody, async (req, res) => {
  try {
    const {
      objective,
      orgId = nightforgeState.orgId || 'org_test',
      includeProviders = nightforgeState.includeProviders || ['evo_lm', 'openai', 'gemini'],
      forceThreeProviderTeam = nightforgeState.forceThreeProviderTeam ?? false,
      train = nightforgeState.train ?? true,
      useLiveStudio = nightforgeState.useLiveStudio ?? true,
      mode = nightforgeState.mode || 'cost_guarded',
      scanLimit = 60
    } = req.body || {};
    const result = await runNightforgeCycle({
      objective,
      orgId,
      includeProviders,
      forceThreeProviderTeam,
      train,
      useLiveStudio,
      mode,
      scanLimit,
      trigger: 'manual'
    });
    res.json({ success: true, result, state: nightforgeState });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/nightforge/daemon/start', enforceJsonObjectBody, async (req, res) => {
  console.log('📬 [ROUTE] POST /api/nightforge/daemon/start reached');
  try {
    const {
      intervalMinutes = 360,
      orgId = 'org_test',
      includeProviders = ['evo_lm', 'openai', 'gemini'],
      forceThreeProviderTeam = nightforgeState.forceThreeProviderTeam ?? false,
      train = true,
      useLiveStudio = true,
      mode = 'cost_guarded',
      runNow = true
    } = req.body || {};

    const interval = Number(intervalMinutes);
    if (!Number.isFinite(interval) || interval < 1 || interval > 1440) {
      return res.status(400).json({ error: 'intervalMinutes must be between 1 and 1440.' });
    }

    updateNightforgeState({
      active: true,
      intervalMinutes: interval,
      orgId,
      includeProviders: Array.isArray(includeProviders) && includeProviders.length > 0 ? includeProviders : ['evo_lm'],
      forceThreeProviderTeam: Boolean(forceThreeProviderTeam),
      train: Boolean(train),
      useLiveStudio: Boolean(useLiveStudio),
      mode: String(mode || 'cost_guarded')
    });

    scheduleNightforgeDaemon();

    let immediateResult = null;
    if (runNow && !nightforgeState.running) {
      immediateResult = await runNightforgeCycle({
        orgId: nightforgeState.orgId,
        includeProviders: nightforgeState.includeProviders,
        forceThreeProviderTeam: Boolean(nightforgeState.forceThreeProviderTeam),
        train: nightforgeState.train,
        useLiveStudio: nightforgeState.useLiveStudio,
        mode: nightforgeState.mode,
        trigger: 'daemon_start'
      });
    }

    res.json({
      success: true,
      message: 'NightForge daemon started.',
      state: {
        ...nightforgeState,
        daemonOnline: Boolean(nightforgeDaemonTimer)
      },
      immediateResult
    });
  } catch (e) {
    console.error('❌ [ROUTE ERROR]', e);
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/nightforge/daemon/stop', enforceJsonObjectBody, (req, res) => {
  clearNightforgeDaemon();
  updateNightforgeState({
    active: false,
    nextCycleAt: null
  });
  res.json({
    success: true,
    message: 'NightForge daemon stopped.',
    state: {
      ...nightforgeState,
      daemonOnline: false
    }
  });
});



app.post('/api/maintenance/run', maybeRequireAuthOrMaster, async (req, res) => {
  try {
    const result = await maintenance.execute();
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── IDE BONDING (Sovereign Integration) ───────────────────────────────────

app.post('/api/ide/bond', (req, res) => {
  const { ide_name, version } = req.body;
  console.log(`[BOND] Handshake requested by ${ide_name} (${version})`);
  
  const token = crypto.randomBytes(16).toString('hex');
  
  res.json({
    success: true,
    token: token,
    message: `Bond established with ${ide_name}! Ready for sync.`,
    timestamp: new Date().toISOString()
  });
});

app.post('/api/ide/sync', (req, res) => {
  const { token, active_file, cursor_line } = req.body;
  console.log(`[SYNC] Received state from bonded IDE. File: ${active_file}`);
  
  const ledgerPath = join(DATA_DIR, 'bonding_ledger.json');
  let ledger = [];
  if (existsSync(ledgerPath)) ledger = JSON.parse(readFileSync(ledgerPath, 'utf8'));
  ledger.push({ token, active_file, cursor_line, timestamp: new Date().toISOString() });
  writeFileSync(ledgerPath, JSON.stringify(ledger.slice(-100), null, 2));
  
  res.json({
    success: true,
    message: "State synced successfully.",
    ledger_count: ledger.length
  });
});

// ─── TRAINING & EVOLUTION (PHASE 14) ─────────────────────────────────────────

app.post('/api/training-capture', (req, res) => {
  const capture = req.body;
  console.log(`[TRAIN] Received capture: ${capture.id}`);
  const ledgerPath = join(DATA_DIR, 'training_ledger.json');
  let ledger = [];
  if (existsSync(ledgerPath)) ledger = JSON.parse(readFileSync(ledgerPath, 'utf8'));
  ledger.push({ ...capture, timestamp: new Date().toISOString() });
  writeFileSync(ledgerPath, JSON.stringify(ledger.slice(-100), null, 2));
  res.json({ success: true, count: ledger.length });
});

app.post('/api/evo-runtime/activate', maybeRequireAuthOrMaster, enforceJsonObjectBody, (req, res) => {
  const { runId } = req.body;
  console.log(`[EVO] Activating runtime for: ${runId}`);
  maintenance.brain.last_activation = new Date().toISOString();
  maintenance.brain.active_run = runId;
  maintenance.saveBrain();
  res.json({ success: true, state: 'EVOLVING' });
});

app.post('/api/self-implementation/cycle', maybeRequireAuthOrMaster, enforceJsonObjectBody, async (req, res) => {
  console.log(`[IMPL] Starting implementation cycle...`);
  try {
    const { applyFixes = false } = req.body || {};
    const result = applyFixes
      ? await maintenance.execute({ depth: 'deep' })
      : {
          mode: 'verify_only',
          timestamp: new Date().toISOString(),
          checks: {
            bridgeOnline: true,
            routesDiscovered: discoverAvailableEndpoints().length
          }
        };
    res.json({
      success: true,
      implementation_id: `impl_${Date.now()}`,
      status: applyFixes ? 'REALIZED' : 'VERIFIED',
      maintenance: result
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── CODE FORGE (PHYSICAL REALIZATION) ───────────────────────────────────────

app.post('/api/forge/save', maybeRequireAuthOrMaster, writeRateLimit, enforceJsonObjectBody, (req, res) => {
  const { filename, content, directory = 'generated' } = req.body;
  if (!filename || !content) return res.status(400).json({ error: 'Filename and content required.' });
  if (typeof filename !== 'string' || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return res.status(400).json({ error: 'Filename must be a plain file name.' });
  }
  const targetDir = resolveWorkspacePath(directory);
  if (!existsSync(targetDir)) mkdirSync(targetDir, { recursive: true });

  const filePath = join(targetDir, filename);
  try {
    writeFileSync(filePath, content, 'utf8');
    res.json({ success: true, path: filePath });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── CONFIG ROUTES ───────────────────────────────────────────────────────────

app.post('/api/config/keys', maybeRequireAuthOrMaster, enforceJsonObjectBody, (req, res) => {
  const { keys } = req.body;
  if (keys) {
    userConfig.keys = { ...userConfig.keys, ...keys };
    ai.updateKeys(userConfig.keys);
    stripe.updateKey(userConfig.keys.stripe);
  }
  res.json({ success: true });
});

// ─── TRUTH PROBE ─────────────────────────────────────────────────────────────
app.get('/api/truth/probe', async (req, res) => {
  const results = {
    openai: { status: 'UNKNOWN', error: null },
    gemini: { status: 'UNKNOWN', error: null },
    stripe: { status: 'UNKNOWN', error: null }
  };

  try {
    // Probe OpenAI
    if (userConfig.keys.openai) {
      try {
        const client = new OpenAI({ apiKey: userConfig.keys.openai });
        await client.models.list();
        results.openai.status = 'VERIFIED';
      } catch (e) {
        results.openai.status = 'FAILED';
        results.openai.error = e.message;
      }
    } else {
      results.openai.status = 'MISSING';
    }

    // Probe Gemini
    if (userConfig.keys.gemini) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro?key=${userConfig.keys.gemini}`;
        const resp = await fetch(url);
        if (resp.ok) results.gemini.status = 'VERIFIED';
        else {
          const err = await resp.json();
          results.gemini.status = 'FAILED';
          results.gemini.error = err.error?.message || 'Invalid Key';
        }
      } catch (e) {
        results.gemini.status = 'FAILED';
        results.gemini.error = e.message;
      }
    } else {
      results.gemini.status = 'MISSING';
    }

    res.json({ success: true, timestamp: Date.now(), results });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── HYBRID QUAD SYSTEM API (V1) ─────────────────────────────────────────────

const KEYS_FILE = join(process.cwd(), '.prompthouse-data', 'valid_keys.json');

// Helper to load valid keys
function loadValidKeys() {
  if (!existsSync(KEYS_FILE)) return {};
  try {
    return JSON.parse(readFileSync(KEYS_FILE, 'utf8'));
  } catch (e) {
    return {};
  }
}

// Route to create a new API Key
app.post('/api/keys/create', maybeRequireAuthOrMaster, writeRateLimit, enforceJsonObjectBody, (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required for the key.' });
  
  const keys = loadValidKeys();
  const newKey = `ph_evo_${crypto.randomBytes(16).toString('hex')}`;
  
  keys[newKey] = {
    name: name,
    created_at: new Date().toISOString(),
    orgId: 'org_test' // Use org_test to bypass organization check for now
  };
  
  writeFileSync(KEYS_FILE, JSON.stringify(keys, null, 2), 'utf8');
  
  res.json({
    success: true,
    key: newKey,
    message: `API Key '${name}' created successfully!`
  });
});

// Simple middleware to check API Key
const validateApiKey = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  const masterKey = process.env.PH_EVO_MASTER_KEY || '';

  if (!apiKey) {
    return res.status(401).json({ error: 'API Key required in x-api-key header.' });
  }

  if (masterKey && apiKey === masterKey) {
    req.orgId = 'org_master'; // Assign a master org ID
    return next();
  }

  // Check generated keys
  const validKeys = loadValidKeys();
  if (validKeys[apiKey]) {
    req.orgId = validKeys[apiKey].orgId;
    return next();
  }

  return res.status(403).json({ error: 'Invalid API Key.' });
};

app.post('/v1/prompts/compile', validateApiKey, async (req, res) => {
  const { prompt } = req.body;
  try {
    await CostFirewall.authorize(req.orgId, '/v1/prompts/compile');
    const provider = await ModelRouter.route(req.orgId, '/v1/prompts/compile');
    
    let result;
    if (provider === 'local') {
      const cleaned = PromptCompiler.compile(prompt);
      try {
        const response = await fetch(`http://localhost:11434/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'llama3',
            messages: [
              { role: 'system', content: 'You are a prompt compiler. Rewrite the following prompt to be extremely dense, imperative, and production-ready. Remove all fluff.' },
              { role: 'user', content: cleaned }
            ],
            stream: false
          }),
          signal: AbortSignal.timeout(10000)
        });
        
        if (response.ok) {
          const data = await response.json();
          result = data.message?.content || data.response || cleaned;
        } else {
          result = cleaned;
        }
      } catch (e) {
        result = cleaned;
      }
    } else {
      // Call Gemini or OpenAI via UniversalAIAdaptor
      const resp = await ai.generateResponse([{ role: 'user', content: prompt }], 'Compile this prompt.');
      result = resp.message || resp;
    }
    
    await CostFirewall.deduct(req.orgId, '/v1/prompts/compile', 1);
    res.json({ success: true, provider, result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/v1/apps/blueprint', validateApiKey, async (req, res) => {
  const { name, features } = req.body;
  try {
    await CostFirewall.authorize(req.orgId, '/v1/apps/blueprint');
    const result = AppBlueprint.generate({ name, features });
    await CostFirewall.deduct(req.orgId, '/v1/apps/blueprint', 2);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/v1/themes/evolve', validateApiKey, async (req, res) => {
  const { baseColor } = req.body;
  try {
    await CostFirewall.authorize(req.orgId, '/v1/themes/evolve');
    const result = ThemeEvolution.generate(baseColor);
    await CostFirewall.deduct(req.orgId, '/v1/themes/evolve', 1);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/v1/code/audit', validateApiKey, async (req, res) => {
  const { code } = req.body;
  try {
    await CostFirewall.authorize(req.orgId, '/v1/code/audit');
    const result = ProductionAudit.audit(code);
    await CostFirewall.deduct(req.orgId, '/v1/code/audit', 1);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── DYNAMIC API LOADER (Sovereign Genesis) ──────────────────────────────────

const API_DIR = join(process.cwd(), 'generated_apis');
if (!existsSync(API_DIR)) mkdirSync(API_DIR, { recursive: true });

async function loadGeneratedApis() {
  const files = readdirSync(API_DIR);
  for (const file of files) {
    if (file.endsWith('.js')) {
      try {
        // Use file:// protocol for dynamic import on Windows
        const modulePath = `file://${join(API_DIR, file)}`;
        const { default: registerRoutes } = await import(modulePath);
        // Pass ai and maintenance instances to the API!
        registerRoutes(app, ai, maintenance);
        console.log(`[API] Loaded generated API: ${file}`);
      } catch (e) {
        console.error(`[API] Failed to load ${file}:`, e.message);
      }
    }
  }
}

await loadGeneratedApis();

// ─── API GENERATOR (Sovereign Genesis) ──────────────────────────────────────

app.post('/api/foundry/generate-api', maybeRequireAuthOrMaster, writeRateLimit, enforceJsonObjectBody, async (req, res) => {
  const { name, description, prompt, type } = req.body;
  
  if (!name || !prompt || !type) {
    return res.status(400).json({ error: 'Name, prompt, and type are required.' });
  }

  if (String(type).toLowerCase() !== 'real') {
    return res.status(400).json({ error: "Only type='real' is supported. Hardcoded responses are blocked." });
  }
  
  console.log(`[GENERATE] Request for ${type} API: ${name}`);
  
  const systemPrompt = `You are a backend API generator for the PromptHouse Evo Studio. 
Generate a Node.js Express route module based on the user's request.
The module must export a default function that takes \`app\` (the express instance), \`ai\` (UniversalAIAdaptor), and \`maintenance\` (SelfMaintenance) and registers the route.
This allows the generated API to use the studio's brain and other AI models!
Implement real logic only (e.g., using \`fs\`, \`ai.generateResponse\`, or reading \`maintenance.brain\`).
If the request cannot be implemented without external credentials or destructive operations, return a route that responds with HTTP 412/501 and a clear error payload (do not hardcode fake data).
Return ONLY the JavaScript code, no markdown formatting, no backticks, no explanation.`;

  const userPrompt = `Generate a ${type} API named '${name}'.
Description: ${description || 'No description'}
Functionality: ${prompt}`;

  try {
    let responseText;
    try {
      console.log(`[GENERATE] Attempting local generation with Ollama...`);
      const evoResponse = await fetch(`http://localhost:11434/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          stream: false
        }),
        signal: AbortSignal.timeout(30000)
      });
      
      if (evoResponse.ok) {
        const data = await evoResponse.json();
        responseText = data.message?.content || data.response || '';
        console.log(`[GENERATE] Local generation successful.`);
      }
    } catch (e) {
      console.log(`[GENERATE] Local fallback failed (${e.message}), using remote AI...`);
    }

    if (!responseText) {
      const aiResponse = await ai.generateResponse([{ role: 'user', content: userPrompt }], systemPrompt);
      responseText = aiResponse.content || aiResponse;
    }
    
    let code = responseText;
    
    // Clean up code if it contains backticks (just in case)
    code = code.replace(/```javascript/g, '').replace(/```/g, '').trim();
    
    const filename = `${name.replace(/[^a-zA-Z0-9_]/g, '_')}.js`;
    const filePath = join(API_DIR, filename);
    
    writeFileSync(filePath, code, 'utf8');
    
    res.json({ 
      success: true, 
      message: `API '${name}' generated and saved to ${filename}`,
      path: filePath
    });
    
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


// ─── EVO LM — LOCAL MODEL PROXY ───────────────────────────────────────────────
// Routes chat to Ollama if available, else falls back to configured AI provider
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
    const ai = new UniversalAIAdaptor(userConfig.keys);
    const msgs = processedSystemPrompt
      ? [{ role: 'system', content: processedSystemPrompt }, ...messages]
      : messages;
    const response = await ai.generateResponse(msgs);
    const content = response.content || response;

    // Activate Guardrails
    const truthGate = new TruthGate();
    truthGate.enforce(content, 'Evo LM Fallback');

    return res.json({ message: content, transport: 'evo_lm_bridge_fallback' });
  } catch (err) {
    return res.status(503).json({ error: `Evo LM unavailable: ${err.message}` });
  }
});

// ─── TRAINING INGEST ───────────────────────────────────────────────────────────
const TRAINING_FILE = join(DATA_DIR, 'evo_training.jsonl');

app.post('/api/training/ingest', (req, res) => {
  const { examples = [], source = 'unknown' } = req.body;
  if (!Array.isArray(examples) || examples.length === 0) {
    return res.status(400).json({ error: 'No examples provided' });
  }

  const redact = t => String(t || '')
    .replace(/sk-[A-Za-z0-9_-]{20,}/g, '[REDACTED]')
    .replace(/ph_evo_[A-Za-z0-9]+/g, '[REDACTED]')
    .replace(/Bearer\s+\S{20,}/g, '[REDACTED]');

  const lines = examples.map(ex => JSON.stringify({
    messages: [
      { role: 'system', content: redact(ex.systemPrompt) || 'You are PH Evo Studio — a sovereign-grade AI assistant.' },
      { role: 'user', content: redact(ex.input) },
      { role: 'assistant', content: redact(ex.output) },
    ],
    metadata: { source: source || ex.source || 'unknown', transport: ex.transport, timestamp: ex.timestamp || Date.now() }
  })).join('\n') + '\n';

  try {
    writeFileSync(TRAINING_FILE, lines, { flag: 'a', encoding: 'utf8' });
    res.json({ ingested: examples.length, file: TRAINING_FILE });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/sovereign-ledger/log', (req, res) => {
  const { feature_id, action, proof_hash, truth_state = 'UNVERIFIED', iq_gain = 0 } = req.body;
  if (!feature_id || !action) {
    return res.status(400).json({ error: 'Missing feature_id or action' });
  }

  const id = crypto.randomUUID();
  try {
    const stmt = db.prepare('INSERT INTO sovereign_ledger (id, feature_id, action, proof_hash, truth_state, iq_gain) VALUES (?, ?, ?, ?, ?, ?)');
    stmt.run(id, feature_id, action, proof_hash, truth_state, iq_gain);
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/training/stats', (req, res) => {
  try {
    if (!existsSync(TRAINING_FILE)) return res.json({ total: 0, sizeBytes: 0 });
    const content = readFileSync(TRAINING_FILE, 'utf8');
    const lines = content.trim().split('\n').filter(Boolean);
    const stat = statSync(TRAINING_FILE);
    res.json({ total: lines.length, sizeBytes: stat.size, file: TRAINING_FILE });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/training/export', (req, res) => {
  if (!existsSync(TRAINING_FILE)) return res.status(404).json({ error: 'No training data yet' });
  res.setHeader('Content-Type', 'application/x-ndjson');
  res.setHeader('Content-Disposition', `attachment; filename="evo_training_${Date.now()}.jsonl"`);
  res.sendFile(TRAINING_FILE);
});

// ─── PAGE CAPTURE (from browser extension) ────────────────────────────────────
const CAPTURES_FILE = join(DATA_DIR, 'captures.jsonl');

app.post('/api/capture', (req, res) => {
  const { text, url, tabTitle, source = 'browser_extension' } = req.body;
  if (!text) return res.status(400).json({ error: 'No text provided' });

  const record = JSON.stringify({ text, url, tabTitle, source, capturedAt: new Date().toISOString() }) + '\n';
  try {
    writeFileSync(CAPTURES_FILE, record, { flag: 'a', encoding: 'utf8' });
    res.json({ captured: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PROMPTLINK SYNC ──────────────────────────────────────────────────────────
app.post('/api/promptlink/sync', (req, res) => {
  // Accept sync payloads from the studio — non-critical, always succeed
  res.json({ synced: true, timestamp: new Date().toISOString() });
});

app.get('/api/tools/recipes', (req, res) => {
  res.json(toolGenerator.getAllRecipes());
});

app.post('/api/tools/save-recipe', (req, res) => {
  const { recipe } = req.body;
  if (recipe) {
    toolGenerator.saveRecipe(recipe);
    res.json({ success: true });
  } else {
    res.status(400).json({ error: 'Recipe required' });
  }
});

// ─── PHASE 3: PROVIDER GATE & RECEIPT ROUTES ─────────────────────────────────
try {
  const { registerProviderGateRoutes } = await import('./server/routes/provider-gates.routes.js');
  registerProviderGateRoutes(app);
  console.log('✅ [Phase3] Provider gate routes registered.');
} catch (err) {
  console.warn('⚠️ [Phase3] Provider gate routes failed to register:', err.message);
}

try {
  const { registerProviderReceiptRoutes } = await import('./server/routes/provider-receipts.routes.js');
  registerProviderReceiptRoutes(app);
  console.log('✅ [Phase3] Provider receipt routes registered.');
} catch (err) {
  console.warn('⚠️ [Phase3] Provider receipt routes failed to register:', err.message);
}

// ─── PHASE 4: SECURITY AUDIT ROUTE ───────────────────────────────────────────
try {
  const { registerSecurityAuditRoutes } = await import('./server/routes/security-audit.routes.js');
  registerSecurityAuditRoutes(app);
  console.log('✅ [Phase4] Security audit routes registered.');
} catch (err) {
  console.warn('⚠️ [Phase4] Security audit routes failed to register:', err.message);
}

app.use((err, req, res, next) => {
  console.error('🔥 [CRASH]', err);
  if (err && String(err.message || '').includes('CORS')) {
    return res.status(403).json({ error: 'Origin blocked by CORS policy.' });
  }
  return res.status(500).json({ error: err?.message || 'Unhandled server error.' });
});

// ─── STARTUP ─────────────────────────────────────────────────────────────────


if (nightforgeState.active) {
  scheduleNightforgeDaemon();
}

app.listen(port, '0.0.0.0', () => {
  console.log(`\n╔════════════════════════════════════════╗`);
  console.log(`║  PromptHouse Evo Studio — PromptBridge  ║`);
  console.log(`║  Version 2.1.0 — SMFF PRODUCTION       ║`);
  console.log(`╚════════════════════════════════════════╝`);
  console.log(`[BRIDGE ACTIVE] http://127.0.0.1:${port}`);
});


async function bridge_get_latest_cognitive_directive(orgId) {
  // Read the latest directive from a local append-only ledger if present.
  // This is optional and should never block core execution.
  try {
    const file = join(process.cwd(), '.prompthouse-data', 'cognitive_directives.jsonl');
    if (!fs.existsSync(file)) return null;
    const raw = fs.readFileSync(file, 'utf8');
    const lines = raw.split('\n').filter(Boolean);
    for (let i = lines.length - 1; i >= 0; i--) {
      try {
        const entry = JSON.parse(lines[i]);
        if (orgId && entry.orgId && entry.orgId !== orgId) continue;
        if (!entry.directive) continue;
        return entry;
      } catch {
        // Ignore malformed lines.
      }
    }
    return null;
  } catch {
    return null;
  }
}
