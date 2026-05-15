import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
});

vi.mock('../src/services/vercel-client.js', () => ({
  getVercelReadiness: vi.fn().mockResolvedValue({
    ok: true,
    data: {
      tokenStatus: { configured: true, truthState: 'VERIFIED', redactedToken: 'sk-ve...1234' },
      previewReadiness: { ready: true, truthState: 'VERIFIED', blockers: [] },
      productionReadiness: { ready: false, truthState: 'BLOCKED', blockers: ['DEPLOY_ALLOW_PRODUCTION is false'] }
    }
  }),
  requestVercelPreviewDeploy: vi.fn().mockResolvedValue({ ok: false, truthState: 'PROVIDER_GATED', error: 'Vercel API calls disabled' })
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
  it('renders token configuration status without raw tokens', async () => {
    await act(async () => {
      render(<VercelPreviewDeployPanel />);
    });
    
    expect(screen.getByText('Vercel Token Configured')).toBeTruthy();
    const html = document.body.innerHTML;
    expect(html).not.toMatch(/sk-ve\.\.\.1234/i); // We actually shouldn't render even the redacted token in UI for Vercel unless explicitly requested
  });

  it('renders readiness levels', async () => {
    await act(async () => {
      render(<VercelPreviewDeployPanel />);
    });
    
    expect(screen.getByText('Preview Deploy Readiness:')).toBeTruthy();
    expect(screen.getByText('Production Deploy Readiness:')).toBeTruthy();
    // It should render "READY" for preview and "BLOCKED" for production. 
    // Since we have both texts, let's just assert they exist.
    expect(screen.getByText('READY')).toBeTruthy();
    expect(screen.getByText('BLOCKED')).toBeTruthy();
  });

  it('deploy button disabled before approval', async () => {
    await act(async () => {
      render(<VercelPreviewDeployPanel />);
    });
    
    const deployButton = screen.getByText('Request Vercel Preview Deploy');
    expect(deployButton.closest('button').disabled).toBe(true);

    // Grant approval
    await act(async () => {
      fireEvent.click(screen.getByText('Grant Mock Approval'));
    });
    
    // Now it should be enabled
    expect(deployButton.closest('button').disabled).toBe(false);
  });
});
