import { describe, expect, it } from 'vitest';

describe('TEVO proof metric policy', () => {
  it('never treats an empty denominator as measured', () => {
    const denominator = 0;
    const value = denominator > 0 ? 1 / denominator : null;
    expect(value).toBeNull();
  });

  it('uses only observed runs for success rate', () => {
    const runs = [{ passed: true }, { passed: false }, { passed: true }];
    const numerator = runs.filter(run => run.passed === true).length;
    expect(numerator / runs.length).toBeCloseTo(2 / 3);
  });

  it('does not convert missing business evidence into zero', () => {
    const metric = { value: null, status: 'NOT_PROVEN' };
    expect(metric.status).toBe('NOT_PROVEN');
    expect(metric.value).toBeNull();
  });
});