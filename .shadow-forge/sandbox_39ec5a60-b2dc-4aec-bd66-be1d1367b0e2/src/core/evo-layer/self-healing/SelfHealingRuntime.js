import fs from 'fs';
import path from 'path';
import { getCoordinationRuntimeReport, detectCoordinationDeadlocks, releaseTaskLease } from '../coordination/CoordinationRuntime.js';
import { getTetherReport } from '../tether/AutonomousTetherEngine.js';
import { calculateAdapterHealth } from '../adapters/AdapterHealthEngine.js';
import { getRuntimeControlCenterStatus } from '../observability/RuntimeControlCenter.js';
import { writeMemory } from '../memory/MemoryGraph.js';
import { emitDaemonEvent } from '../daemons/DaemonBus.js';

function healingRoot(rootDir) {
  const dir = path.join(rootDir, '.evo-layer', 'self-healing');
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function writeHealingReceipt(rootDir, receipt) {
  const file = path.join(healingRoot(rootDir), `${receipt.id}.json`);
  fs.writeFileSync(file, JSON.stringify(receipt, null, 2));
  return file;
}

export function diagnoseRuntime({ rootDir = process.cwd() } = {}) {
  const coordination = getCoordinationRuntimeReport({ rootDir });
  const deadlocks = detectCoordinationDeadlocks({ rootDir });
  const tethers = getTetherReport({ rootDir });
  const adapterHealth = calculateAdapterHealth({ rootDir });
  const runtime = getRuntimeControlCenterStatus({ rootDir });

  const issues = [];

  for (const lock of deadlocks.expired || []) {
    issues.push({
      type: 'expired-lease',
      severity: 'medium',
      message: `Expired lease detected for task ${lock.taskId}.`,
      lock
    });
  }

  for (const contest of deadlocks.contested || []) {
    issues.push({
      type: 'contested-lease',
      severity: 'high',
      message: `Multiple active leases detected for task ${contest.taskId}.`,
      contest
    });
  }

  for (const orphan of tethers.orphans || []) {
    issues.push({
      type: 'orphan-engine',
      severity: 'low',
      message: `Engine ${orphan.name} is registered but not tethered.`,
      engineId: orphan.id
    });
  }

  for (const adapter of adapterHealth.adapters || []) {
    if (adapter.health === 'WEAK') {
      issues.push({
        type: 'weak-adapter',
        severity: adapter.status === 'missing' ? 'medium' : 'high',
        message: `Adapter ${adapter.name} is weak or missing.`,
        adapter
      });
    }
  }

  if (runtime.health?.status === 'UNSTABLE') {
    issues.push({
      type: 'runtime-unstable',
      severity: 'high',
      message: 'Runtime Control Center reports unstable health.',
      health: runtime.health
    });
  }

  return {
    truthState: 'SELF_HEALING_DIAGNOSIS_CREATED',
    issueCount: issues.length,
    issues,
    coordination,
    tethers,
    adapterHealth,
    runtimeHealth: runtime.health,
    generatedAt: new Date().toISOString()
  };
}

export function createRepairPlan({ rootDir = process.cwd(), diagnosis = null } = {}) {
  const diag = diagnosis || diagnoseRuntime({ rootDir });
  const actions = diag.issues.map(issue => {
    if (issue.type === 'expired-lease') {
      return {
        type: 'release-expired-lease',
        safe: true,
        issue,
        action: {
          taskId: issue.lock.taskId,
          daemonId: issue.lock.daemonId
        }
      };
    }
    if (issue.type === 'contested-lease') {
      return {
        type: 'manual-review-contested-lease',
        safe: false,
        issue,
        action: 'Resolve contested leases through CoordinationRuntime arbitration.'
      };
    }
    if (issue.type === 'orphan-engine') {
      return {
        type: 'add-engine-tether',
        safe: false,
        issue,
        action: 'Create explicit tether for orphan engine after architecture review.'
      };
    }
    if (issue.type === 'weak-adapter') {
      return {
        type: 'deprioritize-weak-adapter',
        safe: false,
        issue,
        action: 'Route away from weak adapter until health improves.'
      };
    }
    return {
      type: 'review-required',
      safe: false,
      issue,
      action: 'Manual review required.'
    };
  });

  return {
    truthState: 'SELF_HEALING_REPAIR_PLAN_CREATED',
    safeActionCount: actions.filter(action => action.safe).length,
    unsafeActionCount: actions.filter(action => !action.safe).length,
    actions,
    createdAt: new Date().toISOString()
  };
}

export function applySafeRepairs({ rootDir = process.cwd(), plan = null } = {}) {
  const repairPlan = plan || createRepairPlan({ rootDir });
  const applied = [];
  const skipped = [];

  for (const action of repairPlan.actions) {
    if (!action.safe) {
      skipped.push({ action, reason: 'UNSAFE_REQUIRES_REVIEW' });
      continue;
    }
    if (action.type === 'release-expired-lease') {
      applied.push({
        action,
        result: releaseTaskLease({ rootDir, taskId: action.action.taskId, daemonId: action.action.daemonId })
      });
    }
  }

  const receipt = {
    id: `self_healing_${Date.now()}`,
    truthState: 'SELF_HEALING_SAFE_REPAIRS_APPLIED',
    applied,
    skipped,
    createdAt: new Date().toISOString()
  };
  receipt.file = writeHealingReceipt(rootDir, receipt);
  writeMemory({ rootDir, type: 'self_healing_receipt', data: receipt });
  emitDaemonEvent({ rootDir, daemonId: 'self-healing-runtime', event: 'safe_repairs_applied', payload: receipt });
  return receipt;
}

export function runSelfHealingCycle({ rootDir = process.cwd(), apply = false } = {}) {
  const diagnosis = diagnoseRuntime({ rootDir });
  const plan = createRepairPlan({ rootDir, diagnosis });
  const repair = apply ? applySafeRepairs({ rootDir, plan }) : null;
  const cycle = {
    id: `self_healing_cycle_${Date.now()}`,
    truthState: apply ? 'SELF_HEALING_CYCLE_APPLIED_SAFE_REPAIRS' : 'SELF_HEALING_CYCLE_PLANNED',
    diagnosis,
    plan,
    repair,
    createdAt: new Date().toISOString()
  };
  cycle.file = writeHealingReceipt(rootDir, cycle);
  writeMemory({ rootDir, type: 'self_healing_cycle', data: cycle });
  emitDaemonEvent({ rootDir, daemonId: 'self-healing-runtime', event: 'self_healing_cycle_completed', payload: { issueCount: diagnosis.issueCount, safeActions: plan.safeActionCount, applied: Boolean(apply) } });
  return cycle;
}
