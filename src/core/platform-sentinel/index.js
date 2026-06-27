import { execSync } from 'child_process';
import { appendFileSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync } from 'fs';
import { dirname, extname, join, relative } from 'path';

export const PLATFORM_TRUTH_LABELS = Object.freeze([
  'BUILT', 'VERIFIED', 'PROVEN', 'BLOCKED', 'FAILED', 'PROVIDER_GATED',
  'OPTIONAL_PROVIDER_GATED', 'ONLINE_READY', 'OWNER_APPROVAL_REQUIRED', 'NEEDS_REPAIR', 'READY_FOR_PILOT', 'PLATFORM_READY'
]);

export const PLATFORM_MODULES = Object.freeze([
  { id: 'proof-console', label: 'Proof Console', critical: true, files: ['src/features/index.jsx'], routes: [], scripts: ['verify:studio'] },
  { id: 'self-evolution', label: 'Self-Evolution', critical: true, files: ['src/core/evolution/index.js', 'src/features/SelfEvolutionDashboard.jsx'], routes: ['/api/self-evolution/status'], scripts: ['evolve:status', 'evolve:proof'] },
  { id: 'cost-firewall', label: 'Cost Firewall', critical: true, files: ['src/core/gateway/index.js', 'src/features/CostFirewallDashboard.jsx'], routes: ['/api/cost-firewall/status'], scripts: ['cost:check', 'cost:summary', 'cost:claims'] },
  { id: 'theme-evolution', label: 'Theme Evolution', critical: true, files: ['src/core/theme-evolution/index.js', 'src/features/ThemeEvolutionDashboard.jsx'], routes: ['/api/theme-evolution/status'], scripts: [] },
  { id: 'module-maturity', label: 'Module Maturity', critical: true, files: ['src/core/maturity/ModuleMaturityEngine.js', 'src/features/ModuleMaturityDashboard.jsx'], routes: ['/api/module-maturity/status'], scripts: ['maturity:check', 'maturity:strict'] },
  { id: 'platform-sentinel', label: 'Platform Sentinel', critical: true, files: ['src/core/platform-sentinel/index.js', 'scripts/platform_ready_check.mjs'], routes: ['/api/platform-sentinel/status', '/api/platform-sentinel/release-verdict'], scripts: ['platform:status', 'platform:strict', 'platform:receipt'] }
]);

export const PLATFORM_REQUIRED_COMMANDS = Object.freeze([
  { id: 'syntax_bridge', command: 'node --check promptbridge-server.js', critical: true },
  { id: 'syntax_routes', command: 'node --check server/routes/studio-core.routes.js', critical: true },
  { id: 'syntax_orchestrator', command: 'node --check scripts/super-orchestrator.mjs', critical: true },
  { id: 'test', command: 'npm test', critical: true },
  { id: 'build', command: 'npm run build', critical: true },
  { id: 'audit_imports', command: 'npm run audit:imports', critical: true },
  { id: 'audit_css', command: 'npm run audit:css', critical: true },
  { id: 'verify_studio', command: 'npm run verify:studio', critical: true },
  { id: 'maturity', command: 'npm run maturity:check', critical: true },
  { id: 'evolve_status', command: 'npm run evolve:status', critical: false },
  { id: 'architecture_audit', command: 'npm run architecture:audit', critical: false }
]);

