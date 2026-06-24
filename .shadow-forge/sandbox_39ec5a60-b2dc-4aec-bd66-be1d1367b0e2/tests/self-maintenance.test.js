import { describe, expect, it } from 'vitest';
import { normalizeEvolutionMarkers } from '../src/core/automation/self_maintenance.js';

describe('self maintenance marker normalization', () => {
  it('removes generated maturity and efficiency markers from user-facing copy', () => {
    const normalized = normalizeEvolutionMarkers(
      "role: 'builder . [Maturity: Level 10] . [Maturity: Level 11]' desc: 'fast . [Efficiency: 80%] . [Efficiency: 90%]'",
    );

    expect(normalized).toBe("role: 'builder' desc: 'fast'");
    expect(normalized).not.toContain('[Maturity: Level');
    expect(normalized).not.toContain('[Efficiency:');
  });
});
