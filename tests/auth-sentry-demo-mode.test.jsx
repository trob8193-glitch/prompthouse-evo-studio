import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { AuthSentry } from '../src/features/AuthSentry.jsx';
import { useSovereignStore } from '../src/store.js';

describe('AuthSentry local development entry', () => {
  beforeEach(() => {
    localStorage.clear();
    useSovereignStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      authLoading: false,
      authError: null
    });
  });

  it('enters the studio through the local development button', () => {
    render(
      <AuthSentry>
        <div>Studio Shell Ready</div>
      </AuthSentry>
    );

    fireEvent.click(screen.getByText(/ENTER DEMO MODE/i));

    expect(screen.getByText('Studio Shell Ready')).toBeInTheDocument();
    expect(useSovereignStore.getState().isAuthenticated).toBe(true);
    expect(localStorage.getItem('ph_evo_token')).toBe('ph_evo_local_dev_session');
  });
});
