
import { Log } from '../../core/autonomy/SovereignLogger.js';

/**
 * PH EVO STUDIO — PROMPTBRIDGECLIENT (PRODUCTION GRADE)
 * ═══════════════════════════════════════════════════════════════
 * Unified client library for communicating with promptbridge-server.js.
 * Enforces proof receipts and error boundaries for all requests.
 */

const BASE_URL = 'http://localhost:11434'; // Default bridge port, may be overridden by config

export class PromptBridgeClient {
  constructor(baseUrl = BASE_URL) {
    this.status = 'ACTIVE';
    this.baseUrl = baseUrl;
  }

  /**
   * Internal wrapper for fetch to handle JSON and errors.
   */
  async _call(endpoint, method = 'GET', body = null) {
    const url = `${this.baseUrl}${endpoint}`;
    Log.info(`[PromptBridgeClient] ${method} ${endpoint}`);
    
    try {
      const options = {
        method,
        headers: { 'Content-Type': 'application/json' }
      };
      if (body) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`Bridge returned ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (err) {
      Log.error(`[PromptBridgeClient] Request failed: ${err.message}`);
      throw err;
    }
  }

  // --- API Endpoints ---

  async getStatus() {
    return await this._call('/status');
  }

  async getMetrics() {
    return await this._call('/api/metrics');
  }

  async executeIntelligence(payload) {
    return await this._call('/api/intelligence/execute', 'POST', payload);
  }

  async sendEvolutionSignal(signal) {
    return await this._call('/api/evolution/signal', 'POST', signal);
  }

  async getRuntimeStatus() {
    return await this._call('/api/evo-runtime/status');
  }

  async fetchArtifactRegistry() {
    return await this._call('/api/generated-artifact-registry');
  }
}

// Global Singleton Instance
export const promptBridgeClient = new PromptBridgeClient();

/**
 * Legacy standalone export for raw calls.
 */
export const promptBridgeCall = async (endpoint, method, payload) => {
  return await promptBridgeClient._call(endpoint, method, payload);
};

/**
 * Creates a standard proof receipt object locally before sending to server.
 */
export const createProofReceipt = (claim, evidence, owner = 'Evo Studio', overrideId = null) => {
  return {
    id: overrideId || `proof_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    claim,
    evidence,
    owner,
    timestamp: new Date().toISOString(),
    status: 'Built',
    rollback: 'None (Local Creation)'
  };
};
