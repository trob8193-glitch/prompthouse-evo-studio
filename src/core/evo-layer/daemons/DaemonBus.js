import fs from 'fs';
import path from 'path';

function dir(rootDir) {
  return path.join(rootDir, '.evo-layer', 'daemon-bus');
}

function ensure(dirPath) {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

export function emitDaemonEvent({ rootDir = process.cwd(), daemonId, event, payload = {} }) {
  if (!daemonId || !event) throw new Error('daemonId + event required');

  const base = dir(rootDir);
  ensure(base);

  const record = {
    id: `daemon_${daemonId}_${event}_${Date.now()}`,
    daemonId,
    event,
    payload,
    createdAt: new Date().toISOString()
  };

  fs.writeFileSync(path.join(base, `${record.id}.json`), JSON.stringify(record, null, 2));
  return record;
}

export function listDaemonEvents({ rootDir = process.cwd(), daemonId } = {}) {
  const base = dir(rootDir);
  if (!fs.existsSync(base)) return [];

  return fs.readdirSync(base)
    .filter(f => f.endsWith('.json'))
    .map(f => JSON.parse(fs.readFileSync(path.join(base, f), 'utf8')))
    .filter(e => !daemonId || e.daemonId === daemonId);
}
