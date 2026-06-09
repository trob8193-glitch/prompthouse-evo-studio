import fs from 'fs';
import path from 'path';

function dir(rootDir) {
  return path.join(rootDir, '.evo-layer', 'memory');
}

function ensure(dirPath) {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

export function writeMemory({ rootDir = process.cwd(), type = 'general', data = {} } = {}) {
  const base = dir(rootDir);
  ensure(base);

  const record = {
    id: `mem_${Date.now()}`,
    type,
    data,
    createdAt: new Date().toISOString()
  };

  fs.writeFileSync(path.join(base, `${record.id}.json`), JSON.stringify(record, null, 2));
  return record;
}

export function readMemory({ rootDir = process.cwd() } = {}) {
  const base = dir(rootDir);
  if (!fs.existsSync(base)) return [];

  return fs.readdirSync(base)
    .filter(f => f.endsWith('.json'))
    .map(f => JSON.parse(fs.readFileSync(path.join(base, f), 'utf8')));
}

export function getMemoryGraph({ rootDir = process.cwd() } = {}) {
  const mem = readMemory({ rootDir });

  return {
    success: true,
    truthState: 'EVO_LAYER_MEMORY_GRAPH_READY',
    nodes: mem,
    edges: mem.map(m => ({ from: m.id, to: m.type })),
    generatedAt: new Date().toISOString()
  };
}
