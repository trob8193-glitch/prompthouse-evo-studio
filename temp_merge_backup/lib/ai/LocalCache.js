import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import crypto from 'crypto';

/**
 * Local Cache for AI Responses
 * Saves API costs and dev time by returning cached responses.
 */
export class LocalCache {
  constructor(cacheDir = '.prompthouse-data/cache') {
    this.cacheDir = join(process.cwd(), cacheDir);
    if (!existsSync(this.cacheDir)) {
      mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  getHash(messages, options = {}) {
    const data = JSON.stringify({ messages, options });
    return crypto.createHash('md5').update(data).digest('hex');
  }

  get(messages, options = {}) {
    const hash = this.getHash(messages, options);
    const filePath = join(this.cacheDir, `${hash}.json`);
    
    if (existsSync(filePath)) {
      try {
        console.log(`[CACHE] Hit for ${hash}`);
        return JSON.parse(readFileSync(filePath, 'utf8'));
      } catch (e) {
        console.error(`[CACHE] Failed to read ${hash}:`, e.message);
        return null;
      }
    }
    return null;
  }

  set(messages, options = {}, response) {
    const hash = this.getHash(messages, options);
    const filePath = join(this.cacheDir, `${hash}.json`);
    
    try {
      writeFileSync(filePath, JSON.stringify(response, null, 2), 'utf8');
      console.log(`[CACHE] Saved ${hash}`);
      return true;
    } catch (e) {
      console.error(`[CACHE] Failed to save ${hash}:`, e.message);
      return false;
    }
  }
}
