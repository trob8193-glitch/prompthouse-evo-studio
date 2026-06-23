import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProofCenterView from '../src/features/ProofCenterView.jsx';

vi.mock('../src/components/ProviderStatusPanel.jsx', () => ({
  default: () => <div data-testid="mock-provider-status" />
}));

vi.mock('../src/components/SecurityAuditPanel.jsx', () => ({
  default: () => <div data-testid="mock-security-audit" />
}));

vi.mock('../src/components/RouteDiagnosticsPanel.jsx', () => ({
  default: () => <div data-testid="mock-route-diagnostics" />
}));

vi.mock('../src/components/StripeProofPanel.jsx', () => ({
  default: () => <div data-testid="mock-stripe-proof" />
}));

vi.mock('../src/components/ProviderCredentialChecklistPanel.jsx', () => ({
  default: () => <div data-testid="mock-provider-credential" />
}));

vi.mock('../src/components/StripeTestCheckoutPanel.jsx', () => ({
  default: () => <div data-testid="mock-stripe-checkout" />
}));

vi.mock('../src/components/PreviewAccessDecisionPanel.jsx', () => ({
  PreviewAccessDecisionPanel: () => <div data-testid="mock-preview-access" />
}));

describe('ProofCenterView', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders the placeholder state without requiring external provider calls', () => {
    render(<ProofCenterView />);
    expect(screen.getByText('Proof Center View')).toBeDefined();
    expect(screen.getByText(/This module is currently syncing/i)).toBeDefined();
  });
});
