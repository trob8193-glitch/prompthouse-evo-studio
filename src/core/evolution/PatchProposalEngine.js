import { HonestStubClass } from '../stub-marker.js';

/**
 * PatchProposalEngine — Proposes code patches based on detected issues and patterns
 * Status: NOT_IMPLEMENTED (honest stub)
 */
export class PatchProposalEngine extends HonestStubClass {
  constructor() { super('PatchProposalEngine', 'Proposes code patches based on detected issues and patterns'); }
}

export function buildPatchProposal({ runId, objective, rootDir, policy }) {
  return {
    id: runId,
    objective,
    blockedReasons: ['PatchProposalEngine is an Honest Stub'],
    patches: []
  };
}
