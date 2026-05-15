import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, extname } from 'path';

const IGNORE = ['node_modules', 'dist', '.git'];
const CSS_EXTS = new Set(['.css']);
const CODE_EXTS = new Set(['.js', '.jsx', '.mjs', '.ts', '.tsx']);

function walk(dir, extensions) {
  const results = [];
  if (!existsSync(dir)) return results;
  for (const entry of readdirSync(dir)) {
    if (IGNORE.includes(entry)) continue;
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      results.push(...walk(fullPath, extensions));
    } else if (extensions.has(extname(entry))) {
      results.push(fullPath);
    }
  }
  return results;
}

export function extractDefinedTokens(cssFiles) {
  const defined = new Set();
  for (const file of cssFiles) {
    const content = readFileSync(file, 'utf8');
    const tokenPattern = /--([\w-]+)\s*:/g;
    let match;
    while ((match = tokenPattern.exec(content)) !== null) {
      defined.add(`--${match[1]}`);
    }
  }
  return defined;
}

export function extractReferencedTokens(files, cwd) {
  const referenced = new Map();
  for (const file of files) {
    const content = readFileSync(file, 'utf8');
    const pattern = /var\(\s*(--([\w-]+))/g;
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const token = match[1];
      if (!referenced.has(token)) referenced.set(token, []);
      referenced.get(token).push(file.replace(cwd, '.'));
    }
  }
  return referenced;
}

export function runCssAudit(cwd) {
  const SRC_DIR = join(cwd, 'src');
  const cssFiles = walk(SRC_DIR, CSS_EXTS);
  const codeFiles = walk(SRC_DIR, CODE_EXTS);
  const allFiles = [...cssFiles, ...codeFiles];

  const defined = extractDefinedTokens(cssFiles);
  const referenced = extractReferencedTokens(allFiles, cwd);

  const missing = [];
  for (const [token, files] of referenced.entries()) {
    if (!defined.has(token)) {
      missing.push({ token, files: [...new Set(files)] });
    }
  }

  return {
    definedCount: defined.size,
    referencedCount: referenced.size,
    missing,
    ok: missing.length === 0
  };
}
