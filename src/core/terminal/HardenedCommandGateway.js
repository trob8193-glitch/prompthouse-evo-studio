import { spawn } from 'child_process';
import path from 'path';
import { writeCapabilityReceipt } from '../capabilities/EvoCapabilityContract.js';

const DEFAULT_TIMEOUT_MS = 120000;
const MAX_OUTPUT_CHARS = 120000;

export const COMMAND_ALLOWLIST = Object.freeze({
  'git status --short': { id: 'git_status_short', cwdRequired: false, risk: 'low' },
  'git branch --show-current': { id: 'git_branch_current', cwdRequired: false, risk: 'low' },
  'git diff --stat': { id: 'git_diff_stat', cwdRequired: false, risk: 'low' },
  'node -v': { id: 'node_version', cwdRequired: false, risk: 'low' },
  'npm -v': { id: 'npm_version', cwdRequired: false, risk: 'low' },
  'npm test': { id: 'npm_test', cwdRequired: false, risk: 'medium' },
  'npm run build': { id: 'npm_build', cwdRequired: false, risk: 'medium' },
  'npm run verify:studio': { id: 'verify_studio', cwdRequired: false, risk: 'medium' },
  'npm run platform:audit': { id: 'platform_audit', cwdRequired: false, risk: 'medium' },
  'npm run platform:status': { id: 'platform_status', cwdRequired: false, risk: 'medium' },
  'npm run layer:status': { id: 'evo_layer_status', cwdRequired: false, risk: 'medium' },
  'npm run layer:x10': { id: 'evo_layer_x10', cwdRequired: false, risk: 'medium' },
});

function normalizeCommand(input = '') {
  return String(input).replace(/\s+/g, ' ').trim();
}

function splitCommand(command) {
  const parts = command.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];
  return parts.map(part => part.replace(/^['"]|['"]$/g, ''));
}

function resolveWorkspaceCwd(rootDir, requestedCwd) {
  const root = path.resolve(rootDir || process.cwd());
  const cwd = requestedCwd ? path.resolve(root, requestedCwd) : root;
  if (!cwd.startsWith(root)) {
    throw new Error(`CWD denied outside workspace: ${cwd}`);
  }
  return cwd;
}

function trimOutput(value = '') {
  const text = String(value);
  if (text.length <= MAX_OUTPUT_CHARS) return text;
  return `${text.slice(0, MAX_OUTPUT_CHARS)}\n[output truncated at ${MAX_OUTPUT_CHARS} chars]`;
}

export class HardenedCommandGateway {
  constructor({ rootDir = process.cwd(), timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
    this.rootDir = path.resolve(rootDir);
    this.timeoutMs = timeoutMs;
  }

  listAllowedCommands() {
    return Object.entries(COMMAND_ALLOWLIST).map(([command, spec]) => ({ command, ...spec }));
  }

  async run(commandInput, { cwd = '.', approvalToken = null } = {}) {
    const command = normalizeCommand(commandInput);
    const spec = COMMAND_ALLOWLIST[command];

    if (!spec) {
      const receipt = writeCapabilityReceipt({
        rootDir: this.rootDir,
        capabilityId: 'hardened_command_gateway',
        action: 'command_rejected',
        truthState: 'REJECTED',
        details: { command, reason: 'Command is not allowlisted.' },
        claims: ['command_rejected'],
      });
      return { success: false, error: 'Command is not allowlisted.', receipt };
    }

    if (spec.risk !== 'low' && !approvalToken) {
      const receipt = writeCapabilityReceipt({
        rootDir: this.rootDir,
        capabilityId: 'hardened_command_gateway',
        action: 'approval_required',
        truthState: 'BLOCKED',
        details: { command, risk: spec.risk },
        claims: ['approval_required'],
      });
      return { success: false, error: 'Approval token required for this command.', receipt };
    }

    const targetCwd = resolveWorkspaceCwd(this.rootDir, cwd);
    const [bin, ...args] = splitCommand(command);

    return new Promise((resolve) => {
      const startedAt = Date.now();
      let stdout = '';
      let stderr = '';
      const child = spawn(bin, args, { cwd: targetCwd, shell: false, windowsHide: true });
      const timer = setTimeout(() => {
        child.kill('SIGTERM');
      }, this.timeoutMs);

      child.stdout.on('data', chunk => { stdout += chunk.toString(); });
      child.stderr.on('data', chunk => { stderr += chunk.toString(); });
      child.on('error', error => {
        clearTimeout(timer);
        const receipt = writeCapabilityReceipt({
          rootDir: this.rootDir,
          capabilityId: 'hardened_command_gateway',
          action: 'command_error',
          truthState: 'ERROR_RECORDED',
          details: { command, error: error.message },
          claims: ['command_error_recorded'],
        });
        resolve({ success: false, error: error.message, stdout: trimOutput(stdout), stderr: trimOutput(stderr), receipt });
      });
      child.on('close', code => {
        clearTimeout(timer);
        const durationMs = Date.now() - startedAt;
        const success = code === 0;
        const receipt = writeCapabilityReceipt({
          rootDir: this.rootDir,
          capabilityId: 'hardened_command_gateway',
          action: 'command_executed',
          truthState: success ? 'EXECUTED' : 'FAILED',
          details: { command, code, cwd: targetCwd, durationMs },
          claims: ['command_receipt_recorded'],
        });
        resolve({ success, code, stdout: trimOutput(stdout), stderr: trimOutput(stderr), durationMs, receipt });
      });
    });
  }
}
