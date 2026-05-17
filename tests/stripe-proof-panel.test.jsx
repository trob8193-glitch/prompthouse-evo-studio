import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('../src/services/stripe-status-client.js', () => ({
  getStripeStatus: vi.fn().mockResolvedValue({
    ok: true,
    data: {
      configured: true,
      mode: 'test',
      safeForLocalTest: true,
      truthState: 'VERIFIED',
      blockedReason: null,
      nextAction: 'Ready to probe.',
    },
  }),
  runStripeAccountProbe: vi.fn(),
}));

import StripeProofPanel from '../src/components/StripeProofPanel.jsx';

describe('StripeProofPanel', () => {
  it('renders test mode successfully', async () => {
    render(<StripeProofPanel />);
    const heading = await screen.findByText('Stripe Test-Mode Proof');
    expect(heading).toBeTruthy();
    
    // Check mode label
    const testLabel = await screen.findByText('TEST (sk_test_)');
    expect(testLabel).toBeTruthy();

    // TruthBadge rendering the overall state
    const badge = await screen.findByText('Verified');
    expect(badge).toBeTruthy();
  });

  it('no raw secret values rendered', async () => {
    const { container } = render(<StripeProofPanel />);
    await screen.findByText('Stripe Test-Mode Proof');
    const text = container.textContent;
    expect(text).not.toMatch(/sk-proj-/);
    expect(text).not.toMatch(/sk_test_supersecret/);
  });
});
