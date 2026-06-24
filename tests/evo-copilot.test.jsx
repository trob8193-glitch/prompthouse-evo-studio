import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EvoCopilot } from '../src/components/EvoCopilot.jsx';

// Mock Zustand store and canvas dependencies to isolate component logic
vi.mock('../src/store.js', () => ({
  useSovereignStore: vi.fn((selector) => {
    const mockStore = {
      activeFile: 'src/App.jsx',
      fileContent: 'mock content',
      addTerminalLogs: vi.fn(),
      setActivePage: vi.fn(),
      bondedNodes: [],
    };
    return selector(mockStore);
  })
}));

vi.mock('../src/lib/universal-transport.js', () => ({
  universalSend: vi.fn().mockResolvedValue({ message: "Mock assistant response" })
}));

describe('EvoCopilot', () => {
  it('renders without crashing and displays the initial greeting', () => {
    render(<EvoCopilot />);
    expect(screen.getByText(/Welcome to/i)).toBeDefined();
    expect(screen.getByText(/Evo Copilot/i)).toBeDefined();
  });

  it('renders quick action buttons', () => {
    render(<EvoCopilot />);
    // Check that some of the quick action buttons are present
    expect(screen.getByRole('button', { name: /Scan Debt/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Nuclear Audit/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Singularity/i })).toBeDefined();
  });

  it('populates input field when a quick action is clicked', () => {
    render(<EvoCopilot />);
    const scanDebtBtn = screen.getByRole('button', { name: /Scan Debt/i });
    fireEvent.click(scanDebtBtn);
    
    const input = screen.getByPlaceholderText(/Command Evo/i);
    expect(input.value).toContain('technical debt');
  });

  it('allows user input', () => {
    render(<EvoCopilot />);
    const input = screen.getByPlaceholderText(/Command Evo/i);
    fireEvent.change(input, { target: { value: 'Fix this bug' } });
    expect(input.value).toBe('Fix this bug');
  });
});
