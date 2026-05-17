import fs from 'fs';
import path from 'path';

const SOURCE_EXTENSIONS = new Set(['.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx']);
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

const char_m_t = String.fromCharCode(84, 79, 68, 79);
const char_m_f = String.fromCharCode(70, 73, 88, 77, 69);
const DRIFT_PATTERN_T = new RegExp(`(?://|/\\*|\\*)\\s*(${char_m_t}|${char_m_f})\\b`);
const FAKE_CLAIM_PATTERNS = [
  /This module is now 100% functional and production-ready/i,
  /Live Agents Deployed/i,
  /Autonomous Daily Revenue/i,
  /Darwinian Generations/i,
  /Auto-Merge Confidence/i,
  /CI\/CD AUTODEPLOY ACTIVE/i
];

const SIMULATION_MARKERS = [
  /\b(simulation|simulate|simulated)\b/i,
  /\b(mock|mocked)\b/i,
  /(?<!\bplaceholder=)['"`]\bplaceholder\b['"`]/i, // Flag "placeholder" string but not placeholder= attribute
  /\bstub\b/i,
  /\bdemo data\b/i,
  /\bsample data\b/i,
];

const UI_RANDOM_MARKER = /\bMath\.random\s*\(/;
const DUMMY_IMPL_MARKER = /\bDummy implementations\b/i;

function toPosix(filePath) {
  return filePath.replace(/\\/g, '/');
}

function readText(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return '';
  }
}

function collectFiles(rootDir) {
  const out = [];
  if (!fs.existsSync(rootDir)) return out;

  const stack = [rootDir];
  while (stack.length > 0) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const absolute = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (!EXCLUDED_DIRS.has(entry.name)) stack.push(absolute);
        continue;
      }
      const ext = path.extname(entry.name).toLowerCase();
      if (SOURCE_EXTENSIONS.has(ext)) {
        out.push(absolute);
      }
    }
  }

  return out;
}

function findLine(content, absoluteIndex) {
  const sliced = content.slice(0, absoluteIndex);
  return sliced.split('\n').length;
}

function addFinding(findings, severity, filePath, line, message) {
  findings.push({
    severity,
    file: toPosix(filePath),
    line,
    message
  });
}

function compileRoutes(routeTuples) {
  return routeTuples.map((route) => {
    const escaped = route.path
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replace(/:([A-Za-z0-9_]+)/g, '[^/]+');
    return {
      ...route,
      matcher: new RegExp(`^${escaped}$`)
    };
  });
}

function routeExists(compiledRoutes, method, requestPath) {
  const normalized = requestPath.split('?')[0];
  return compiledRoutes.some((route) => {
    if (route.method !== method) return false;
    return route.matcher.test(normalized);
  });
}

function normalizeFetchUrl(raw) {
  if (!raw) return null;
  if (raw.startsWith('/')) return raw;
  if (raw.startsWith('http://127.0.0.1:3001') || raw.startsWith('http://localhost:3001')) {
    return raw.replace(/^https?:\/\/(?:127\.0\.0\.1|localhost):3001/, '');
  }
  return null;
}

function isBackendPath(requestPath) {
  if (!requestPath || requestPath.includes('${')) return false;
  if (requestPath.startsWith('/api/')) return true;
  return requestPath === '/status' || requestPath.startsWith('/build') || requestPath.startsWith('/bridge/');
}

