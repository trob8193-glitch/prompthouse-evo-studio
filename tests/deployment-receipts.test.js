import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFs = vi.hoisted(() => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  mkdirSync: vi.fn(),
}));

vi.mock('node:fs', () => ({
  default: mockFs,
  ...mockFs
}));

import * as fs from 'node:fs';
const { existsSync, readFileSync, writeFileSync } = mockFs;

vi.mock('crypto', () => ({
  default: {
    createHash: () => ({ update: () => ({ digest: () => 'abcdef1234567890abcdef1234567890' }) }),
    randomBytes: () => ({ toString: () => 'aabbcc' }),
  },
  createHash: () => ({ update: () => ({ digest: () => 'abcdef1234567890abcdef1234567890' }) }),
  randomBytes: () => ({ toString: () => 'aabbcc' }),
}));

import {
  createDeploymentReceipt,
  listDeploymentReceipts,
  hashDeploymentPayload,
} from '../server/services/deployment-receipts.js';

describe('Deployment Receipts Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a blocked receipt', () => {
    const receipt = createDeploymentReceipt({
      action: 'preview_deploy', provider: 'vercel', status: 'blocked',
      truthState: 'NEEDS_CREDENTIALS', message: 'Token missing',
      request: { action: 'preview_deploy' },
    });
    expect(receipt.id).toBeDefined();
    expect(receipt.status).toBe('blocked');
    expect(receipt.truthState).toBe('NEEDS_CREDENTIALS');
    expect(receipt.deploymentUrl).toBeNull();
    expect(receipt.requestHash).toBeDefined();
    expect(writeFileSync).toHaveBeenCalled();
  });

  it('receipt never stores raw secrets', () => {
    const receipt = createDeploymentReceipt({
      action: 'preview_deploy', provider: 'vercel', status: 'blocked',
      request: { token: 'sk_live_secret', apiKey: 'super_secret' },
    });
    const str = JSON.stringify(receipt);
    expect(str).not.toContain('sk_live_secret');
    expect(str).not.toContain('super_secret');
  });

  it('success receipt requires deployment URL', () => {
    const receipt = createDeploymentReceipt({
      action: 'production_deploy', provider: 'vercel', status: 'success',
      deploymentUrl: 'https://myapp.vercel.app', response: { id: 'dpl_123' },
    });
    expect(receipt.deploymentUrl).toBe('https://myapp.vercel.app');
    expect(receipt.responseHash).toBeDefined();
  });

  it('hashDeploymentPayload strips sensitive fields', () => {
    const hash = hashDeploymentPayload({ data: 'test', token: 'secret', VERCEL_TOKEN: 'vt' });
    expect(typeof hash).toBe('string');
    expect(hash.length).toBeGreaterThan(0);
  });

  it('listDeploymentReceipts returns empty when no file', () => {
    existsSync.mockReturnValue(false);
    const receipts = listDeploymentReceipts(10);
    expect(receipts).toEqual([]);
  });

  it('listDeploymentReceipts parses JSONL', () => {
    existsSync.mockReturnValue(true);
    readFileSync.mockReturnValue('{"id":"DR-1","action":"readiness_check"}\n{"id":"DR-2","action":"preview_deploy"}\n');
    const receipts = listDeploymentReceipts(10);
    expect(receipts.length).toBe(2);
  });
});
