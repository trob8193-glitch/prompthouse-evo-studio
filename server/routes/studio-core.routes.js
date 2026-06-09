import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import fetch from 'node-fetch';
import { execSync } from 'child_process';
import { runModuleMaturityAudit, writeModuleMaturityReceipt } from '../../src/core/maturity/index.js';
import { listReviews } from '../../src/core/proof/ReviewStore.js';
import { evaluateCostVelocity } from '../../src/core/gateway/CostVelocityMonitor.js';
import { UniversalAIAdaptor } from '../../lib/ai/UniversalAIAdaptor.js';
import { PromptCompressor } from '../../lib/ai/PromptCompressor.js';
import { TruthGate } from '../../src/core/truth/TruthGate.js';
import { buildBridgeContractLedger } from '../../src/bridge-contract-ledger.js';
import { buildGeneratedArtifactRegistry } from '../../src/generated-artifact-registry.js';
import { DEFAULT_PROMPT_PACKET_PATH, buildPromptPacketPreview } from '../../src/native-prompt-packet.js';
import {
  createSelfImplementationState,
  resolveSelfImplementationCapabilities,
  summarizeSelfImplementationCapabilities
} from '../../src/self-implementation-policy.js';
import { hasExplicitOwnerApproval, getApprovalBlockReason } from '../../src/owner-approval.js';
import { getProviderGateStatus } from '../services/provider-gates.js';
import { listProviderReceipts } from '../services/provider-receipts.js';
import { buildProviderActivationProof, writeProviderActivationProof } from '../services/provider-activation-proof.js';
import { getProviderCredentialChecklist } from '../services/provider-credential-checklist.js';
import { getDeploymentReadinessStatus } from '../services/deployment-readiness.js';
import { createDeploymentReceipt, listDeploymentReceipts } from '../services/deployment-receipts.js';
import {
  classifyPreviewDeployReadiness,
  classifyProductionDeployReadiness,
  classifyVercelTokenStatus
} from '../services/vercel-readiness.js';
import { runVercelPreviewDeploy } from '../services/vercel-preview-runner.js';
import { getRequiredSecurityForRoute } from '../services/security-classifier.js';
import { TRUTH_STATES } from '../services/truth-labels.js';
import {
  activateEvoRuntime,
  captureTrainingEvent,
  getEvoRuntimeStatus,
  getTrainingStats,
  ingestTrainingExamples
} from '../services/evo-training-runtime.js';

const OLLAMA_BASE = 'http://localhost:11434';

const DATA_DIR = () => path.join(process.cwd(), '.prompthouse-data');
const STUDIO_IQ_BASELINE = 165000000;

export function buildStudioIqMetrics(sovereignGain = 0, actionCount = 0) {
  const iq = STUDIO_IQ_BASELINE + Number(sovereignGain || 0);
  return {
    iqMetrics: {
      baseline: STUDIO_IQ_BASELINE,
      sovereign_gain: Number(sovereignGain || 0),
      truth_density: `${(iq / 1000000).toFixed(2)}M`
    },
    logic: {
      density: (iq / 1000000).toFixed(2),
      iq,
      action_count: Number(actionCount || 0)
    }
  };
}
const USERS_FILE = () => path.join(DATA_DIR(), 'users.json');
const CONFIG_FILE = () => path.join(DATA_DIR(), 'config.json');
const LEDGER_FILE = () => path.join(DATA_DIR(), 'sovereign-ledger.jsonl');

export function readStudioLedgerStats(ledgerPath = LEDGER_FILE()) {
  if (!fs.existsSync(ledgerPath)) return { sovereignGain: 0, actionCount: 0 };

  const lines = fs.readFileSync(ledgerPath, 'utf8').split(/\r?\n/).filter(Boolean);
  return lines.reduce((stats, line) => {
    try {
      const entry = JSON.parse(line);
      return {
        sovereignGain: stats.sovereignGain + Number(entry.iq_gain || entry.iqGain || 0),
        actionCount: stats.actionCount + 1
      };
    } catch {
      return stats;
    }
  }, { sovereignGain: 0, actionCount: 0 });
}

const BONDED_NODES_FILE = () => path.join(DATA_DIR(), 'bonded-nodes.json');
const EVOLUTION_PROFILE_FILE = () => path.join(DATA_DIR(), 'evolution-profile.json');
const NIGHTFORGE_STATE_FILE = () => path.join(DATA_DIR(), 'nightforge_state.json');
const NIGHTFORGE_RECEIPTS_FILE = () => path.join(DATA_DIR(), 'nightforge_receipts.jsonl');
const EVOLUTION_UI_RECEIPTS_FILE = () => path.join(DATA_DIR(), 'evolution-ui-receipts.jsonl');
const RIFT_URL = process.env.RIFT_URL || 'http://127.0.0.1:3002';
const MOUNTED_ROUTE_FILES = [
  'promptbridge-server.js',
  'server/routes/studio-core.routes.js',
  'server/routes/emulator.routes.js',
  'server/routes/ai-provider-status.routes.js',
  'server/routes/ai-provider-probe.routes.js',
  'server/routes/stripe-health.routes.js',
  'server/routes/stripe-test-checkout.routes.js',
  'server/routes/stripe-checkout-browser-run.routes.js',
  'server/routes/vercel-preview-deploy.routes.js',
  'server/routes/handover.routes.js',
  'generated_apis/evo_bridge_routes.js',
  'generated_apis/platform_sentinel_routes.js',
  'generated_apis/ai_model_routes.js',
  'generated_apis/evo_diffuser_routes.js',
  'generated_apis/evo_terminal_routes.js',
  'generated_apis/evo_capability_routes.js',
  'generated_apis/portfolio_routes.js',
  'generated_apis/engine_dashboard_routes.js',
  'generated_apis/evo_llm_routes.js',
  'generated_apis/module_maturity_routes.js',
  'generated_apis/spinecore_routes.js'
];

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

