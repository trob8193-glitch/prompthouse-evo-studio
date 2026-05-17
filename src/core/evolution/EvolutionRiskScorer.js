export function scoreEvolutionRisk({ proposal = {} } = {}) {
  const files = proposal.files || [];
  let score = 0;
  const reasons = [];
  const add = (points, reason) => {
    score += points;
    reasons.push(reason);
  };

  if (files.length > 5) add(15, 'Patch touches more than five files.');
  if (files.some(f => f.operation === 'delete')) add(30, 'Patch deletes files.');

  for (const file of files) {
    const p = String(file.path || '');
    if (/promptbridge-server\.js$/.test(p)) add(15, 'Patch touches bridge server.');
    if (/(auth|jwt|password|security|middleware)/i.test(p)) add(25, 'Patch touches auth/security surface.');
    if (/(stripe|billing|commerce|subscription|credits?)/i.test(p)) add(25, 'Patch touches billing/commerce surface.');
    if (/(vercel|deploy|deployment)/i.test(p)) add(25, 'Patch touches deployment surface.');
    if (/(db|database|schema|migration)/i.test(p)) add(25, 'Patch touches database/schema surface.');
    if (/(owner-approval|EvolutionPolicy|permission|agent)/i.test(p)) add(30, 'Patch touches approval, policy, or agent permission surface.');
    if (/(\.env|secret|token|key)/i.test(p)) add(50, 'Patch appears to touch secrets or environment keys.');
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
  return reasons.length ? `${level}: ${reasons.join(' ')}` : `${level}: no elevated risk factors detected.`;
}
