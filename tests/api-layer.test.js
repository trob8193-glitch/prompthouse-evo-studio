import { describe, it, expect } from 'vitest';
import { ApiKeyManager } from '../src/core/api/api_keys.js';
import { AppRegistry } from '../src/core/api/app_registry.js';
import { DatasetBuilder } from '../src/core/api/dataset_build.js';
import { ModelInference } from '../src/core/api/model_inference.js';
import { ModelRegistry } from '../src/core/api/model_registry.js';

// --- ApiKeyManager ---
describe('ApiKeyManager', () => {
  it('generates and validates keys with scopes', () => {
    const mgr = new ApiKeyManager();
    const { key } = mgr.generate('test-app', ['read', 'write']);
    const result = mgr.validate(key);
    expect(result.valid).toBe(true);
    expect(result.scopes).toContain('read');
  });

  it('revokes keys', () => {
    const mgr = new ApiKeyManager();
    const { key } = mgr.generate('app');
    mgr.revoke(key);
    expect(mgr.validate(key).valid).toBe(false);
  });

  it('rotates keys', () => {
    const mgr = new ApiKeyManager();
    const { key: oldKey } = mgr.generate('app', ['admin']);
    const newEntry = mgr.rotate(oldKey);
    expect(mgr.validate(oldKey).valid).toBe(false);
    expect(mgr.validate(newEntry.key).valid).toBe(true);
    expect(newEntry.scopes).toContain('admin');
  });

  it('getStatus is Grade A', () => {
    expect(new ApiKeyManager().getStatus().grade).toBe('A');
  });
});

// --- AppRegistry ---
describe('AppRegistry', () => {
  it('registers and retrieves apps', () => {
    const reg = new AppRegistry();
    expect(reg.register('app1', { version: '1.0' })).toBe(true);
    expect(reg.register('app1', {})).toBe(false);
    expect(reg.get('app1').config.version).toBe('1.0');
  });

  it('deactivates apps and filters listActive', () => {
    const reg = new AppRegistry();
    reg.register('a1', {}); reg.register('a2', {});
    reg.deactivate('a1');
    expect(reg.listActive().length).toBe(1);
    expect(reg.listActive()[0].id).toBe('a2');
  });

  it('getStatus is Grade A', () => {
    expect(new AppRegistry().getStatus().grade).toBe('A');
  });
});

// --- DatasetBuilder ---
describe('DatasetBuilder', () => {
  it('creates datasets and adds rows', () => {
    const db = new DatasetBuilder();
    expect(db.create('ds1', { name: 'Training Set' })).toBe(true);
    db.addRow('ds1', { input: 'hello', output: 'world' });
    expect(db.export('ds1').rowCount).toBe(1);
  });

  it('returns null for unknown datasets', () => {
    expect(new DatasetBuilder().get('nope')).toBeNull();
  });

  it('getStatus is Grade A', () => {
    expect(new DatasetBuilder().getStatus().grade).toBe('A');
  });
});

// --- ModelInference ---
describe('ModelInference', () => {
  it('infers and caches responses', async () => {
    const mi = new ModelInference();
    const r1 = await mi.infer('gpt-4', 'hello world');
    expect(r1.cached).toBe(false);
    const r2 = await mi.infer('gpt-4', 'hello world');
    expect(r2.cached).toBe(true);
  });

  it('bypasses cache with noCache flag', async () => {
    const mi = new ModelInference();
    await mi.infer('gpt-4', 'test');
    const r = await mi.infer('gpt-4', 'test', { noCache: true });
    expect(r.cached).toBe(false);
  });

  it('getStatus is Grade A', () => {
    expect(new ModelInference().getStatus().grade).toBe('A');
  });
});

// --- ModelRegistry ---
describe('ModelRegistry', () => {
  it('registers and retrieves models', () => {
    const reg = new ModelRegistry();
    expect(reg.register('gemini-pro', { maxTokens: 8192 })).toBe(true);
    expect(reg.register('gemini-pro', {})).toBe(false);
    expect(reg.get('gemini-pro').capabilities.maxTokens).toBe(8192);
  });

  it('deactivates models', () => {
    const reg = new ModelRegistry();
    reg.register('m1', {}); reg.register('m2', {});
    reg.deactivate('m1');
    expect(reg.listActive().map(m => m.id)).toEqual(['m2']);
  });

  it('getStatus is Grade A', () => {
    expect(new ModelRegistry().getStatus().grade).toBe('A');
  });
});
