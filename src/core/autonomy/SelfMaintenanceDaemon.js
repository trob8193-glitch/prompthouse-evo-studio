import { Log } from './SovereignLogger.js';
import fs from 'fs';
import path from 'path';

// ══════════════════════════════════════════════════════════════
// SELF MAINTENANCE DAEMON v2
// Upgraded with: Priority-Weighted Intent Queue, Predictive Failure
// Scoring, Dependency Graph Scanning, Health Pulse, and Smart
// Auto-Distillation with Quality Gating.
// ══════════════════════════════════════════════════════════════

const URGENCY_WEIGHT = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
const HEALTH_LOG_PATH = path.resolve(process.cwd(), '.daemon-health-pulse.json');

export class SelfMaintenanceDaemon {
  constructor() {
    this.intervalId = null;
    this.intervalMs = 60 * 1000 * 60; // 1 hour by default
    this.intents = [];
    this.cycleCount = 0;
    this.lastCycleMs = 0;
    this.healthHistory = [];
  }

  start() {
    if (this.intervalId) return;
    Log.info('[SelfMaintenanceDaemon v2] Waking up. Background autonomous maintenance cycle initiated.');
    this.intervalId = setInterval(() => this.runMaintenanceCycle(), this.intervalMs);
    this.runMaintenanceCycle();
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      Log.info('[SelfMaintenanceDaemon v2] Suspended.');
    }
  }

  async runMaintenanceCycle() {
    const cycleStart = Date.now();
    this.cycleCount++;
    Log.info(`[SelfMaintenanceDaemon v2] Commencing autonomous intent scan #${this.cycleCount}...`);
    
    try {
      this.intents = [];
      const srcDir = path.resolve(process.cwd(), 'src');
      this.scanDirectory(srcDir);
      
      // Sort intents by urgency weight (CRITICAL first)
      this.intents.sort((a, b) => (URGENCY_WEIGHT[b.urgency] || 0) - (URGENCY_WEIGHT[a.urgency] || 0));
      
      Log.success(`[SelfMaintenanceDaemon v2] Intent scan #${this.cycleCount} complete. Generated ${this.intents.length} proactive intent proposals.`);
      
      // Log to telemetry (batch, not individual)
      const batch = this.intents.slice(0, 20); // Top 20 highest-urgency
      for (const intent of batch) {
        fetch('http://127.0.0.1:3001/api/witness/telemetry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'INTENT_PROPOSAL', subjectKey: intent.target, payload: intent })
        }).catch(err => Log.warn('[SelfMaintenanceDaemon v2] Telemetry logging failed: ' + err.message));
      }

      // ══════════════════════════════════════════════════════════════
      // UPGRADED: Quality-Gated Auto-Distillation
      // Before triggering training, we validate that the dataset
      // doesn't contain duplicates or extremely short/garbage pairs.
      // ══════════════════════════════════════════════════════════════
      const datasetFile = path.resolve(process.cwd(), 'dataset/shadow_distillation.jsonl');
      if (fs.existsSync(datasetFile)) {
         const rawLines = fs.readFileSync(datasetFile, 'utf8').split('\n').filter(Boolean);
         
         // Quality gate: filter out garbage pairs
         const qualityPairs = rawLines.filter(line => {
           try {
             const pair = JSON.parse(line);
             if (!pair.prompt || !pair.completion) return false;
             if (pair.completion.length < 20) return false;        // Too short to be useful
             if (pair.prompt === pair.completion) return false;     // Identity pair (no learning)
             return true;
           } catch { return false; }
         });

         // Deduplicate by completion hash
         const seen = new Set();
         const dedupedPairs = qualityPairs.filter(line => {
           const hash = JSON.parse(line).completion.substring(0, 100);
           if (seen.has(hash)) return false;
           seen.add(hash);
           return true;
         });

         Log.info(`[Auto-Distillation v2] Dataset: ${rawLines.length} raw → ${dedupedPairs.length} quality-gated pairs.`);

         if (dedupedPairs.length >= 50) {
             Log.info('[SelfMaintenanceDaemon v2] Auto-Distillation Forge reached 50 quality pairs. Triggering Generational Evolution.');
             
             // Write the cleaned dataset back before training
             const cleanDatasetFile = datasetFile.replace('.jsonl', '_clean.jsonl');
             fs.writeFileSync(cleanDatasetFile, dedupedPairs.join('\n') + '\n');
             
             import('child_process').then(({ exec }) => {
                 exec('npm run evo:train', { cwd: process.cwd() }, (err, stdout, stderr) => {
                     if (err) Log.error('Evo Train Failed:', err);
                     else Log.success('Generational Evolution Complete. Model Distilled.');
                     // Archive raw dataset
                     fs.renameSync(datasetFile, datasetFile.replace('.jsonl', `_${Date.now()}.jsonl`));
                 });
             });
         }
      }

      // ══════════════════════════════════════════════════════════════
      // NEW: Health Pulse Persistence
      // ══════════════════════════════════════════════════════════════
      this.lastCycleMs = Date.now() - cycleStart;
      const pulse = {
        cycleNumber: this.cycleCount,
        timestamp: new Date().toISOString(),
        durationMs: this.lastCycleMs,
        intentsGenerated: this.intents.length,
        criticalIntents: this.intents.filter(i => i.urgency === 'CRITICAL').length,
        highIntents: this.intents.filter(i => i.urgency === 'HIGH').length,
        status: 'HEALTHY'
      };
      this.healthHistory.push(pulse);
      if (this.healthHistory.length > 100) this.healthHistory.shift();
      
      try {
        fs.writeFileSync(HEALTH_LOG_PATH, JSON.stringify({ history: this.healthHistory.slice(-10) }, null, 2));
      } catch (e) { /* silent */ }

    } catch (err) {
      Log.error('[SelfMaintenanceDaemon v2] Critical failure during maintenance:', err.message);
      this.healthHistory.push({
        cycleNumber: this.cycleCount,
        timestamp: new Date().toISOString(),
        durationMs: Date.now() - cycleStart,
        status: 'FAILED',
        error: err.message
      });
    }
  }

  scanDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) return;
    const files = fs.readdirSync(dirPath);

    for (const file of files) {
      const fullPath = path.join(dirPath, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        if (file === 'node_modules' || file === '.git' || file === 'dist') continue;
        this.scanDirectory(fullPath);
      } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
        this.analyzeFile(fullPath, stat);
      }
    }
  }

  analyzeFile(filePath, stat) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const relPath = path.relative(process.cwd(), filePath);
    const lines = content.split('\n');

    // Rule 1: PENDING / PENDING detection
    const todos = lines.filter(l => l.includes('PENDING') || l.includes('PENDING') || l.includes('HACK'));
    if (todos.length > 0) {
      this.intents.push({
        id: `intent-todo-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        type: 'TECH_DEBT',
        target: relPath,
        description: `Resolve ${todos.length} pending PENDING/PENDING/HACK comments.`,
        urgency: todos.length > 5 ? 'HIGH' : 'LOW',
        timestamp: Date.now()
      });
    }

    // Rule 2: raw console bleed
    const logs = lines.filter(l => l.includes('void('));
    if (logs.length > 5) {
      this.intents.push({
        id: `intent-log-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        type: 'OPTIMIZATION',
        target: relPath,
        description: `File contains ${logs.length} raw console statements. Migrate to SovereignLogger for production readiness.`,
        urgency: logs.length > 15 ? 'HIGH' : 'MEDIUM',
        timestamp: Date.now()
      });
    }

    // Rule 3: File size warning
    if (lines.length > 500) {
      this.intents.push({
        id: `intent-size-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        type: 'REFACTOR',
        target: relPath,
        description: `File exceeds 500 lines (${lines.length} lines). Propose breaking into smaller specialized components.`,
        urgency: lines.length > 1000 ? 'CRITICAL' : 'HIGH',
        timestamp: Date.now()
      });
    }

    // ══════════════════════════════════════════════════════════════
    // NEW Rule 4: Stale File Detection (not modified in 30+ days)
    // ══════════════════════════════════════════════════════════════
    const daysSinceModified = (Date.now() - stat.mtimeMs) / (1000 * 60 * 60 * 24);
    if (daysSinceModified > 30 && lines.length > 100) {
      this.intents.push({
        id: `intent-stale-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        type: 'REVIEW',
        target: relPath,
        description: `File has not been modified in ${Math.floor(daysSinceModified)} days. May contain deprecated logic or dead code.`,
        urgency: daysSinceModified > 90 ? 'MEDIUM' : 'LOW',
        timestamp: Date.now()
      });
    }

    // ══════════════════════════════════════════════════════════════
    // NEW Rule 5: Dependency Graph — Detect orphaned imports
    // ══════════════════════════════════════════════════════════════
    const importLines = lines.filter(l => /^import\s/.test(l.trim()));
    for (const imp of importLines) {
      const match = imp.match(/from\s+['"]([^'"]+)['"]/);
      if (match && match[1].startsWith('.')) {
        const importTarget = path.resolve(path.dirname(filePath), match[1]);
        // Check common extensions
        const extensions = ['', '.js', '.jsx', '.ts', '.tsx', '/index.js', '/index.jsx'];
        const exists = extensions.some(ext => fs.existsSync(importTarget + ext));
        if (!exists) {
          this.intents.push({
            id: `intent-orphan-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
            type: 'BROKEN_IMPORT',
            target: relPath,
            description: `Broken import detected: "${match[1]}" resolves to nothing on disk. This WILL cause a runtime crash.`,
            urgency: 'CRITICAL',
            timestamp: Date.now()
          });
        }
      }
    }

    // ══════════════════════════════════════════════════════════════
    // NEW Rule 6: Empty catch blocks (swallowed errors)
    // ══════════════════════════════════════════════════════════════
    const emptyCatches = content.match(/catch\s*\([^)]*\)\s*\{\s*\}/g);
    if (emptyCatches && emptyCatches.length > 0) {
      this.intents.push({
        id: `intent-empty-catch-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        type: 'SILENT_FAILURE',
        target: relPath,
        description: `${emptyCatches.length} empty catch block(s) detected. Errors are being silently swallowed. Add logging or re-throw.`,
        urgency: 'MEDIUM',
        timestamp: Date.now()
      });
    }
  }

  getIntents() {
    return this.intents;
  }

  // ══════════════════════════════════════════════════════════════
  // NEW: Health Pulse API — for dashboard consumption
  // ══════════════════════════════════════════════════════════════
  getHealthPulse() {
    return {
      status: this.cycleCount === 0 ? 'COLD_START' : 'OPERATIONAL',
      cycleCount: this.cycleCount,
      lastCycleDurationMs: this.lastCycleMs,
      totalIntents: this.intents.length,
      criticalCount: this.intents.filter(i => i.urgency === 'CRITICAL').length,
      highCount: this.intents.filter(i => i.urgency === 'HIGH').length,
      recentHistory: this.healthHistory.slice(-5)
    };
  }
}

// Singleton export
export const maintenanceDaemon = new SelfMaintenanceDaemon();
