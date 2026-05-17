import fs from 'fs';
import path from 'path';
import { assertPathAllowed } from './EvolutionPolicy.js';

export function applyPatchProposal({ workspaceDir, proposal, policy = {} } = {}) {
  if (!workspaceDir) throw new Error('workspaceDir is required.');
  if (!proposal || !Array.isArray(proposal.files)) throw new Error('Valid proposal is required.');
  if (proposal.blockedReasons?.length) throw new Error(`Proposal is blocked: ${proposal.blockedReasons.join('; ')}`);

  const changedFiles = [];
  for (const file of proposal.files) {
    const rel = assertPathAllowed(file.path, policy);
    const target = path.join(workspaceDir, rel);
    const before = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : null;

    if (file.operation === 'delete') {
      throw new Error(`Delete operation requires explicit approval and is blocked in PatchApplier: ${rel}`);
    }

    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, file.proposedContent, 'utf8');
    const after = fs.readFileSync(target, 'utf8');
    changedFiles.push({
      path: rel,
      operation: file.operation || 'update',
      beforeLength: before ? before.length : 0,
      afterLength: after.length,
      changed: before !== after,
      reason: file.reason || '',
    });
  }

  return {
    success: true,
    proposalId: proposal.id,
    changedFiles: changedFiles.filter(item => item.changed),
  };
}

export function calculateChangedFiles({ beforeSnapshot, afterSnapshot } = {}) {
  const before = beforeSnapshot?.fileHashes || {};
  const after = afterSnapshot?.fileHashes || {};
  const all = new Set([...Object.keys(before), ...Object.keys(after)]);
  return Array.from(all).filter(file => before[file] !== after[file]).map(file => ({
    path: file,
    beforeHash: before[file] || null,
    afterHash: after[file] || null,
  }));
}

export function createPatchDiff({ workspaceDir, files = [] } = {}) {
  return files.map(file => ({
    path: file.path,
    summary: `${file.operation || 'update'} ${file.path}`,
  }));
}
