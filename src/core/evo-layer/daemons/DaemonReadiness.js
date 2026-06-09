import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { emitDaemonEvent } from './DaemonBus.js';
import { writeMemory } from '../memory/MemoryGraph.js';
import { seedDefaultDaemons, getCoordinationReport } from '../coordination/DaemonCoordinator.js';
import { getCoordinationRuntimeReport } from '../coordination/CoordinationRuntime.js';

export const DAEMON_ENTRYPOINTS = Object.freeze([
  { id: 'promptbridge', path: 'promptbridge-server.js', command: 'npm run bridge' },
  { id: 'singularity-core', path: 'src/core/daemons/singularity/SingularityCore.mjs', command: 'npm run singularity' },
  { id: 'crucible-daemon', path: 'src/core/daemons/crucible/CrucibleDaemon.mjs', command: 'npm run crucible' },
  { id: 'platform-sentinel', path: 'src/core/daemons/sentinel/PlatformSentinelDaemon.mjs', command: 'npm run sentinel:daemon' },
  { id: 'convergence-daemon', path: 'src/core/daemons/convergence/ConvergenceDaemon.mjs', command: 'npm run convergence:daemon' },
  { id: 'evolution-daemon', path: 'scripts/evolution-daemon.mjs', command: 'node scripts/evolution-daemon.mjs' },
  { id: 'ai-daemon', path: 'scripts/ai_daemon.mjs', command: 'npm run ai:daemon' },
  { id: 'audit-platform-daemon', path: 'scripts/audit-platform-daemon.mjs', command: 'npm run audit:platform:daemon' },
  { id: 'frontend-watchdog', path: 'src/core/daemons/watchdogs/FrontendWatchdog.mjs', command: 'npm run watchdog:frontend' },
  { id: 'middleend-watchdog', path: 'src/core/daemons/watchdogs/MiddleendWatchdog.mjs', command: 'npm run watchdog:middleend' },
  { id: 'bridgeend-watchdog', path: 'src/core/daemons/watchdogs/BridgeendWatchdog.mjs', command: 'npm run watchdog:bridgeend' },
  { id: 'backend-watchdog', path: 'src/core/daemons/watchdogs/BackendWatchdog.mjs', command: 'npm run watchdog:backend' },
  { id: 'self-invention-daemon', path: 'scripts/self-invention-daemon.mjs', command: 'npm run self:invent' },
  { id: 'omni-orchestrator', path: 'src/core/daemons/omni/OmniOrchestrator.mjs', command: 'npm run omni:orchestrator' },
  { id: 'antigravity-daemon', path: 'scripts/antigravity-daemon.mjs', command: 'npm run antigravity' },
]);

