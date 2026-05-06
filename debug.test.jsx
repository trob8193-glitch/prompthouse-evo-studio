import React from 'react';
import { render } from '@testing-library/react';
import { test, expect } from 'vitest';
import App from './src/App.jsx';

test('App mounts without crashing', () => {
  try {
    const { container } = render(<App />);
    console.log("RENDER SUCCESS!");
  } catch (error) {
    console.error("RENDER FAILED:", error);
    throw error;
  }
});
