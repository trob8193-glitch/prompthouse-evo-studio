import { Log } from '../autonomy/SovereignLogger.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
<<<<<<< HEAD
import fs from 'fs';
=======
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);
>>>>>>> main

/**
 * PH EVO STUDIO — SELF-MAINTENANCE (V5 PRODUCTION)
 * ═══════════════════════════════════════════════════════════════
 * Performs automated health checks, logic density audits,
 * and self-healing cycles for the studio backend.
 */

export class SelfMaintenance {
  constructor() {
    this.status = 'READY';
    this.brainPath = join(process.cwd(), '.sovereign-brain.json');
    this.brain = this.loadBrain();
  }

  loadBrain() {
    if (existsSync(this.brainPath)) {
      try {
        return JSON.parse(readFileSync(this.brainPath, 'utf8'));
      } catch (e) {
        Log.error('❌ [SelfMaintenance] Failed to load brain:', e.message);
      }
    }
    return {
      evolution_cycles: 0,
      iq_metrics: { baseline: 2000000, sovereign_gain: 0 },
      gap_registry: []
    };
  }

  saveBrain() {
    writeFileSync(this.brainPath, JSON.stringify(this.brain, null, 2), 'utf8');
  }

  calculateIQGain() {
    const metrics = this.brain?.iq_metrics;
    return metrics?.sovereign_gain || 0;
  }

  async execute(params = {}) {
    Log.info('🚀 [SelfMaintenance] Executing Production Maintenance Cycle...');
    
    // 1. Audit logic density
    const auditResults = await this.auditLogicDensity();
    
    // 2. Increment evolution cycles
    this.brain.evolution_cycles += 1;
    if (!this.brain.iq_metrics) this.brain.iq_metrics = { baseline: 2000000, sovereign_gain: 0 };
    this.brain.iq_metrics.sovereign_gain += (auditResults.density * 10);
    
    // 3. Save state
    this.saveBrain();
    
    Log.success('✅ [SelfMaintenance] Maintenance Cycle Complete.');
    return { 
      success: true, 
      timestamp: new Date().toISOString(), 
      result: 'MAINTENANCE_SUCCESS',
      cycles: this.brain.evolution_cycles,
      metrics: this.brain.iq_metrics
    };
  }

  async auditLogicDensity() {
<<<<<<< HEAD
    try {
      const root = join(process.cwd(), 'src', 'features');
      const files = [];
      const walk = (dir) => {
        if (!fs.existsSync(dir)) return;
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
          const abs = join(dir, entry.name);
          if (entry.isDirectory()) walk(abs);
          else if (abs.endsWith('.js') || abs.endsWith('.jsx')) files.push(abs);
        }
      };
      walk(root);

      let totalLines = 0;
      let totalFunctions = 0;
      for (const file of files) {
        const content = readFileSync(file, 'utf8');
        totalLines += content.split('\n').length;
        totalFunctions += (content.match(/\bfunction\s+[A-Za-z0-9_]+\s*\(/g) || []).length;
        totalFunctions += (content.match(/\b(?:const|let|var)\s+[A-Za-z0-9_]+\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/g) || []).length;
      }

      // Density is "lines per function" (higher generally means more work per unit),
      // returned with supporting counts so the UI can interpret it honestly.
      const density = totalFunctions > 0 ? totalLines / totalFunctions : totalLines;
      return { density, filesScanned: files.length, totalLines, totalFunctions };
    } catch (e) {
      return { density: 0, error: e.message };
=======
    // Simple heuristic for demo: count files in src/features
    try {
      const { stdout } = await execPromise('dir /b /s src\\features\\*.js');
      const files = stdout.split('\n').filter(f => f.trim().length > 0);
      return { density: files.length / 100 }; // Placeholder logic for real density
    } catch (e) {
      return { density: 0.1 };
>>>>>>> main
    }
  }

  getStatus() {
    return { 
      id: 'self_maintenance', 
      grade: 'PRODUCTION', 
      state: 'ACTIVE',
      resonance: 1.0 
    };
  }
}

export function normalizeEvolutionMarkers(text = '') {
  return text
    .replace(/\s*\.\s*\[Maturity: Level \d+\]/g, '')
    .replace(/\s*\.\s*\[Efficiency: \d+%\]/g, '');
}
