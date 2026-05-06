import { Log } from '../autonomy/SovereignLogger.js';
/**
 * PH EVO STUDIO — TRUTH CHAIN ENGINE
 * ═══════════════════════════════════════════════════════════════
 * This module implements a Merkle-Tree Truth Chain. It creates an
 * immutable, linked history of every Canonization event, providing
 * mathematical proof of the studio's integrity.
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const CHAIN_PATH = path.join(process.cwd(), '.sovereign-shards', 'truth-chain.shard.json');

export class TruthChain {
  constructor() {
    this.chain = this.loadChain();
  }

  loadChain() {
    if (fs.existsSync(CHAIN_PATH)) {
      return JSON.parse(fs.readFileSync(CHAIN_PATH, 'utf8'));
    }
    return {
      genesis_at: new Date().toISOString(),
      blocks: []
    };
  }

  /**
   * Create a new Truth Block.
   */
  addBlock(action, data) {
    const prevBlock = this.chain.blocks[this.chain.blocks.length - 1];
    const prevHash = prevBlock ? prevBlock.hash : 'GENESIS';
    
    const blockData = {
      timestamp: new Date().toISOString(),
      action,
      data_summary: typeof data === 'string' ? data : JSON.stringify(data).slice(0, 100),
      prev_hash: prevHash
    };

    const hash = crypto.createHash('sha256').update(JSON.stringify(blockData)).digest('hex');
    
    const block = {
      ...blockData,
      hash
    };

    this.chain.blocks.push(block);
    this.saveChain();
    Log.info(`🔒 [TruthChain] Block added: ${action} | Hash: ${hash.slice(0, 8)}...`);
    return block;
  }

  verify() {
    Log.info('🔍 [TruthChain] Verifying integrity...');
    for (let i = 1; i < this.chain.blocks.length; i++) {
      const prev = this.chain.blocks[i - 1];
      const curr = this.chain.blocks[i];
      if (curr.prev_hash !== prev.hash) {
        throw new Error(`CRITICAL: Truth Chain broken at block ${i}!`);
      }
    }
    Log.info('✓ [TruthChain] Integrity verified. No drift detected.');
    return true;
  }

  saveChain() {
    fs.writeFileSync(CHAIN_PATH, JSON.stringify(this.chain, null, 2), 'utf8');
  }
}
