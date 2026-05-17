import fs from 'fs';
import path from 'path';
import { DEFAULT_EVOLUTION_POLICY, TRUTH_STATES, normalizeEvolutionPolicy } from './EvolutionPolicy.js';
import { createRepoSnapshot, writeSnapshot } from './RepoSnapshot.js';
import { createEvolutionWorkspace } from './EvolutionWorkspace.js';
import { buildPatchProposal } from './PatchProposalEngine.js';
import { applyPatchProposal } from './PatchApplier.js';
import { runProofCommands } from './ProofRunner.js';
import { compareEvolutionRun, isImprovement } from './EvolutionComparator.js';
import { shouldRollback, rollbackEvolutionRun } from './RollbackEngine.js';
import { createEvolutionReceipt, updateEvolutionReceipt, listEvolutionReceipts, readEvolutionReceipt } from './EvolutionReceiptLedger.js';
import { recordEvolutionOutcome } from './EvolutionMemory.js';

function dirs(rootDir, runId) {
  const base = path.join(rootDir, '.prompthouse-data', 'evolution');
  return {
    base,
    receiptRoot: path.join(base, 'receipts'),
    snapshotRoot: path.join(base, 'snapshots', runId),
    proofRoot: path.join(base, 'proof', runId),
  };
}

export async function runEvolutionCycle({
  rootDir = process.cwd(),
  objective = 'Autonomous self-evolution safe cleanup',
  mode = 'proposal',
  applyFixes = false,
  runTests = true,
  runBuild = true,
  allowRollback = true,
  ownerApproval = null,
  policy: policyInput = {},
} = {}) {
  const policy = normalizeEvolutionPolicy(policyInput);
  const runId = `evo_${Date.now()}`;
  const d = dirs(rootDir, runId);
  fs.mkdirSync(d.base, { recursive: true });
  let receipt = createEvolutionReceipt({ runId, objective, rootDir: d.receiptRoot });

  const beforeSnapshot = createRepoSnapshot({ rootDir, label: `${runId}_before` });
  writeSnapshot(beforeSnapshot, d.snapshotRoot);
  receipt = updateEvolutionReceipt(runId, { truthState: TRUTH_STATES.SCANNED, beforeSnapshot }, d.receiptRoot);

  const proposal = buildPatchProposal({ runId, objective, rootDir, policy });
  receipt = updateEvolutionReceipt(runId, { truthState: TRUTH_STATES.PROPOSED, proposal, blockedReasons: proposal.blockedReasons || [] }, d.receiptRoot);

  if (mode === 'proposal' || (!applyFixes && mode !== 'sandbox_apply' && mode !== 'proof')) {
    return { success: proposal.blockedReasons.length === 0, runId, truthState: TRUTH_STATES.PROPOSED, proposal, receipt };
  }

  if (proposal.blockedReasons?.length) {
    receipt = updateEvolutionReceipt(runId, { truthState: TRUTH_STATES.BLOCKED, blockedReasons: proposal.blockedReasons }, d.receiptRoot);
    return { success: false, runId, truthState: TRUTH_STATES.BLOCKED, proposal, receipt };
  }

  const workspace = createEvolutionWorkspace({ rootDir, runId, strategy: 'copy' });
  const patch = applyPatchProposal({ workspaceDir: workspace.workspaceDir, proposal, policy });
  receipt = updateEvolutionReceipt(runId, {
    truthState: TRUTH_STATES.PATCHED_IN_SANDBOX,
    workspace,
    changedFiles: patch.changedFiles,
  }, d.receiptRoot);

  if (mode === 'sandbox_apply') {
    return { success: true, runId, truthState: TRUTH_STATES.PATCHED_IN_SANDBOX, workspace, patch, receipt };
  }

  const commands = [];
  if (policy.proofCommands?.includes('node --check promptbridge-server.js')) commands.push('node --check promptbridge-server.js');
  if (runTests && policy.proofCommands?.includes('npm test')) commands.push('npm test');
  if (runBuild && policy.proofCommands?.includes('npm run build')) commands.push('npm run build');
  receipt = updateEvolutionReceipt(runId, { truthState: TRUTH_STATES.PROOF_RUNNING }, d.receiptRoot);
  const proof = await runProofCommands({ workspaceDir: workspace.workspaceDir, commands, receiptDir: d.proofRoot });
  const afterSnapshot = createRepoSnapshot({ rootDir: workspace.workspaceDir, label: `${runId}_after` });
  writeSnapshot(afterSnapshot, d.snapshotRoot);
  const comparison = compareEvolutionRun({ beforeSnapshot, afterSnapshot, proof, proposal });
  const rollbackDecision = shouldRollback({ proof, comparison, policy });

  if (rollbackDecision.required && allowRollback) {
    const rollback = rollbackEvolutionRun({ runId, workspaceDir: workspace.workspaceDir, reason: rollbackDecision.reasons });
    receipt = updateEvolutionReceipt(runId, {
      truthState: TRUTH_STATES.ROLLED_BACK,
      afterSnapshot,
      proof,
      comparison,
      rollback,
    }, d.receiptRoot);
    recordEvolutionOutcome({ receipt });
    return { success: false, runId, truthState: TRUTH_STATES.ROLLED_BACK, proof, comparison, rollback, receipt };
  }

  const passed = proof.passed && isImprovement(comparison);
  const nextState = passed ? TRUTH_STATES.PROOF_PASSED : TRUTH_STATES.PROOF_FAILED;
  receipt = updateEvolutionReceipt(runId, { truthState: nextState, afterSnapshot, proof, comparison }, d.receiptRoot);
  recordEvolutionOutcome({ receipt });
  return { success: passed, runId, truthState: nextState, proof, comparison, receipt };
}

export function getEvolutionStatus({ rootDir = process.cwd() } = {}) {
  const receiptRoot = path.join(rootDir, '.prompthouse-data', 'evolution', 'receipts');
  const receipts = listEvolutionReceipts({ limit: 10, rootDir: receiptRoot });
  return {
    success: true,
    truthState: receipts[0]?.truthState || TRUTH_STATES.NOT_STARTED,
    lastRun: receipts[0] || null,
    recentRuns: receipts,
    policy: DEFAULT_EVOLUTION_POLICY,
  };
}

export function listEvolutionRuns({ rootDir = process.cwd(), limit = 50 } = {}) {
  return listEvolutionReceipts({ limit, rootDir: path.join(rootDir, '.prompthouse-data', 'evolution', 'receipts') });
}

export function getEvolutionRun({ rootDir = process.cwd(), runId } = {}) {
  return readEvolutionReceipt(runId, path.join(rootDir, '.prompthouse-data', 'evolution', 'receipts'));
}
