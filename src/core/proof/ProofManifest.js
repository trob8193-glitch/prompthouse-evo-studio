export const PROOF_MANIFEST_SCHEMA_VERSION = '1.0.0';

export function createProofManifest(input = {}) {
  const issues = Array.isArray(input.issues) ? input.issues.filter(Boolean) : [];
  return {
    schemaVersion: PROOF_MANIFEST_SCHEMA_VERSION,
    id: `proof_${Date.now()}`,
    moduleId: input.moduleId || 'unknown',
    targetStage: input.targetStage || 'production',
    createdAt: new Date().toISOString(),
    approved: issues.length === 0,
    maturityScore: input.maturity?.score ?? 0,
    maturityGrade: input.maturity?.grade ?? 'F',
    issues
  };
}
