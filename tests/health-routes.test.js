import { describe, it, expect } from 'vitest';
import { registerHealthRoutes } from '../server/routes/health.routes.js';
import { TRUTH_STATES } from '../server/services/truth-labels.js';

// Mock Express app
function createMockApp() {
  const routes = {};
  return {
    get(path, ...handlers) {
      routes[path] = handlers;
    },
    _routes: routes,
    _executeGet(path, req, res) {
      const handlers = routes[path];
      if (!handlers) throw new Error(`Route not found: ${path}`);
      // execute last handler (the actual route logic)
      handlers[handlers.length - 1](req, res);
    }
  };
}

describe('Health Routes', () => {
  it('registers all health endpoints', () => {
    const app = createMockApp();
    registerHealthRoutes(app, { routeRegistry: null });
    
    expect(app._routes['/status']).toBeDefined();
    expect(app._routes['/api/bridge/status']).toBeDefined();
    expect(app._routes['/api/backend/health']).toBeDefined();
  });

  it('returns ok status and provider summary without secrets', () => {
    const app = createMockApp();
    registerHealthRoutes(app, { routeRegistry: null });
    
    let responseBody = null;
    const res = {
      json(body) { responseBody = body; }
    };

    app._executeGet('/status', {}, res);

    expect(responseBody).toBeDefined();
    expect(responseBody.ok).toBe(true);
    expect(responseBody.service).toBe('prompthouse-evo-studio-bridge');
    expect(responseBody.timestamp).toBeDefined();
    expect(responseBody.truthState).toBe(TRUTH_STATES.VERIFIED);
    expect(responseBody.providerGates).toBeDefined();

    // Verify secrets are not exposed
    const gatesJson = JSON.stringify(responseBody.providerGates);
    expect(gatesJson).not.toContain(process.env.OPENAI_API_KEY || 'sk-proj');
  });
});
