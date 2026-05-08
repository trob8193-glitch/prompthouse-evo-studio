import { Log } from './core/autonomy/SovereignLogger.js';
import { UniversalBridge } from './core/interop/UniversalBridge.js';

/**
 * PH EVO STUDIO — COMMERCE-RAIL (V5 PRODUCTION)
 * ═══════════════════════════════════════════════════════════════
 * Handles product generation, pricing tables, and Stripe integration dispatches.
 */

export class CommerceRail {
  constructor() {
    this.status = 'ACTIVE';
    this.bridge = new UniversalBridge();
  }

  /**
   * Create a production commerce product spec.
   */
  async createProduct(spec) {
    Log.info(`💎 [Commerce] Creating Product: ${spec.productName}`);
    return await this.bridge.dispatch('commerce', 'create_product', spec);
  }

  /**
   * Get the canonical pricing table.
   */
  async getPricingTable() {
    Log.info('💎 [Commerce] Fetching Pricing Table...');
    return await this.bridge.dispatch('commerce', 'get_pricing_table', {});
  }

  async execute(params = {}) {
    Log.info('🚀 [CommerceRail] Executing commerce logic...');
    return await this.bridge.dispatch('commerce', 'execute', params);
  }

  getStatus() {
    return { 
      id: 'commerce-rail', 
      grade: 'PRODUCTION', 
      state: 'ACTIVE',
      resonance: 1.0 
    };
  }
}

/**
 * Helper to create commerce product (compat layer for older views)
 */
export const createCommerceProduct = async (session, spec) => {
  const rail = new CommerceRail();
  return await rail.createProduct(spec);
};

/**
 * Helper to create pricing table (compat layer for older views)
 */
export const createPricingTable = async (session) => {
  const rail = new CommerceRail();
  const res = await rail.getPricingTable();
  return res.data || res;
};
