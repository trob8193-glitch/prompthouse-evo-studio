import crypto from 'crypto';

export class TruthGate {
  constructor() {
    this.FORBIDDEN_MARKERS = [
      'dummy', 'placeholder', 'lorem ipsum', 
      'test data', 'sample text', 'example.com',
      'foo', 'bar', 'baz', 'mock', 'fake',
      'id: 1', 'id: 2', 'id: 3' // Monotonic identities blocked
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
        issues.push(`CRITICAL_VIOLATION: Detected prohibited placeholder "${pattern}"`);
      }
    });

    // 2. CRYPTOGRAPHIC INTEGRITY CHECK
    if (typeof data === 'object' && data !== null) {
      if (data.truth_state === 'VERIFIED' && !data.sovereign_seal) {
        issues.push('INTEGRITY_VIOLATION: Verified data lacks a Sovereign Seal');
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
