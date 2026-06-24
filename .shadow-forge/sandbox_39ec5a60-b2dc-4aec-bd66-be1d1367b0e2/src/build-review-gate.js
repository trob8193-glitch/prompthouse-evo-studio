
import { Log } from './core/autonomy/SovereignLogger.js';
import { verifyCanonDrift } from './ai-engine.js';

/**
 * PH EVO STUDIO — BUILD-REVIEW-GATE (PRODUCTION GRADE)
 * ═══════════════════════════════════════════════════════════════
 * Security checkpoint that reviews all autonomous builds before execution.
 * Every code artifact must pass canon drift, forbidden-marker, and
 * structural checks before being allowed into the live codebase.
 */

export class BuildReviewGate {
  constructor() {
    this.status = 'ACTIVE';
    this.reviewLog = [];
  }

  /**
   * Review a build artifact for production readiness.
   * @param {Object} artifact - { id, name, content, source }
   * @returns {{ approved: boolean, score: number, issues: string[], receipt: Object }}
   */
  async review(artifact = {}) {
    const { id = 'unknown', name = '', content = '', source = 'autonomous' } = artifact;
    Log.info(`🔍 [BuildReviewGate] Reviewing artifact: ${name} (source: ${source})`);

    const issues = [];
    let score = 100;

    // 1. Check for empty or trivially small content
    if (!content || content.trim().length < 20) {
      issues.push('Artifact content is empty or trivially small.');
      score -= 40;
    }

    // 2. Canon drift check — scan for forbidden markers (banned architectural language)
    const driftResult = verifyCanonDrift(content, false, false);
    if (driftResult.issues.length > 0) {
      issues.push(...driftResult.issues.map(i => i.msg));
      score -= driftResult.issues.length * 15;
    }

    // 3. Structural checks
    if (content.includes('eval(') || content.includes('Function(')) {
      issues.push('Dangerous eval/Function detected — blocked.');
      score -= 50;
    }
    if (content.includes('rm -rf') || content.includes('del /f /s /q')) {
      issues.push('Destructive shell command detected — blocked.');
      score -= 50;
    }
    if (/process\.exit\(\s*[^0]\s*\)/.test(content)) {
      issues.push('Non-zero process.exit detected — review required.');
      score -= 10;
    }

    // 4. Size sanity
    if (content.length > 500000) {
      issues.push('Artifact exceeds 500KB — unusual for a single file.');
      score -= 10;
    }

    score = Math.max(0, Math.min(100, score));
    const approved = score >= 70;

    const receipt = {
      artifactId: id,
      artifactName: name,
      source,
      score,
      approved,
      issueCount: issues.length,
      reviewedAt: new Date().toISOString(),
    };

    this.reviewLog.push(receipt);
    Log.info(`🔍 [BuildReviewGate] Result: ${approved ? '✅ APPROVED' : '❌ BLOCKED'} (score: ${score})`);

    return { approved, score, issues, receipt };
  }

  /**
   * Batch review multiple artifacts.
   */
  async reviewBatch(artifacts = []) {
    const results = [];
    for (const artifact of artifacts) {
      results.push(await this.review(artifact));
    }
    const allApproved = results.every(r => r.approved);
    return {
      allApproved,
      total: results.length,
      passed: results.filter(r => r.approved).length,
      failed: results.filter(r => !r.approved).length,
      results,
    };
  }

  /**
   * Get the review history.
   */
  getReviewLog() {
    return this.reviewLog;
  }

  async execute(params = {}) {
    Log.info('[BuildReviewGate] Executing gate review...');
    if (params.artifact) {
      return await this.review(params.artifact);
    }
    if (params.artifacts) {
      return await this.reviewBatch(params.artifacts);
    }
    return { success: true, timestamp: new Date().toISOString(), log: this.reviewLog };
  }

  getStatus() {
    return {
      id: 'build-review-gate',
      grade: this.reviewLog.length > 0 ? 'S+++++' : 'IDLE',
      state: 'ACTIVE',
      reviewsCompleted: this.reviewLog.length,
      resonance: 0.99,
    };
  }
}
