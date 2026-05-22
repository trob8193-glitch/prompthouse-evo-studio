import { loadEvolutionDaemonSettings, saveEvolutionDaemonSettings } from './EvolutionDaemonSettings.js';
import { selectAutonomousObjective } from './AutonomousObjectiveSelector.js';
import { loadEvolutionMemory } from './EvolutionMemory.js';
import { runEvolutionCycle, getEvolutionStatus } from './EvolutionOrchestrator.js';
import { getEvolutionKillSwitchState, engageEvolutionKillSwitch, shouldEngageKillSwitch } from './EvolutionKillSwitch.js';

let daemonTimer = null;
let running = false;
let lastResult = null;
let consecutiveFailures = 0;

const MAX_CONSECUTIVE_FAILURES = 3;

export function getAutonomousEvolutionDaemonStatus({ rootDir = process.cwd() } = {}) {
  const settings = loadEvolutionDaemonSettings(rootDir);
  const killSwitch = getEvolutionKillSwitchState(rootDir);
  return {
    success: true,
    enabled: settings.enabled,
    running,
    timerActive: Boolean(daemonTimer),
    consecutiveFailures,
    settings,
    killSwitch,
    lastResult,
    evolution: getEvolutionStatus({ rootDir }),
  };
}

export async function runAutonomousEvolutionCycle({ rootDir = process.cwd(), trigger = 'manual' } = {}) {
  const settings = loadEvolutionDaemonSettings(rootDir);
  const killSwitch = getEvolutionKillSwitchState(rootDir);

  if (killSwitch.engaged) {
    throw new Error(`Self-evolution kill switch engaged: ${killSwitch.reason}`);
  }
  if (settings.autonomyLevel <= 0) {
    return { success: true, truthState: 'AUTONOMY_OFF', trigger };
  }
  if (running) {
    return { success: false, truthState: 'BLOCKED', error: 'Autonomous evolution cycle already running.' };
  }

  running = true;
  const startedAt = Date.now();

  try {
    const memory = loadEvolutionMemory();
    const selected = selectAutonomousObjective({
      rootDir,
      memory,
      focusAreas: settings.focusAreas,
    });

    const mode = settings.autonomyLevel <= 2 ? 'proposal' : 'proof';

    const result = await runEvolutionCycle({
      rootDir,
      objective: selected.objective,
      mode,
      applyFixes: settings.autonomyLevel >= 3,
      runTests: settings.runTests,
      runBuild: settings.runBuild,
      allowRollback: settings.allowRollback,
    });

    const durationMs = Date.now() - startedAt;

    if (result.success) {
      consecutiveFailures = 0;
    } else {
      consecutiveFailures += 1;
    }

    // Auto-engage kill switch after repeated failures
    if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
      const decision = shouldEngageKillSwitch({ proofFailures: consecutiveFailures });
      if (decision.engage) {
        engageEvolutionKillSwitch({
          rootDir,
          reason: `Auto-engaged after ${consecutiveFailures} consecutive failures: ${decision.reasons.join('; ')}`,
        });
      }
    }

    lastResult = {
      ...result,
      selectedObjective: selected,
      trigger,
      durationMs,
      completedAt: new Date().toISOString(),
    };
    return lastResult;
  } catch (error) {
    consecutiveFailures += 1;
    const durationMs = Date.now() - startedAt;

    lastResult = {
      success: false,
      error: error.message || String(error),
      trigger,
      durationMs,
      completedAt: new Date().toISOString(),
    };

    // Auto-engage kill switch on unhandled errors after threshold
    if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
      try {
        engageEvolutionKillSwitch({
          rootDir,
          reason: `Auto-engaged after ${consecutiveFailures} consecutive unhandled errors: ${error.message}`,
        });
      } catch {
        // Kill switch write failure is non-blocking
      }
    }

    return lastResult;
  } finally {
    running = false;
  }
}

export function startAutonomousEvolutionDaemon({ rootDir = process.cwd(), settings = {} } = {}) {
  const next = saveEvolutionDaemonSettings({ ...settings, enabled: true }, rootDir);
  stopAutonomousEvolutionDaemon({ rootDir, preserveEnabled: true });

  consecutiveFailures = 0;
  const intervalMs = Math.max(60000, Number(next.intervalMinutes || 60) * 60 * 1000);

  daemonTimer = setInterval(() => {
    // Fire-and-forget with full error containment
    runAutonomousEvolutionCycle({ rootDir, trigger: 'daemon' }).catch((error) => {
      lastResult = {
        success: false,
        error: error.message || String(error),
        trigger: 'daemon',
        completedAt: new Date().toISOString(),
      };
    });
  }, intervalMs);

  return getAutonomousEvolutionDaemonStatus({ rootDir });
}

export function stopAutonomousEvolutionDaemon({ rootDir = process.cwd(), preserveEnabled = false } = {}) {
  if (daemonTimer) {
    clearInterval(daemonTimer);
    daemonTimer = null;
  }
  if (!preserveEnabled) {
    const current = loadEvolutionDaemonSettings(rootDir);
    saveEvolutionDaemonSettings({ ...current, enabled: false }, rootDir);
  }
  return getAutonomousEvolutionDaemonStatus({ rootDir });
}
