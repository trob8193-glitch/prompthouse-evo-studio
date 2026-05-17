/**
 * PH EVO STUDIO — SECURITY AUDIT CLIENT
 * ═══════════════════════════════════════════════════════════════
 * Frontend client for Phase 4 security audit endpoint.
 * Uses Phase 1 bridge-config — no hardcoded URLs.
 */
import { safeFetchBridge } from '../config/bridge-config.js';

/**
 * Fetches the security audit report from the bridge.
 */
export async function getSecurityAudit() {
  const result = await safeFetchBridge('/api/security/audit');
  if (!result.ok) {
    return {
      ok: false,
      status: 'error',
      data: null,
      error: result.error,
      truthState: result.truthState || 'DISCONNECTED',
    };
  }
  return {
    ok: true,
    status: 'loaded',
    data: result.data,
    error: null,
    truthState: result.data?.truthState || 'LOCAL_ONLY',
  };
}