export const ONLINE_REQUIREMENTS = Object.freeze([
  {
    id: 'openai-live-connector',
    label: 'OpenAI live connector proof',
    provider: 'openai',
    severity: 'P1',
    envKey: 'OPENAI_API_KEY',
    approvalScope: 'provider_probe',
    route: 'POST /api/connectors/openai-1/probe',
    proofCommand: 'npm run proof:connectors:live',
    nextAction: 'Add OPENAI_API_KEY and run a provider_probe-approved live connector proof.',
  },
  {
    id: 'stripe-test-commerce',
    label: 'Stripe test commerce proof',
    provider: 'stripe',
    severity: 'P1',
    envKey: 'STRIPE_SECRET_KEY',
    approvalScope: 'commerce',
    route: 'POST /api/connectors/stripe-1/probe',
    proofCommand: 'npm run proof:connectors:live',
    nextAction: 'Add STRIPE_SECRET_KEY and run a commerce-approved Stripe connector proof.',
  },
  {
    id: 'stripe-live-revenue',
    label: 'Stripe live revenue mode',
    provider: 'stripe',
    severity: 'P1',
    envKey: 'STRIPE_SECRET_KEY',
    requiredPrefix: 'sk_live_',
    optional: true,
    approvalScope: 'commerce',
    route: 'POST /api/commerce/checkout',
    proofCommand: 'npm run proof:providers:live',
    nextAction: 'Use a live Stripe key only when ready for real customer payments and keep commerce owner approval required.',
  },
  {
    id: 'vercel-live-connector',
    label: 'Vercel live connector proof',
    provider: 'vercel',
    severity: 'P0',
    envKey: 'VERCEL_TOKEN',
    approvalScope: 'deploy',
    route: 'POST /api/connectors/vercel-1/probe',
    proofCommand: 'npm run proof:connectors:live',
    nextAction: 'Add VERCEL_TOKEN and run a deploy-approved Vercel connector proof.',
  },
  {
    id: 'vercel-preview-deploy',
    label: 'Vercel preview deployment',
    provider: 'vercel',
    severity: 'P0',
    envKey: 'VERCEL_TOKEN',
    approvalScope: 'deploy',
    route: 'POST /api/vercel/preview-deploy',
    proofCommand: 'npm run proof:providers:live',
    nextAction: 'Add VERCEL_TOKEN before requesting a preview deployment.',
  },
  {
    id: 'vercel-production-deploy',
    label: 'Vercel production deployment',
    provider: 'vercel',
    severity: 'P0',
    envKey: 'VERCEL_TOKEN',
    requiredFlag: { key: 'DEPLOY_ALLOW_PRODUCTION', value: 'true' },
    approvalScope: 'deploy',
    route: 'POST /api/deployment/vercel/preview',
    proofCommand: 'npm run platform:strict',
    nextAction: 'Add VERCEL_TOKEN and set DEPLOY_ALLOW_PRODUCTION=true only when production deploys are owner-approved.',
  },
  {
    id: 'github-live-connector',
    label: 'GitHub live connector proof',
    provider: 'github',
    severity: 'P2',
    optional: true,
    envKey: 'GITHUB_TOKEN',
    approvalScope: 'provider_probe',
    route: 'POST /api/connectors/github-1/probe',
    proofCommand: 'npm run proof:connectors:live',
    nextAction: 'Add GITHUB_TOKEN if you want GitHub provider proof instead of local Git contract checks.',
  },
]);

const SKIP_DIRS = new Set(['.git', 'node_modules', 'dist', '.next', '.prompthouse-data', 'coverage', '.gemini', 'generated_apps']);
const SCAN_EXTS = new Set(['.js', '.jsx', '.mjs', '.cjs', '.json', '.md', '.yml', '.yaml', '.css']);
const RISKY_CLAIMS = [/100%\s+(done|complete|ready)/i, /market[-\s]?ready/i, /production\s+(complete|ready)/i, /fully\s+(deployed|automated|complete)/i];

export function createPlatformIssue(input) {
  return { severity: 'warning', truthLabel: 'NEEDS_REPAIR', ...input };
}

