import fs from 'fs';
import path from 'path';
import { readEngineRegistry, upsertEngine } from '../registry/EngineRegistry.js';
import { emitDaemonEvent } from '../daemons/DaemonBus.js';
import { writeMemory } from '../memory/MemoryGraph.js';

function tetherRoot(rootDir) {
  const dir = path.join(rootDir, '.evo-layer', 'tethers');
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function tetherFile(rootDir) {
  return path.join(tetherRoot(rootDir), 'tether-map.json');
}

export const DEFAULT_TETHERS = [
  { from: 'evo-layer', to: 'evo-git', type: 'source-overlay', required: true },
  { from: 'evo-layer', to: 'execution-kernel', type: 'runtime-control', required: true },
  { from: 'execution-kernel', to: 'tool-router', type: 'routing', required: true },
  { from: 'execution-kernel', to: 'adapter-executor', type: 'execution', required: true },
  { from: 'adapter-executor', to: 'adapter-bus', type: 'adapter-awareness', required: true },
  { from: 'scheduler-worker', to: 'task-scheduler', type: 'task-claim', required: true },
  { from: 'scheduler-worker', to: 'adapter-executor', type: 'task-execution', required: true },
  { from: 'scheduler-worker', to: 'memory-graph', type: 'result-memory', required: true },
  { from: 'scheduler-worker', to: 'daemon-bus', type: 'event-stream', required: true },
  { from: 'runtime-control-center', to: 'memory-graph', type: 'observability', required: true },
  { from: 'runtime-control-center', to: 'task-scheduler', type: 'observability', required: true },
  { from: 'runtime-control-center', to: 'adapter-bus', type: 'observability', required: true },
  { from: 'runtime-control-center', to: 'daemon-bus', type: 'observability', required: true },
  { from: 'memory-query-engine', to: 'memory-graph', type: 'query', required: true },
  { from: 'autonomous-tether-engine', to: 'engine-registry', type: 'governance', required: true }
];

export function seedTetherMap({ rootDir = process.cwd(), overwrite = false } = {}) {
  const file = tetherFile(rootDir);
  if (fs.existsSync(file) && !overwrite) return readTetherMap({ rootDir });
  const map = {
    version: '1.0.0',
    truthState: 'TETHER_MAP_SEEDED',
    tethers: DEFAULT_TETHERS,
    generatedAt: new Date().toISOString()
  };
  fs.writeFileSync(file, JSON.stringify(map, null, 2));
  upsertEngine({
    rootDir,
    engine: {
      id: 'autonomous-tether-engine',
      name: 'Autonomous Tether Engine',
      category: 'runtime-infrastructure',
      state: 'PARTIAL',
      completion: 58,
      notes: 'Tether map, dependency checks, orphan detection, and repair suggestions implemented.'
    }
  });
  return map;
}

export function readTetherMap({ rootDir = process.cwd() } = {}) {
  const file = tetherFile(rootDir);
  if (!fs.existsSync(file)) return seedTetherMap({ rootDir });
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

export function addTether({ rootDir = process.cwd(), from, to, type = 'dependency', required = true, metadata = {} } = {}) {
  if (!from || !to) throw new Error('addTether requires from and to.');
  const map = readTetherMap({ rootDir });
  const exists = map.tethers.some(tether => tether.from === from && tether.to === to && tether.type === type);
  if (!exists) {
    map.tethers.push({ from, to, type, required, metadata, createdAt: new Date().toISOString() });
    map.updatedAt = new Date().toISOString();
    fs.writeFileSync(tetherFile(rootDir), JSON.stringify(map, null, 2));
  }
  return map;
}

export function getTetherReport({ rootDir = process.cwd() } = {}) {
  const registry = readEngineRegistry({ rootDir });
  const map = readTetherMap({ rootDir });
  const engineIds = new Set(registry.engines.map(engine => engine.id));
  const tetheredIds = new Set(map.tethers.flatMap(tether => [tether.from, tether.to]));

  const missingTargets = map.tethers.filter(tether => !engineIds.has(tether.from) || !engineIds.has(tether.to));
  const orphans = registry.engines.filter(engine => !tetheredIds.has(engine.id));
  const requiredBroken = missingTargets.filter(tether => tether.required);

  const score = Math.max(0, 100 - (requiredBroken.length * 8) - (orphans.length * 2));
  const report = {
    truthState: 'TETHER_REPORT_CREATED',
    score,
    status: score >= 90 ? 'HEALTHY' : score >= 70 ? 'NEEDS_ATTENTION' : 'UNSTABLE',
    tetherCount: map.tethers.length,
    engineCount: registry.engines.length,
    missingTargets,
    orphans,
    repairSuggestions: createRepairSuggestions({ missingTargets, orphans }),
    generatedAt: new Date().toISOString()
  };

  writeMemory({ rootDir, type: 'tether_report', data: report });
  emitDaemonEvent({ rootDir, daemonId: 'autonomous-tether-engine', event: 'tether_report_created', payload: report });
  return report;
}

function createRepairSuggestions({ missingTargets, orphans }) {
  const suggestions = [];
  for (const tether of missingTargets) {
    suggestions.push({
      type: 'missing-engine-target',
      message: `Register missing engine(s) for tether ${tether.from} -> ${tether.to}.`,
      tether
    });
  }
  for (const engine of orphans) {
    suggestions.push({
      type: 'orphan-engine',
      message: `Add at least one tether for ${engine.name}.`,
      engineId: engine.id
    });
  }
  return suggestions;
}
