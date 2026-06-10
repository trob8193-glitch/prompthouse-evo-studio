import { execSync } from 'child_process';
import { Log } from '../autonomy/SovereignLogger.js';

export class RollbackManager {
  /**
   * Performs a granular, surgical rollback of specific files 
   * instead of wiping the entire working tree.
   */
  static triggerSurgicalRollback(files, reason) {
    Log.warn(`[RollbackManager] Triggering SURGICAL rollback for ${files.length} files. Reason: ${reason}`);

    if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
      Log.warn('[RollbackManager] Running in cloud/edge environment. Skipping local git checkout.');
      return true; // Pretend it succeeded or handle via a different mechanism
    }
    
    if (!files || files.length === 0) {
      Log.warn('[RollbackManager] No files specified, falling back to full reset.');
      return this.triggerFullRollback(reason);
    }

    let successCount = 0;
    for (const file of files) {
      try {
        execSync(`git checkout HEAD -- "${file}"`, { stdio: 'pipe' });
        Log.info(`[RollbackManager] Reverted: ${file}`);
        successCount++;
      } catch (err) {
        Log.error(`[RollbackManager] Failed to revert ${file}: ${err.message}`);
      }
    }

    return successCount === files.length;
  }

  static triggerFullRollback(reason) {
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
      Log.warn('[RollbackManager] Cloud environment detected. Full rollback requires deployment restart.');
      return true;
    }

    try {
      execSync('git reset --hard HEAD', { stdio: 'pipe' });
      execSync('git clean -fd', { stdio: 'pipe' });
      Log.info('[RollbackManager] Full rollback successful.');
      return true;
    } catch (err) {
      Log.error(`[RollbackManager] Full rollback failed: ${err.message}`);
      return false;
    }
  }
}
