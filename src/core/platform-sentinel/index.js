import { execSync } from 'child_process';
import { appendFileSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync } from 'fs';
import { dirname, extname, join, relative } from 'path';

export const PLATFORM_TRUTH_LABELS = Object.freeze([
  'BUILT', 'VERIFIED', 'PROVEN', 'BLOCKED', 'FAILED', 'PROVIDER_GATED',
  'OWNER_APPROVAL_REQUIRED', 'NEEDS_REPAIR', 'READY_FOR_PILOT', 'PLATFORM_READY'
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
  { id: 'test', command: 'npm test', critical: true },
  { id: 'build', command: 'npm run build', critical: true },
  { id: 'audit_imports', command: 'npm run audit:imports', critical: true },
  { id: 'audit_css', command: 'npm run audit:css', critical: true },
  { id: 'verify_studio', command: 'npm run verify:studio', critical: true },
  { id: 'maturity', command: 'npm run maturity:check', critical: true },
  { id: 'evolve_status', command: 'npm run evolve:status', critical: false }
]);

const SKIP_DIRS = new Set(['.git', 'node_modules', 'dist', '.next', '.prompthouse-data', 'coverage']);
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
    for (const file of this.collectFiles()) {
      const content = readFileSync(file, 'utf8');
      const gatedContext = /PROVIDER_GATED|OWNER_APPROVAL_REQUIRED|proof-gated|blocked/i.test(content);
      const rel = relative(this.rootDir, file).replace(/\\/g, '/');
      for (const pattern of RISKY_CLAIMS) {
        const match = content.match(pattern);
        if (match && !gatedContext) issues.push(createPlatformIssue({ id: `claim:${rel}`, severity: 'error', file: rel, message: `Unproven readiness claim detected: ${match[0]}` }));
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
    const commands = includeHeavy ? PLATFORM_REQUIRED_COMMANDS : PLATFORM_REQUIRED_COMMANDS.filter(command => !['test', 'build'].includes(command.id));
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
    if (!process.env.VERCEL_TOKEN) gates.push({ id: 'vercel-token', truthLabel: 'PROVIDER_GATED', reason: 'VERCEL_TOKEN missing.' });
    if (!process.env.STRIPE_SECRET_KEY) gates.push({ id: 'stripe-secret', truthLabel: 'PROVIDER_GATED', reason: 'STRIPE_SECRET_KEY missing.' });
    if (!process.env.OPENAI_API_KEY) gates.push({ id: 'openai-key', truthLabel: 'PROVIDER_GATED', reason: 'OPENAI_API_KEY missing.' });
    return gates;
  }
  status({ runCommands = false, includeHeavy = false } = {}) {
    const modules = this.inspectModules();
    const issues = this.inspectStatic();
    const commands = runCommands ? new PlatformGateRunner({ cwd: this.rootDir }).run({ includeHeavy }) : PLATFORM_REQUIRED_COMMANDS.map(command => ({ ...command, status: 'NOT_RUN' }));
    const blockers = [...issues.filter(issue => issue.severity === 'error'), ...modules.filter(module => module.critical && module.status !== 'PASS'), ...commands.filter(command => command.critical && command.status === 'FAIL')];
    const score = blockers.length ? Math.max(0, 89 - blockers.length * 3) : (this.providerGates().length ? 95 : 100);
    const release = blockers.length ? { verdict: 'BLOCKED', truthLabel: 'NEEDS_REPAIR', reason: 'Critical platform readiness blockers remain.' } : (this.providerGates().length ? { verdict: 'PROVIDER_GATED', truthLabel: 'PROVIDER_GATED', reason: 'Local gates are not blocking, but provider credentials or approvals are still gated.' } : { verdict: 'PLATFORM_READY', truthLabel: 'PLATFORM_READY', reason: 'All critical platform readiness gates passed.' });
    const repairQueue = blockers.map(item => ({ priority: 'P0', title: item.message || `Complete module readiness: ${item.label || item.id}`, detail: item.file || item.missing?.join(', ') || item.command || item.reason || '' }));
    return { generatedAt: new Date().toISOString(), score, release, issues, modules, commands, providerGates: this.providerGates(), repairQueue, routes: this.routes.listRoutes() };
  }
  receipt(options = {}) { const result = this.status(options); return this.ledger.append({ type: 'platform_readiness_receipt', score: result.score, release: result.release, blockers: result.repairQueue.length, result }); }
  receipts(options = {}) { return this.ledger.list(options); }
}
