import { describe, it, expect } from 'vitest';
import {
  createRouteRegistry,
  registerRoute,
  listRegisteredRoutes,
  findRoute,
  classifyRegisteredRoutes,
  compareRegisteredRoutesToReadmeClaims,
  createRegisteredRouteMiddleware
} from '../server/route-registry.js';
import { TRUTH_STATES } from '../server/services/truth-labels.js';

describe('Route Registry', () => {
  it('creates an empty registry', () => {
    const registry = createRouteRegistry();
    expect(registry.routes).toEqual([]);
  });

  it('registers a route with defaults', () => {
    const registry = createRouteRegistry();
    registerRoute(registry, { path: '/test' });
    const routes = listRegisteredRoutes(registry);
    expect(routes).toHaveLength(1);
    expect(routes[0].method).toBe('GET');
    expect(routes[0].truthState).toBe(TRUTH_STATES.UNKNOWN);
  });

  it('finds a registered route', () => {
    const registry = createRouteRegistry();
    registerRoute(registry, { method: 'POST', path: '/test-post' });
    const route = findRoute(registry, 'POST', '/test-post');
    expect(route).toBeDefined();
    expect(route.path).toBe('/test-post');
  });

  it('classifies registered routes', () => {
    const registry = createRouteRegistry();
    registerRoute(registry, { path: '/1', localOnly: true });
    registerRoute(registry, { path: '/2', providerGated: true });
    registerRoute(registry, { path: '/3', ownerApprovalRequired: true });
    
    const classification = classifyRegisteredRoutes(registry);
    expect(classification.total).toBe(3);
    expect(classification.localOnly).toBe(1);
    expect(classification.providerGated).toBe(1);
    expect(classification.ownerApprovalRequired).toBe(1);
  });

  it('compares to README claims', () => {
    const registry = createRouteRegistry();
    registerRoute(registry, { path: '/api/exists' });
    registerRoute(registry, { path: '/api/connectors/:id' });

    const readme = `
      Here are the endpoints:
      - \`/api/exists\`
      - \`/api/missing\`
      - \`/api/connectors/:id\`
    `;

    const result = compareRegisteredRoutesToReadmeClaims(registry, readme);
    expect(result.documentedCount).toBe(3);
    expect(result.missing).toHaveLength(1);
    expect(result.missing[0].path).toBe('/api/missing');
    expect(result.missing[0].truthState).toBe(TRUTH_STATES.BLOCKED);
  });

  it('creates middleware that registers route and decorates request', () => {
    const registry = createRouteRegistry();
    const middleware = createRegisteredRouteMiddleware(registry, { path: '/api/mid' });
    
    expect(registry.routes).toHaveLength(1);
    expect(registry.routes[0].path).toBe('/api/mid');

    const req = {};
    const next = () => {};
    middleware(req, null, next);
    expect(req._registeredRoute).toBeDefined();
    expect(req._registeredRoute.path).toBe('/api/mid');
  });
});
