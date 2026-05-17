import fs from 'fs';
import path from 'path';

const stateFile = (rootDir = process.cwd()) => path.join(rootDir, '.prompthouse-data', 'evolution', 'kill_switch.json');

export function getEvolutionKillSwitchState(rootDir = process.cwd()) {
  const file = stateFile(rootDir);
  if (!fs.existsSync(file)) return { engaged: false, reason: null, updatedAt: null };
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return { engaged: true, reason: 'Unreadable kill switch state', updatedAt: new Date().toISOString() }; }
}

export function engageEvolutionKillSwitch({ rootDir = process.cwd(), reason = 'Manual kill switch' } = {}) {
  const state = { engaged: true, reason, updatedAt: new Date().toISOString() };
  const file = stateFile(rootDir);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(state, null, 2), 'utf8');
  return state;
}

export function releaseEvolutionKillSwitch({ rootDir = process.cwd(), reason = 'Manual release' } = {}) {
  const state = { engaged: false, reason, updatedAt: new Date().toISOString() };
  const file = stateFile(rootDir);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(state, null, 2), 'utf8');
  return state;
}

export function shouldEngageKillSwitch({ proofFailures = 0, rollbackFailed = false, forbiddenMutationAttempted = false, costLimitExceeded = false } = {}) {
  const reasons = [];
  if (proofFailures >= 2) reasons.push('Two consecutive proof failures.');
  if (rollbackFailed) reasons.push('Rollback failed.');
  if (forbiddenMutationAttempted) reasons.push('Forbidden mutation attempted.');
  if (costLimitExceeded) reasons.push('Cost limit exceeded.');
  return { engage: reasons.length > 0, reasons };
}
