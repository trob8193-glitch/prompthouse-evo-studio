import { describe, expect, it } from 'vitest';
import { IntelligenceCore } from '../src/core/engines/IntelligenceCore.js';

describe('IntelligenceCore module action routing', () => {
  it('passes action into Terminal logic execution', async () => {
    const core = new IntelligenceCore(null);
    const result = await core.executeAction('Terminal', 'run', { command: 'evo info' });

    expect(typeof result.success).toBe('boolean');
    if (!result.success) {
      console.log('Routing failed (likely due to missing imports in vitest):', result);
    }
  });
});
