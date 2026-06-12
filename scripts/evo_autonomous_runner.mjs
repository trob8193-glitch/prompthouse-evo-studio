import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';
import { evaluateFrontierIntelligenceSafety, writeFrontierSafetyReceipt } from '../src/core/evo-llm/FrontierIntelligenceSafetyGate.js';
import { ingestEvoWorkMemory, buildEvoWorkMemoryDataset } from '../src/core/evo-llm/EvoWorkMemoryEngine.js';
import dotenv from 'dotenv';

dotenv.config({ override: true });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const args = new Set(process.argv.slice(2));
const execute = args.has('--execute');
const statusOnly = args.has('--status');
const contractOnly = args.has('--contract');
const receiptDir = path.join(rootDir, '.prompthouse-data', 'autonomous-execution', 'receipts');
const patchFile = path.join(rootDir, 'src', 'core', 'evo-llm', 'AutonomousExecutionHeartbeat.js');
const allowedProofCommands = [
  ['node', ['--check', 'scripts/evo_autonomous_runner.mjs']],
  ['node', ['--check', 'src/core/evo-llm/AutonomousExecutionHeartbeat.js']],
  ['node', ['scripts/frontier_safety_gate.mjs', '--status']],
  ['node', ['scripts/evo_work_memory.mjs', '--status']],
  ['node', ['scripts/audit_intelligence_stack.mjs']]
];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeJson(file, value) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, JSON.stringify(value, null, 2), 'utf8');
}

function runCommand(command, commandArgs) {
  const startedAt = new Date().toISOString();
  try {
    const output = execFileSync(command, commandArgs, {
      cwd: rootDir,
      stdio: 'pipe',
      encoding: 'utf8',
      timeout: 120000
    });
    return { command: [command, ...commandArgs].join(' '), ok: true, startedAt, completedAt: new Date().toISOString(), output: output.slice(-3000) };
  } catch (error) {
    return {
      command: [command, ...commandArgs].join(' '),
      ok: false,
      startedAt,
      completedAt: new Date().toISOString(),
      output: String(error.stdout || '').slice(-3000),
      error: String(error.stderr || error.message || error).slice(-3000)
    };
  }
}

function heartbeatContent() {
  return `export const autonomousExecutionHeartbeat = Object.freeze({\n  generatedAt: '${new Date().toISOString()}',\n  mode: 'safety-gated-autonomous-proof',\n  proofRequired: ['frontier-safety', 'node-check', 'work-memory', 'audit'],\n  rollback: 'restore previous file content from runner backup before promotion',\n  promotionState: 'proof-required-before-release'\n});\n`;
}

function getStatus() {
  return {
    success: true,
    truthState: fs.existsSync(patchFile) ? 'AUTONOMOUS_EXECUTION_HEARTBEAT_PRESENT' : 'AUTONOMOUS_EXECUTION_WAITING_FOR_HEARTBEAT',
    executeDefault: false,
    executeRequiresFlag: '--execute',
    patchTarget: path.relative(rootDir, patchFile),
    receiptDir: path.relative(rootDir, receiptDir),
    allowedProofCommands: allowedProofCommands.map(([cmd, cmdArgs]) => [cmd, ...cmdArgs].join(' ')),
    safety: {
      frontierGateRequired: true,
      rollbackRequired: true,
      receiptsRequired: true,
      arbitraryShellBlocked: true,
      arbitraryPatchTargetBlocked: true
    }
  };
}

function getContract() {
  return {
    name: 'PromptHouse Evo Safety-Gated Autonomous Execution Runner',
    purpose: 'Run a constrained autonomous proof cycle with safety decision, deterministic patch, allowlisted proof commands, rollback, receipt, and work-memory ingestion.',
    executeDefault: false,
    allowedPatchTarget: 'src/core/evo-llm/AutonomousExecutionHeartbeat.js',
    allowedProofCommands: allowedProofCommands.map(([cmd, cmdArgs]) => [cmd, ...cmdArgs].join(' ')),
    policy: {
      noArbitraryShell: true,
      noArbitraryPatchTarget: true,
      safetyGateBeforeExecution: true,
      rollbackBeforeFailureExit: true,
      receiptsAlwaysWritten: true,
      workMemoryAlwaysIngested: true,
      localExecutionRequired: true
    }
  };
}

