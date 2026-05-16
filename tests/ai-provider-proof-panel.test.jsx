import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
});

vi.mock('../src/services/ai-provider-client.js', () => ({
  getAiProviderStatus: vi.fn().mockResolvedValue({
    ok: true,
    data: {
      openai: { configured: true, truthState: 'VERIFIED', redactedKey: 'sk-pro...1234', blockedReason: null, nextAction: 'Ready' },
      gemini: { configured: false, truthState: 'PROVIDER_GATED', blockedReason: 'Missing GEMINI_API_KEY', nextAction: 'Add key' }
    }
  }),
  runOpenAiProbe: vi.fn().mockResolvedValue({ ok: true, data: { message: 'Probe success' }, truthState: 'VERIFIED' }),
  runGeminiProbe: vi.fn()
}));

// Mock OwnerApprovalPanel
vi.mock('../src/components/OwnerApprovalPanel.jsx', () => ({
  default: ({ onApprovalGranted }) => (
    <div data-testid="mock-owner-approval">
      <button onClick={() => onApprovalGranted({ granted: true, scope: 'provider_probe' })}>
        Grant Mock Approval
      </button>
    </div>
  )
}));

import AiProviderProofPanel from '../src/components/AiProviderProofPanel.jsx';

describe('AiProviderProofPanel', () => {
  it('renders OpenAI and Gemini statuses', async () => {
    await act(async () => {
      render(<AiProviderProofPanel />);
    });
    
    // Check panel heading
    expect(screen.getByText('AI Provider Proof')).toBeTruthy();

    // Check OpenAI configured
    expect(screen.getByText('Local configuration verified')).toBeTruthy();
    
    // Check Gemini missing
    expect(screen.getByText('Missing GEMINI_API_KEY')).toBeTruthy();
  });

  it('probe buttons disabled before approval', async () => {
    await act(async () => {
      render(<AiProviderProofPanel />);
    });
    
    const probeButton = screen.getByText('Run OpenAI Safe Probe');
    expect(probeButton.closest('button').disabled).toBe(true);

    // Grant approval
    await act(async () => {
      fireEvent.click(screen.getByText('Grant Mock Approval'));
    });
    
    // Now it should be enabled
    expect(probeButton.closest('button').disabled).toBe(false);
  });
});
