/**
 * PH EVO STUDIO — AUTONOMOUS AUDIT ENGINE
 * ═══════════════════════════════════════════════════════════════
 * Core audit functions for all 6 missing audit types.
 * Used by: audit-full-daemon.mjs, self_evolution_cycle.mjs, npm run audit:full
 */

import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { Log } from './SovereignLogger.js';

const SKIP_DIRS = new Set([
  'node_modules', '.git', '.vscode', 'dist', '_quarantine',
  'PH_EVO_CORE_KNOWLEDGE', '.prompthouse-data', '.evo-sandbox',
  '.evo-backups', '.ai'
]);

function walkFiles(root, extensions = ['.js', '.mjs', '.jsx']) {
  const results = [];
  function walk(dir) {
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      if (SKIP_DIRS.has(e.name) || e.name.startsWith('.ghost-editor')) continue;
      const full = path.join(dir, e.name);
      if (e.isDirectory()) { walk(full); continue; }
      if (extensions.some(ext => e.name.endsWith(ext))) {
        results.push(full);
      }
    }
  }
  walk(root);
  return results;
}

// ─── AUDIT 1: SYNTAX CHECK ────────────────────────────────────
export function auditSyntax(rootDir) {
  const files = walkFiles(rootDir, ['.js', '.mjs']).filter(f => {
    const rel = path.relative(rootDir, f).replace(/\\/g, '/');
    return rel.startsWith('src/core/') || rel.startsWith('server/') ||
           rel.startsWith('lib/') || rel.startsWith('scripts/');
  });

  const errors = [];
  for (const f of files) {
    try {
      execFileSync(process.execPath, ['--check', f], { stdio: 'pipe', timeout: 5000 });
    } catch (err) {
      const msg = String(err.stderr || err.message).split('\n')[0].slice(0, 300);
      errors.push({ file: path.relative(rootDir, f).replace(/\\/g, '/'), error: msg });
    }
  }

  return {
    id: 'syntax-check',
    truthState: errors.length === 0 ? 'SYNTAX_AUDIT_PASS' : 'SYNTAX_AUDIT_FAILURES',
    checkedCount: files.length,
    errorCount: errors.length,
    errors
  };
}

// ─── AUDIT 2: NODE/EDGE GRAPH ──────────────────────────────────
export function auditGraph(rootDir) {
  const files = walkFiles(rootDir);
  const importRegex = /import\s+(?:.*?)\s+from\s+['"](\.[^'"]+)['"]/g;
  const nodes = new Map();
  const edges = [];
  const inDeg = new Map();
  const outDeg = new Map();

  for (const f of files) {
    let content;
    try { content = fs.readFileSync(f, 'utf8'); } catch { continue; }
    const rel = path.relative(rootDir, f).replace(/\\/g, '/');
    const imports = [];
    let m;
    while ((m = importRegex.exec(content)) !== null) imports.push(m[1]);
    nodes.set(rel, { imports: imports.length });
    inDeg.set(rel, inDeg.get(rel) || 0);
    outDeg.set(rel, imports.length);

    for (const imp of imports) {
      const target = path.resolve(path.dirname(f), imp);
      let resolved = target;
      for (const ext of ['', '.js', '.mjs', '.jsx', '/index.js']) {
        if (fs.existsSync(target + ext)) { resolved = target + ext; break; }
      }
      const tRel = path.relative(rootDir, resolved).replace(/\\/g, '/');
      edges.push({ from: rel, to: tRel });
      inDeg.set(tRel, (inDeg.get(tRel) || 0) + 1);
    }
  }

  const orphans = [...nodes.keys()].filter(f => {
    return (inDeg.get(f) || 0) === 0 && (outDeg.get(f) || 0) === 0 &&
           !f.startsWith('tests/') && !f.startsWith('scratch/');
  });

  return {
    id: 'node-edge-graph',
    truthState: orphans.length < 200 ? 'GRAPH_AUDIT_HEALTHY' : 'GRAPH_AUDIT_HIGH_ORPHANS',
    nodeCount: nodes.size,
    edgeCount: edges.length,
    orphanCount: orphans.length,
    orphanRatio: Math.round((orphans.length / nodes.size) * 100) + '%'
  };
}

