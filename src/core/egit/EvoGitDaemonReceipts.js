import fs from 'fs';
import path from 'path';
import { ensureEgitDirs } from './EvoGitPaths.js';
import { writeEvoObject } from './EvoGitObjectStore.js';

export function writeDaemonReceipt({ rootDir = process.cwd(), daemonId, action, truthState = 'OBSERVED', details = {}, claims = [] } = {}) {
  if (!daemonId) throw new Error('daemonId is required.');
  if (!action) throw new Error('action is required.');
  const paths = ensureEgitDirs(rootDir);
  const receipt = {
    id: `daemon_${daemonId}_${Date.now()}`,
    daemonId,
    action,
    truthState,
    details,
    claims,
    createdAt: new Date().toISOString()
  };
  const object = writeEvoObject({ rootDir, type: 'daemon_receipt', payload: receipt });
  receipt.objectId = object.objectId;
  fs.writeFileSync(path.join(paths.daemonReceipts, `${receipt.id}.json`), JSON.stringify(receipt, null, 2), 'utf8');
  return receipt;
}

export function listDaemonReceipts({ rootDir = process.cwd(), limit = 100 } = {}) {
  const paths = ensureEgitDirs(rootDir);
  return fs.readdirSync(paths.daemonReceipts)
    .filter(name => name.endsWith('.json'))
    .map(name => {
      try { return JSON.parse(fs.readFileSync(path.join(paths.daemonReceipts, name), 'utf8')); } catch { return null; }
    })
    .filter(Boolean)
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
    .slice(0, limit);
}
