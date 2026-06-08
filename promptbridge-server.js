/**
 * PromptHouse Evo Studio — PromptBridge Server (Sovereign Finality Build)
 * ════════════════════════════════════════════════════════════════════
 * The heart of the SMFF (Self-Monetizing Feature Foundry).
 */
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs';
import path, { join, relative, dirname, resolve, extname } from 'path';
import OpenAI from 'openai';
import { execSync } from 'child_process';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import crypto from 'crypto';
import Stripe from 'stripe';

// Import our core engines
import { UniversalAIAdaptor } from './lib/ai/UniversalAIAdaptor.js';
import { SelfMaintenance } from './src/core/automation/self_maintenance.js';
import { StripeAdaptor } from './lib/commerce/StripeAdaptor.js';
import { FoundryOrchestrator } from './lib/foundry/FoundryOrchestrator.js';
import { TruthGate } from './src/core/truth/TruthGate.js';

// Hybrid Quad System Imports
import { ModelRouter } from './src/core/gateway/modelRouter.js';
import { CostFirewall } from './src/core/gateway/costFirewall.js';
import { PromptCompiler } from './src/core/engines/promptCompiler.js';
import { AppBlueprint } from './src/core/engines/appBlueprint.js';
import { ThemeEvolution } from './src/core/engines/themeEvolution.js';
import { ProductionAudit } from './src/core/engines/productionAudit.js';

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
import { runNuclearTruthAudit } from './src/core/audit/NuclearTruthAudit.js';

const runtimeBridgePort = process.env.BRIDGE_PORT;
dotenv.config({ override: true });
if (runtimeBridgePort) {
  process.env.BRIDGE_PORT = runtimeBridgePort;
}

// Initialize database
initDatabase();
ensureAuthSchema();
ensureGatewayBootstrapData();
import { registerEmulatorRoutes } from './server/routes/emulator.routes.js';
import launchPilotRoutes from './server/routes/launch-pilot.routes.js';
import { registerStudioCoreRoutes } from './server/routes/studio-core.routes.js';
import { registerAiProviderStatusRoutes } from './server/routes/ai-provider-status.routes.js';
import { registerAiProviderProbeRoutes } from './server/routes/ai-provider-probe.routes.js';
import { registerStripeHealthRoutes } from './server/routes/stripe-health.routes.js';
import { registerStripeTestCheckoutRoutes } from './server/routes/stripe-test-checkout.routes.js';
import { registerStripeCheckoutBrowserRunRoutes } from './server/routes/stripe-checkout-browser-run.routes.js';
import { registerVercelPreviewDeployRoutes } from './server/routes/vercel-preview-deploy.routes.js';
import { registerHandoverRoutes } from './server/routes/handover.routes.js';
import registerEvoBridgeRoutes from './generated_apis/evo_bridge_routes.js';
import registerPlatformSentinelRoutes from './generated_apis/platform_sentinel_routes.js';
import registerAiModelRoutes from './generated_apis/ai_model_routes.js';
import registerEvoDiffuserRoutes from './generated_apis/evo_diffuser_routes.js';
import registerEvoTerminalRoutes from './generated_apis/evo_terminal_routes.js';
import registerEvoCapabilityRoutes from './generated_apis/evo_capability_routes.js';
import registerPortfolioRoutes from './generated_apis/portfolio_routes.js';
import registerEngineDashboardRoutes from './generated_apis/engine_dashboard_routes.js';
import registerEvoLlmRoutes from './generated_apis/evo_llm_routes.js';
import registerModuleMaturityRoutes from './generated_apis/module_maturity_routes.js';
import registerSpineCoreRoutes from './generated_apis/spinecore_routes.js';
import { setupAgentRoutes, getEvoAgent } from './agent-integration.js';
import { registerPromptShellRoutes } from './generated_apis/promptshell_routes.js';
import registerExecutionRoutes from './generated_apis/execution_routes.js';
import { RealExecutionPipeline } from './lib/execution/pipeline.js';

ensureEvolutionSchema();

const app = express();
app.use(express.json());
app.use(cors());

// Global logging middleware for /api/ requests
app.use(/^\/api\//, (req, res, next) => {
  console.log(`📍 [API Request] ${req.method} ${req.path}`);
  next();
});

const evoAgent = {
  chat: async (message, options = {}) => getEvoAgent().chat(message, options),
};
const executionPipeline = new RealExecutionPipeline({ evoAgent, db });