// ─── AUDIT 3: SECURITY SCAN ──────────────────────────────────
export function auditSecurity(rootDir) {
  const files = walkFiles(rootDir);
  const issues = [];

  const keyPatterns = [
    { name: 'OpenAI Key', regex: /['"]sk-[a-zA-Z0-9]{20,}['"]/g },
    { name: 'Stripe Live Key', regex: /['"]sk_live_[a-zA-Z0-9]{20,}['"]/g },
    { name: 'Google API Key', regex: /['"]AIzaSy[a-zA-Z0-9_-]{30,}['"]/g },
    { name: 'Anthropic Key', regex: /['"]sk-ant-[a-zA-Z0-9]{20,}['"]/g },
    { name: 'GitHub Token', regex: /['"]ghp_[a-zA-Z0-9]{36}['"]/g },
  ];

  for (const f of files) {
    let content;
    try { content = fs.readFileSync(f, 'utf8'); } catch { continue; }
    const rel = path.relative(rootDir, f).replace(/\\/g, '/');

    // Hardcoded key scan
    for (const { name, regex } of keyPatterns) {
      const matches = content.match(regex) || [];
      for (const match of matches) {
        if (!match.includes('...') && !match.includes('your_') && !match.includes('test')) {
          issues.push({ file: rel, type: 'HARDCODED_KEY', detail: `${name}: ${match.slice(0, 20)}...` });
        }
      }
    }

    // eval() usage (skip security scanners that check for eval)
    if (/[^.]\beval\s*\(/.test(content) && !content.includes("content.includes('eval")
        && !content.includes('.includes("eval') && !rel.startsWith('tests/')) {
      issues.push({ file: rel, type: 'EVAL_USAGE', detail: 'Direct eval() call' });
    }

    // new Function()
    if (/new\s+Function\s*\(/.test(content)) {
      issues.push({ file: rel, type: 'FUNCTION_CONSTRUCTOR', detail: 'new Function() constructor' });
    }
  }

  return {
    id: 'security-scan',
    truthState: issues.length === 0 ? 'SECURITY_AUDIT_CLEAN' : 'SECURITY_AUDIT_ISSUES',
    issueCount: issues.length,
    issues
  };
}

// ─── AUDIT 4: LARGE FILE / PERFORMANCE ───────────────────────
export function auditPerformance(rootDir) {
  const files = walkFiles(rootDir);
  const large = [];

  for (const f of files) {
    let content;
    try { content = fs.readFileSync(f, 'utf8'); } catch { continue; }
    const rel = path.relative(rootDir, f).replace(/\\/g, '/');
    const lines = content.split('\n').length;
    const sizeKB = Math.round(content.length / 1024);

    if (lines > 500 || content.length > 20000) {
      large.push({ file: rel, lines, sizeKB });
    }
  }

  large.sort((a, b) => b.lines - a.lines);

  return {
    id: 'performance-audit',
    truthState: large.length <= 15 ? 'PERFORMANCE_AUDIT_ACCEPTABLE' : 'PERFORMANCE_AUDIT_BLOAT',
    totalFiles: files.length,
    largeFileCount: large.length,
    largeFiles: large.slice(0, 20)
  };
}

// ─── AUDIT 5: ENV VAR COMPLETENESS ──────────────────────────
export function auditEnvVars(rootDir) {
  const files = walkFiles(rootDir);
  const allVars = new Map();

  for (const f of files) {
    let content;
    try { content = fs.readFileSync(f, 'utf8'); } catch { continue; }
    const rel = path.relative(rootDir, f).replace(/\\/g, '/');
    const matches = content.matchAll(/process\.env\.(\w+)/g);
    for (const m of matches) {
      if (!allVars.has(m[1])) allVars.set(m[1], []);
      allVars.get(m[1]).push(rel);
    }
  }

  const envExamplePath = path.join(rootDir, '.env.example');
  let envExample = '';
  try { envExample = fs.readFileSync(envExamplePath, 'utf8'); } catch {}

  const testVars = new Set(['VITEST', 'CI', 'NODE_OPTIONS', 'NEVER_EXISTS_KEY', 'TEST_KEY_PRESENT']);
  const missing = [...allVars.keys()]
    .filter(v => !envExample.includes(v) && !testVars.has(v));

  return {
    id: 'env-var-completeness',
    truthState: missing.length === 0 ? 'ENV_AUDIT_COMPLETE' : 'ENV_AUDIT_MISSING_VARS',
    totalVarsInCode: allVars.size,
    documentedCount: allVars.size - missing.length,
    missingCount: missing.length,
    missingVars: missing
  };
}

// ─── AUDIT 6: BROKEN WIRE SCAN ──────────────────────────────
export function auditWires(rootDir) {
  const files = walkFiles(rootDir);
  const importRegex = /import\s+(?:.*?)\s+from\s+['"](\.[^'"]+)['"]/g;
  const broken = [];

  for (const f of files) {
    let content;
    try { content = fs.readFileSync(f, 'utf8'); } catch { continue; }
    const rel = path.relative(rootDir, f).replace(/\\/g, '/');
    let m;
    while ((m = importRegex.exec(content)) !== null) {
      const imp = m[1];
      const dir = path.dirname(f);
      const target = path.resolve(dir, imp);
      let found = false;
      for (const ext of ['', '.js', '.mjs', '.jsx', '.ts', '.tsx', '/index.js', '/index.mjs']) {
        if (fs.existsSync(target + ext)) { found = true; break; }
      }
      if (!found) {
        broken.push({ file: rel, import: imp, resolvedTo: path.relative(rootDir, target).replace(/\\/g, '/') });
      }
    }
  }

  return {
    id: 'broken-wire-scan',
    truthState: broken.length === 0 ? 'WIRE_AUDIT_CLEAN' : 'WIRE_AUDIT_BROKEN',
    brokenCount: broken.length,
    broken: broken.slice(0, 50)
  };
}

// ─── MASTER: RUN ALL 6 ──────────────────────────────────────
export function runFullAudit(rootDir) {
  const start = Date.now();
  const results = {
    syntax: auditSyntax(rootDir),
    graph: auditGraph(rootDir),
    security: auditSecurity(rootDir),
    performance: auditPerformance(rootDir),
    envVars: auditEnvVars(rootDir),
    wires: auditWires(rootDir)
  };

  const allPass = Object.values(results).every(r =>
    r.truthState.includes('PASS') || r.truthState.includes('CLEAN') ||
    r.truthState.includes('HEALTHY') || r.truthState.includes('COMPLETE') ||
    r.truthState.includes('ACCEPTABLE')
  );

  return {
    generatedAt: new Date().toISOString(),
    durationMs: Date.now() - start,
    truthState: allPass ? 'FULL_AUTONOMOUS_AUDIT_PASS' : 'FULL_AUTONOMOUS_AUDIT_ISSUES',
    allPass,
    audits: results
  };
}
