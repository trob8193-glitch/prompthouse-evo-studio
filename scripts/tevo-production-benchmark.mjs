import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const startedAt = new Date();
const runId = 'tevo-benchmark-' + Date.now() + '-' + crypto.randomUUID().slice(0, 8);
const dir = path.join(root, '.prompthouse-data', 'proof', 'benchmarks', runId);
mkdirSync(dir, { recursive: true });

const commands = [
  ['npm', ['run', 'build']],
  ['npm', ['run', 'test']],
  ['npm', ['run', 'verify:studio']],
  ['npm', ['run', 'maturity:strict']],
  ['npm', ['run', 'cost:check']],
  ['npm', ['run', 'platform:strict']],
  ['npm', ['run', 'tevo:evidence:test']],
  ['npm', ['run', 'audit:no-mock']]
];

function run(command, args) {
  return new Promise(resolve => {
    const child = spawn(command, args, { cwd: root, shell: process.platform === 'win32', env: process.env });
    let stdout = ''; let stderr = '';
    child.stdout.on('data', data => { stdout += data; });
    child.stderr.on('data', data => { stderr += data; });
    child.on('close', code => resolve({ command: [command, ...args].join(' '), exitCode: code, passed: code === 0, stdout, stderr }));
  });
}

const results = [];
for (const [command, args] of commands) {
  const result = await run(command, args);
  results.push({ command: result.command, exitCode: result.exitCode, passed: result.passed });
  writeFileSync(path.join(dir, String(results.length).padStart(2, '0') + '.log'), result.stdout + (result.stderr ? '\nSTDERR\n' + result.stderr : ''));
  if (!result.passed) break;
}

const passed = results.length === commands.length && results.every(r => r.passed);
const receipt = {
  schemaVersion: 1, proofType: 'tevo_production_benchmark', runId,
  startedAt: startedAt.toISOString(), completedAt: new Date().toISOString(), passed,
  evidencePolicy: 'REAL_EXECUTION_ONLY', commands: results,
  metrics: { engineering_gate_success_rate: { numerator: results.filter(r => r.passed).length, denominator: commands.length, value: results.length === commands.length ? results.filter(r => r.passed).length / commands.length : null } },
  notProven: [
    'autonomous_build_success_rate', 'self_repair_rate', 'regression_free_change_rate',
    'human_intervention_rate', 'cost_per_successful_output', 'time_to_production',
    '3d_generation_success_rate', 'security_boundary_failure_rate', 'scale_reliability', 'retention_and_revenue'
  ],
  note: 'Missing workload or business evidence remains NOT_PROVEN; this runner never fabricates those measurements.'
};

const receiptPath = path.join(dir, 'receipt.json');
writeFileSync(receiptPath, JSON.stringify(receipt, null, 2));
console.log(JSON.stringify({ ...receipt, receiptPath: path.relative(root, receiptPath) }, null, 2));
process.exitCode = passed ? 0 : 1;