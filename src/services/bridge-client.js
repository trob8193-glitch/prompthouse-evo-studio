/**
 * PH EVO STUDIO — BRIDGE CLIENT
 * ═══════════════════════════════════════════════════════════════
 * Service layer for structured bridge communication.
 */
import { safeFetchBridge } from '../config/bridge-config.js';

export const bridgeClient = {
  /**
   * Retrieves basic bridge health and status.
   */
  async getBridgeStatus() {
    return safeFetchBridge('/status');
  },

  /**
   * Retrieves bridge operational metrics.
   */
  async getMetrics() {
    return safeFetchBridge('/api/metrics');
  },

  /**
   * Sends a chat payload to the AI orchestration bridge.
   */
  async sendChatToBridge(payload) {
    return safeFetchBridge('/api/chat', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  /**
   * Persists API keys to the bridge vault.
   */
  async saveBridgeKeys(keys) {
    return safeFetchBridge('/api/config/keys', {
      method: 'POST',
      body: JSON.stringify({ keys })
    });
  },

  /**
   * Logs a truth event to the sovereign ledger.
   */
  async logLedgerEvent(payload) {
    return safeFetchBridge('/api/ledger/event', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  /**
   * Triggers an autonomous maintenance/repair cycle.
   */
  async runMaintenanceCycle() {
    return safeFetchBridge('/api/maintenance/run', { method: 'POST' });
  },

  /**
   * Triggers a nuclear truth probe audit.
   */
  async runTruthProbe() {
    return safeFetchBridge('/api/audit/probe', { method: 'POST' });
  },

  /**
   * Retrieves the evolution profile for a specific client.
   */
  async getEvolutionProfile(clientId) {
    return safeFetchBridge(`/api/evolution/profile?clientId=${encodeURIComponent(clientId)}`);
  },

  /**
   * Sends an evolution signal (interaction telemetry).
   */
  async sendEvolutionSignal(payload) {
    return safeFetchBridge('/api/evolution/signal', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }
};

// Default exports for individual functions as requested
export const getBridgeStatus = () => bridgeClient.getBridgeStatus();
export const getMetrics = () => bridgeClient.getMetrics();
export const sendChatToBridge = (payload) => bridgeClient.sendChatToBridge(payload);
export const saveBridgeKeys = (keys) => bridgeClient.saveBridgeKeys(keys);
export const logLedgerEvent = (payload) => bridgeClient.logLedgerEvent(payload);
export const runMaintenanceCycle = () => bridgeClient.runMaintenanceCycle();
export const runTruthProbe = () => bridgeClient.runTruthProbe();
export const getEvolutionProfile = (clientId) => bridgeClient.getEvolutionProfile(clientId);
export const sendEvolutionSignal = (payload) => bridgeClient.sendEvolutionSignal(payload);
