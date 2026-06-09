import { execSync } from 'child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';

const ROOT_DIR = process.cwd();
const DATA_DIR = path.join(ROOT_DIR, '.prompthouse-data');
const REPORT_JSON = path.join(DATA_DIR, 'reality_audit_report.json');
const REPORT_MD = path.join(DATA_DIR, 'reality_audit_report.md');

const CHECKS = [
  { id: 'build', label: 'Frontend build', command: 'npm run build', localRequired: true },
  { id: 'test', label: 'Vitest suite', command: 'npm test', localRequired: true },
  { id: 'route_drift', label: 'Route drift audit', command: 'node scripts/audit-route-drift.mjs', localRequired: true },
  { id: 'dead_surfaces', label: 'Dead surface audit', command: 'npm run audit:dead-surfaces', localRequired: true },
  { id: 'platform_strict', label: 'Platform strict readiness', command: 'npm run platform:strict', localRequired: false },
  { id: 'provider_proof', label: 'Provider activation proof', command: 'npm run proof:providers', localRequired: false },
  { id: 'evo_train_status', label: 'Evo LLM training status', command: 'npm run evo:train-status', localRequired: false },
  { id: 'evo_provider_training', label: 'Provider training plan', command: 'npm run evo:train-plan-provider', localRequired: false }
];

function run(command) {
  try {
    const output = execSync(command, {
      cwd: ROOT_DIR,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true
    });
    return { exitCode: 0, output };
  } catch (error) {
    return {
      exitCode: typeof error.status === 'number' ? error.status : 1,
      output: `${error.stdout || ''}${error.stderr || ''}`
    };
  }
}

function trimOutput(output) {
  return String(output || '').split(/\r?\n/).filter(Boolean).slice(-60).join('\n');
}

function classify(check, result) {
  const text = String(result.output || '');
  if (result.exitCode !== 0) {
    return check.localRequired ? 'LOCAL_FAILURE' : 'PROVIDER_OR_EXTERNAL_BLOCKER';
  }
  if (/PROVIDER_GATED|REQUIRED|missing|BLOCKED|SECRET_KEY_REQUIRED|TOKEN missing/i.test(text)) {
    return 'PROVIDER_OR_EXTERNAL_BLOCKER';
  }
  return 'PASS';
}

function readGitStatus() {
  const result = run('git status --short --branch');
  return result.output.trim();
}

function buildReport(results) {
  const localFailures = results.filter((item) => item.classification === 'LOCAL_FAILURE');
  const providerBlockers = results.filter((item) => item.classification === 'PROVIDER_OR_EXTERNAL_BLOCKER');
  return {
    generatedAt: new Date().toISOString(),
    truthState: localFailures.length ? 'LOCAL_FAILURES_FOUND' : providerBlockers.length ? 'PROVIDER_GATED' : 'REALITY_AUDIT_CLEAR',
    localReady: localFailures.length === 0,
    providerReady: providerBlockers.length === 0,
    gitStatus: readGitStatus(),
    summary: {
      checks: results.length,
      passed: results.filter((item) => item.classification === 'PASS').length,
      localFailures: localFailures.length,
      providerBlockers: providerBlockers.length
    },
    results
  };
}

function toMarkdown(report) {
  const rows = report.results
    .map((item) => `| ${item.id} | ${item.classification} | ${item.exitCode} | ${item.label} |`)
    .join('\n');
  return [
    '# PromptHouse Reality Audit',
    '',
    `Generated: ${report.generatedAt}`,
    `Truth state: ${report.truthState}`,
    `Local ready: ${report.localReady}`,
    `Provider ready: ${report.providerReady}`,
    '',
    '## Summary',
    '',
    `- Checks: ${report.summary.checks}`,
    `- Passed: ${report.summary.passed}`,
    `- Local failures: ${report.summary.localFailures}`,
    `- Provider or external blockers: ${report.summary.providerBlockers}`,
    '',
    '## Checks',
    '',
    '| Check | Classification | Exit | Label |',
    '| --- | --- | --- | --- |',
    rows,
    '',
    '## Git Status',
    '',
    '```',
    report.gitStatus || 'clean',
    '```'
  ].join('\n');
}

mkdirSync(DATA_DIR, { recursive: true });

const results = CHECKS.map((check) => {
  console.log(`[reality:audit] ${check.label}`);
  const result = run(check.command);
  return {
    ...check,
    exitCode: result.exitCode,
    classification: classify(check, result),
    outputTail: trimOutput(result.output)
  };
});

const report = buildReport(results);
writeFileSync(REPORT_JSON, JSON.stringify(report, null, 2));
writeFileSync(REPORT_MD, toMarkdown(report));

console.log(JSON.stringify({
  truthState: report.truthState,
  localReady: report.localReady,
  providerReady: report.providerReady,
  summary: report.summary,
  reportJson: REPORT_JSON,
  reportMarkdown: REPORT_MD
}, null, 2));

if (!report.localReady) {
  process.exitCode = 1;
}
