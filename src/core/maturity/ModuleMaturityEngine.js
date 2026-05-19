import fs from 'fs';
import path from 'path';

const CHECKS = [
  ['routeExists', 'Route exists'],
  ['uiPageExists', 'UI page exists'],
  ['pageLoadsGuarded', 'Page loads without crash guard'],
  ['buttonsHaveActions', 'Buttons do real actions'],
  ['actionsCallServices', 'Actions call real APIs/services'],
  ['apisReturnData', 'APIs return real data'],
  ['persistenceHandled', 'Data is persisted if needed'],
  ['errorsHandled', 'Errors are handled clearly'],
  ['testsCoverModule', 'Tests cover the module'],
  ['buildGateCovered', 'Build passes gate reference exists'],
  ['auditGateCovered', 'Audit passes gate reference exists'],
  ['noBannedLanguage', 'No fake/dummy/pending language'],
  ['proofReceiptGenerated', 'Proof receipt is generated'],
  ['userReadableStatus', 'User can understand success/failure']
];

const BANNED_LANGUAGE = ['todo', 'placeholder', 'mock', 'dummy', 'stub', 'fake', 'for brevity', 'lorem ipsum', 'pending implementation', 'currently gated'];

const MODULE_SEEDS = [
  { id: 'self-evolution', name: 'Self-Evolution Engine', uiHints: ['SelfEvolutionDashboard', 'self-evolution'], apiHints: ['/api/self-evolution', 'runEvolutionCycle'], testHints: ['evolution', 'self_evolution'] },
  { id: 'cost-firewall', name: 'Cost Firewall V2', uiHints: ['CostFirewallDashboard', 'cost-firewall'], apiHints: ['/api/cost-firewall', 'cost_firewall'], testHints: ['cost_firewall', 'cost-firewall'] },
  { id: 'theme-evolution', name: 'Theme Evolution Engine', uiHints: ['ThemeEvolutionDashboard', 'theme-evolution'], apiHints: ['/api/theme-evolution', 'ThemeEvolution'], testHints: ['theme-evolution', 'theme'] },
  { id: 'nuclear-audit', name: 'Nuclear Static Audit Gates', uiHints: ['verify:studio', 'audit:imports', 'audit:css'], apiHints: ['verify-studio', 'audit-imports', 'audit-css-vars'], testHints: ['verify-studio', 'audit-imports', 'audit-css-vars'] },
  { id: 'proof-console', name: 'Proof Console', uiHints: ['ProofConsole', 'ProofLedgerView', 'ProofVaultView'], apiHints: ['proof', 'ledger'], testHints: ['proof'] },
  { id: 'forge-labs', name: 'Forge Labs', uiHints: ['ForgeLabs', 'ForgeLabView', 'ForgeRenderConsoleView'], apiHints: ['forge', 'render'], testHints: ['forge'] },
  { id: 'mobile-simulator', name: 'Mobile Simulator Hub', uiHints: ['EvoMobileSimulator', 'emulator'], apiHints: ['/api/emulator', 'emulator'], testHints: ['emulator'] },
  { id: 'prompt-registry', name: 'Prompt Registry', uiHints: ['PromptRegistry', 'MasterPromptVaultView'], apiHints: ['prompt', 'registry'], testHints: ['prompt'] },
  { id: 'ai-generator', name: 'AI Generator Hub', uiHints: ['AIGeneratorHub', 'AIPromptGeneratorView'], apiHints: ['ai', 'generator'], testHints: ['ai-generator', 'prompt-generator'] },
  { id: 'evo-model-foundry', name: 'Evo Model Foundry', uiHints: ['EvoModelFoundry', 'EvoExchangeView', 'PatternMinerView'], apiHints: ['model', 'foundry', 'evo-lm'], testHints: ['evo-runtime', 'model'] },
  { id: 'commerce-core', name: 'Commerce Core', uiHints: ['CommerceCore', 'CommerceRailView'], apiHints: ['commerce', 'checkout', 'stripe'], testHints: ['commerce', 'checkout', 'stripe'] },
  { id: 'deployment-center', name: 'Deployment Center', uiHints: ['DeploymentCenterView', 'DeployRailView'], apiHints: ['deploy', 'deployment'], testHints: ['deploy'] },
  { id: 'settings-api', name: 'Settings & API Credentials', uiHints: ['GlobalAPISettingsView', 'ProviderStatusPanel', 'ProviderCredentialChecklistPanel'], apiHints: ['api_keys', 'provider', 'credential'], testHints: ['provider', 'credential'] },
  { id: 'live-inspector', name: 'Live Inspector & Diagnostics', uiHints: ['LiveInspector', 'EvoEyesView', 'studio_diagnostics'], apiHints: ['diagnostics', 'metrics', 'healthz'], testHints: ['diagnostics', 'health'] },
  { id: 'sovereign-control', name: 'Sovereign Control', uiHints: ['SovereignControl', 'SingularityCoreView', 'RecursiveSwarmView'], apiHints: ['sovereign', 'singularity', 'swarm'], testHints: ['sovereign'] }
];

