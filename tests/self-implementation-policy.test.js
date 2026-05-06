import { describe, expect, it } from 'vitest';
import {
  createSelfImplementationState,
  resolveSelfImplementationCapabilities,
  summarizeSelfImplementationCapabilities,
} from '../src/self-implementation-policy.js';

describe('Self implementation policy', () => {
  it('activates local capabilities when files and endpoints are present', () => {
    const capabilities = resolveSelfImplementationCapabilities({
      availableFiles: [
        'promptbridge-server.js',
        'src/core/automation/self_maintenance.js',
        'src/core/automation/SelfHealer.js',
        'src/core/automation/ShadowRunner.js',
        'src/core/automation/AsyncQueue.js',
        'src/autonomous-builder.js',
        'src/autonomous-views.jsx',
        'src/nightforge.js',
        'package.json',
        'tests/past-mvp.test.js',
        'src/project-handshake.js',
      ],
      availableEndpoints: [
        'GET /status',
        'POST /build',
        'GET /api/browser-bridge/proof',
        'POST /api/browser-bridge/proof',
        'GET /api/project-handshake',
        'POST /api/project-handshake',
        'GET /buildkit/manifest',
        'POST /buildkit/materialize',
      ],
      env: {},
    });

    expect(capabilities.find((item) => item.id === 'self_maintenance').status).toBe('active');
    expect(capabilities.find((item) => item.id === 'autonomous_builder').status).toBe('active');
    expect(capabilities.find((item) => item.id === 'production_deploy').status).toBe('gated');
    expect(capabilities.find((item) => item.id === 'live_commerce').status).toBe('gated');
  });

  it('keeps external actions gated without env keys and owner approval', () => {
    const capabilities = resolveSelfImplementationCapabilities({
      env: { VERCEL_TOKEN: 'configured', STRIPE_SECRET_KEY: 'configured' },
    });

    expect(capabilities.find((item) => item.id === 'production_deploy').status).toBe('gated');
    expect(capabilities.find((item) => item.id === 'live_commerce').status).toBe('gated');
  });

  it('creates a no-delete activation state with proof policy', () => {
    const capabilities = resolveSelfImplementationCapabilities();
    const state = createSelfImplementationState({ capabilities });
    const summary = summarizeSelfImplementationCapabilities(capabilities);

    expect(state.active).toBe(true);
    expect(state.policies.noDelete).toBe(true);
    expect(state.policies.proofRequiredForCompleteClaim).toBe(true);
    expect(state.summary.total).toBe(summary.total);
  });
});
