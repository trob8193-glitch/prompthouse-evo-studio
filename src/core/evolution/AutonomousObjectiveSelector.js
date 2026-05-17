import fs from 'fs';
import path from 'path';

function fileContains(rootDir, relPath, pattern) {
  const full = path.join(rootDir, relPath);
  if (!fs.existsSync(full)) return false;
  return pattern.test(fs.readFileSync(full, 'utf8'));
}

export function selectAutonomousObjective({ rootDir = process.cwd(), memory = [], focusAreas = [] } = {}) {
  const candidates = [];

  if (fileContains(rootDir, 'src/self-implementation-policy.js', /(OMNIPOTENT|S\+\+\+\+|FULFILLED|100% functional|resonance)/)) {
    candidates.push({
      objective: 'Remove fake self-evolution language and replace it with truth-gated policy states',
      category: 'truth_cleanup',
      risk: 'LOW',
      impact: 90,
      confidence: 95,
    });
  }

  if (fileContains(rootDir, 'src/store.js', /const BRIDGE_URL = 'http:\/\/127\.0\.0\.1:3001';/)) {
    candidates.push({
      objective: 'Replace hardcoded bridge URL with env-aware Vite fallback',
      category: 'config',
      risk: 'LOW',
      impact: 80,
      confidence: 90,
    });
  }

  if (candidates.length === 0) {
    candidates.push({
      objective: 'Run watch-mode scan and update self-evolution receipt ledger without mutating files',
      category: 'diagnostics',
      risk: 'LOW',
      impact: 20,
      confidence: 100,
    });
  }

  const focus = new Set(focusAreas || []);
  const scored = candidates.map(candidate => {
    const recurrence = memory.find(item => candidate.objective.toLowerCase().includes(String(item.pattern || '').toLowerCase()));
    const recurrenceScore = recurrence ? Math.max(0, recurrence.successfulFixes - recurrence.failedFixes) * 5 : 0;
    const focusBonus = focus.has(candidate.category) ? 10 : 0;
    const riskPenalty = candidate.risk === 'LOW' ? 0 : candidate.risk === 'MEDIUM' ? 20 : 50;
    return {
      ...candidate,
      score: candidate.impact + candidate.confidence + recurrenceScore + focusBonus - riskPenalty,
    };
  });

  return scored.sort((a, b) => b.score - a.score)[0];
}
