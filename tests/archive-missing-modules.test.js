import { describe, expect, it } from 'vitest';
import { RecursiveSwarm } from '../src/core/automation/RecursiveSwarm.js';
import { calculateCapabilityGravity, rankCapabilityField } from '../src/core/physics/SovereignPhysics.js';
import { summarizeSovereignIntelligenceLog } from '../src/core/logging/sovereign_intelligence_log.js';

describe('archive compatibility modules', () => {
  it('provides a safe recursive swarm execution surface', async () => {
    const swarm = new RecursiveSwarm({ fetchImpl: null });
    const response = await swarm.execute(['verify bridge', 'train local model']);

    expect(response.success).toBe(true);
    expect(response.results).toHaveLength(2);
    expect(response.results.every((result) => result.status === 'MANIFESTED')).toBe(true);
  });

  it('ranks capability gravity from proof and gate state', () => {
    expect(calculateCapabilityGravity({ proofCount: 2, testsPassed: true, buildPassed: true })).toBe(8);
    expect(rankCapabilityField([
      { id: 'blocked', proofCount: 10, gated: true },
      { id: 'verified', proofCount: 2, testsPassed: true, buildPassed: true },
    ])[0].id).toBe('verified');
  });

  it('summarizes a missing sovereign log as an empty ledger', () => {
    expect(summarizeSovereignIntelligenceLog('missing-log.json')).toMatchObject({
      count: 0,
      latest: null,
    });
  });
});

