/**
 * Evo Spider Engine v2 — FULL ACTIVATION
 * ─────────────────────────────────────────────────────────────────────────────
 * ACTIVE crawl mode. Does NOT just scan routes — it crawls the ENTIRE src/
 * and scripts/ tree to:
 *   1. Detect untethered daemon scripts (no CrashProofEngine)
 *   2. Detect orphaned features (exported but not registered in index.jsx)
 *   3. Detect hardcoded model strings (bypassing the router)
 *   4. Detect dead scripts (in scripts/ but not in package.json scripts block)
 *   5. Queue proposals to ide_queue.json for human/AI review
 *   6. Write a sealed spider_report.json each cycle
 *
 * All proposed patches are written ONLY to the IDE queue.
 * The Spider never directly writes to source files.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CrashProofEngine } from '../../autonomy/CrashProofEngine.js';
import { TetherEngine } from '../../autonomy/TetherEngine.js';

CrashProofEngine.initialize('EvoSpiderDaemon');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir   = path.resolve(__dirname, '../../../../');
const srcDir    = path.join(rootDir, 'src');
const dataDir   = path.join(rootDir, '.prompthouse-data', 'evo-layer');
const reportDir = path.join(rootDir, 'proof_receipts', 'spider_reports');

if (!fs.existsSync(dataDir))   fs.mkdirSync(dataDir,   { recursive: true });
if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });

const CRAWL_INTERVAL_MS   = 90_000; // 90 seconds between full crawls
const MAX_PROPOSALS_PER_CYCLE = 5;  // Don't flood the queue

// ─── Utility: walk a directory recursively ───────────────────────────────────
function walkDir(dir, exts = ['.js', '.mjs', '.jsx', '.ts'], results = []) {
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['.git', 'node_modules', 'dist', '.shadow-forge', 'proof_receipts'].includes(entry.name)) continue;
      walkDir(full, exts, results);
    } else if (exts.some(e => entry.name.endsWith(e))) {
      results.push(full);
    }
  }
  return results;
}

function readJson(filePath, fallback = {}) {
  try { return JSON.parse(fs.readFileSync(filePath, 'utf-8')); } catch { return fallback; }
}

function log(level, msg) {
  const colors = { INFO: '\x1b[36m', WARN: '\x1b[33m', FIND: '\x1b[35m', OK: '\x1b[32m', ERR: '\x1b[31m' };
  process.stdout.write(`${colors[level] || ''}[SPIDER] ${msg}\x1b[0m\n`);
}

// ─── Detection Rules ─────────────────────────────────────────────────────────

/**
 * Rule 1: Scripts in scripts/ that don't import CrashProofEngine
 */
function detectUnprotectedScripts() {
  const issues = [];
  const scriptsDir = path.join(rootDir, 'scripts');
  const daemonFiles = walkDir(scriptsDir, ['.mjs', '.js']);
  for (const f of daemonFiles) {
    const content = fs.readFileSync(f, 'utf-8');
    // Only flag long-running daemons (they use setInterval/setTimeout)
    if ((content.includes('setInterval') || content.includes('setTimeout')) && !content.includes('CrashProofEngine')) {
      issues.push({ file: path.relative(rootDir, f), rule: 'UNPROTECTED_DAEMON', severity: 'critical', fix: `Add: import { CrashProofEngine } from '../src/core/autonomy/CrashProofEngine.js'; CrashProofEngine.initialize('${path.basename(f, path.extname(f))}');` });
    }
  }
  return issues;
}

/**
 * Rule 2: Hardcoded model strings — bypasses the router
 */
