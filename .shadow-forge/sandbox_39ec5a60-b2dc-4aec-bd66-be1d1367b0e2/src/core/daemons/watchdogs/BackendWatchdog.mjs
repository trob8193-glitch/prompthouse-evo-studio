import fs from 'fs';
import path from 'path';
import url from 'url';

const STATE_FILE = () => path.join(process.cwd(), '.prompthouse-data', 'daemons', 'watchdog_backend.json');

/**
 * BACKEND WATCHDOG — Monitors Express server and database health.
 */
export class BackendWatchdog {
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
        bridgeServer: fs.existsSync(path.join(process.cwd(), 'promptbridge-server.js')),
        database: fs.existsSync(path.join(process.cwd(), 'prompthouse.db')),
        envFile: fs.existsSync(path.join(process.cwd(), '.env')),
        serverRoutes: fs.existsSync(path.join(process.cwd(), 'server', 'routes'))
      };

      const passing = Object.values(checks).filter(Boolean).length;
      const state = { domain: 'backend', checks, healthy: passing === Object.keys(checks).length, checkedAt: new Date().toISOString() };
      const dir = path.dirname(STATE_FILE());
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(STATE_FILE(), JSON.stringify(state, null, 2), 'utf8');
    } catch {}
  }

  getStatus() {
    if (fs.existsSync(STATE_FILE())) { try { return JSON.parse(fs.readFileSync(STATE_FILE(), 'utf8')); } catch {} }
    return { healthy: false, domain: 'backend' };
  }
}

export function run() { const w = new BackendWatchdog(); w.start(); return w; }
if (process.argv[1] === url.fileURLToPath(import.meta.url)) run();