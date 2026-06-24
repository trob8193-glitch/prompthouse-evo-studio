import fs from 'fs';
import path from 'path';
import url from 'url';
import { AutonomousUserAgent } from '../AutonomousUserAgent.mjs';
import { OmniOutreachDaemon } from '../outreach/OmniOutreachDaemon.mjs';
import { FinanceDaemon } from '../FinanceDaemon.mjs';
import { MasterAuditDaemon } from '../audit/MasterAuditDaemon.mjs';

const STATE_FILE = () => path.join(process.cwd(), '.prompthouse-data', 'daemons', 'omni_state.json');
const KILL_SWITCH = () => path.join(process.cwd(), '.prompthouse-data', 'evolution', '.evolution-kill-switch');

function ensureDir() {
  const dir = path.dirname(STATE_FILE());
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

/**
 * OMNI ORCHESTRATOR
 * Master coordinator for all daemons. Manages scheduling, enforces
 * the evolution kill switch, and provides unified daemon status.
 */
export class OmniOrchestrator {
  constructor() {
    this.daemons = new Map();
    this.intervalId = null;
    this.heartbeatCount = 0;
  }

  registerDaemon(name, daemon) {
    this.daemons.set(name, daemon);
    console.log(`[OmniOrchestrator] Registered daemon: ${name}`);
  }

  startAll() {
    if (fs.existsSync(KILL_SWITCH())) {
      console.log('[OmniOrchestrator] Kill switch engaged. Not starting daemons.');
      return;
    }

    for (const [name, daemon] of this.daemons) {
      try {
        if (typeof daemon.start === 'function') daemon.start();
        console.log(`[OmniOrchestrator] Started: ${name}`);
      } catch (err) {
        console.error(`[OmniOrchestrator] Failed to start ${name}:`, err.message);
      }
    }

    // Heartbeat monitor
    this.intervalId = setInterval(() => this.heartbeat(), 30000);
    this.saveState();
  }

  stopAll() {
    for (const [name, daemon] of this.daemons) {
      try {
        if (typeof daemon.stop === 'function') daemon.stop();
      } catch {}
    }
    if (this.intervalId) { clearInterval(this.intervalId); this.intervalId = null; }
    this.saveState();
    console.log('[OmniOrchestrator] All daemons stopped.');
  }

  heartbeat() {
    if (fs.existsSync(KILL_SWITCH())) {
      console.log('[OmniOrchestrator] Kill switch detected during heartbeat. Stopping all.');
      this.stopAll();
      return;
    }

    this.heartbeatCount++;
    const statuses = {};
    for (const [name, daemon] of this.daemons) {
      try {
        statuses[name] = typeof daemon.getStatus === 'function' ? daemon.getStatus() : { active: true };
      } catch {
        statuses[name] = { active: false, error: 'Status check failed' };
      }
    }

    this.saveState(statuses);

    // Broadcast to MegaTether
    import('../../tethers/MegaTetherCore.js').then(({ getMegaTether }) => {
      try {
        const tether = getMegaTether();
        if (tether) tether.broadcast('omni_orchestrator', 'daemon_heartbeat', { statuses, heartbeat: this.heartbeatCount });
      } catch {}
    }).catch(() => { return; });
  }

  saveState(statuses = null) {
    ensureDir();
    const state = {
      active: this.intervalId !== null,
      daemonCount: this.daemons.size,
      daemons: Array.from(this.daemons.keys()),
      heartbeatCount: this.heartbeatCount,
      killSwitchEngaged: fs.existsSync(KILL_SWITCH()),
      statuses: statuses || {},
      updatedAt: new Date().toISOString()
    };
    fs.writeFileSync(STATE_FILE(), JSON.stringify(state, null, 2), 'utf8');
  }

  getStatus() {
    if (fs.existsSync(STATE_FILE())) {
      try { return JSON.parse(fs.readFileSync(STATE_FILE(), 'utf8')); } catch {}
    }
    return { active: false, daemonCount: 0 };
  }
}

let globalOrchestrator = null;

export function getOmniOrchestrator() {
  if (!globalOrchestrator) {
    globalOrchestrator = new OmniOrchestrator();
    
    globalOrchestrator.registerDaemon('AutonomousUser', {
      start: () => {
        const bot = new AutonomousUserAgent();
        bot.startSession().catch(() => {});
      },
      stop: () => {},
      getStatus: () => ({ active: true })
    });

    globalOrchestrator.registerDaemon('OmniOutreachDaemon', {
      start: () => {
        const marketer = new OmniOutreachDaemon();
        marketer.runGlobalCampaign().catch(() => {});
      },
      stop: () => {},
      getStatus: () => ({ active: true })
    });

    globalOrchestrator.registerDaemon('FinanceDaemon', {
      start: () => {
        const finance = new FinanceDaemon();
        finance.runFinancialAudit();
      },
      stop: () => {},
      getStatus: () => ({ active: true })
    });

    globalOrchestrator.registerDaemon('MasterAudit', {
      start: () => {
        const auditor = new MasterAuditDaemon();
        auditor.start().catch(() => {});
      },
      stop: () => {},
      getStatus: () => ({ active: true })
    });
  }
  return globalOrchestrator;
}

export function run() {
  const orchestrator = getOmniOrchestrator();
  orchestrator.startAll();
  return orchestrator;
}

if (process.argv[1] === url.fileURLToPath(import.meta.url)) run();