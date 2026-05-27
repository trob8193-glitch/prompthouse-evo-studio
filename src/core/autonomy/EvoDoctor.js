import { Log } from './SovereignLogger.js';
import { EVO_SCANNER } from './EvoScanner.js';
import { SelfHealer } from '../automation/SelfHealer.js';
import { useSovereignStore } from '../../store.js';

/**
 * PH EVO STUDIO — EVO DOCTOR (MEDICAL ORCHESTRATOR)
 * ═══════════════════════════════════════════════════════════════
 * Proactive health maintenance protocol. Coordinates scanning,
 * drift detection, and autonomous remediation (Medical Intervention).
 * DOLPHIN_DOC (id: 16) is the primary sentient for this protocol.
 */

export class EvoDoctor {
  constructor() {
    this.scanner = EVO_SCANNER;
    this.healer = new SelfHealer();
    this.isHealInProgress = false;
  }

  /**
   * Perform a full system-wide diagnostic scan.
   */
  async scanSystem() {
    Log.info('🩺 [EvoDoctor] Initiating System-Wide Diagnostic Scan...');
    
    try {
      const scanResults = await this.scanner.scanCore();
      
      // Update store with truth scores if running in browser context
      if (typeof window !== 'undefined') {
        const store = useSovereignStore.getState();
        // Here we would push scores to the store
        // store.addNotification('Diagnostic scan complete.', 'info');
      }

      return {
        success: true,
        timestamp: new Date().toISOString(),
        scanResults
      };
    } catch (e) {
      Log.error(`🩺 [EvoDoctor] Diagnostic scan failed: ${e.message}`);
      return { success: false, error: e.message };
    }
  }

  /**
   * Execute medical intervention for detected drift.
   */
  async performHeal(targetFiles = []) {
    if (this.isHealInProgress) {
      Log.warn('🩺 [EvoDoctor] Healing cycle already in progress.');
      return { success: false, error: 'ALREADY_HEALING' };
    }

    this.isHealInProgress = true;
    Log.info(`🩺 [EvoDoctor] Initiating Medical Intervention for ${targetFiles.length || 'all detected'} faults...`);

    try {
      const healResults = await this.healer.execute({ targetFiles });
      
      Log.success('🩺 [EvoDoctor] Medical Intervention Complete. System Aligned.');
      return {
        success: true,
        timestamp: new Date().toISOString(),
        healResults
      };
    } catch (e) {
      Log.error(`🩺 [EvoDoctor] Healing intervention failed: ${e.message}`);
      return { success: false, error: e.message };
    } finally {
      this.isHealInProgress = false;
    }
  }

  /**
   * Proactive maintenance loop (called by NightForge).
   */
  async maintenanceTick() {
    Log.info('🩺 [EvoDoctor] Proactive Heartbeat: Checking System Pulse...');
    const scan = await this.scanSystem();
    
    if (scan.success && scan.scanResults.driftCount > 0) {
      Log.info(`🩺 [EvoDoctor] Proactive scan detected ${scan.scanResults.driftCount} faults. Scheduling repair...`);
      return await this.performHeal();
    }

    return scan;
  }
}

export const EVO_DOCTOR = new EvoDoctor();