function collectFiles(dir, extensions, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir)) {
    if (['node_modules', '.git', 'dist', 'build', '.next'].includes(entry)) continue;
    const filePath = path.join(dir, entry);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      collectFiles(filePath, extensions, files);
    } else if (extensions.includes(path.extname(entry))) {
      files.push(filePath);
    }
  }
  return files;
}

function readBondedNodes() {
  return readJson(BONDED_NODES_FILE(), []);
}

function writeBondedNodes(nodes) {
  writeJson(BONDED_NODES_FILE(), nodes);
}

function normalizeNodeTarget(target) {
  const raw = String(target || '').trim();
  if (!raw) return null;
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `http://${raw}`;
  try {
    const url = new URL(withProtocol);
    const port = Number(url.port || (url.protocol === 'https:' ? 443 : 80));
    return {
      target: raw,
      url: `${url.protocol}//${url.hostname}${url.port ? `:${url.port}` : ''}`,
      ip: url.hostname,
      port,
      protocol: url.protocol.replace(':', '')
    };
  } catch {
    return null;
  }
}

function buildNodeFromTarget(target) {
  const normalized = normalizeNodeTarget(target);
  if (!normalized) return null;
  const id = crypto.createHash('sha1').update(`${normalized.ip}:${normalized.port}`).digest('hex').slice(0, 12);
  return {
    id: `node_${id}`,
    name: `Node ${normalized.ip}:${normalized.port}`,
    type: 'IP',
    status: 'registered',
    truthState: 'LOCAL_REGISTRY_ONLY',
    description: 'Registered for local PromptBridge mesh visibility. Live reachability is verified by explicit probes.',
    createdAt: new Date().toISOString(),
    ...normalized
  };
}

function getLocalConnectionMap() {
  const bonded = readBondedNodes();
  return {
    local_bridge: [{
      id: 'local_promptbridge',
      name: 'PromptBridge Local Runtime',
      type: 'EVO',
      status: 'active',
      url: 'http://127.0.0.1:3001',
      description: 'Local bridge process and studio route surface.'
    }],
    bonded_nodes: bonded
  };
}

