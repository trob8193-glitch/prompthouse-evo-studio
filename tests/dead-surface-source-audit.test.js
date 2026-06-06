import { describe, expect, it } from 'vitest';
import { auditDeadSurfaces } from '../scripts/dead-surface-audit.mjs';

describe('source dead surface audit', () => {
  it('keeps shipped source free of inert buttons and disconnected links', () => {
    const report = auditDeadSurfaces({ rootDir: process.cwd() });
    expect(report.violations).toEqual([]);
    expect(report.truthState).toBe('DEAD_SURFACES_CLEAR');
  });
});
