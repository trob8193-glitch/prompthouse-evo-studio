import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const safeFetchBridge = vi.fn();

vi.mock('../src/config/bridge-config.js', () => ({
  safeFetchBridge: (...args) => safeFetchBridge(...args),
}));

import PromptBridgeSurfacesView from '../src/features/PromptBridgeSurfacesView.jsx';

const capability = {
  abilities: ['summarize', 'audit', 'plan', 'verify', 'report'],
  localCapable: true,
  canExecute: true,
  canApprove: false,
  defaultMode: 'local_execution',
  authority: 'Bridge-backed capability for tests.',
};

function bridgeResponse(path) {
  if (path === '/api/tribrain/status') {
    return {
      ok: true,
      data: {
        status: {
          truthLabel: 'TRIBRAIN_CONTRACT_READY',
          router: {
            brains: {
              studio_brain: { enabled: true, available: true, capability },
              chatgpt_operator_brain: { enabled: true, available: false, capability: { ...capability, defaultMode: 'proposal_only' } },
              ide_agent_brain: { enabled: true, available: false, capability },
            },
          },
        },
      },
    };
  }

  if (path === '/api/quadbrain/status') {
    return {
      ok: true,
      data: {
        status: {
          truthLabel: 'QUADBRAIN_OVERLAY_READY',
          surfaces: {
            ACTIONS_GPT: 'actions_gpt',
            APPS_MCP_COCKPIT: 'apps_mcp_cockpit',
            STUDIO_NATIVE_PANEL: 'studio_native_panel',
            IDE_DESKTOP_BRIDGE: 'ide_desktop_bridge',
          },
          capabilityMatrix: {
            studio_brain: capability,
            chatgpt_operator_brain: capability,
            ide_agent_brain: capability,
            external_experience_brain: {
              ...capability,
              abilities: ['summarize', 'plan', 'report', 'verify', 'interact'],
              localCapable: false,
              canExecute: false,
              defaultMode: 'proposal_only',
            },
          },
        },
      },
    };
  }

  if (path === '/api/quadbrain/contract') {
    return {
      ok: true,
      data: {
        surfaces: {
          ACTIONS_GPT: 'actions_gpt',
          APPS_MCP_COCKPIT: 'apps_mcp_cockpit',
          STUDIO_NATIVE_PANEL: 'studio_native_panel',
          IDE_DESKTOP_BRIDGE: 'ide_desktop_bridge',
        },
      },
    };
  }

  if (path === '/api/quadbrain/route') {
    return {
      ok: true,
      data: {
        route: {
          truthLabel: 'QUADBRAIN_ROUTE_READY',
          selectedBrain: 'external_experience_brain',
          surface: 'actions_gpt',
          abilityClass: 'report',
          requiresStudioGateway: true,
        },
      },
    };
  }

  if (path === '/api/tribrain/route') {
    return {
      ok: true,
      data: {
        plan: {
          truthState: 'VERIFIED',
          selectedResponse: {
            respondingBrain: 'chatgpt_operator_brain',
            summary: 'TriBrain routed command to chatgpt_operator_brain.',
            nextActions: ['Execute through selected brain adapter and record proof.'],
          },
        },
      },
    };
  }

  return { ok: false, error: `Unhandled path ${path}` };
}

describe('PromptBridgeSurfacesView', () => {
  beforeEach(() => {
    safeFetchBridge.mockReset();
    safeFetchBridge.mockImplementation(async (path) => bridgeResponse(path));
  });

  it('renders the four bridge surfaces', async () => {
    render(<PromptBridgeSurfacesView />);

    expect((await screen.findAllByText('Studio')).length).toBeGreaterThan(0);
    expect(screen.getByText('ChatGPT Operator')).toBeTruthy();
    expect(screen.getByText('IDE Agent')).toBeTruthy();
    expect(screen.getByText('External Experience')).toBeTruthy();
    expect(screen.getByText('TRIBRAIN_CONTRACT_READY')).toBeTruthy();
  });

  it('plans a surface through QuadBrain and TriBrain routes', async () => {
    render(<PromptBridgeSurfacesView />);

    await screen.findByText('ChatGPT Operator');
    fireEvent.click(screen.getAllByRole('button', { name: /plan route/i })[1]);

    await waitFor(() => expect(screen.getByText('QUADBRAIN_ROUTE_READY')).toBeTruthy());
    expect(screen.getByText('chatgpt_operator_brain')).toBeTruthy();
    expect(safeFetchBridge).toHaveBeenCalledWith('/api/quadbrain/route', expect.objectContaining({ method: 'POST' }));
    expect(safeFetchBridge).toHaveBeenCalledWith('/api/tribrain/route', expect.objectContaining({ method: 'POST' }));
  });
});
