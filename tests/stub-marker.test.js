import { describe, it, expect } from 'vitest';
import { createHonestStub, HonestStubClass } from '../src/core/stub-marker.js';

describe('stub-marker', () => {
  describe('createHonestStub', () => {
    it('creates a stub with NOT_IMPLEMENTED status', () => {
      const stub = createHonestStub('TestModule', 'A test module');
      expect(stub.status).toBe('NOT_IMPLEMENTED');
      expect(stub.grade).toBe('STUB');
      expect(stub.name).toBe('TestModule');
      expect(stub.implemented).toBe(false);
    });

    it('execute returns success: false with stub marker', async () => {
      const stub = createHonestStub('TestModule');
      const result = await stub.execute();
      expect(result.success).toBe(false);
      expect(result.stub).toBe(true);
      expect(result.module).toBe('TestModule');
    });

    it('getStatus returns STUB grade', () => {
      const stub = createHonestStub('TestModule', 'desc');
      const status = stub.getStatus();
      expect(status.grade).toBe('STUB');
      expect(status.state).toBe('NOT_IMPLEMENTED');
      expect(status.resonance).toBe(0);
    });
  });

  describe('HonestStubClass', () => {
    it('constructs with correct fields', () => {
      const inst = new HonestStubClass('MyClass', 'My description');
      expect(inst.name).toBe('MyClass');
      expect(inst.status).toBe('NOT_IMPLEMENTED');
      expect(inst.iq_baseline).toBe(0);
    });

    it('execute returns stub result', async () => {
      const inst = new HonestStubClass('MyClass');
      const result = await inst.execute({ test: true });
      expect(result.success).toBe(false);
      expect(result.stub).toBe(true);
    });

    it('can be extended', () => {
      class MyModule extends HonestStubClass {
        constructor() { super('MyModule', 'Extended'); }
      }
      const m = new MyModule();
      expect(m.name).toBe('MyModule');
      expect(m.getStatus().grade).toBe('STUB');
    });
  });
});
