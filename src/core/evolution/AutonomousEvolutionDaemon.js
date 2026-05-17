import { loadEvolutionDaemonSettings, saveEvolutionDaemonSettings } from './EvolutionDaemonSettings.js';
import { selectAutonomousObjective } from './AutonomousObjectiveSelector.js';
import { loadEvolutionMemory } from './EvolutionMemory.js';
import { runEvolutionCycle, getEvolutionStatus } from './EvolutionOrchestrator.js';
import { getEvolutionKillSwitchState } from './EvolutionKillSwitch.js';

let daemonTimer = null;
let running = false;
let lastResult = null;

export function getAutonomousEvolutionDaemonStatus({ rootDir = process.cwd() } = {}) {
  const settings = loadEvolutionDaemonSettings(rootDir);
  const killSwitch = getEvolutionKillSwitchState(rootDir);
  return {
    success: true,
    enabled: settings.enabled,
    running,
    timerActive: Boolean(daemonTimer),
    settings,
    killSwitch,
    lastResult,
    evolution: getEvolutionStatus({ rootDir }),
  };
}

export async function runAutonomousEvolutionCycle({ rootDir = process.cwd(), trigger = 'manual' } = {}) {
  const settings = loadEvolutionDaemonSettings(rootDir);
  const killSwitch = getEvolutionKillSwitchState(rootDir);
  if (killSwitch.engaged) throw new Error(`Self-evolution kill switch engaged: ${killSwitch.reason}`);
  if (settings.autonomyLevel <= 0) return { success: true, truthState: 'AUTONOMY_OFF', trigger };
  if (running) return { success: false, truthState: 'BLOCKED', error: 'Autonomous evolution cycle already running.' };

  running = true;
  try {
    const memory = loadEvolutionMemory();
    const selected = selectAutonomousObjective({ rootDir, memory, focusAreas: settings.focusAreas });
    const mode = settings.autonomyLevel === 1 ? 'proposal' : settings.autonomyLevel === 2 ? 'proposal' : 'proof';
    const result = await runEvolutionCycle({
      rootDir,
      objective: selected.objective,
      mode,
      applyFixes: settings.autonomyLevel >= 3,
      runTests: settings.runTests,
      runBuild: settings.runBuild,
      allowRollback: settings.allowRollback,
    });
    lastResult = { ...result, selectedObjective: selected, trigger, completedAt: new Date().toISOString() };
    return lastResult;
  } finally {
    running = false;
  }
}

export function startAutonomousEvolutionDaemon({ rootDir = process.cwd(), settings = {} } = {}) {
  const next = saveEvolutionDaemonSettings({ ...settings, enabled: true }, rootDir);
  stopAutonomousEvolutionDaemon({ rootDir, preserveEnabled: true });
  const intervalMs = Math.max(1, Number(next.intervalMinutes || 60)) * 60 * 1000;
  daemonTimer = setInterval(() => {
    runAutonomousEvolutionCycle({ rootDir, trigger: 'daemon' }).catch(error => {
      lastResult = { success: false, error: error.message, completedAt: new Date().toISOString() };
    });
  }, intervalMs);
  return getAutonomousEvolutionDaemonStatus({ rootDir });
}

export function stopAutonomousEvolutionDaemon({ rootDir = process.cwd(), preserveEnabled = false } = {}) {
  if (daemonTimer) clearInterval(daemonTimer);
  daemonTimer = null;
  if (!preserveEnabled) {
    const current = loadEvolutionDaemonSettings(rootDir);
    saveEvolutionDaemonSettings({ ...current, enabled: false }, rootDir);
  }
  return getAutonomousEvolutionDaemonStatus({ rootDir });
}
