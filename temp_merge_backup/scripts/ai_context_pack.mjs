import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';
import * as guardrails from './ai_guardrails.mjs';

/**
 * AI CONTEXT PACKER (V1 PRODUCTION - REPAIRED)
 * ═══════════════════════════════════════════════════════════════
 * Packages project context for OpenAI review while enforcing
 * strict safety guardrails and secret redaction.
 */

async function pack() {
  const root = guardrails.getProjectRoot();
  const configPath = path.join(root, '.ai/config/bridge.config.json');
  
  if (!fs.existsSync(configPath)) {
    console.error('❌ Configuration missing at .ai/config/bridge.config.json');
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const timestamp = new Date().toISOString();
  
  console.log('🚀 [AI_Pack] Initializing context scan...');

  const payload = {
    meta: {
      timestamp,
      projectName: path.basename(root),
      nodeVersion: process.version,
      platform: process.platform,
      maxFileBytes: config.maxFileBytes,
      maxTotalBytes: config.maxTotalBytes
    },
    git: { available: false },
    tree: [],
    files: [],
    inbox: {
      currentTask: '',
      terminalErrors: '',
      antigravityReport: ''
    },
    limits: {
      truncatedFiles: [],
      skippedFiles: [],
      totalBytesIncluded: 0
    }
  };

  // Git Info
  try {
    payload.git.available = true;
    payload.git.branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    payload.git.statusShort = execSync('git status --short', { encoding: 'utf8' }).trim();
    payload.git.diffStat = execSync('git diff --stat', { encoding: 'utf8' }).trim();
    payload.git.safeDiff = execSync('git diff', { encoding: 'utf8' }).slice(0, 50000);
  } catch (err) {
    payload.git.available = false;
  }

  // Inbox Collection
  const inboxFiles = {
    currentTask: '.ai/inbox/current-task.md',
    terminalErrors: '.ai/inbox/terminal-errors.md',
    antigravityReport: '.ai/inbox/antigravity-report.md'
  };

  for (const [key, relPath] of Object.entries(inboxFiles)) {
    const full = path.join(root, relPath);
    if (fs.existsSync(full)) {
      try {
        const content = await guardrails.safeReadTextFile(full);
        payload.inbox[key] = guardrails.redactSensitiveText(content);
      } catch (err) {
        payload.inbox[key] = `[ERROR: Could not read inbox file: ${err.message}]`;
      }
    }
  }

  // File Collection
  const { files: fileList, skippedFiles: initialSkipped } = await guardrails.listFilesSafe(root, config.scanRoots, config);
  let redactedCount = 0;
  let runningTotalBytes = 0;

  for (const fileEntry of fileList) {
    const { path: relative, fullPath, sizeBytes } = fileEntry;

    try {
      const content = await guardrails.safeReadTextFile(fullPath, config.maxFileBytes);
      const redacted = guardrails.redactSensitiveText(content);
      if (redacted !== content) redactedCount++;

      const byteSize = Buffer.byteLength(redacted, 'utf8');
      
      if (runningTotalBytes + byteSize > config.maxTotalBytes) {
        payload.limits.truncatedFiles.push(`${relative} (Total Budget Exceeded)`);
        continue;
      }

      payload.files.push({
        path: relative,
        sizeBytes: byteSize,
        content: redacted
      });

      payload.tree.push(relative);
      runningTotalBytes += byteSize;
    } catch (err) {
      payload.limits.truncatedFiles.push(`${relative} (Read Error: ${err.message})`);
    }
  }

  payload.limits.skippedFiles = initialSkipped.map(s => `${s.path} (${s.reason})`);
  payload.limits.totalBytesIncluded = runningTotalBytes;

  // Write Snapshot
  await guardrails.writeTextFileSafe(root, config.outputSnapshotPath, JSON.stringify(payload, null, 2));
  
  // Write Summary
  const summary = `
# AI Context Summary
- **Timestamp**: ${timestamp}
- **Files Included**: ${payload.files.length}
- **Files Skipped**: ${payload.limits.skippedFiles.length}
- **Total Payload Size**: ${(runningTotalBytes / 1024).toFixed(2)} KB
- **Secrets Redacted**: ${redactedCount > 0 ? 'YES' : 'NONE DETECTED'}
- **Git Branch**: ${payload.git.branch || 'N/A'}
  `.trim();
  
  await guardrails.writeTextFileSafe(root, config.summaryOutputPath, summary);

  console.log('✅ [AI_Pack] Context packet created.');
  console.log(`📍 Snapshot: ${config.outputSnapshotPath}`);
  console.log(`📍 Summary: ${config.summaryOutputPath}`);
  console.log(`📊 Stats: ${payload.files.length} files | ${(runningTotalBytes / 1024).toFixed(2)} KB`);
}

pack().catch(err => {
  console.error('❌ [AI_Pack] Fatal error:', err);
  process.exit(1);
});
