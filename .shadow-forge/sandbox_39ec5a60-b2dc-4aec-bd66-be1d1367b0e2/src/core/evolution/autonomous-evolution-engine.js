import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DATA_DIR = () => path.join(process.cwd(), '.prompthouse-data', 'evolution');

function ensureDir(subDir = '') {
  const dir = subDir ? path.join(DATA_DIR(), subDir) : DATA_DIR();
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

/**
 * Builds a capability graph by scanning the project's modules, routes, and engines.
 */
export function buildCapabilityGraph(options = {}) {
  const rootDir = options.rootDir || process.cwd();
  const moduleDirs = ['src/core', 'lib', 'server/routes', 'generated_apis'];

  let moduleCount = 0;
  let routeCount = 0;
  const modules = [];

  for (const dir of moduleDirs) {
    const fullPath = path.join(rootDir, dir);
    if (!fs.existsSync(fullPath)) continue;

    try {
      const entries = fs.readdirSync(fullPath, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          moduleCount++;
          modules.push({ name: entry.name, path: path.join(dir, entry.name), type: 'module' });
        } else if (entry.name.endsWith('.js') || entry.name.endsWith('.mjs')) {
          if (dir.includes('routes') || dir.includes('apis')) routeCount++;
          modules.push({ name: entry.name, path: path.join(dir, entry.name), type: 'file' });
        }
      }
    } catch {}
  }

  const graphContent = JSON.stringify({ modules: moduleCount, routes: routeCount, files: modules.length });
  const hash = crypto.createHash('sha256').update(graphContent).digest('hex');

  return {
    hash,
    summary: { modules: moduleCount, routes: routeCount, totalFiles: modules.length },
    generatedAt: new Date().toISOString()
  };
}

/**
 * Enforces evolution budget limits per cycle.
 */
export function enforceEvolutionBudget(options = {}) {
  const { maxFilesPerCycle = 3, maxCssRulesPerCycle = 5, currentFileCount = 0, currentCssCount = 0 } = options;

  const violations = [];
  if (currentFileCount > maxFilesPerCycle) {
    violations.push(`File mutation limit exceeded: ${currentFileCount}/${maxFilesPerCycle}`);
  }
  if (currentCssCount > maxCssRulesPerCycle) {
    violations.push(`CSS rule limit exceeded: ${currentCssCount}/${maxCssRulesPerCycle}`);
  }
  if (options.budget && options.candidateCode) {
    const originalLines = (options.originalCode || '').split('\n').length;
    const candidateLines = options.candidateCode.split('\n').length;
    if (options.budget.maxChangedLines && Math.abs(candidateLines - originalLines) > options.budget.maxChangedLines) {
       violations.push('Line change limit exceeded');
    }
  }

  return {
    success: violations.length === 0,
    violations,
    budget: { maxFilesPerCycle, maxCssRulesPerCycle },
    current: { files: currentFileCount, cssRules: currentCssCount }
  };
}

/**
 * Runs a patch tournament — evaluates competing proposals and selects the winner.
 */
export async function runPatchTournament(options = {}) {
  const proposals = options.candidates || options.proposals || [];

  if (proposals.length === 0) {
    return { winner: null, ranking: [], reason: 'No proposals to evaluate' };
  }

  // Score each proposal based on: blockedReasons (fewer=better), change type priority, file existence
  const scored = proposals.map(p => {
    let score = 100;
    score -= (p.blockedReasons?.length || 0) * 20;
    if (p.changeType === 'css') score += 10; // CSS is safer
    if (p.changeType === 'architecture') score -= 10; // Architecture is riskier
    if (p.fileExists) score += 5;
    if (options.originalCode && p.code === options.originalCode) score -= 50; // Penalize unchanged code

    // [CRITIC TETHER] Penalize proposals with code that looks syntactically broken
    const code = p.files?.[0]?.proposedChange || '';
    if (code && p.changeType !== 'css') {
      try {
        if (code.includes('while(true)') || code.includes('while (true)')) score -= 30;
        const opens = (code.match(/{/g) || []).length;
        const closes = (code.match(/}/g) || []).length;
        if (Math.abs(opens - closes) > 1) score -= 25; // Unbalanced braces = likely broken
      } catch {}
    }

    return { ...p, tournamentScore: Math.max(0, score) };
  });

  scored.sort((a, b) => b.tournamentScore - a.tournamentScore);

  return {
    winner: scored[0],
    ranking: scored.map(s => ({ id: s.id, score: s.tournamentScore, changeType: s.changeType }))
  };
}

/**
 * Appends a failure entry to the failure memory file.
 */
export function appendFailureMemory(file, data) {
  const filePath = file || path.join(ensureDir(), 'failure_memory.jsonl');
  const entry = { ...data, timestamp: new Date().toISOString() };
  fs.writeFileSync(filePath, JSON.stringify(entry) + '\n', { flag: 'a', encoding: 'utf8' });
}

