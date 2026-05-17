import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

function safeGit(rootDir, args) {
  try {
    return execFileSync('git', args, { cwd: rootDir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return '';
  }
}

export function hashFile(filePath) {
  const data = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(data).digest('hex');
}

export function readGitState(rootDir = process.cwd()) {
  const branch = safeGit(rootDir, ['rev-parse', '--abbrev-ref', 'HEAD']) || 'unknown';
  const commit = safeGit(rootDir, ['rev-parse', 'HEAD']) || 'unknown';
  const porcelain = safeGit(rootDir, ['status', '--porcelain']);
  const changedFiles = porcelain
    ? porcelain.split('\n').map(line => ({ status: line.slice(0, 2).trim(), path: line.slice(3).trim() })).filter(item => item.path)
    : [];
  return { branch, commit, dirty: changedFiles.length > 0, changedFiles };
}

function walkFiles(dir, rootDir, out = []) {
  if (!fs.existsSync(dir)) return out;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (['node_modules', '.git', '.prompthouse-data', 'dist'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(full, rootDir, out);
    else if (/\.(js|jsx|ts|tsx|json|md|css)$/.test(entry.name)) out.push(path.relative(rootDir, full).replace(/\\/g, '/'));
  }
  return out;
}

export function createRepoSnapshot({ rootDir = process.cwd(), label = 'snapshot', fileLimit = 400 } = {}) {
  const git = readGitState(rootDir);
  const files = walkFiles(rootDir, rootDir).slice(0, fileLimit);
  const fileHashes = {};
  for (const rel of files) {
    const full = path.join(rootDir, rel);
    try { fileHashes[rel] = hashFile(full); } catch { fileHashes[rel] = null; }
  }
  const packageJsonPath = path.join(rootDir, 'package.json');
  let scripts = {};
  if (fs.existsSync(packageJsonPath)) {
    try { scripts = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')).scripts || {}; } catch { scripts = {}; }
  }
  return {
    id: `${label}_${Date.now()}`,
    label,
    createdAt: new Date().toISOString(),
    rootDir,
    git,
    fileCount: files.length,
    fileHashes,
    scriptsAvailable: Object.keys(scripts),
  };
}

export function writeSnapshot(snapshot, outputDir) {
  fs.mkdirSync(outputDir, { recursive: true });
  const file = path.join(outputDir, `${snapshot.id}.json`);
  fs.writeFileSync(file, JSON.stringify(snapshot, null, 2), 'utf8');
  return file;
}
