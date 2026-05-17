import { describe, it, expect } from 'vitest';
import { 
  classifySmokeCheckResult, 
  classifyPreviewAccessMode 
} from '../server/services/preview-access-decision.js';

describe('Preview Access Decision Service', () => {
  describe('classifySmokeCheckResult', () => {
    it('should return AUTH_PROTECTED for 401 error', () => {
      const report = { ok: false, error: 'HTTP 401: Unauthorized' };
      expect(classifySmokeCheckResult(report)).toBe('AUTH_PROTECTED');
    });

    it('should return PUBLIC_ACCESSIBLE for ok true', () => {
      const report = { ok: true };
      expect(classifySmokeCheckResult(report)).toBe('PUBLIC_ACCESSIBLE');
    });

    it('should return BLOCKED for other errors', () => {
      const report = { ok: false, error: 'HTTP 500: Internal Server Error' };
      expect(classifySmokeCheckResult(report)).toBe('BLOCKED');
    });

    it('should return UNKNOWN for null report', () => {
      expect(classifySmokeCheckResult(null)).toBe('UNKNOWN');
    });
  });

  describe('classifyPreviewAccessMode', () => {
    it('should return UNKNOWN if no receipt', () => {
      expect(classifyPreviewAccessMode(null, null)).toBe('UNKNOWN');
    });

    it('should return NEEDS_MANUAL_BROWSER_CHECK if no smoke report', () => {
      expect(classifyPreviewAccessMode({ id: 'test' }, null)).toBe('NEEDS_MANUAL_BROWSER_CHECK');
    });

    it('should delegate to classifySmokeCheckResult if smoke report exists', () => {
      const receipt = { id: 'test' };
      const report = { ok: false, error: 'HTTP 401: Unauthorized' };
      expect(classifyPreviewAccessMode(receipt, report)).toBe('AUTH_PROTECTED');
    });
  });
});
