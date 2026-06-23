import { describe, expect, it } from 'vitest';
import { evaluatePromotionPolicy } from '../src/core/proof/PromotionPolicy.js';
import { detectPromptTraits, comparePromptTraits } from '../src/core/evolution/TraitTracker.js';

const matureSelfEvolutionModule = {
  id: 'self-evolution',
  name: 'Self-Evolution Engine',
  score: 93,
  grade: 'A',
  missing: []
};

describe('Self-Evolution review policy', () => {
  it('requires rollback reference for production review', () => {
    const result = evaluatePromotionPolicy({
      module: matureSelfEvolutionModule,
      targetStage: 'production'
    });

    expect(result.approved).toBe(false);
    expect(result.issues.join(' ')).toContain('rollback reference');
  });

  it('approves production review when maturity and rollback evidence are present', () => {
    const result = evaluatePromotionPolicy({
      module: matureSelfEvolutionModule,
      targetStage: 'production',
      rollbackRef: 'main'
    });

    expect(result.approved).toBe(true);
    expect(result.issues).toEqual([]);
  });
});

describe('Self-Evolution trait tracking', () => {
  it('detects production-relevant prompt traits', () => {
    const traits = detectPromptTraits('Act as a verifier. Return JSON keys and proof receipts using tools.');
    expect(traits.persona).toBe(true);
    expect(traits.jsonSchema).toBe(true);
    expect(traits.proof).toBe(true);
    expect(traits.tools).toBe(true);
  });

  it('records likely helpful traits when a prompt score improves', () => {
    const oldTraits = detectPromptTraits('Answer directly.');
    const newTraits = detectPromptTraits('Act as a verifier. Return JSON keys with proof receipt.');
    
    const report = comparePromptTraits(oldTraits, newTraits);

    expect(report.delta).toBe(3); // Expecting gaining persona, jsonSchema, proof traits, which is 3 traits
    expect(report.likelyHelpfulTraits.length).toBeGreaterThan(0);
  });
});
