#!/usr/env/bin node
import { fileURLToPath } from 'url';
import path from 'path';
import { hardenProcess, createDaemonHeartbeat } from './daemon-hardener.mjs';
import { QuadBrainEvolutionDaemon } from '../src/core/daemons/QuadBrainEvolutionDaemon.js';
import { BlendedEvolutionEngine } from '../src/core/engines/BlendedEvolutionEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const daemon = new QuadBrainEvolutionDaemon(rootDir);

// Expose legacy runEvolution for any other scripts importing it
export async function runEvolution() {
  return await daemon.runOnce();
}

export function resolveCssTargetFile(targetFile) {
  const engine = new BlendedEvolutionEngine(rootDir);
  return engine.resolveCssTargetFile(targetFile);
}

const args = process.argv.slice(2);

// If executed directly
if (process.argv[1] && process.argv[1].endsWith('evolution-daemon.mjs')) {
  if (args.includes('--start')) {
    hardenProcess('evolution-daemon');
    createDaemonHeartbeat('evolution-daemon', 60000);
    daemon.start();
    // Keep process alive
    setInterval(() => {}, 1000000);
  } else {
    daemon.runOnce().then(() => {
      // Exit naturally after one cycle
    });
  }
}
