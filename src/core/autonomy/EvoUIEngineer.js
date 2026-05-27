import { Log } from './SovereignLogger.js';
import { PerfectionGate } from './PerfectionGate.js';
import { SelfForge } from './SelfForge.js';
import { MissionQueue } from '../automation/MissionQueue.js';

/**
 * PH EVO STUDIO — EVO UI ENGINEER (REACT/VITE/SOVEREIGN)
 * ═══════════════════════════════════════════════════════════════
 * The autonomous frontend engineer for the Evo Studio.
 * Specializes in React components, Vite build optimizations,
 * and high-fidelity sovereign aesthetics.
 * OCTO_UI (id: 4) is the primary sentient for this protocol.
 */

export class EvoUIEngineer {
  constructor() {
    this.gate = new PerfectionGate();
    this.forge = new SelfForge();
    this.missionQueue = new MissionQueue();
    this.specialty = 'React/Vite/Aesthetic Refinement'; // Maps to OCTO_UI
  }

  /**
   * Performs an autonomous UI evolution cycle.
   * Audits components for aesthetic drift, performance leaks, and logic density.
   */
  async evolveUI() {
    Log.info('🎨 [EvoUI] Initiating Autonomous UI Evolution Cycle...');
    
    // 1. Audit frontend organs (features, components, styles)
    const report = await this.gate.runPerfectionAudit('src/features');
    const componentGaps = report.filter(r => 
      r.file.endsWith('.jsx') || 
      r.file.endsWith('.css') || 
      r.type === 'AESTHETIC_DRIFT'
    );

    if (componentGaps.length === 0) {
      Log.success('🎨 [EvoUI] Studio UI is visually and structurally perfect.');
      return { success: true, changes: 0 };
    }

    Log.info(`🎨 [EvoUI] Identified ${componentGaps.length} UI/React gaps. Manifesting fixes...`);

    // 2. Queue UI missions
    for (const gap of componentGaps) {
      this.missionQueue.enqueue(
        `Optimize React component ${gap.file}: Resolve ${gap.violation}`,
        gap.severity === 'CRITICAL' ? 4 : 2,
        this.specialty
      );
    }

    // 3. Physical Forge for critical UI logic
    for (const gap of componentGaps.filter(g => g.severity === 'CRITICAL')) {
      await this.forge.forge(gap);
    }

    Log.success('🎨 [EvoUI] UI Evolution Cycle Complete.');
    return { success: true, changes: componentGaps.length };
  }

  /**
   * Maintenance heartbeat for the UI engineer.
   */
  async maintenanceTick() {
    await this.evolveUI();
  }
}

export const EVO_UI_ENGINEER = new EvoUIEngineer();
