import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

export function readGitState(rootDir = process.cwd()) {
  try {
    const branch = execSync('git branch --show-current', { cwd: rootDir, encoding: 'utf8' }).trim();
    const commit = execSync('git rev-parse HEAD', { cwd: rootDir, encoding: 'utf8' }).trim();
    const statusOut = execSync('git status --porcelain', { cwd: rootDir, encoding: 'utf8' });
    
    const lines = statusOut.split('\n').filter(Boolean);
    const isDirty = lines.length > 0;
    const untracked = lines.filter(l => l.startsWith('??')).length;
    const modified = lines.filter(l => !l.startsWith('??')).length;

    return {
      status: 'active',
      branch,
      commit,
      isDirty,
      untrackedCount: untracked,
      modifiedCount: modified,
    };
  } catch (e) {
    return {
      status: 'error',
      error: e.message,
    };
  }
}

export function createRepoSnapshot({ rootDir = process.cwd(), label = 'snapshot' } = {}) {
  let totalFiles = 0;
  let totalBytes = 0;

  function walk(dir) {
    let items;
    try {
      items = fs.readdirSync(dir);
    } catch {
      return;
    }

    for (const item of items) {
      if (item === '.git' || item === 'node_modules' || item === '.shadow-forge' || item === '.gemini' || item === '.evo-layer' || item === '.evo-backups') continue;
      
      const fullPath = path.join(dir, item);
      let stats;
      try {
        stats = fs.statSync(fullPath);
      } catch {
        continue;
      }

      if (stats.isDirectory()) {
        walk(fullPath);
      } else if (stats.isFile()) {
        totalFiles++;
        totalBytes += stats.size;
      }
    }
  }

  const startTime = Date.now();
  walk(rootDir);
  const scanDurationMs = Date.now() - startTime;

  return {
    label,
    status: 'scanned',
    totalFiles,
    totalBytes,
    scanDurationMs,
    scannedAt: new Date().toISOString()
  };
}
