import fs from 'fs';
import path from 'path';
import { ensureEgitDirs } from './EvoGitPaths.js';
import { writeEvoObject } from './EvoGitObjectStore.js';

function readJson(file, fallback) {
  if (!fs.existsSync(file)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

export function registerToolCheck({ rootDir = process.cwd(), toolId, kind = 'generic', capabilities = [], available = false, reason = null, metadata = {} } = {}) {
  if (!toolId) throw new Error('toolId is required.');
  const paths = ensureEgitDirs(rootDir);
  const item = {
    id: `toolcheck_${toolId}_${Date.now()}`,
    toolId,
    kind,
    truthState: available ? 'AVAILABLE' : 'UNAVAILABLE',
    capabilities,
    available: Boolean(available),
    reason,
    metadata,
    createdAt: new Date().toISOString()
  };
  const object = writeEvoObject({ rootDir, type: 'tool_check', payload: item });
  item.objectId = object.objectId;
  fs.writeFileSync(path.join(paths.handshakes, `${item.id}.json`), JSON.stringify(item, null, 2), 'utf8');
  return item;
}

export function listToolChecks({ rootDir = process.cwd(), limit = 100 } = {}) {
  const paths = ensureEgitDirs(rootDir);
  return fs.readdirSync(paths.handshakes)
    .filter(name => name.endsWith('.json'))
    .map(name => readJson(path.join(paths.handshakes, name), null))
    .filter(Boolean)
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
    .slice(0, limit);
}

export function summarizeToolReadiness({ rootDir = process.cwd() } = {}) {
  const latest = new Map();
  for (const item of listToolChecks({ rootDir, limit: 500 })) {
    if (!latest.has(item.toolId)) latest.set(item.toolId, item);
  }
  return Array.from(latest.values()).map(item => ({
    toolId: item.toolId,
    available: item.available,
    capabilities: item.capabilities,
    reason: item.reason,
    receipt: item.id,
    checkedAt: item.createdAt
  }));
}
