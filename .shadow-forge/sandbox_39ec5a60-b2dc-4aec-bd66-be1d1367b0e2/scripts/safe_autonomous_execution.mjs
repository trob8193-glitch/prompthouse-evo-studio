#!/usr/bin/env node
import fs from 'fs';
import {
  createSafeAutonomousExecutionPlan,
  getSafeAutonomousExecutionContract,
  getSafeAutonomousExecutionStatus,
  writeSafeAutonomousExecutionReceipt
} from '../src/core/autonomy/SafeAutonomousExecutionKernel.js';

const rootDir = process.cwd();
const args = new Set(process.argv.slice(2));

function readJsonArg(flag) {
  const found = process.argv.find((arg) => arg.startsWith(`${flag}=`));
  if (!found) return null;
  const raw = found.slice(flag.length + 1);
  if (fs.existsSync(raw)) return JSON.parse(fs.readFileSync(raw, 'utf8'));
  return JSON.parse(raw);
}

try {
  if (args.has('--contract')) {
    console.log(JSON.stringify(getSafeAutonomousExecutionContract(), null, 2));
    process.exit(0);
  }
  if (args.has('--status')) {
    console.log(JSON.stringify(getSafeAutonomousExecutionStatus({ rootDir }), null, 2));
    process.exit(0);
  }
  const request = readJsonArg('--request') || {
    summary: 'Create a safe autonomous execution plan for PromptHouse Evo Studio.',
    approvalRef: process.env.PH_EVO_APPROVAL_REF || 'local-approval-required',
    workspaceScope: 'repo',
    tests: ['npm run build', 'npm run verify:studio', 'node scripts/audit_intelligence_stack.mjs'],
    rollbackPlan: 'Revert branch or restore prior commit before promotion.',
    receiptPlan: 'Write safety, execution, verification, and promotion receipts.',
    humanReviewRequired: true
  };
  const plan = createSafeAutonomousExecutionPlan({ rootDir, request });
  const receipt = writeSafeAutonomousExecutionReceipt({ rootDir, type: 'safe_autonomous_execution_cli_receipt', payload: plan });
  console.log(JSON.stringify({ success: true, plan, receipt }, null, 2));
  if (!plan.allowed) process.exitCode = 1;
} catch (error) {
  console.error(JSON.stringify({ success: false, truthState: 'SAFE_AUTONOMOUS_EXECUTION_CLI_FAILED', error: error.message }, null, 2));
  process.exit(1);
}
