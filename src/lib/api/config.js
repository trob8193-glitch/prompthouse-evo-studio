/**
 * Safely resolves the active Bridge URL for frontend and backend modules.
 */
export function getBridgeUrl() {
  if (typeof globalThis !== 'undefined' && globalThis.process?.env) {
    return globalThis.process.env.BRIDGE_URL || globalThis.process.env.VITE_BRIDGE_URL || 'http://127.0.0.1:3001';
  }
  if (typeof process !== 'undefined' && process.env) {
    return process.env.BRIDGE_URL || process.env.VITE_BRIDGE_URL || 'http://127.0.0.1:3001';
  }
  try {
    if (import.meta && import.meta.env) {
      return import.meta.env.VITE_BRIDGE_URL || 'http://127.0.0.1:3001';
    }
  } catch (e) {
    // Ignore meta errors
  }
  return 'http://127.0.0.1:3001';
}
