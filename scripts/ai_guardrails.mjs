import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';

/**
 * AI GUARDRAILS (V1 PRODUCTION - REPAIRED V3)
 * ═══════════════════════════════════════════════════════════════
 * Final interface alignment for the Sovereign OpenAI Bridge.
 * Ensures metadata parity between scanning and packing logic.
 */

export function getProjectRoot() {
  return path.resolve(process.cwd());
}

export function isPathInsideProject(root, target) {
  const resolvedRoot = path.resolve(root);
  const resolvedTarget = path.resolve(target);
  const relative = path.relative(resolvedRoot, resolvedTarget).replace(/\\/g, '/');
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

export function normalizeRelativePath(root, target) {
  const relative = path.relative(root, target).replace(/\\/g, '/');
  return relative.startsWith('./') ? relative.slice(2) : relative;
}

export async function ensureDir(dirPath) {
  await fsPromises.mkdir(dirPath, { recursive: true });
}

export async function writeTextFileSafe(root, relativePath, content) {
  const target = path.resolve(root, relativePath);
  if (!isPathInsideProject(root, target)) {
    throw new Error(`Attempted to write outside project root: ${target}`);
  }
  await ensureDir(path.dirname(target));
  await fsPromises.writeFile(target, content, 'utf8');
}

export async function safeReadTextFile(filePath, maxBytes = 120000) {
  const resolved = path.resolve(filePath);
  const root = getProjectRoot();
  if (!isPathInsideProject(root, resolved)) {
    throw new Error(`Read outside project root blocked: ${resolved}`);
  }
  const stats = await fsPromises.stat(resolved);
  if (stats.size > maxBytes) {
    return `[SKIPPED: File too large (${stats.size} bytes)]`;
  }
  return fsPromises.readFile(resolved, 'utf8');
}

export function fileExists(filePath) {
  try {
    fs.accessSync(filePath);
    return true;
  } catch {
    return false;
  }
}

function globToRegex(glob) {
  const escaped = glob.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  const regexText = '^' + escaped.replace(/\*/g, '.*').replace(/\?/g, '.') + '$';
  return new RegExp(regexText, 'i');
}

export function looksSensitivePath(relativePath) {
  const normalized = relativePath.replace(/\\/g, '/');
  const patterns = [
    /\.env/, /\.key$/, /\.pem$/, /\.jks$/, /\.keystore$/, 
    /serviceAccount.*\.json$/, /firebase-adminsdk.*\.json$/,
    /google-services.*\.json$/, /GoogleService-Info\.plist/
  ];
  return patterns.some(regex => regex.test(normalized));
}

export function shouldExclude(relativePath, config) {
  const normalized = relativePath.replace(/\\/g, '/');
  if (config.excludePaths.some(p => normalized === p || normalized.startsWith(p + '/'))) return true;
  if (config.excludeGlobs.some(glob => globToRegex(glob).test(normalized))) return true;
  return looksSensitivePath(normalized);
}

export function redactSensitiveText(text) {
  const patterns = [
    { regex: /sk-[a-zA-Z0-9]{48}/g, replacement: '[REDACTED_OPENAI_KEY]' },
    { regex: /Bearer\s+[a-zA-Z0-9\-\._~+\/]+=*/g, replacement: 'Bearer [REDACTED_TOKEN]' },
    { regex: /ey[a-zA-Z0-9\-_]+\.ey[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+/g, replacement: '[REDACTED_JWT]' },
    { regex: /-----BEGIN PRIVATE KEY-----[\s\S]*?-----END PRIVATE KEY-----/g, replacement: '[REDACTED_PRIVATE_KEY]' }
  ];
  let redacted = text;
  patterns.forEach(p => { redacted = redacted.replace(p.regex, p.replacement); });
  return redacted;
}

export async function listFilesSafe(root, scanRoots, config) {
  const files = [];
  const skippedFiles = [];
  
  async function walk(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = await fsPromises.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relative = normalizeRelativePath(root, fullPath);
      if (shouldExclude(relative, config)) {
        skippedFiles.push({ path: relative, reason: 'Excluded' });
        continue;
      }
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else {
        const ext = path.extname(entry.name).toLowerCase();
        if (config.includeExtensions.includes(ext) || config.alwaysIncludeFiles.includes(relative)) {
          const stats = await fsPromises.stat(fullPath);
          files.push({ path: relative, fullPath, sizeBytes: stats.size });
        }
      }
    }
  }

  for (const f of config.alwaysIncludeFiles) {
    const full = path.join(root, f);
    if (fs.existsSync(full)) {
      const stats = await fsPromises.stat(full);
      files.push({ path: f, fullPath: full, sizeBytes: stats.size });
    }
  }

  for (const r of scanRoots) {
    await walk(path.join(root, r));
  }

  const uniqueFiles = Array.from(new Map(files.map(f => [f.path, f])).values());
  const totalBytes = uniqueFiles.reduce((sum, f) => sum + f.sizeBytes, 0);

  return { files: uniqueFiles, skippedFiles, totalBytes };
}
