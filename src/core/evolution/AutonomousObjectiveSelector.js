import fs from 'fs';
import path from 'path';

const OBJECTIVE_HISTORY_FILE = () => path.join(process.cwd(), '.prompthouse-data', 'evolution', 'objective_history.jsonl');

/**
 * Selects the next autonomous evolution objective based on:
 * - Recent failure memory (what keeps breaking)
 * - Current stability scores (what's weakest)
 * - Evolution run history (what hasn't been touched)
 * - Focus area weights from settings
 */
export function selectAutonomousObjective(options = {}) {
  const {
    focusAreas = [],
    failureMemory = [],
    recentRuns = [],
    stabilityScores = {}
  } = options;

  const categories = [
    { id: 'source_integrity', weight: 1.0, label: 'Source Code Integrity' },
    { id: 'training_runtime', weight: 0.9, label: 'Training Runtime Optimization' },
    { id: 'css_evolution', weight: 0.8, label: 'CSS/Theme Evolution' },
    { id: 'architecture_hardening', weight: 0.7, label: 'Architecture Hardening' },
    { id: 'performance', weight: 0.6, label: 'Performance Optimization' },
    { id: 'security', weight: 0.5, label: 'Security Audit' }
  ];

  // Boost weight for categories with recent failures
  const failureCounts = {};
  for (const failure of failureMemory) {
    const cat = failure.category || 'source_integrity';
    failureCounts[cat] = (failureCounts[cat] || 0) + 1;
  }

  // Boost weight for focused areas
  const focusSet = new Set(focusAreas);

  // Score each category
  const scored = categories.map(cat => {
    let score = cat.weight;
    if (failureCounts[cat.id]) score += failureCounts[cat.id] * 0.3;
    if (focusSet.has(cat.id)) score += 0.5;
    if (stabilityScores[cat.id] !== undefined) score += (1.0 - stabilityScores[cat.id]) * 0.4;

    // Detect missing features in workspace
    if (options.rootDir && cat.id === 'training_runtime') {
      const aiTrainScript = path.join(options.rootDir, 'scripts/ai_self_train.mjs');
      const routesFile = path.join(options.rootDir, 'server/routes/studio-core.routes.js');
      if (fs.existsSync(aiTrainScript)) {
        score += 2.0; // Boost training runtime if script exists but maybe routes are missing
      }
    }

    // Penalize recently-run categories
    const recentCount = recentRuns.filter(r => r.suggestion?.category === cat.id).length;
    score -= recentCount * 0.1;

    return { ...cat, score: Math.max(0, score) };
  });

  scored.sort((a, b) => b.score - a.score);
  const selected = scored[0];

  // Log selection
  const historyEntry = {
    selectedAt: new Date().toISOString(),
    category: selected.id,
    score: selected.score,
    alternatives: scored.slice(1, 3).map(s => ({ id: s.id, score: s.score }))
  };

  try {
    const dir = path.dirname(OBJECTIVE_HISTORY_FILE());
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(OBJECTIVE_HISTORY_FILE(), JSON.stringify(historyEntry) + '\n', { flag: 'a', encoding: 'utf8' });
  } catch {}

  return {
    category: selected.id,
    label: selected.label,
    score: selected.score,
    reasoning: `Selected based on: weight=${selected.weight}, failures=${failureCounts[selected.id] || 0}, focused=${focusSet.has(selected.id)}`
  };
}