function extractRoutes(filePath, content) {
  const routes = [];
  const regex = /app\.(get|post|put|patch|delete)\(\s*['"`]([^'"`]+)['"`]/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    routes.push({
      method: match[1].toUpperCase(),
      path: match[2],
      file: toPosix(filePath),
      line: findLine(content, match.index)
    });
  }
  return routes;
}

function extractFetchCalls(filePath, content) {
  const calls = [];
  const regex = /fetch\(\s*(['"`])([^'"`]+)\1(?:\s*,\s*({[\s\S]{0,260}?}))?\s*\)/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const rawUrl = match[2];
    const normalizedUrl = normalizeFetchUrl(rawUrl);
    if (!normalizedUrl) continue;
    const options = match[3] || '';
    const methodMatch = options.match(/method\s*:\s*['"`](GET|POST|PUT|PATCH|DELETE)['"`]/i);
    calls.push({
      method: methodMatch ? methodMatch[1].toUpperCase() : 'GET',
      path: normalizedUrl,
      file: toPosix(filePath),
      line: findLine(content, match.index)
    });
  }
  return calls;
}

function summarizeSeverity(findings) {
  const counts = { critical: 0, high: 0, medium: 0, low: 0 };
  for (const finding of findings) {
    counts[finding.severity] += 1;
  }
  return counts;
}

function computeScore({ brokenWires, severity }) {
  const deductions =
    (severity.critical * 25) +
    (severity.high * 12) +
    (severity.medium * 5) +
    (severity.low * 0) +
    (brokenWires.length * 10);
  return Math.max(0, 100 - deductions);
}

function deriveTruthState({ brokenWires, severity, score }) {
  if (severity.critical > 0 || brokenWires.length > 0) return 'blocked';
  if (severity.high > 0 || score < 60) return 'broken';
  if (severity.medium > 0 || score < 90) return 'recommended';
  return 'verified';
}

export function runNuclearTruthAudit(rootDir = process.cwd()) {
  const srcDir = path.join(rootDir, 'src');
  const serverFile = path.join(rootDir, 'promptbridge-server.js');
  const files = collectFiles(srcDir);
  const serverContent = readText(serverFile);

  if (serverContent) files.push(serverFile);

  const findings = [];
  const routes = [];
  const fetchCalls = [];

  let functionCount = 0;
  let buttonCount = 0;
  let tabCount = 0;
  let hudCount = 0;
  let nodeCount = 0;
  let uiFiles = 0;

  for (const file of files) {
    const content = readText(file);
    if (!content) continue;
    const relativeFile = toPosix(path.relative(rootDir, file));
    const isUi = /\.(jsx|tsx)$/i.test(file);
    if (isUi) uiFiles += 1;

    routes.push(...extractRoutes(relativeFile, content));
    fetchCalls.push(...extractFetchCalls(relativeFile, content));

    functionCount += (content.match(/\bfunction\s+[A-Za-z0-9_]+\s*\(/g) || []).length;
    functionCount += (content.match(/\b(?:const|let|var)\s+[A-Za-z0-9_]+\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/g) || []).length;

    buttonCount += (content.match(/<button\b/g) || []).length;
    buttonCount += (content.match(/<IconButton\b/g) || []).length;
    tabCount += (content.match(/\bactiveTab\b/g) || []).length;
    tabCount += (content.match(/\bSovereignTabs\b/g) || []).length;
    hudCount += (content.match(/\bHUD\b|\bDashboard\b|\bPanel\b/g) || []).length;
    nodeCount += (content.match(/\bnode\b/gi) || []).length;

    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      if (!relativeFile.includes('NuclearTruthAudit') && DRIFT_PATTERN_T.test(line)) {
        addFinding(findings, 'medium', relativeFile, idx + 1, `Contains ${char_m_t}/${char_m_f} marker.`);
      }
    });

    if (DUMMY_IMPL_MARKER.test(content)) {
      addFinding(findings, 'high', relativeFile, 1, 'Contains dummy implementation marker.');
    }

    if (isUi && UI_RANDOM_MARKER.test(content)) {
      addFinding(findings, 'high', relativeFile, findLine(content, content.indexOf('Math.random')), 'UI uses Math.random (simulated behavior).');
    }

    // Nuclear means repo-wide: scan UI + backend for any simulation/mock/stub/placeholder markers.
    // Self-exempt to avoid flagging the marker list itself.
    if (!relativeFile.endsWith('src/core/audit/NuclearTruthAudit.js')) {
      for (const pattern of SIMULATION_MARKERS) {
        const match = pattern.exec(content);
        if (match && typeof match.index === 'number') {
          addFinding(findings, 'medium', relativeFile, findLine(content, match.index), `Simulation marker detected: "${match[0]}"`);
        }
      }
    }

    if (!relativeFile.endsWith('src/core/audit/NuclearTruthAudit.js')) {
      for (const pattern of FAKE_CLAIM_PATTERNS) {
        const match = pattern.exec(content);
        if (match && typeof match.index === 'number') {
          const severity = /100% functional|AUTODEPLOY ACTIVE/i.test(pattern.source) ? 'critical' : 'high';
          addFinding(
            findings,
            severity,
            relativeFile,
            findLine(content, match.index),
            `Unverified or synthetic claim detected: "${match[0]}".`
          );
        }
      }
    }

    const buttonWithoutHandler = /<button(?![^>]*onClick=)[^>]*>/g;
    let orphan;
    while ((orphan = buttonWithoutHandler.exec(content)) !== null) {
      const snippet = orphan[0];
      if (snippet.includes('type="submit"') || snippet.includes("type='submit'")) continue;
      addFinding(findings, 'low', relativeFile, findLine(content, orphan.index), 'Button without onClick handler (verify intentional static control).');
    }
  }

  const compiledRoutes = compileRoutes(routes);
  const brokenWires = fetchCalls
    .filter((call) => call.path.startsWith('/'))
    .filter((call) => isBackendPath(call.path))
    .filter((call) => !routeExists(compiledRoutes, call.method, call.path))
    .map((call) => ({
      ...call,
      message: `No matching backend route for ${call.method} ${call.path}`
    }));

  for (const broken of brokenWires) {
    addFinding(findings, 'critical', broken.file, broken.line, broken.message);
  }

  const severity = summarizeSeverity(findings);
  const score = computeScore({ brokenWires, severity });
  const truthState = deriveTruthState({ brokenWires, severity, score });

  return {
    id: 'nuclear_truth_audit',
    generatedAt: new Date().toISOString(),
    truthState,
    score,
    summary: {
      modulesScanned: files.length,
      uiFiles,
      functions: functionCount,
      buttons: buttonCount,
      tabs: tabCount,
      hudPanels: hudCount,
      nodeMentions: nodeCount,
      apiRoutes: routes.length,
      apiCalls: fetchCalls.length,
      brokenWires: brokenWires.length,
      findings: severity
    },
    brokenWires,
    findings: findings.slice(0, 300),
    routesSample: routes.slice(0, 120),
    callsSample: fetchCalls.slice(0, 120)
  };
}
