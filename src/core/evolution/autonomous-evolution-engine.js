import { createHash } from 'crypto';
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'fs';
import { extname, join, relative, resolve } from 'path';

const SOURCE_EXTENSIONS = new Set(['.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx']);
const UI_EXTENSIONS = new Set(['.jsx', '.tsx']);
const EXCLUDED_DIRS = new Set([
  '.git',
  'node_modules',
  'dist',
  'build',
  '.next',
  '.cache',
  '.prompthouse-data',
  'zip_temp',
  'zip_temp_chunk',
  'zip_temp_v1_2'
]);

function toPosixPath(value = '') {
  return String(value).replace(/\\/g, '/');
}

function safeReadText(filePath) {
  try {
    return readFileSync(filePath, 'utf8');
  } catch {
    return '';
  }
}

function collectSourceFiles(rootDir) {
  if (!existsSync(rootDir)) return [];
  const files = [];
  const stack = [rootDir];
  while (stack.length > 0) {
    const current = stack.pop();
    const entries = readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(current, entry.name);
      if (entry.isDirectory()) {
        if (!EXCLUDED_DIRS.has(entry.name)) stack.push(fullPath);
        continue;
      }
      if (SOURCE_EXTENSIONS.has(extname(entry.name).toLowerCase())) files.push(fullPath);
    }
  }
  return files;
}

function hashValue(value) {
  return createHash('sha256').update(String(value)).digest('hex');
}

function hashObject(value) {
  return hashValue(JSON.stringify(value));
}

function parseImports(filePath, content, rootDir) {
  const edges = [];
  const importRegex = /import\s+[^'"]*['"]([^'"]+)['"]/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const target = String(match[1] || '');
    if (!target.startsWith('.')) continue;
    const sourceAbsolute = resolve(rootDir, filePath);
    const targetAbsolute = resolve(sourceAbsolute, '..', target);
    const resolved = toPosixPath(relative(rootDir, targetAbsolute));
    edges.push({
      from: toPosixPath(filePath),
      to: resolved,
      type: 'import'
    });
  }
  return edges;
}

