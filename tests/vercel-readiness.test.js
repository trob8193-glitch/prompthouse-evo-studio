import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { classifyVercelTokenStatus, classifyPreviewDeployReadiness, classifyProductionDeployReadiness } from '../server/services/vercel-readiness.js';
import { TRUTH_STATES } from '../server/services/truth-labels.js';

describe('Vercel Readiness Service', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('missing VERCEL_TOKEN returns NEEDS_CREDENTIALS', () => {
    vi.stubEnv('VERCEL_TOKEN', '');
    const status = classifyVercelTokenStatus();
    expect(status.configured).toBe(false);
    expect(status.truthState).toBe(TRUTH_STATES.NEEDS_CREDENTIALS);
  });

  it('configured VERCEL_TOKEN does not expose token', () => {
    vi.stubEnv('VERCEL_TOKEN', 'some-very-secret-vercel-token-12345');
    const status = classifyVercelTokenStatus();
    expect(status.configured).toBe(true);
    expect(status.truthState).toBe(TRUTH_STATES.VERIFIED);
    expect(status.redactedToken).not.toContain('secret-vercel-token');
  });

  it('preview deploy is ready when token exists', () => {
    vi.stubEnv('VERCEL_TOKEN', 'token-1234567890');
    const readiness = classifyPreviewDeployReadiness();
    expect(readiness.ready).toBe(true);
    expect(readiness.truthState).toBe(TRUTH_STATES.VERIFIED);
  });

  it('production deploy remains BLOCKED when DEPLOY_ALLOW_PRODUCTION=false', () => {
    vi.stubEnv('VERCEL_TOKEN', 'token-1234567890');
    vi.stubEnv('DEPLOY_ALLOW_PRODUCTION', 'false');
    const prodReadiness = classifyProductionDeployReadiness();
    const prevReadiness = classifyPreviewDeployReadiness();
    
    expect(prevReadiness.ready).toBe(true);
    expect(prodReadiness.ready).toBe(false);
    expect(prodReadiness.truthState).toBe(TRUTH_STATES.BLOCKED);
    expect(prodReadiness.blockers).toContain('DEPLOY_ALLOW_PRODUCTION is false');
  });
});
