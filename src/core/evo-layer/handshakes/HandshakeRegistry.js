import fs from 'fs';
import path from 'path';

function dir(rootDir) {
  return path.join(rootDir, '.evo-layer', 'handshakes');
}

function ensure(dirPath) {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

export function registerHandshake({ rootDir = process.cwd(), from, to, protocol = 'default', payload = {} }) {
  if (!from || !to) throw new Error('Handshake requires from + to');

  const base = dir(rootDir);
  ensure(base);

  const record = {
    id: `hs_${from}_${to}_${Date.now()}`,
    from,
    to,
    protocol,
    payload,
    createdAt: new Date().toISOString(),
    status: 'OPEN'
  };

  fs.writeFileSync(path.join(base, `${record.id}.json`), JSON.stringify(record, null, 2));
  return record;
}

export function listHandshakes({ rootDir = process.cwd() } = {}) {
  const base = dir(rootDir);
  if (!fs.existsSync(base)) return [];

  return fs.readdirSync(base)
    .filter(f => f.endsWith('.json'))
    .map(f => JSON.parse(fs.readFileSync(path.join(base, f), 'utf8')));
}

export function closeHandshake({ rootDir = process.cwd(), id }) {
  const base = dir(rootDir);
  const file = path.join(base, `${id}.json`);
  if (!fs.existsSync(file)) return false;

  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  data.status = 'CLOSED';
  data.closedAt = new Date().toISOString();

  fs.writeFileSync(file, JSON.stringify(data, null, 2));
  return data;
}