function parseRoutes(filePath, content) {
  const routes = [];
  const regex = /app\.(get|post|put|patch|delete)\(\s*['"`]([^'"`]+)['"`]/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    routes.push({
      id: `${match[1].toUpperCase()} ${match[2]}`,
      method: match[1].toUpperCase(),
      path: match[2],
      file: toPosixPath(filePath)
    });
  }
  return routes;
}

function parseFetchCalls(filePath, content) {
  const calls = [];
  const regex = /fetch\(\s*(['"`])([^'"`]+)\1(?:\s*,\s*({[\s\S]{0,260}?}))?\s*\)/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const rawUrl = String(match[2] || '');
    const options = String(match[3] || '');
    const methodMatch = options.match(/method\s*:\s*['"`](GET|POST|PUT|PATCH|DELETE)['"`]/i);
    calls.push({
      id: `${methodMatch ? methodMatch[1].toUpperCase() : 'GET'} ${rawUrl}`,
      method: methodMatch ? methodMatch[1].toUpperCase() : 'GET',
      path: rawUrl,
      file: toPosixPath(filePath)
    });
  }
  return calls;
}

function lineChangeCount(originalCode, nextCode) {
  const a = String(originalCode || '').split('\n');
  const b = String(nextCode || '').split('\n');
  const max = Math.max(a.length, b.length);
  let changed = 0;
  for (let i = 0; i < max; i += 1) {
    if ((a[i] || '') !== (b[i] || '')) changed += 1;
  }
  return changed;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function readJsonl(filePath, limit = 200) {
  if (!existsSync(filePath)) return [];
  const lines = safeReadText(filePath)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(limit * -1);

  const items = [];
  for (const line of lines) {
    try {
      items.push(JSON.parse(line));
    } catch {
      // keep runtime stable on malformed lines
    }
  }
  return items;
}

function appendJsonl(filePath, payload) {
  writeFileSync(filePath, `${JSON.stringify(payload)}\n`, { encoding: 'utf8', flag: 'a' });
}

export function buildCapabilityGraph({ workspaceRoot = process.cwd() } = {}) {
  const root = resolve(workspaceRoot);
  const srcRoot = join(root, 'src');
  const files = collectSourceFiles(srcRoot);
  const serverFile = join(root, 'promptbridge-server.js');
  if (existsSync(serverFile)) files.push(serverFile);

  const nodes = [];
  const edges = [];
  const routes = [];
  const fetchCalls = [];
  let functionCount = 0;
  let uiFileCount = 0;

  for (const absolutePath of files) {
    const content = safeReadText(absolutePath);
    if (!content) continue;
    const relativePath = toPosixPath(relative(root, absolutePath));
    const extension = extname(absolutePath).toLowerCase();
    const isUi = UI_EXTENSIONS.has(extension);
    if (isUi) uiFileCount += 1;
    nodes.push({
      id: relativePath,
      type: isUi ? 'ui_module' : 'module',
      path: relativePath
    });
    functionCount += (content.match(/\bfunction\s+[A-Za-z0-9_]+\s*\(/g) || []).length;
    functionCount += (content.match(/\b(?:const|let|var)\s+[A-Za-z0-9_]+\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/g) || []).length;
    edges.push(...parseImports(relativePath, content, root));
    routes.push(...parseRoutes(relativePath, content));
    fetchCalls.push(...parseFetchCalls(relativePath, content));
  }

  const summary = {
    modules: nodes.length,
    uiModules: uiFileCount,
    edges: edges.length,
    routes: routes.length,
    apiCalls: fetchCalls.length,
    functions: functionCount
  };

  const hash = hashObject({
    summary,
    nodes: nodes.map((item) => item.path).sort(),
    edges: edges.map((item) => `${item.from}>${item.to}`).sort(),
    routes: routes.map((item) => item.id).sort(),
    apiCalls: fetchCalls.map((item) => item.id).sort()
  });

  return {
    generatedAt: new Date().toISOString(),
    workspaceRoot: root,
    hash,
    summary,
    nodes,
    edges,
    routes,
    fetchCalls
  };
}

export function loadCapabilityBaseline(filePath) {
  if (!existsSync(filePath)) return null;
  try {
    return JSON.parse(safeReadText(filePath));
  } catch {
    return null;
  }
}

export function saveCapabilityBaseline(filePath, graph) {
  const payload = {
    updatedAt: new Date().toISOString(),
    hash: graph.hash,
    summary: graph.summary
  };
  writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf8');
  return payload;
}

export function computeCapabilityDrift(currentGraph, baselineGraph) {
  if (!baselineGraph) {
    return {
      score: 100,
      status: 'no_baseline',
      changed: false,
      deltas: {},
      baselineHash: null
    };
  }

  const deltas = {};
  const summaryKeys = ['modules', 'uiModules', 'edges', 'routes', 'apiCalls', 'functions'];
  for (const key of summaryKeys) {
    const prev = Number(baselineGraph.summary?.[key] || 0);
    const next = Number(currentGraph.summary?.[key] || 0);
    deltas[key] = next - prev;
  }

  const absoluteDrift = Object.values(deltas).reduce((sum, value) => sum + Math.abs(Number(value || 0)), 0);
  const score = clamp(100 - (absoluteDrift * 2), 0, 100);
  return {
    score,
    status: score >= 85 ? 'stable' : score >= 60 ? 'shifted' : 'volatile',
    changed: baselineGraph.hash !== currentGraph.hash,
    deltas,
    baselineHash: baselineGraph.hash || null
  };
}

export function enforceEvolutionBudget({ originalCode, candidateCode, budget = {} }) {
  const normalized = {
    maxFilesTouched: Number.isFinite(Number(budget.maxFilesTouched)) ? Number(budget.maxFilesTouched) : 1,
    maxChangedLines: Number.isFinite(Number(budget.maxChangedLines)) ? Number(budget.maxChangedLines) : 320,
    maxCharDelta: Number.isFinite(Number(budget.maxCharDelta)) ? Number(budget.maxCharDelta) : 24000
  };

  const changedLines = lineChangeCount(originalCode, candidateCode);
  const charDelta = Math.abs(String(candidateCode || '').length - String(originalCode || '').length);
  const violations = [];

  if (normalized.maxFilesTouched < 1) violations.push('maxFilesTouched must be >= 1');
  if (changedLines > normalized.maxChangedLines) {
    violations.push(`changed lines ${changedLines} exceed budget ${normalized.maxChangedLines}`);
  }
  if (charDelta > normalized.maxCharDelta) {
    violations.push(`char delta ${charDelta} exceed budget ${normalized.maxCharDelta}`);
  }

  return {
    success: violations.length === 0,
    normalized,
    changedLines,
    charDelta,
    violations
  };
}

export async function runPatchTournament({ candidates, evaluateCandidate, originalCode }) {
  const sourceLength = String(originalCode || '').length;
  const results = [];
  for (const candidate of candidates) {
    const validation = await evaluateCandidate(candidate);
    const candidateLength = String(candidate.code || '').length;
    const lengthPenalty = Math.max(0, Math.floor((candidateLength - sourceLength) / 1200));
    const qualityBonus = validation?.audit?.passed ? 12 : 0;
    const syntaxBonus = validation?.syntaxRun?.success ? 8 : 0;
    const base = validation?.success ? 80 : 10;
    const score = clamp(base + qualityBonus + syntaxBonus - lengthPenalty, 0, 100);
    results.push({
      id: candidate.id,
      label: candidate.label,
      source: candidate.source || 'unknown',
      objective: candidate.objective || null,
      score,
      success: Boolean(validation?.success),
      validation,
      hash: hashValue(candidate.code || ''),
      candidateCode: candidate.code
    });
  }

  const ranking = [...results].sort((a, b) => b.score - a.score);
  const winner = ranking[0] || null;
  return {
    winner,
    ranking: ranking.map((item) => ({
      id: item.id,
      label: item.label,
      source: item.source,
      objective: item.objective,
      score: item.score,
      success: item.success,
      hash: item.hash
    })),
    results
  };
}

export function readFailureMemory(filePath, { filePathFilter = null, limit = 40 } = {}) {
  const entries = readJsonl(filePath, Math.max(20, Number(limit) || 40));
  if (!filePathFilter) return entries;
  const normalized = toPosixPath(filePathFilter).toLowerCase();
  return entries.filter((item) => toPosixPath(item.filePath || '').toLowerCase() === normalized);
}

export function appendFailureMemory(filePath, payload) {
  const entry = {
    id: `failure_${Date.now()}`,
    at: new Date().toISOString(),
    ...payload
  };
  appendJsonl(filePath, entry);
  return entry;
}

export function buildRecoveryPlan(failures = []) {
  if (!Array.isArray(failures) || failures.length === 0) {
    return {
      recommendation: 'No prior failures recorded for this target.',
      topStage: null,
      repeatedFailureCount: 0
    };
  }

  const stageCounts = new Map();
  for (const item of failures) {
    const key = String(item.stage || 'unknown');
    stageCounts.set(key, (stageCounts.get(key) || 0) + 1);
  }
  const [topStage, repeatedFailureCount] = [...stageCounts.entries()].sort((a, b) => b[1] - a[1])[0];
  return {
    recommendation: `Historical weak point: ${topStage}. Add explicit verification before this stage and reduce patch size.`,
    topStage,
    repeatedFailureCount
  };
}

export function buildNightforgeChallengeSnapshot({ nightforgeState = {}, nightforgeMetrics = {}, receipts = [] } = {}) {
  const totalCycles = Number(nightforgeState.totalCycles || 0);
  const successfulCycles = Number(nightforgeState.successfulCycles || 0);
  const stability = totalCycles > 0 ? successfulCycles / totalCycles : 0;
  const cyclesToday = Number(nightforgeMetrics.cyclesToday || 0);
  const externalCalls = Number(nightforgeMetrics.externalCallsToday || 0);
  const cacheHits = Number(nightforgeMetrics.cacheHitsToday || 0);
  const cacheEfficiency = (externalCalls + cacheHits) > 0 ? cacheHits / (externalCalls + cacheHits) : 0;
  const verifiedReceipts = receipts.filter((entry) => String(entry.status || '').toLowerCase() === 'verified').length;

  const challengeCatalog = [
    { id: 'latency_week', name: 'Latency Week', target: 'Reduce cycle time and failures.', score: stability },
    { id: 'cache_week', name: 'Cache Efficiency Week', target: 'Increase cache hit ratio under live load.', score: cacheEfficiency },
    { id: 'throughput_week', name: 'Throughput Week', target: 'Increase verified cycles per day.', score: clamp(cyclesToday / 6, 0, 1) },
    { id: 'proof_week', name: 'Proof Ledger Week', target: 'Increase verified receipt density.', score: clamp(verifiedReceipts / 10, 0, 1) }
  ];

  const weakest = [...challengeCatalog].sort((a, b) => a.score - b.score)[0];
  return {
    kpi: {
      stability: Number((stability * 100).toFixed(2)),
      cyclesToday,
      cacheEfficiency: Number((cacheEfficiency * 100).toFixed(2)),
      verifiedReceipts
    },
    challengeCatalog,
    activeChallenge: weakest
  };
}

export function buildFeatureFusionPlan(capabilityGraph) {
  const fetchCalls = capabilityGraph.fetchCalls || [];
  const routes = capabilityGraph.routes || [];
  const routeByPath = new Map();
  for (const route of routes) {
    routeByPath.set(`${route.method} ${route.path}`, route);
  }

  const fusions = [];
  for (const call of fetchCalls) {
    const route = routeByPath.get(`${call.method} ${call.path}`);
    if (!route) continue;
    fusions.push({
      id: `fusion_${hashValue(`${call.file}|${route.file}|${call.path}`).slice(0, 12)}`,
      fromUi: call.file,
      toApi: route.file,
      route: `${call.method} ${call.path}`,
      proposal: `Create a shared contract module for ${call.path} and wire schema validation on both sides.`
    });
  }

  return {
    total: fusions.length,
    top: fusions.slice(0, 12)
  };
}

export function buildEvolutionReplayTheater(receipts = [], limit = 24) {
  const items = (Array.isArray(receipts) ? receipts : [])
    .slice(limit * -1)
    .map((entry) => ({
      id: entry.id || `receipt_${Date.now()}`,
      status: entry.status || 'unknown',
      filePath: entry.filePath || null,
      objective: entry.objective || null,
      startedAt: entry.startedAt || null,
      finishedAt: entry.finishedAt || null,
      durationMs: Number(entry.durationMs || 0),
      stageFlow: Array.isArray(entry.stages) ? entry.stages.map((stage) => stage.id) : []
    }));

  const statusMix = items.reduce((acc, item) => {
    const key = String(item.status || 'unknown');
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return {
    total: items.length,
    statusMix,
    items
  };
}

export function appendRealityReceipt(filePath, payload) {
  const receipt = {
    receiptId: `reality_${Date.now()}`,
    at: new Date().toISOString(),
    payloadHash: hashObject(payload),
    ...payload
  };
  appendJsonl(filePath, receipt);
  return receipt;
}

export function loadRealityReceipts(filePath, limit = 100) {
  return readJsonl(filePath, limit);
}

