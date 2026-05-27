/**
 * PH EVO STUDIO — PROVIDER STATUS CLIENT
 * ═══════════════════════════════════════════════════════════════
 * Frontend client for Phase 3 provider gate and receipt endpoints.
 * Uses the bridge-config from Phase 1.
 */
import { safeFetchBridge } from '../config/bridge-config.js';

/**
 * Fetches provider gate status from the bridge.
 */
export async function getProviderGateStatus() {
  const result = await safeFetchBridge('/api/provider-gates/status');
  if (!result.ok) {
    return {
      ok: false,
      gates: {},
      truthState: result.truthState || 'DISCONNECTED',
      error: result.error,
    };
  }
  return {
    ok: true,
    gates: result.data?.gates || {},
    truthState: result.data?.truthState || 'LOCAL_ONLY',
    error: null,
  };
}

/**
 * Fetches recent provider receipts from the bridge.
 */
export async function getProviderReceipts(limit = 50) {
  const result = await safeFetchBridge(`/api/provider-receipts?limit=${limit}`);
  if (!result.ok) {
    return {
      ok: false,
      receipts: [],
      truthState: result.truthState || 'DISCONNECTED',
      error: result.error,
    };
  }
  return {
    ok: true,
    receipts: result.data?.receipts || [],
    truthState: result.data?.truthState || 'LOCAL_ONLY',
    error: null,
  };
}
