import { safeFetchBridge } from '../config/bridge-config.js';
import { TRUTH_STATES } from '../constants/truth-states.js';

/**
 * Fetches the current handover status summary.
 * Safe, read-only.
 */
export async function getHandoverStatus() {
  try {
    const res = await safeFetchBridge('/api/handover/status');
    const data = await res.json();
    return {
      ok: data.ok ?? false,
      truthState: data.truthState || TRUTH_STATES.ERROR,
      data: data
    };
  } catch (err) {
    return {
      ok: false,
      truthState: TRUTH_STATES.ERROR,
      error: err.message
    };
  }
}

/**
 * Fetches the full handover report JSON.
 */
export async function getHandoverReport() {
  try {
    const res = await safeFetchBridge('/api/handover/report');
    const data = await res.json();
    return {
      ok: data.ok ?? false,
      truthState: data.truthState || (data.ok ? TRUTH_STATES.VERIFIED : TRUTH_STATES.ERROR),
      report: data.report || null,
      error: data.error
    };
  } catch (err) {
    return {
      ok: false,
      truthState: TRUTH_STATES.ERROR,
      error: err.message
    };
  }
}
