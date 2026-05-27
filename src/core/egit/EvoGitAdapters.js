import { execFileSync } from 'child_process';
import { registerToolCheck } from './EvoGitRegistry.js';

function commandCheck(command, args = ['--version']) {
  try {
    const output = execFileSync(command, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 5000 }).trim();
    return { ok: true, output };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

function registerCommand(rootDir, toolId, kind, command, capabilities) {
  const result = commandCheck(command);
  return registerToolCheck({
    rootDir,
    toolId,
    kind,
    available: result.ok,
    capabilities: result.ok ? capabilities : [],
    reason: result.ok ? null : result.error,
    metadata: { version: result.output || null }
  });
}

export function checkLocalToolAdapters({ rootDir = process.cwd() } = {}) {
  return [
    registerCommand(rootDir, 'git', 'source_control', 'git', ['branch_state', 'commit_state', 'diff', 'worktree']),
    registerCommand(rootDir, 'node', 'runtime', 'node', ['script_execution', 'syntax_check']),
    registerCommand(rootDir, 'npm', 'package_runner', 'npm', ['test', 'build', 'script_orchestration']),
    registerCommand(rootDir, 'ollama', 'local_llm', 'ollama', ['local_model_list', 'local_generation_adapter']),
  ];
}
