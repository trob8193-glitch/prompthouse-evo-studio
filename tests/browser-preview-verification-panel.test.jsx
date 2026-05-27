import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import BrowserPreviewVerificationPanel from '../src/components/BrowserPreviewVerificationPanel.jsx';

describe('BrowserPreviewVerificationPanel', () => {
  it('renders checklist items', () => {
    render(<BrowserPreviewVerificationPanel />);
    expect(screen.getByText(/Preview URL exists/i)).toBeTruthy();
    expect(screen.getByText(/App shell/i)).toBeTruthy();
    expect(screen.getByText(/0 \/ 12 CHECKS VERIFIED/i)).toBeTruthy();
  });

  it('can toggle checks', () => {
    render(<BrowserPreviewVerificationPanel />);
    const item = screen.getByText(/Preview URL exists/i);
    fireEvent.click(item);
    expect(screen.getByText(/1 \/ 12 CHECKS VERIFIED/i)).toBeTruthy();
  });

  it('shows truth state as LOCAL_ONLY', () => {
    render(<BrowserPreviewVerificationPanel />);
    expect(screen.getByText(/Local Only/i)).toBeTruthy();
  });
});
