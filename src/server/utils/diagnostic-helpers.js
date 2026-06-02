import { join, resolve, dirname, extname, relative } from 'path';
import { existsSync, readdirSync, statSync, readFileSync } from 'fs';

/* global fetch, AbortSignal */
const DIAGNOSTIC_SKIP_DIRS = new Set(['node_modules', '.git', '.gemini', 'dist', '.next']);
const DIAGNOSTIC_EXTENSIONS = new Set(['.js', '.jsx', '.mjs', '.cjs']);

function toPosixPath(pathValue = '') {
  return String(pathValue).replace(/\\/g, '/');
}

function collectStudioSourceFiles(rootDir) {
  const files = [];

  function scan(dir) {
    const items = readdirSync(dir);
    for (const item of items) {
      if (DIAGNOSTIC_SKIP_DIRS.has(item)) continue;
      const fullPath = join(dir, item);
      let stats;
      try {
        stats = statSync(fullPath);
      } catch {
        continue;
      }
      if (stats.isDirectory()) {
        scan(fullPath);
        continue;
      }
      if (DIAGNOSTIC_EXTENSIONS.has(extname(item).toLowerCase())) {
        files.push(fullPath);
      }
    }
  }

  scan(rootDir);
  return files;
}

function extractImportSpecifiers(content = '') {
  const matches = new Set();
  const patterns = [
    /import\s+(?:[^'"`]*?\s+from\s+)?['"`]([^'"`]+)['"`]/g,
    /import\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
    /require\(\s*['"`]([^'"`]+)['"`]\s*\)/g
  ];
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      if (match[1]) matches.add(match[1]);
    }
  }
  return Array.from(matches);
}

function isLocalImportSpecifier(specifier = '') {
  return specifier.startsWith('.') || specifier.startsWith('/') || specifier.startsWith('@/');
}

function resolveDependencyPath(workspaceRoot, moduleAbsPath, specifier) {
  const basePath = specifier.startsWith('@/')
    ? resolve(workspaceRoot, 'src', specifier.slice(2))
    : specifier.startsWith('/')
      ? resolve(workspaceRoot, specifier.slice(1))
      : resolve(dirname(moduleAbsPath), specifier);

  const candidates = [];
  const hasExtension = Boolean(extname(basePath));
  if (hasExtension) {
    candidates.push(basePath);
  } else {
    candidates.push(basePath);
    for (const extension of DIAGNOSTIC_EXTENSIONS) {
      candidates.push(`${basePath}${extension}`);
      candidates.push(join(basePath, `index${extension}`));
    }
  }

  for (const candidate of candidates) {
    try {
      if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
    } catch {
      continue;
    }
  }
  return null;
}

function classifyModuleHealth(moduleRecord) {
  if ((moduleRecord.issues || []).some(issue => issue.level === 'error')) return 'error';
  if ((moduleRecord.issues || []).length > 0) return 'warning';
  return 'healthy';
}

function scanStudioModules(limit = 30) {
  const root = process.cwd();
  const files = collectStudioSourceFiles(root);
  const results = files.map(absPath => {
    let content = '';
    try {
      content = readFileSync(absPath, 'utf8');
    } catch {
      content = '';
    }
    const lineCount = content ? content.split('\n').length : 0;
    const relPath = toPosixPath(relative(root, absPath));
    return {
      id: relPath,
      label: relPath.split('/').pop() || relPath,
      type: 'MODULE',
      density: lineCount,
      path: relPath
    };
  });
  const sorted = results.sort((a, b) => b.density - a.density).slice(0, limit);
  return { files: sorted, total_modules: results.length };
}

async function buildStudioDiagnostics(limit = 48) {
  const root = process.cwd();
  const startedAt = Date.now();
  const sourceFiles = collectStudioSourceFiles(root);
  const moduleMap = new Map();
  const moduleRecords = [];

  for (const absPath of sourceFiles) {
    const relPath = toPosixPath(relative(root, absPath));
    try {
      const content = readFileSync(absPath, 'utf8');
      const lines = content.split('\n').length;
      const imports = extractImportSpecifiers(content);
      const issues = [];
      if (lines > 1200) {
        issues.push({
          level: 'warning',
          code: 'LARGE_MODULE',
          message: `Module is large (${lines} lines).`
        });
      }
      const record = {
        id: relPath,
        path: relPath,
        label: relPath.split('/').pop() || relPath,
        lines,
        size_bytes: Buffer.byteLength(content, 'utf8'),
        imports,
        dependencies: [],
        dependents: 0,
        issues,
        health: 'healthy'
      };
      moduleMap.set(absPath, record);
      moduleRecords.push(record);
    } catch (error) {
      const record = {
        id: relPath,
        path: relPath,
        label: relPath.split('/').pop() || relPath,
        lines: 0,
        size_bytes: 0,
        imports: [],
        dependencies: [],
        dependents: 0,
        issues: [{ level: 'error', code: 'READ_ERROR', message: String(error.message || error) }],
        health: 'error'
      };
      moduleMap.set(absPath, record);
      moduleRecords.push(record);
    }
  }

  const dependencyEdges = [];
  const incomingCount = new Map();
  for (const [absPath, moduleRecord] of moduleMap.entries()) {
    for (const specifier of moduleRecord.imports) {
      if (!isLocalImportSpecifier(specifier)) continue;
      const resolved = resolveDependencyPath(root, absPath, specifier);
      if (!resolved) {
        moduleRecord.issues.push({
          level: 'error',
          code: 'MISSING_DEPENDENCY',
          message: `Cannot resolve import "${specifier}".`
        });
        continue;
      }
      const depRecord = moduleMap.get(resolved);
      const depRel = toPosixPath(relative(root, resolved));
      if (!depRecord) {
        moduleRecord.issues.push({
          level: 'warning',
          code: 'UNSCANNED_DEPENDENCY',
          message: `Dependency "${depRel}" is outside diagnostics extension set.`
        });
        continue;
      }
      if (!moduleRecord.dependencies.includes(depRecord.id)) {
        moduleRecord.dependencies.push(depRecord.id);
        dependencyEdges.push({ source: moduleRecord.id, target: depRecord.id });
        incomingCount.set(depRecord.id, (incomingCount.get(depRecord.id) || 0) + 1);
      }
    }
  }

  for (const record of moduleRecords) {
    record.dependents = incomingCount.get(record.id) || 0;
    record.health = classifyModuleHealth(record);
  }

  const probeTargets = [
    { id: 'status', label: 'Bridge Status', path: '/status' },
    { id: 'healthz', label: 'Health Check', path: '/healthz' },
    { id: 'metrics', label: 'Metrics API', path: '/api/metrics' },
    { id: 'queue', label: 'Execution Queue API', path: '/api/queue/master' }
  ];

  const probes = await Promise.all(probeTargets.map(async (probe) => {
    const startedNs = process.hrtime.bigint();
    try {
      const localPort = parseInt(process.env.BRIDGE_PORT || '3001', 10);
      const response = await fetch(`http://127.0.0.1:${localPort}${probe.path}`, { signal: AbortSignal.timeout(2500) });
      const elapsedMs = Number(process.hrtime.bigint() - startedNs) / 1_000_000;
      return {
        ...probe,
        ok: response.ok,
        status: response.status,
        latency_ms: Number(elapsedMs.toFixed(2)),
        error: response.ok ? null : `HTTP ${response.status}`
      };
    } catch (error) {
      const elapsedMs = Number(process.hrtime.bigint() - startedNs) / 1_000_000;
      return {
        ...probe,
        ok: false,
        status: null,
        latency_ms: Number(elapsedMs.toFixed(2)),
        error: String(error.message || error)
      };
    }
  }));

  const sortedModules = moduleRecords
    .slice()
    .sort((a, b) => {
      const connectivityA = (a.dependencies.length * 2) + a.dependents;
      const connectivityB = (b.dependencies.length * 2) + b.dependents;
      const issueWeightA = a.health === 'error' ? 2 : a.health === 'warning' ? 1 : 0;
      const issueWeightB = b.health === 'error' ? 2 : b.health === 'warning' ? 1 : 0;
      return (
        (issueWeightB - issueWeightA) ||
        (connectivityB - connectivityA) ||
        (b.lines - a.lines)
      );
    });
  const limitedModules = sortedModules.slice(0, Math.max(1, Math.min(limit, 150)));
  const visibleIds = new Set(limitedModules.map(item => item.id));
  const visibleEdges = dependencyEdges.filter(edge => visibleIds.has(edge.source) && visibleIds.has(edge.target));

  const healthyCount = moduleRecords.filter(module => module.health === 'healthy').length;
  const warningCount = moduleRecords.filter(module => module.health === 'warning').length;
  const errorCount = moduleRecords.filter(module => module.health === 'error').length;
  const avgLatency = probes.length > 0
    ? Number((probes.reduce((total, probe) => total + probe.latency_ms, 0) / probes.length).toFixed(2))
    : 0;

  return {
    success: true,
    timestamp: Date.now(),
    duration_ms: Date.now() - startedAt,
    summary: {
      modules_scanned: moduleRecords.length,
      modules_healthy: healthyCount,
      modules_warning: warningCount,
      modules_error: errorCount,
      dependency_edges: dependencyEdges.length,
      probes_total: probes.length,
      probes_failing: probes.filter(probe => !probe.ok).length,
      avg_probe_latency_ms: avgLatency
    },
    modules: limitedModules,
    graph: {
      nodes: limitedModules.map(module => ({
        id: module.id,
        label: module.label,
        path: module.path,
        health: module.health,
        lines: module.lines,
        dependency_count: module.dependencies.length,
        dependent_count: module.dependents
      })),
      edges: visibleEdges
    },
    probes,
    files: scanStudioModules(30).files,
    total_modules: moduleRecords.length,
    unresolved_dependencies: moduleRecords
      .flatMap(module => (module.issues || []).filter(issue => issue.code === 'MISSING_DEPENDENCY').map(issue => ({
        module: module.id,
        message: issue.message
      })))
      .slice(0, 100)
  };
}

export {
  toPosixPath,
  collectStudioSourceFiles,
  extractImportSpecifiers,
  isLocalImportSpecifier,
  resolveDependencyPath,
  classifyModuleHealth,
  scanStudioModules,
  buildStudioDiagnostics
};
