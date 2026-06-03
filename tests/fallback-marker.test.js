import { describe, it, expect } from 'vitest';
import { createHonestfallback, HonestFallbackClass } from '../src/core/fallback-marker.js';

describe('fallback-marker', () => {
  describe('createHonestfallback', () => {
    it('creates a fallback with NOT_IMPLEMENTED status', () => {
      const fallback = createHonestfallback('TestModule', 'A test module');
      expect(fallback.status).toBe('NOT_IMPLEMENTED');
      expect(fallback.grade).toBe('fallback');
      expect(fallback.name).toBe('TestModule');
      expect(fallback.implemented).toBe(false);
    });

    it('execute returns success: false with fallback marker', async () => {
      const fallback = createHonestfallback('TestModule');
      const result = await fallback.execute();
      expect(result.success).toBe(false);
      expect(result.fallback).toBe(true);
      expect(result.module).toBe('TestModule');
    });

    it('getStatus returns fallback grade', () => {
      const fallback = createHonestfallback('TestModule', 'desc');
      const status = fallback.getStatus();
      expect(status.grade).toBe('fallback');
      expect(status.state).toBe('NOT_IMPLEMENTED');
      expect(status.resonance).toBe(0);
    });
  });

  describe('HonestFallbackClass', () => {
    it('constructs with correct fields', () => {
      const inst = new HonestFallbackClass('MyClass', 'My description');
      expect(inst.name).toBe('MyClass');
      expect(inst.status).toBe('NOT_IMPLEMENTED');
      expect(inst.iq_baseline).toBe(0);
    });

    it('execute returns fallback result', async () => {
      const inst = new HonestFallbackClass('MyClass');
      const result = await inst.execute({ test: true });
      expect(result.success).toBe(false);
      expect(result.fallback).toBe(true);
    });

    it('can be extended', () => {
      class MyModule extends HonestFallbackClass {
        constructor() { super('MyModule', 'Extended'); }
      }
      const m = new MyModule();
      expect(m.name).toBe('MyModule');
      expect(m.getStatus().grade).toBe('fallback');
    });
  });
});
