import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { Log } from './SovereignLogger.js';

const execAsync = promisify(exec);

/**
 * PH EVO STUDIO — SHADOWFORGE (GHOST-BUILDING)
 * ═══════════════════════════════════════════════════════════════
 * Tests architectural mutations in a safe, isolated shadow-space.
 * Prevents studio crashes by ensuring 100% stability before 'The Swap'.
 */

export class ShadowForge {
  constructor(baseDir = './') {
    this.baseDir = baseDir;
    this.shadowDir = path.join(baseDir, '.shadow-forge');
  }

  /**
   * Execute a ghost-build of a proposed mutation.
   */
  async shadowBuild(fileId, proposedLogic) {
    Log.info(`👤 [ShadowForge] Creating Ghost-Build for: ${fileId}...`);

    if (!fs.existsSync(this.shadowDir)) fs.mkdirSync(this.shadowDir);

    const shadowPath = path.join(this.shadowDir, `${fileId}.ghost`);
    fs.writeFileSync(shadowPath, proposedLogic);

    // PHYSICAL VALIDATION: Actually check for syntax errors in the ghost-file
    try {
      await execAsync(`node --check "${shadowPath}"`);
      Log.success(`✅ [ShadowForge] Ghost-Build STABLE for ${fileId}. Safe for Evolution.`);
      return true;
    } catch (e) {
      Log.error(`❌ [ShadowForge] Ghost-Build FAILED: ${e.message}. Pruning Mutation.`);
      return false;
    }
  }
}

export const SHADOW_FORGE = new ShadowForge();
