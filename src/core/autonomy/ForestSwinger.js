import { Log } from './SovereignLogger.js';
/**
 * PH EVO STUDIO — FOREST SWINGER
 * ═══════════════════════════════════════════════════════════════
 * This module allows the Evo Agent to "swing" between different trees
 * in the Prompt Garden, leveraging the specialized intelligence of
 * every sprouted sub-studio.
 */

import fs from 'fs';
import path from 'path';

const GARDEN_DIR = path.join(process.cwd(), '.prompt-garden');

export class ForestSwinger {
  constructor() {
    this.gardenDir = GARDEN_DIR;
  }

  /**
   * Find the best studio for a specific mission.
   */
  async findTree(mission) {
    Log.info(`🐒 [ForestSwinger] Swinging through the garden for mission: "${mission}"...`);
    const studios = fs.readdirSync(this.gardenDir);
    let bestMatch = { studio: 'MASTER', score: 0 };

    for (const studio of studios) {
      const brainPath = path.join(this.gardenDir, studio, '.sovereign-brain.json');
      if (fs.existsSync(brainPath)) {
        const brain = JSON.parse(fs.readFileSync(brainPath, 'utf8'));
        
        // Simple resonance check: Does the mission match the parent_seed or patterns?
        const resonance = this.calculateResonance(mission, brain);
        if (resonance > bestMatch.score) {
          bestMatch = { studio, score: resonance };
        }
      }
    }

    Log.info(`✓ [ForestSwinger] Landed in tree: ${bestMatch.studio} (Score: ${bestMatch.score})`);
    return bestMatch.studio;
  }

  calculateResonance(mission, brain) {
    const keywords = mission.toLowerCase().split(' ');
    let score = 0;
    
    // Check parent seed
    if (keywords.some(k => brain.parent_seed?.toLowerCase().includes(k))) score += 10;
    
    // Check internalized patterns
    const patternText = JSON.stringify(brain.internalized_patterns).toLowerCase();
    keywords.forEach(k => {
      if (patternText.includes(k)) score += 1;
    });

    return score;
  }

  /**
   * Delegate a task to a specific garden tree.
   */
  async delegate(studio, task) {
    Log.info(`📤 [ForestSwinger] Delegating task to ${studio}: "${task}"`);
    // In a real implementation, this would trigger the NightForge daemon 
    // inside the target sub-studio.
    return { success: true, target: studio, status: 'DELEGATED' };
  }
}
