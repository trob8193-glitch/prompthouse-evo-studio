import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

import { Log } from '../autonomy/SovereignLogger.js';

/**
 * SHADOW CACHE LEDGER
 * ═══════════════════════════════════════════════════════════════
 * Hashes incoming prompts and intercepts identical requests by 
 * returning previously generated, perfect solutions. Cost = $0.
 * Automatically compressed with zlib.
 */
export class ShadowCache {
  constructor() {
    this.cacheDir = path.join(process.cwd(), '.evo-cache');
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
    const cacheFile = path.join(this.cacheDir, `${hashKey}.json.gz`);
    const legacyCacheFile = path.join(this.cacheDir, `${hashKey}.json`);

    if (fs.existsSync(legacyCacheFile)) {
      try {
        const data = fs.readFileSync(legacyCacheFile, 'utf8');
        const parsed = JSON.parse(data);
        
        // Migrate to zlib format immediately
        this.store(hashKey, parsed.response);
        fs.unlinkSync(legacyCacheFile);
        
        return parsed.response;
      } catch (err) {
        Log.error('[SHADOW_CACHE] Failed to migrate legacy cache file:', err);
        return null;
      }
    }

    if (fs.existsSync(cacheFile)) {
      try {
        const zippedData = fs.readFileSync(cacheFile);
        const data = zlib.gunzipSync(zippedData).toString('utf8');
        const parsed = JSON.parse(data);
        return parsed.response;
      } catch (err) {
        Log.error('[SHADOW_CACHE] Failed to read zlib cache file:', err);
        return null;
      }
    }
    return null;
  }

  async store(hashKey, response) {
    if (!response) return;
    const cacheFile = path.join(this.cacheDir, `${hashKey}.json.gz`);
    try {
      const payload = {
        hash: hashKey,
        timestamp: new Date().toISOString(),
        response: response
      };
      const raw = JSON.stringify(payload, null, 2);
      const zippedData = zlib.gzipSync(raw);
      fs.writeFileSync(cacheFile, zippedData);
    } catch (err) {
      Log.error('[SHADOW_CACHE] Failed to write zlib cache file:', err);
    }
  }
}
