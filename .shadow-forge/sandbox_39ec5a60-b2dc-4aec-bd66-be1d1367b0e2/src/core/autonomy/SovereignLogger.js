/**
 * PH EVO STUDIO — EVO STUDIO LOGGER (V4 RESTORED)
 * ═══════════════════════════════════════════════════════════════
 * Unified logging utility for the Evo Studio Foundry.
 */

export const Log = {
  info: (msg) => console.log(`[INFO] ${msg}`),
  success: (msg) => console.log(`[SUCCESS] ${msg}`),
  warn: (msg) => console.warn(`[WARN] ${msg}`),
  error: (msg) => console.error(`[ERROR] ${msg}`)
};