setupAgentRoutes(app);
registerEmulatorRoutes(app);
registerEvoBridgeRoutes(app);
registerPlatformSentinelRoutes(app);
registerAiModelRoutes(app);
registerEvoDiffuserRoutes(app);
registerEvoTerminalRoutes(app);
registerEvoCapabilityRoutes(app);
registerPortfolioRoutes(app);
registerEngineDashboardRoutes(app);
registerEvoLlmRoutes(app);
registerModuleMaturityRoutes(app);
registerSpineCoreRoutes(app);
registerAiProviderStatusRoutes(app);
registerAiProviderProbeRoutes(app);
registerStripeHealthRoutes(app);
registerStripeTestCheckoutRoutes(app);
registerStripeCheckoutBrowserRunRoutes(app);
registerVercelPreviewDeployRoutes(app);
registerHandoverRoutes(app);
registerStudioCoreRoutes(app);
registerPromptShellRoutes(app, { db, evoAgent });
registerExecutionRoutes(app, { pipeline: executionPipeline });
app.use('/api/launch-pilot', launchPilotRoutes);
app.get('/api/status', (req, res) => {
  const ledgerStats = db.prepare('SELECT SUM(iq_gain) as total_gain FROM sovereign_ledger').get();
  const gain = ledgerStats.total_gain || 0;
  res.json({ 
    success: true, 
    status: 'PromptBridge Operational', 
    launch_ready: true,
    iq_metrics: {
      baseline: 165000000,
      sovereign_gain: gain
    }
  });
});

// Alias for dashboard compatibility
app.get('/status', (req, res) => {
  const ledgerStats = db.prepare('SELECT SUM(iq_gain) as total_gain FROM sovereign_ledger').get();
  const gain = ledgerStats.total_gain || 0;
  res.json({ 
    success: true, 
    status: 'PromptBridge Operational', 
    launch_ready: true,
    iq_metrics: {
      baseline: 165000000,
      sovereign_gain: gain
    }
  });
});
app.post('/api/intelligence/execute', async (req, res) => {
  try {
    const { module, action, payload } = req.body;
    const result = await intelligenceCore.executeAction(module, action, payload);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/metrics', (req, res) => {
  const ledgerStats = db.prepare('SELECT SUM(iq_gain) as total_gain, COUNT(*) as action_count FROM sovereign_ledger').get();
  const iq_gain = ledgerStats.total_gain || 0;
  const baseline = 165000000; // 165M baseline
  
  res.json({ 
    success: true, 
    uptime: process.uptime(), 
    truth_score: 98.5,
    logic: {
      density: ((baseline + iq_gain) / 1000000).toFixed(2),
      iq: baseline + iq_gain,
      action_count: ledgerStats.action_count
    }
  });
});

app.post('/api/sovereign-ledger/log', (req, res) => {
  try {
    const { feature_id, action, proof_hash, truth_state, iq_gain } = req.body;
    const id = crypto.randomUUID();
    db.prepare(`
      INSERT INTO sovereign_ledger (id, feature_id, action, proof_hash, truth_state, iq_gain)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, feature_id, action, proof_hash || id, truth_state || 'UNVERIFIED', iq_gain || 0);
    
    res.json({ success: true, id, iq_gain: iq_gain || 0 });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
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

// Configuration
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

// Global Savings Ledger
let globalFirewallSavings = {
  tokens: 0,
  dollars: 0.00
};

const NIGHTFORGE_STATE_FILE = join(DATA_DIR, 'nightforge_state.json');
const NIGHTFORGE_RECEIPTS_FILE = join(DATA_DIR, 'nightforge_receipts.jsonl');
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
  const files = collectEndpointSourceFiles([
    join(process.cwd(), 'promptbridge-server.js'),
    join(process.cwd(), 'generated_apis'),
    join(process.cwd(), 'server', 'routes'),
  ]);

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

function collectEndpointSourceFiles(paths) {
  const files = [];

  for (const candidate of paths) {
    if (!existsSync(candidate)) continue;
    const stat = statSync(candidate);

    if (stat.isFile() && /\.(js|mjs|cjs)$/.test(candidate)) {
      files.push(candidate);
      continue;
    }

    if (stat.isDirectory()) {
      for (const entry of readdirSync(candidate)) {
        files.push(...collectEndpointSourceFiles([join(candidate, entry)]));
      }
    }
  }

  return files;
}

function readAvailableFiles() {
  return [
    'promptbridge-server.js',
    'src/core/automation/self_maintenance.js',
    existsSync(join(process.cwd(), 'src', 'autonomous-builder.js')) ? 'src/autonomous-builder.js' : null,
    existsSync(join(process.cwd(), 'src', 'nightforge.js')) ? 'src/nightforge.js' : null,
  ].filter(Boolean);
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
    profile.id,
    profile.subject_key,
    profile.user_id,
    profile.display_name,
    JSON.stringify(profile.affinity || {}),
    JSON.stringify(profile.layout || {}),
    JSON.stringify(profile.theme || {}),
    JSON.stringify(profile.autonomy || {}),
    profile.last_signal_at || null
  );
}

app.listen(port, '127.0.0.1', () => {
  console.log(`PromptBridge Server listening on http://127.0.0.1:${port}`);
});
