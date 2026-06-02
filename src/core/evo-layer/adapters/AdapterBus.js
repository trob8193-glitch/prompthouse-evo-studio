import fs from 'fs';
import path from 'path';

const DEFAULT_ADAPTERS = [
  'ollama',
  'vscode',
  'cursor',
  'openai',
  'git',
  'filesystem',
  'stripe',
  'vercel'
];

function getBusPath(rootDir) {
  return path.join(rootDir, '.evo-layer', 'adapters');
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export function registerAdapter({ rootDir = process.cwd(), name, status = 'unknown', meta = {} }) {
  if (!name) throw new Error('Adapter name required');

  const dir = getBusPath(rootDir);
  ensureDir(dir);

  const record = {
    id: `adapter_${name}_${Date.now()}`,
    name,
    status,
    meta,
    updatedAt: new Date().toISOString()
  };

  fs.writeFileSync(
    path.join(dir, `${record.id}.json`),
    JSON.stringify(record, null, 2)
  );

  return record;
}

export function listAdapters({ rootDir = process.cwd() } = {}) {
  const dir = getBusPath(rootDir);
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .map(f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
}

export function getAdapterStatus({ rootDir = process.cwd() } = {}) {
  const list = listAdapters({ rootDir });
  const indexed = Object.fromEntries(list.map(a => [a.name, a]));

  return DEFAULT_ADAPTERS.map(name => ({
    name,
    status: indexed[name]?.status || 'missing',
    lastSeen: indexed[name]?.updatedAt || null
  }));
}
