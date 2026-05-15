#!/usr/bin/env node
/**
 * PH EVO STUDIO — DEPLOYMENT READINESS REPORT
 * ═══════════════════════════════════════════════════════════════
 * Generates a deployment readiness report. No secrets. No fake pass.
 */
import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), '.prompthouse-data');
if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });

const JSON_PATH = join(DATA_DIR, 'deployment-readiness-report.json');
const MD_PATH = join(DATA_DIR, 'deployment-readiness-report.md');

function checkExists(label, path) {
  const exists = existsSync(path);
  return { label, passed: exists, detail: exists ? 'Found' : 'Not found' };
}

function checkEnv(key) {
  const val = process.env[key];
  const set = val !== undefined && val !== '';
  return { label: key, passed: set, detail: set ? 'Set (redacted)' : 'Not set' };
}

function runCommand(label, cmd) {
  try {
    execSync(cmd, { cwd: process.cwd(), encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 120000 });
    return { label, passed: true, detail: 'PASSED' };
  } catch (err) {
    return { label, passed: false, detail: `FAILED: ${String(err?.message || err).slice(0, 200)}` };
  }
}

console.log('\n╔════════════════════════════════════════════════╗');
console.log('║  PH EVO STUDIO — DEPLOYMENT READINESS REPORT   ║');
console.log('╚════════════════════════════════════════════════╝\n');

const timestamp = new Date().toISOString();

// File existence checks
const fileChecks = [
  checkExists('Production Build', join(process.cwd(), 'dist', 'index.html')),
  checkExists('Bridge Server', join(process.cwd(), 'promptbridge-server.js')),
  checkExists('Proof Report', join(DATA_DIR, 'proof-report.json')),
  checkExists('Route Registry', join(process.cwd(), 'server', 'route-registry.js')),
  checkExists('Security Auditor', join(process.cwd(), 'server', 'services', 'mutation-route-auditor.js')),
];

// Environment checks
const envChecks = [
  checkEnv('JWT_SECRET'),
  checkEnv('CORS_ORIGINS'),
  checkEnv('VITE_BRIDGE_URL'),
  checkEnv('VERCEL_TOKEN'),
  checkEnv('OPENAI_API_KEY'),
  checkEnv('STRIPE_SECRET_KEY'),
  checkEnv('DEPLOY_TARGET'),
  checkEnv('DEPLOY_ALLOW_PRODUCTION'),
];

// Verification commands
console.log('▶ Running verification commands...');
const cmdChecks = [
  runCommand('Syntax Check', 'node --check promptbridge-server.js'),
  runCommand('Import Audit', 'npm run audit:imports'),
  runCommand('CSS Audit', 'npm run audit:css'),
];

const allChecks = [...fileChecks, ...envChecks, ...cmdChecks];
const blockers = allChecks.filter(c => !c.passed && ['Production Build', 'Bridge Server', 'JWT_SECRET', 'Syntax Check', 'Import Audit', 'CSS Audit'].includes(c.label));
const warnings = allChecks.filter(c => !c.passed && !blockers.includes(c));
const allPassed = blockers.length === 0;

const report = {
  timestamp,
  truthState: allPassed ? 'VERIFIED' : 'BLOCKED',
  fileChecks,
  envChecks: envChecks.map(e => ({ label: e.label, passed: e.passed, detail: e.detail })),
  verificationChecks: cmdChecks,
  blockers: blockers.map(b => ({ label: b.label, detail: b.detail })),
  warnings: warnings.map(w => ({ label: w.label, detail: w.detail })),
  nextActions: allPassed
    ? ['All blockers cleared. Set VERCEL_TOKEN and DEPLOY_TARGET=vercel for real deploy.']
    : blockers.map(b => `Fix: ${b.label} — ${b.detail}`),
};

writeFileSync(JSON_PATH, JSON.stringify(report, null, 2), 'utf8');
console.log(`✅ JSON: ${JSON_PATH}`);

const md = [
  `# Deployment Readiness Report`,
  ``,
  `**Generated:** ${timestamp}`,
  `**Truth State:** ${report.truthState}`,
  ``,
  `## File Checks`,
  `| Check | Status |`,
  `|---|---|`,
  ...fileChecks.map(c => `| ${c.label} | ${c.passed ? '✅' : '❌'} ${c.detail} |`),
  ``,
  `## Environment`,
  `| Variable | Status |`,
  `|---|---|`,
  ...envChecks.map(c => `| ${c.label} | ${c.passed ? '✅' : '⚠️'} ${c.detail} |`),
  ``,
  `## Verification`,
  `| Check | Status |`,
  `|---|---|`,
  ...cmdChecks.map(c => `| ${c.label} | ${c.passed ? '✅' : '❌'} ${c.detail} |`),
  ``,
  `## Blockers`,
  blockers.length === 0 ? `None.` : blockers.map(b => `- **${b.label}**: ${b.detail}`).join('\n'),
  ``,
  `## Warnings`,
  warnings.length === 0 ? `None.` : warnings.map(w => `- ${w.label}: ${w.detail}`).join('\n'),
  ``,
  `---`,
  `*No secrets included. Failures reported honestly.*`,
  ``
].join('\n');

writeFileSync(MD_PATH, md, 'utf8');
console.log(`✅ MD: ${MD_PATH}`);

if (allPassed) {
  console.log('\n✅ Deployment readiness: VERIFIED (no hard blockers).\n');
} else {
  console.log(`\n❌ Deployment readiness: BLOCKED (${blockers.length} blocker(s)).\n`);
  process.exit(1);
}
