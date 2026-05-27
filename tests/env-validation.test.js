import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Test the env-validation service by manipulating process.env directly
const originalEnv = { ...process.env };

describe('Env Validation Service', () => {
  let mod;

  beforeEach(async () => {
    // Reset env
    process.env = { ...originalEnv };
    // Fresh import each time to avoid module caching
    vi.resetModules();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('missing JWT_SECRET returns NEEDS_CREDENTIALS', async () => {
    delete process.env.JWT_SECRET;
    delete process.env.PH_EVO_MASTER_KEY;
    mod = await import('../server/services/env-validation.js');
    const result = mod.classifyEnvReadiness();
    expect(['NEEDS_CREDENTIALS', 'BLOCKED']).toContain(result.truthState);
    expect(result.blockers.length).toBeGreaterThan(0);
  });

  it('short JWT_SECRET is invalid', async () => {
    process.env.JWT_SECRET = 'short';
    process.env.PH_EVO_MASTER_KEY = 'also_short';
    mod = await import('../server/services/env-validation.js');
    const result = mod.validateSecretLength('JWT_SECRET', 24);
    expect(result.configured).toBe(true);
    expect(result.lengthValid).toBe(false);
  });

  it('valid JWT_SECRET is lengthValid true', async () => {
    process.env.JWT_SECRET = 'a'.repeat(48);
    process.env.PH_EVO_MASTER_KEY = 'b'.repeat(48);
    mod = await import('../server/services/env-validation.js');
    const result = mod.validateSecretLength('JWT_SECRET', 24);
    expect(result.configured).toBe(true);
    expect(result.lengthValid).toBe(true);
  });

  it('raw secret values are not returned in getSafeEnvSummary', async () => {
    process.env.JWT_SECRET = 'supersecret_value_that_should_never_appear';
    process.env.PH_EVO_MASTER_KEY = 'master_key_value_that_should_never_appear';
    process.env.CORS_ORIGINS = 'http://localhost:5173';
    process.env.VITE_BRIDGE_URL = 'http://127.0.0.1:3001';
    process.env.DEPLOY_TARGET = 'local';
    process.env.DEPLOY_ALLOW_PRODUCTION = 'false';
    mod = await import('../server/services/env-validation.js');
    const summary = mod.getSafeEnvSummary();
    const json = JSON.stringify(summary);
    expect(json).not.toContain('supersecret_value_that_should_never_appear');
    expect(json).not.toContain('master_key_value_that_should_never_appear');
  });

  it('DEPLOY_ALLOW_PRODUCTION=false blocks production deploy classification', async () => {
    process.env.JWT_SECRET = 'a'.repeat(48);
    process.env.PH_EVO_MASTER_KEY = 'b'.repeat(48);
    process.env.CORS_ORIGINS = 'http://localhost:5173';
    process.env.VITE_BRIDGE_URL = 'http://127.0.0.1:3001';
    process.env.DEPLOY_TARGET = 'local';
    process.env.DEPLOY_ALLOW_PRODUCTION = 'false';
    mod = await import('../server/services/env-validation.js');
    const summary = mod.getSafeEnvSummary();
    expect(summary.productionAllowed).toBe(false);
    const readiness = mod.classifyEnvReadiness();
    expect(readiness.truthState).toBe('VERIFIED');
    expect(readiness.blockers).toHaveLength(0);
  });

  it('local mode can be VERIFIED without Vercel token', async () => {
    process.env.JWT_SECRET = 'a'.repeat(48);
    process.env.PH_EVO_MASTER_KEY = 'b'.repeat(48);
    process.env.CORS_ORIGINS = 'http://localhost:5173';
    process.env.VITE_BRIDGE_URL = 'http://127.0.0.1:3001';
    process.env.DEPLOY_TARGET = 'local';
    process.env.DEPLOY_ALLOW_PRODUCTION = 'false';
    delete process.env.VERCEL_TOKEN;
    mod = await import('../server/services/env-validation.js');
    const readiness = mod.classifyEnvReadiness();
    expect(readiness.truthState).toBe('VERIFIED');
  });
});
