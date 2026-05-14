import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Log } from '../autonomy/SovereignLogger.js';
import { TruthChain } from '../truth/TruthChain.js';

/**
 * PH EVO STUDIO — CANON WHISPERER (Physical Edition)
 * ═══════════════════════════════════════════════════════════════
 * This module implements local P2P pattern synchronization.
 * It allows disparate Evo Studios to "whisper" verified truths to 
 * each other over the local network/shared file system.
 * ABSOLUTE REALITY: No filler signatures. Mandatory Truth Audit on Sync.
 */

const SYNC_DIR = path.join(process.cwd(), '.ph_evo_sync');

export class CanonWhisperer {
  constructor() {
    this.chain = new TruthChain();
    this.studioId = `STUDIO_${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    if (!fs.existsSync(SYNC_DIR)) fs.mkdirSync(SYNC_DIR, { recursive: true });
  }

  /**
   * Broadcast a verified pattern to other studios.
   * ABSOLUTE REALITY: Signs the pattern with a physical hash.
   */
  async whisper(pattern) {
    const patternData = JSON.stringify(pattern);
    const signature = crypto.createHash('sha256').update(patternData + this.studioId).digest('hex');
    
    const filePath = path.join(SYNC_DIR, `whisper_${pattern.id}_${this.studioId}.json`);
    const payload = {
      studio_id: this.studioId,
      timestamp: new Date().toISOString(),
      pattern,
      signature,
      reality_state: 'SIGNED_PHYSICAL'
    };

    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2));
    Log.info(`🗣️ [CanonWhisperer] Physical Whisper Manifested: ${pattern.name} [${signature.slice(0, 8)}]`);
  }

  /**
   * Listen for whispers from other studios.
   * ABSOLUTE REALITY: Performs mandatory Truth Audit before internalizing.
   */
  async listen() {
    Log.info('👂 [CanonWhisperer] Listening for Physical Whispers...');
    const files = fs.readdirSync(SYNC_DIR);
    
    for (const file of files) {
      if (file.startsWith('whisper_')) {
        const fullPath = path.join(SYNC_DIR, file);
        try {
          const content = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
          
          // Verify Signature Parity
          const expectedSig = crypto.createHash('sha256').update(JSON.stringify(content.pattern) + content.studio_id).digest('hex');
          if (content.signature !== expectedSig) {
             Log.warn(`⚠️ [CanonWhisperer] REJECTED: Forged or corrupted whisper from ${content.studio_id}`);
             fs.unlinkSync(fullPath);
             continue;
          }

          Log.info(`👂 [CanonWhisperer] Verified whisper from ${content.studio_id}: ${content.pattern.name}`);
          
          // Internalize to Truth Chain
          await this.chain.addBlock(`Verified P2P Sync: ${content.pattern.name}`, {
            source: content.studio_id,
            signature: content.signature,
            pattern: content.pattern
          });

          // Physical Consumption
          fs.unlinkSync(fullPath);
        } catch (err) {
          Log.error(`💥 [CanonWhisperer] Sync Failure: ${err.message}`);
        }
      }
    }
  }
}
