import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PreviewAccessDecisionPanel } from '../src/components/PreviewAccessDecisionPanel.jsx';
import * as client from '../src/services/preview-access-client.js';

vi.mock('../src/services/preview-access-client.js');

describe('PreviewAccessDecisionPanel', () => {
  it('renders auth-protected state correctly', async () => {
    vi.mocked(client.getPreviewAccessStatus).mockResolvedValue({
      ok: true,
      data: {
        accessMode: 'AUTH_PROTECTED',
        deploymentUrl: 'https://test.vercel.app',
        smokeResult: 'HTTP 401: Unauthorized',
        options: [
          { id: 'keep_auth', title: 'Keep Authentication Enabled', description: 'Desc', recommended: true }
        ]
      }
    });

    render(<PreviewAccessDecisionPanel />);
    
    expect(await screen.findByText('Preview Access Decision')).toBeDefined();
    expect(await screen.findByText('AUTH_PROTECTED')).toBeDefined();
    expect(await screen.findByText('https://test.vercel.app')).toBeDefined();
    expect(await screen.findByText(/HTTP 401: Unauthorized/)).toBeDefined();
    expect(await screen.findByText('Keep Authentication Enabled')).toBeDefined();
  });

  it('explains 401 as Vercel Authentication gate', async () => {
    vi.mocked(client.getPreviewAccessStatus).mockResolvedValue({
      ok: true,
      data: {
        accessMode: 'AUTH_PROTECTED',
        deploymentUrl: 'https://test.vercel.app',
        smokeResult: 'HTTP 401: Unauthorized',
        options: []
      }
    });

    render(<PreviewAccessDecisionPanel />);
    
    expect(await screen.findByText(/Vercel Authentication/)).toBeDefined();
    expect(await screen.findByText(/not an application failure/)).toBeDefined();
  });

  it('renders no secrets or disable-auth actions', async () => {
     vi.mocked(client.getPreviewAccessStatus).mockResolvedValue({
      ok: true,
      data: {
        accessMode: 'AUTH_PROTECTED',
        options: [
           { id: 'keep_auth', title: 'Keep Auth', recommended: true }
        ]
      }
    });

    render(<PreviewAccessDecisionPanel />);
    
    await screen.findByText('Preview Access Decision');
    
    const html = document.body.innerHTML;
    expect(html).not.toContain('SECRET');
    expect(html).not.toContain('PASSWORD');
    // Ensure no buttons that would trigger dangerous actions
    const buttons = screen.queryAllByRole('button');
    expect(buttons.length).toBe(0);
  });
});
