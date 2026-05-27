/**
 * PH EVO STUDIO — ENV STATUS CLIENT
 * ═══════════════════════════════════════════════════════════════
 * Frontend client for environment validation status.
 * No hardcoded bridge URL. No secrets.
 */
import { safeFetchBridge } from '../config/bridge-config.js';

/**
 * Fetch environment validation status from the bridge.
 * Returns { ok, status, data, error, truthState }
 */
export async function getEnvironmentValidation() {
  return safeFetchBridge('/api/environment/validation');
}