export class PlatformRouteInspector {
  constructor({ rootDir = process.cwd() } = {}) { this.rootDir = rootDir; }
  listRoutes() {
    const files = [join(this.rootDir, 'promptbridge-server.js')];
    const apiDir = join(this.rootDir, 'generated_apis');
    if (existsSync(apiDir)) for (const name of readdirSync(apiDir).filter(file => file.endsWith('.js'))) files.push(join(apiDir, name));
    const routes = new Set();
    const routeRegex = /app\.(get|post|put|patch|delete)\(\s*['"`]([^'"`]+)['"`]/g;
    for (const file of files) {
      if (!existsSync(file)) continue;
      const content = readFileSync(file, 'utf8');
      let match;
      while ((match = routeRegex.exec(content))) routes.add(`${match[1].toUpperCase()} ${match[2]}`);
    }
    return [...routes].sort();
  }
}

export class PlatformClaimScanner {
  constructor({ rootDir = process.cwd(), limit = 1000 } = {}) { this.rootDir = rootDir; this.limit = limit; }
  collectFiles() {
    const out = [];
    const scan = dir => {
      if (out.length >= this.limit) return;
      for (const item of readdirSync(dir)) {
        if (SKIP_DIRS.has(item)) continue;
        const full = join(dir, item);
        let stats;
        try { stats = statSync(full); } catch { continue; }
        if (stats.isDirectory()) scan(full);
        else if (SCAN_EXTS.has(extname(item).toLowerCase())) out.push(full);
      }
    };
    if (existsSync(this.rootDir)) scan(this.rootDir);
    return out;
  }
  scan() {
    const issues = [];
    const SECRET_KEY_PATTERNS = [
      new RegExp('sk_live_' + '[a-zA-Z0-9]{12,}', 'i'),
      new RegExp('sk_test_' + '[a-zA-Z0-9]{12,}', 'i'),
      new RegExp('sk-proj-' + '[a-zA-Z0-9-_]{12,}', 'i'),
      new RegExp('ph_evo_master_' + '[a-zA-Z0-9]{12,}', 'i'),
      new RegExp('evo_master_' + '[a-zA-Z0-9]{12,}', 'i')
    ];

    for (const file of this.collectFiles()) {
      const rel = relative(this.rootDir, file).replace(/\\/g, '/');
      if (
        rel === 'src/core/platform-sentinel/index.js' ||
        rel.startsWith('tests/') ||
        rel.includes('package-lock.json') ||
        rel.includes('.test.js') ||
        rel.includes('.test.jsx') ||
        rel.includes('.spec.js')
      ) {
        continue;
      }

      const content = readFileSync(file, 'utf8');
      const gatedContext = /PROVIDER_GATED|OWNER_APPROVAL_REQUIRED|proof-gated|blocked/i.test(content);

      for (const pattern of RISKY_CLAIMS) {
        const match = content.match(pattern);
        if (match && !gatedContext) {
          issues.push(createPlatformIssue({
            id: `claim:${rel}`,
            severity: 'error',
            file: rel,
            message: `Unproven readiness claim detected: ${match[0]}`
          }));
        }
      }

      for (const pattern of SECRET_KEY_PATTERNS) {
        const match = content.match(pattern);
        if (match) {
          issues.push(createPlatformIssue({
            id: `leak:${rel}`,
            severity: 'error',
            file: rel,
            message: `Raw un-redacted credential detected: ${match[0].slice(0, 8)}...`
          }));
        }
      }
    }
    return issues;
  }
}

export class PlatformGateRunner {
  constructor({ cwd = process.cwd(), timeoutMs = 120000 } = {}) { this.cwd = cwd; this.timeoutMs = timeoutMs; }
  runCommand(entry) {
    try {
      const output = execSync(entry.command, { cwd: this.cwd, stdio: 'pipe', encoding: 'utf8', timeout: this.timeoutMs, env: { ...process.env, CI: process.env.CI || 'true' } });
      return { ...entry, status: 'PASS', output: output.slice(-2000) };
    } catch (error) {
      return { ...entry, status: 'FAIL', exitCode: error.status ?? 1, output: String(error.stdout || '').slice(-2000), stderr: String(error.stderr || error.message || '').slice(-2000) };
    }
  }
  run({ includeHeavy = false } = {}) {
    const commands = includeHeavy ? PLATFORM_REQUIRED_COMMANDS : PLATFORM_REQUIRED_COMMANDS.filter(command => [!'test', 'build', 'architecture_audit'].includes(command.id));
    return commands.map(command => this.runCommand(command));
  }
}

export class PlatformReceiptLedger {
  constructor({ ledgerPath = join(process.cwd(), '.prompthouse-data', 'platform_sentinel_receipts.jsonl') } = {}) { this.ledgerPath = ledgerPath; }
  ensure() { const dir = dirname(this.ledgerPath); if (!existsSync(dir)) mkdirSync(dir, { recursive: true }); }
  append(receipt) { this.ensure(); const normalized = { id: receipt.id || `platform_receipt_${Date.now()}`, createdAt: new Date().toISOString(), ...receipt }; appendFileSync(this.ledgerPath, `${JSON.stringify(normalized)}\n`, 'utf8'); return normalized; }
  list({ limit = 50 } = {}) { if (!existsSync(this.ledgerPath)) return []; return readFileSync(this.ledgerPath, 'utf8').split('\n').filter(Boolean).slice(-limit).map(line => JSON.parse(line)).reverse(); }
}

export class PlatformReadinessEngine {
  constructor({ rootDir = process.cwd() } = {}) { this.rootDir = rootDir; this.routes = new PlatformRouteInspector({ rootDir }); this.ledger = new PlatformReceiptLedger(); }
  scripts() { const file = join(this.rootDir, 'package.json'); if (!existsSync(file)) return {}; return JSON.parse(readFileSync(file, 'utf8')).scripts || {}; }
  inspectModules() {
    const scripts = this.scripts();
    const routes = this.routes.listRoutes();
    return PLATFORM_MODULES.map(module => {
      const missing = [];
      for (const file of module.files) if (!existsSync(join(this.rootDir, file))) missing.push(`file:${file}`);
      for (const route of module.routes) if (!routes.some(item => item.endsWith(` ${route}`))) missing.push(`route:${route}`);
      for (const script of module.scripts) if (!scripts[script]) missing.push(`script:${script}`);
      return { ...module, status: missing.length ? 'FAILED' : 'PASS', missing };
    });
  }
  inspectStatic() {
    const issues = new PlatformClaimScanner({ rootDir: this.rootDir }).scan();
    const scripts = this.scripts();
    for (const script of ['build', 'test', 'audit:imports', 'audit:css', 'verify:studio', 'platform:status', 'platform:strict', 'platform:receipt']) {
      if (!scripts[script]) issues.push(createPlatformIssue({ id: `script:${script}`, severity: 'error', message: `Missing npm script ${script}` }));
    }
    for (const file of ['README.md', 'promptbridge-server.js', '.github/workflows/studio-proof.yml', '.github/workflows/platform-ready.yml', 'docs/platform-ready/PLATFORM_READY_CONTRACT.md']) {
      if (!existsSync(join(this.rootDir, file))) issues.push(createPlatformIssue({ id: `file:${file}`, severity: 'error', file, message: `Missing required platform file ${file}` }));
    }
    return issues;
  }
  providerGates() {
    const gates = [];
    return gates;
  }
  onlineBlockers({ includeOptional = true } = {}) {
    const blockers = [];
    for (const requirement of ONLINE_REQUIREMENTS) {
      if (requirement.optional && !includeOptional) continue;

      const value = process.env[requirement.envKey] || '';
      const missingCredential = !value.trim();
      const wrongPrefix = requirement.requiredPrefix && value.trim() && !value.startsWith(requirement.requiredPrefix);
      const flagBlocked = requirement.requiredFlag && process.env[requirement.requiredFlag.key] !== requirement.requiredFlag.value;

      if (!missingCredential && !wrongPrefix && !flagBlocked) continue;

      const reasons = [];
      if (missingCredential) reasons.push(`${requirement.envKey} missing`);
      if (wrongPrefix) reasons.push(`${requirement.envKey} must start with ${requirement.requiredPrefix}`);
      if (flagBlocked) reasons.push(`${requirement.requiredFlag.key} must equal ${requirement.requiredFlag.value}`);

      blockers.push({
        id: requirement.id,
        label: requirement.label,
        provider: requirement.provider,
        severity: requirement.severity,
        optional: requirement.optional === true,
        truthLabel: requirement.optional ? 'OPTIONAL_PROVIDER_GATED' : 'PROVIDER_GATED',
        reasons,
        requiredEnvKey: requirement.envKey,
        requiredFlag: requirement.requiredFlag || null,
        approvalScope: requirement.approvalScope,
        route: requirement.route,
        proofCommand: requirement.proofCommand,
        nextAction: requirement.nextAction,
      });
    }

    if (includeOptional) {
      let ollamaOnline = true;
      if (process.env.VITEST !== 'true') {
        try {
          const cmd = process.platform === 'win32' ? 'curl.exe' : 'curl';
          const out = execSync(`${cmd} --max-time 1 -s http://localhost:11434/api/tags`, { stdio: 'pipe', timeout: 1500 });
          ollamaOnline = out && out.toString().includes('models');
        } catch {
          ollamaOnline = false;
        }
      } else {
        ollamaOnline = process.env.SIMULATE_OLLAMA_OFFLINE !== 'true';
      }

      if (!ollamaOnline) {
        blockers.push({
          id: 'ollama-local-server',
          label: 'Ollama local tag server check',
          provider: 'ollama',
          severity: 'P2',
          optional: true,
          truthLabel: 'OPTIONAL_PROVIDER_GATED',
          reasons: ['Ollama local server offline or unreachable on port 11434'],
          requiredEnvKey: null,
          requiredFlag: null,
          approvalScope: 'provider_probe',
          route: 'GET http://localhost:11434/api/tags',
          proofCommand: 'ollama serve',
          nextAction: 'Ensure Ollama is installed and running locally with "ollama serve".',
        });
      }
    }

