import { PerfectionGate } from '../autonomy/PerfectionGate.js';
import { SOCIAL_BRIDGE } from './SocialBridge.js';
import { UNIVERSAL_BRIDGE } from './UniversalBridge.js';

const gate = new PerfectionGate();

/**
 * EVOGENAGE — SOVEREIGN INTEROP API (GATEWAY)
 * ═══════════════════════════════════════════════════════════════
 * The singular entry point for external grid requests.
 * All outgoing data is passed through the PerfectionGate.
 */

export const SovereignApi = {
  /**
   * Externally trigger a social broadcast.
   */
  async broadcastToGrid(botId, message) {
    const packet = { botId, message, timestamp: Date.now() };
    
    if (await gate.validate(packet)) {
      return await SOCIAL_BRIDGE.broadcast(botId, message);
    } else {
      throw new Error('PERFECTION_GATE_REJECTED: External packet drift detected.');
    }
  },

  /**
   * Externally trigger a cross-platform command.
   */
  async dispatchToSwarm(command, params) {
    return await UNIVERSAL_BRIDGE.dispatchToDart(command, params);
  }
};
