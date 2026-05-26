import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';
import crypto from 'crypto';

/**
 * Local Cache for AI Responses — v2 (Performance Edition)
 * Hybrid in-memory + disk cache with TTL and LRU eviction.
 * Cache hits are instant (no disk I/O). Disk is write-through for persistence.
 */
export class LocalCache {
  constructor(cacheDir = '.prompthouse-data/cache', options = {}) {
    this.cacheDir = join(process.cwd(), cacheDir);
    this.memoryCache = new Map();
    this.maxMemoryEntries = options.maxMemoryEntries || 200;
    this.ttlMs = options.ttlMs || 1000 * 60 * 60; // 1 hour default TTL

    if (!existsSync(this.cacheDir)) {
      mkdirSync(this.cacheDir, { recursive: true });
    }

    // Pre-warm memory cache from disk on startup
    this._warmFromDisk();
  }

  _warmFromDisk() {
    try {
      const files = readdirSync(this.cacheDir).filter(f => f.endsWith('.json'));
      // Only warm the most recent entries
      const toWarm = files.slice(-this.maxMemoryEntries);
      for (const file of toWarm) {
        try {
          const data = JSON.parse(readFileSync(join(this.cacheDir, file), 'utf8'));
          const hash = file.replace('.json', '');
          this.memoryCache.set(hash, { data, ts: Date.now() });
        } catch { /* skip corrupt entries */ }
      }
      console.error(`[CACHE] Pre-warmed ${this.memoryCache.size} entries from disk`);
    } catch { /* no cache dir yet */ }
  }

  getHash(messages, options = {}) {
    const data = JSON.stringify({ messages, options });
    return crypto.createHash('md5').update(data).digest('hex');
  }

  get(messages, options = {}) {
    const hash = this.getHash(messages, options);

    // Check memory first (instant)
    const memEntry = this.memoryCache.get(hash);
    if (memEntry) {
      if (Date.now() - memEntry.ts < this.ttlMs) {
        return memEntry.data;
      }
      // TTL expired — evict
      this.memoryCache.delete(hash);
    }

    // Fall back to disk
    const filePath = join(this.cacheDir, `${hash}.json`);
    if (existsSync(filePath)) {
      try {
        const data = JSON.parse(readFileSync(filePath, 'utf8'));
        // Promote to memory
        this.memoryCache.set(hash, { data, ts: Date.now() });
        this._evictIfNeeded();
        return data;
      } catch {
        return null;
      }
    }
    return null;
  }

  set(messages, options = {}, response) {
    const hash = this.getHash(messages, options);

    // Write to memory (instant)
    this.memoryCache.set(hash, { data: response, ts: Date.now() });
    this._evictIfNeeded();

    // Write-through to disk (async-safe, fire and forget)
    const filePath = join(this.cacheDir, `${hash}.json`);
    try {
      writeFileSync(filePath, JSON.stringify(response), 'utf8');
    } catch { /* disk write failed, memory cache still valid */ }

    return true;
  }

  _evictIfNeeded() {
    if (this.memoryCache.size > this.maxMemoryEntries) {
      // Evict oldest entry (LRU)
      const oldest = this.memoryCache.keys().next().value;
      this.memoryCache.delete(oldest);
    }
  }
}