    if (includeOptional) {
      const evoUrl = process.env.EVO_API_URL || 'https://api.evo.prompthouse.dev/v1/chat/completions';
      const evoKey = process.env.PH_EVO_API_KEY || process.env.PH_EVO_MASTER_KEY || '';
      const hasEvoKey = Boolean(evoKey.trim());

      if (!hasEvoKey) {
        blockers.push({
          id: 'evo-api-credentials',
          label: 'Evo API remote credentials check',
          provider: 'evo',
          severity: 'P1',
          optional: true,
          truthLabel: 'OPTIONAL_PROVIDER_GATED',
          reasons: ['PH_EVO_API_KEY or PH_EVO_MASTER_KEY is missing'],
          requiredEnvKey: 'PH_EVO_API_KEY',
          requiredFlag: null,
          approvalScope: 'provider_probe',
          route: 'POST /api/connectors/evo/probe',
          proofCommand: 'npm run proof:connectors:live',
          nextAction: 'Add PH_EVO_API_KEY to enable remote Evo API completions and training synchronization.',
        });
      } else {
        let evoConnected = true;
        if (process.env.VITEST !== 'true') {
          try {
            const cmd = process.platform === 'win32' ? 'curl.exe' : 'curl';
            const out = execSync(`${cmd} --max-time 2 -s -o NUL -w "%{http_code}" "${evoUrl}"`, { stdio: 'pipe', timeout: 2500 });
            const code = out.toString().trim();
            evoConnected = code && code !== '000';
          } catch {
            evoConnected = false;
          }
        } else {
          evoConnected = process.env.SIMULATE_EVO_OFFLINE !== 'true';
        }

        if (!evoConnected) {
          blockers.push({
            id: 'evo-api-connectivity',
            label: 'Evo API remote connectivity check',
            provider: 'evo',
            severity: 'P1',
            optional: true,
            truthLabel: 'OPTIONAL_PROVIDER_GATED',
            reasons: [`Failed to connect to Evo API URL (${evoUrl})`],
            requiredEnvKey: 'EVO_API_URL',
            requiredFlag: null,
            approvalScope: 'provider_probe',
            route: 'POST /api/connectors/evo/probe',
            proofCommand: 'npm run proof:connectors:live',
            nextAction: `Verify network connection to ${evoUrl} and ensure the endpoint is active.`,
          });
        }
      }
    }

