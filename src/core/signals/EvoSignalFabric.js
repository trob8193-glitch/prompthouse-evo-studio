import os from 'os';
import fs from 'fs';
import path from 'path';

export const SIGNAL_TRUTH_STATES = Object.freeze({
  READY: 'SIGNAL_READY',
  DEGRADED: 'SIGNAL_DEGRADED',
  OFFLINE: 'SIGNAL_OFFLINE',
  ADAPTER_GATED: 'ADAPTER_GATED',
  OWNER_APPROVAL_REQUIRED: 'OWNER_APPROVAL_REQUIRED'
});

export const SIGNAL_SUPPORT_TARGETS = Object.freeze([
  'evoApi',
  'studioRuntime',
  'daemonMesh',
  'trainingPipeline',
  'evolutionLoop',
  'intelligenceRouter',
  'botCouncil',
  'localCapabilities',
  'omniBonds',
  'proofConsole'
]);

const DEFAULT_PROBES = Object.freeze([
  { id: 'promptbridge', label: 'PromptBridge', urlEnv: 'BRIDGE_URL', defaultUrl: 'http://127.0.0.1:3001/healthz', target: 'studioRuntime', critical: true },
  { id: 'evo-api', label: 'Evo API', urlEnv: 'EVO_API_URL', defaultUrl: 'http://127.0.0.1:3001/api/evo-bridge/status', target: 'evoApi', critical: true },
  { id: 'evo-llm', label: 'Evo LLM', urlEnv: 'EVO_LLM_URL', defaultUrl: '', target: 'intelligenceRouter', critical: false },
  { id: 'studio-ui', label: 'Studio UI', urlEnv: 'STUDIO_UI_URL', defaultUrl: 'http://127.0.0.1:5173', target: 'studioRuntime', critical: false },
  { id: 'training-status', label: 'Training Pipeline', urlEnv: 'TRAINING_STATUS_URL', defaultUrl: 'http://127.0.0.1:3001/api/training/stats', target: 'trainingPipeline', critical: false },
  { id: 'evolution-status', label: 'Evolution Loop', urlEnv: 'EVOLUTION_STATUS_URL', defaultUrl: 'http://127.0.0.1:3001/api/evolution/autonomous/status', target: 'evolutionLoop', critical: false },
  { id: 'daemon-status', label: 'Daemon Mesh', urlEnv: 'DAEMON_STATUS_URL', defaultUrl: 'http://127.0.0.1:3001/api/intelligence/nodes/probe', target: 'daemonMesh', critical: false }
]);

const DEFAULT_ALLOWED_ROUTES = Object.freeze(['local', 'bridge', 'evo-api', 'evo-llm', 'cloud', 'queue', 'deny']);

function nowIso() {
  return new Date().toISOString();
}

function parseJsonEnv(name, fallback) {
  const value = process.env[name];
  if (!value) return fallback;
  try { return JSON.parse(value); } catch { return fallback; }
}

