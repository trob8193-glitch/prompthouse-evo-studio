import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
});

vi.mock('../src/services/provider-credential-client.js', () => ({
  getProviderCredentialChecklist: vi.fn().mockResolvedValue({
    ok: true,
    data: {
      truthState: 'PROVIDER_GATED',
      nextAction: 'Missing some providers',
      providers: [
        { provider: 'OpenAI', envKey: 'OPENAI_API_KEY', configured: false },
        { provider: 'Stripe', envKey: 'STRIPE_SECRET_KEY', configured: true },
      ],
      localSecrets: [
        { provider: 'Auth System', envKey: 'JWT_SECRET', configured: true, lengthValid: true },
        { provider: 'Master Logic', envKey: 'PH_EVO_MASTER_KEY', configured: true, lengthValid: true },
      ],
      blockers: [],
      warnings: ['Missing OPENAI_API_KEY'],
    },
  }),
}));

import ProviderCredentialChecklistPanel from '../src/components/ProviderCredentialChecklistPanel.jsx';

describe('ProviderCredentialChecklistPanel', () => {
  it('renders providers and local secrets', async () => {
    render(<ProviderCredentialChecklistPanel />);
    const heading = await screen.findByText('Provider Checklist');
    expect(heading).toBeTruthy();
    
    const stripe = await screen.findByText('Stripe');
    expect(stripe).toBeTruthy();

    const openai = await screen.findByText('OpenAI');
    expect(openai).toBeTruthy();
    
    // TruthBadge rendering the overall state
    const badge = await screen.findByText('Provider Gated');
    expect(badge).toBeTruthy();
  });

  it('no raw secret values rendered', async () => {
    const { container } = render(<ProviderCredentialChecklistPanel />);
    await screen.findByText('Provider Checklist');
    const text = container.textContent;
    // Should never contain actual secret values
    expect(text).not.toMatch(/sk-proj-/);
    expect(text).not.toMatch(/sk_test_/);
  });
});

describe('ProviderCredentialChecklistPanel Error State', () => {
  it('bridge error renders ERROR', async () => {
    const { getProviderCredentialChecklist } = await import('../src/services/provider-credential-client.js');
    getProviderCredentialChecklist.mockResolvedValueOnce({
      ok: false,
      data: null,
      error: 'Connection refused',
      truthState: 'DISCONNECTED',
    });

    render(<ProviderCredentialChecklistPanel />);
    const errorText = await screen.findByText(/Bridge unavailable/i);
    expect(errorText).toBeTruthy();
  });
});
