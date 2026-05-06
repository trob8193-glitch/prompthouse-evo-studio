import { Log } from '../autonomy/SovereignLogger.js';
/**
 * PH EVO STUDIO — CANON WHISPERER (P2P SYNC)
 * ═══════════════════════════════════════════════════════════════
 * This module implements local P2P pattern synchronization.
 * It allows disparate Evo Studios to "whisper" verified truths to 
 * each other over the local network/shared file system.
 */

import fs from 'fs';
import path from 'path';
import { TruthChain } from '../truth/TruthChain.js';

const SYNC_DIR = path.join(process.cwd(), '.ph_evo_sync');

export class CanonWhisperer {
  constructor() {
    this.chain = new TruthChain();
    if (!fs.existsSync(SYNC_DIR)) fs.mkdirSync(SYNC_DIR);
  }

  /**
   * Broadcast a verified pattern to other studios.
   */
  whisper(pattern) {
    const filePath = path.join(SYNC_DIR, `whisper_${pattern.id}.json`);
    const payload = {
      studio_id: 'LOCAL_MASTER',
      timestamp: new Date().toISOString(),
      pattern,
      signature: `SIG_${Math.random().toString(36).slice(2, 10)}`
    };
    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2));
    Log.info(`🗣️ [CanonWhisperer] Whispering pattern: ${pattern.name}`);
  }

  /**
   * Listen for whispers from other studios.
   */
  listen() {
    Log.info('👂 [CanonWhisperer] Listening for local whispers...');
    const whispers = fs.readdirSync(SYNC_DIR);
    whispers.forEach(file => {
      if (file.startsWith('whisper_')) {
        const content = JSON.parse(fs.readFileSync(path.join(SYNC_DIR, file), 'utf8'));
        Log.info(`👂 [CanonWhisperer] Received whisper from ${content.studio_id}: ${content.pattern.name}`);
        // Internalize if the signature is valid (mock)
        this.chain.addBlock('Received Sync Success', content.pattern);
        fs.unlinkSync(path.join(SYNC_DIR, file)); // Consume the whisper
      }
    });
  }
}
