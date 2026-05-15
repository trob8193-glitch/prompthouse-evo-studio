import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Mock the env status client
vi.mock('../src/services/env-status-client.js', () => ({
  getEnvironmentValidation: vi.fn().mockResolvedValue({
    ok: true,
    data: {
      truthState: 'VERIFIED',
      mode: 'LOCAL',
      deployTarget: 'local',
      productionAllowed: false,
      secrets: [
        { key: 'JWT_SECRET', configured: true, lengthValid: true, length: 96, minLength: 24 },
        { key: 'PH_EVO_MASTER_KEY', configured: true, lengthValid: true, length: 96, minLength: 24 },
      ],
      config: [
        { key: 'CORS_ORIGINS', label: 'CORS Origins', configured: true, value: 'http://localhost:5173' },
        { key: 'VITE_BRIDGE_URL', label: 'Bridge URL', configured: true, value: 'http://127.0.0.1:3001' },
        { key: 'DEPLOY_TARGET', label: 'Deploy Target', configured: true, value: 'local' },
        { key: 'DEPLOY_ALLOW_PRODUCTION', label: 'Deploy Allow Production', configured: true, value: 'false' },
      ],
      providers: [
        { key: 'OPENAI_API_KEY', label: 'OpenAI API Key', configured: true },
        { key: 'VERCEL_TOKEN', label: 'Vercel Token', configured: false },
      ],
      blockers: [],
    },
  }),
}));

vi.mock('../src/config/bridge-config.js', () => ({
  safeFetchBridge: vi.fn(),
}));

import EnvironmentStatusPanel from '../src/components/EnvironmentStatusPanel.jsx';

describe('EnvironmentStatusPanel', () => {
  it('renders configured statuses', async () => {
    render(<EnvironmentStatusPanel />);
    const heading = await screen.findByText('Environment Status');
    expect(heading).toBeTruthy();
    // Check secret indicators rendered
    const jwtLabel = await screen.findByText('JWT_SECRET');
    expect(jwtLabel).toBeTruthy();
  });

  it('does not render raw secrets', async () => {
    const { container } = render(<EnvironmentStatusPanel />);
    await screen.findByText('Environment Status');
    const text = container.textContent;
    // Should never contain actual secret values
    expect(text).not.toMatch(/sk-proj-/);
    expect(text).not.toMatch(/supersecret/);
  });

  it('DEPLOY_ALLOW_PRODUCTION=false does not show production live', async () => {
    const { container } = render(<EnvironmentStatusPanel />);
    await screen.findByText('Environment Status');
    const text = container.textContent;
    expect(text).toContain('BLOCKED');
    expect(text).not.toContain('ALLOWED');
    expect(text).not.toContain('production ready');
    expect(text).not.toContain('100% production');
  });
});

describe('EnvironmentStatusPanel error state', () => {
  it('bridge error renders ERROR', async () => {
    // Override mock for this test
    const { getEnvironmentValidation } = await import('../src/services/env-status-client.js');
    getEnvironmentValidation.mockResolvedValueOnce({
      ok: false,
      data: null,
      error: 'Connection refused',
      truthState: 'DISCONNECTED',
    });

    render(<EnvironmentStatusPanel />);
    const errorText = await screen.findByText(/Bridge unavailable/i);
    expect(errorText).toBeTruthy();
  });
});
