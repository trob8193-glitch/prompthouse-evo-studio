import { execFile } from 'child_process';
import fs from 'fs';
import path from 'path';
import { routeTask } from '../router/ToolRouter.js';
import { checkExecutionSafety } from '../safety/SafetyGate.js';
import { writeMemory } from '../memory/MemoryGraph.js';
import { emitDaemonEvent } from '../daemons/DaemonBus.js';

function execCommand(command, args = [], options = {}) {
  return new Promise((resolve) => {
    const startedAt = Date.now();
    execFile(command, args, { timeout: options.timeout || 15000, cwd: options.cwd || process.cwd() }, (error, stdout, stderr) => {
      resolve({
        success: !error,
        command,
        args,
        stdout: String(stdout || '').slice(0, 20000),
        stderr: String(stderr || '').slice(0, 20000),
        error: error ? error.message : null,
        durationMs: Date.now() - startedAt
      });
    });
  });
}

function receiptPath(rootDir) {
  const dir = path.join(rootDir, '.evo-layer', 'execution-results');
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function writeResult(rootDir, result) {
  const dir = receiptPath(rootDir);
  const file = path.join(dir, `${result.id}.json`);
  fs.writeFileSync(file, JSON.stringify(result, null, 2));
  return file;
}

function credentialGate({ selectedAdapter, env = process.env, approved = false }) {
  const gates = {
    openai: {
      ok: Boolean(env.OPENAI_API_KEY),
      reason: 'OPENAI_API_KEY is required for OpenAI adapter execution.',
    },
    vercel: {
      ok: Boolean(env.VERCEL_TOKEN) && approved,
      reason: 'VERCEL_TOKEN and high-risk approval are required for Vercel deployment execution.',
    },
    stripe: {
      ok: Boolean(env.STRIPE_SECRET_KEY) && approved,
      reason: 'STRIPE_SECRET_KEY and commerce approval are required for Stripe execution.',
    },
    github: {
      ok: Boolean(env.GITHUB_TOKEN) || approved,
      reason: 'GITHUB_TOKEN or explicit connector approval is required for GitHub write execution.',
    },
  };
  return gates[selectedAdapter] || { ok: true, reason: null };
}

function approvedBy(approval = null, allowHighRisk = false) {
  return Boolean(
    allowHighRisk === true ||
    approval?.approved === true ||
    approval?.scope === 'execution' ||
    approval?.scope === 'high-risk-execution' ||
    approval?.scope === 'deployment' ||
    approval?.scope === 'commerce'
  );
}

export async function executeAdapterTask({ rootDir = process.cwd(), task, adapter = null, payload = {}, approval = null, allowHighRisk = false } = {}) {
  if (!task) throw new Error('executeAdapterTask requires task.');

  const safety = checkExecutionSafety({ rootDir, task, approval, allowHighRisk });
  if (!safety.allowed) {
    return {
      id: `exec_blocked_${Date.now()}`,
      success: false,
      status: 'BLOCKED',
      task,
      adapter: adapter || null,
      reason: safety.reason,
      risk: safety.risk,
      category: safety.category,
      approvalRequired: safety.approvalRequired,
      createdAt: new Date().toISOString()
    };
  }

  const selectedAdapter = adapter || routeTask({ rootDir, task });
  const approved = approvedBy(approval, allowHighRisk);
  const gate = credentialGate({ selectedAdapter, approved });
  let adapterResult;

  if (!gate.ok) {
    adapterResult = {
      success: false,
      stdout: '',
      stderr: gate.reason,
      durationMs: 0,
      truthState: 'ADAPTER_CREDENTIAL_OR_APPROVAL_GATE_BLOCKED'
    };
  } else if (selectedAdapter === 'ollama') {
    adapterResult = await execCommand('ollama', ['list'], { cwd: rootDir });
  } else if (selectedAdapter === 'git') {
    adapterResult = await execCommand('git', ['status', '--short'], { cwd: rootDir });
  } else if (selectedAdapter === 'filesystem') {
    adapterResult = { success: true, stdout: JSON.stringify({ rootDir, task, payload }, null, 2), stderr: '', durationMs: 0, truthState: 'FILESYSTEM_RECEIPT_ONLY' };
  } else if (selectedAdapter === 'openai') {
    adapterResult = { success: true, stdout: JSON.stringify({ task, payload, provider: 'openai', mode: 'credential_ready_no_direct_model_call' }, null, 2), stderr: '', durationMs: 0, truthState: 'OPENAI_ADAPTER_CREDENTIAL_READY' };
  } else if (selectedAdapter === 'vercel') {
    adapterResult = { success: true, stdout: 'Vercel credential and approval gate passed. Deployment execution must be handled by the deployment adapter workflow.', stderr: '', durationMs: 0, truthState: 'VERCEL_ADAPTER_GATE_READY' };
  } else if (selectedAdapter === 'stripe') {
    adapterResult = { success: true, stdout: 'Stripe credential and approval gate passed. Commerce execution must be handled by the commerce adapter workflow.', stderr: '', durationMs: 0, truthState: 'STRIPE_ADAPTER_GATE_READY' };
  } else if (selectedAdapter === 'github') {
    adapterResult = { success: true, stdout: 'GitHub credential or connector approval gate passed. GitHub writes must be performed by connector-backed operations.', stderr: '', durationMs: 0, truthState: 'GITHUB_ADAPTER_GATE_READY' };
  } else if (['vscode', 'cursor', 'antigravity', 'mcp', 'external_connector', 'browser'].includes(selectedAdapter)) {
    adapterResult = {
      success: true,
      stdout: JSON.stringify({ selectedAdapter, task, payload, mode: 'routed_receipt_pending_runtime_bridge' }, null, 2),
      stderr: '',
      durationMs: 0,
      truthState: 'ADAPTER_ROUTED_RUNTIME_BRIDGE_REQUIRED'
    };
  } else {
    adapterResult = { success: false, stdout: '', stderr: `Adapter ${selectedAdapter} has no live executor yet.`, durationMs: 0, truthState: 'ADAPTER_EXECUTOR_MISSING' };
  }

  const result = {
    id: `exec_${Date.now()}`,
    success: adapterResult.success,
    status: adapterResult.success ? 'SUCCESS' : 'FAILED',
    task,
    adapter: selectedAdapter,
    safety,
    credentialGate: gate,
    adapterResult,
    createdAt: new Date().toISOString()
  };

  result.file = writeResult(rootDir, result);
  writeMemory({ rootDir, type: 'execution_result', data: result });
  emitDaemonEvent({ rootDir, daemonId: 'execution-kernel', event: 'adapter_task_executed', payload: result });

  return result;
}
