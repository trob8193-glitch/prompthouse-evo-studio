import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import HandoverStatusPanel from '../src/components/HandoverStatusPanel.jsx';
import * as handoverClient from '../src/services/handover-client.js';
import { TRUTH_STATES } from '../src/constants/truth-states.js';

// Mock lucide-react to avoid SVG rendering issues in testing
vi.mock('lucide-react', () => ({
  AlertCircle: () => <div data-testid="icon-alert" />,
  FileText: () => <div data-testid="icon-file" />,
  CheckCircle2: () => <div data-testid="icon-check" />,
  ShieldAlert: () => <div data-testid="icon-shield" />
}));

describe('HandoverStatusPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders ERROR state when fetch fails', async () => {
    vi.spyOn(handoverClient, 'getHandoverStatus').mockResolvedValue({
      ok: false,
      truthState: TRUTH_STATES.ERROR
    });

    render(<HandoverStatusPanel />);
    expect(screen.getByText(/Loading Handover Status/i)).toBeTruthy();

    await waitFor(() => {
      expect(screen.getByText(/Unable to fetch handover status/i)).toBeTruthy();
      expect(screen.getByText(/ERROR/i)).toBeTruthy();
    });
  });

  it('renders handover status with production block verified', async () => {
    vi.spyOn(handoverClient, 'getHandoverStatus').mockResolvedValue({
      ok: true,
      truthState: TRUTH_STATES.VERIFIED,
      data: {
        reportGenerated: true,
        productionDeployBlocked: true,
        liveBillingBlocked: true,
        blockers: ['No OpenAI key'],
        nextSafeActions: ['Configure OpenAI key']
      }
    });

    render(<HandoverStatusPanel />);

    await waitFor(() => {
      expect(screen.getByText(/Sovereign Handover Status/i)).toBeTruthy();
      expect(screen.getAllByText(/BLOCKED ✅/i)).toHaveLength(2); // Deploy and Billing
      expect(screen.getByText(/No OpenAI key/i)).toBeTruthy();
      expect(screen.getByText(/Configure OpenAI key/i)).toBeTruthy();
    });
  });

  it('renders allowed state if production block is missing (violation)', async () => {
    vi.spyOn(handoverClient, 'getHandoverStatus').mockResolvedValue({
      ok: true,
      truthState: TRUTH_STATES.LOCAL_ONLY,
      data: {
        reportGenerated: true,
        productionDeployBlocked: false,
        liveBillingBlocked: false,
        blockers: [],
        nextSafeActions: []
      }
    });

    render(<HandoverStatusPanel />);

    await waitFor(() => {
      expect(screen.getAllByText(/ALLOWED ❌/i)).toHaveLength(2); // Deploy and Billing
    });
  });
});
