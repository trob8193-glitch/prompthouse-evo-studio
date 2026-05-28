import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const APPROVED_COMMANDS = [
  'node --check promptbridge-server.js',
  'node --version',
  'npm --version',
  'npm test',
  'npm run build',
  'npm run audit:imports',
  'npm run audit:css',
  'npm run verify:studio',
  'npm run maturity:check',
  'npm run lint',
  'npm run typecheck',
  'npm run test:unit',
  'npm run test:e2e',
  'npm run test:integration',
  'git status --short',
  'git rev-parse HEAD',
  'git branch --show-current'
];

const BLOCKED_PATTERNS = [
  /sudo\s/,
  /curl.*\|.*bash/,
  /rm\s+-rf/,
  /cat\s+.*\.env/,
  /echo\s+.*>/
];

export class TriBrainExecutor {
  static async executeVerification(command, permissionContext) {
    // 1. Enforce read-only verification commands
    if (!APPROVED_COMMANDS.includes(command.trim())) {
      // If it's not in the allowlist, it requires explicit approval.
      // But for this capability, the prompt specifies:
      // "Allow read-only verification commands only without extra approval.
      //  Require approval for install, commit, push, deploy, migration, delete..."
      
      const hasApproval = Array.isArray(permissionContext.approvals) && permissionContext.approvals.some(a => a.command === command || a.status === 'approved');
      if (!hasApproval) {
        // Dynamic Approval Flow: Instead of throwing, return needs_approval so the Gateway can queue it
        return {
          truthLabel: 'BLOCKED',
          status: 'needs_approval',
          command,
          reason: `Command blocked. '${command}' is not in the read-only allowlist and lacks explicit user approval in the payload.`
        };
      }
    }

    // 2. Block destructive commands globally
    for (const pattern of BLOCKED_PATTERNS) {
      if (pattern.test(command)) {
        throw new Error(`Command blocked. Matched destructive pattern: ${pattern}`);
      }
    }

    // 3. Execution
    const start = Date.now();
    let stdout = '';
    let stderr = '';
    let exitCode = 0;

    try {
      const { stdout: out, stderr: err } = await execAsync(command, {
        cwd: process.cwd(), // Run in repo root
        timeout: 30000 // 30 second timeout for safety
      });
      stdout = out;
      stderr = err;
    } catch (error) {
      stdout = error.stdout || '';
      stderr = error.stderr || error.message;
      exitCode = error.code || 1;
    }

    const durationMs = Date.now() - start;

    // 4. Capture Git Metadata
    let branch = 'unknown';
    let commit = 'unknown';
    try {
      const { stdout: b } = await execAsync('git branch --show-current');
      branch = b.trim();
      const { stdout: c } = await execAsync('git rev-parse HEAD');
      commit = c.trim();
    } catch (e) {
      // Ignore git errors if not in a repo
    }

    // 5. Generate Proof Ledger Receipt
    return {
      receiptId: `proof_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      command,
      timestamp: new Date().toISOString(),
      runner: permissionContext.role || 'system',
      userId: permissionContext.userId || 'anonymous',
      tenantId: permissionContext.tenantId || 'tenant_default',
      execution: {
        durationMs,
        exitCode,
        stdout: stdout.trim(),
        stderr: stderr.trim()
      },
      repoContext: {
        branch,
        commitHash: commit,
        pwd: process.cwd()
      },
      verificationStatus: exitCode === 0 ? 'PASSED' : 'FAILED'
    };
  }
}
