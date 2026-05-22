/**
 * PH EVO STUDIO — EVOLUTION RISK SCORER
 * ═══════════════════════════════════════════════════════════════
 * Scores the risk of a patch proposal based on surface analysis.
 * Higher score = higher risk. Used by the Orchestrator to decide
 * whether owner approval is required.
 */

const SURFACE_PATTERNS = [
  { pattern: /promptbridge-server\.js$/, points: 15, reason: 'Patch touches bridge server.' },
  { pattern: /(auth|jwt|password|security|middleware)/i, points: 25, reason: 'Patch touches auth/security surface.' },
  { pattern: /(stripe|billing|commerce|subscription|credits?)/i, points: 25, reason: 'Patch touches billing/commerce surface.' },
  { pattern: /(vercel|deploy|deployment)/i, points: 25, reason: 'Patch touches deployment surface.' },
  { pattern: /(db|database|schema|migration)/i, points: 25, reason: 'Patch touches database/schema surface.' },
  { pattern: /(owner-approval|EvolutionPolicy|permission|agent)/i, points: 30, reason: 'Patch touches approval, policy, or agent permission surface.' },
  { pattern: /(\.env|secret|token|key)/i, points: 50, reason: 'Patch appears to touch secrets or environment keys.' },
  { pattern: /(KillSwitch|kill.?switch)/i, points: 40, reason: 'Patch touches kill switch surface.' },
  { pattern: /(EvolutionOrchestrator|AutonomousEvolution)/i, points: 30, reason: 'Patch touches self-evolution orchestration surface.' },
  { pattern: /package\.json$/i, points: 20, reason: 'Patch touches package manifest.' },
];

export function scoreEvolutionRisk({ proposal = {} } = {}) {
  const files = proposal.files || [];
  let score = 0;
  const reasons = [];
  const seenReasons = new Set();

  const add = (points, reason) => {
    if (seenReasons.has(reason)) return; // Deduplicate
    seenReasons.add(reason);
    score += points;
    reasons.push(reason);
  };

  // Volume-based risk
  if (files.length > 8) add(20, `Patch touches ${files.length} files (>8).`);
  else if (files.length > 5) add(10, `Patch touches ${files.length} files (>5).`);

  // Delete risk
  if (files.some(f => f.operation === 'delete')) add(30, 'Patch deletes files.');

  // Content size risk
  const totalContentLength = files.reduce((sum, f) => sum + (f.proposedContent?.length || 0), 0);
  if (totalContentLength > 50000) add(15, `Total patch content is large (${Math.round(totalContentLength / 1000)}KB).`);

  // Surface pattern matching
  for (const file of files) {
    const p = String(file.path || '');
    for (const { pattern, points, reason } of SURFACE_PATTERNS) {
      if (pattern.test(p)) add(points, reason);
    }
  }

  let level = 'LOW';
  if (score >= 70) level = 'CRITICAL';
  else if (score >= 40) level = 'HIGH';
  else if (score >= 18) level = 'MEDIUM';

  return { level, score, reasons };
}

export function explainRiskScore(result = {}) {
  const level = result.level || 'LOW';
  const reasons = result.reasons || [];
  return reasons.length
    ? `${level} (score: ${result.score || 0}): ${reasons.join(' ')}`
    : `${level}: no elevated risk factors detected.`;
}
