import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

/**
 * SHADOW CACHE LEDGER
 * ═══════════════════════════════════════════════════════════════
 * Hashes incoming prompts and intercepts identical requests by 
 * returning previously generated, perfect solutions. Cost = $0.
 */
export class ShadowCache {
  constructor() {
    this.cacheDir = path.join(process.cwd(), '.sovereign-cache');
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  generateHash(prompt, context) {
    // We hash the prompt and the context to ensure the state hasn't changed.
    const raw = `${prompt}:::${context}`;
    return crypto.createHash('sha256').update(raw).digest('hex');
  }

  async lookup(hashKey) {
    const cacheFile = path.join(this.cacheDir, `${hashKey}.json`);
    if (fs.existsSync(cacheFile)) {
      try {
        const data = fs.readFileSync(cacheFile, 'utf8');
        const parsed = JSON.parse(data);
        return parsed.response;
      } catch (err) {
        console.error('[SHADOW_CACHE] Failed to read cache file:', err);
        return null;
      }
    }
    return null;
  }

  async store(hashKey, response) {
    if (!response) return;
    const cacheFile = path.join(this.cacheDir, `${hashKey}.json`);
    try {
      const payload = {
        hash: hashKey,
        timestamp: new Date().toISOString(),
        response: response
      };
      fs.writeFileSync(cacheFile, JSON.stringify(payload, null, 2), 'utf8');
    } catch (err) {
      console.error('[SHADOW_CACHE] Failed to write cache file:', err);
    }
  }
}