/**
 * Reads failure memory entries.
 */
export function readFailureMemory(file, options = {}) {
  const filePath = file || path.join(DATA_DIR(), 'failure_memory.jsonl');
  const limit = options.limit || 50;

  if (!fs.existsSync(filePath)) return [];
  try {
    return fs.readFileSync(filePath, 'utf8').trim().split('\n').filter(Boolean).slice(-limit).map(line => {
      try { return JSON.parse(line); } catch { return null; }
    }).filter(Boolean);
  } catch { return []; }
}

/**
 * Builds a recovery plan from failure patterns.
 */
export function buildRecoveryPlan(failures = []) {
  if (failures.length === 0) return { topStage: 'none', repeatedFailureCount: 0, actions: [] };

  // Count failure stages
  const stageCounts = {};
  for (const f of failures) {
    const stage = f.stage || f.truthState || 'unknown';
    stageCounts[stage] = (stageCounts[stage] || 0) + 1;
  }

  const sorted = Object.entries(stageCounts).sort((a, b) => b[1] - a[1]);
  const topStage = sorted[0]?.[0] || 'unknown';
  const repeatedFailureCount = sorted[0]?.[1] || 0;

  const actions = [];
  if (topStage === 'SHADOW_BUILD_FAILED') actions.push('Reduce mutation aggressiveness');
  if (topStage === 'APPLY_FAILED') actions.push('Check file permissions and path validity');
  if (topStage === 'ERROR') actions.push('Review API key validity and network connectivity');
  if (repeatedFailureCount >= 3) actions.push('Consider engaging kill switch temporarily');

  return { topStage, repeatedFailureCount, actions, stageCounts };
}

/**
 * Appends a reality receipt to the receipt log.
 */
export function appendRealityReceipt(file, data) {
  const filePath = file || path.join(ensureDir(), 'reality_receipts.jsonl');
  const entry = { ...data, receiptedAt: new Date().toISOString() };
  fs.writeFileSync(filePath, JSON.stringify(entry) + '\n', { flag: 'a', encoding: 'utf8' });
}

/**
 * Loads reality receipts.
 */
export function loadRealityReceipts(file, limit = 50) {
  const filePath = file || path.join(DATA_DIR(), 'reality_receipts.jsonl');
  if (!fs.existsSync(filePath)) return [];
  try {
    return fs.readFileSync(filePath, 'utf8').trim().split('\n').filter(Boolean).slice(-limit).map(line => {
      try { return JSON.parse(line); } catch { return null; }
    }).filter(Boolean);
  } catch { return []; }
}

/**
 * Builds a replay theater view of evolution runs.
 */
export function buildEvolutionReplayTheater(runs = []) {
  const statusMix = {};
  for (const run of runs) {
    const state = run.truthState || run.status || 'unknown';
    statusMix[state] = (statusMix[state] || 0) + 1;
  }

  const applied = runs.filter(r => r.applied === true);
  const failed = runs.filter(r => r.truthState === 'ERROR' || r.truthState === 'APPLY_FAILED');

  return {
    total: runs.length,
    statusMix,
    appliedCount: applied.length,
    failedCount: failed.length,
    successRate: runs.length > 0 ? ((applied.length / runs.length) * 100).toFixed(1) + '%' : '0%',
    timeline: runs.slice(-10).map(r => ({
      id: r.id,
      state: r.truthState,
      at: r.completedAt || r.startedAt,
      suggestion: r.suggestion?.description || null
    }))
  };
}

/**
 * Builds a Nightforge challenge snapshot for the UI.
 */
export function buildNightforgeChallengeSnapshot(options = {}) {
  const runs = options.runs || [];
  const receipts = options.receipts || [];
  const todayRuns = runs.filter(r => {
    if (!r.startedAt) return false;
    const d = new Date(r.startedAt);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });

  const appliedToday = todayRuns.filter(r => r.applied === true).length + receipts.filter(r => r.status === 'verified').length;
  const cyclesToday = (options.nightforgeMetrics?.cyclesToday || 0) || todayRuns.length || receipts.length;
  const totalToday = todayRuns.length + receipts.length;
  let stability = totalToday > 0 ? Math.round((appliedToday / totalToday) * 100) : 100;

  if (options.nightforgeState && options.nightforgeState.totalCycles > 0) {
    stability = Math.round((options.nightforgeState.successfulCycles / options.nightforgeState.totalCycles) * 100);
  }

  return {
    activeChallenge: totalToday > 0 || cyclesToday > 0,
    kpi: {
      stability,
      cyclesToday: cyclesToday,
      evolutionsToday: appliedToday
    }
  };
}

/**
 * Pulls evolution ability receipts from disk.
 */
export function pullEvolutionabilityReceipts() {
  return loadRealityReceipts(null, 20);
}
