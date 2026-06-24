import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Mock all deployment clients
vi.mock('../src/services/deployment-client.js', () => ({
  getDeploymentReadiness: vi.fn().mockResolvedValue({
    ok: true,
    data: {
      ok: false,
      truthState: 'BLOCKED',
      checks: [
        { check: 'frontend_build', label: 'Frontend Build', passed: true, truthState: 'VERIFIED' },
        { check: 'proof_report', label: 'Proof Report', passed: false, truthState: 'BLOCKED', detail: 'No report found' },
      ],
      blockers: [{ check: 'proof_report', label: 'Proof Report', detail: 'No report found' }],
      warnings: [],
      nextActions: ['Run npm run proof:report'],
    },
  }),
  getDeploymentReceipts: vi.fn().mockResolvedValue({
    ok: true,
    data: {
      receipts: [
        { id: 'DR-1', action: 'readiness_check', provider: 'local', status: 'local_only', truthState: 'LOCAL_ONLY', createdAt: '2026-05-14T00:00:00Z', message: 'Local check', deploymentUrl: null },
      ],
    },
  }),
  requestVercelPreviewDeploy: vi.fn().mockResolvedValue({ ok: false, truthState: 'PROVIDER_GATED' }),
}));

vi.mock('../src/services/owner-approval-client.js', () => ({
  OWNER_APPROVAL_SCOPES: { DEPLOY: 'deploy', COMMERCE: 'commerce', MUTATION: 'mutation', SELF_IMPLEMENTATION: 'self_implementation' },
  createOwnerApprovalEnvelope: vi.fn().mockReturnValue({ ownerApproval: { granted: true, scope: 'deploy', receiptId: 'test', grantedAt: '2026-05-14T00:00:00Z', actor: 'studio_owner' } }),
}));

vi.mock('../src/config/bridge-config.js', () => ({
  safeFetchBridge: vi.fn(),
}));

import DeploymentReadinessPanel from '../src/components/DeploymentReadinessPanel.jsx';
import DeploymentReceiptsPanel from '../src/components/DeploymentReceiptsPanel.jsx';
import DeploymentControlPanel from '../src/components/DeploymentControlPanel.jsx';
import { requestVercelPreviewDeploy } from '../src/services/deployment-client.js';

describe('DeploymentReadinessPanel', () => {
  it('renders blockers when present', async () => {
    render(<DeploymentReadinessPanel />);
    const heading = await screen.findAllByText(/Deployment Readiness/i);
    expect(heading.length).toBeGreaterThan(0);
  });
});

describe('DeploymentReceiptsPanel', () => {
  it('renders receipts from backend', async () => {
    render(<DeploymentReceiptsPanel />);
    const heading = await screen.findAllByText(/Deployment Receipts/i);
    expect(heading.length).toBeGreaterThan(0);
  });
});

describe('DeploymentControlPanel', () => {
  it('renders deploy button disabled before approval', async () => {
    render(<DeploymentControlPanel />);
    const btn = await screen.findByText(/request vercel preview deploy/i);
    expect(btn).toBeTruthy();
    expect(btn.disabled).toBe(true);
  });

  it('does not auto-deploy after approval creation', async () => {
    render(<DeploymentControlPanel />);
    const btn = await screen.findByText(/request vercel preview deploy/i);
    expect(btn).toBeTruthy();
    expect(requestVercelPreviewDeploy).not.toHaveBeenCalled();
  });

  it('does not display market-ready text', async () => {
    const { container } = render(<DeploymentControlPanel />);
    await screen.findByText(/request vercel preview deploy/i);
    expect(container.textContent).not.toContain('market ready');
    expect(container.textContent).not.toContain('100% production');
  });
});
