/**
 * PH EVO STUDIO — DIAGNOSTICS CLIENT
 * ═══════════════════════════════════════════════════════════════
 * Communicates with the bridge for application diagnostics.
 */
import { safeFetchBridge } from '../config/bridge-config.js';

export async function getRouteDiagnostics() {
  return safeFetchBridge('/api/diagnostics/routes');
}

export async function getImportDiagnostics() {
  return safeFetchBridge('/api/diagnostics/imports');
}

export async function getCssVarDiagnostics() {
  return safeFetchBridge('/api/diagnostics/css-vars');
}

export async function getWorktreeDiagnostics() {
  return safeFetchBridge('/api/diagnostics/worktree');
}
