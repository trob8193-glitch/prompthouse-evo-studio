import { describe, it, expect } from 'vitest';
import {
  createPromptHouseApp,
  configureCorsOptions,
  createBridgeContext
} from '../server/app-shell.js';

describe('Backend App Shell', () => {
  describe('createPromptHouseApp', () => {
    it('creates an Express app instance', () => {
      const app = createPromptHouseApp();
      expect(app).toBeDefined();
      expect(typeof app.use).toBe('function');
      expect(typeof app.get).toBe('function');
    });

    it('does not require provider credentials', () => {
      const originalEnv = { ...process.env };
      delete process.env.OPENAI_API_KEY;
      delete process.env.STRIPE_SECRET_KEY;
      const app = createPromptHouseApp();
      expect(app).toBeDefined();
      process.env = originalEnv;
    });
  });

  describe('configureCorsOptions', () => {
    it('allows requests without origin', () => {
      const options = configureCorsOptions({ corsOrigins: ['http://localhost:3000'] });
      options.origin(null, (err, allow) => {
        expect(err).toBeNull();
        expect(allow).toBe(true);
      });
    });

    it('allows configured origins', () => {
      const options = configureCorsOptions({ corsOrigins: ['http://localhost:3000'] });
      options.origin('http://localhost:3000', (err, allow) => {
        expect(err).toBeNull();
        expect(allow).toBe(true);
      });
    });

    it('blocks unconfigured origins', () => {
      const options = configureCorsOptions({ corsOrigins: ['http://localhost:3000'] });
      options.origin('http://evil.com', (err, allow) => {
        expect(err).toBeInstanceOf(Error);
        expect(allow).toBeUndefined();
      });
    });

    it('falls back to broad open if no explicit origins during dev', () => {
      const options = configureCorsOptions({ corsOrigins: [] });
      options.origin('http://any.com', (err, allow) => {
        expect(err).toBeNull();
        expect(allow).toBe(true);
      });
    });
  });

  describe('createBridgeContext', () => {
    it('initializes context with defaults', () => {
      const ctx = createBridgeContext();
      expect(ctx.dataDir).toBe(process.cwd());
      expect(ctx.sandboxDir).toBe(process.cwd());
      expect(ctx.providerGates).toBeDefined();
      expect(ctx.receiptService).toBeDefined();
      expect(ctx.routeRegistry).toBeNull();
    });

    it('accepts options overrides', () => {
      const ctx = createBridgeContext({ dataDir: '/tmp/data', routeRegistry: { routes: [] } });
      expect(ctx.dataDir).toBe('/tmp/data');
      expect(ctx.routeRegistry.routes).toEqual([]);
    });
  });
});
