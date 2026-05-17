import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import SecurityAuditPanel from '../src/components/SecurityAuditPanel.jsx';
import * as auditClient from '../src/services/security-audit-client.js';

vi.mock('../src/services/security-audit-client.js', () => ({
  getSecurityAudit: vi.fn(),
}));

describe('SecurityAuditPanel', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders warning when suspicious routes exist', async () => {
    auditClient.getSecurityAudit.mockResolvedValue({
      ok: true,
      data: {
        truthState: 'BLOCKED',
        audit: {
          coverage: { total: 10, gatePercentage: 50 },
          suspiciousRoutes: [{ method: 'POST', path: '/api/hack', line: 42, category: 'Unsafe Execution' }]
        }
      }
    });

    render(<SecurityAuditPanel />);
    await waitFor(() => {
      expect(screen.getByText(/Suspicious Routes/i)).toBeDefined();
      expect(screen.getByText('POST /api/hack')).toBeDefined();
    });
  });

  it('renders verified built state when no suspicious routes', async () => {
    auditClient.getSecurityAudit.mockResolvedValue({
      ok: true,
      data: {
        truthState: 'VERIFIED',
        audit: {
          coverage: { total: 10, gatePercentage: 100 },
          suspiciousRoutes: []
        }
      }
    });

    render(<SecurityAuditPanel />);
    await waitFor(() => {
      expect(screen.queryByText(/Suspicious Routes/i)).toBeNull();
      expect(screen.getByText('100%')).toBeDefined();
    });
  });

  it('renders ERROR when bridge fails', async () => {
    auditClient.getSecurityAudit.mockRejectedValue(new Error('Connection Refused'));
    render(<SecurityAuditPanel />);
    await waitFor(() => {
      expect(screen.getByText(/Connection Refused/i)).toBeDefined();
    });
  });
});
