export const PROMOTION_THRESHOLDS = Object.freeze({
  production: 90,
  gamma: 75,
  beta: 50
});

export function normalizeStage(stage = 'production') {
  return String(stage || 'production').trim().toLowerCase();
}

export function evaluatePromotionPolicy({ module = null, targetStage = 'production', rollbackRef = null } = {}) {
  const stage = normalizeStage(targetStage);
  const requiredScore = PROMOTION_THRESHOLDS[stage] ?? PROMOTION_THRESHOLDS.production;
  const issues = [];

  if (!module) {
    issues.push('Module was not found in the maturity registry.');
    return { stage, requiredScore, issues, approved: false };
  }

  if (Number(module.score || 0) < requiredScore) {
    issues.push(`Maturity score ${module.score}% is below required ${requiredScore}% for ${stage}.`);
  }

  if (stage === 'production' && module.grade !== 'A') {
    issues.push(`Production requires grade A. Current grade: ${module.grade}.`);
  }

  if (Array.isArray(module.missing) && module.missing.length > 0) {
    issues.push(`Missing checks: ${module.missing.map(item => item.label || item.key).join('; ')}`);
  }

  if (stage === 'production' && !rollbackRef) {
    issues.push('Production review requires a rollback reference.');
  }

  return {
    stage,
    requiredScore,
    issues,
    approved: issues.length === 0
  };
}