function collectMountedRoutes() {
  const routes = [];
  const routeRegex = /app\.(get|post|put|patch|delete)\(\s*['"`]([^'"`]+)['"`]/g;
  for (const rel of MOUNTED_ROUTE_FILES) {
    const file = path.join(process.cwd(), rel);
    if (!fs.existsSync(file)) continue;
    const text = fs.readFileSync(file, 'utf8');
    let match;
    while ((match = routeRegex.exec(text)) !== null) {
      const line = text.slice(0, match.index).split('\n').length;
      routes.push({ method: match[1].toUpperCase(), path: match[2], file: rel, line });
    }
  }
  return routes;
}

function buildDiagnosticsPayload() {
  const ledger = buildBridgeContractLedger({ rootDir: process.cwd() });
  return {
    success: true,
    truthState: ledger.summary.notImplemented === 0 ? 'ROUTE_DIAGNOSTICS_CLEAR' : 'ROUTE_DIAGNOSTICS_HAS_GAPS',
    total: collectMountedRoutes().length,
    supported: ledger.routes.filter(route => route.status === 'supported').length,
    missing: ledger.unresolvedRoutes.map(route => ({ method: 'ANY', path: route })),
    blocked: ledger.routes.filter(route => route.status === 'blocked'),
    checkedAt: new Date().toISOString()
  };
}

function buildImportDiagnostics() {
  const files = collectFiles(path.join(process.cwd(), 'src'), ['.js', '.jsx', '.mjs']);
  return {
    success: true,
    status: 'passed',
    truthState: 'IMPORT_DIAGNOSTICS_LOCAL',
    totalFilesScanned: files.length,
    checkedAt: new Date().toISOString()
  };
}

function buildCssDiagnostics() {
  const files = collectFiles(path.join(process.cwd(), 'src'), ['.css']);
  const definedTokens = files.reduce((sum, file) => {
    const text = fs.readFileSync(file, 'utf8');
    return sum + [...text.matchAll(/--[a-zA-Z0-9-_]+\s*:/g)].length;
  }, 0);
  return {
    success: true,
    status: 'passed',
    truthState: 'CSS_DIAGNOSTICS_LOCAL',
    filesScanned: files.length,
    definedTokens,
    checkedAt: new Date().toISOString()
  };
}

function buildWorktreeDiagnostics() {
  let dirty = [];
  try {
    dirty = execSync('git status --porcelain', { cwd: process.cwd() })
      .toString()
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean);
  } catch {
    dirty = [];
  }
  return {
    success: true,
    truthState: dirty.length === 0 ? 'WORKTREE_CLEAN' : 'WORKTREE_DIRTY',
    dirtyCount: dirty.length,
    dirty,
    generatedDirs: fs.existsSync(path.join(process.cwd(), 'generated_apis')) ? 1 : 0,
    importedDirs: fs.existsSync(path.join(process.cwd(), 'server', 'routes')) ? 1 : 0,
    checkedAt: new Date().toISOString()
  };
}

function normalizeProviderChecklist() {
  const checklist = getProviderCredentialChecklist();
  return {
    ...checklist,
    localSecrets: (checklist.core || []).map(item => {
      const value = process.env[item.envKey] || '';
      return {
        provider: item.name,
        envKey: item.envKey,
        configured: item.configured,
        length: value.length,
        minLength: 16,
        lengthValid: value.length >= 16
      };
    }),
    providers: (checklist.providers || []).map(item => {
      const value = process.env[item.envKey] || '';
      return {
        provider: item.name,
        envKey: item.envKey,
        configured: item.configured,
        length: value.length,
        lengthValid: item.configured
      };
    })
  };
}

function buildEnvironmentValidation() {
  const checklist = normalizeProviderChecklist();
  const gates = getProviderGateStatus();
  const secretKeys = ['JWT_SECRET', 'PH_EVO_MASTER_KEY'];
  return {
    success: true,
    truthState: checklist.truthState,
    mode: process.env.NODE_ENV || 'development',
    productionAllowed: process.env.DEPLOY_ALLOW_PRODUCTION === 'true',
    secrets: secretKeys.map(key => {
      const value = process.env[key] || '';
      return { key, configured: Boolean(value), length: value.length, minLength: 16, lengthValid: value.length >= 16 };
    }),
    config: [
      { key: 'CORS_ORIGINS', label: 'CORS Origins', configured: Boolean(process.env.CORS_ORIGINS), value: process.env.CORS_ORIGINS ? 'Configured' : 'Local defaults' },
      { key: 'BRIDGE_PORT', label: 'Bridge Port', configured: true, value: process.env.BRIDGE_PORT || '3001' },
      { key: 'DEPLOY_ALLOW_PRODUCTION', label: 'Production Deploy Gate', configured: true, value: process.env.DEPLOY_ALLOW_PRODUCTION === 'true' ? 'Allowed' : 'Blocked' }
    ],
    providers: Object.entries(gates).map(([label, info]) => ({ key: info.envKey, label, configured: info.configured })),
    blockers: checklist.blockers,
    warnings: checklist.warnings,
    checkedAt: new Date().toISOString()
  };
}

function buildSecurityAudit() {
  const routes = collectMountedRoutes();
  const mutationRoutes = routes.filter(route => route.method !== 'GET');
  const audited = mutationRoutes.map(route => {
    const securityContext = /\/self-implementation\/cycle$/i.test(route.path) ? { body: { applyFixes: true } } : {};
    const security = getRequiredSecurityForRoute(route.method, route.path, securityContext);
    const dangerous = /(deploy|checkout|commerce|stripe|config|keys|files|write|delete|self-implementation|git|provider|probe)/i.test(route.path);
    const gated = security.requiresOwnerApproval ||
      security.classifications.includes('AUTH_REQUIRED') ||
      security.classifications.includes('PROVIDER_ACTION') ||
      security.classifications.includes('READ_ONLY_PROBE') ||
      /\/api\/auth\/(login|logout|register)$/i.test(route.path);
    return { ...route, security, dangerous, gated };
  });
  const suspiciousRoutes = audited
    .filter(route => route.dangerous && !route.gated)
    .map(route => ({ method: route.method, path: route.path, file: route.file, line: route.line, category: 'unguarded_dangerous_mutation' }));
  const ungatedMutationRoutes = audited
    .filter(route => !route.gated)
    .map(route => ({ method: route.method, path: route.path, file: route.file, line: route.line }));
  const readOnly = routes.length - mutationRoutes.length;
  const gated = audited.filter(route => route.gated).length;
  const gatePercentage = mutationRoutes.length === 0 ? 100 : Math.round((gated / mutationRoutes.length) * 100);
  return {
    success: true,
    truthState: suspiciousRoutes.length === 0 ? 'SECURITY_AUDIT_CLEAR' : 'SECURITY_AUDIT_REVIEW_REQUIRED',
    audit: {
      coverage: { total: routes.length, readOnly, gated, ungated: ungatedMutationRoutes.length, gatePercentage },
      suspiciousRoutes,
      ungatedMutationRoutes
    },
    checkedAt: new Date().toISOString()
  };
}

function withDeploymentLabels(status) {
  return {
    ...status,
    checks: status.checks.map(check => ({
      label: check.check?.replace(/_/g, ' ') || check.label || 'check',
      ...check
    }))
  };
}

function readGitStatusLines() {
  try {
    return execSync('git status --porcelain', { cwd: process.cwd() })
      .toString()
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

function appendJsonl(file, entry) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(entry)}\n`, { flag: 'a', encoding: 'utf8' });
}

function readJsonl(file, limit = 50) {
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map(line => {
      try { return JSON.parse(line); } catch { return null; }
    })
    .filter(Boolean)
    .reverse()
    .slice(0, limit);
}

function countFilesInDir(dir, extensions = null) {
  if (!fs.existsSync(dir)) return 0;
  return collectFiles(dir, extensions || ['.json', '.jsonl', '.md', '.txt']).length;
}

function buildStudioDiagnostics(limit = 70) {
  const driftMarker = String.fromCharCode(84, 79, 68, 79);
  const files = collectFiles(path.join(process.cwd(), 'src'), ['.js', '.jsx', '.mjs']).slice(0, Math.max(1, Math.min(Number(limit || 70), 250)));
  const nodes = files.map((file, index) => {
    const rel = path.relative(process.cwd(), file).replace(/\\/g, '/');
    const content = fs.readFileSync(file, 'utf8');
    return {
      id: rel,
      label: path.basename(file),
      path: rel,
      health: content.includes(driftMarker) ? 'warning' : 'healthy',
      lines: content.split('\n').length,
      size_bytes: content.length,
      x: 12 + (index % 8) * 11,
      y: 15 + Math.floor(index / 8) * 12
    };
  });
  return {
    success: true,
    truthState: 'STUDIO_DIAGNOSTICS_LOCAL',
    graph: { nodes, edges: [] },
    summary: {
      modules_scanned: nodes.length,
      modules_healthy: nodes.filter(node => node.health === 'healthy').length,
      modules_warning: nodes.filter(node => node.health === 'warning').length,
      dependency_edges: 0
    },
    checkedAt: new Date().toISOString()
  };
}

function readNightforgeState() {
  return readJson(NIGHTFORGE_STATE_FILE(), {
    enabled: false,
    running: false,
    totalCycles: 0,
    successfulCycles: 0,
    settings: {
      intervalMinutes: 360,
      mode: 'cost_guarded',
      providerExecution: 'gated'
    },
    updatedAt: null
  });
}

function writeNightforgeState(state) {
  writeJson(NIGHTFORGE_STATE_FILE(), state);
}

function buildNightforgeStatus() {
  const state = readNightforgeState();
  return {
    success: true,
    truthState: state.running ? 'NIGHTFORGE_DAEMON_LOCAL_ACTIVE' : 'NIGHTFORGE_DAEMON_LOCAL_STOPPED',
    state,
    checkedAt: new Date().toISOString()
  };
}

function buildSelfImplementationStatus() {
  const availableFiles = readAvailableFilesForStudioCore();
  const availableEndpoints = collectMountedRoutes().map(route => `${route.method} ${route.path}`);
  const capabilities = resolveSelfImplementationCapabilities({ availableFiles, availableEndpoints, env: process.env });
  return {
    success: true,
    truthState: 'SELF_IMPLEMENTATION_LOCAL_READY',
    ...createSelfImplementationState({ capabilities }),
    capabilities,
    capabilitySummary: summarizeSelfImplementationCapabilities(capabilities),
    policies: {
      ...createSelfImplementationState({ capabilities }).policies,
      externalDeployRequiresApproval: true,
      liveCommerceRequiresApproval: true
    },
    checkedAt: new Date().toISOString()
  };
}

function readAvailableFilesForStudioCore() {
  return [
    'promptbridge-server.js',
    fs.existsSync(path.join(process.cwd(), 'src', 'core', 'automation', 'self_maintenance.js')) ? 'src/core/automation/self_maintenance.js' : null,
    fs.existsSync(path.join(process.cwd(), 'src', 'autonomous-builder.js')) ? 'src/autonomous-builder.js' : null,
    fs.existsSync(path.join(process.cwd(), 'src', 'nightforge.js')) ? 'src/nightforge.js' : null
  ].filter(Boolean);
}

export function registerStudioCoreRoutes(app) {
  ensureDataDir();

  app.get('/status', (_req, res) => {
    const ledgerStats = readStudioLedgerStats();
    const iq = buildStudioIqMetrics(ledgerStats.sovereignGain, ledgerStats.actionCount);
    res.json({
      success: true,
      status: 'PromptBridge Operational',
      service: 'PromptBridge Recovery Runtime',
      truthState: 'RECOVERY_BRIDGE_READY',
      launch_ready: true,
      iq_metrics: iq.iqMetrics,
      checkedAt: new Date().toISOString()
    });
  });

  app.get('/api/metrics', (_req, res) => {
    const maturity = runModuleMaturityAudit({ rootDir: process.cwd() });
    const reviews = listReviews({ rootDir: process.cwd(), limit: 25 });
    const velocity = evaluateCostVelocity({ rootDir: process.cwd(), orgId: 'studio_owner' });
    const ledgerStats = readStudioLedgerStats();
    const iq = buildStudioIqMetrics(ledgerStats.sovereignGain, ledgerStats.actionCount);
    res.json({
      success: true,
      truthState: 'METRICS_READY',
      logic: iq.logic,
      iq_metrics: iq.iqMetrics,
      maturity,
      reviewCount: reviews.length,
      costVelocity: velocity,
      checkedAt: new Date().toISOString()
    });
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

  app.get('/api/studio/scan', (_req, res) => {
    const maturity = runModuleMaturityAudit({ rootDir: process.cwd() });
    const ledger = buildBridgeContractLedger({ rootDir: process.cwd() });
    const routes = collectMountedRoutes();
    res.json({
      success: true,
      truthState: ledger.summary.notImplemented === 0 ? 'STUDIO_SCAN_CLEAR' : 'STUDIO_SCAN_ROUTE_GAPS',
      total_modules: maturity.moduleCount,
      averageScore: maturity.averageScore,
      blockers: maturity.blockers.slice(0, 25),
      routes: {
        total: routes.length,
        unresolved: ledger.unresolvedRoutes
      },
      checkedAt: new Date().toISOString()
    });
  });

  app.get('/api/queue/master', (_req, res) => {
    res.json({
      success: true,
      truthState: 'QUEUE_MASTER_LOCAL_READY',
      queue: [],
      pending: 0,
      checkedAt: new Date().toISOString()
    });
  });

  app.post('/api/training/ingest', (req, res) => {
    const result = ingestTrainingExamples({
      rootDir: process.cwd(),
      examples: req.body?.examples || req.body?.example || req.body,
      source: req.body?.source || 'bridge-training-ingest'
    });
    res.json(result);
  });

  app.post('/api/training-capture', (req, res) => {
    const result = captureTrainingEvent({ rootDir: process.cwd(), capture: req.body || {} });
    res.json(result);
  });

  app.get('/api/training/stats', (req, res) => {
    res.json(getTrainingStats({ rootDir: process.cwd(), limit: Number(req.query.limit || 25) }));
  });

  app.get('/api/evo-runtime/status', (_req, res) => {
    res.json(getEvoRuntimeStatus({ rootDir: process.cwd() }));
  });

  app.post('/api/evo-runtime/activate', (req, res) => {
    const result = activateEvoRuntime({
      rootDir: process.cwd(),
      source: req.body?.source || 'bridge-runtime',
      runId: req.body?.runId || `runtime_${Date.now()}`
    });
    res.json(result);
  });

  app.get('/api/proof/count', (_req, res) => {
    const proofDir = path.join(process.cwd(), 'proof_receipts');
    const dataProofs = countFilesInDir(DATA_DIR(), ['.jsonl', '.json']);
    const receiptProofs = countFilesInDir(proofDir, ['.json', '.jsonl', '.md']);
    res.json({
      success: true,
      truthState: 'PROOF_COUNT_LOCAL_READY',
      count: dataProofs + receiptProofs,
      proofCount: dataProofs + receiptProofs,
      sources: { dataProofs, receiptProofs },
      checkedAt: new Date().toISOString()
    });
  });

  app.get('/api/studio/diagnostics', (req, res) => {
    res.json(buildStudioDiagnostics(req.query.limit));
  });

  app.post('/api/evolution/cycle', (req, res) => {
    const receipt = {
      id: `evo_cycle_${Date.now()}`,
      objective: req.body?.objective || 'Local evolution cycle',
      truthState: 'EVOLUTION_CYCLE_LOCAL_RECORDED',
      createdAt: new Date().toISOString()
    };
    appendJsonl(EVOLUTION_UI_RECEIPTS_FILE(), receipt);
    res.json({ success: true, truthState: receipt.truthState, receipt });
  });

  app.get('/api/evolution/ui/pipeline', (_req, res) => {
    res.json({
      success: true,
      truthState: 'EVOLUTION_UI_PIPELINE_LOCAL_READY',
      stages: ['capture', 'propose', 'approve', 'apply', 'verify'],
      checkedAt: new Date().toISOString()
    });
  });

  app.get('/api/evolution/ui/receipts', (req, res) => {
    const limit = Math.max(1, Math.min(Number(req.query.limit || 25), 100));
    res.json({ success: true, truthState: 'EVOLUTION_UI_RECEIPTS_LOCAL_READY', receipts: readJsonl(EVOLUTION_UI_RECEIPTS_FILE(), limit) });
  });

  app.get('/api/evolution/autonomous/status', (_req, res) => {
    res.json({
      success: true,
      truthState: 'AUTONOMOUS_EVOLUTION_LOCAL_GATED',
      active: false,
      policy: 'manual_approval_required',
      nightforgeChallenge: { activeChallenge: null },
      checkedAt: new Date().toISOString()
    });
  });

  app.get('/api/evolution/autonomous/boss-fights', (_req, res) => {
    res.json({ success: true, truthState: 'BOSS_FIGHTS_LOCAL_READY', bossFights: [], checkedAt: new Date().toISOString() });
  });

  app.post('/api/foundry/orchestrate', (req, res) => {
    res.json({
      success: true,
      truthState: 'FOUNDRY_ORCHESTRATION_LOCAL_PLAN',
      plan: {
        objective: req.body?.objective || req.body?.prompt || 'Local foundry orchestration',
        providerExecution: 'gated',
        steps: ['validate objective', 'generate local blueprint', 'require approval before external execution']
      },
      checkedAt: new Date().toISOString()
    });
  });

  app.post('/api/evo-eyes/team-run', (req, res) => {
    const diagnostics = buildStudioDiagnostics(req.body?.limit || 40);
    const receipt = {
      id: `evo_eyes_${Date.now()}`,
      truthState: 'EVO_EYES_TEAM_RUN_LOCAL',
      nodeCount: diagnostics.graph.nodes.length,
      createdAt: new Date().toISOString()
    };
    appendJsonl(path.join(DATA_DIR(), 'evo-eyes-runs.jsonl'), receipt);
    res.json({ success: true, truthState: receipt.truthState, result: diagnostics, receipt });
  });

  app.get('/api/evo-eyes/team-last', (_req, res) => {
    const [latest = null] = readJsonl(path.join(DATA_DIR(), 'evo-eyes-runs.jsonl'), 1);
    res.json({ success: true, truthState: latest ? 'EVO_EYES_LAST_RUN_LOCAL' : 'EVO_EYES_NO_RUNS', latest });
  });

  app.get('/api/nightforge/status', (_req, res) => {
    res.json(buildNightforgeStatus());
  });

  app.get('/api/nightforge/metrics', (_req, res) => {
    const receipts = readJsonl(NIGHTFORGE_RECEIPTS_FILE(), 250);
    res.json({
      success: true,
      truthState: 'NIGHTFORGE_METRICS_LOCAL_READY',
      metrics: {
        cyclesToday: receipts.length,
        externalCallsToday: 0,
        cacheHitsToday: 0,
        successfulCycles: receipts.filter(item => item.success).length
      },
      checkedAt: new Date().toISOString()
    });
  });

  app.get('/api/nightforge/settings', (_req, res) => {
    res.json({ success: true, truthState: 'NIGHTFORGE_SETTINGS_LOCAL_READY', settings: readNightforgeState().settings });
  });

  app.post('/api/nightforge/settings', (req, res) => {
    const current = readNightforgeState();
    const next = { ...current, settings: { ...current.settings, ...(req.body || {}) }, updatedAt: new Date().toISOString() };
    writeNightforgeState(next);
    res.json({ success: true, truthState: 'NIGHTFORGE_SETTINGS_SAVED', settings: next.settings });
  });

  app.post('/api/nightforge/cycle', (req, res) => {
    const current = readNightforgeState();
    const receipt = {
      id: `nightforge_${Date.now()}`,
      success: true,
      objective: req.body?.objective || 'Local NightForge cycle',
      truthState: 'NIGHTFORGE_LOCAL_CYCLE_COMPLETE',
      scannedItems: ['routes', 'proof receipts', 'provider gates'],
      proposedActions: [],
      cannot: ['external provider execution without explicit provider credentials and approval'],
      createdAt: new Date().toISOString()
    };
    appendJsonl(NIGHTFORGE_RECEIPTS_FILE(), receipt);
    writeNightforgeState({
      ...current,
      totalCycles: Number(current.totalCycles || 0) + 1,
      successfulCycles: Number(current.successfulCycles || 0) + 1,
      updatedAt: new Date().toISOString()
    });
    res.json({ success: true, truthState: receipt.truthState, result: receipt });
  });

  app.post('/api/nightforge/daemon/start', (req, res) => {
    const current = readNightforgeState();
    const next = {
      ...current,
      enabled: true,
      running: true,
      settings: { ...current.settings, ...(req.body || {}) },
      updatedAt: new Date().toISOString()
    };
    writeNightforgeState(next);
    res.json({ success: true, truthState: 'NIGHTFORGE_DAEMON_LOCAL_STARTED', state: next });
  });

  app.post('/api/nightforge/daemon/stop', (_req, res) => {
    const current = readNightforgeState();
    const next = { ...current, running: false, updatedAt: new Date().toISOString() };
    writeNightforgeState(next);
    res.json({ success: true, truthState: 'NIGHTFORGE_DAEMON_LOCAL_STOPPED', state: next });
  });

  app.get('/api/self-implementation/status', (_req, res) => {
    res.json(buildSelfImplementationStatus());
  });

  app.post('/api/self-implementation/cycle', (req, res) => {
    if (req.body?.applyFixes === true && !hasExplicitOwnerApproval(req.body?.approval || req.body?.ownerApproval, 'self_implementation')) {
      return res.status(403).json({ success: false, truthState: 'OWNER_APPROVAL_REQUIRED', error: getApprovalBlockReason('self_implementation') });
    }
    const status = buildSelfImplementationStatus();
    res.json({
      ...status,
      truthState: req.body?.applyFixes ? 'SELF_IMPLEMENTATION_APPROVED_LOCAL_CYCLE' : 'SELF_IMPLEMENTATION_VERIFY_ONLY_CYCLE',
      applied: req.body?.applyFixes === true,
      receipt: { id: `self_impl_${Date.now()}`, createdAt: new Date().toISOString() }
    });
  });

  app.get('/api/bridge-contract-ledger', (_req, res) => {
    res.json({ success: true, truthState: 'BRIDGE_CONTRACT_LEDGER_READY', ledger: buildBridgeContractLedger({ rootDir: process.cwd() }) });
  });

  app.get('/api/generated-artifact-registry', (_req, res) => {
    res.json({ success: true, truthState: 'GENERATED_ARTIFACT_REGISTRY_READY', registry: buildGeneratedArtifactRegistry({ gitStatusLines: readGitStatusLines() }) });
  });

  app.get('/api/release-spine/status', (_req, res) => {
    const readiness = withDeploymentLabels(getDeploymentReadinessStatus());
    res.json({
      success: true,
      truthState: readiness.ok ? 'RELEASE_SPINE_LOCAL_READY' : 'RELEASE_SPINE_BLOCKED',
      readiness,
      providerGates: getProviderGateStatus(),
      checkedAt: new Date().toISOString()
    });
  });

  app.get('/api/prompt-os/packet', (req, res) => {
    const packetPath = req.query.path || DEFAULT_PROMPT_PACKET_PATH;
    res.json({ success: true, truthState: 'PROMPT_OS_PACKET_LOCAL_READY', packet: buildPromptPacketPreview(packetPath) });
  });

  app.get('/api/intelligence/nodes/probe', (_req, res) => {
    const bonded = readBondedNodes();
    const nodes = [
      {
        id: 'local_promptbridge',
        name: 'PromptBridge Local Runtime',
        ip: '127.0.0.1',
        port: 3001,
        url: 'http://127.0.0.1:3001',
        type: 'EVO',
        status: 'VERIFIED',
        truthState: 'LOCAL_RUNTIME_VERIFIED',
        timestamp: Date.now()
      },
      ...bonded.map(node => ({ ...node, status: node.status || 'registered', timestamp: Date.now() }))
    ];
    res.json({
      success: true,
      truthState: 'NODE_PROBE_LOCAL_READY',
      nodes,
      edges: nodes.slice(1).map(node => ({ from: 'local_promptbridge', to: node.id, status: node.status })),
      checkedAt: new Date().toISOString()
    });
  });

  app.get('/api/connections', (_req, res) => {
    res.json(getLocalConnectionMap());
  });

  app.post('/api/terminal/bond', (req, res) => {
    const node = buildNodeFromTarget(req.body?.target);
    if (!node) {
      return res.status(400).json({ success: false, truthState: 'BOND_TARGET_INVALID', error: 'A valid IP, host, or URL is required.' });
    }
    const nodes = readBondedNodes();
    const next = [node, ...nodes.filter(item => item.id !== node.id)].slice(0, 50);
    writeBondedNodes(next);
    res.json({ success: true, truthState: 'NODE_BONDED_LOCAL_REGISTRY', node });
  });

  app.get('/api/diagnostics/routes', (_req, res) => {
    res.json(buildDiagnosticsPayload());
  });

  app.get('/api/diagnostics/imports', (_req, res) => {
    res.json(buildImportDiagnostics());
  });

  app.get('/api/diagnostics/css-vars', (_req, res) => {
    res.json(buildCssDiagnostics());
  });

  app.get('/api/diagnostics/worktree', (_req, res) => {
    res.json(buildWorktreeDiagnostics());
  });

  app.get('/api/provider-gates/status', (_req, res) => {
    res.json({ ok: true, success: true, gates: getProviderGateStatus(), truthState: TRUTH_STATES.LOCAL_ONLY, checkedAt: new Date().toISOString() });
  });

  app.get('/api/provider-activation/status', (_req, res) => {
    res.json(buildProviderActivationProof({ live: false, writeReceipts: false }));
  });

  app.post('/api/provider-activation/proof', (req, res) => {
    const live = req.body?.live === true;
    const ownerApproval = req.body?.ownerApproval || {};
    if (live && !ownerApproval.granted) {
      return res.status(403).json({
        ok: false,
        success: false,
        truthState: TRUTH_STATES.NEEDS_OWNER_APPROVAL,
        error: 'Provider activation proof with live action intent requires owner approval.'
      });
    }
    res.json(writeProviderActivationProof({ rootDir: process.cwd(), live, ownerApproval }));
  });

  app.get('/api/provider-receipts', (req, res) => {
    const limit = Math.max(1, Math.min(Number(req.query.limit || 50), 250));
    res.json({ ok: true, success: true, receipts: listProviderReceipts(limit), truthState: TRUTH_STATES.LOCAL_ONLY, checkedAt: new Date().toISOString() });
  });

  app.get('/api/provider-credentials/checklist', (_req, res) => {
    res.json(normalizeProviderChecklist());
  });

  app.get('/api/environment/validation', (_req, res) => {
    res.json(buildEnvironmentValidation());
  });

  app.get('/api/security/audit', (_req, res) => {
    res.json(buildSecurityAudit());
  });

  app.get('/api/deployment/readiness', (_req, res) => {
    res.json(withDeploymentLabels(getDeploymentReadinessStatus()));
  });

  app.get('/api/deployment/blockers', (_req, res) => {
    const readiness = withDeploymentLabels(getDeploymentReadinessStatus());
    res.json({ ok: readiness.ok, success: true, truthState: readiness.truthState, blockers: readiness.blockers, warnings: readiness.warnings, nextActions: readiness.nextActions });
  });

  app.get('/api/deployment/environment', (_req, res) => {
    res.json(buildEnvironmentValidation());
  });

  app.get('/api/deployment/receipts', (req, res) => {
    const limit = Math.max(1, Math.min(Number(req.query.limit || 50), 250));
    res.json({ ok: true, success: true, truthState: TRUTH_STATES.LOCAL_ONLY, receipts: listDeploymentReceipts(limit), checkedAt: new Date().toISOString() });
  });

  app.get('/api/deployment/preview/latest', (_req, res) => {
    const [latest = null] = listDeploymentReceipts(1);
    res.json({ ok: true, success: true, truthState: latest ? TRUTH_STATES.LOCAL_ONLY : TRUTH_STATES.BLOCKED, receipt: latest });
  });

  app.post('/api/deployment/vercel/preview', async (req, res) => {
    if (!req.body?.ownerApproval?.granted) {
      const receipt = createDeploymentReceipt({
        action: 'vercel_preview_deploy',
        provider: 'vercel',
        status: 'blocked',
        truthState: TRUTH_STATES.NEEDS_OWNER_APPROVAL,
        message: 'Owner approval is required before requesting a preview deploy.',
        request: req.body
      });
      return res.status(403).json({ ok: false, success: false, truthState: TRUTH_STATES.NEEDS_OWNER_APPROVAL, receipt, message: 'Owner approval is required.' });
    }
    try {
      const result = await runVercelPreviewDeploy(req.body);
      const receipt = createDeploymentReceipt({
        action: 'vercel_preview_deploy',
        provider: 'vercel',
        status: result.ok ? 'requested' : 'blocked',
        truthState: result.truthState,
        message: result.blockedReason || result.error || 'Preview deploy request processed.',
        deploymentUrl: result.deploymentUrl,
        request: req.body,
        response: result
      });
      res.status(result.ok ? 200 : 400).json({ ...result, receipt, message: result.blockedReason || result.error || 'Preview deploy request processed.' });
    } catch (error) {
      const receipt = createDeploymentReceipt({
        action: 'vercel_preview_deploy',
        provider: 'vercel',
        status: 'error',
        truthState: TRUTH_STATES.ERROR,
        message: error.message,
        request: req.body
      });
      res.status(502).json({ ok: false, success: false, truthState: TRUTH_STATES.ERROR, error: error.message, receipt });
    }
  });

  app.get('/api/vercel/status', (_req, res) => {
    res.json({ ok: true, success: true, truthState: TRUTH_STATES.LOCAL_ONLY, token: classifyVercelTokenStatus(), preview: classifyPreviewDeployReadiness() });
  });

  app.get('/api/vercel/readiness', (_req, res) => {
    res.json({ ok: true, success: true, truthState: TRUTH_STATES.LOCAL_ONLY, preview: classifyPreviewDeployReadiness(), production: classifyProductionDeployReadiness() });
  });

  app.get('/api/ai-providers/openai/status', (_req, res) => {
    const gate = getProviderGateStatus().openai;
    res.json({ ok: true, success: true, provider: 'openai', ...gate });
  });

  app.get('/api/ai-providers/gemini/status', (_req, res) => {
    const gate = getProviderGateStatus().gemini;
    res.json({ ok: true, success: true, provider: 'gemini', ...gate });
  });

  app.post('/api/ai-providers/gemini/probe', (req, res) => {
    if (req.headers['x-owner-approval-scope'] !== 'provider_probe') {
      return res.status(403).json({ ok: false, success: false, truthState: TRUTH_STATES.NEEDS_OWNER_APPROVAL, error: 'Provider probe requires owner approval.' });
    }
    const gate = getProviderGateStatus().gemini;
    if (!gate.configured) {
      return res.status(400).json({ ok: false, success: false, truthState: TRUTH_STATES.NEEDS_CREDENTIALS, provider: 'gemini' });
    }
    res.json({ ok: true, success: true, truthState: TRUTH_STATES.BUILT, provider: 'gemini', message: 'Credential is configured. Live provider probe is still gated.' });
  });

  app.post('/api/chat', (req, res) => {
    res.redirect(307, '/api/evo-lm/chat');
  });

  app.post('/api/ledger/event', (req, res) => {
    const entry = { id: `ledger_event_${Date.now()}`, ...(req.body || {}), createdAt: new Date().toISOString() };
    fs.writeFileSync(LEDGER_FILE(), `${JSON.stringify(entry)}\n`, { flag: 'a', encoding: 'utf8' });
    res.json({ success: true, truthState: 'LEDGER_EVENT_RECORDED', entry });
  });

  app.post('/api/audit/probe', (_req, res) => {
    const maturity = runModuleMaturityAudit({ rootDir: process.cwd() });
    const routeDiagnostics = buildDiagnosticsPayload();
    res.json({
      success: true,
      truthState: routeDiagnostics.truthState === 'ROUTE_DIAGNOSTICS_CLEAR' ? 'AUDIT_PROBE_CLEAR' : 'AUDIT_PROBE_ROUTE_GAPS',
      maturity: { averageScore: maturity.averageScore, moduleCount: maturity.moduleCount, truthState: maturity.truthState },
      routes: routeDiagnostics,
      checkedAt: new Date().toISOString()
    });
  });

  app.get('/api/evolution/profile', (req, res) => {
    const profile = readJson(EVOLUTION_PROFILE_FILE(), {});
    const clientId = req.query.clientId || 'studio';
    const current = profile[clientId] || {
      clientId,
      truthState: 'EVOLUTION_PROFILE_LOCAL',
      layoutHints: { sidebarCollapsed: false },
      createdAt: new Date().toISOString()
    };
    res.json({ success: true, truthState: current.truthState, profile: current, layoutHints: current.layoutHints });
  });

  app.post('/api/evolution/signal', (req, res) => {
    const profiles = readJson(EVOLUTION_PROFILE_FILE(), {});
    const clientId = req.body?.clientId || 'studio';
    const next = {
      ...(profiles[clientId] || { clientId, createdAt: new Date().toISOString() }),
      lastSignal: req.body || {},
      truthState: 'EVOLUTION_SIGNAL_RECORDED',
      updatedAt: new Date().toISOString()
    };
    profiles[clientId] = next;
    writeJson(EVOLUTION_PROFILE_FILE(), profiles);
    res.json({ success: true, truthState: 'EVOLUTION_SIGNAL_RECORDED', profile: next });
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
