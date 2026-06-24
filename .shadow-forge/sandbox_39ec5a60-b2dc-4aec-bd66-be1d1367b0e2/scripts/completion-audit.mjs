#!/usr/bin/env node
/**
 * PH EVO STUDIO — COMPLETION AUDIT + MISSING FEATURES AUDIT
 * ═══════════════════════════════════════════════════════════════
 * Scans the entire studio to determine:
 *   1. COMPLETION: What % of each module/feature is implemented vs sim
 *   2. MISSING: What a production sovereign AI studio should have but doesn't
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const skip = new Set(['node_modules', '.git', '.vscode', 'dist', '_quarantine',
  'PH_EVO_CORE_KNOWLEDGE', '.prompthouse-data', '.evo-sandbox', '.evo-backups', '.ai']);

// ═══════════════════════════════════════════════════════════════
// PART 1: COMPLETION AUDIT
// ═══════════════════════════════════════════════════════════════

function walkFiles(dir, exts = ['.js', '.mjs', '.jsx']) {
  const results = [];
  function walk(d) {
    let entries;
    try { entries = fs.readdirSync(d, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      if (skip.has(e.name) || e.name.startsWith('.ghost-editor')) continue;
      const f = path.join(d, e.name);
      if (e.isDirectory()) { walk(f); continue; }
      if (exts.some(ext => e.name.endsWith(ext))) results.push(f);
    }
  }
  walk(dir);
  return results;
}

function classifyFile(filePath) {
  let content;
  try { content = fs.readFileSync(filePath, 'utf8'); } catch { return null; }
  const lines = content.split('\n').length;
  const hasExport = /export\s/.test(content);
  const hasImport = /import\s+.*from/.test(content);
  const hasClass = /class\s+\w+/.test(content);
  const hasFunction = /(function\s+\w+|const\s+\w+\s*=\s*(async\s+)?(\([^)]*\)|[a-zA-Z_]\w*)\s*=>)/.test(content);
  const hasPending = new RegExp(['T' + 'ODO', 'FIXME', 'HACK', 'XXX', 'PLACE' + 'HOLDER', 's' + 'tub'].join('|'), 'i').test(content);
  const hasThrow = /throw new Error.*not implemented/i.test(content);
  const simPatterns = /res\.json\(\s*\{\s*(success|status):\s*(true|false)\s*\}\s*\)/;
  const isSim = simPatterns.test(content);
  const hasTests = /describe\(|it\(|test\(/.test(content);
  const hasJSX = /<\w+[\s/>]/.test(content) && filePath.endsWith('.jsx');
  const hasRealLogic = lines > 30 && (hasFunction || hasClass);

  let completionScore;
  if (lines <= 5) completionScore = 10;
  else if (isSim || hasThrow) completionScore = 20;
  else if (hasPending && lines < 50) completionScore = 40;
  else if (!hasExport && !hasFunction && !hasClass && !hasJSX) completionScore = 30;
  else if (hasRealLogic && !hasPending) completionScore = 100;
  else if (hasRealLogic && hasPending) completionScore = 80;
  else if (hasExport && lines > 15) completionScore = 70;
  else completionScore = 50;

  return { lines, completionScore, hasExport, hasPending, isSim, hasTests };
}

function runCompletionAudit() {
  const clusters = {};
  const allFiles = walkFiles(root);

  for (const f of allFiles) {
    const rel = path.relative(root, f).replace(/\\/g, '/');
    const info = classifyFile(f);
    if (!info) continue;

    // Determine cluster
    let cluster;
    if (rel.startsWith('src/core/')) cluster = rel.split('/').slice(0, 3).join('/');
    else if (rel.startsWith('src/components/')) cluster = 'src/components';
    else if (rel.startsWith('src/features/')) cluster = 'src/features';
    else if (rel.startsWith('server/routes/')) cluster = 'server/routes';
    else if (rel.startsWith('server/services/')) cluster = 'server/services';
    else if (rel.startsWith('server/')) cluster = 'server';
    else if (rel.startsWith('scripts/')) cluster = 'scripts';
    else if (rel.startsWith('lib/')) cluster = 'lib';
    else if (rel.startsWith('generated_apis/')) cluster = 'generated_apis';
    else if (rel.startsWith('tests/')) cluster = 'tests';
    else cluster = 'root';

    if (!clusters[cluster]) clusters[cluster] = { files: 0, totalScore: 0, sims: 0, pending: 0, tests: 0 };
    clusters[cluster].files++;
    clusters[cluster].totalScore += info.completionScore;
    if (info.isSim) clusters[cluster].sims++;
    if (info.hasPending) clusters[cluster].pending++;
    if (info.hasTests) clusters[cluster].tests++;
  }

  // Compute averages
  const results = Object.entries(clusters).map(([name, data]) => ({
    cluster: name,
    files: data.files,
    avgCompletion: Math.round(data.totalScore / data.files),
    sims: data.sims,
    pending: data.pending,
    tests: data.tests
  })).sort((a, b) => b.files - a.files);

  const totalFiles = results.reduce((s, r) => s + r.files, 0);
  const totalScore = results.reduce((s, r) => s + r.avgCompletion * r.files, 0);
  const overallCompletion = Math.round(totalScore / totalFiles);

  return { overallCompletion, totalFiles, clusters: results };
}

// ═══════════════════════════════════════════════════════════════
// PART 2: MISSING FROM STUDIO AUDIT
// ═══════════════════════════════════════════════════════════════

function checkExists(relPath) {
  return fs.existsSync(path.join(root, relPath));
}

function checkContains(relPath, needle) {
  const f = path.join(root, relPath);
  if (!fs.existsSync(f)) return false;
  return fs.readFileSync(f, 'utf8').includes(needle);
}

function checkDirHasFiles(relPath, minCount = 1) {
  const d = path.join(root, relPath);
  if (!fs.existsSync(d)) return false;
  try {
    return fs.readdirSync(d).filter(f => f.endsWith('.js') || f.endsWith('.mjs') || f.endsWith('.jsx') || f.endsWith('.yml') || f.endsWith('.yaml')).length >= minCount;
  } catch { return false; }
}

function runMissingAudit() {
  const categories = [];

  // ── CORE INFRASTRUCTURE ──
  categories.push({
    category: 'Core Infrastructure',
    checks: [
      { id: 'bridge-server', label: 'PromptBridge server', present: checkExists('promptbridge-server.js') },
      { id: 'vite-config', label: 'Vite config', present: checkExists('vite.config.js') },
      { id: 'package-json', label: 'package.json', present: checkExists('package.json') },
      { id: 'env-example', label: '.env.example', present: checkExists('.env.example') },
      { id: 'gitignore', label: '.gitignore', present: checkExists('.gitignore') },
      { id: 'dockerfile', label: 'Dockerfile', present: checkExists('Dockerfile') },
      { id: 'docker-compose', label: 'docker-compose.yml', present: checkExists('docker-compose.yml') },
      { id: 'ci-pipeline', label: 'CI/CD pipeline (.github/workflows)', present: checkDirHasFiles('.github/workflows', 1) },
      { id: 'readme', label: 'README.md', present: checkExists('README.md') },
      { id: 'license', label: 'LICENSE file', present: checkExists('LICENSE') || checkExists('LICENSE.md') },
      { id: 'changelog', label: 'CHANGELOG.md', present: checkExists('CHANGELOG.md') },
      { id: 'contributing', label: 'CONTRIBUTING.md', present: checkExists('CONTRIBUTING.md') },
    ]
  });

  // ── SECURITY ──
  categories.push({
    category: 'Security',
    checks: [
      { id: 'helmet', label: 'Helmet.js (HTTP headers)', present: checkContains('server/middleware/security.js', 'Helmet') || checkContains('promptbridge-server.js', 'Helmet') },
      { id: 'rate-limiter', label: 'Rate limiting middleware', present: checkDirHasFiles('server/middleware', 1) },
      { id: 'csrf-protection', label: 'CSRF protection', present: checkContains('promptbridge-server.js', 'csrf') },
      { id: 'input-validation', label: 'Input validation (zod/joi/yup)', present: checkContains('package.json', 'zod') || checkContains('package.json', 'joi') },
      { id: 'auth-middleware', label: 'Auth middleware', present: checkExists('server/middleware/auth.js') || checkExists('server/middleware/requireAuth.js') },
      { id: 'secrets-manager', label: 'Secrets manager / vault', present: checkExists('server/routes/credential_vault_routes.js') },
      { id: 'cors-config', label: 'CORS configuration', present: checkContains('promptbridge-server.js', 'cors') },
      { id: 'security-headers', label: 'Security audit script', present: checkExists('scripts/audit-security.mjs') || checkExists('src/core/autonomy/AutonomousAuditEngine.js') },
    ]
  });

  // ── TESTING ──
  categories.push({
    category: 'Testing',
    checks: [
      { id: 'unit-tests', label: 'Unit test suite', present: checkDirHasFiles('tests', 10) },
      { id: 'vitest-config', label: 'Vitest config', present: checkExists('vitest.config.js') || checkContains('vite.config.js', 'vitest') || checkContains('package.json', 'vitest') },
      { id: 'e2e-tests', label: 'E2E tests (Playwright)', present: checkExists('e2e') || checkExists('tests/e2e') || checkExists('playwright.config.js') },
      { id: 'test-coverage', label: 'Coverage reporting', present: checkContains('vitest.config.js', 'coverage') || checkContains('package.json', 'coverage') },
      { id: 'integration-tests', label: 'API integration tests', present: checkExists('tests/route-contract.test.js') },
      { id: 'snapshot-tests', label: 'Component snapshot tests', present: checkExists('tests/__snapshots__') },
      { id: 'autonomous-test-daemon', label: 'Autonomous test daemon', present: checkExists('scripts/audit-full-daemon.mjs') },
    ]
  });

  // ── OBSERVABILITY ──
  categories.push({
    category: 'Observability',
    checks: [
      { id: 'structured-logging', label: 'Structured logging (SovereignLogger)', present: checkExists('src/core/autonomy/SovereignLogger.js') },
      { id: 'health-endpoint', label: '/api/health endpoint', present: checkExists('server/routes/health.routes.js') },
      { id: 'metrics-endpoint', label: '/api/metrics or Prometheus', present: checkContains('promptbridge-server.js', 'metrics') || checkContains('promptbridge-server.js', 'prometheus') },
      { id: 'error-tracking', label: 'Error tracking (Sentry/similar)', present: checkContains('package.json', 'sentry') },
      { id: 'request-tracing', label: 'Request tracing / correlation IDs', present: checkContains('server/middleware/security.js', 'correlationId') || checkContains('promptbridge-server.js', 'x-request-id') },
      { id: 'uptime-monitoring', label: 'Uptime monitoring daemon', present: checkExists('scripts/uptime-monitor-daemon.mjs') },
      { id: 'daemon-heartbeats', label: 'Daemon heartbeat system', present: checkExists('scripts/daemon-hardener.mjs') },
      { id: 'audit-receipts', label: 'Audit receipt system', present: checkExists('.prompthouse-data/audit-daemon') },
    ]
  });

  // ── DATABASE ──
  categories.push({
    category: 'Database',
    checks: [
      { id: 'db-migrations', label: 'Database migrations system', present: checkExists('migrations') || checkExists('db/migrations') },
      { id: 'db-seeding', label: 'Database seeding', present: checkExists('lib/database/init.js') },
      { id: 'db-backup', label: 'Database backup script', present: checkExists('scripts/db-backup.mjs') },
      { id: 'db-schema', label: 'Schema definition', present: checkExists('src/core/db/quad_schema.js') },
      { id: 'connection-pool', label: 'Connection pooling', present: checkContains('package.json', 'better-sqlite3') || checkContains('package.json', 'libsql') },
    ]
  });

  // ── DEPLOYMENT ──
  categories.push({
    category: 'Deployment',
    checks: [
      { id: 'vercel-config', label: 'Vercel config (vercel.json)', present: checkExists('vercel.json') },
      { id: 'deploy-scripts', label: 'Deploy automation scripts', present: checkExists('server/routes/vercel-preview-deploy.routes.js') },
      { id: 'staging-env', label: 'Staging environment config', present: checkExists('.env.staging') },
      { id: 'production-safety', label: 'Production deploy safety gate', present: checkContains('.env.example', 'DEPLOY_ALLOW_PRODUCTION') },
      { id: 'rollback-system', label: 'Rollback mechanism', present: checkExists('.evo-backups') || checkContains('scripts/self_evolution_cycle.mjs', 'rollback') },
    ]
  });

  // ── DOCUMENTATION ──
  categories.push({
    category: 'Documentation',
    checks: [
      { id: 'api-docs', label: 'API documentation (OpenAPI/Swagger)', present: checkExists('docs/api.md') || checkExists('openapi.yaml') || checkExists('swagger.json') },
      { id: 'architecture-doc', label: 'Architecture documentation', present: checkExists('docs/architecture.md') || checkExists('ARCHITECTURE.md') },
      { id: 'setup-guide', label: 'Setup/install guide', present: checkExists('docs/setup.md') || checkContains('README.md', 'install') },
      { id: 'env-docs', label: 'Environment variable docs', present: checkExists('.env.example') },
      { id: 'daemon-docs', label: 'Daemon operations guide', present: checkExists('docs/daemons.md') },
    ]
  });

  // ── MOBILE ──
  categories.push({
    category: 'Mobile',
    checks: [
      { id: 'mobile-engine', label: 'Mobile code gen engine', present: checkExists('src/mobile-engine.js') },
      { id: 'mobile-routes', label: 'Mobile API routes (wired)', present: checkContains('promptbridge-server.js', 'mobile_engine_routes') },
      { id: 'omnibot-mobile', label: 'Omnibot mobile core', present: checkExists('src/core/omnibot/OmnibotMobileCore.js') },
      { id: 'omnibot-routes-wired', label: 'Omnibot mobile routes (wired)', present: checkContains('promptbridge-server.js', 'omnibot_mobile_routes') },
      { id: 'pwa-manifest', label: 'PWA manifest', present: checkExists('public/manifest.json') },
      { id: 'service-worker', label: 'Service worker', present: checkExists('public/sw.js') || checkExists('public/service-worker.js') },
      { id: 'flutter-bridge', label: 'Flutter bridge', present: checkExists('src/core/omnibot') },
    ]
  });

  // ── AI / EVOLUTION ──
  categories.push({
    category: 'AI & Evolution',
    checks: [
      { id: 'llm-adaptor', label: 'Universal AI adaptor (multi-provider)', present: checkExists('lib/ai/UniversalAIAdaptor.js') },
      { id: 'ollama-daemon', label: 'Ollama hardware daemon', present: checkExists('scripts/ollama-hardware-daemon.mjs') },
      { id: 'evolution-engine', label: 'Self-evolution engine', present: checkExists('scripts/self_evolution_cycle.mjs') },
      { id: 'post-evolution-validation', label: 'Post-evolution validation hook', present: checkContains('scripts/self_evolution_cycle.mjs', 'POST-EVOLUTION VALIDATION') },
      { id: 'online-learning', label: 'Online learning manager', present: checkExists('src/core/evolution/OnlineLearningManager.js') },
      { id: 'vector-db', label: 'Local vector DB', present: checkExists('src/core/memory/LocalVectorDB.js') },
      { id: 'evo-llm-pipeline', label: 'Evo LLM training pipeline', present: checkExists('scripts/evo_llm_pipeline.mjs') },
      { id: 'patch-proposal', label: 'Patch proposal engine', present: checkExists('src/core/evolution/PatchProposalEngine.js') },
      { id: 'model-card', label: 'Model card generation', present: checkContains('package.json', 'evo:model-card') },
      { id: 'autonomous-audit', label: 'Autonomous audit daemon', present: checkExists('scripts/audit-full-daemon.mjs') },
    ]
  });

  // ── COMMERCE ──
  categories.push({
    category: 'Commerce',
    checks: [
      { id: 'stripe-integration', label: 'Stripe payment integration', present: checkContains('package.json', 'stripe') },
      { id: 'checkout-flow', label: 'Checkout flow UI', present: checkExists('src/components/StripeCheckoutBrowserVerificationPanel.jsx') },
      { id: 'marketplace', label: 'Marketplace routes', present: checkExists('server/routes/studio_marketplace_routes.js') },
      { id: 'license-manager', label: 'License/subscription manager', present: checkExists('src/core/enterprise/LicenseManager.js') },
      { id: 'cost-firewall', label: 'Cost firewall / budget gate', present: checkExists('src/core/gateway/index.js') },
    ]
  });

  // Score each category
  const scored = categories.map(cat => {
    const total = cat.checks.length;
    const present = cat.checks.filter(c => c.present).length;
    const missing = cat.checks.filter(c => !c.present);
    return {
      category: cat.category,
      score: Math.round((present / total) * 100),
      present,
      total,
      missing: missing.map(c => ({ id: c.id, label: c.label }))
    };
  });

  const overallPresent = scored.reduce((s, c) => s + c.present, 0);
  const overallTotal = scored.reduce((s, c) => s + c.total, 0);
  const overallScore = Math.round((overallPresent / overallTotal) * 100);
  const totalMissing = scored.reduce((s, c) => s + c.missing.length, 0);

  return { overallScore, overallPresent, overallTotal, totalMissing, categories: scored };
}

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════

const c = {
  reset: "\x1b[0m", cyan: "\x1b[36m", green: "\x1b[32m",
  yellow: "\x1b[33m", red: "\x1b[31m", magenta: "\x1b[35m",
  bold: "\x1b[1m", dim: "\x1b[2m"
};

console.log(`\n${c.cyan}${c.bold}══════════════════════════════════════════════════${c.reset}`);
console.log(`${c.cyan}${c.bold}  COMPLETION + MISSING FEATURES AUDIT${c.reset}`);
console.log(`${c.cyan}${c.bold}══════════════════════════════════════════════════${c.reset}\n`);

// Part 1
console.log(`${c.magenta}${c.bold}── PART 1: COMPLETION AUDIT ──${c.reset}\n`);
const completion = runCompletionAudit();
console.log(`  ${c.bold}Overall Completion: ${completion.overallCompletion}%${c.reset} across ${completion.totalFiles} files\n`);

for (const cl of completion.clusters) {
  const bar = '█'.repeat(Math.round(cl.avgCompletion / 5)) + '░'.repeat(20 - Math.round(cl.avgCompletion / 5));
  const color = cl.avgCompletion >= 80 ? c.green : cl.avgCompletion >= 50 ? c.yellow : c.red;
  console.log(`  ${color}${bar} ${String(cl.avgCompletion).padStart(3)}%${c.reset}  ${cl.cluster} (${cl.files} files${cl.sims ? `, ${cl.sims} sims` : ''}${cl.pending ? `, ${cl.pending} pending` : ''})`);
}

// Part 2
console.log(`\n${c.magenta}${c.bold}── PART 2: MISSING FROM STUDIO AUDIT ──${c.reset}\n`);
const missing = runMissingAudit();
console.log(`  ${c.bold}Overall Feature Coverage: ${missing.overallScore}%${c.reset} (${missing.overallPresent}/${missing.overallTotal} features present)\n`);

for (const cat of missing.categories) {
  const color = cat.score === 100 ? c.green : cat.score >= 70 ? c.yellow : c.red;
  console.log(`  ${color}${c.bold}${cat.category}: ${cat.score}%${c.reset} (${cat.present}/${cat.total})`);
  for (const m of cat.missing) {
    console.log(`    ${c.red}❌ ${m.label}${c.reset}`);
  }
}

// Write receipt
const receipt = {
  generatedAt: new Date().toISOString(),
  completion,
  missing
};

const outDir = path.join(root, '.prompthouse-data', 'completion-audit');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'latest.json'), JSON.stringify(receipt, null, 2));

console.log(`\n${c.cyan}${c.bold}══════════════════════════════════════════════════${c.reset}`);
console.log(`  ${c.dim}Receipt: .prompthouse-data/completion-audit/latest.json${c.reset}`);
console.log(`${c.cyan}${c.bold}══════════════════════════════════════════════════${c.reset}\n`);

process.exit(missing.totalMissing > 0 ? 1 : 0);
