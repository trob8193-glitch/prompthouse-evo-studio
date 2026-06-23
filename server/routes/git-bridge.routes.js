import { exec } from 'child_process';
import util from 'util';
import path from 'path';

const execPromise = util.promisify(exec);

/**
 * Autonomous Git Bridge — Sovereign Version Control
 * Provides commit, revert, and merge-test capabilities
 * to allow the studio to manage its own codebase history.
 */
export function registerGitBridgeRoutes(app) {
  const ROOT = process.cwd();

  // POST /api/git/commit — Commit current working tree
  app.post('/api/git/commit', async (req, res) => {
    const { message, files = ['.'] } = req.body || {};

    if (!message) {
      return res.status(400).json({
        success: false,
        truthState: 'GIT_COMMIT_INPUT_REQUIRED',
        error: 'A commit message is required.'
      });
    }

    try {
      // Stage files
      const stageTarget = files.join(' ');
      await execPromise(`git add ${stageTarget}`, { cwd: ROOT });

      // Check if there are staged changes
      const { stdout: diffCheck } = await execPromise('git diff --cached --stat', { cwd: ROOT });
      if (!diffCheck.trim()) {
        return res.json({
          success: true,
          truthState: 'GIT_NOTHING_TO_COMMIT',
          message: 'Working tree is clean. No changes to commit.'
        });
      }

      // Commit
      const { stdout } = await execPromise(`git commit -m "${message.replace(/"/g, '\\"')}"`, { cwd: ROOT });

      // Get the new commit hash
      const { stdout: hash } = await execPromise('git rev-parse --short HEAD', { cwd: ROOT });

      res.json({
        success: true,
        truthState: 'GIT_COMMIT_SUCCESS',
        commitHash: hash.trim(),
        commitMessage: message,
        output: stdout.trim(),
        committedAt: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        truthState: 'GIT_COMMIT_FAILED',
        error: error.message || error.stderr || 'Commit operation failed.'
      });
    }
  });

  // POST /api/git/revert — Revert the last N commits
  app.post('/api/git/revert', async (req, res) => {
    const { count = 1, hard = false } = req.body || {};
    const safeCount = Math.min(Math.max(1, Number(count) || 1), 5);

    try {
      // Get current HEAD before revert for audit trail
      const { stdout: beforeHash } = await execPromise('git rev-parse --short HEAD', { cwd: ROOT });

      const resetType = hard ? '--hard' : '--soft';
      const { stdout } = await execPromise(`git reset ${resetType} HEAD~${safeCount}`, { cwd: ROOT });

      const { stdout: afterHash } = await execPromise('git rev-parse --short HEAD', { cwd: ROOT });

      res.json({
        success: true,
        truthState: 'GIT_REVERT_SUCCESS',
        revertedCommits: safeCount,
        resetType: hard ? 'hard' : 'soft',
        beforeHash: beforeHash.trim(),
        afterHash: afterHash.trim(),
        output: stdout.trim(),
        revertedAt: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        truthState: 'GIT_REVERT_FAILED',
        error: error.message || error.stderr || 'Revert operation failed.'
      });
    }
  });

  // POST /merge/test-case — Dry-run merge test against a branch
  app.post('/merge/test-case', async (req, res) => {
    const { branch = 'main' } = req.body || {};

    try {
      // Get current branch name
      const { stdout: currentBranch } = await execPromise('git branch --show-current', { cwd: ROOT });

      // Check if target branch exists
      try {
        await execPromise(`git rev-parse --verify ${branch}`, { cwd: ROOT });
      } catch {
        return res.status(400).json({
          success: false,
          truthState: 'GIT_MERGE_BRANCH_NOT_FOUND',
          error: `Branch "${branch}" does not exist.`
        });
      }

      // Dry-run merge (no commit, no fast-forward) to test for conflicts
      let conflicts = false;
      let conflictFiles = [];
      try {
        await execPromise(`git merge --no-commit --no-ff ${branch}`, { cwd: ROOT });
        // If we get here, merge succeeded — abort the uncommitted merge
        await execPromise('git merge --abort', { cwd: ROOT });
      } catch (mergeErr) {
        conflicts = true;
        // Capture conflicting files
        try {
          const { stdout: conflictList } = await execPromise('git diff --name-only --diff-filter=U', { cwd: ROOT });
          conflictFiles = conflictList.trim().split('\n').filter(Boolean);
        } catch { /* ignore */ }
        // Abort the failed merge
        try { await execPromise('git merge --abort', { cwd: ROOT }); } catch { /* ignore */ }
      }

      res.json({
        success: true,
        truthState: conflicts ? 'GIT_MERGE_CONFLICTS_DETECTED' : 'GIT_MERGE_CLEAN',
        currentBranch: currentBranch.trim(),
        targetBranch: branch,
        conflicts,
        conflictFiles,
        testedAt: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        truthState: 'GIT_MERGE_TEST_FAILED',
        error: error.message || 'Merge test operation failed.'
      });
    }
  });
}
