import fs from 'fs';
import path from 'path';
import { getCoordinationReport, listRegisteredDaemons, resolveCoordinationConflict } from './DaemonCoordinator.js';
import { getSchedulerReport, listTasks } from '../scheduler/TaskScheduler.js';
import { getTetherReport } from '../tether/AutonomousTetherEngine.js';
import { calculateAdapterHealth } from '../adapters/AdapterHealthEngine.js';
import { writeMemory } from '../memory/MemoryGraph.js';
import { emitDaemonEvent } from '../daemons/DaemonBus.js';

function runtimeRoot(rootDir) {
  const dir = path.join(rootDir, '.evo-layer', 'coordination-runtime');
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function readJson(file, fallback) {
  if (!fs.existsSync(file)) return fallback;
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function locksFile(rootDir) {
  return path.join(runtimeRoot(rootDir), 'locks.json');
}

function decisionsFile(rootDir) {
  return path.join(runtimeRoot(rootDir), 'decisions.json');
}

export function acquireTaskLease({ rootDir = process.cwd(), taskId, daemonId, ttlMs = 120000 } = {}) {
  if (!taskId || !daemonId) throw new Error('acquireTaskLease requires taskId and daemonId.');
  const store = readJson(locksFile(rootDir), { version: '1.0.0', locks: [] });
  const now = Date.now();
  const existing = store.locks.find(lock => lock.taskId === taskId && new Date(lock.expiresAt).getTime() > now);
  if (existing && existing.daemonId !== daemonId) {
    return { acquired: false, reason: 'LEASE_HELD', lock: existing };
  }
  const lock = {
    id: `lease_${taskId}_${daemonId}_${now}`,
    taskId,
    daemonId,
    status: 'ACTIVE',
    acquiredAt: new Date(now).toISOString(),
    expiresAt: new Date(now + ttlMs).toISOString()
  };
  store.locks = store.locks.filter(item => item.taskId !== taskId || new Date(item.expiresAt).getTime() > now === false);
  store.locks.push(lock);
  writeJson(locksFile(rootDir), store);
  emitDaemonEvent({ rootDir, daemonId: 'coordination-runtime', event: 'task_lease_acquired', payload: lock });
  return { acquired: true, lock };
}

export function releaseTaskLease({ rootDir = process.cwd(), taskId, daemonId } = {}) {
  const store = readJson(locksFile(rootDir), { version: '1.0.0', locks: [] });
  const before = store.locks.length;
  store.locks = store.locks.filter(lock => !(lock.taskId === taskId && lock.daemonId === daemonId));
  writeJson(locksFile(rootDir), store);
  const result = { released: before !== store.locks.length, taskId, daemonId, releasedAt: new Date().toISOString() };
  emitDaemonEvent({ rootDir, daemonId: 'coordination-runtime', event: 'task_lease_released', payload: result });
  return result;
}

export function detectCoordinationDeadlocks({ rootDir = process.cwd() } = {}) {
  const locks = readJson(locksFile(rootDir), { version: '1.0.0', locks: [] }).locks;
  const now = Date.now();
  const expired = locks.filter(lock => new Date(lock.expiresAt).getTime() <= now);
  const activeByTask = locks.reduce((acc, lock) => {
    if (new Date(lock.expiresAt).getTime() > now) {
      acc[lock.taskId] ||= [];
      acc[lock.taskId].push(lock);
    }
    return acc;
  }, {});
  const contested = Object.entries(activeByTask).filter(([, list]) => list.length > 1).map(([taskId, list]) => ({ taskId, locks: list }));
  return {
    truthState: 'COORDINATION_DEADLOCK_SCAN_CREATED',
    expired,
    contested,
    hasDeadlockRisk: expired.length > 0 || contested.length > 0,
    generatedAt: new Date().toISOString()
  };
}

export function createCoordinationDecision({ rootDir = process.cwd(), taskId, selectedDaemon, reason, evidence = {} } = {}) {
  if (!taskId || !selectedDaemon) throw new Error('createCoordinationDecision requires taskId and selectedDaemon.');
  const store = readJson(decisionsFile(rootDir), { version: '1.0.0', decisions: [] });
  const decision = {
    id: `decision_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    taskId,
    selectedDaemon,
    reason,
    evidence,
    truthState: 'COORDINATION_DECISION_RECORDED',
    createdAt: new Date().toISOString()
  };
  store.decisions.push(decision);
  writeJson(decisionsFile(rootDir), store);
  writeMemory({ rootDir, type: 'coordination_decision', data: decision });
  emitDaemonEvent({ rootDir, daemonId: 'coordination-runtime', event: 'coordination_decision_recorded', payload: decision });
  return decision;
}

export function runCoordinationCycle({ rootDir = process.cwd() } = {}) {
  const scheduler = getSchedulerReport({ rootDir });
  const coordination = getCoordinationReport({ rootDir });
  const tethers = getTetherReport({ rootDir });
  const adapterHealth = calculateAdapterHealth({ rootDir });
  const deadlocks = detectCoordinationDeadlocks({ rootDir });
  const daemons = listRegisteredDaemons({ rootDir });
  const queuedTasks = listTasks({ rootDir, state: 'QUEUED' }).slice(0, 10);
  const decisions = [];

  for (const task of queuedTasks) {
    const candidates = daemons.filter(daemon => {
      const title = String(task.title || '').toLowerCase();
      if (title.includes('audit') || title.includes('verify')) return daemon.capabilities?.includes('audit') || daemon.role === 'sentinel';
      if (title.includes('resolve') || title.includes('merge')) return daemon.capabilities?.includes('resolve') || daemon.role === 'convergence';
      if (title.includes('execute') || title.includes('build')) return daemon.capabilities?.includes('execute') || daemon.role === 'executor';
      return daemon.status === 'AVAILABLE';
    });
    const selected = candidates[0] || daemons[0] || null;
    if (selected) {
      const lease = acquireTaskLease({ rootDir, taskId: task.id, daemonId: selected.daemonId });
      if (lease.acquired) {
        decisions.push(createCoordinationDecision({
          rootDir,
          taskId: task.id,
          selectedDaemon: selected.daemonId,
          reason: 'BEST_AVAILABLE_ROLE_MATCH',
          evidence: { task, selected, lease: lease.lock }
        }));
      }
    }
  }

  const report = {
    truthState: 'COORDINATION_CYCLE_COMPLETED',
    scheduler,
    coordination,
    tethers,
    adapterHealth,
    deadlocks,
    decisions,
    generatedAt: new Date().toISOString()
  };
  writeMemory({ rootDir, type: 'coordination_cycle', data: report });
  emitDaemonEvent({ rootDir, daemonId: 'coordination-runtime', event: 'coordination_cycle_completed', payload: { decisions: decisions.length, deadlockRisk: deadlocks.hasDeadlockRisk } });
  return report;
}

export function getCoordinationRuntimeReport({ rootDir = process.cwd() } = {}) {
  const locks = readJson(locksFile(rootDir), { version: '1.0.0', locks: [] }).locks;
  const decisions = readJson(decisionsFile(rootDir), { version: '1.0.0', decisions: [] }).decisions;
  const deadlocks = detectCoordinationDeadlocks({ rootDir });
  return {
    truthState: 'COORDINATION_RUNTIME_REPORT_CREATED',
    activeLeases: locks.filter(lock => new Date(lock.expiresAt).getTime() > Date.now()),
    expiredLeases: locks.filter(lock => new Date(lock.expiresAt).getTime() <= Date.now()),
    decisionCount: decisions.length,
    recentDecisions: decisions.slice(-25),
    deadlocks,
    generatedAt: new Date().toISOString()
  };
}
