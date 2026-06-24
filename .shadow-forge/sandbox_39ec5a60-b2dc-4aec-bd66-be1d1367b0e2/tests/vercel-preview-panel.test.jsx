import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';

// Mock vercel-preview-client
vi.mock('../src/services/vercel-preview-client.js', () => ({
  getVercelPreviewStatus: vi.fn().mockResolvedValue({
    ok: true,
    data: {
      tokenStatus: { configured: true, truthState: 'VERIFIED', redactedToken: 'vcp_te...1234' },
      previewReadiness: { ready: true, truthState: 'VERIFIED', blockers: [] },
      productionReadiness: { ready: false, truthState: 'BLOCKED', blockers: ['DEPLOY_ALLOW_PRODUCTION is false'] }
    }
  }),
  requestVercelPreviewDeploy: vi.fn().mockResolvedValue({ ok: false, truthState: 'PROVIDER_GATED', error: 'Vercel API calls disabled' }),
  getLatestPreviewDeploymentReceipt: vi.fn().mockResolvedValue({ ok: true, data: null })
}));

// Mock OwnerApprovalPanel
vi.mock('../src/components/OwnerApprovalPanel.jsx', () => ({
  default: ({ onApprovalGranted }) => (
    <div data-testid="mock-owner-approval">
      <button onClick={() => onApprovalGranted({ granted: true, scope: 'deploy' })}>
        Grant Mock Approval
      </button>
    </div>
  )
}));

import VercelPreviewDeployPanel from '../src/components/VercelPreviewDeployPanel.jsx';

describe('VercelPreviewDeployPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders token configuration status', async () => {
    await act(async () => {
      render(<VercelPreviewDeployPanel />);
    });
    
    expect(screen.getByText(/vcp_te\.\.\.1234/i)).toBeTruthy();
  });

  it('renders readiness levels', async () => {
    await act(async () => {
      render(<VercelPreviewDeployPanel />);
    });
    
    expect(screen.getByText('Production Deploy:')).toBeTruthy();
    expect(screen.getByText('BLOCKED')).toBeTruthy();
  });

  it('deploy button disabled before approval', async () => {
    await act(async () => {
      render(<VercelPreviewDeployPanel />);
    });
    
    const deployButton = screen.getByText('Run Vercel Preview Deploy Proof');
    expect(deployButton.disabled).toBe(true);

    // Grant approval
    await act(async () => {
      fireEvent.click(screen.getByText('Grant Mock Approval'));
    });
    
    // Now it should be enabled
    expect(deployButton.disabled).toBe(false);
  });
});
