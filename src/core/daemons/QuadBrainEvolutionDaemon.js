import fs from 'fs';
import path from 'path';
import { Log } from '../autonomy/SovereignLogger.js';
import { BlendedEvolutionSystem } from '../autonomy/BlendedEvolutionSystem.js';
import { BlendedEvolutionEngine } from '../engines/BlendedEvolutionEngine.js';

export class QuadBrainEvolutionDaemon {
  constructor(rootDir = process.cwd()) {
    this.rootDir = rootDir;
    this.system = new BlendedEvolutionSystem(rootDir);
    this.engine = new BlendedEvolutionEngine(rootDir);
    this.intervalId = null;
    this.isRunning = false;
  }

  async runOnce() {
    if (this.isRunning) return;
    this.isRunning = true;

    Log.info('\n\x1b[35m═══════════════════════════════════════════════════\x1b[0m');
    Log.info('\x1b[35m🧬 BLENDED EVOLUTION DAEMON — AI Autonomous Orchestrator\x1b[0m');
    Log.info('\x1b[35m═══════════════════════════════════════════════════\x1b[0m\n');

    try {
      Log.info('\x1b[36m[EVO] Step 1: Generating blended spatial map...\x1b[0m');
      const spatialData = await this.system.captureEnvironmentState();

      await this.system.broadcastState(spatialData);

      Log.info('\x1b[36m[EVO] Step 2: Sending to Blended Evolution Engine for analysis...\x1b[0m');
      const suggestion = await this.engine.runIntelligenceCycle(spatialData);

      if (!suggestion) {
        Log.info('\x1b[31m❌ No suggestion received. Evolution cycle complete with no changes.\x1b[0m');
        return { evolved: false };
      }

      Log.info(`\x1b[36m[EVO] Step 3: AI suggestion received:\x1b[0m`);
      Log.info(`   Target: ${suggestion.targetFile}`);
      Log.info(`   Change: ${suggestion.description}`);

      let applied = false;
      if (suggestion.cssRule) {
        applied = this.engine.applyCssChange(suggestion);
      } else if ((suggestion.componentChange || suggestion.architectureChange) && suggestion.targetFile) {
        applied = await this.engine.applyPhantomChange(suggestion);
      }

      // Log receipt
      const logDir = path.join(this.rootDir, 'proof_receipts', 'evolution_logs');
      if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
      const receipt = {
        timestamp: new Date().toISOString(),
        suggestion,
        applied,
        spatialMode: spatialData.mode,
      };
      const receiptPath = path.join(logDir, `blended_evo_${Date.now()}.json`);
      fs.writeFileSync(receiptPath, JSON.stringify(receipt, null, 2));

      Log.info(`\n\x1b[32m✅ Blended Evolution cycle complete. Applied: ${applied}\x1b[0m`);
      Log.info(`📋 Receipt: ${path.relative(this.rootDir, receiptPath)}`);

      return { evolved: applied, suggestion };
    } catch (e) {
      Log.error(`\x1b[31m❌ Daemon cycle failed: ${e.message}\x1b[0m`);
    } finally {
      this.isRunning = false;
    }
    return { evolved: false };
  }

  start(intervalMs = 300000) { // Default 5 minutes
    if (this.intervalId) return;
    Log.info('\x1b[32m[Evolution Daemon] Background autonomous loop started.\x1b[0m');
    this.intervalId = setInterval(() => this.runOnce(), intervalMs);
    this.runOnce();
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      Log.info('\x1b[33m[Evolution Daemon] Background autonomous loop stopped.\x1b[0m');
    }
  }
}
