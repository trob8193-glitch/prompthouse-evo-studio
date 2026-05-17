import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const cacheFile = (rootDir = process.cwd()) => path.join(rootDir, '.prompthouse-data', 'cost-firewall', 'semantic_cache.json');

function hashPayload(payload = {}) {
  return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

function readCache(rootDir = process.cwd()) {
  const file = cacheFile(rootDir);
  if (!fs.existsSync(file)) return {};
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return {}; }
}

function writeCache(cache, rootDir = process.cwd()) {
  const file = cacheFile(rootDir);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(cache, null, 2), 'utf8');
  return cache;
}

export function getSemanticCacheKey({ endpoint = '', taskType = '', messages = [], normalizedInput = '' } = {}) {
  return hashPayload({ endpoint, taskType, messages, normalizedInput });
}

export function getSemanticCacheEntry({ rootDir = process.cwd(), key } = {}) {
  const cache = readCache(rootDir);
  const entry = cache[key];
  if (!entry) return null;
  if (entry.expiresAt && new Date(entry.expiresAt).getTime() < Date.now()) return null;
  entry.hits = Number(entry.hits || 0) + 1;
  entry.lastHitAt = new Date().toISOString();
  writeCache(cache, rootDir);
  return entry;
}

export function setSemanticCacheEntry({ rootDir = process.cwd(), key, value, ttlMs = 24 * 60 * 60 * 1000, metadata = {} } = {}) {
  const cache = readCache(rootDir);
  const entry = {
    key,
    value,
    metadata,
    hits: 0,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + ttlMs).toISOString(),
  };
  cache[key] = entry;
  writeCache(cache, rootDir);
  return entry;
}

export function clearSemanticCache(rootDir = process.cwd()) {
  writeCache({}, rootDir);
  return { success: true, clearedAt: new Date().toISOString() };
}

export function getSemanticCacheStats(rootDir = process.cwd()) {
  const cache = readCache(rootDir);
  const entries = Object.values(cache);
  return {
    entries: entries.length,
    totalHits: entries.reduce((sum, item) => sum + Number(item.hits || 0), 0),
    expired: entries.filter(item => item.expiresAt && new Date(item.expiresAt).getTime() < Date.now()).length,
  };
}