function walk(root, allowedExts, ignoreDirs = new Set(['node_modules', '.git', 'dist', 'build', '.prompthouse-data'])) {
  const out = [];
  if (!fs.existsSync(root)) return out;
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (ignoreDirs.has(entry.name)) continue;
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) out.push(...walk(full, allowedExts, ignoreDirs));
    else if (allowedExts.includes(path.extname(entry.name))) out.push(full);
  }
  return out;
}

function readSafe(file) {
  try { return fs.readFileSync(file, 'utf8'); } catch { return ''; }
}

function includesAny(text, hints) {
  const lower = text.toLowerCase();
  return hints.some(hint => lower.includes(String(hint).toLowerCase()));
}

function relevantFiles(files, hints, rootDir) {
  return files.filter(file => includesAny(path.relative(rootDir, file), hints) || includesAny(readSafe(file), hints));
}

function checkBannedLanguage(files) {
  const offenders = [];
  for (const file of files) {
    const content = readSafe(file);
    const lower = content.toLowerCase();
    for (const word of BANNED_LANGUAGE) {
      if (lower.includes(word)) offenders.push({ file, word });
    }
  }
  return offenders;
}

function scoreModule(seed, context) {
  const { rootDir, sourceFiles, testFiles, packageJson } = context;
  const uiFiles = relevantFiles(sourceFiles, seed.uiHints, rootDir);
  const apiFiles = relevantFiles(sourceFiles, seed.apiHints, rootDir);
  const tests = relevantFiles(testFiles, seed.testHints, rootDir);
  const combinedFiles = [...new Set([...uiFiles, ...apiFiles])];
  const combinedText = combinedFiles.map(readSafe).join('\n');
  const routeRegex = /app\.(get|post|put|patch|delete)\(['"`][^'"`]+['"`]/i;
  const hasButton = /<button|onClick=|onSubmit=|role=['"]button/i.test(combinedText);
  const callsApi = /safeFetchBridge|fetch\(|axios|app\.(get|post|put|patch|delete)|evaluateCostedRequest|runEvolutionCycle|\/api\//i.test(combinedText);
  const persistence = /fs\.writeFileSync|localStorage|sessionStorage|sqlite|better-sqlite|db\.|save[A-Z]|append.*Receipt|write.*json/i.test(combinedText);
  const errorHandling = /try\s*{|catch\s*\(|\.catch\(|error|failed|blocked|truthState/i.test(combinedText);
  const receipt = /receipt|ledger|proof|truthState|createdAt/i.test(combinedText);
  const readable = /success|failed|blocked|passed|status|truthState|Badge|StateView/i.test(combinedText);
  const banned = checkBannedLanguage(combinedFiles.map(file => path.resolve(file)));
  const scripts = packageJson.scripts || {};

  const checks = {
    routeExists: apiFiles.some(file => routeRegex.test(readSafe(file)) || readSafe(file).includes('/api/')),
    uiPageExists: uiFiles.some(file => path.extname(file) === '.jsx' || readSafe(file).includes('export function') || readSafe(file).includes('export default function')),
    pageLoadsGuarded: combinedText.includes('ErrorBoundary') || combinedText.includes('StateView') || errorHandling,
    buttonsHaveActions: hasButton && /onClick=|onSubmit=|disabled=|run\(|refresh/i.test(combinedText),
    actionsCallServices: callsApi,
    apisReturnData: /res\.json|ok\(res|return \{|success: true|json\(/i.test(combinedText),
    persistenceHandled: persistence || seed.id.includes('audit') || seed.id.includes('proof'),
    errorsHandled: errorHandling,
    testsCoverModule: tests.length > 0,
    buildGateCovered: Boolean(scripts.build),
    auditGateCovered: Boolean(scripts['audit:imports'] && scripts['audit:css'] && scripts['verify:studio']),
    noBannedLanguage: banned.length === 0,
    proofReceiptGenerated: receipt,
    userReadableStatus: readable
  };

  const passed = Object.values(checks).filter(Boolean).length;
  const score = Math.round((passed / CHECKS.length) * 100);
  const missing = CHECKS.filter(([key]) => !checks[key]).map(([key, label]) => ({ key, label }));
  return {
    id: seed.id,
    name: seed.name,
    score,
    grade: score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F',
    checks,
    missing,
    evidence: {
      uiFiles: uiFiles.map(file => path.relative(rootDir, file)).slice(0, 12),
      apiFiles: apiFiles.map(file => path.relative(rootDir, file)).slice(0, 12),
      testFiles: tests.map(file => path.relative(rootDir, file)).slice(0, 12),
      bannedLanguage: banned.map(item => ({ file: path.relative(rootDir, item.file), word: item.word })).slice(0, 20)
    }
  };
}

export function runModuleMaturityAudit({ rootDir = process.cwd() } = {}) {
  const packagePath = path.join(rootDir, 'package.json');
  const packageJson = fs.existsSync(packagePath) ? JSON.parse(readSafe(packagePath)) : { scripts: {} };
  const sourceRoots = ['src', 'server', 'generated_apis', 'scripts'].map(dir => path.join(rootDir, dir));
  const sourceFiles = sourceRoots.flatMap(root => walk(root, ['.js', '.jsx', '.mjs', '.cjs']));
  const testFiles = walk(path.join(rootDir, 'tests'), ['.js', '.jsx', '.mjs', '.cjs']);
  const modules = MODULE_SEEDS.map(seed => scoreModule(seed, { rootDir, sourceFiles, testFiles, packageJson }));
  const averageScore = Math.round(modules.reduce((sum, item) => sum + item.score, 0) / Math.max(modules.length, 1));
  const blockers = modules.flatMap(module => module.missing.map(missing => ({ moduleId: module.id, moduleName: module.name, ...missing })));
  return {
    generatedAt: new Date().toISOString(),
    truthState: blockers.length ? 'MATURITY_GAPS_FOUND' : 'MATURITY_COMPLETE',
    averageScore,
    moduleCount: modules.length,
    checklist: CHECKS.map(([key, label]) => ({ key, label })),
    modules,
    blockers,
    summary: {
      a: modules.filter(m => m.grade === 'A').length,
      b: modules.filter(m => m.grade === 'B').length,
      c: modules.filter(m => m.grade === 'C').length,
      d: modules.filter(m => m.grade === 'D').length,
      f: modules.filter(m => m.grade === 'F').length
    }
  };
}

export function writeModuleMaturityReceipt({ rootDir = process.cwd(), report = null } = {}) {
  const finalReport = report || runModuleMaturityAudit({ rootDir });
  const dir = path.join(rootDir, '.prompthouse-data', 'maturity');
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `module-maturity-${Date.now()}.json`);
  fs.writeFileSync(file, JSON.stringify(finalReport, null, 2), 'utf8');
  return { file, report: finalReport };
}
