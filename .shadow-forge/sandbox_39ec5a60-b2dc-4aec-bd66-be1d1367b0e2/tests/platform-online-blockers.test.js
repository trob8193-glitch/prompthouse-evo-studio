import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import registerPlatformSentinelRoutes from '../generated_apis/platform_sentinel_routes.js';
import { PlatformReadinessEngine } from '../src/core/platform-sentinel/index.js';

vi.mock('../src/core/evolution/OnlineLearningManager.js', () => {
  return {
    OnlineLearningManager: class {
      ingestKnowledgeChunk() { return Promise.resolve(true); }
      searchContext() { return []; }
    }
  };
});

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
    vi.stubEnv('PH_EVO_API_KEY', 'mock_ph_evo_api_key');

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
  }, 30000);

  it('clears online blockers when required credentials and production flag are present', () => {
    vi.stubEnv('OPENAI_API_KEY', 'sk_test_openai');
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_live_stripe');
    vi.stubEnv('VERCEL_TOKEN', 'vcp_live_token');
    vi.stubEnv('DEPLOY_ALLOW_PRODUCTION', 'true');
    vi.stubEnv('GITHUB_TOKEN', 'ghp_live_token');
    vi.stubEnv('PH_EVO_API_KEY', 'mock_ph_evo_api_key');

    const engine = new PlatformReadinessEngine();
    const blockers = engine.onlineBlockers();
    const summary = engine.onlineSummary(blockers);

    expect(blockers).toHaveLength(0);
    expect(summary.truthLabel).toBe('ONLINE_READY');
  }, 30000);

  it('exposes online blockers through Platform Sentinel routes', () => {
    vi.stubEnv('OPENAI_API_KEY', 'sk_test_openai');
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_stripe');
    vi.stubEnv('VERCEL_TOKEN', '');
    vi.stubEnv('DEPLOY_ALLOW_PRODUCTION', 'false');
    vi.stubEnv('PH_EVO_API_KEY', 'mock_ph_evo_api_key');

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
  }, 30000);

  it('reports Ollama local server offline blocker when mock offline is true', () => {
    vi.stubEnv('SIMULATE_OLLAMA_OFFLINE', 'true');
    vi.stubEnv('PH_EVO_API_KEY', 'mock_ph_evo_api_key');
    const engine = new PlatformReadinessEngine();
    const blockers = engine.onlineBlockers();
    expect(blockers.some(b => b.id === 'ollama-local-server')).toBe(true);
  }, 30000);

  it('reports Evo API credentials blocker when key is missing', () => {
    vi.stubEnv('PH_EVO_API_KEY', '');
    vi.stubEnv('PH_EVO_MASTER_KEY', '');
    const engine = new PlatformReadinessEngine();
    const blockers = engine.onlineBlockers();
    expect(blockers.some(b => b.id === 'evo-api-credentials')).toBe(true);
  }, 30000);

  it('reports Evo API connectivity blocker when mock offline is true', () => {
    vi.stubEnv('PH_EVO_API_KEY', 'mock_ph_evo_api_key');
    vi.stubEnv('SIMULATE_EVO_OFFLINE', 'true');
    const engine = new PlatformReadinessEngine();
    const blockers = engine.onlineBlockers();
    expect(blockers.some(b => b.id === 'evo-api-connectivity')).toBe(true);
  }, 30000);
});

