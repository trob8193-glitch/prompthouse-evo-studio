/**
 * PH EVO STUDIO — SOVEREIGN LOGGER (V4 RESTORED)
 * ═══════════════════════════════════════════════════════════════
 * Unified logging utility for the Sovereign Foundry.
 */

export const Log = {
  info: (msg) => console.log(`[INFO] ${msg}`),
  success: (msg) => console.log(`[SUCCESS] ${msg}`),
  warn: (msg) => console.warn(`[WARN] ${msg}`),
  error: (msg) => console.error(`[ERROR] ${msg}`)
};
