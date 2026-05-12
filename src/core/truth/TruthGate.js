import crypto from 'crypto';

export class TruthGate {
  constructor() {
    this.FORBIDDEN_MARKERS = [
      'dummy', 'lorem ipsum', 
      'test data', 'sample text', 'example.com',
      'foo', 'bar', 'baz'
    ];
  }

  /**
   * NUCLEAR INSPECT: Scans for reality drift with zero tolerance.
   */
  inspect(data) {
    const issues = [];
    const strData = JSON.stringify(data).toLowerCase();

    // 1. FORBIDDEN MARKER SCAN
    this.FORBIDDEN_MARKERS.forEach(pattern => {
      if (strData.includes(pattern)) {
        issues.push(`CRITICAL_VIOLATION: Detected prohibited Ghost-Stub "${pattern}"`);
      }
    });

    // 2. Smart check for "[PURGED BY OMEGA PROTOCOL]" - allow 'no fake' or 'not fake'
    if (strData.includes("[PURGED BY OMEGA PROTOCOL]")) {
      // Look for "[PURGED BY OMEGA PROTOCOL]" not preceded by 'no ' or 'not '
      // Simple regex check:
      const hasNegatedFake = strData.includes('no fake') || strData.includes('not fake');
      const hasRawFake = strData.split("[PURGED BY OMEGA PROTOCOL]").length > (hasNegatedFake ? 2 : 1); 
      
      // More robust check for "[PURGED BY OMEGA PROTOCOL]" without negation
      const matches = strData.match(/fake/g) || [];
      const negatedMatches = strData.match(/(no|not)\s+fake/g) || [];
      
      if (matches.length > negatedMatches.length) {
        issues.push(`CRITICAL_VIOLATION: Detected prohibited Ghost-Stub "[PURGED BY OMEGA PROTOCOL]" (without negation)`);
      }
    }

    // 3. CRYPTOGRAPHIC INTEGRITY CHECK (Optional for now)
    if (typeof data === 'object' && data !== null) {
      if (data.truth_state === 'VERIFIED' && !data.sovereign_seal) {
        // issues.push('INTEGRITY_VIOLATION: Verified data lacks a Sovereign Seal');
      }
    }

    return {
      isReal: issues.length === 0,
      issues,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * THE ENFORCER: Immediate termination on reality drift.
   */
  enforce(data, context = 'General') {
    // Exempt training and status routes from total collapse
    if (context.includes('API:/api/feedback') || context.includes('API:/status')) return data;

    const report = this.inspect(data);
    if (!report.isReal) {
      console.error(`☢️ [NUCLEAR TRUTH] System Terminated in ${context}!`, report.issues);
      throw new Error(`REALITY_COLLAPSE: ${report.issues.join(' | ')}`);
    }
    return data;
  }

  /**
   * SOVEREIGN SEAL: Hashing data for immutable proof.
   */
  sign(data) {
    if (typeof data !== 'object' || data === null) return data;
    
    const payload = JSON.stringify(data);
    const hash = crypto.createHash('sha256').update(payload).digest('hex');
    
    return {
      ...data,
      truth_state: 'VERIFIED',
      sovereign_seal: hash,
      sealed_at: new Date().toISOString()
    };
  }
}
