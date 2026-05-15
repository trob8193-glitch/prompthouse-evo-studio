import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

function ignoreName(name) {
  return ['node_modules', '.git', 'dist', '.prompthouse-data'].includes(name);
}

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      if (ignoreName(entry)) continue;
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

function tryGitWorktree(rootDir, workspaceDir, branchName) {
  execFileSync('git', ['worktree', 'add', '-b', branchName, workspaceDir, 'HEAD'], { cwd: rootDir, stdio: 'pipe' });
}

export function createEvolutionWorkspace({ rootDir = process.cwd(), runId = `evo_${Date.now()}`, strategy = 'copy' } = {}) {
  const baseDir = path.join(rootDir, '.prompthouse-data', 'evolution', 'workspaces');
  fs.mkdirSync(baseDir, { recursive: true });
  const workspaceDir = path.join(baseDir, runId);
  if (fs.existsSync(workspaceDir)) throw new Error(`Evolution workspace already exists: ${workspaceDir}`);

  let actualStrategy = strategy;
  if (strategy === 'worktree') {
    try {
      tryGitWorktree(rootDir, workspaceDir, `evolution/${runId}`);
    } catch {
      actualStrategy = 'copy';
      copyRecursive(rootDir, workspaceDir);
    }
  } else {
    copyRecursive(rootDir, workspaceDir);
  }

  const meta = {
    runId,
    rootDir,
    workspaceDir,
    strategy: actualStrategy,
    createdAt: new Date().toISOString(),
  };
  fs.writeFileSync(path.join(workspaceDir, '.evolution-workspace.json'), JSON.stringify(meta, null, 2), 'utf8');
  return meta;
}

export function cleanupEvolutionWorkspace({ workspaceDir, preserve = true } = {}) {
  if (!workspaceDir || preserve) return { cleaned: false, preserved: true, workspaceDir };
  fs.rmSync(workspaceDir, { recursive: true, force: true });
  return { cleaned: true, preserved: false, workspaceDir };
}

export function getWorkspaceMeta(workspaceDir) {
  const file = path.join(workspaceDir, '.evolution-workspace.json');
  if (!fs.existsSync(file)) throw new Error(`Workspace metadata not found: ${workspaceDir}`);
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}
