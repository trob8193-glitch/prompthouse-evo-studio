import { describe, it, expect } from 'vitest';
import {
  SECURITY_ACTION_TYPES,
  classifyRouteSecurity,
  isMutationMethod,
  isProviderAction,
  isDeployAction,
  isCommerceAction,
  isSelfImplementationMutation,
  isFileWriteAction,
  isConfigWriteAction,
  getRequiredSecurityForRoute,
} from '../server/services/security-classifier.js';

describe('Security Classifier', () => {
  describe('isMutationMethod', () => {
    it('POST is mutation', () => expect(isMutationMethod('POST')).toBe(true));
    it('PUT is mutation', () => expect(isMutationMethod('PUT')).toBe(true));
    it('PATCH is mutation', () => expect(isMutationMethod('PATCH')).toBe(true));
    it('DELETE is mutation', () => expect(isMutationMethod('DELETE')).toBe(true));
    it('GET is not mutation', () => expect(isMutationMethod('GET')).toBe(false));
  });

  describe('path classifiers', () => {
    it('detects deploy paths', () => {
      expect(isDeployAction('/api/deploy/vercel')).toBe(true);
      expect(isDeployAction('/api/status')).toBe(false);
    });

    it('detects commerce paths', () => {
      expect(isCommerceAction('/api/commerce/checkout')).toBe(true);
      expect(isCommerceAction('/api/stripe/billing')).toBe(true);
      expect(isCommerceAction('/api/status')).toBe(false);
    });

    it('detects config write paths', () => {
      expect(isConfigWriteAction('/api/config/keys')).toBe(true);
      expect(isConfigWriteAction('/api/keys/create')).toBe(true);
      expect(isConfigWriteAction('/api/status')).toBe(false);
    });

    it('detects file write paths', () => {
      expect(isFileWriteAction('/api/files/write')).toBe(true);
      expect(isFileWriteAction('/api/forge/save')).toBe(true);
      expect(isFileWriteAction('/api/status')).toBe(false);
    });

    it('detects provider action paths', () => {
      expect(isProviderAction('/chat')).toBe(true);
      expect(isProviderAction('/api/evo-lm/chat')).toBe(true);
      expect(isProviderAction('/api/status')).toBe(false);
    });
  });

  describe('isSelfImplementationMutation', () => {
    it('applyFixes true is mutation', () => {
      expect(isSelfImplementationMutation('/api/self-implementation/cycle', { applyFixes: true })).toBe(true);
    });

    it('applyFixes false is not mutation', () => {
      expect(isSelfImplementationMutation('/api/self-implementation/cycle', { applyFixes: false })).toBe(false);
    });

    it('non-self-implementation path is not mutation', () => {
      expect(isSelfImplementationMutation('/api/status', { applyFixes: true })).toBe(false);
    });
  });

  describe('classifyRouteSecurity', () => {
    it('GET /status => READ_ONLY', () => {
      const result = classifyRouteSecurity('GET', '/api/status');
      expect(result.classifications).toContain('READ_ONLY');
      expect(result.classifications).not.toContain('MUTATION');
    });

    it('POST /api/deploy => DEPLOY_ACTION + OWNER_APPROVAL_REQUIRED', () => {
      const result = classifyRouteSecurity('POST', '/api/deploy/vercel');
      expect(result.classifications).toContain('DEPLOY_ACTION');
      expect(result.classifications).toContain('OWNER_APPROVAL_REQUIRED');
      expect(result.classifications).toContain('MUTATION');
    });

    it('POST /api/commerce/checkout => COMMERCE_ACTION + OWNER_APPROVAL_REQUIRED', () => {
      const result = classifyRouteSecurity('POST', '/api/commerce/checkout');
      expect(result.classifications).toContain('COMMERCE_ACTION');
      expect(result.classifications).toContain('OWNER_APPROVAL_REQUIRED');
    });

    it('POST /api/config/keys => CONFIG_WRITE + AUTH_REQUIRED', () => {
      const result = classifyRouteSecurity('POST', '/api/config/keys');
      expect(result.classifications).toContain('CONFIG_WRITE');
      expect(result.classifications).toContain('AUTH_REQUIRED');
    });

    it('POST /api/self-implementation/cycle with applyFixes true => SELF_IMPLEMENTATION_MUTATION', () => {
      const result = classifyRouteSecurity('POST', '/api/self-implementation/cycle', { body: { applyFixes: true } });
      expect(result.classifications).toContain('SELF_IMPLEMENTATION_MUTATION');
      expect(result.classifications).toContain('OWNER_APPROVAL_REQUIRED');
    });

    it('POST /api/self-implementation/cycle with applyFixes false => no SELF_IMPLEMENTATION_MUTATION', () => {
      const result = classifyRouteSecurity('POST', '/api/self-implementation/cycle', { body: { applyFixes: false } });
      expect(result.classifications).not.toContain('SELF_IMPLEMENTATION_MUTATION');
    });
  });

  describe('getRequiredSecurityForRoute', () => {
    it('returns full security envelope for deploy', () => {
      const env = getRequiredSecurityForRoute('POST', '/api/deploy/vercel', {});
      expect(env.isMutation).toBe(true);
      expect(env.requiresOwnerApproval).toBe(true);
      expect(env.approvalScope).toBe('deploy');
    });

    it('returns full security envelope for commerce', () => {
      const env = getRequiredSecurityForRoute('POST', '/api/commerce/checkout', {});
      expect(env.requiresOwnerApproval).toBe(true);
      expect(env.approvalScope).toBe('commerce');
    });

    it('returns isReadOnly for GET routes', () => {
      const env = getRequiredSecurityForRoute('GET', '/api/status', {});
      expect(env.isReadOnly).toBe(true);
      expect(env.isMutation).toBe(false);
    });
  });
});
