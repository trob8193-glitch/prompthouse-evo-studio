import fs from 'fs';
import path from 'path';

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
  { id: 'evo-layer', name: 'Evo Layer', category: 'core-intelligence', state: ENGINE_STATES.partial, completion: 90 },
  { id: 'evo-git', name: 'Evo Git', category: 'core-intelligence', state: ENGINE_STATES.partial, completion: 88 },
  { id: 'execution-kernel', name: 'Execution Kernel', category: 'core-intelligence', state: ENGINE_STATES.partial, completion: 80 },
  { id: 'tool-router', name: 'Tool Router', category: 'core-intelligence', state: ENGINE_STATES.implemented, completion: 90 },
  { id: 'adapter-executor', name: 'Adapter Executor', category: 'core-intelligence', state: ENGINE_STATES.partial, completion: 82 },
  { id: 'adapter-bus', name: 'Adapter Bus', category: 'core-intelligence', state: ENGINE_STATES.partial, completion: 85 },
  { id: 'task-scheduler', name: 'Task Scheduler', category: 'core-intelligence', state: ENGINE_STATES.partial, completion: 84 },
  { id: 'scheduler-worker', name: 'Scheduler Worker', category: 'core-intelligence', state: ENGINE_STATES.partial, completion: 82 },
  { id: 'memory-graph', name: 'Memory Graph', category: 'core-intelligence', state: ENGINE_STATES.partial, completion: 84 },
  { id: 'memory-query-engine', name: 'Memory Query Engine', category: 'core-intelligence', state: ENGINE_STATES.partial, completion: 80 },
  { id: 'handshake-registry', name: 'Handshake Registry', category: 'core-intelligence', state: ENGINE_STATES.partial, completion: 80 },
  { id: 'daemon-bus', name: 'Daemon Bus', category: 'core-intelligence', state: ENGINE_STATES.partial, completion: 82 },
  { id: 'runtime-control-center', name: 'Runtime Control Center', category: 'core-intelligence', state: ENGINE_STATES.partial, completion: 72 },
  { id: 'autonomous-tether-engine', name: 'Autonomous Tether Engine', category: 'runtime-infrastructure', state: ENGINE_STATES.planned, completion: 45 },
  { id: 'self-evolution-engine', name: 'Self-Evolution Engine', category: 'ai-evolution', state: ENGINE_STATES.partial, completion: 85 },
  { id: 'evolution-daemon', name: 'Evolution Daemon', category: 'ai-evolution', state: ENGINE_STATES.partial, completion: 80 },
  { id: 'self-invention-daemon', name: 'Self-Invention Daemon', category: 'ai-evolution', state: ENGINE_STATES.partial, completion: 80 },
  { id: 'evo-llm-pipeline', name: 'Evo LLM Pipeline', category: 'ai-evolution', state: ENGINE_STATES.partial, completion: 82 },
  { id: 'evogenage-core', name: 'Evogenage Core', category: 'evogenage', state: ENGINE_STATES.partial, completion: 84 },
  { id: 'proof-console', name: 'Proof Console', category: 'verification', state: ENGINE_STATES.partial, completion: 85 },
  { id: 'module-maturity-engine', name: 'Module Maturity Engine', category: 'verification', state: ENGINE_STATES.partial, completion: 90 },
  { id: 'cost-firewall-v2', name: 'Cost Firewall V2', category: 'verification', state: ENGINE_STATES.partial, completion: 90 },
  { id: 'promptbridge', name: 'PromptBridge', category: 'runtime-infrastructure', state: ENGINE_STATES.partial, completion: 85 },
  { id: 'electron-desktop-host', name: 'Electron Desktop Host', category: 'runtime-infrastructure', state: ENGINE_STATES.partial, completion: 68 },
  { id: 'evonet', name: 'EvoNet', category: 'network-platform', state: ENGINE_STATES.planned, completion: 65 },
  { id: 'evo-pulse-grid', name: 'Evo Pulse Grid', category: 'network-platform', state: ENGINE_STATES.planned, completion: 65 },
  { id: 'ph-evo-rift-engine', name: 'PH Evo Rift Engine', category: 'network-platform', state: ENGINE_STATES.planned, completion: 60 },
  { id: 'studio-vite-equivalent', name: 'Studio Vite Equivalent', category: 'developer-platform', state: ENGINE_STATES.partial, completion: 75 }
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

export function getEngineRegistryReport({ rootDir = process.cwd() } = {}) {
  const registry = readEngineRegistry({ rootDir });
  const categories = registry.engines.reduce((acc, engine) => {
    const category = engine.category || 'uncategorized';
    acc[category] ||= { count: 0, avgCompletion: 0, engines: [] };
    acc[category].count += 1;
    acc[category].engines.push(engine);
    return acc;
  }, {});

  for (const category of Object.values(categories)) {
    category.avgCompletion = Math.round(category.engines.reduce((sum, engine) => sum + Number(engine.completion || 0), 0) / Math.max(1, category.engines.length));
  }

  const avgCompletion = Math.round(registry.engines.reduce((sum, engine) => sum + Number(engine.completion || 0), 0) / Math.max(1, registry.engines.length));

  return {
    truthState: 'ENGINE_REGISTRY_REPORT_CREATED',
    engineCount: registry.engines.length,
    avgCompletion,
    categories,
    generatedAt: new Date().toISOString()
  };
}