function parseListEnv(name) {
  return String(process.env[name] || '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
}

function safeUrl(input) {
  if (!input) return '';
  try { return new URL(input).toString(); } catch { return ''; }
}

function summarizeNetworkInterfaces() {
  const interfaces = os.networkInterfaces();
  const out = [];
  for (const [name, entries] of Object.entries(interfaces)) {
    for (const entry of entries || []) {
      if (!entry || entry.internal) continue;
      out.push({
        name,
        address: entry.address,
        family: entry.family,
        macHash: hashSmall(entry.mac || `${name}:${entry.address}`),
        cidr: entry.cidr || null
      });
    }
  }
  return out;
}

function hashSmall(value) {
  let hash = 0;
  const text = String(value || '');
  for (let i = 0; i < text.length; i += 1) hash = ((hash << 5) - hash) + text.charCodeAt(i) | 0;
  return `sig_${Math.abs(hash).toString(16)}`;
}

function readBondRegistry(rootDir) {
  const envBonds = parseJsonEnv('EVO_SIGNAL_BONDS', []);
  const bondFile = process.env.EVO_SIGNAL_BOND_FILE || path.join(rootDir, '.prompthouse-data', 'evo_signal_bonds.json');
  const fileBonds = fs.existsSync(bondFile) ? parseJsonSafe(fs.readFileSync(bondFile, 'utf8'), []) : [];
  return [...envBonds, ...fileBonds].filter(item => item && item.id);
}

function parseJsonSafe(text, fallback) {
  try { return JSON.parse(text); } catch { return fallback; }
}

async function probeEndpoint(probe, timeoutMs = 1200) {
  const url = safeUrl(process.env[probe.urlEnv] || probe.defaultUrl);
  if (!url) {
    return {
      id: probe.id,
      label: probe.label,
      target: probe.target,
      critical: probe.critical,
      truthState: SIGNAL_TRUTH_STATES.ADAPTER_GATED,
      reachable: false,
      urlConfigured: false,
      latencyMs: null,
      reason: `${probe.urlEnv} is not configured and no safe default route exists.`
    };
  }

  if (typeof fetch !== 'function') {
    return {
      id: probe.id,
      label: probe.label,
      target: probe.target,
      critical: probe.critical,
      truthState: SIGNAL_TRUTH_STATES.ADAPTER_GATED,
      reachable: false,
      urlConfigured: true,
      latencyMs: null,
      reason: 'Runtime fetch API is unavailable in this Node process.'
    };
  }

  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { method: 'GET', signal: controller.signal });
    clearTimeout(timer);
    return {
      id: probe.id,
      label: probe.label,
      target: probe.target,
      critical: probe.critical,
      truthState: response.ok ? SIGNAL_TRUTH_STATES.READY : SIGNAL_TRUTH_STATES.DEGRADED,
      reachable: response.ok,
      urlConfigured: true,
      status: response.status,
      latencyMs: Date.now() - started,
      reason: response.ok ? 'Probe returned a successful response.' : `Probe returned HTTP ${response.status}.`
    };
  } catch (error) {
    clearTimeout(timer);
    return {
      id: probe.id,
      label: probe.label,
      target: probe.target,
      critical: probe.critical,
      truthState: SIGNAL_TRUTH_STATES.OFFLINE,
      reachable: false,
      urlConfigured: true,
      latencyMs: Date.now() - started,
      reason: error?.name === 'AbortError' ? 'Probe timed out.' : (error?.message || 'Probe failed.')
    };
  }
}

function buildProbeList() {
  const extra = parseJsonEnv('EVO_SIGNAL_EXTRA_PROBES', []);
  return [...DEFAULT_PROBES, ...extra].filter(item => item && item.id);
}

function targetStatus(target, probes, network, bonds) {
  const owned = probes.filter(item => item.target === target);
  const reachable = owned.filter(item => item.reachable);
  const criticalDown = owned.some(item => item.critical && !item.reachable);
  const bondReady = bonds.some(item => item.target === target || item.targets?.includes?.(target) || item.scope === 'all');

  if (target === 'localCapabilities') {
    return network.interfaces.length ? SIGNAL_TRUTH_STATES.READY : SIGNAL_TRUTH_STATES.DEGRADED;
  }
  if (target === 'omniBonds') {
    return bonds.length ? SIGNAL_TRUTH_STATES.READY : SIGNAL_TRUTH_STATES.ADAPTER_GATED;
  }
  if (target === 'proofConsole') {
    const bridge = probes.find(item => item.id === 'promptbridge');
    return bridge?.reachable ? SIGNAL_TRUTH_STATES.READY : SIGNAL_TRUTH_STATES.DEGRADED;
  }
  if (criticalDown) return SIGNAL_TRUTH_STATES.OFFLINE;
  if (reachable.length) return SIGNAL_TRUTH_STATES.READY;
  if (owned.length) return SIGNAL_TRUTH_STATES.DEGRADED;
  return bondReady ? SIGNAL_TRUTH_STATES.READY : SIGNAL_TRUTH_STATES.ADAPTER_GATED;
}

