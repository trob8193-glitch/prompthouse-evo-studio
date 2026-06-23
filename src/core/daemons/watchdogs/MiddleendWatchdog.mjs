import fs from 'fs';
import path from 'path';
import url from 'url';

const STATE_FILE = () => path.join(process.cwd(), '.prompthouse-data', 'daemons', 'watchdog_middle.json');

/**
 * MIDDLE-END WATCHDOG — Monitors evolution engines, AI adaptors, and training pipeline.
 */
export class MiddleendWatchdog {
  constructor() { this.intervalId = null; }

  start(intervalMs = 30000) {
    if (this.intervalId) return;
    this.intervalId = setInterval(() => this.tick(), intervalMs);
    this.tick();
  }

  stop() { if (this.intervalId) { clearInterval(this.intervalId); this.intervalId = null; } }

  tick() {
    try {
      const checks = {
        evolutionEngine: fs.existsSync(path.join(process.cwd(), 'src', 'core', 'evolution', 'index.js')),
        aiAdaptor: fs.existsSync(path.join(process.cwd(), 'lib', 'ai', 'UniversalAIAdaptor.js')),
        shadowForge: fs.existsSync(path.join(process.cwd(), 'src', 'core', 'autonomy', 'ShadowForge.js')),
        trainingPipeline: fs.existsSync(path.join(process.cwd(), 'src', 'core', 'evo-llm')),
        onlineLearning: fs.existsSync(path.join(process.cwd(), 'src', 'core', 'evolution', 'OnlineLearningManager.js'))
      };

      const passing = Object.values(checks).filter(Boolean).length;
      const state = { domain: 'middle', checks, healthy: passing === Object.keys(checks).length, checkedAt: new Date().toISOString() };
      const dir = path.dirname(STATE_FILE());
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(STATE_FILE(), JSON.stringify(state, null, 2), 'utf8');
    } catch {}
  }

  getStatus() {
    if (fs.existsSync(STATE_FILE())) { try { return JSON.parse(fs.readFileSync(STATE_FILE(), 'utf8')); } catch {} }
    return { healthy: false, domain: 'middle' };
  }
}

export function run() { const w = new MiddleendWatchdog(); w.start(); return w; }
if (process.argv[1] === url.fileURLToPath(import.meta.url)) run();