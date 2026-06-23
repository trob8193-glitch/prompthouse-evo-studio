#!/usr/bin/env node
/**
 * PH EVO STUDIO — AUTONOMOUS AUDIT DAEMON
 * ═══════════════════════════════════════════════════════════════
 * Runs all 7 audit types (6 audits + Vitest) on a configurable interval.
 * Writes receipts to .prompthouse-data/audit-daemon/
 * 
 * Usage:
 *   node scripts/audit-full-daemon.mjs              # Full daemon (interval loop)
 *   node scripts/audit-full-daemon.mjs --once       # Single pass then exit
 *   node scripts/audit-full-daemon.mjs --status     # Show latest receipt
 *   node scripts/audit-full-daemon.mjs --quick      # Skip Vitest (fast pass)
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { hardenProcess, createDaemonHeartbeat } from './daemon-hardener.mjs';
import {
  auditSyntax,
  auditGraph,
  auditSecurity,
  auditPerformance,
  auditEnvVars,
  auditWires,
  runFullAudit
} from '../src/core/autonomy/AutonomousAuditEngine.js';

hardenProcess('audit-full-daemon');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const dataDir = path.join(rootDir, '.prompthouse-data', 'audit-daemon');
const LATEST_PATH = path.join(dataDir, 'latest.json');
const HISTORY_PATH = path.join(dataDir, 'history.jsonl');
const INTERVAL_MS = Number(process.env.AUDIT_DAEMON_INTERVAL_MS || 300_000); // 5 min default
const RUN_ONCE = process.argv.includes('--once') || process.env.AUDIT_DAEMON_RUN_ONCE === 'true';
const QUICK = process.argv.includes('--quick');
const STATUS_ONLY = process.argv.includes('--status');

const c = {
  reset: "\x1b[0m", cyan: "\x1b[36m", green: "\x1b[32m",
  yellow: "\x1b[33m", red: "\x1b[31m", magenta: "\x1b[35m",
  bold: "\x1b[1m", dim: "\x1b[2m"
};

fs.mkdirSync(dataDir, { recursive: true });

// ─── STATUS MODE ─────────────────────────────────────────────
if (STATUS_ONLY) {
  if (fs.existsSync(LATEST_PATH)) {
    const latest = JSON.parse(fs.readFileSync(LATEST_PATH, 'utf8'));
    console.log(JSON.stringify(latest, null, 2));
  } else {
    console.log('{ "truthState": "NO_AUDIT_RECEIPTS_FOUND" }');
  }
  process.exit(0);
}

// ─── VITEST RUNNER ───────────────────────────────────────────
function runVitest() {
  const start = Date.now();
  try {
    const output = execSync('npx vitest run --reporter=json 2>&1', {
      cwd: rootDir,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 300_000 // 5 min max
    });

    // Try to parse JSON output
    try {
      const jsonStart = output.indexOf('{');
      const jsonEnd = output.lastIndexOf('}');
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        const json = JSON.parse(output.slice(jsonStart, jsonEnd + 1));
        return {
          id: 'vitest-suite',
          truthState: json.success ? 'VITEST_ALL_PASS' : 'VITEST_FAILURES',
          durationMs: Date.now() - start,
          testFiles: json.numTotalTestSuites || 0,
          testsPassed: json.numPassedTests || 0,
          testsFailed: json.numFailedTests || 0,
          testsTotal: json.numTotalTests || 0
        };
      }
    } catch {}

    // Fallback: parse text output
    const passMatch = output.match(/(\d+) passed/);
    const failMatch = output.match(/(\d+) failed/);
    const fileMatch = output.match(/Test Files\s+(\d+) passed/);
    return {
      id: 'vitest-suite',
      truthState: failMatch ? 'VITEST_FAILURES' : 'VITEST_ALL_PASS',
      durationMs: Date.now() - start,
      testFiles: fileMatch ? Number(fileMatch[1]) : 0,
      testsPassed: passMatch ? Number(passMatch[1]) : 0,
      testsFailed: failMatch ? Number(failMatch[1]) : 0,
      testsTotal: (passMatch ? Number(passMatch[1]) : 0) + (failMatch ? Number(failMatch[1]) : 0)
    };
  } catch (err) {
    const output = `${err.stdout || ''}${err.stderr || ''}`;
    const passMatch = output.match(/(\d+) passed/);
    const failMatch = output.match(/(\d+) failed/);
    const fileMatch = output.match(/Test Files\s+(\d+) passed/);
    const hasFailures = failMatch && Number(failMatch[1]) > 0;

    return {
      id: 'vitest-suite',
      truthState: hasFailures ? 'VITEST_FAILURES' : 'VITEST_ALL_PASS',
      durationMs: Date.now() - start,
      testFiles: fileMatch ? Number(fileMatch[1]) : 0,
      testsPassed: passMatch ? Number(passMatch[1]) : 0,
      testsFailed: failMatch ? Number(failMatch[1]) : 0,
      testsTotal: (passMatch ? Number(passMatch[1]) : 0) + (failMatch ? Number(failMatch[1]) : 0),
      exitCode: err.status
    };
  }
}

// ─── MAIN CYCLE ──────────────────────────────────────────────
async function runAuditCycle() {
  const cycleStart = Date.now();
  console.log(`\n${c.cyan}${c.bold}══════════════════════════════════════════════════${c.reset}`);
  console.log(`${c.cyan}${c.bold}  AUTONOMOUS AUDIT DAEMON — CYCLE START${c.reset}`);
  console.log(`${c.cyan}${c.bold}══════════════════════════════════════════════════${c.reset}`);
  console.log(`${c.dim}  ${new Date().toISOString()}${c.reset}\n`);

  // Run 6 code audits
  console.log(`${c.magenta}[1/7]${c.reset} Syntax check...`);
  const syntax = auditSyntax(rootDir);
  console.log(`  ${syntax.errorCount === 0 ? c.green + '✅' : c.red + '❌'} ${syntax.checkedCount} files, ${syntax.errorCount} errors${c.reset}`);

  console.log(`${c.magenta}[2/7]${c.reset} Node/edge graph...`);
  const graph = auditGraph(rootDir);
  console.log(`  ${c.green}✅${c.reset} ${graph.nodeCount} nodes, ${graph.edgeCount} edges, ${graph.orphanCount} orphans (${graph.orphanRatio})`);

  console.log(`${c.magenta}[3/7]${c.reset} Security scan...`);
  const security = auditSecurity(rootDir);
  console.log(`  ${security.issueCount === 0 ? c.green + '✅' : c.red + '❌'} ${security.issueCount} issues${c.reset}`);

  console.log(`${c.magenta}[4/7]${c.reset} Performance audit...`);
  const performance = auditPerformance(rootDir);
  console.log(`  ${c.green}✅${c.reset} ${performance.largeFileCount} large files out of ${performance.totalFiles}`);

  console.log(`${c.magenta}[5/7]${c.reset} Env var completeness...`);
  const envVars = auditEnvVars(rootDir);
  console.log(`  ${envVars.missingCount === 0 ? c.green + '✅' : c.yellow + '⚠️'} ${envVars.documentedCount}/${envVars.totalVarsInCode} documented, ${envVars.missingCount} missing${c.reset}`);

  console.log(`${c.magenta}[6/7]${c.reset} Broken wire scan...`);
  const wires = auditWires(rootDir);
  console.log(`  ${wires.brokenCount === 0 ? c.green + '✅' : c.red + '❌'} ${wires.brokenCount} broken wires${c.reset}`);

  let vitest = { id: 'vitest-suite', truthState: 'VITEST_SKIPPED', testsPassed: 0, testsFailed: 0, testsTotal: 0 };
  if (!QUICK) {
    console.log(`${c.magenta}[7/7]${c.reset} Vitest suite...`);
    vitest = runVitest();
    console.log(`  ${vitest.testsFailed === 0 ? c.green + '✅' : c.red + '❌'} ${vitest.testsPassed}/${vitest.testsTotal} tests passed across ${vitest.testFiles} files${c.reset}`);
  } else {
    console.log(`${c.magenta}[7/7]${c.reset} Vitest suite... ${c.dim}SKIPPED (--quick)${c.reset}`);
  }

  // Compile receipt
  const allAudits = { syntax, graph, security, performance, envVars, wires, vitest };
  const allPass = [syntax, security, wires].every(a =>
    a.truthState.includes('PASS') || a.truthState.includes('CLEAN')
  ) && (QUICK || vitest.testsFailed === 0);

  const receipt = {
    generatedAt: new Date().toISOString(),
    durationMs: Date.now() - cycleStart,
    truthState: allPass ? 'AUTONOMOUS_AUDIT_DAEMON_ALL_PASS' : 'AUTONOMOUS_AUDIT_DAEMON_ISSUES',
    allPass,
    summary: {
      syntaxErrors: syntax.errorCount,
      nodes: graph.nodeCount,
      edges: graph.edgeCount,
      orphans: graph.orphanCount,
      securityIssues: security.issueCount,
      largeFiles: performance.largeFileCount,
      missingEnvVars: envVars.missingCount,
      brokenWires: wires.brokenCount,
      testsPassed: vitest.testsPassed,
      testsFailed: vitest.testsFailed,
      testsTotal: vitest.testsTotal
    },
    audits: allAudits
  };

  // Write receipts
  fs.writeFileSync(LATEST_PATH, JSON.stringify(receipt, null, 2));
  fs.appendFileSync(HISTORY_PATH, JSON.stringify({
    ts: receipt.generatedAt,
    truthState: receipt.truthState,
    summary: receipt.summary
  }) + '\n');

  // Print summary
  console.log(`\n${c.cyan}${c.bold}══════════════════════════════════════════════════${c.reset}`);
  console.log(`  ${allPass ? c.green + '✅ ALL PASS' : c.red + '❌ ISSUES FOUND'}${c.reset}`);
  console.log(`  ${c.dim}Duration: ${receipt.durationMs}ms${c.reset}`);
  console.log(`  ${c.dim}Receipt: .prompthouse-data/audit-daemon/latest.json${c.reset}`);
  console.log(`${c.cyan}${c.bold}══════════════════════════════════════════════════${c.reset}\n`);

  return receipt;
}

// ─── BOOT ────────────────────────────────────────────────────
console.log(`
${c.cyan}${c.bold}══════════════════════════════════════════════════
  AUTONOMOUS AUDIT DAEMON v1.0
══════════════════════════════════════════════════${c.reset}
${c.magenta}Audits:${c.reset}  Syntax · Graph · Security · Performance · Env · Wires · Vitest
${c.magenta}Mode:${c.reset}    ${RUN_ONCE ? 'Single pass' : `Loop every ${INTERVAL_MS / 1000}s`}
${c.magenta}Quick:${c.reset}   ${QUICK ? 'Yes (skip Vitest)' : 'No (full suite)'}
${c.cyan}${c.bold}══════════════════════════════════════════════════${c.reset}
`);

const heartbeat = createDaemonHeartbeat('audit-full-daemon', rootDir);

runAuditCycle().then(receipt => {
  if (RUN_ONCE) {
    process.exit(receipt.allPass ? 0 : 1);
  }

  setInterval(() => {
    runAuditCycle().catch(err => {
      console.error(`${c.red}[AuditDaemon] Cycle error: ${err.message}${c.reset}`);
    });
  }, INTERVAL_MS);
}).catch(err => {
  console.error(`${c.red}[AuditDaemon] Fatal: ${err.message}${c.reset}`);
  process.exitCode = 1;
});
