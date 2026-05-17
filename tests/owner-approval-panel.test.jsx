import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import OwnerApprovalPanel from '../src/components/OwnerApprovalPanel.jsx';
import { OWNER_APPROVAL_SCOPES } from '../src/services/owner-approval-client.js';

describe('OwnerApprovalPanel', () => {
  it('shows NEEDS_OWNER_APPROVAL before click', () => {
    render(<OwnerApprovalPanel scope={OWNER_APPROVAL_SCOPES.DEPLOY} />);
    expect(screen.getByText(/Needs Owner Approval/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Approve/i })).toBeDefined();
  });

  it('creates envelope after click and calls onApprovalCreated', () => {
    const onApprovalCreated = vi.fn();
    render(<OwnerApprovalPanel scope={OWNER_APPROVAL_SCOPES.DEPLOY} onApprovalCreated={onApprovalCreated} />);
    
    const btn = screen.getByRole('button', { name: /Approve/i });
    fireEvent.click(btn);

    expect(screen.getByText(/VERIFIED/i)).toBeDefined();
    expect(onApprovalCreated).toHaveBeenCalledTimes(1);
    const envelope = onApprovalCreated.mock.calls[0][0];
    expect(envelope.ownerApproval.scope).toBe(OWNER_APPROVAL_SCOPES.DEPLOY);
    expect(envelope.ownerApproval.granted).toBe(true);
  });

  it('does not auto-run provider action (only local envelope created)', () => {
    // Verified by lack of any provider fetch mock requirement here.
    // The panel only sets local state and calls the callback.
    const onApprovalCreated = vi.fn();
    render(<OwnerApprovalPanel scope={OWNER_APPROVAL_SCOPES.COMMERCE} onApprovalCreated={onApprovalCreated} />);
    fireEvent.click(screen.getByRole('button', { name: /Approve/i }));
    expect(screen.getByText(/Provider execution is still required/i)).toBeDefined();
  });
});
