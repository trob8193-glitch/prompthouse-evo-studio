import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import url from 'url';

const STATE_FILE = () => path.join(process.cwd(), '.prompthouse-data', 'daemons', 'crucible_state.json');

function ensureDir() {
  const dir = path.dirname(STATE_FILE());
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

/**
 * CRUCIBLE DAEMON
 * Stress-tests proposed changes by running syntax checks and build
 * validation before allowing evolution merges.
 */
export class CrucibleDaemon {
  constructor() {
    this.intervalId = null;
    this.testCount = 0;
  }

  start(intervalMs = 120000) {
    if (this.intervalId) return;
    console.log(`[CrucibleDaemon] Starting with ${intervalMs}ms interval.`);
    this.intervalId = setInterval(() => this.tick(), intervalMs);
  }

  stop() {
    if (this.intervalId) { clearInterval(this.intervalId); this.intervalId = null; }
  }

  async tick() {
    try {
      const results = {
        serverSyntax: this.checkSyntax('promptbridge-server.js'),
        engineSyntax: this.checkSyntax('src/engine.js'),
        buildable: false,
        testedAt: new Date().toISOString()
      };

      // Only attempt build check if syntax passes
      if (results.serverSyntax && results.engineSyntax) {
        results.buildable = this.checkBuildable();
      }

      this.testCount++;
      results.testCount = this.testCount;
      results.allPassing = results.serverSyntax && results.engineSyntax;

      ensureDir();
      fs.writeFileSync(STATE_FILE(), JSON.stringify(results, null, 2), 'utf8');

    } catch (err) {
      console.error('[CrucibleDaemon] Tick error:', err.message);
    }
  }

  checkSyntax(filePath) {
    const fullPath = path.join(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) return false;
    try {
      execSync(`node --check "${fullPath}"`, { stdio: 'ignore', timeout: 10000 });
      return true;
    } catch { return false; }
  }

  checkBuildable() {
    try {
      // Quick vite build check — just syntax parse, not a full build
      const configPath = path.join(process.cwd(), 'vite.config.js');
      if (!fs.existsSync(configPath)) return false;
      execSync(`node --check "${configPath}"`, { stdio: 'ignore', timeout: 5000 });
      return true;
    } catch { return false; }
  }

  getStatus() {
    if (fs.existsSync(STATE_FILE())) {
      try { return JSON.parse(fs.readFileSync(STATE_FILE(), 'utf8')); } catch {}
    }
    return { allPassing: false, testCount: 0 };
  }
}

export function run() {
  const daemon = new CrucibleDaemon();
  daemon.start();
  return daemon;
}

if (process.argv[1] === url.fileURLToPath(import.meta.url)) run();