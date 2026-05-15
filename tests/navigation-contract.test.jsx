import { describe, it, expect, vi, beforeAll } from 'vitest';

// Mock fetch and localStorage before any module imports
globalThis.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    headers: { get: () => 'application/json' },
  })
);

if (typeof globalThis.localStorage === 'undefined') {
  globalThis.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  };
}

describe('Navigation Contract', () => {
  let PAGE_MAP;
  let NAV_GROUPS;

  beforeAll(async () => {
    const appModule = await import('../src/App.jsx');
    PAGE_MAP = appModule.PAGE_MAP;

    const navModule = await import('../src/components/Navigation.jsx');
    NAV_GROUPS = navModule.NAV_GROUPS;
  }, 60000); // 60s timeout for heavy module import under resource contention

  it('PAGE_MAP is exported and is an object', () => {
    expect(PAGE_MAP).toBeDefined();
    expect(typeof PAGE_MAP).toBe('object');
    expect(Object.keys(PAGE_MAP).length).toBeGreaterThan(0);
  });

  it('NAV_GROUPS is exported and is an array', () => {
    expect(NAV_GROUPS).toBeDefined();
    expect(Array.isArray(NAV_GROUPS)).toBe(true);
    expect(NAV_GROUPS.length).toBeGreaterThan(0);
  });

  it('every nav item id exists in PAGE_MAP', () => {
    const missingPages = [];
    for (const group of NAV_GROUPS) {
      for (const item of group.items) {
        if (!PAGE_MAP[item.id]) {
          missingPages.push(`${group.label} → ${item.label} (id: "${item.id}")`);
        }
      }
    }

    if (missingPages.length > 0) {
      console.warn('\\n⚠️  Nav items without PAGE_MAP entries:');
      missingPages.forEach((m) => console.warn(`   - ${m}`));
    }

    expect(missingPages).toEqual([]);
  });

  it('PAGE_MAP values are valid components (functions)', () => {
    const invalid = [];
    for (const [key, value] of Object.entries(PAGE_MAP)) {
      if (typeof value !== 'function' && typeof value?.$$typeof !== 'symbol') {
        invalid.push(key);
      }
    }

    expect(invalid).toEqual([]);
  });

  it('no duplicate nav item ids exist', () => {
    const ids = [];
    const duplicates = [];

    for (const group of NAV_GROUPS) {
      for (const item of group.items) {
        if (ids.includes(item.id)) {
          duplicates.push(item.id);
        }
        ids.push(item.id);
      }
    }

    expect(duplicates).toEqual([]);
  });

  it('fallback dashboard page exists in PAGE_MAP', () => {
    expect(PAGE_MAP['dashboard']).toBeDefined();
    expect(typeof PAGE_MAP['dashboard']).toBe('function');
  });
});
