import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { ensureEgitDirs } from './EvoGitPaths.js';

export function stableStringify(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
}

export function hashObject(value) {
  return crypto.createHash('sha256').update(stableStringify(value)).digest('hex');
}

export function writeEvoObject({ rootDir = process.cwd(), type, payload }) {
  if (!type) throw new Error('Evo Git object type is required.');
  const paths = ensureEgitDirs(rootDir);
  const object = {
    type,
    createdAt: new Date().toISOString(),
    payload
  };
  const hash = hashObject(object);
  const objectId = `egit_${hash}`;
  const file = path.join(paths.objects, `${objectId}.json`);
  fs.writeFileSync(file, JSON.stringify({ id: objectId, ...object }, null, 2), 'utf8');
  return { objectId, hash, file, type };
}

export function readEvoObject({ rootDir = process.cwd(), objectId }) {
  if (!objectId) throw new Error('objectId is required.');
  const paths = ensureEgitDirs(rootDir);
  const file = path.join(paths.objects, `${objectId}.json`);
  if (!fs.existsSync(file)) throw new Error(`Evo Git object not found: ${objectId}`);
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}
