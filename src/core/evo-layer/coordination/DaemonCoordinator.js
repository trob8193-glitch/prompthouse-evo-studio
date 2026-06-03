import fs from 'fs';
import path from 'path';
import { emitDaemonEvent } from '../daemons/DaemonBus.js';
import { writeMemory } from '../memory/MemoryGraph.js';

const DEFAULT_ROLES = Object.freeze({
  omni: ['coordinate', 'dispatch', 'summarize'],
  sentinel: ['audit', 'guard', 'health'],
  crucible: ['stress', 'optimize', 'validate'],
  singularity: ['strategy', 'planning', 'forecast'],
  convergence: ['resolve', 'merge', 'dedupe'],
  watchdog: ['watch', 'recover', 'alert'],
  executor: ['execute', 'report', 'handoff']
});

function coordRoot(rootDir) {
  const dir = path.join(rootDir, '.evo-layer', 'coordination');
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function registryFile(rootDir) {
  return path.join(coordRoot(rootDir), 'daemon-registry.json');
}

function claimsFile(rootDir) {
  return path.join(coordRoot(rootDir), 'claims.json');
}

function readJson(file, fallback) {
  if (!fs.existsSync(file)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

export function registerDaemon({ rootDir = process.cwd(), daemonId, role = 'executor', capabilities = [], metadata = {} } = {}) {
  if (!daemonId) throw new Error('registerDaemon requires daemonId.');
  const registry = readJson(registryFile(rootDir), { version: '1.0.0', daemons: [] });
  const baseCapabilities = DEFAULT_ROLES[role] || [];
  const record = {
    daemonId,
    role,
    capabilities: Array.from(new Set([...baseCapabilities, ...capabilities])),
    metadata,
    status: 'AVAILABLE',
    updatedAt: new Date().toISOString()
  };
  const index = registry.daemons.findIndex(item => item.daemonId === daemonId);
  if (index >= 0) registry.daemons[index] = { ...registry.daemons[index], ...record };
  else registry.daemons.push(record);
  registry.updatedAt = new Date().toISOString();
  writeJson(registryFile(rootDir), registry);
  emitDaemonEvent({ rootDir, daemonId: 'daemon-coordinator', event: 'daemon_registered', payload: record });
  return record;
}

export function listRegisteredDaemons({ rootDir = process.cwd() } = {}) {
  return readJson(registryFile(rootDir), { version: '1.0.0', daemons: [] }).daemons;
}

export function claimCoordinationTask({ rootDir = process.cwd(), taskId, daemonId, confidence = 50, reason = 'claim' } = {}) {
  if (!taskId || !daemonId) throw new Error('claimCoordinationTask requires taskId and daemonId.');
  const claims = readJson(claimsFile(rootDir), { version: '1.0.0', claims: [] });
  const claim = {
    id: `claim_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    taskId,
    daemonId,
    confidence,
    reason,
    status: 'OPEN',
    createdAt: new Date().toISOString()
  };
  claims.claims.push(claim);
  writeJson(claimsFile(rootDir), claims);
  emitDaemonEvent({ rootDir, daemonId: 'daemon-coordinator', event: 'coordination_claim_opened', payload: claim });
  return claim;
}

export function resolveCoordinationConflict({ rootDir = process.cwd(), taskId } = {}) {
  if (!taskId) throw new Error('resolveCoordinationConflict requires taskId.');
  const claims = readJson(claimsFile(rootDir), { version: '1.0.0', claims: [] });
  const openClaims = claims.claims.filter(claim => claim.taskId === taskId && claim.status === 'OPEN');
  if (!openClaims.length) {
    return { taskId, status: 'NO_CLAIMS', winner: null, resolvedAt: new Date().toISOString() };
  }
  const winner = [...openClaims].sort((a, b) => Number(b.confidence || 0) - Number(a.confidence || 0))[0];
  claims.claims = claims.claims.map(claim => {
    if (claim.taskId !== taskId || claim.status !== 'OPEN') return claim;
    return {
      ...claim,
      status: claim.id === winner.id ? 'WON' : 'LOST',
      resolvedAt: new Date().toISOString()
    };
  });
  writeJson(claimsFile(rootDir), claims);
  const result = { taskId, status: 'RESOLVED', winner, contenders: openClaims, resolvedAt: new Date().toISOString() };
  writeMemory({ rootDir, type: 'coordination_conflict_resolution', data: result });
  emitDaemonEvent({ rootDir, daemonId: 'daemon-coordinator', event: 'coordination_conflict_resolved', payload: result });
  return result;
}

export function createCoordinationHandoff({ rootDir = process.cwd(), fromDaemon, toDaemon, taskId, payload = {} } = {}) {
  if (!fromDaemon || !toDaemon || !taskId) throw new Error('createCoordinationHandoff requires fromDaemon, toDaemon, and taskId.');
  const handoff = {
    id: `handoff_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    fromDaemon,
    toDaemon,
    taskId,
    payload,
    status: 'OPEN',
    createdAt: new Date().toISOString()
  };
  const file = path.join(coordRoot(rootDir), `${handoff.id}.json`);
  writeJson(file, handoff);
  writeMemory({ rootDir, type: 'coordination_handoff', data: handoff });
  emitDaemonEvent({ rootDir, daemonId: 'daemon-coordinator', event: 'coordination_handoff_created', payload: handoff });
  return handoff;
}

export function getCoordinationReport({ rootDir = process.cwd() } = {}) {
  const daemons = listRegisteredDaemons({ rootDir });
  const claims = readJson(claimsFile(rootDir), { version: '1.0.0', claims: [] }).claims;
  const openClaims = claims.filter(claim => claim.status === 'OPEN');
  const wonClaims = claims.filter(claim => claim.status === 'WON');
  const report = {
    truthState: 'COORDINATION_REPORT_CREATED',
    daemonCount: daemons.length,
    daemons,
    claimCount: claims.length,
    openClaims: openClaims.length,
    wonClaims: wonClaims.length,
    health: openClaims.length > 10 ? 'CONGESTED' : daemons.length ? 'ACTIVE' : 'UNSEEDED',
    generatedAt: new Date().toISOString()
  };
  writeMemory({ rootDir, type: 'coordination_report', data: report });
  return report;
}

export function seedDefaultDaemons({ rootDir = process.cwd(), overwrite = false } = {}) {
  const file = registryFile(rootDir);
  if (fs.existsSync(file) && !overwrite) return listRegisteredDaemons({ rootDir });
  const defaults = [
    ['omni-orchestrator', 'omni'],
    ['platform-sentinel', 'sentinel'],
    ['crucible-daemon', 'crucible'],
    ['singularity-core', 'singularity'],
    ['convergence-daemon', 'convergence'],
    ['frontend-watchdog', 'watchdog'],
    ['middleend-watchdog', 'watchdog'],
    ['bridgeend-watchdog', 'watchdog'],
    ['backend-watchdog', 'watchdog'],
    ['scheduler-worker', 'executor'],
    ['adapter-health-engine', 'sentinel'],
    ['autonomous-tether-engine', 'sentinel']
  ];
  for (const [daemonId, role] of defaults) registerDaemon({ rootDir, daemonId, role });
  return listRegisteredDaemons({ rootDir });
}
