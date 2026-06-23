import fs from 'fs';
import path from 'path';
import url from 'url';

const STATE_FILE = () => path.join(process.cwd(), '.prompthouse-data', 'daemons', 'sentinel_state.json');

function ensureDir() {
  const dir = path.dirname(STATE_FILE());
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

/**
 * PLATFORM SENTINEL DAEMON
 * Continuous platform health monitoring — checks bridge connectivity,
 * API key validity, database integrity, and critical file presence.
 */
export class PlatformSentinelDaemon {
  constructor() {
    this.intervalId = null;
    this.isRunning = false;
    this.alertCount = 0;
  }

  start(intervalMs = 15000) {
    if (this.intervalId) return;
    console.log(`[PlatformSentinel] Starting with ${intervalMs}ms interval.`);
    this.intervalId = setInterval(() => this.tick(), intervalMs);
    this.tick();
  }

  stop() {
    if (this.intervalId) { clearInterval(this.intervalId); this.intervalId = null; }
  }

  async tick() {
    if (this.isRunning) return;
    this.isRunning = true;
    try {
      const alerts = [];

      // Check API keys
      if (!process.env.OPENAI_API_KEY) alerts.push({ level: 'warning', message: 'OPENAI_API_KEY not set' });
      if (!process.env.PH_EVO_MASTER_KEY) alerts.push({ level: 'warning', message: 'PH_EVO_MASTER_KEY not set' });

      // Check database
      const dbPath = path.join(process.cwd(), 'prompthouse.db');
      if (!fs.existsSync(dbPath)) {
        alerts.push({ level: 'critical', message: 'Database file missing' });
      } else {
        const stat = fs.statSync(dbPath);
        if (stat.size < 1000) alerts.push({ level: 'warning', message: 'Database suspiciously small' });
      }

      // Check critical source files
      const criticalFiles = ['promptbridge-server.js', 'src/App.jsx', 'src/engine.js', 'package.json'];
      for (const file of criticalFiles) {
        if (!fs.existsSync(path.join(process.cwd(), file))) {
          alerts.push({ level: 'critical', message: `Critical file missing: ${file}` });
        }
      }

      // Check bridge connectivity
      try {
        const port = process.env.BRIDGE_PORT || '3001';
        const res = await fetch(`http://127.0.0.1:${port}/healthz`, { signal: AbortSignal.timeout(2000) });
        if (!res.ok) alerts.push({ level: 'warning', message: 'Bridge health check returned non-OK' });
      } catch {
        alerts.push({ level: 'info', message: 'Bridge not reachable (may not be running)' });
      }

      this.alertCount = alerts.length;
      const state = {
        healthy: alerts.filter(a => a.level === 'critical').length === 0,
        alerts,
        alertCount: alerts.length,
        criticalCount: alerts.filter(a => a.level === 'critical').length,
        checkedAt: new Date().toISOString()
      };

      ensureDir();
      fs.writeFileSync(STATE_FILE(), JSON.stringify(state, null, 2), 'utf8');

    } catch (err) {
      console.error('[PlatformSentinel] Tick error:', err.message);
    } finally {
      this.isRunning = false;
    }
  }

  getStatus() {
    if (fs.existsSync(STATE_FILE())) {
      try { return JSON.parse(fs.readFileSync(STATE_FILE(), 'utf8')); } catch {}
    }
    return { healthy: false, alertCount: 0 };
  }
}

export function run() {
  const daemon = new PlatformSentinelDaemon();
  daemon.start();
  return daemon;
}

if (process.argv[1] === url.fileURLToPath(import.meta.url)) run();