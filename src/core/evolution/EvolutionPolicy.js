import path from 'path';
import { PolicyViolationError } from './SelfEvolutionErrors.js';

export const TRUTH_STATES = Object.freeze({
  NOT_STARTED: 'NOT_STARTED',
  SCANNED: 'SCANNED',
  PROPOSED: 'PROPOSED',
  PATCHED_IN_SANDBOX: 'PATCHED_IN_SANDBOX',
  PROOF_RUNNING: 'PROOF_RUNNING',
  PROOF_PASSED: 'PROOF_PASSED',
  PROOF_FAILED: 'PROOF_FAILED',
  ROLLED_BACK: 'ROLLED_BACK',
  BLOCKED: 'BLOCKED',
  OWNER_APPROVAL_REQUIRED: 'OWNER_APPROVAL_REQUIRED',
  APPROVED: 'APPROVED',
  MERGED: 'MERGED',
  REJECTED: 'REJECTED',
});

export const DEFAULT_EVOLUTION_POLICY = Object.freeze({
  allowDirectMainMutation: false,
  requireOwnerApprovalForMerge: true,
  requireOwnerApprovalForHighRisk: true,
  requireOwnerApprovalForDeletes: true,
  requireOwnerApprovalForDeploy: true,
  requireOwnerApprovalForCommerce: true,
  allowPatchOutsideRepoRoot: false,
  allowEnvMutation: false,
  allowNodeModulesMutation: false,
  allowLockfileMutation: false,
  maxFilesPerPatch: 8,
  allowedExtensions: ['.js', '.jsx', '.ts', '.tsx', '.json', '.md', '.css'],
  forbiddenPaths: [
    '.env', '.env.local', '.env.production', '.env.development',
    'node_modules', '.git', '.vercel', 'prompthouse.db', 'package-lock.json',
  ],
  proofCommands: [
    'node --check promptbridge-server.js',
    'npm test',
    'npm run build',
  ],
});

export function normalizeEvolutionPolicy(policy = {}) {
  return {
    ...DEFAULT_EVOLUTION_POLICY,
    ...policy,
    allowedExtensions: policy.allowedExtensions || DEFAULT_EVOLUTION_POLICY.allowedExtensions,
    forbiddenPaths: policy.forbiddenPaths || DEFAULT_EVOLUTION_POLICY.forbiddenPaths,
    proofCommands: policy.proofCommands || DEFAULT_EVOLUTION_POLICY.proofCommands,
  };
}

function normalizeRepoRelative(inputPath = '') {
  return String(inputPath).replace(/\\/g, '/').replace(/^\.\//, '').trim();
}

export function assertPathAllowed(filePath, policyInput = {}) {
  const policy = normalizeEvolutionPolicy(policyInput);
  const normalized = normalizeRepoRelative(filePath);
  if (!normalized) throw new PolicyViolationError('Missing patch file path.');
  if (path.isAbsolute(normalized) || normalized.includes('..')) {
    throw new PolicyViolationError(`Path is not repo-relative: ${filePath}`, { filePath });
  }
  const parts = normalized.split('/');
  for (const forbidden of policy.forbiddenPaths) {
    const f = normalizeRepoRelative(forbidden);
    if (normalized === f || normalized.startsWith(`${f}/`) || parts.includes(f)) {
      throw new PolicyViolationError(`Forbidden path mutation blocked: ${normalized}`, { filePath: normalized, forbidden: f });
    }
  }
  if (!policy.allowEnvMutation && parts.some(part => part.startsWith('.env'))) {
    throw new PolicyViolationError(`Environment file mutation blocked: ${normalized}`, { filePath: normalized });
  }
  if (!policy.allowNodeModulesMutation && parts.includes('node_modules')) {
    throw new PolicyViolationError(`node_modules mutation blocked: ${normalized}`, { filePath: normalized });
  }
  if (!policy.allowLockfileMutation && /(^|\/)(package-lock|pnpm-lock|yarn\.lock)/.test(normalized)) {
    throw new PolicyViolationError(`Lockfile mutation blocked: ${normalized}`, { filePath: normalized });
  }
  const ext = path.extname(normalized);
  if (!policy.allowedExtensions.includes(ext)) {
    throw new PolicyViolationError(`File extension is not allowed for autonomous patching: ${normalized}`, { filePath: normalized, ext });
  }
  return normalized;
}

export function requiresOwnerApproval(changeSet = {}, policyInput = {}) {
  const policy = normalizeEvolutionPolicy(policyInput);
  const files = changeSet.files || changeSet.changedFiles || [];
  const risk = changeSet.risk || 'MEDIUM';
  const normalizedFiles = files.map(file => typeof file === 'string' ? file : file.path).filter(Boolean);
  const sensitive = normalizedFiles.some(file => /(auth|stripe|billing|commerce|vercel|deploy|database|schema|owner-approval|self-evolution|EvolutionPolicy|agent|permission)/i.test(file));
  const deletes = (changeSet.files || []).some(file => file.operation === 'delete');
  return Boolean(
    policy.requireOwnerApprovalForMerge ||
    (policy.requireOwnerApprovalForHighRisk && ['HIGH', 'CRITICAL'].includes(risk)) ||
    (policy.requireOwnerApprovalForDeletes && deletes) ||
    sensitive
  );
}

export function assertOwnerApproval(approval = {}, scope = 'self_evolution_merge') {
  if (!approval || approval.granted !== true || approval.scope !== scope || !approval.receiptId) {
    throw new PolicyViolationError(`Missing explicit owner approval for scope: ${scope}`, { scope });
  }
  return true;
}
