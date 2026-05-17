import fs from 'fs';
import path from 'path';

const DEFAULT_SETTINGS = Object.freeze({
  enabled: false,
  autonomyLevel: 2,
  intervalMinutes: 60,
  maxCyclesPerDay: 12,
  maxPatchesPerDay: 10,
  maxAutoMergesPerDay: 0,
  maxChangedFilesPerPatch: 5,
  maxExternalAiCallsPerDay: 20,
  allowLowRiskAutoMerge: false,
  requireOwnerApprovalForMediumRisk: true,
  requireOwnerApprovalForHighRisk: true,
  runTests: true,
  runBuild: true,
  allowRollback: true,
  preserveFailedWorkspaces: true,
  focusAreas: ['truth_cleanup', 'route_integrity', 'button_wiring', 'proof_dashboard', 'docs', 'diagnostics'],
});

const settingsPath = (rootDir = process.cwd()) => path.join(rootDir, '.prompthouse-data', 'evolution', 'daemon_settings.json');

export function loadEvolutionDaemonSettings(rootDir = process.cwd()) {
  const file = settingsPath(rootDir);
  if (!fs.existsSync(file)) return { ...DEFAULT_SETTINGS };
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(fs.readFileSync(file, 'utf8')) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveEvolutionDaemonSettings(settings = {}, rootDir = process.cwd()) {
  const next = { ...DEFAULT_SETTINGS, ...settings };
  if (next.autonomyLevel < 0 || next.autonomyLevel > 5) throw new Error('autonomyLevel must be between 0 and 5.');
  if (next.intervalMinutes < 1) throw new Error('intervalMinutes must be at least 1.');
  const file = settingsPath(rootDir);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(next, null, 2), 'utf8');
  return next;
}

export { DEFAULT_SETTINGS as DEFAULT_EVOLUTION_DAEMON_SETTINGS };