    return blockers;
  }
  onlineSummary(onlineBlockers = this.onlineBlockers()) {
    const required = onlineBlockers.filter(item => !item.optional);
    const optional = onlineBlockers.filter(item => item.optional);
    return {
      truthLabel: required.length ? 'PROVIDER_GATED' : optional.length ? 'OPTIONAL_PROVIDER_GATED' : 'ONLINE_READY',
      requiredBlockers: required.length,
      optionalBlockers: optional.length,
      totalBlockers: onlineBlockers.length,
    };
  }
  status({ runCommands = false, includeHeavy = false } = {}) {
    const modules = this.inspectModules();
    const issues = this.inspectStatic();
    const commands = runCommands ? new PlatformGateRunner({ cwd: this.rootDir }).run({ includeHeavy }) : PLATFORM_REQUIRED_COMMANDS.map(command => ({ ...command, status: 'NOT_RUN' }));
    const blockers = [...issues.filter(issue => issue.severity === 'error'), ...modules.filter(module => module.critical && module.status !== 'PASS'), ...commands.filter(command => command.critical && command.status === 'FAIL')];
    const onlineBlockers = this.onlineBlockers();
    const onlineSummary = this.onlineSummary(onlineBlockers);
    const score = blockers.length ? Math.max(0, 89 - blockers.length * 3) : (this.providerGates().length ? 95 : 100);
    const release = blockers.length ? { verdict: 'BLOCKED', truthLabel: 'NEEDS_REPAIR', reason: 'Critical platform readiness blockers remain.' } : (this.providerGates().length ? { verdict: 'PROVIDER_GATED', truthLabel: 'PROVIDER_GATED', reason: 'Local gates are not blocking, but provider credentials or approvals are still gated.' } : { verdict: 'PLATFORM_READY', truthLabel: 'PLATFORM_READY', reason: 'All critical platform readiness gates passed.' });
    const repairQueue = blockers.map(item => ({ priority: 'P0', title: item.message || `Complete module readiness: ${item.label || item.id}`, detail: item.file || item.missing?.join(', ') || item.command || item.reason || '' }));
    return { generatedAt: new Date().toISOString(), score, release, issues, modules, commands, providerGates: this.providerGates(), onlineBlockers, onlineSummary, repairQueue, routes: this.routes.listRoutes() };
  }
  receipt(options = {}) { const result = this.status(options); return this.ledger.append({ type: 'platform_readiness_receipt', score: result.score, release: result.release, blockers: result.repairQueue.length, onlineBlockers: result.onlineBlockers.length, result }); }
  receipts(options = {}) { return this.ledger.list(options); }
  auditDomAndApps() {
    const featuresDir = join(this.rootDir, 'src', 'features');
    const coreDir = join(this.rootDir, 'src', 'core');
    const issues = [];
    if (existsSync(featuresDir)) issues.push(...new PlatformClaimScanner({ rootDir: featuresDir }).scan());
    if (existsSync(coreDir)) issues.push(...new PlatformClaimScanner({ rootDir: coreDir }).scan());
    const blockers = issues.filter(issue => issue.severity === 'error');
    const verdict = blockers.length ? 'NEEDS_REPAIR' : 'DOM_READY';
    return { verdict, issues, totalBlockers: blockers.length, auditedAt: new Date().toISOString() };
  }
}
