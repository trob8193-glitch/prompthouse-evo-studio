import { Log } from './SovereignLogger.js';
import { PerfectionGate } from './PerfectionGate.js';
import { SelfForge } from './SelfForge.js';
import { MissionQueue } from '../automation/MissionQueue.js';

/**
 * PH EVO STUDIO — EVO EVOLUTION ENGINEER (SOVEREIGN GRADE)
 * ═══════════════════════════════════════════════════════════════
 * The autonomous architect for the Singularity Engine.
 * Manages the evolution of core logic, architectural patterns,
 * and autonomous daemon orchestration.
 * MONKEY_PRIME (id: 1) is the primary sentient for this protocol.
 */

export class EvoEvolutionEngineer {
  constructor() {
    this.gate = new PerfectionGate();
    this.forge = new SelfForge();
    this.missionQueue = new MissionQueue();
    this.specialty = 'Structural Evolution & Architecture'; // Maps to MONKEY_PRIME
  }

  /**
   * Performs an autonomous evolution cycle.
   * Identifies architectural weaknesses and forges new structural logic.
   */
  async evolveArchitecture() {
    Log.info('🏗️ [EvoEngineer] Initiating Autonomous Evolution Cycle...');
    
    // 1. Audit core architecture for structural drift or weak patterns
    const report = await this.gate.runPerfectionAudit('src/core');
    const structuralIssues = report.filter(r => r.severity === 'CRITICAL' || r.type === 'ARCHITECTURAL_DRIFT');

    if (structuralIssues.length === 0) {
      Log.success('🏗️ [EvoEngineer] Architecture is structurally sound. Monitoring for drift...');
      return { success: true, changes: 0 };
    }

    Log.info(`🏗️ [EvoEngineer] Identified ${structuralIssues.length} structural gaps. Planning evolution...`);

    // 2. Queue evolution missions
    for (const gap of structuralIssues) {
      this.missionQueue.enqueue(
        `Evolve structural logic for ${gap.file}: Resolve ${gap.violation}`,
        gap.severity === 'CRITICAL' ? 5 : 3,
        this.specialty
      );
    }

    // 3. Execute forge for immediate remediation of critical structural gaps
    for (const gap of structuralIssues.filter(g => g.severity === 'CRITICAL')) {
      await this.forge.forge(gap);
    }

    Log.success('🏗️ [EvoEngineer] Evolution Cycle Complete.');
    return { success: true, changes: structuralIssues.length };
  }

  /**
   * Maintenance heartbeat for the evolution engineer.
   */
  async maintenanceTick() {
    await this.evolveArchitecture();
  }
}

export const EVO_ENGINEER = new EvoEvolutionEngineer();
