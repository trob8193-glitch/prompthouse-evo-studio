import db from '../db/quad_schema.js';
<<<<<<< HEAD
import { CostFirewall } from './costFirewall.js';
=======
>>>>>>> main

/**
 * Model Router — Determines whether to use Local, Gemini, or OpenAI.
 * Follows the rule: Free plan users are locked to Local engines.
 * Paid users can use Gemini/OpenAI if they have credits.
<<<<<<< HEAD
 * 
 * SOVEREIGN UPDATE: Economic Survival Loop integrated.
 */
export class ModelRouter {
  static DOWNSHIFT_THRESHOLD = 500; // Force local if credits < 500

  /**
   * Routes the request to the appropriate provider.
=======
 */
export class ModelRouter {
  /**
   * Routes the request to the appropriate provider.
   * @param {string} orgId - The organization ID.
   * @param {string} endpoint - The requested endpoint.
   * @returns {string} - The provider to use ('local', 'gemini', 'openai').
>>>>>>> main
   */
  static async route(orgId, endpoint) {
    // 1. Get organization plan
    const org = db.prepare('SELECT plan FROM organizations WHERE id = ?').get(orgId);
    if (!org) {
      throw new Error('Organization not found');
    }

<<<<<<< HEAD
    // 2. Check Economic Survival State
    const remainingCredits = await CostFirewall.getRemainingCredits(orgId);
    const isSurvivalMode = remainingCredits < this.DOWNSHIFT_THRESHOLD;

    // 3. Get endpoint configuration
=======
    // 2. Get endpoint configuration
>>>>>>> main
    const epConfig = db.prepare('SELECT provider_allowed, required_plan FROM api_endpoints WHERE path = ?').get(endpoint);
    
    // Default fallback if endpoint is not registered
    if (!epConfig) {
<<<<<<< HEAD
      
      return 'local';
    }

    // 4. Apply routing rules
    if (org.plan === 'free') {
=======
      console.log(`[ROUTER] Endpoint ${endpoint} not registered. Defaulting to local.`);
      return 'local';
    }

    // 3. Apply routing rules
    if (org.plan === 'free') {
      console.log(`[ROUTER] Org ${orgId} is on FREE plan. Routing to local.`);
>>>>>>> main
      return 'local';
    }

    if (org.plan === 'paid') {
<<<<<<< HEAD
      // Check if we are in Survival Mode
      if (isSurvivalMode) {
        // Only allow cloud for critical Truth/Maintenance operations
        const isCritical = endpoint.includes('/api/truth/') || endpoint.includes('/api/maintenance/');
        if (!isCritical) {
          
          return 'local';
        }
      }

      // Check if the endpoint allows cloud providers
      if (epConfig.provider_allowed === 'cloud' || epConfig.provider_allowed === 'any') {
=======
      // Check if the endpoint allows cloud providers
      if (epConfig.provider_allowed === 'cloud' || epConfig.provider_allowed === 'any') {
        // Here we could add logic to choose between Gemini and OpenAI
        // For now, let's default to Gemini as the preferred cloud provider (cost effective)
        // or OpenAI if specified in some setting.
        
>>>>>>> main
        const preferredProvider = db.prepare("SELECT value FROM system_settings WHERE key = 'default_cloud_provider'").get();
        return preferredProvider ? preferredProvider.value : 'gemini';
      }
    }

<<<<<<< HEAD
=======
    console.log(`[ROUTER] Defaulting to local for ${orgId} on ${endpoint}`);
>>>>>>> main
    return 'local';
  }
}

export default ModelRouter;
