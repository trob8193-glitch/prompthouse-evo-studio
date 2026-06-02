/**
 * PH EVO STUDIO — BRIDGE CONFIGURATION
 * ═══════════════════════════════════════════════════════════════
 * Centralized resolution for bridge URLs and fetch operations.
 */

export const BRIDGE_URL = import.meta.env?.VITE_BRIDGE_URL || 'http://127.0.0.1:3001';

/**
 * Cleanly joins path segments to the bridge URL.
 */
export function buildBridgeUrl(path = '') {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${BRIDGE_URL}${cleanPath}`;
}

/**
 * Performs a fetch to the bridge with built-in safety, timeouts,
 * and structured error responses.
 */
export async function safeFetchBridge(path, options = {}) {
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

    return {
      ok: response.ok,
      status: response.status,
      data,
      error: response.ok ? null : (data?.error || `Request failed with status ${response.status}`),
      truthState: data?.truth_label || 'UNVERIFIED'
    };
  } catch (err) {
    return {
      ok: false,
      status: null,
      data: null,
      error: err.name === 'AbortError' ? 'Request timed out' : err.message,
      truthState: 'DISCONNECTED'
    };
  }
}

/**
 * Real-time WebSocket connection to the Bridge.
 */
export function connectWebSocket(onMessageCallback) {
  if (typeof window === 'undefined') return null;

  // Convert http:// to ws://
  const wsUrl = BRIDGE_URL.replace(/^http/, 'ws');
  const ws = new window.WebSocket(wsUrl);

  ws.onopen = () => {
    console.log('[WS] Connected to Bridge real-time engine');
    // Attempt authentication if token exists
    const token = localStorage.getItem('ph_evo_token');
    if (token) {
      ws.send(JSON.stringify({ type: 'auth', token }));
    }
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (onMessageCallback) onMessageCallback(data);
    } catch (e) {
      console.warn('[WS] Failed to parse message', e);
    }
  };

  ws.onerror = (err) => {
    console.error('[WS] Connection error', err);
  };

  ws.onclose = () => {
    console.log('[WS] Disconnected. Reconnecting in 5s...');
    setTimeout(() => connectWebSocket(onMessageCallback), 5000);
  };

  return ws;
}
