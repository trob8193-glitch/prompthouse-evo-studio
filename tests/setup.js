/**
 * PH EVO STUDIO — VITEST SETUP
 * ═══════════════════════════════════════════════════════════════
 * Provides a production-grade JSDOM environment with all browser
 * API mocks required by the studio's React component tree.
 */
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// ─── Cleanup after each test ──────────────────────────────────
afterEach(() => {
  cleanup();
});

// ─── Storage Mock (localStorage / sessionStorage) ─────────────
function createStorageMock() {
  const store = new Map();
  return {
    getItem: (key) => store.get(String(key)) ?? null,
    setItem: (key, value) => store.set(String(key), String(value)),
    removeItem: (key) => store.delete(String(key)),
    clear: () => store.clear(),
    get length() { return store.size; },
    key: (index) => [...store.keys()][index] ?? null,
  };
}

if (typeof globalThis.localStorage === 'undefined' || !globalThis.localStorage?.getItem) {
  Object.defineProperty(globalThis, 'localStorage', { value: createStorageMock(), writable: true });
}
if (typeof globalThis.sessionStorage === 'undefined' || !globalThis.sessionStorage?.getItem) {
  Object.defineProperty(globalThis, 'sessionStorage', { value: createStorageMock(), writable: true });
}

// ─── Crypto Mock ──────────────────────────────────────────────
if (typeof globalThis.crypto === 'undefined') {
  Object.defineProperty(globalThis, 'crypto', {
    value: {
      randomUUID: () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`,
      getRandomValues: (arr) => {
        for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256);
        return arr;
      },
    },
    writable: true,
  });
}

// ─── ResizeObserver Mock ──────────────────────────────────────
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class ResizeObserver {
    constructor(callback) { this._callback = callback; }
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// ─── IntersectionObserver Mock ────────────────────────────────
if (typeof globalThis.IntersectionObserver === 'undefined') {
  globalThis.IntersectionObserver = class IntersectionObserver {
    constructor(callback) { this._callback = callback; }
    observe() {}
    unobserve() {}
    disconnect() {}
    get root() { return null; }
    get rootMargin() { return '0px'; }
    get thresholds() { return [0]; }
  };
}

// ─── matchMedia Mock ──────────────────────────────────────────
if (typeof globalThis.matchMedia === 'undefined') {
  globalThis.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}

// ─── URL.createObjectURL Mock ─────────────────────────────────
if (typeof URL.createObjectURL === 'undefined') {
  URL.createObjectURL = () => 'blob:mock-url';
  URL.revokeObjectURL = () => {};
}

// ─── Suppress noisy console.warn in tests ─────────────────────
const originalWarn = console.warn;
console.warn = (...args) => {
  const msg = String(args[0] || '');
  // Suppress React act() warnings and Vite deprecation noise during tests
  if (msg.includes('inside a test was not wrapped in act') || msg.includes('esbuild')) return;
  originalWarn.apply(console, args);
};
