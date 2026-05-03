/**
 * PH EVO STUDIO — TRUTH ENFORCEMENT GATE
 * ═══════════════════════════════════════════════════════════════
 * This module is the ultimate arbiter of reality. It prevents the 
 * studio from ever operating on fake, dummy, or static data.
 * If a "Mock Pattern" is detected, the gate blocks the data and
 * signals the Sovereign Intelligence engine for an immediate fix.
 */

export class TruthGate {
  constructor() {
    this.MOCK_PATTERNS = [
      'dummy', 'placeholder', 'lorem ipsum', 
      'test data', 'sample text', 'example.com',
      'foo', 'bar', 'baz', 'mock'
    ];
    this.IDENTITY_MARKERS = ['id: 1', 'item 1', 'user 1'];
  }

  /**
   * Deep scan an object for "Un-Real" markers.
   * Returns { isReal: boolean, issues: string[] }
   */
  inspect(data) {
    const issues = [];
    const strData = JSON.stringify(data).toLowerCase();

    // 1. Pattern Check
    this.MOCK_PATTERNS.forEach(pattern => {
      if (strData.includes(pattern)) {
        issues.push(`Detected Fake Pattern: "${pattern}"`);
      }
    });

    // 2. Identity Monotony Check (e.g., id: 1, id: 2)
    if (strData.includes('"id":1') && strData.includes('"id":2') && strData.includes('"id":3')) {
      issues.push('Detected Monotonic Mock Identity (id: 1, 2, 3)');
    }

    // 3. Evidence Check
    if (typeof data === 'object' && data !== null) {
      if (!data.truth_state && !Array.isArray(data)) {
         // We don't block everything without a state yet, but we log it as a risk
         // issues.push('Missing TRUTH_STATE signature');
      }
    }

    return {
      isReal: issues.length === 0,
      issues,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * The Enforcer. 
   * If data is fake, it throws an Error to stop the leak.
   */
  enforce(data, context = 'General') {
    const report = this.inspect(data);
    if (!report.isReal) {
      console.error(`🚨 [TRUTH GATE] Reality Drift Detected in ${context}!`, report.issues);
      throw new Error(`TRUTH VIOLATION: ${report.issues.join(', ')}`);
    }
    return data;
  }

  /**
   * Signs real data with the Sovereign Seal.
   */
  sign(data) {
    if (typeof data !== 'object' || data === null) return data;
    return {
      ...data,
      truth_state: 'VERIFIED',
      evidence_id: `ev_${Math.random().toString(36).substring(7)}`,
      sealed_at: new Date().toISOString()
    };
  }
}
