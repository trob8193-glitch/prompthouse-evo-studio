/**
 * PromptHouse Evo Studio — Optic Nerve Bridge
 * ═══════════════════════════════════════════════════════════════
 * Listens for telemetry and actuation events from the Evo Browser Extension.
 * Forms the physical bridge between the studio matrix and the global web.
 */

import { Log } from '../autonomy/SovereignLogger.js';
import { GlobalSplitTether } from '../tethers/SplitTetherDaemon.js';

class OpticNerveBridgeCore {
  constructor() {
    this.connected = false;
  }

  /**
   * Called by the promptbridge-server WebSocket when the extension connects.
   */
  registerOpticConnection(clientId) {
    this.connected = true;
    Log.success(`👁️ [OpticNerve] Browser Extension connected (Client: ${clientId})`);
  }

  /**
   * Ingest raw DOM telemetry, API docs, or screenshots from the active browser tab.
   */
  ingestTelemetry(payload) {
    if (!payload || !payload.url) return;
    Log.info(`👁️ [OpticNerve] Ingesting telemetry from: ${payload.url}`);
    
    // [SPLIT-TETHER AMPLIFICATION] Send browser telemetry to Copilot and Tridall
    GlobalSplitTether.splitAndRoute('OpticNerve', { 
      type: 'BROWSER_TELEMETRY', 
      url: payload.url,
      domState: payload.domState || 'unknown',
      inferredContext: payload.inferredContext || 'Browsing'
    }).catch(() => {});
  }

  /**
   * Process autonomous actuation results (e.g. Omnibot clicking a button on AWS).
   */
  processActuationResult(result) {
    Log.info(`👁️ [OpticNerve] Actuation result received: ${result.action} -> ${result.status}`);
    
    GlobalSplitTether.splitAndRoute('OpticNerve', { 
      type: 'BROWSER_ACTUATION', 
      result
    }).catch(() => {});
  }
}

export const OpticNerveBridge = new OpticNerveBridgeCore();
