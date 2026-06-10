#!/usr/bin/env node
import { spawnSync } from 'child_process';

const commands = [
  ['node', ['scripts/full_studio_master_audit.mjs']],
  ['npm', ['run', 'architecture:audit']],
  ['npm', ['run', 'test', '--', 'tests/master-readiness-contracts.test.js']],
  ['npm', ['run', 'enterprise:edge']],
];

const results = [];
for (const [command, args] of commands) {
  const startedAt = Date.now();
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    encoding: 'utf8',
    shell: process.platform === 'win32',
    maxBuffer: 1024 * 1024 * 10,
  });
  results.push({
    command: [command, ...args].join(' '),
    status: result.status,
    success: result.status === 0,
    durationMs: Date.now() - startedAt,
    stdout: String(result.stdout || '').slice(0, 20000),
    stderr: String(result.stderr || '').slice(0, 20000),
  });
  if (result.status !== 0) break;
}

const receipt = {
  success: results.every(item => item.success),
  truthState: results.every(item => item.success) ? 'MASTER_PROOF_BUNDLE_PASS' : 'MASTER_PROOF_BUNDLE_FAILED',
  generatedAt: new Date().toISOString(),
  results,
};

console.log(JSON.stringify(receipt, null, 2));
process.exit(receipt.success ? 0 : 1);