function buildSupportMatrix({ probes, network, bonds }) {
  return SIGNAL_SUPPORT_TARGETS.map(target => {
    const truthState = targetStatus(target, probes, network, bonds);
    return {
      target,
      truthState,
      supported: truthState === SIGNAL_TRUTH_STATES.READY,
      relevantProbes: probes.filter(item => item.target === target).map(item => item.id),
      bondedDevices: bonds.filter(item => item.target === target || item.targets?.includes?.(target) || item.scope === 'all').map(item => item.id)
    };
  });
}

function chooseMode(matrix, probes) {
  const bridgeReady = probes.some(item => item.id === 'promptbridge' && item.reachable);
  const evoApiReady = probes.some(item => item.id === 'evo-api' && item.reachable);
  const evoLlmReady = probes.some(item => item.id === 'evo-llm' && item.reachable);
  const trainingReady = matrix.some(item => item.target === 'trainingPipeline' && item.supported);
  const evolutionReady = matrix.some(item => item.target === 'evolutionLoop' && item.supported);

  if (bridgeReady && evoApiReady && evoLlmReady && trainingReady && evolutionReady) return 'full-signal-evo';
  if (bridgeReady && evoApiReady) return 'studio-plus-evo-api';
  if (bridgeReady) return 'local-bridge';
  return 'signal-watch';
}

export async function collectEvoSignalFabric({ rootDir = process.cwd(), timeoutMs = 1200 } = {}) {
  const network = {
    host: os.hostname(),
    platform: process.platform,
    interfaces: summarizeNetworkInterfaces(),
    trustedNetworkNames: parseListEnv('EVO_TRUSTED_NETWORKS'),
    currentNetworkAlias: process.env.EVO_NETWORK_ALIAS || 'local-runtime',
    externalSignals: parseJsonEnv('EVO_EXTERNAL_SIGNALS', []),
    internalSignals: parseJsonEnv('EVO_INTERNAL_SIGNALS', [])
  };

  const bonds = readBondRegistry(rootDir);
  const probes = await Promise.all(buildProbeList().map(item => probeEndpoint(item, timeoutMs)));
  const matrix = buildSupportMatrix({ probes, network, bonds });
  const mode = chooseMode(matrix, probes);
  const blockers = matrix.filter(item => !item.supported && item.truthState !== SIGNAL_TRUTH_STATES.ADAPTER_GATED);

  return {
    success: true,
    generatedAt: nowIso(),
    truthState: blockers.length ? SIGNAL_TRUTH_STATES.DEGRADED : SIGNAL_TRUTH_STATES.READY,
    mode,
    network,
    probes,
    bonds: bonds.map(item => ({ id: item.id, label: item.label || item.id, scope: item.scope || null, target: item.target || null, targets: item.targets || [] })),
    supportMatrix: matrix,
    blockers,
    allowedRoutes: DEFAULT_ALLOWED_ROUTES
  };
}

