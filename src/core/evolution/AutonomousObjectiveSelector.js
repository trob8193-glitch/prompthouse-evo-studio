import fs from 'fs';
import path from 'path';

function fileContains(rootDir, relPath, pattern) {
  const full = path.join(rootDir, relPath);
  if (!fs.existsSync(full)) return false;
  return pattern.test(fs.readFileSync(full, 'utf8'));
}

function routeExists(rootDir, route) {
  const routeFiles = [
    'promptbridge-server.js',
    'server/routes/studio-core.routes.js',
    'generated_apis/evo_llm_routes.js',
    'generated_apis/engine_dashboard_routes.js',
  ];
  return routeFiles.some((relPath) => fileContains(rootDir, relPath, new RegExp(route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))));
}

function fileExists(rootDir, relPath) {
  return fs.existsSync(path.join(rootDir, relPath));
}

export function selectAutonomousObjective({ rootDir = process.cwd(), memory = [], focusAreas = [] } = {}) {
  const candidates = [];

  if (fileContains(rootDir, 'src/self-implementation-policy.js', /(OMNIPOTENT|S\+\+\+\+|FULFILLED|100% functional|resonance)/)) {
    candidates.push({
      objective: 'Remove unverified self-evolution language and replace it with truth-gated policy states',
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

  if (fileContains(rootDir, 'scripts/ai_self_train.mjs', /\/api\/training-capture|\/api\/evo-runtime\/activate/)
    && (!routeExists(rootDir, '/api/training-capture') || !routeExists(rootDir, '/api/evo-runtime/activate'))) {
    candidates.push({
      objective: 'Wire AI self-training capture and Evo runtime activation routes end to end',
      category: 'training_runtime',
      risk: 'MEDIUM',
      impact: 95,
      confidence: 92,
    });
  }

  if (fileContains(rootDir, 'src/core/evo-llm/EvoLlmTrainingOrchestrator.js', /PROVIDER_FINE_TUNE_JOB_QUEUED/)
    || fileContains(rootDir, 'src/core/evo-llm/EvoLlmOrchestratorRun.js', /BLOCKED_PROVIDER_TRAINING_NOT_EXECUTED/)) {
    candidates.push({
      objective: 'Upgrade Evo LLM provider training from blocked or simulated states to proof-gated fine-tune job receipts',
      category: 'provider_training',
      risk: 'HIGH',
      impact: 90,
      confidence: 88,
    });
  }

  if (fileExists(rootDir, 'scripts/audit-route-drift.mjs')) {
    candidates.push({
      objective: 'Run route drift proof and repair missing bridge contracts before release',
      category: 'route_integrity',
      risk: 'LOW',
      impact: 72,
      confidence: 90,
    });
  }

  if (fileExists(rootDir, 'scripts/dead-surface-audit.mjs')) {
    candidates.push({
      objective: 'Run dead-surface audit and repair unreachable UI commands',
      category: 'ui_integrity',
      risk: 'LOW',
      impact: 68,
      confidence: 90,
    });
  }

  if (fileExists(rootDir, '_quarantine')) {
    candidates.push({
      objective: 'Review quarantined source movement and produce a proof-gated cleanup or restoration plan',
      category: 'source_integrity',
      risk: 'MEDIUM',
      impact: 85,
      confidence: 84,
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
