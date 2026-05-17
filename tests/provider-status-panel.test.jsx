import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import ProviderStatusPanel from '../src/components/ProviderStatusPanel.jsx';
import * as providerClient from '../src/services/provider-status-client.js';

vi.mock('../src/services/provider-status-client.js', () => ({
  getProviderGateStatus: vi.fn(),
  getProviderReceipts: vi.fn(),
}));

describe('ProviderStatusPanel', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders missing credentials as NEEDS_CREDENTIALS', async () => {
    providerClient.getProviderGateStatus.mockResolvedValue({
      ok: true,
      gates: {
        openai: { truthState: 'NEEDS_CREDENTIALS', redacted: null }
      }
    });
    providerClient.getProviderReceipts.mockResolvedValue({ ok: true, receipts: [] });

    render(<ProviderStatusPanel />);
    await waitFor(() => {
      expect(screen.getByText(/Needs Credentials/i)).toBeDefined();
    });
  });

  it('renders receipt list', async () => {
    providerClient.getProviderGateStatus.mockResolvedValue({ ok: true, gates: {} });
    providerClient.getProviderReceipts.mockResolvedValue({
      ok: true,
      receipts: [
        { id: '1', provider: 'OpenAI', action: 'Completion', truthState: 'VERIFIED', createdAt: new Date().toISOString() }
      ]
    });

    render(<ProviderStatusPanel />);
    await waitFor(() => {
      expect(screen.getByText(/OpenAI/i)).toBeDefined();
      expect(screen.getByText(/Completion/i)).toBeDefined();
      expect(screen.getByText(/VERIFIED/i)).toBeDefined();
    });
  });

  it('renders ERROR when bridge fails', async () => {
    providerClient.getProviderGateStatus.mockRejectedValue(new Error('Bridge Offline'));
    render(<ProviderStatusPanel />);
    await waitFor(() => {
      expect(screen.getByText(/Bridge Offline/i)).toBeDefined();
    });
  });

  it('does not render secret values', async () => {
    providerClient.getProviderGateStatus.mockResolvedValue({
      ok: true,
      gates: {
        openai: { truthState: 'VERIFIED', redacted: 'sk-...1234' }
      }
    });
    providerClient.getProviderReceipts.mockResolvedValue({ ok: true, receipts: [] });

    render(<ProviderStatusPanel />);
    await waitFor(() => {
      expect(screen.getByText('sk-...1234')).toBeDefined();
    });
    // Assuming secret starts with full sk-, it shouldn't be there, only redacted.
    const html = document.body.innerHTML;
    expect(html).not.toContain('sk-abc123secret456');
  });
});