function proofRoot(rootDir) {
  const dir = path.join(rootDir, '.evo-layer', 'daemon-proof');
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function latestProofFile(rootDir) {
  return path.join(proofRoot(rootDir), 'latest.json');
}

function trimOutput(value = '', maxLength = 2000) {
  const text = String(value || '').trim();
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

export function checkDaemonEntrypointSyntax({ rootDir = process.cwd(), entrypoint, timeoutMs = 30000 } = {}) {
  if (!entrypoint?.id || !entrypoint?.path) throw new Error('checkDaemonEntrypointSyntax requires entrypoint.id and entrypoint.path.');
  const absolutePath = path.join(rootDir, entrypoint.path);
  const exists = fs.existsSync(absolutePath);
  if (!exists) {
    return {
      id: entrypoint.id,
      path: entrypoint.path,
      command: entrypoint.command,
      exists: false,
      passed: false,
      exitCode: 1,
      stderr: 'Entrypoint file does not exist.',
    };
  }

  const result = spawnSync(process.execPath, ['--check', absolutePath], {
    cwd: rootDir,
    encoding: 'utf8',
    timeout: timeoutMs,
  });

  return {
    id: entrypoint.id,
    path: entrypoint.path,
    command: entrypoint.command,
    exists: true,
    passed: result.status === 0,
    exitCode: result.status ?? 1,
    stdout: trimOutput(result.stdout),
    stderr: trimOutput(result.stderr || result.error?.message || ''),
  };
}

export function readLatestDaemonReadiness({ rootDir = process.cwd() } = {}) {
  const file = latestProofFile(rootDir);
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

export function writeDaemonReadinessReceipt({ rootDir = process.cwd(), report } = {}) {
  if (!report) throw new Error('writeDaemonReadinessReceipt requires report.');
  const dir = proofRoot(rootDir);
  const receiptPath = path.join(dir, `daemon-readiness-${Date.now()}.json`);
  fs.writeFileSync(receiptPath, JSON.stringify(report, null, 2), 'utf8');
  fs.writeFileSync(latestProofFile(rootDir), JSON.stringify({ ...report, receiptPath }, null, 2), 'utf8');
  return receiptPath;
}

function completionFromGaps({ checks, localGaps }) {
  if (!localGaps.length) return 100;
  const checkScore = checks.length
    ? Math.round((checks.filter(check => check.passed).length / checks.length) * 80)
    : 0;
  return Math.max(0, Math.min(99, checkScore));
}

export function buildDaemonReadinessReport({
  rootDir = process.cwd(),
  entrypoints = DAEMON_ENTRYPOINTS,
  runSyntaxCheck = true,
  writeReceipt = true,
} = {}) {
  seedDefaultDaemons({ rootDir });
  const syntaxChecks = runSyntaxCheck
    ? entrypoints.map(entrypoint => checkDaemonEntrypointSyntax({ rootDir, entrypoint }))
    : entrypoints.map(entrypoint => ({ ...entrypoint, exists: true, passed: true, skipped: true }));
  const coordination = getCoordinationReport({ rootDir });
  const runtime = getCoordinationRuntimeReport({ rootDir });
  const localGaps = [];

  const missing = syntaxChecks.filter(check => !check.exists);
  const failedSyntax = syntaxChecks.filter(check => check.exists && !check.passed);
  if (missing.length) localGaps.push(`Missing daemon entrypoints: ${missing.map(check => check.path).join(', ')}`);
  if (failedSyntax.length) localGaps.push(`Daemon syntax check failed: ${failedSyntax.map(check => check.path).join(', ')}`);
  if (coordination.health !== 'ACTIVE') localGaps.push(`Coordination health is ${coordination.health}.`);
  if (runtime.deadlocks?.hasDeadlockRisk) localGaps.push('Coordination runtime has deadlock risk.');

  const localCompletion = completionFromGaps({ checks: syntaxChecks, localGaps });
  const report = {
    success: localGaps.length === 0,
    truthState: localGaps.length === 0 ? 'LOCAL_DAEMON_STACK_READY' : 'LOCAL_DAEMON_STACK_HAS_GAPS',
    localCompletion,
    entrypointCount: syntaxChecks.length,
    syntaxPassCount: syntaxChecks.filter(check => check.passed).length,
    syntaxChecks,
    coordination: {
      truthState: coordination.truthState,
      daemonCount: coordination.daemonCount,
      openClaims: coordination.openClaims,
      wonClaims: coordination.wonClaims,
      health: coordination.health,
    },
    runtime: {
      truthState: runtime.truthState,
      activeLeases: runtime.activeLeases.length,
      expiredLeases: runtime.expiredLeases.length,
      decisionCount: runtime.decisionCount,
      deadlocks: runtime.deadlocks,
    },
    externalGates: [
      {
        id: 'live-daemon-process-supervision',
        truthState: 'OPERATOR_START_REQUIRED',
        reason: 'Long-running daemon supervision is proven by the operator starting daemons:all; this proof validates local contracts and entrypoints.',
      },
      {
        id: 'live-provider-daemon-actions',
        truthState: 'PROVIDER_GATED',
        reason: 'Provider-backed daemon actions require live Stripe/Vercel/OpenAI/JWT environment proof before production execution claims.',
      },
    ],
    localGaps,
    generatedAt: new Date().toISOString(),
  };

  if (writeReceipt) {
    const receiptPath = writeDaemonReadinessReceipt({ rootDir, report });
    report.receiptPath = receiptPath;
  }
  writeMemory({ rootDir, type: 'daemon_readiness_report', data: report });
  emitDaemonEvent({ rootDir, daemonId: 'daemon-readiness', event: 'daemon_readiness_report_created', payload: { truthState: report.truthState, localCompletion } });
  return report;
}
