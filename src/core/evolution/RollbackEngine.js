import { TRUTH_STATES } from './EvolutionPolicy.js';

export function shouldRollback({ proof, comparison, policy } = {}) {
  const reasons = [];
  if (!proof?.passed) reasons.push(`Proof failed: ${proof?.failedCommand || 'unknown command'}`);
  if (comparison && !comparison.improved) reasons.push(...(comparison.issues || ['Comparison did not prove improvement.']));
  return { required: reasons.length > 0, reasons };
}

export function rollbackEvolutionRun({ runId, workspaceDir, reason, receiptLedger } = {}) {
  const rollback = {
    runId,
    workspaceDir,
    truthState: TRUTH_STATES.ROLLED_BACK,
    reason: Array.isArray(reason) ? reason.join('; ') : String(reason || 'Rollback required'),
    at: new Date().toISOString(),
    note: 'Sandbox workspace changes were not merged into the source repo.',
  };
  if (receiptLedger?.updateEvolutionReceipt) {
    receiptLedger.updateEvolutionReceipt(runId, { truthState: TRUTH_STATES.ROLLED_BACK, rollback });
  }
  return rollback;
}
