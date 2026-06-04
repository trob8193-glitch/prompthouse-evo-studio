import { describe, it, expect } from 'vitest';
import { ConfidenceRadar } from '../src/core/foundry/ConfidenceRadar.js';

describe('ConfidenceRadar', () => {
  it('evaluates text to compute an aggregate confidence score', () => {
    const radar = new ConfidenceRadar();
    const result = radar.evaluate('This is a test to check if the error is caught.');

    expect(result.confidence).toBeDefined();
    expect(result.breakdown).toHaveProperty('accuracy');
    expect(result.breakdown).toHaveProperty('relevance');
    expect(result.breakdown).toHaveProperty('safety');
  });

  it('handles empty input gracefully', () => {
    const radar = new ConfidenceRadar();
    const result = radar.evaluate('');

    expect(result.confidence).toBe(0);
    expect(Object.keys(result.breakdown).length).toBe(0);
  });

  it('getStatus returns active grade', () => {
    const radar = new ConfidenceRadar();
    const status = radar.getStatus();
    expect(status.grade).toBe('A');
    expect(status.state).toBe('ACTIVE');
  });
});
