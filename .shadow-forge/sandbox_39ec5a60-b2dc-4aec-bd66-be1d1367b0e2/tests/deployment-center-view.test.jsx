import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('../src/services/deployment-client.js', () => ({
  getDeploymentReadiness: vi.fn().mockResolvedValue({ ok: true, data: { truthState: 'BLOCKED', checks: [], blockers: [], warnings: [], nextActions: [] } }),
  getDeploymentReceipts: vi.fn().mockResolvedValue({ ok: true, data: { receipts: [] } }),
  requestVercelPreviewDeploy: vi.fn(),
}));

vi.mock('../src/services/owner-approval-client.js', () => ({
  OWNER_APPROVAL_SCOPES: { DEPLOY: 'deploy', COMMERCE: 'commerce', MUTATION: 'mutation', SELF_IMPLEMENTATION: 'self_implementation' },
  createOwnerApprovalEnvelope: vi.fn().mockReturnValue({ ownerApproval: { granted: true, scope: 'deploy', receiptId: 'test', grantedAt: '2026-05-14T00:00:00Z', actor: 'studio_owner' } }),
}));

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
});

vi.mock('../src/config/bridge-config.js', () => ({
  safeFetchBridge: vi.fn().mockResolvedValue({ ok: true, data: {} }),
}));

vi.mock('../src/components/VercelPreviewDeployPanel.jsx', () => ({
  default: () => <div data-testid="mock-vercel-preview" />
}));

vi.mock('../src/components/StripeTestCheckoutPanel.jsx', () => ({
  default: () => <div data-testid="mock-stripe-checkout" />
}));

vi.mock('../src/components/BrowserPreviewVerificationPanel.jsx', () => ({
  default: () => <div data-testid="mock-browser-verification" />
}));

vi.mock('../src/components/PreviewAccessDecisionPanel.jsx', () => ({
  PreviewAccessDecisionPanel: () => <div data-testid="mock-preview-access" />
}));

import DeploymentCenterView from '../src/features/DeploymentCenterView.jsx';
import { requestVercelPreviewDeploy } from '../src/services/deployment-client.js';

describe('DeploymentCenterView', () => {
  it('renders the Deployment Center heading', async () => {
    render(<DeploymentCenterView />);
    const heading = await screen.findByText(/deployment center/i);
    expect(heading).toBeTruthy();
  });

  it('renders placeholder text', async () => {
    render(<DeploymentCenterView />);
    const msg = await screen.findByText(/syncing with the intelligence layer/i);
    expect(msg).toBeTruthy();
  });

  it('does not show fake deployment success text', () => {
    const { container } = render(<DeploymentCenterView />);
    expect(container.textContent).not.toContain('successfully deployed');
    expect(container.textContent).not.toContain('market ready');
  });

  it('does not require external provider calls', () => {
    render(<DeploymentCenterView />);
    expect(requestVercelPreviewDeploy).not.toHaveBeenCalled();
  });
});
