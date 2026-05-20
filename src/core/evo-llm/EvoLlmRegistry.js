import fs from 'fs';
import path from 'path';
import { getEvoLlmOrchestratorPaths } from './EvoLlmOrchestratorPlan.js';

function readJsonSafe(file, fallback = null) { try { return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : fallback; } catch { return fallback; } }
function listJson(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((file) => file.endsWith('.json')).map((file) => ({ file: path.join(dir, file), data: readJsonSafe(path.join(dir, file), null) })).filter((item) => item.data);
}

export function listEvoTrainPlans({ rootDir = process.cwd(), limit = 50 } = {}) {
  const paths = getEvoLlmOrchestratorPaths({ rootDir });
  return listJson(paths.plans).sort((a, b) => String(b.data.createdAt).localeCompare(String(a.data.createdAt))).slice(0, limit).map((item) => item.data);
}

export function listEvoTrainRuns({ rootDir = process.cwd(), limit = 50 } = {}) {
  const paths = getEvoLlmOrchestratorPaths({ rootDir });
  return listJson(paths.runs).sort((a, b) => String(b.data.createdAt).localeCompare(String(a.data.createdAt))).slice(0, limit).map((item) => item.data);
}

export function listEvoModelVersions({ rootDir = process.cwd(), limit = 50 } = {}) {
  const paths = getEvoLlmOrchestratorPaths({ rootDir });
  return listJson(paths.versions).sort((a, b) => String(b.data.promotedAt || b.data.rolledBackAt).localeCompare(String(a.data.promotedAt || a.data.rolledBackAt))).slice(0, limit).map((item) => item.data);
}

export function getEvoTrainRun({ rootDir = process.cwd(), runId } = {}) {
  if (!runId) return null;
  const paths = getEvoLlmOrchestratorPaths({ rootDir });
  return readJsonSafe(path.join(paths.runs, `${runId}.json`), null);
}
