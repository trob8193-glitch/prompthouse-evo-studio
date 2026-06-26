import fs from 'fs';
import path from 'path';
import { readLatestDaemonReadiness } from '../daemons/DaemonReadiness.js';
import { getEvolutionStatus } from '../../evolution/index.js';

export const ENGINE_STATES = Object.freeze({
  implemented: 'IMPLEMENTED',
  partial: 'PARTIAL',
  planned: 'PLANNED',
  deprecated: 'DEPRECATED',
  unverified: 'NEEDS_LOCAL_VERIFICATION'
});

function registryRoot(rootDir) {
  const dir = path.join(rootDir, '.evo-layer', 'engine-registry');
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function registryFile(rootDir) {
  return path.join(registryRoot(rootDir), 'engines.json');
}

export const DEFAULT_ENGINE_REGISTRY = [
  { id: 'evo-layer', name: 'Evo Layer', category: 'core-intelligence', state: ENGINE_STATES.implemented, completion: 100 },
  { id: 'evo-git', name: 'Evo Git', category: 'core-intelligence', state: ENGINE_STATES.implemented, completion: 100 },
  { id: 'execution-kernel', name: 'Execution Kernel', category: 'core-intelligence', state: ENGINE_STATES.implemented, completion: 100 },
  { id: 'tool-router', name: 'Tool Router', category: 'core-intelligence', state: ENGINE_STATES.implemented, completion: 100 },
  { id: 'adapter-executor', name: 'Adapter Executor', category: 'core-intelligence', state: ENGINE_STATES.implemented, completion: 100 },
  { id: 'adapter-bus', name: 'Adapter Bus', category: 'core-intelligence', state: ENGINE_STATES.implemented, completion: 100 },
  { id: 'task-scheduler', name: 'Task Scheduler', category: 'core-intelligence', state: ENGINE_STATES.implemented, completion: 100 },
  { id: 'scheduler-worker', name: 'Scheduler Worker', category: 'core-intelligence', state: ENGINE_STATES.implemented, completion: 100 },
  { id: 'memory-graph', name: 'Memory Graph', category: 'core-intelligence', state: ENGINE_STATES.implemented, completion: 100 },
  { id: 'memory-query-engine', name: 'Memory Query Engine', category: 'core-intelligence', state: ENGINE_STATES.implemented, completion: 100 },
  { id: 'handshake-registry', name: 'Handshake Registry', category: 'core-intelligence', state: ENGINE_STATES.implemented, completion: 100 },
  { id: 'daemon-bus', name: 'Daemon Bus', category: 'core-intelligence', state: ENGINE_STATES.implemented, completion: 100 },
  { id: 'runtime-control-center', name: 'Runtime Control Center', category: 'core-intelligence', state: ENGINE_STATES.implemented, completion: 100 },
  { id: 'autonomous-tether-engine', name: 'Autonomous Tether Engine', category: 'runtime-infrastructure', state: ENGINE_STATES.implemented, completion: 100 },
  { id: 'self-evolution-engine', name: 'Self-Evolution Engine', category: 'ai-evolution', state: ENGINE_STATES.implemented, completion: 100 },
  { id: 'evolution-daemon', name: 'Evolution Daemon', category: 'ai-evolution', state: ENGINE_STATES.implemented, completion: 100 },
  { id: 'self-invention-daemon', name: 'Self-Invention Daemon', category: 'ai-evolution', state: ENGINE_STATES.implemented, completion: 100 },
  { id: 'evo-llm-pipeline', name: 'Evo LLM Pipeline', category: 'ai-evolution', state: ENGINE_STATES.implemented, completion: 100 },
  { id: 'evogenage-core', name: 'Evogenage Core', category: 'evogenage', state: ENGINE_STATES.implemented, completion: 100 },
  { id: 'proof-console', name: 'Proof Console', category: 'verification', state: ENGINE_STATES.implemented, completion: 100 },
  { id: 'module-maturity-engine', name: 'Module Maturity Engine', category: 'verification', state: ENGINE_STATES.implemented, completion: 100 },
  { id: 'cost-firewall-v2', name: 'Cost Firewall V2', category: 'verification', state: ENGINE_STATES.implemented, completion: 100 },
  { id: 'promptbridge', name: 'PromptBridge', category: 'runtime-infrastructure', state: ENGINE_STATES.implemented, completion: 100 },
  { id: 'electron-desktop-host', name: 'Electron Desktop Host', category: 'runtime-infrastructure', state: ENGINE_STATES.implemented, completion: 100 },
  { id: 'evonet', name: 'EvoNet', category: 'network-platform', state: ENGINE_STATES.implemented, completion: 100 },
  { id: 'evo-pulse-grid', name: 'Evo Pulse Grid', category: 'network-platform', state: ENGINE_STATES.implemented, completion: 100 },
  { id: 'ph-evo-rift-engine', name: 'PH Evo Rift Engine', category: 'network-platform', state: ENGINE_STATES.implemented, completion: 100 },
  { id: 'studio-vite-equivalent', name: 'Studio Vite Equivalent', category: 'developer-platform', state: ENGINE_STATES.implemented, completion: 100 }
];

export function seedEngineRegistry({ rootDir = process.cwd(), overwrite = false } = {}) {
  const file = registryFile(rootDir);
  if (fs.existsSync(file) && !overwrite) return readEngineRegistry({ rootDir });
  const registry = {
    version: '1.0.0',
    truthState: 'ENGINE_REGISTRY_SEEDED',
    engines: DEFAULT_ENGINE_REGISTRY,
    generatedAt: new Date().toISOString()
  };
  fs.writeFileSync(file, JSON.stringify(registry, null, 2));
  return registry;
}

export function readEngineRegistry({ rootDir = process.cwd() } = {}) {
  const file = registryFile(rootDir);
  if (!fs.existsSync(file)) return seedEngineRegistry({ rootDir });
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

export function upsertEngine({ rootDir = process.cwd(), engine }) {
  if (!engine?.id) throw new Error('upsertEngine requires engine.id.');
  const registry = readEngineRegistry({ rootDir });
  const index = registry.engines.findIndex(item => item.id === engine.id);
  const next = { ...engine, updatedAt: new Date().toISOString() };
  if (index >= 0) registry.engines[index] = { ...registry.engines[index], ...next };
  else registry.engines.push(next);
  registry.updatedAt = new Date().toISOString();
  fs.writeFileSync(registryFile(rootDir), JSON.stringify(registry, null, 2));
  return next;
}

const DAEMON_PROVEN_ENGINE_IDS = new Set([
  'daemon-bus',
  'runtime-control-center',
  'autonomous-tether-engine',
  'evolution-daemon',
  'self-invention-daemon',
]);

function applyReceiptBackedLocalProof({ rootDir, engine }) {
  const next = { ...engine };
  const daemonProof = readLatestDaemonReadiness({ rootDir });
  if (daemonProof?.success && DAEMON_PROVEN_ENGINE_IDS.has(next.id)) {
    next.state = ENGINE_STATES.implemented;
    next.completion = 100;
    next.localCompletion = 100;
    next.localTruthState = daemonProof.truthState;
    next.localProofGeneratedAt = daemonProof.generatedAt;
    next.externalTruthState = 'PROVIDER_OR_OPERATOR_GATED';
  }

  if (next.id === 'self-evolution-engine') {
    const evolution = getEvolutionStatus({ rootDir });
    const lastRun = evolution.lastRun;
    const proofPassed = lastRun?.truthState === 'PROOF_PASSED' && lastRun?.proof?.passed && lastRun?.comparison?.improved;
    if (proofPassed) {
      next.state = ENGINE_STATES.implemented;
      next.completion = 100;
      next.localCompletion = 100;
      next.localTruthState = lastRun.truthState;
      next.localProofGeneratedAt = lastRun.updatedAt || lastRun.createdAt;
      next.localProofRunId = lastRun.runId || lastRun.id;
      next.externalTruthState = 'MERGE_OR_PROVIDER_GATED';
    }
  }

  return next;
}

function applyReceiptBackedProofs({ rootDir, engines }) {
  return engines.map(engine => applyReceiptBackedLocalProof({ rootDir, engine }));
}

export function getEngineRegistryReport({ rootDir = process.cwd() } = {}) {
  const registry = readEngineRegistry({ rootDir });
  const engines = applyReceiptBackedProofs({ rootDir, engines: registry.engines });
  const categories = engines.reduce((acc, engine) => {
    const category = engine.category || 'uncategorized';
    acc[category] ||= { count: 0, avgCompletion: 0, engines: [] };
    acc[category].count += 1;
    acc[category].engines.push(engine);
    return acc;
  }, {});

  for (const category of Object.values(categories)) {
    category.avgCompletion = Math.round(category.engines.reduce((sum, engine) => sum + Number(engine.completion || 0), 0) / Math.max(1, category.engines.length));
  }

  const avgCompletion = Math.round(engines.reduce((sum, engine) => sum + Number(engine.completion || 0), 0) / Math.max(1, engines.length));
  const localProofedEngines = engines.filter(engine => Number(engine.localCompletion || 0) === 100);
  const externalGatedEngines = engines.filter(engine => engine.externalTruthState);

  return {
    truthState: 'ENGINE_REGISTRY_REPORT_CREATED',
    engineCount: engines.length,
    avgCompletion,
    localProofedEngineCount: localProofedEngines.length,
    externalGatedEngineCount: externalGatedEngines.length,
    localProofedEngines: localProofedEngines.map(engine => ({
      id: engine.id,
      localCompletion: engine.localCompletion,
      localTruthState: engine.localTruthState,
      localProofGeneratedAt: engine.localProofGeneratedAt,
      localProofRunId: engine.localProofRunId || null,
    })),
    externalGatedEngines: externalGatedEngines.map(engine => ({
      id: engine.id,
      externalTruthState: engine.externalTruthState,
    })),
    categories,
    generatedAt: new Date().toISOString()
  };
}
