import { describe, it, expect } from 'vitest';
import { registerCoreRoutes } from '../server/routes/index.js';
import { createRouteRegistry } from '../server/route-registry.js';
import express from 'express';

describe('Core Routes Registration', () => {
  it('registers all modules and returns summary', () => {
    const app = express();
    const registry = createRouteRegistry();
    const context = { routeRegistry: registry };

    const summary = registerCoreRoutes(app, context);

    expect(summary.failedModules).toHaveLength(0);
    expect(summary.registeredModules).toContain('health');
    expect(summary.registeredModules).toContain('provider');
    expect(summary.registeredModules).toContain('security');
    expect(summary.registeredModules).toContain('diagnostics');

    // It should have registered several routes
    expect(summary.routes.length).toBeGreaterThan(0);
    expect(registry.routes.length).toBeGreaterThan(0);
  });

  it('handles registration failures gracefully', () => {
    const app = express();
    app.get = () => { throw new Error('Intentional Failure'); };
    app.post = () => { throw new Error('Intentional Failure'); };
    
    const context = { routeRegistry: createRouteRegistry() };
    const summary = registerCoreRoutes(app, context);

    expect(summary.failedModules.length).toBe(9);
    expect(summary.registeredModules).toHaveLength(0);
    expect(summary.failedModules[0].error).toBe('Intentional Failure');
  });
});