export function routeEvoSignalIntent({ intent = 'general', risk = 'low', requiresTraining = false, requiresEvolution = false, requiresRepo = false, preferredRoute = '' } = {}, fabric) {
  const matrix = fabric?.supportMatrix || [];
  const probes = fabric?.probes || [];
  const can = target => matrix.some(item => item.target === target && item.supported);
  const probeReady = id => probes.some(item => item.id === id && item.reachable);
  const highImpact = ['high', 'critical'].includes(String(risk).toLowerCase()) || requiresRepo;

  if (highImpact && !can('proofConsole')) {
    return { route: 'deny', truthState: SIGNAL_TRUTH_STATES.OWNER_APPROVAL_REQUIRED, reason: 'High-impact action requires proof console support before routing.' };
  }

  if (requiresTraining && !can('trainingPipeline')) {
    return { route: 'queue', truthState: SIGNAL_TRUTH_STATES.DEGRADED, reason: 'Training support is not ready; queue the task with a receipt.' };
  }

  if (requiresEvolution && !can('evolutionLoop')) {
    return { route: 'queue', truthState: SIGNAL_TRUTH_STATES.DEGRADED, reason: 'Evolution loop support is not ready; queue the task with a receipt.' };
  }

  if (preferredRoute && DEFAULT_ALLOWED_ROUTES.includes(preferredRoute)) {
    if (preferredRoute === 'evo-api' && probeReady('evo-api')) return { route: preferredRoute, truthState: SIGNAL_TRUTH_STATES.READY, reason: `Preferred route accepted for ${intent}.` };
    if (preferredRoute === 'evo-llm' && probeReady('evo-llm')) return { route: preferredRoute, truthState: SIGNAL_TRUTH_STATES.READY, reason: `Preferred route accepted for ${intent}.` };
    if (preferredRoute === 'bridge' && probeReady('promptbridge')) return { route: preferredRoute, truthState: SIGNAL_TRUTH_STATES.READY, reason: `Preferred route accepted for ${intent}.` };
  }

  if (probeReady('evo-api')) return { route: 'evo-api', truthState: SIGNAL_TRUTH_STATES.READY, reason: 'Evo API is reachable and can support the intent.' };
  if (probeReady('promptbridge')) return { route: 'bridge', truthState: SIGNAL_TRUTH_STATES.READY, reason: 'PromptBridge is reachable and can support the intent.' };
  if (probeReady('evo-llm')) return { route: 'evo-llm', truthState: SIGNAL_TRUTH_STATES.READY, reason: 'Evo LLM is reachable and can support the intent.' };

  return { route: 'queue', truthState: SIGNAL_TRUTH_STATES.DEGRADED, reason: 'No live route is ready; queue safely until signal support returns.' };
}

export function writeEvoSignalReceipt({ rootDir = process.cwd(), fabric, decision, type = 'evo_signal_receipt' } = {}) {
  const dir = path.join(rootDir, '.prompthouse-data', 'signals');
  fs.mkdirSync(dir, { recursive: true });
  const receipt = {
    id: `ph_evo_signal_${Date.now()}`,
    type,
    createdAt: nowIso(),
    fabricTruthState: fabric?.truthState || SIGNAL_TRUTH_STATES.DEGRADED,
    mode: fabric?.mode || 'unknown',
    decision: decision || null,
    supportMatrix: fabric?.supportMatrix || []
  };
  const file = path.join(dir, `${receipt.id}.json`);
  fs.writeFileSync(file, JSON.stringify(receipt, null, 2), 'utf8');
  return { file, receipt };
}

export function getEvoSignalFabricContract() {
  return {
    name: 'PromptHouse Evo Signal Fabric',
    version: '1.0.0',
    purpose: 'Unify Wi-Fi, LAN, local process, external provider, Evo API, daemon, training, evolution, intelligence, bot, and proof signals into one governed routing layer.',
    targets: SIGNAL_SUPPORT_TARGETS,
    routes: [
      'GET /api/evo-signal-fabric/status',
      'POST /api/evo-signal-fabric/route-intent',
      'POST /api/evo-signal-fabric/receipt',
      'GET /api/evo-signal-fabric/contract'
    ],
    env: [
      'BRIDGE_URL',
      'EVO_API_URL',
      'EVO_LLM_URL',
      'STUDIO_UI_URL',
      'TRAINING_STATUS_URL',
      'EVOLUTION_STATUS_URL',
      'DAEMON_STATUS_URL',
      'EVO_SIGNAL_BONDS',
      'EVO_SIGNAL_EXTRA_PROBES',
      'EVO_INTERNAL_SIGNALS',
      'EVO_EXTERNAL_SIGNALS'
    ]
  };
}
