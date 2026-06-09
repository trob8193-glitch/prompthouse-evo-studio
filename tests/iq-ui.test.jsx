import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

import TopBar from '../src/components/TopBar.jsx';
import { StudioDashboard } from '../src/components/Dashboard.jsx';
import { useSovereignStore } from '../src/store.js';

vi.mock('../src/components/SwarmCouncil.jsx', () => ({
  SwarmCouncil: () => <div>Swarm Council</div>,
}));

vi.mock('../src/components/ModelSelector.jsx', () => ({
  default: () => <div>Model Selector</div>,
}));

vi.mock('../src/components/PerformanceMonitor', () => ({
  PerformanceMonitor: () => <div>Performance Monitor</div>,
}));

vi.mock('../src/config/bridge-config.js', () => ({
  BRIDGE_URL: 'http://127.0.0.1:3001',
  safeFetchBridge: vi.fn(async (path) => {
    if (path === '/status') {
      return {
        ok: true,
        data: {
          success: true,
          status: 'PromptBridge Operational',
          iq_metrics: { baseline: 165000000, sovereign_gain: 2500 },
        },
      };
    }
    if (path === '/api/metrics') {
      return {
        ok: true,
        data: {
          success: true,
          logic: { density: '165.00', iq: 165002500, action_count: 3 },
        },
      };
    }
    return { ok: false, error: `Unhandled path ${path}` };
  }),
}));

describe('IQ UI', () => {
  beforeEach(() => {
    useSovereignStore.setState({
      bridgeStatus: 'disconnected',
      bridgeData: null,
      bridgeError: null,
      metrics: null,
      sidebarCollapsed: false,
      notifications: [],
    });
  });

  it('renders top-bar studio IQ from bridge status telemetry', async () => {
    render(<TopBar />);

    await waitFor(() => {
      expect(screen.getByText('165,002,500')).toBeInTheDocument();
    });
    expect(screen.getByText(/165\.00 IQ/)).toBeInTheDocument();
  });

  it('renders dashboard Sovereign IQ baseline from /status', async () => {
    global.fetch = vi.fn(async (url) => {
      const body = String(url).endsWith('/status')
        ? { success: true, version: '1.0.0', iq_metrics: { baseline: 165000000, sovereign_gain: 2500 } }
        : String(url).endsWith('/api/metrics')
          ? { requests: { requestsPerSecond: 1, avgLatencyMs: 12 }, firewall: { savedTokens: 0, savedDollars: '0.0000' } }
          : String(url).endsWith('/api/queue/master')
            ? []
            : { state: { active: false, running: false } };

      return {
        ok: true,
        json: async () => body,
      };
    });

    render(<StudioDashboard />);
    expect(await screen.findByText('165.0M')).toBeInTheDocument();
  });
});
