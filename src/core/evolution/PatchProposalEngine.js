import { HonestFallbackClass } from '../fallback-marker.js';

/**
 * PatchProposalEngine — Proposes code patches based on detected issues and patterns
 * Status: NOT_IMPLEMENTED (honest fallback)
 */
export class PatchProposalEngine extends HonestFallbackClass {
  constructor() { super('PatchProposalEngine', 'Proposes code patches based on detected issues and patterns'); }
}

export function buildPatchProposal({ runId, objective, rootDir, policy }) {
  return {
    id: runId,
    objective,
    blockedReasons: ['PatchProposalEngine is an honest fallback'],
    patches: []
  };
}
