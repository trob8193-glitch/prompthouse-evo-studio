import { describe, it, expect } from 'vitest';
import { SeedSower } from '../src/core/knowledge/SeedSower.js';

describe('SeedSower', () => {
  it('sows a single pattern', () => {
    const sower = new SeedSower();
    const pattern = { id: 'pattern_123', confidenceScore: 85 };
    
    const seed = sower.sowPattern(pattern);
    
    expect(seed).toBeDefined();
    expect(seed.id).toBe('seed_pattern_123');
    expect(seed.growthScore).toBe(85);
    expect(sower.getPlantedSeeds().length).toBe(1);
  });

  it('batch sows multiple patterns', () => {
    const sower = new SeedSower();
    const patterns = [
      { id: 'p1', confidenceScore: 50 },
      { id: 'p2', confidenceScore: 90 }
    ];
    
    const count = sower.batchSow(patterns);
    
    expect(count).toBe(2);
    expect(sower.getPlantedSeeds().length).toBe(2);
  });

  it('getStatus returns active grade', () => {
    const sower = new SeedSower();
    const status = sower.getStatus();
    expect(status.grade).toBe('A');
    expect(status.state).toBe('ACTIVE');
  });
});
