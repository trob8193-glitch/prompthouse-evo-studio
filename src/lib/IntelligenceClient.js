import { useSovereignStore } from '../store.js';

/**
 * INTELLIGENCE CLIENT
 * ═══════════════════════════════════════════════════════════════
 * Universal frontend bridge to the IntelligenceCore backend.
 * Routes all specialized UI logic queries to the AI engine.
 */

export class IntelligenceClient {
  /**
   * Executes a specialized AI action via the Intelligence Core.
   * @param {string} module - The target engine (e.g., 'DeadHunter', 'TruthAuditor')
   * @param {string} action - The action to perform
   * @param {object} payload - Context data (e.g., code, logs, ledger)
   * @returns {Promise<any>}
   */
  static async execute(module, action, payload = {}) {
    // Get the bridge URL from the Zustand store's state
    const state = useSovereignStore.getState();
    const bridgeUrl = state.apiConfig?.bridgeUrl || 'http://127.0.0.1:3001';

    try {
      const response = await fetch(`${bridgeUrl}/api/intelligence/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module, action, payload })
      });

      if (!response.ok) {
        throw new Error(`Bridge returned HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Execution failed');
      }

      return data;
    } catch (error) {
      console.error(`[IntelligenceClient] ${module} -> ${action} Failed:`, error);
      throw error;
    }
  }
}
