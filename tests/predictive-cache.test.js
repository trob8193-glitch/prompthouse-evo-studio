import { describe, it, expect } from 'vitest';
import { PredictiveCache } from '../src/core/memory/PredictiveCache.js';

describe('PredictiveCache', () => {
  it('stores and retrieves values', () => {
    const cache = new PredictiveCache();
    cache.set('model_response', { text: 'Hello world' }, 60);

    const val = cache.get('model_response');
    expect(val.text).toBe('Hello world');
  });

  it('returns null for missing keys', () => {
    const cache = new PredictiveCache();
    expect(cache.get('nonexistent')).toBeNull();
  });

  it('expires entries after TTL', () => {
    const cache = new PredictiveCache();
    // Set with negative TTL (already expired)
    cache.set('stale', 'old_data', -1);

    const val = cache.get('stale');
    expect(val).toBeNull();
  });

  it('clearExpired removes stale entries', () => {
    const cache = new PredictiveCache();
    cache.set('fresh', 'keep', 3600);
    cache.set('stale', 'remove', -1);

    const cleared = cache.clearExpired();
    expect(cleared).toBe(1);
    expect(cache.get('fresh')).toBe('keep');
  });

  it('getStatus returns active grade', () => {
    const cache = new PredictiveCache();
    const status = cache.getStatus();
    expect(status.grade).toBe('A');
    expect(status.state).toBe('ACTIVE');
  });
});
