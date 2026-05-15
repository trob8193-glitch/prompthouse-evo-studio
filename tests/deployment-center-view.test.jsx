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

import DeploymentCenterView from '../src/features/DeploymentCenterView.jsx';
import { requestVercelPreviewDeploy } from '../src/services/deployment-client.js';

describe('DeploymentCenterView', () => {
  it('renders the Deployment Center heading', async () => {
    render(<DeploymentCenterView />);
    const heading = await screen.findByText(/deployment center/i);
    expect(heading).toBeTruthy();
  });

  it('renders major panels', async () => {
    render(<DeploymentCenterView />);
    const readiness = await screen.findAllByText(/Deployment Readiness/i);
    const receipts = await screen.findAllByText(/Deployment Receipts/i);
    const control = await screen.findAllByText(/Deployment Control/i);
    expect(readiness.length).toBeGreaterThan(0);
    expect(receipts.length).toBeGreaterThan(0);
    expect(control.length).toBeGreaterThan(0);
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
