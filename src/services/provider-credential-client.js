/**
 * PH EVO STUDIO — PROVIDER CREDENTIAL CLIENT
 * ═══════════════════════════════════════════════════════════════
 * Frontend client for fetching provider credential readiness.
 * No hardcoded bridge URL. No secrets.
 */
import { safeFetchBridge } from '../config/bridge-config.js';

/**
 * Fetch provider credential checklist from the bridge.
 * Returns { ok, status, data, error, truthState }
 */
export async function getProviderCredentialChecklist() {
  return safeFetchBridge('/api/provider-credentials/checklist');
}
