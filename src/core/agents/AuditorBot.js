export function runAuditorReview({ module = null, manifest = null } = {}) {
  const issues = [];
  const warnings = [];

  if (!module) issues.push('No module evidence supplied.');
  if (!manifest) issues.push('No proof manifest supplied.');

  if (module && Number(module.score || 0) < 90) {
    issues.push(`Module score ${module.score}% needs review.`);
  }

  if (module && module.grade !== 'A') {
    warnings.push(`Module grade is ${module.grade}.`);
  }

  if (Array.isArray(module?.missing) && module.missing.length > 0) {
    warnings.push(`Missing maturity checks: ${module.missing.map(item => item.label || item.key).join('; ')}`);
  }

  return {
    truthState: issues.length ? 'AUDITOR_REVIEW_REQUIRED' : 'AUDITOR_PASS',
    approved: issues.length === 0,
    issues,
    warnings,
    reviewedAt: new Date().toISOString()
  };
}

export default { runAuditorReview };
