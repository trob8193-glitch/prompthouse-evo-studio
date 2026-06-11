#!/usr/bin/env node
import fs from 'fs';
import {
  evaluateFrontierIntelligenceSafety,
  getFrontierIntelligenceSafetyContract,
  getFrontierIntelligenceSafetyStatus,
  writeFrontierSafetyReceipt
} from '../src/core/evo-llm/FrontierIntelligenceSafetyGate.js';

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
    console.log(JSON.stringify(getFrontierIntelligenceSafetyContract(), null, 2));
    process.exit(0);
  }
  if (args.has('--status')) {
    console.log(JSON.stringify(getFrontierIntelligenceSafetyStatus({ rootDir }), null, 2));
    process.exit(0);
  }
  const request = readJsonArg('--request') || {
    mode: 'plan',
    planOnly: true,
    summary: 'Plan-only frontier intelligence safety check.',
    approvalRef: process.env.PH_EVO_APPROVAL_REF || 'plan-only-check',
    workspaceScope: 'sandbox',
    tests: ['node --check'],
    rollbackPlan: 'No code changes in plan-only mode.',
    receiptPlan: 'Write safety decision receipt.'
  };
  const decision = evaluateFrontierIntelligenceSafety({ rootDir, request });
  const receipt = writeFrontierSafetyReceipt({ rootDir, decision, payload: { request, decision } });
  console.log(JSON.stringify({ success: true, decision, receipt }, null, 2));
  if (!decision.allowed) process.exitCode = 1;
} catch (error) {
  console.error(JSON.stringify({ success: false, truthState: 'FRONTIER_SAFETY_CLI_FAILED', error: error.message }, null, 2));
  process.exit(1);
}
