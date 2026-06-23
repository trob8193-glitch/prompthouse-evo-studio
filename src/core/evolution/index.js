import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DATA_DIR = () => path.join(process.cwd(), '.prompthouse-data', 'evolution');
const RUNS_FILE = () => path.join(DATA_DIR(), 'runs.jsonl');
const STATE_FILE = () => path.join(DATA_DIR(), 'daemon_state.json');
const KILL_SWITCH_FILE = () => path.join(DATA_DIR(), '.evolution-kill-switch');
const APPROVAL_QUEUE_FILE = () => path.join(DATA_DIR(), 'approval_queue.jsonl');
const MEMORY_FILE = () => path.join(DATA_DIR(), 'evolution_memory.json');
const SETTINGS_FILE = () => path.join(DATA_DIR(), 'daemon_settings.json');

function ensureDir() {
  const dir = DATA_DIR();
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function readJsonSafe(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback;
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch { return fallback; }
}

function readJsonlSafe(filePath, limit = 200) {
  if (!fs.existsSync(filePath)) return [];
  try {
    return fs.readFileSync(filePath, 'utf8').trim().split('\n').filter(Boolean).slice(-limit).map(line => {
      try { return JSON.parse(line); } catch { return null; }
    }).filter(Boolean);
  } catch { return []; }
}

// ─── Global daemon singleton reference ────────────────────────
let globalDaemon = null;

export function setGlobalDaemon(daemon) { globalDaemon = daemon; }
export function getGlobalDaemon() { return globalDaemon; }

// ─── Evolution Cycle ─────────────────────────────────────────

export async function runEvolutionCycle(options = {}) {
  if (globalDaemon) {
    return await globalDaemon.runOnce(options);
  }
  // Fallback: create a one-shot daemon
  const { QuadBrainEvolutionDaemon } = await import('../daemons/QuadBrainEvolutionDaemon.js');
  const daemon = new QuadBrainEvolutionDaemon(process.cwd());
  return await daemon.runOnce(options);
}

// ─── Evolution Status ────────────────────────────────────────

export function getEvolutionStatus() {
  ensureDir();
  const state = readJsonSafe(STATE_FILE(), { active: false, cycleCount: 0, lastCycleAt: null });
  const runs = readJsonlSafe(RUNS_FILE(), 5);
  const lastRun = runs.length > 0 ? runs[runs.length - 1] : null;

  return {
    success: true,
    truthState: 'EVOLUTION_STATUS_LIVE',
    active: state.active || false,
    stage: state.active ? 'running' : 'idle',
    cycleCount: state.cycleCount || 0,
    totalEvolutions: state.totalEvolutions || 0,
    consecutiveFailures: state.consecutiveFailures || 0,
    killSwitchEngaged: fs.existsSync(KILL_SWITCH_FILE()),
    lastRun: lastRun ? {
      id: lastRun.id,
      truthState: lastRun.truthState,
      suggestion: lastRun.suggestion?.description || null,
      applied: lastRun.applied || false,
      startedAt: lastRun.startedAt,
      completedAt: lastRun.completedAt,
      error: lastRun.error || null
    } : null,
    recentRuns: runs.slice(-5).reverse(),
    policy: { rule: 'CSS auto-merge, code requires approval', costFirewallActive: true }
  };
}

// ─── Run History ─────────────────────────────────────────────

export function listEvolutionRuns(limit = 50) {
  return readJsonlSafe(RUNS_FILE(), limit).reverse();
}

export function getEvolutionRun(runId) {
  const runs = readJsonlSafe(RUNS_FILE(), 500);
  return runs.find(r => r.id === runId) || null;
}

// ─── Memory ──────────────────────────────────────────────────

export function loadEvolutionMemory() {
  ensureDir();
  return readJsonSafe(MEMORY_FILE(), {
    totalCycles: 0,
    successfulEvolutions: 0,
    failedAttempts: 0,
    topTargetFiles: {},
    recentSuggestions: []
  });
}

export function saveEvolutionMemory(memory) {
  ensureDir();
  fs.writeFileSync(MEMORY_FILE(), JSON.stringify(memory, null, 2), 'utf8');
  return memory;
}

// ─── Daemon Control ──────────────────────────────────────────

export function getAutonomousEvolutionDaemonStatus() {
  const state = readJsonSafe(STATE_FILE(), { active: false });
  return {
    active: state.active || false,
    cycleCount: state.cycleCount || 0,
    lastCycleAt: state.lastCycleAt || null,
    totalEvolutions: state.totalEvolutions || 0,
    consecutiveFailures: state.consecutiveFailures || 0,
    killSwitchEngaged: fs.existsSync(KILL_SWITCH_FILE())
  };
}

export async function runAutonomousEvolutionCycle() {
  const result = await runEvolutionCycle();
  return { truthState: result.truthState || 'DAEMON_CYCLE_COMPLETED', run: result };
}

export function startAutonomousEvolutionDaemon(intervalMs = 300000) {
  if (globalDaemon) {
    globalDaemon.start(intervalMs);
    return { active: true, intervalMs, startedAt: new Date().toISOString() };
  }
  return { active: false, reason: 'No daemon instance available. Start server first.', checkedAt: new Date().toISOString() };
}

export function stopAutonomousEvolutionDaemon() {
  if (globalDaemon) {
    globalDaemon.stop();
    return { active: false };
  }
  const state = readJsonSafe(STATE_FILE(), {});
  state.active = false;
  ensureDir();
  fs.writeFileSync(STATE_FILE(), JSON.stringify(state, null, 2), 'utf8');
  return { active: false };
}

// ─── Settings ────────────────────────────────────────────────

export function loadEvolutionDaemonSettings() {
  ensureDir();
  return readJsonSafe(SETTINGS_FILE(), {
    intervalMs: 300000,
    autoMergeCss: true,
    autoMergeCode: false,
    maxConsecutiveFailures: 5,
    costFirewallEnabled: true
  });
}

export function saveEvolutionDaemonSettings(settings) {
  ensureDir();
  const current = loadEvolutionDaemonSettings();
  const merged = { ...current, ...settings };
  fs.writeFileSync(SETTINGS_FILE(), JSON.stringify(merged, null, 2), 'utf8');
  return merged;
}

// ─── Kill Switch ─────────────────────────────────────────────

export function getEvolutionKillSwitchState() {
  return { engaged: fs.existsSync(KILL_SWITCH_FILE()) };
}

export function engageEvolutionKillSwitch(reason = 'Manual engagement') {
  ensureDir();
  fs.writeFileSync(KILL_SWITCH_FILE(), JSON.stringify({
    engaged: true,
    reason,
    engagedAt: new Date().toISOString()
  }), 'utf8');
  if (globalDaemon) globalDaemon.stop();
  return { engaged: true, reason };
}

export function releaseEvolutionKillSwitch() {
  if (fs.existsSync(KILL_SWITCH_FILE())) {
    fs.unlinkSync(KILL_SWITCH_FILE());
  }
  return { engaged: false };
}

// ─── Approval Queue ──────────────────────────────────────────

export function listEvolutionApprovalQueue() {
  return readJsonlSafe(APPROVAL_QUEUE_FILE(), 100).filter(item => item.status === 'pending');
}

export function approveEvolutionQueueItem(runId) {
  const items = readJsonlSafe(APPROVAL_QUEUE_FILE(), 500);
  const target = items.find(i => i.id === runId);
  if (!target) return { approved: false, reason: 'Item not found' };

  target.status = 'approved';
  target.approvedAt = new Date().toISOString();

  // Rewrite the queue
  ensureDir();
  fs.writeFileSync(APPROVAL_QUEUE_FILE(), items.map(i => JSON.stringify(i)).join('\n') + '\n', 'utf8');
  return { approved: true, runId };
}

export function rejectEvolutionQueueItem(runId, reason = 'Owner rejected') {
  const items = readJsonlSafe(APPROVAL_QUEUE_FILE(), 500);
  const target = items.find(i => i.id === runId);
  if (!target) return { rejected: false, reason: 'Item not found' };

  target.status = 'rejected';
  target.rejectedAt = new Date().toISOString();
  target.rejectionReason = reason;

  ensureDir();
  fs.writeFileSync(APPROVAL_QUEUE_FILE(), items.map(i => JSON.stringify(i)).join('\n') + '\n', 'utf8');
  return { rejected: true, runId };
}
