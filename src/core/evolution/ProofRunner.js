import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

export function runCommandWithTimeout({ cwd, command, timeoutMs = 120000 } = {}) {
  return new Promise((resolve) => {
    const started = Date.now();
    const child = spawn(command, { cwd, shell: true, env: process.env });
    let stdout = '';
    let stderr = '';
    const timer = setTimeout(() => {
      child.kill('SIGTERM');
      stderr += `\nCommand timed out after ${timeoutMs}ms.`;
    }, timeoutMs);
    child.stdout.on('data', chunk => { stdout += chunk.toString(); });
    child.stderr.on('data', chunk => { stderr += chunk.toString(); });
    child.on('close', code => {
      clearTimeout(timer);
      resolve({ command, exitCode: code ?? 1, durationMs: Date.now() - started, stdout, stderr });
    });
    child.on('error', error => {
      clearTimeout(timer);
      resolve({ command, exitCode: 1, durationMs: Date.now() - started, stdout, stderr: stderr || error.message });
    });
  });
}

export async function runProofCommands({ workspaceDir, commands = [], receiptDir, timeoutMs = 180000 } = {}) {
  if (!workspaceDir) throw new Error('workspaceDir is required.');
  if (!receiptDir) throw new Error('receiptDir is required.');
  fs.mkdirSync(receiptDir, { recursive: true });
  const results = [];
  for (const command of commands) {
    const result = await runCommandWithTimeout({ cwd: workspaceDir, command, timeoutMs });
    const safeName = command.replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '').slice(0, 80) || 'command';
    const stdoutPath = path.join(receiptDir, `${safeName}.stdout.log`);
    const stderrPath = path.join(receiptDir, `${safeName}.stderr.log`);
    fs.writeFileSync(stdoutPath, result.stdout || '', 'utf8');
    fs.writeFileSync(stderrPath, result.stderr || '', 'utf8');
    results.push({
      command,
      exitCode: result.exitCode,
      durationMs: result.durationMs,
      stdoutPath,
      stderrPath,
    });
    if (result.exitCode !== 0) break;
  }
  return summarizeProofResults(results);
}

export function summarizeProofResults(commands = []) {
  const passed = commands.length > 0 && commands.every(item => item.exitCode === 0);
  return {
    passed,
    commandCount: commands.length,
    failedCommand: commands.find(item => item.exitCode !== 0)?.command || null,
    commands,
  };
}