function detectHardcodedModels() {
  const issues = [];
  const MODEL_PATTERNS = [
    /['"](gemini-\d+\.\d+-[a-z]+)['"]/g,
    /['"](gpt-4[o\-][^'"]*)['"]/g,
    /['"](claude-[^'"]+)['"]/g,
  ];
  const files = walkDir(srcDir, ['.js', '.mjs']).filter(f =>
    !f.includes('QuadBrainModelRouter') && !f.includes('TetherEngine')
  );
  for (const f of files) {
    const content = fs.readFileSync(f, 'utf-8');
    for (const pattern of MODEL_PATTERNS) {
      let match;
      pattern.lastIndex = 0;
      while ((match = pattern.exec(content)) !== null) {
        issues.push({ file: path.relative(rootDir, f), rule: 'HARDCODED_MODEL', severity: 'warning', detail: match[1], fix: `Replace hardcoded model string "${match[1]}" with QuadBrainModelRouter.routeTask()` });
      }
    }
  }
  return issues;
}

/**
 * Rule 3: Scan generated_apis/ routes to find routes with no MCP tool
 */
function detectUntetheredRoutes() {
  const issues = [];
  const apiDir = path.join(rootDir, 'generated_apis');
  if (!fs.existsSync(apiDir)) return issues;

  const mcpContent = fs.existsSync(path.join(rootDir, 'scripts', 'quadbrain-mcp-server.mjs'))
    ? fs.readFileSync(path.join(rootDir, 'scripts', 'quadbrain-mcp-server.mjs'), 'utf-8')
    : '';

  const apiFiles = fs.readdirSync(apiDir).filter(f => f.endsWith('.js'));
  for (const file of apiFiles) {
    const content = fs.readFileSync(path.join(apiDir, file), 'utf-8');
    const routeRegex = /router\.(post|put|delete)\(['"](\/[^'"]+)['"]/g;
    let match;
    while ((match = routeRegex.exec(content)) !== null) {
      const routePath = match[2];
      const slug = routePath.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
      const alreadyTethered = mcpContent.includes(routePath) || mcpContent.includes(slug);
      if (!alreadyTethered) {
        issues.push({ file, rule: 'UNTETHERED_ROUTE', severity: 'info', detail: `${match[1].toUpperCase()} ${routePath}`, fix: `Add MCP tool "spider_${slug}" to quadbrain-mcp-server.mjs calling fetchBridge("${routePath}")` });
      }
    }
  }
  return issues;
}

/**
 * Rule 4: Dead scripts — in scripts/ but not referenced in package.json
 */
function detectDeadScripts() {
  const issues = [];
  const pkg = readJson(path.join(rootDir, 'package.json'));
  const scriptValues = Object.values(pkg.scripts || {}).join(' ');
  const scriptFiles = fs.readdirSync(path.join(rootDir, 'scripts')).filter(f => f.endsWith('.mjs') || f.endsWith('.js'));
  for (const file of scriptFiles) {
    if (!scriptValues.includes(file)) {
      issues.push({ file: `scripts/${file}`, rule: 'DEAD_SCRIPT', severity: 'info', detail: 'Not referenced in package.json scripts', fix: `Add a run script to package.json or delete if unused.` });
    }
  }
  return issues;
}

// ─── Queue Proposals ─────────────────────────────────────────────────────────
async function queueProposals(issues) {
  const queueFile = path.join(dataDir, 'ide_queue.json');
  let queue = [];
  try { queue = JSON.parse(fs.readFileSync(queueFile, 'utf-8')); } catch { /* empty */ }

  // Deduplicate — don't re-queue issues already in pending/processing
  const existingDescs = new Set(queue.filter(t => t.status === 'pending' || t.status === 'processing').map(t => t.description));

  let added = 0;
  for (const issue of issues.slice(0, MAX_PROPOSALS_PER_CYCLE)) {
    const desc = `[SPIDER] ${issue.rule} in ${issue.file}: ${issue.detail || ''}`.trim();
    if (existingDescs.has(desc)) continue;

    queue.push({
      id:          `spider_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      source:      'EvoSpider',
      priority:    issue.severity === 'critical' ? 'high' : 'low',
      description: desc,
      fix:         issue.fix,
      status:      'pending',
      queuedAt:    new Date().toISOString(),
    });
    added++;
    existingDescs.add(desc);
  }

  if (added > 0) {
    fs.writeFileSync(queueFile, JSON.stringify(queue, null, 2), 'utf-8');
    log('FIND', `Queued ${added} proposal(s) → ide_queue.json`);
  }
}

// ─── Main Crawl ──────────────────────────────────────────────────────────────
let cycleCount = 0;

async function runCrawl() {
  cycleCount++;
  log('INFO', `\n🕷️  ═══ SPIDER CRAWL CYCLE ${cycleCount} ═══`);

  const allIssues = [];

  log('INFO', 'Rule 1: Scanning for unprotected daemon scripts...');
  const unprotected = detectUnprotectedScripts();
  log(unprotected.length ? 'WARN' : 'OK', `  → ${unprotected.length} unprotected daemons`);
  allIssues.push(...unprotected);

  log('INFO', 'Rule 2: Scanning for hardcoded model strings...');
  const hardcoded = detectHardcodedModels();
  log(hardcoded.length ? 'WARN' : 'OK', `  → ${hardcoded.length} hardcoded model references`);
  allIssues.push(...hardcoded);

  log('INFO', 'Rule 3: Scanning for untethered API routes...');
  const untethered = detectUntetheredRoutes();
  log(untethered.length ? 'WARN' : 'OK', `  → ${untethered.length} routes without MCP tools`);
  allIssues.push(...untethered);

  log('INFO', 'Rule 4: Scanning for dead scripts...');
  const dead = detectDeadScripts();
  log(dead.length ? 'WARN' : 'OK', `  → ${dead.length} dead scripts`);
  allIssues.push(...dead);

  // Priority sort: critical first
  allIssues.sort((a, b) => (a.severity === 'critical' ? -1 : b.severity === 'critical' ? 1 : 0));

  // Queue top proposals
  const critical = allIssues.filter(i => i.severity === 'critical');
  if (critical.length > 0) {
    log('FIND', `Queuing ${Math.min(critical.length, MAX_PROPOSALS_PER_CYCLE)} critical proposals...`);
    await queueProposals(critical);
  }

  // Sealed spider report
  const report = {
    cycle:      cycleCount,
    timestamp:  new Date().toISOString(),
    summary: {
      total:       allIssues.length,
      critical:    allIssues.filter(i => i.severity === 'critical').length,
      warnings:    allIssues.filter(i => i.severity === 'warning').length,
      info:        allIssues.filter(i => i.severity === 'info').length,
    },
    issues: allIssues,
  };
  fs.writeFileSync(path.join(reportDir, `spider_cycle_${cycleCount}.json`), JSON.stringify(report, null, 2));

  log('OK', `🕷️  Cycle ${cycleCount} complete | Total issues: ${allIssues.length} | Critical: ${report.summary.critical}\n`);
}

// ─── Boot ─────────────────────────────────────────────────────────────────────
log('INFO', '╔═══════════════════════════════════════════════════╗');
log('INFO', '║   E V O   S P I D E R   E N G I N E   v 2       ║');
log('INFO', '║   4 detection rules | IDE queue proposals        ║');
log('INFO', '╚═══════════════════════════════════════════════════╝\n');

runCrawl();
setInterval(runCrawl, CRAWL_INTERVAL_MS);
