import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Log } from '../autonomy/SovereignLogger.js';
import { SecurityAuditEngine } from '../audit/SecurityAuditEngine.js';
import { PerformanceAuditEngine } from '../audit/PerformanceAuditEngine.js';
import { QualityAuditEngine } from '../audit/QualityAuditEngine.js';
import { ChaosAuditEngine } from '../audit/ChaosAuditEngine.js';

const DATA_DIR = () => path.join(process.cwd(), '.prompthouse-data', 'omni-audit');
const LEDGER_FILE = () => path.join(DATA_DIR(), 'omni_ledger.jsonl');

function ensureDir() {
  const dir = DATA_DIR();
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export class OmniAuditDaemon {
  constructor(rootDir = process.cwd()) {
    this.rootDir = rootDir;
    this.intervalId = null;
    this.isRunning = false;
  }

  start(intervalMs = 3600000) { // Default 1 hour
    if (this.intervalId) return;
    Log.info(`[OmniAudit] Daemon starting with ${intervalMs}ms interval.`);
    this.intervalId = setInterval(() => this.runCycle(), intervalMs);
    // Initial run
    this.runCycle();
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      Log.info('[OmniAudit] Daemon stopped.');
    }
  }

  async runCycle() {
    if (this.isRunning) return;
    this.isRunning = true;
    const cycleId = crypto.randomUUID();
    Log.info(`[OmniAudit] 🛡️ Omni-Audit Cycle ${cycleId} started.`);

    const report = {
      id: cycleId,
      timestamp: new Date().toISOString(),
      security: null,
      performance: null,
      quality: null,
      chaos: null,
      passed: false
    };

    try {
      Log.info('[OmniAudit] Running Security Audit (SAST/DAST/SCA)...');
      report.security = await SecurityAuditEngine.runAudit(this.rootDir);

      Log.info('[OmniAudit] Running Performance Audit (Load/Spike/Soak)...');
      report.performance = await PerformanceAuditEngine.runAudit();

      Log.info('[OmniAudit] Running Quality Audit (Complexity/Coverage)...');
      report.quality = await QualityAuditEngine.runAudit(this.rootDir);

      Log.info('[OmniAudit] Running Chaos Engineering Audit (Resiliency)...');
      report.chaos = await ChaosAuditEngine.runAudit();

      report.passed = report.security.passed && report.performance.passed && report.quality.passed && report.chaos.passed;

      if (report.passed) {
        Log.success(`[OmniAudit] ✅ Cycle ${cycleId} PASSED. All invariants secure.`);
      } else {
        Log.error(`[OmniAudit] ❌ Cycle ${cycleId} FAILED. Sub-system degraded.`);
      }

      ensureDir();
      fs.writeFileSync(LEDGER_FILE(), JSON.stringify(report) + '\n', { flag: 'a', encoding: 'utf8' });

    } catch (e) {
      Log.error(`[OmniAudit] Critical failure during execution: ${e.message}`);
    } finally {
      this.isRunning = false;
    }
  }
}
