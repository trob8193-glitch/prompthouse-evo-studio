import fs from 'fs';
import path from 'path';
import url from 'url';

const STATE_FILE = () => path.join(process.cwd(), '.prompthouse-data', 'daemons', 'convergence_state.json');

function ensureDir() {
  const dir = path.dirname(STATE_FILE());
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

/**
 * CONVERGENCE DAEMON
 * Periodically checks all subsystem health, computes a convergence score,
 * and broadcasts the result through MegaTether.
 */
export class ConvergenceDaemon {
  constructor() {
    this.intervalId = null;
    this.isRunning = false;
  }

  start(intervalMs = 30000) {
    if (this.intervalId) return;
    console.log(`[ConvergenceDaemon] Starting with ${intervalMs}ms interval.`);
    this.intervalId = setInterval(() => this.tick(), intervalMs);
    this.tick();
  }

  stop() {
    if (this.intervalId) { clearInterval(this.intervalId); this.intervalId = null; }
    console.log('[ConvergenceDaemon] Stopped.');
  }

  async tick() {
    if (this.isRunning) return;
    this.isRunning = true;
    try {
      const checks = {
        bridgeServer: await this.checkBridge(),
        database: this.checkDatabase(),
        evolutionDaemon: this.checkEvolution(),
        fileSystem: this.checkFileSystem()
      };

      const passing = Object.values(checks).filter(Boolean).length;
      const total = Object.keys(checks).length;
      const score = Math.round((passing / total) * 100);

      const state = {
        score,
        checks,
        passing,
        total,
        converged: score >= 75,
        checkedAt: new Date().toISOString()
      };

      ensureDir();
      fs.writeFileSync(STATE_FILE(), JSON.stringify(state, null, 2), 'utf8');

      // Broadcast to MegaTether
      try {
        const { getMegaTether } = await import('../../tethers/MegaTetherCore.js');
        const tether = getMegaTether();
        if (tether) await tether.broadcast('convergence_daemon', 'convergence_check', state);
      } catch {}

    } catch (err) {
      console.error('[ConvergenceDaemon] Tick error:', err.message);
    } finally {
      this.isRunning = false;
    }
  }

  async checkBridge() {
    try {
      const port = process.env.BRIDGE_PORT || '3001';
      const res = await fetch(`http://127.0.0.1:${port}/healthz`, { signal: AbortSignal.timeout(2000) });
      return res.ok;
    } catch { return false; }
  }

  checkDatabase() {
    try {
      const dbPath = path.join(process.cwd(), 'prompthouse.db');
      return fs.existsSync(dbPath);
    } catch { return false; }
  }

  checkEvolution() {
    try {
      const statePath = path.join(process.cwd(), '.prompthouse-data', 'evolution', 'daemon_state.json');
      if (!fs.existsSync(statePath)) return false;
      const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
      return state.active === true || state.cycleCount > 0;
    } catch { return false; }
  }

  checkFileSystem() {
    return fs.existsSync(path.join(process.cwd(), 'src')) && fs.existsSync(path.join(process.cwd(), 'package.json'));
  }

  getStatus() {
    if (fs.existsSync(STATE_FILE())) {
      try { return JSON.parse(fs.readFileSync(STATE_FILE(), 'utf8')); } catch {}
    }
    return { score: 0, converged: false };
  }
}

export function run() {
  const daemon = new ConvergenceDaemon();
  daemon.start();
  return daemon;
}

if (process.argv[1] === url.fileURLToPath(import.meta.url)) run();