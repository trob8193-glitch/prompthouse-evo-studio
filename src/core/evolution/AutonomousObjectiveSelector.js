import fs from 'fs';
import path from 'path';

function fileContains(rootDir, relPath, pattern) {
  const full = path.join(rootDir, relPath);
  if (!fs.existsSync(full)) return false;
  try {
    return pattern.test(fs.readFileSync(full, 'utf8'));
  } catch {
    return false;
  }
}

function fileExists(rootDir, relPath) {
  return fs.existsSync(path.join(rootDir, relPath));
}

/**
 * OBJECTIVE CATALOG
 * Each candidate defines: objective, category, risk, impact, confidence.
 * The selector scores them against memory + focus areas and picks the best.
 */
function buildObjectiveCatalog(rootDir) {
  const candidates = [];

  // ── Truth Language Cleanup ──────────────────────────────────
  if (fileContains(rootDir, 'src/self-implementation-policy.js', /(OMNIPOTENT|S\+\+\+\+|FULFILLED|100% functional|resonance)/)) {
    candidates.push({
      objective: 'Remove unverified self-evolution language and replace it with truth-gated policy states',
      category: 'truth_cleanup',
      risk: 'LOW',
      impact: 90,
      confidence: 95,
    });
  }

  // ── Hardcoded Bridge URL ────────────────────────────────────
  if (fileContains(rootDir, 'src/store.js', /const BRIDGE_URL = 'http:\/\/127\.0\.0\.1:3001';/)) {
    candidates.push({
      objective: 'Replace hardcoded bridge URL with env-aware Vite fallback',
      category: 'config',
      risk: 'LOW',
      impact: 80,
      confidence: 90,
    });
  }

  // ── Dead Export Cleanup ─────────────────────────────────────
  if (fileContains(rootDir, 'src/engine.js', /export\s+(const|function|class)\s+\w+/)) {
    candidates.push({
      objective: 'Scan engine.js for unused exports and mark them for deprecation',
      category: 'code_health',
      risk: 'LOW',
      impact: 40,
      confidence: 80,
    });
  }

  // ── Missing Error Boundaries ────────────────────────────────
  if (fileExists(rootDir, 'src/features') && !fileContains(rootDir, 'src/features/index.jsx', /ErrorBoundary/)) {
    candidates.push({
      objective: 'Add ErrorBoundary wrappers to feature views that lack them',
      category: 'resilience',
      risk: 'LOW',
      impact: 70,
      confidence: 85,
    });
  }

  // ── CSS Variable Audit ──────────────────────────────────────
  if (fileExists(rootDir, 'src/index.css')) {
    candidates.push({
      objective: 'Audit CSS variables for unused declarations and missing fallbacks',
      category: 'style_health',
      risk: 'LOW',
      impact: 35,
      confidence: 90,
    });
  }

  // ── Import Cycle Detection ──────────────────────────────────
  candidates.push({
    objective: 'Run import graph analysis to detect circular dependencies',
    category: 'code_health',
    risk: 'LOW',
    impact: 55,
    confidence: 95,
  });

  // ── Fallback: diagnostics-only pass ─────────────────────────
  if (candidates.length === 0) {
    candidates.push({
      objective: 'Run watch-mode scan and update self-evolution receipt ledger without mutating files',
      category: 'diagnostics',
      risk: 'LOW',
      impact: 20,
      confidence: 100,
    });
  }

  return candidates;
}

export function selectAutonomousObjective({ rootDir = process.cwd(), memory = [], focusAreas = [] } = {}) {
  const candidates = buildObjectiveCatalog(rootDir);
  const focus = new Set(focusAreas || []);

  const scored = candidates.map(candidate => {
    // Memory-based scoring: reward objectives that have historically succeeded
    const recurrence = memory.find(item =>
      candidate.objective.toLowerCase().includes(String(item.pattern || '').toLowerCase())
    );
    const recurrenceScore = recurrence
      ? Math.max(0, (recurrence.successfulFixes || 0) - (recurrence.failedFixes || 0)) * 5
      : 0;

    // Focus area bonus
    const focusBonus = focus.has(candidate.category) ? 15 : 0;

    // Risk penalty
    const riskPenalty = candidate.risk === 'LOW' ? 0 : candidate.risk === 'MEDIUM' ? 20 : 50;

    const score = candidate.impact + candidate.confidence + recurrenceScore + focusBonus - riskPenalty;

    return { ...candidate, score };
  });

  // Sort by score descending, pick the best
  scored.sort((a, b) => b.score - a.score);
  return scored[0];
}
