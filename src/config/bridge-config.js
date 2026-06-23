/**
 * PH EVO STUDIO — BRIDGE CONFIGURATION
 * ═══════════════════════════════════════════════════════════════
 * Centralized resolution for bridge URLs and fetch operations.
 */

function resolveBridgeUrl() {
  const defaultBridgeUrl = typeof window !== 'undefined' ? '' : 'http://127.0.0.1:3001';
  if (typeof globalThis !== 'undefined' && globalThis.process?.env) {
    if (globalThis.process.env.BRIDGE_URL || globalThis.process.env.VITE_BRIDGE_URL) {
      return globalThis.process.env.BRIDGE_URL || globalThis.process.env.VITE_BRIDGE_URL;
    }
  }
  if (typeof process !== 'undefined' && process.env) {
    if (process.env.BRIDGE_URL || process.env.VITE_BRIDGE_URL) {
      return process.env.BRIDGE_URL || process.env.VITE_BRIDGE_URL;
    }
  }
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BRIDGE_URL) {
      return import.meta.env.VITE_BRIDGE_URL;
    }
  } catch (e) {
    // Ignore
  }
  return defaultBridgeUrl;
}

export const BRIDGE_URL = resolveBridgeUrl();

/**
 * Cleanly joins path segments to the bridge URL.
 */
export function buildBridgeUrl(path = '') {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${BRIDGE_URL}${cleanPath}`;
}

/**
 * Performs a fetch to the bridge with built-in safety, timeouts,
 * structured error responses, and an Omni-Bridge Circuit Breaker.
 */
let circuitState = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
let failureCount = 0;
let nextTryTime = 0;
const FAILURE_THRESHOLD = 3;
const RESET_TIMEOUT_MS = 15000;

export async function safeFetchBridge(path, options = {}) {
  // CIRCUIT BREAKER PRE-CHECK
  if (circuitState === 'OPEN') {
    if (Date.now() > nextTryTime) {
      circuitState = 'HALF_OPEN';
      console.warn(`[Omni-Bridge] Circuit Breaker HALF-OPEN. Testing connection to ${path}...`);
    } else {
      return {
        ok: false,
        status: 503,
        data: null,
        error: '[Circuit Breaker OPEN] Omni-Bridge is actively rejecting traffic to protect UI thread.',
        truthState: 'DISCONNECTED'
      };
    }
  }

  const { timeout = 8000, ...fetchOptions } = options;
  const url = buildBridgeUrl(path);

  // Auth Injection
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('ph_evo_token') : null;
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      signal: controller.signal
    });

    clearTimeout(id);

    let data = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok && response.status >= 500) {
      failureCount++;
      if (failureCount >= FAILURE_THRESHOLD && circuitState === 'CLOSED') {
        circuitState = 'OPEN';
        nextTryTime = Date.now() + RESET_TIMEOUT_MS;
        console.error(`[Omni-Bridge] CIRCUIT BREAKER TRIPPED! 500 errors exceeded. Traffic halted for 15s.`);
      }
    } else if (response.ok) {
      if (circuitState === 'HALF_OPEN' || failureCount > 0) {
        circuitState = 'CLOSED';
        failureCount = 0;
        console.info(`[Omni-Bridge] Circuit Breaker CLOSED. Network restored.`);
      }
    }

    return {
      ok: response.ok,
      status: response.status,
      data,
      error: response.ok ? null : (data?.error || `Request failed with status ${response.status}`),
      truthState: data?.truth_label || 'UNVERIFIED'
    };
  } catch (err) {
    failureCount++;
    if (failureCount >= FAILURE_THRESHOLD && circuitState === 'CLOSED') {
      circuitState = 'OPEN';
      nextTryTime = Date.now() + RESET_TIMEOUT_MS;
      console.error(`[Omni-Bridge] CIRCUIT BREAKER TRIPPED! Network timeouts exceeded. Traffic halted for 15s.`);
    }

    return {
      ok: false,
      status: null,
      data: null,
      error: err.name === 'AbortError' ? 'Request timed out' : err.message,
      truthState: 'DISCONNECTED'
    };
  }
}
