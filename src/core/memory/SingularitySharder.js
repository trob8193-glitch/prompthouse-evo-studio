import { Log } from '../autonomy/SingularityLogger.js';

/**
 * PH EVO STUDIO — SINGULARITY SHARDER (V4 RESTORED)
 * ═══════════════════════════════════════════════════════════════
 * Handles the physical distribution of logic into state-shards.
 * Prevents file-size bloat by splitting massive knowledge blocks.
 */

export class SingularitySharder {
  constructor() {
    this.shard_directory = '.singularity-shards';
  }

  _chunkData(data, maxSize = 8000) {
    if (typeof data === 'string') {
      const chunks = [];
      for (let i = 0; i < data.length; i += maxSize) {
        chunks.push(data.slice(i, i + maxSize));
      }
      return chunks;
    } else if (Array.isArray(data)) {
      const chunks = [];
      let currentChunk = [];
      let currentSize = 0;
      for (const item of data) {
        const itemStr = JSON.stringify(item);
        if (currentSize + itemStr.length > maxSize && currentChunk.length > 0) {
          chunks.push(currentChunk);
          currentChunk = [];
          currentSize = 0;
        }
        currentChunk.push(item);
        currentSize += itemStr.length;
      }
      if (currentChunk.length > 0) chunks.push(currentChunk);
      return chunks;
    }
    return [data];
  }

  async shard(data, shardKey) {
    Log.info(`💎 [Sharder] Fragmenting logic into shard: ${shardKey}`);
    const path = `${this.shard_directory}/${shardKey}.json`;
    
    // Autonomously chunk massive data structures to prevent payload explosion
    const chunks = this._chunkData(data);
    const totalBytes = JSON.stringify(data).length;
    Log.info(`💎 [Sharder] Fragmented ${totalBytes} bytes into ${chunks.length} discrete segments.`);
    
    try {
      let successCount = 0;
      for (let i = 0; i < chunks.length; i++) {
        const segmentKey = chunks.length === 1 ? shardKey : `${shardKey}_seg${i}`;
        const res = await fetch('http://127.0.0.1:3001/api/memory/shard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ shardKey: segmentKey, data: chunks[i] })
        });
        const result = await res.json();
        
        if (result.success) {
          successCount++;
          // [WIRING] Log event to Rift Grid (Port 3002)
          fetch('http://127.0.0.1:3002/api/rift/sessions/main/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              eventType: 'EVOPULSE_ENVELOPE_BUILT',
              payload: { shardKey: segmentKey, bytes: JSON.stringify(chunks[i]).length, path }
            })
          }).catch((err) => { Log.info(`[Sharder] Rift event skipped: ${err.message}`); }); // Fire and forget
        } else {
          throw new Error(result.error);
        }
      }
      
      return { status: 'SHARDED', bytes: totalBytes, chunks: chunks.length, path };
    } catch (e) {
      Log.error(`💎 [Sharder] Failed to write shard: ${e.message}`);
      return { status: 'FAILED', error: e.message };
    }
  }

  async reconstruct(shardKeys) {
    Log.info(`💎 [Sharder] Reconstructing logic connectome from ${shardKeys.length} shards...`);
    // Reassembles fragmented logic for runtime use
  }

  /**
   * Recalls historical shards based on a semantic query.
   */
  async recall(query) {
    Log.info(`💎 [Sharder] Recalling ancestral memory for: "${query}"`);
    try {
      const res = await fetch('http://127.0.0.1:3001/api/memory/recall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      const result = await res.json();
      return result.shards || [];
    } catch (e) {
      Log.error(`💎 [Sharder] Recall failed: ${e.message}`);
      return [];
    }
  }
}
