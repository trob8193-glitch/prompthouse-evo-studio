import fs from 'fs';
import path from 'path';

/**
 * EVOGENAGE — COST ESTIMATOR (DIFFUSION ENHANCED)
 * ═══════════════════════════════════════════════════════════════
 * Calculates the latent cost of generation based on U-Net steps
 * and architectural complexity shards.
 */

export class CostEstimator {
  private diffusionWeights: any;

  constructor() {
    this.loadDiffusionWeights();
  }

  private loadDiffusionWeights() {
    const shardPath = path.join(process.cwd(), '.sovereign-shards', 'diffusion_logic.shard.json');
    if (fs.existsSync(shardPath)) {
      this.diffusionWeights = JSON.parse(fs.readFileSync(shardPath, 'utf8'));
    }
  }

  /**
   * Estimate the credit cost for a generation job.
   * cost = base_cost + (steps * complexity_multiplier)
   */
  estimate(assetType: string, steps: number = 50): number {
    const baseCosts: Record<string, number> = {
      bot_avatar: 5,
      app_icon: 3,
      transparent_png: 8,
      react_layout: 15,
      theme_texture: 10
    };

    const base = baseCosts[assetType] || 5;
    const complexityMultiplier = this.diffusionWeights ? 0.1 : 0.05; // Sharper denoising = higher cost
    
    const totalCost = Math.ceil(base + (steps * complexityMultiplier));
    
    return totalCost;
  }
}
