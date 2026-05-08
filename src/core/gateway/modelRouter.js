import db from '../db/quad_schema.js';

/**
 * Model Router — Determines whether to use Local, Gemini, or OpenAI.
 * Follows the rule: Free plan users are locked to Local engines.
 * Paid users can use Gemini/OpenAI if they have credits.
 */
export class ModelRouter {
  /**
   * Routes the request to the appropriate provider.
   * @param {string} orgId - The organization ID.
   * @param {string} endpoint - The requested endpoint.
   * @returns {string} - The provider to use ('local', 'gemini', 'openai').
   */
  static async route(orgId, endpoint) {
    // 1. Get organization plan
    const org = db.prepare('SELECT plan FROM organizations WHERE id = ?').get(orgId);
    if (!org) {
      throw new Error('Organization not found');
    }

    // 2. Get endpoint configuration
    const epConfig = db.prepare('SELECT provider_allowed, required_plan FROM api_endpoints WHERE path = ?').get(endpoint);
    
    // Default fallback if endpoint is not registered
    if (!epConfig) {
      console.log(`[ROUTER] Endpoint ${endpoint} not registered. Defaulting to local.`);
      return 'local';
    }

    // 3. Apply routing rules
    if (org.plan === 'free') {
      console.log(`[ROUTER] Org ${orgId} is on FREE plan. Routing to local.`);
      return 'local';
    }

    if (org.plan === 'paid') {
      // Check if the endpoint allows cloud providers
      if (epConfig.provider_allowed === 'cloud' || epConfig.provider_allowed === 'any') {
        // Here we could add logic to choose between Gemini and OpenAI
        // For now, let's default to Gemini as the preferred cloud provider (cost effective)
        // or OpenAI if specified in some setting.
        
        const preferredProvider = db.prepare("SELECT value FROM system_settings WHERE key = 'default_cloud_provider'").get();
        return preferredProvider ? preferredProvider.value : 'gemini';
      }
    }

    console.log(`[ROUTER] Defaulting to local for ${orgId} on ${endpoint}`);
    return 'local';
  }
}

export default ModelRouter;
