import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import zlib from 'zlib';

const MAX_RAM_CACHE_ENTRIES = 1000;

// Migrate to .gz extension
const legacyCacheFile = (rootDir = process.cwd()) => path.join(rootDir, '.prompthouse-data', 'cost-firewall', 'semantic_cache.json');
const cacheFile = (rootDir = process.cwd()) => path.join(rootDir, '.prompthouse-data', 'cost-firewall', 'semantic_cache.json.gz');

function hashPayload(payload = {}) {
  return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

function readCache(rootDir = process.cwd()) {
  const file = cacheFile(rootDir);
  const legacyFile = legacyCacheFile(rootDir);

  // If compressed cache doesn't exist but legacy does, migrate !it
  if (!fs.existsSync(file)) {
    if (fs.existsSync(legacyFile)) {
      try {
        const raw = fs.readFileSync(legacyFile, 'utf8');
        const parsed = JSON.parse(raw);
        writeCache(parsed, rootDir); // Write as compressed immediately
        fs.unlinkSync(legacyFile); // Remove bloated file
        return enforceLRU(parsed);
      } catch {
        return {};
      }
    }
    return {};
  }

  try { 
    const zippedData = fs.readFileSync(file);
    const raw = zlib.gunzipSync(zippedData).toString('utf8');
    return enforceLRU(JSON.parse(raw)); 
  } catch { 
    return {}; 
  }
}

function enforceLRU(cache) {
  const keys = Object.keys(cache);
  if (keys.length <= MAX_RAM_CACHE_ENTRIES) return cache;
  
  // Sort by lastHitAt (or createdAt) ascending so oldest/least used is at index 0
  keys.sort((a, b) => {
    const timeA = new Date(cache[a].lastHitAt || cache[a].createdAt).getTime();
    const timeB = new Date(cache[b].lastHitAt || cache[b].createdAt).getTime();
    return timeA - timeB;
  });

  const numToRemove = keys.length - MAX_RAM_CACHE_ENTRIES;
  for (let i = 0; i < numToRemove; i++) {
    delete cache[keys[i]];
  }
  return cache;
}

function writeCache(cache, rootDir = process.cwd()) {
  cache = enforceLRU(cache);
  const file = cacheFile(rootDir);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const raw = JSON.stringify(cache, null, 2);
  const zippedData = zlib.gzipSync(raw);
  fs.writeFileSync(file, zippedData);
  return cache;
}

export function getSemanticCacheKey({ endpoint = '', taskType = '', messages = [], normalizedInput = '' } = {}) {
  return hashPayload({ endpoint, taskType, messages, normalizedInput });
}

export function getSemanticCacheEntry({ rootDir = process.cwd(), key } = {}) {
  const cache = readCache(rootDir);
  const entry = cache[key];
  if (!entry) return null;
  if (entry.expiresAt && new Date(entry.expiresAt).getTime() < Date.now()) {
    delete cache[key];
    writeCache(cache, rootDir);
    return null;
  }
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
    maxRamLimit: MAX_RAM_CACHE_ENTRIES
  };
}
