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

export async function executeAdapterTask({ rootDir = process.cwd(), task, adapter = null, payload = {} } = {}) {
  if (!task) throw new Error('executeAdapterTask requires task.');

  const safety = checkExecutionSafety({ rootDir, task });
  if (!safety.allowed) {
    return {
      id: `exec_blocked_${Date.now()}`,
      success: false,
      status: 'BLOCKED',
      task,
      adapter: adapter || null,
      reason: safety.reason,
      createdAt: new Date().toISOString()
    };
  }

  const selectedAdapter = adapter || routeTask({ rootDir, task });
  let adapterResult;

  if (selectedAdapter === 'ollama') {
    adapterResult = await execCommand('ollama', ['list'], { cwd: rootDir });
  } else if (selectedAdapter === 'git') {
    adapterResult = await execCommand('git', ['status', '--short'], { cwd: rootDir });
  } else if (selectedAdapter === 'filesystem') {
    adapterResult = { success: true, stdout: JSON.stringify({ rootDir, task, payload }, null, 2), stderr: '', durationMs: 0 };
  } else if (selectedAdapter === 'vercel') {
    adapterResult = { success: false, stdout: '', stderr: 'Vercel execution requires explicit deployment adapter credentials and approval.', durationMs: 0 };
  } else if (selectedAdapter === 'stripe') {
    adapterResult = { success: false, stdout: '', stderr: 'Stripe execution requires explicit commerce adapter credentials and approval.', durationMs: 0 };
  } else {
    adapterResult = { success: false, stdout: '', stderr: `Adapter ${selectedAdapter} has no live executor yet.`, durationMs: 0 };
  }

  const result = {
    id: `exec_${Date.now()}`,
    success: adapterResult.success,
    status: adapterResult.success ? 'SUCCESS' : 'FAILED',
    task,
    adapter: selectedAdapter,
    adapterResult,
    createdAt: new Date().toISOString()
  };

  result.file = writeResult(rootDir, result);
  writeMemory({ rootDir, type: 'execution_result', data: result });
  emitDaemonEvent({ rootDir, daemonId: 'execution-kernel', event: 'adapter_task_executed', payload: result });

  return result;
}
