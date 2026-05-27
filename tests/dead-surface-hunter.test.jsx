import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { DeadSurfaceHunterView } from '../src/proof-os-views.jsx';

describe('DeadSurfaceHunterView', () => {
  it('detects dead buttons and disconnected links', () => {
    // Render the view alongside mock buttons and links
    render(
      <div>
        <DeadSurfaceHunterView />
        
        {/* 1. Valid button with react handler */}
        <button onClick={() => {}}>Valid Button</button>
        
        {/* 2. Dead button (no click handler) */}
        <button>Dead Button</button>
        
        {/* 3. Disconnected / Invalid links */}
        <a href="#">Disconnected Link 1</a>
        <a href="javascript:void(0)">Disconnected Link 2</a>
        
        {/* 4. Valid external/internal link */}
        <a href="/dashboard">Valid Link</a>
      </div>
    );

    // Verify initial scanner state is ready
    expect(screen.getByText(/Scanner Ready/i)).toBeTruthy();

    // Trigger the DOM crawler scan
    const scanButton = screen.getByRole('button', { name: /Run Deep Scan/i });
    fireEvent.click(scanButton);

    // Verify correct count of dead/disconnected surfaces detected
    expect(screen.getByText(/3 Dead Surfaces Found/i)).toBeTruthy();
    expect(screen.getByText(/Dead Button: "Dead Button..."/i)).toBeTruthy();
    expect(screen.getByText(/Invalid link: "Disconnected Link 1..."/i)).toBeTruthy();
    expect(screen.getByText(/Invalid link: "Disconnected Link 2..."/i)).toBeTruthy();
  });
});
