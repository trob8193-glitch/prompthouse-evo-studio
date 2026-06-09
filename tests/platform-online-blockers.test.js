import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import registerPlatformSentinelRoutes from '../generated_apis/platform_sentinel_routes.js';
import { PlatformReadinessEngine } from '../src/core/platform-sentinel/index.js';

describe('platform online blockers', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('reports required and optional online blockers separately', () => {
    vi.stubEnv('OPENAI_API_KEY', 'sk_test_openai');
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_stripe');
    vi.stubEnv('VERCEL_TOKEN', '');
    vi.stubEnv('DEPLOY_ALLOW_PRODUCTION', 'false');
    vi.stubEnv('GITHUB_TOKEN', '');

    const engine = new PlatformReadinessEngine();
    const blockers = engine.onlineBlockers();
    const ids = blockers.map((item) => item.id);
    const summary = engine.onlineSummary(blockers);

    expect(ids).toContain('stripe-live-revenue');
    expect(ids).toContain('vercel-live-connector');
    expect(ids).toContain('vercel-preview-deploy');
    expect(ids).toContain('vercel-production-deploy');
    expect(ids).toContain('github-live-connector');
    expect(ids).not.toContain('openai-live-connector');
    expect(ids).not.toContain('stripe-test-commerce');
    expect(summary.requiredBlockers).toBe(4);
    expect(summary.optionalBlockers).toBe(1);
    expect(JSON.stringify(blockers)).not.toContain('sk_test_stripe');
  });

  it('clears online blockers when required credentials and production flag are present', () => {
    vi.stubEnv('OPENAI_API_KEY', 'sk_test_openai');
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_live_stripe');
    vi.stubEnv('VERCEL_TOKEN', 'vcp_live_token');
    vi.stubEnv('DEPLOY_ALLOW_PRODUCTION', 'true');
    vi.stubEnv('GITHUB_TOKEN', 'ghp_live_token');

    const engine = new PlatformReadinessEngine();
    const blockers = engine.onlineBlockers();
    const summary = engine.onlineSummary(blockers);

    expect(blockers).toHaveLength(0);
    expect(summary.truthLabel).toBe('ONLINE_READY');
  });

  it('exposes online blockers through Platform Sentinel routes', () => {
    vi.stubEnv('OPENAI_API_KEY', 'sk_test_openai');
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_stripe');
    vi.stubEnv('VERCEL_TOKEN', '');
    vi.stubEnv('DEPLOY_ALLOW_PRODUCTION', 'false');

    const handlers = {};
    const app = {
      get(path, handler) { handlers[`GET ${path}`] = handler; },
      post(path, handler) { handlers[`POST ${path}`] = handler; },
    };
    registerPlatformSentinelRoutes(app);

    const res = {
      body: null,
      json(payload) { this.body = payload; return this; },
      status() { return this; },
    };
    handlers['GET /api/platform-sentinel/online-blockers']({}, res);

    expect(res.body.success).toBe(true);
    expect(res.body.onlineSummary.requiredBlockers).toBeGreaterThan(0);
    expect(res.body.onlineBlockers.some((item) => item.id === 'vercel-preview-deploy')).toBe(true);
  });
});
