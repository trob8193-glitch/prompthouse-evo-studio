import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  buildSecurityBlockResponse,
  requireDeployApproval,
  requireCommerceApproval,
  requireSelfImplementationApproval,
  requireProviderCredentials,
  requireConfigWriteAuth,
} from '../server/middleware/security-gates.js';

// Mock Express req/res/next
function mockReqResNext(overrides = {}) {
  const req = {
    method: 'POST',
    headers: {},
    body: {},
    path: '/test',
    ...overrides,
  };
  let statusCode = null;
  let responseBody = null;
  const res = {
    status(code) { statusCode = code; return res; },
    json(body) { responseBody = body; return res; },
  };
  let nextCalled = false;
  const next = () => { nextCalled = true; };
  return { req, res, next, getStatus: () => statusCode, getBody: () => responseBody, didNext: () => nextCalled };
}

describe('Security Gates Middleware', () => {
  const originalEnv = { ...process.env };
  afterEach(() => { process.env = { ...originalEnv }; });

  describe('buildSecurityBlockResponse', () => {
    it('builds structured block response', () => {
      const resp = buildSecurityBlockResponse('BLOCKED', 'test reason', { scope: 'deploy' });
      expect(resp.ok).toBe(false);
      expect(resp.blocked).toBe(true);
      expect(resp.truthState).toBe('BLOCKED');
      expect(resp.reason).toBe('test reason');
      expect(resp.required.scope).toBe('deploy');
    });
  });

  describe('requireDeployApproval', () => {
    it('blocks when no owner approval', () => {
      const { req, res, next, getStatus, getBody, didNext } = mockReqResNext({ body: {} });
      requireDeployApproval(req, res, next);
      expect(didNext()).toBe(false);
      expect(getStatus()).toBe(403);
      expect(getBody().truthState).toBe('NEEDS_OWNER_APPROVAL');
    });

    it('passes with valid approval', () => {
      const { req, res, next, didNext } = mockReqResNext({
        body: {
          ownerApproval: {
            granted: true,
            grantedAt: new Date().toISOString(),
            actor: 'studio_owner',
            scope: 'deploy',
            receiptId: 'rcpt_test',
          },
        },
      });
      requireDeployApproval(req, res, next);
      expect(didNext()).toBe(true);
    });
  });

  describe('requireCommerceApproval', () => {
    it('blocks when no owner approval', () => {
      const { req, res, next, getStatus, getBody, didNext } = mockReqResNext({ body: {} });
      requireCommerceApproval(req, res, next);
      expect(didNext()).toBe(false);
      expect(getStatus()).toBe(403);
      expect(getBody().truthState).toBe('NEEDS_OWNER_APPROVAL');
    });

    it('passes with valid commerce approval', () => {
      const { req, res, next, didNext } = mockReqResNext({
        body: {
          ownerApproval: {
            granted: true,
            grantedAt: new Date().toISOString(),
            actor: 'studio_owner',
            scope: 'commerce',
            receiptId: 'rcpt_test',
          },
        },
      });
      requireCommerceApproval(req, res, next);
      expect(didNext()).toBe(true);
    });
  });

  describe('requireSelfImplementationApproval', () => {
    it('allows verification-only mode without approval', () => {
      const { req, res, next, didNext } = mockReqResNext({ body: { applyFixes: false } });
      requireSelfImplementationApproval(req, res, next);
      expect(didNext()).toBe(true);
    });

    it('blocks applyFixes true without approval or master key', () => {
      delete process.env.PH_EVO_MASTER_KEY;
      const { req, res, next, getStatus, getBody, didNext } = mockReqResNext({
        body: { applyFixes: true },
        headers: {},
      });
      requireSelfImplementationApproval(req, res, next);
      expect(didNext()).toBe(false);
      expect(getStatus()).toBe(403);
      expect(getBody().truthState).toBe('NEEDS_OWNER_APPROVAL');
    });

    it('allows applyFixes true with master key', () => {
      process.env.PH_EVO_MASTER_KEY = 'test-master-key-123';
      const { req, res, next, didNext } = mockReqResNext({
        body: { applyFixes: true },
        headers: { 'x-master-key': 'test-master-key-123' },
      });
      requireSelfImplementationApproval(req, res, next);
      expect(didNext()).toBe(true);
    });

    it('allows applyFixes true with valid owner approval', () => {
      delete process.env.PH_EVO_MASTER_KEY;
      const { req, res, next, didNext } = mockReqResNext({
        body: {
          applyFixes: true,
          ownerApproval: {
            granted: true,
            grantedAt: new Date().toISOString(),
            actor: 'studio_owner',
            scope: 'self_implementation',
            receiptId: 'rcpt_test',
          },
        },
        headers: {},
      });
      requireSelfImplementationApproval(req, res, next);
      expect(didNext()).toBe(true);
    });
  });

  describe('requireProviderCredentials', () => {
    it('blocks when credential missing', () => {
      delete process.env.OPENAI_API_KEY;
      const middleware = requireProviderCredentials('OPENAI_API_KEY', 'openai');
      const { req, res, next, getStatus, getBody, didNext } = mockReqResNext();
      middleware(req, res, next);
      expect(didNext()).toBe(false);
      expect(getStatus()).toBe(403);
      expect(getBody().truthState).toBe('NEEDS_CREDENTIALS');
    });

    it('passes when credential present', () => {
      process.env.OPENAI_API_KEY = 'sk-test-key';
      const middleware = requireProviderCredentials('OPENAI_API_KEY', 'openai');
      const { req, res, next, didNext } = mockReqResNext();
      middleware(req, res, next);
      expect(didNext()).toBe(true);
    });

    it('never returns actual secret in block response', () => {
      delete process.env.STRIPE_SECRET_KEY;
      const middleware = requireProviderCredentials('STRIPE_SECRET_KEY', 'stripe');
      const { req, res, next, getBody } = mockReqResNext();
      middleware(req, res, next);
      const body = getBody();
      expect(JSON.stringify(body)).not.toContain('sk-test');
    });
  });

  describe('requireConfigWriteAuth', () => {
    it('blocks without auth token or master key', () => {
      delete process.env.PH_EVO_MASTER_KEY;
      const { req, res, next, getStatus, getBody, didNext } = mockReqResNext({
        headers: {},
      });
      requireConfigWriteAuth(req, res, next);
      expect(didNext()).toBe(false);
      expect(getStatus()).toBe(401);
      expect(getBody().truthState).toBe('BLOCKED');
    });

    it('passes with master key', () => {
      process.env.PH_EVO_MASTER_KEY = 'master-123';
      const { req, res, next, didNext } = mockReqResNext({
        headers: { 'x-master-key': 'master-123' },
      });
      requireConfigWriteAuth(req, res, next);
      expect(didNext()).toBe(true);
    });

    it('passes with bearer token', () => {
      delete process.env.PH_EVO_MASTER_KEY;
      const { req, res, next, didNext } = mockReqResNext({
        headers: { authorization: 'Bearer some-jwt-token' },
      });
      requireConfigWriteAuth(req, res, next);
      expect(didNext()).toBe(true);
    });
  });
});
