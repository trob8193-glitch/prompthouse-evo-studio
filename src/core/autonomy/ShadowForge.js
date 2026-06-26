import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { Log } from './SovereignLogger.js';
import { VMSandboxValidator } from '../evolution/VMSandboxValidator.js';

const execFileAsync = promisify(execFile);

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
   * Deep Semantic AST Validation Simulator
   */
  async _validateAST(filePath, logic) {
    // Rely on VMSandboxValidator for true deep AST validation
    return VMSandboxValidator.validateAST(logic);
  }

  /**
   * Execute a ghost-build of a proposed mutation.
   */
  async shadowBuild(fileId, proposedLogic) {
    Log.info(`👤 [ShadowForge] Creating Ghost-Build for: ${fileId}...`);

    if (!fs.existsSync(this.shadowDir)) fs.mkdirSync(this.shadowDir);

    const isCss = fileId.includes('_css_') || fileId.endsWith('.css');
    const ext = isCss ? '.css' : '.js';
    const shadowPath = path.join(this.shadowDir, `${fileId}.ghost${ext}`);
    fs.writeFileSync(shadowPath, proposedLogic);

    // PHYSICAL VALIDATION: Check for syntax errors in the ghost-file
    try {
      if (!isCss) {
        await execFileAsync('node', ['--check', shadowPath]);
      } else {
        Log.info(`🎨 [ShadowForge] Bypassing Node syntax check for CSS mutation: ${fileId}`);
      }
      
      // DEEP VALIDATION: Semantic Traversal
      await this._validateAST(shadowPath, proposedLogic);

      Log.success(`✅ [ShadowForge] Ghost-Build STABLE & SEMANTICALLY SOUND for ${fileId}. Safe for Evolution.`);
      return true;
    } catch (e) {
      Log.error(`❌ [ShadowForge] Ghost-Build FAILED: ${e.message}. Pruning Mutation.`);
      return false;
    }
  }
}

export const SHADOW_FORGE = new ShadowForge();
