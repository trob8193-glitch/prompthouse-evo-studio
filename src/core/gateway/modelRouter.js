import db from '../db/quad_schema.js';
import { CostFirewall } from './costFirewall.js';

/**
 * Model Router — Determines whether to use Local, Gemini, or OpenAI.
 * Follows the rule: Free plan users are locked to Local engines.
 * Paid users can use Gemini/OpenAI if they have credits.
 * 
 * SOVEREIGN UPDATE: Economic Survival Loop integrated.
 */
export class ModelRouter {
  static DOWNSHIFT_THRESHOLD = 500; // Force local if credits < 500

  /**
   * Routes the request to the appropriate provider.
   */
  static async route(orgId, endpoint) {
    // 1. Get organization plan
    const org = db.prepare('SELECT plan FROM organizations WHERE id = ?').get(orgId);
    if (!org) {
      throw new Error('Organization not found');
    }

    // 2. Check Economic Survival State
    const remainingCredits = await CostFirewall.getRemainingCredits(orgId);
    const isSurvivalMode = remainingCredits < this.DOWNSHIFT_THRESHOLD;

    // 3. Get endpoint configuration
    const epConfig = db.prepare('SELECT provider_allowed, required_plan FROM api_endpoints WHERE path = ?').get(endpoint);
    
    // Default fallback if endpoint is not registered
    if (!epConfig) {
      console.log(`[ROUTER] Endpoint ${endpoint} not registered. Defaulting to local.`);
      return 'local';
    }

    // 4. Apply routing rules
    if (org.plan === 'free') {
      return 'local';
    }

    if (org.plan === 'paid') {
      // Check if we are in Survival Mode
      if (isSurvivalMode) {
        // Only allow cloud for critical Truth/Maintenance operations
        const isCritical = endpoint.includes('/api/truth/') || endpoint.includes('/api/maintenance/');
        if (!isCritical) {
          console.log(`[ROUTER] ECONOMIC SURVIVAL ACTIVE (Credits: ${remainingCredits}). Downshifting ${endpoint} to local.`);
          return 'local';
        }
      }

      // Check if the endpoint allows cloud providers
      if (epConfig.provider_allowed === 'cloud' || epConfig.provider_allowed === 'any') {
        const preferredProvider = db.prepare("SELECT value FROM system_settings WHERE key = 'default_cloud_provider'").get();
        return preferredProvider ? preferredProvider.value : 'gemini';
      }
    }

    return 'local';
  }
}

export default ModelRouter;
