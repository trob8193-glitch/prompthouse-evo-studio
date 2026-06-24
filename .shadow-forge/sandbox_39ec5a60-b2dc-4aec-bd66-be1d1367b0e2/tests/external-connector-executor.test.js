import { describe, expect, it, vi } from 'vitest';

import {
  CONNECTOR_TRUTH,
  buildConnectorProbePlan,
  executeConnectorProbe,
} from '../lib/connectors/externalConnectorExecutor.js';

const githubConnector = {
  id: 'conn_github',
  name: 'GitHub',
  connector_id: 'github-1',
  type: 'github',
  status: 'connected',
};

describe('external connector executor', () => {
  it('keeps local connector checks local-only and does not call providers', async () => {
    const fetchImpl = vi.fn();
    const result = await executeConnectorProbe(githubConnector, { mode: 'local', fetchImpl });

    expect(result.status).toBe('connected');
    expect(result.truthState).toBe(CONNECTOR_TRUTH.LOCAL_ONLY);
    expect(result.external).toBe(false);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('reports missing live credentials without a provider call', async () => {
    const fetchImpl = vi.fn();
    const result = await executeConnectorProbe(githubConnector, {
      mode: 'live',
      env: {},
      ownerApproval: { granted: true, scope: 'provider_probe' },
      fetchImpl,
    });

    expect(result.status).toBe('blocked');
    expect(result.truthState).toBe(CONNECTOR_TRUTH.NEEDS_CREDENTIALS);
    expect(result.requiredEnvKey).toBe('GITHUB_TOKEN');
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('requires the correct owner approval scope before live probes', async () => {
    const fetchImpl = vi.fn();
    const result = await executeConnectorProbe(githubConnector, {
      mode: 'live',
      env: { GITHUB_TOKEN: 'ghp_secret' },
      ownerApproval: { granted: true, scope: 'commerce' },
      fetchImpl,
    });

    expect(result.status).toBe('blocked');
    expect(result.truthState).toBe(CONNECTOR_TRUTH.NEEDS_OWNER_APPROVAL);
    expect(result.approvalScope).toBe('provider_probe');
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('proves a live provider probe through an injected fetch runtime', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ login: 'owner', id: 42, type: 'User' }),
    });
    const result = await executeConnectorProbe(githubConnector, {
      mode: 'live',
      env: { GITHUB_TOKEN: 'ghp_secret' },
      ownerApproval: { granted: true, scope: 'provider_probe' },
      fetchImpl,
    });

    expect(result.status).toBe('connected');
    expect(result.truthState).toBe(CONNECTOR_TRUTH.PROVEN);
    expect(result.authenticated).toBe(true);
    expect(result.response.login).toBe('owner');
    expect(fetchImpl).toHaveBeenCalledWith(
      'https://api.github.com/user',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({ Authorization: 'Bearer ghp_secret' }),
      })
    );
  });

  it('builds a safe probe plan without exposing secrets', () => {
    const plan = buildConnectorProbePlan(githubConnector, {
      mode: 'live',
      env: { GITHUB_TOKEN: 'ghp_secret' },
    });

    expect(plan).toMatchObject({
      provider: 'github',
      credentialConfigured: true,
      envKey: 'GITHUB_TOKEN',
      approvalScope: 'provider_probe',
    });
    expect(JSON.stringify(plan)).not.toContain('ghp_secret');
  });
});
