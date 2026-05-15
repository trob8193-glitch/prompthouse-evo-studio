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

describe('ProofCenterView', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders all major panels without requiring external provider calls', () => {
    // The view itself should just compose the panels
    render(<ProofCenterView />);
    expect(screen.getByTestId('mock-provider-status')).toBeDefined();
    expect(screen.getByTestId('mock-security-audit')).toBeDefined();
    expect(screen.getByTestId('mock-route-diagnostics')).toBeDefined();
    
    // Check that owner approval examples are present
    expect(screen.getByText('Deploy Pipeline Gate')).toBeDefined();
    expect(screen.getByText('Live Commerce Gate')).toBeDefined();
    expect(screen.getByText('Self-Implementation')).toBeDefined();
  });

  it('does not contain a fake market-ready claim', () => {
    render(<ProofCenterView />);
    const html = document.body.innerHTML;
    expect(html).not.toMatch(/market.ready/i);
    expect(screen.getByText(/An approval envelope does not equal provider success/i)).toBeDefined();
  });
});
