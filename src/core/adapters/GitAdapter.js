import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

export class GitAdapter {
  /**
   * Executes a list of checks, and if they all pass, commits and pushes changes.
   */
  static async commitAndPushApprovedChanges({ repoId, branch, commitMessage, checks = [], approvalRef }) {
    // 1. Validate the approvalRef matches the server's expected token
    // For Dynamic Approval, we accept OAuth injected tokens, or explicit tokens.
    // If not present, we return needs_approval.
    const expectedToken = process.env.TRIBRAIN_APPROVAL_TOKEN || 'studio-admin-approved-123';
    if (approvalRef !== expectedToken && approvalRef !== 'oauth_verified_session') {
      return {
        truthLabel: 'BLOCKED',
        status: 'needs_approval',
        branch,
        reason: "Git Adapter rejected: Invalid or missing owner approval binding."
      };
    }

    const results = [];
    let checksPassed = true;

    // 2. Run sequential checks
    for (const cmd of checks) {
      try {
        const { stdout, stderr } = await execAsync(cmd, { cwd: process.cwd() });
        results.push({
          command: cmd,
          exitCode: 0,
          status: 'passed',
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          startedAt: new Date().toISOString(),
          finishedAt: new Date().toISOString()
        });
      } catch (err) {
        checksPassed = false;
        results.push({
          command: cmd,
          exitCode: err.code || 1,
          status: 'failed',
          stdout: err.stdout?.trim() || '',
          stderr: err.stderr?.trim() || err.message,
          startedAt: new Date().toISOString(),
          finishedAt: new Date().toISOString()
        });
        break; // Stop running further checks if one fails
      }
    }

    if (!checksPassed) {
      return {
        truthLabel: 'FAILED',
        pushed: false,
        branch,
        changedFiles: [],
        checks: results
      };
    }

    // 3. Get changed files
    let changedFiles = [];
    try {
      const { stdout } = await execAsync('git status --short');
      changedFiles = stdout.split('\n').map(l => l.trim()).filter(Boolean);
    } catch (e) {
      // Ignore
    }

    if (changedFiles.length === 0) {
      return {
        truthLabel: 'VERIFIED',
        pushed: false,
        branch,
        changedFiles: [],
        checks: results,
        error: "No changes to commit."
      };
    }

    // 4. Commit and Push
    let commitHash = null;
    let remote = 'origin';

    try {
      await execAsync('git add .');
      await execAsync(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`);
      
      const hashOutput = await execAsync('git rev-parse HEAD');
      commitHash = hashOutput.stdout.trim();

      await execAsync(`git push origin ${branch}`);
      
      return {
        truthLabel: 'VERIFIED',
        pushed: true,
        branch,
        commitHash,
        remote,
        changedFiles,
        checks: results
      };
    } catch (err) {
      return {
        truthLabel: 'FAILED',
        pushed: false,
        branch,
        commitHash,
        remote,
        changedFiles,
        checks: results,
        error: err.message
      };
    }
  }
}
