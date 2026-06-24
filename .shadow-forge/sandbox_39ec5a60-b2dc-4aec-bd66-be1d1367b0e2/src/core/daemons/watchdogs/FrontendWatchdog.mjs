import fs from 'fs';
import path from 'path';
import url from 'url';

const STATE_FILE = () => path.join(process.cwd(), '.prompthouse-data', 'daemons', 'watchdog_frontend.json');

/**
 * FRONTEND WATCHDOG — Monitors React/Vite frontend health.
 */
export class FrontendWatchdog {
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
        appJsx: fs.existsSync(path.join(process.cwd(), 'src', 'App.jsx')),
        indexCss: fs.existsSync(path.join(process.cwd(), 'src', 'index.css')),
        viteConfig: fs.existsSync(path.join(process.cwd(), 'vite.config.js')),
        components: fs.existsSync(path.join(process.cwd(), 'src', 'components'))
      };

      const passing = Object.values(checks).filter(Boolean).length;
      const state = { domain: 'frontend', checks, healthy: passing === Object.keys(checks).length, checkedAt: new Date().toISOString() };
      const dir = path.dirname(STATE_FILE());
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(STATE_FILE(), JSON.stringify(state, null, 2), 'utf8');
    } catch {}
  }

  getStatus() {
    if (fs.existsSync(STATE_FILE())) { try { return JSON.parse(fs.readFileSync(STATE_FILE(), 'utf8')); } catch {} }
    return { healthy: false, domain: 'frontend' };
  }
}

export function run() { const w = new FrontendWatchdog(); w.start(); return w; }
if (process.argv[1] === url.fileURLToPath(import.meta.url)) run();