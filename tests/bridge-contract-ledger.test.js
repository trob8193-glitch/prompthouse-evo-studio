import { describe, expect, it } from 'vitest';
import { buildBridgeContractLedger, findRouteContract, resolveRouteContract } from '../src/bridge-contract-ledger.js';

describe('bridge contract ledger', () => {
  it('discovers core bridge routes and reports numeric route drift', () => {
    const ledger = buildBridgeContractLedger({ rootDir: process.cwd() });

    expect(typeof ledger.summary.notImplemented).toBe('number');
    expect(ledger.summary.notImplemented).toBeGreaterThanOrEqual(0);
    expect(findRouteContract('/status', ledger.routes)?.status).toBe('supported');
    expect(findRouteContract('/api/metrics', ledger.routes)?.status).toBe('supported');
  });

  it('treats blocked policy routes as blocked contracts', () => {
    const ledger = buildBridgeContractLedger({ rootDir: process.cwd() });

    expect(findRouteContract('/api/git/commit', ledger.routes)?.status).toBe('blocked');
    expect(findRouteContract('/api/git/revert', ledger.routes)?.status).toBe('blocked');
  });

  it('resolves blocked policy routes even when they were not discovered from frontend fetch calls', () => {
    const ledger = buildBridgeContractLedger({ rootDir: process.cwd() });

    const contract = resolveRouteContract('/merge/test-case', ledger.routes);

    expect(contract?.status).toBe('blocked');
    expect(contract?.route).toBe('/merge/test-case');
  });

  it('keeps dangerous git mutation routes blocked even if the bridge registers a handler', () => {
    const ledger = buildBridgeContractLedger({ rootDir: process.cwd() });

    expect(resolveRouteContract('/api/git/commit', ledger.routes)?.status).toBe('blocked');
    expect(resolveRouteContract('/api/git/revert', ledger.routes)?.status).toBe('blocked');
  });

  it('resolves auth, commerce, and proof routes as supported', () => {
    const ledger = buildBridgeContractLedger({ rootDir: process.cwd() });

    expect(resolveRouteContract('/api/auth/register', ledger.routes)?.status).toBe('supported');
    expect(resolveRouteContract('/api/auth/login', ledger.routes)?.status).toBe('supported');
    expect(resolveRouteContract('/api/auth/me', ledger.routes)?.status).toBe('supported');
    expect(resolveRouteContract('/api/auth/logout', ledger.routes)?.status).toBe('supported');
    expect(resolveRouteContract('/api/commerce/checkout', ledger.routes)?.status).toBe('supported');
    expect(resolveRouteContract('/api/studio-os/proof/intercept', ledger.routes)?.status).toBe('supported');
  });
});
