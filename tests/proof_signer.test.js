import { describe, expect, it } from 'vitest';
import { createProofManifest, signProofManifest, verifyProofManifest } from '../src/core/proof/ProofManifest.js';
import { runAuditorReview } from '../src/core/agents/AuditorBot.js';

describe('Proof signing', () => {
  it('verifies a signed proof manifest', () => {
    const manifest = signProofManifest(createProofManifest({
      moduleId: 'self-evolution',
      targetStage: 'production',
      maturity: { score: 93, grade: 'A', missing: [] },
      rollbackRef: 'main',
      issues: []
    }));

    const result = verifyProofManifest(manifest);
    expect(result.valid).toBe(true);
  });

  it('detects manifest tampering', () => {
    const manifest = signProofManifest(createProofManifest({
      moduleId: 'self-evolution',
      maturity: { score: 93, grade: 'A', missing: [] },
      issues: []
    }));

    const tampered = { ...manifest, maturityScore: 10 };
    const result = verifyProofManifest(tampered);
    expect(result.valid).toBe(false);
  });

  it('auditor requires a valid signature', () => {
    const manifest = signProofManifest(createProofManifest({
      moduleId: 'self-evolution',
      maturity: { score: 93, grade: 'A', missing: [] },
      issues: []
    }));

    const result = runAuditorReview({
      module: { id: 'self-evolution', score: 93, grade: 'A', missing: [] },
      manifest
    });

    expect(result.approved).toBe(true);
    expect(result.signature.valid).toBe(true);
  });
});