async function runAutonomousCycle() {
  const cycleId = `evo_autonomous_${Date.now()}`;
  ensureDir(receiptDir);
  const before = fs.existsSync(patchFile) ? fs.readFileSync(patchFile, 'utf8') : null;
  const request = {
    summary: 'Safety-gated autonomous execution proof cycle for PromptHouse Evo Studio.',
    autonomous: true,
    highRisk: true,
    mode: execute ? 'execute' : 'plan',
    planOnly: !execute,
    workspaceScope: 'sandbox',
    approvalRef: process.env.PH_EVO_APPROVAL_REF || (execute ? null : 'plan-only-autonomous-proof'),
    budgetUsd: 0,
    tests: allowedProofCommands.map(([cmd, cmdArgs]) => [cmd, ...cmdArgs].join(' ')),
    rollbackPlan: 'Restore previous AutonomousExecutionHeartbeat.js content if any proof command fails.',
    receiptPlan: 'Write autonomous execution, frontier safety, and work-memory receipts.',
    humanReviewRequired: true
  };
  const safetyDecision = evaluateFrontierIntelligenceSafety({ rootDir, request });
  const safetyReceipt = writeFrontierSafetyReceipt({ rootDir, decision: safetyDecision, payload: request });
  const steps = [];
  let patched = false;
  let rolledBack = false;
  let promoted = false;

  if (!safetyDecision.allowed) {
    steps.push({ id: 'safety-gate', ok: false, blockedReasons: safetyDecision.blockedReasons });
  } else if (!execute) {
    steps.push({ id: 'plan-only', ok: true, detail: 'Use --execute with PH_EVO_APPROVAL_REF to write the heartbeat patch and run proof commands.' });
  } else {
    ensureDir(path.dirname(patchFile));
    fs.writeFileSync(patchFile, heartbeatContent(), 'utf8');
    patched = true;
    steps.push({ id: 'write-heartbeat-patch', ok: true, file: path.relative(rootDir, patchFile) });
    for (const [cmd, cmdArgs] of allowedProofCommands) {
      const result = runCommand(cmd, cmdArgs);
      steps.push({ id: `proof:${result.command}`, ...result });
      if (!result.ok) break;
    }
    const proofsPassed = steps.filter((step) => step.id?.startsWith('proof:')).every((step) => step.ok);
    if (!proofsPassed) {
      if (before === null) {
        if (fs.existsSync(patchFile)) fs.unlinkSync(patchFile);
      } else {
        fs.writeFileSync(patchFile, before, 'utf8');
      }
      rolledBack = true;
      steps.push({ id: 'rollback', ok: true, detail: 'Restored previous heartbeat state after failed proof.' });
    } else {
      promoted = true;
      steps.push({ id: 'promotion-ready', ok: true, detail: 'All allowlisted proof commands passed locally.' });
    }
  }

  const passed = safetyDecision.allowed && (!execute || promoted);
  const memory = ingestEvoWorkMemory({
    rootDir,
    item: {
      sourceType: 'verification-result',
      module: 'evo-autonomous-runner',
      intent: 'autonomous_execution_hardening',
      summary: `Autonomous runner cycle ${passed ? 'passed or planned safely' : 'blocked or rolled back'} with safety gate and proof receipts.`,
      payload: { cycleId, execute, passed, promoted, rolledBack, safetyDecision, steps },
      allowedForTraining: true,
      tags: ['autonomous-execution', 'safety-gate', 'proof-loop']
    }
  });
  let dataset = null;
  try {
    dataset = buildEvoWorkMemoryDataset({ rootDir });
  } catch (error) {
    dataset = { success: false, error: error.message };
  }
  const receipt = {
    id: cycleId,
    createdAt: new Date().toISOString(),
    truthState: passed ? (execute ? 'AUTONOMOUS_EXECUTION_PROOF_PASSED' : 'AUTONOMOUS_EXECUTION_PLAN_READY') : 'AUTONOMOUS_EXECUTION_BLOCKED_OR_ROLLED_BACK',
    execute,
    passed,
    promoted,
    patched,
    rolledBack,
    safetyDecision,
    safetyReceipt,
    steps,
    memory,
    dataset
  };
  const receiptFile = path.join(receiptDir, `${cycleId}.json`);
  writeJson(receiptFile, receipt);
  return { ...receipt, receiptFile: path.relative(rootDir, receiptFile) };
}

if (contractOnly) {
  console.log(JSON.stringify(getContract(), null, 2));
} else if (statusOnly) {
  console.log(JSON.stringify(getStatus(), null, 2));
} else {
  runAutonomousCycle().then((result) => {
    console.log(JSON.stringify(result, null, 2));
    if (!result.passed) process.exitCode = 1;
  }).catch((error) => {
    console.error(JSON.stringify({ success: false, truthState: 'AUTONOMOUS_EXECUTION_RUNNER_FAILED', error: error.message }, null, 2));
    process.exit(1);
  });
}
