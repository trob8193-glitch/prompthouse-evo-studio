import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
});

vi.mock('../src/services/stripe-checkout-client.js', () => ({
  getStripeTestCheckoutReadiness: vi.fn().mockResolvedValue({
    ok: true,
    data: { ready: true, truthState: 'VERIFIED', mode: 'test' }
  }),
  createStripeTestCheckoutSession: vi.fn().mockResolvedValue({ ok: true, id: 'cs_test_123', url: 'https://stripe.com/test' })
}));

// Mock OwnerApprovalPanel
vi.mock('../src/components/OwnerApprovalPanel.jsx', () => ({
  default: ({ onApprovalGranted }) => (
    <div data-testid="mock-owner-approval">
      <button onClick={() => onApprovalGranted({ granted: true, scope: 'commerce' })}>
        Grant Mock Approval
      </button>
    </div>
  )
}));

import StripeTestCheckoutPanel from '../src/components/StripeTestCheckoutPanel.jsx';

describe('StripeTestCheckoutPanel', () => {
  it('renders readiness and mode', async () => {
    await act(async () => {
      render(<StripeTestCheckoutPanel />);
    });
    
    expect(screen.getByText(/Stripe Test Mode Active/i)).toBeTruthy();
    expect(screen.getByText(/READY/i)).toBeTruthy();
    expect(screen.getAllByText(/TEST/i).length).toBeGreaterThan(0);
  });

  it('session creation button disabled before approval', async () => {
    await act(async () => {
      render(<StripeTestCheckoutPanel />);
    });
    
    const button = screen.getByText('Create Stripe Test Checkout Session');
    expect(button.closest('button').disabled).toBe(true);

    // Grant approval
    await act(async () => {
      fireEvent.click(screen.getByText('Grant Mock Approval'));
    });
    
    expect(button.closest('button').disabled).toBe(false);
  });
});
