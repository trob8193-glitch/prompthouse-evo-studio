#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { Log } from '../src/core/autonomy/SovereignLogger.js';
import { hardenProcess, createDaemonHeartbeat } from './daemon-hardener.mjs';

// Targets for compression sweeping
hardenProcess('memory-compressor-daemon');

const MEMORY_DIRS = [
  path.join(process.cwd(), '.prompthouse-data', 'cost-firewall'),
  path.join(process.cwd(), '.evo-llm', 'training-data'),
  path.join(process.cwd(), '.evo-llm', 'receipts'),
];

const CACHE_DIRS = [
  path.join(process.cwd(), 'node_modules', '.vite'),
  path.join(process.cwd(), 'node_modules', '.cache'),
];

// If file is larger than 20KB, it's eligible for archival
const MIN_SIZE_BYTES = 20 * 1024;
const PRUNE_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

Log.info(`\n🧬 [MEMORY ARCHIVIST] Scanning for bloated legacy memory...`);

let savedBytes = 0;

for (const dir of MEMORY_DIRS) {
  if (!fs.existsSync(dir)) continue;

  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file.endsWith('.json') || file.endsWith('.jsonl')) {
      const fullPath = path.join(dir, file);
      const stats = fs.statSync(fullPath);
      
      if (stats.size > MIN_SIZE_BYTES) {
        Log.info(`🗜️ Compressing massive neural log: ${file} (${Math.round(stats.size/1024)} KB)`);
        
        const rawData = fs.readFileSync(fullPath);
        const zippedData = zlib.gzipSync(rawData);
        
        const targetPath = `${fullPath}.gz`;
        fs.writeFileSync(targetPath, zippedData);
        
        const newStats = fs.statSync(targetPath);
        savedBytes += (stats.size - newStats.size);
        
        // Remove uncompressed original
        fs.unlinkSync(fullPath);
        Log.info(`✅ Archived as ${file}.gz. Saved ${Math.round((stats.size - newStats.size)/1024)} KB.`);
      }
    } else if (file.endsWith('.gz')) {
      const fullPath = path.join(dir, file);
      const stats = fs.statSync(fullPath);
      const ageMs = Date.now() - stats.mtimeMs;
      
      if (ageMs > PRUNE_AGE_MS) {
        fs.unlinkSync(fullPath);
        savedBytes += stats.size;
        Log.info(`🗑️ Pruned ancient memory archive: ${file} (Saved ${Math.round(stats.size/1024)} KB)`);
      }
    }
  }
}

Log.info(`\n🧹 [CACHE SWEEPER] Eradicating bloated development caches...`);
for (const dir of CACHE_DIRS) {
  if (fs.existsSync(dir)) {
    try {
      fs.rmSync(dir, { recursive: true, force: true });
      Log.info(`💥 Obliterated cache directory: ${path.basename(dir)}`);
    } catch (e) {
      Log.error(`⚠️ Failed to obliterate ${dir}: ${e.message}`);
    }
  }
}

Log.info(`\n🚀 [MEMORY ARCHIVIST COMPLETE]`);
Log.info(`Total disk space reclaimed: ${Math.round(savedBytes / 1024 / 1024)} MB`);
