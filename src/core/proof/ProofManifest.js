import { signProofObject, verifyProofSignature } from './ProofSigner.js';

export const PROOF_MANIFEST_SCHEMA_VERSION = '1.0.0';

export function createProofManifest(input = {}) {
  const issues = Array.isArray(input.issues) ? input.issues.filter(Boolean) : [];
  return {
    schemaVersion: PROOF_MANIFEST_SCHEMA_VERSION,
    id: `proof_${String(input.moduleId || 'unknown').replace(/[^a-z0-9_-]/gi, '_')}_${Date.now()}`,
    moduleId: input.moduleId || 'unknown',
    targetStage: input.targetStage || 'production',
    createdAt: new Date().toISOString(),
    approved: issues.length === 0,
    truthState: issues.length ? 'PROOF_MANIFEST_REVIEW_REQUIRED' : 'PROOF_MANIFEST_READY',
    maturityScore: input.maturity?.score ?? 0,
    maturityGrade: input.maturity?.grade ?? 'F',
    missingChecks: input.maturity?.missing ?? [],
    maturityReceipt: input.maturityReceipt || null,
    costGate: input.costGate || null,
    costVelocity: input.costVelocity || null,
    auditor: input.auditor || null,
    rollbackRef: input.rollbackRef || null,
    evidence: input.evidence || {},
    issues
  };
}

export function signProofManifest(manifest, options = {}) {
  return signProofObject(manifest, { signedBy: options.signedBy || 'gatekeeper' });
}

export function verifyProofManifest(manifest) {
  return verifyProofSignature(manifest);
}
