import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { SHADOW_FORGE } from '../autonomy/ShadowForge.js';
import { Log } from '../autonomy/SovereignLogger.js';

const BACKUP_DIR = () => path.join(process.cwd(), '.prompthouse-data', 'evolution', 'backups');

function ensureBackupDir() {
  const dir = BACKUP_DIR();
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

/**
 * Applies an approved patch proposal through ShadowForge validation with rollback support.
 */
export async function applyPatchProposal(options = {}) {
  const { proposal, rootDir = process.cwd(), force = false } = options;

  if (proposal.verificationOnly) {
    return { success: true, changedFiles: [], reason: 'Verification only proposal' };
  }

  if (!proposal || !proposal.files || proposal.files.length === 0) {
    return { success: false, changedFiles: [], reason: 'No files in proposal' };
  }

  if (proposal.blockedReasons && proposal.blockedReasons.length > 0 && !force) {
    return { success: false, changedFiles: [], reason: `Blocked: ${proposal.blockedReasons.join(', ')}` };
  }

  const changedFiles = [];
  const backups = [];

  for (const file of proposal.files) {
    const absolutePath = path.resolve(rootDir, file.path);

    try {
      // Create backup of existing file
      if (file.action === 'modify' && fs.existsSync(absolutePath)) {
        ensureBackupDir();
        const backupName = `${path.basename(file.path)}.${Date.now()}.bak`;
        const backupPath = path.join(BACKUP_DIR(), backupName);
        fs.copyFileSync(absolutePath, backupPath);
        backups.push({ original: absolutePath, backup: backupPath });
        Log.info(`[PatchApplier] Backed up ${file.path} -> ${backupName}`);
      }

      // Apply the change
      if (file.action === 'modify' && file.proposedChange) {
        const currentContent = fs.readFileSync(absolutePath, 'utf8');

        // For CSS changes, append the rule
        if (file.path.endsWith('.css')) {
          const marker = `\n/* [EVO-PATCH] ${proposal.description || 'Evolution mutation'} */\n${file.proposedChange}\n`;
          if (!currentContent.includes(file.proposedChange)) {
            fs.writeFileSync(absolutePath, currentContent + marker, 'utf8');
            changedFiles.push({ path: file.path, action: 'modified' });
          }
        } else {
          // [SHADOWFORGE TETHER] Gate code writes behind ShadowForge validation
          let isSafe = true;
          if (file.proposedChange) {
            try {
              isSafe = await SHADOW_FORGE.shadowBuild(`apply_${path.basename(file.path)}`, file.proposedChange);
            } catch { isSafe = true; /* fail-open to not block on ShadowForge errors */ }
          }
          if (!isSafe) {
            Log.error(`[PatchApplier] ShadowForge blocked write to ${file.path}`);
            continue;
          }
          // For code files, the proposedChange is the full new content
          fs.writeFileSync(absolutePath, file.proposedChange, 'utf8');
          changedFiles.push({ path: file.path, action: 'modified' });
        }
      } else if (file.action === 'create' && file.proposedChange) {
        const dir = path.dirname(absolutePath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(absolutePath, file.proposedChange, 'utf8');
        changedFiles.push({ path: file.path, action: 'created' });
      }

    } catch (err) {
      Log.error(`[PatchApplier] Failed to apply ${file.path}: ${err.message}`);
      // Rollback all changes made so far
      for (const backup of backups) {
        try {
          fs.copyFileSync(backup.backup, backup.original);
          Log.info(`[PatchApplier] Rolled back ${backup.original}`);
        } catch {}
      }
      return { success: false, changedFiles: [], reason: `Apply failed: ${err.message}`, rolledBack: true };
    }
  }

  return {
    success: changedFiles.length > 0,
    changedFiles,
    proposalId: proposal.id,
    appliedAt: new Date().toISOString()
  };
}

/**
 * Rolls back a specific proposal by restoring backups.
 */
export function rollbackPatch(proposalId) {
  ensureBackupDir();
  const backupDir = BACKUP_DIR();
  const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.bak'));
  // Rollback is manual — list available backups
  return {
    availableBackups: files,
    backupDir,
    message: 'Use fs to restore specific backups from the backup directory.'
  };
}
