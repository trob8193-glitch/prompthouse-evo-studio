import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, extname, dirname, resolve } from 'path';

const IGNORE = new Set(['node_modules', 'dist', '.git', '.prompthouse-data', 'scratch', 'scripts']);
const EXTENSIONS = new Set(['.js', '.jsx', '.mjs', '.cjs']);
const RESOLVE_EXTS = ['.js', '.jsx', '.mjs', '.cjs', '/index.js', '/index.jsx', '/index.mjs'];

function walk(dir) {
  const results = [];
  if (!existsSync(dir)) return results;
  for (const entry of readdirSync(dir)) {
    if (IGNORE.has(entry)) continue;
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      results.push(...walk(fullPath));
    } else if (EXTENSIONS.has(extname(entry))) {
      results.push(fullPath);
    }
  }
  return results;
}

export function extractLocalImports(filePath, content) {
  const imports = [];

  // Remove single-line comments to avoid false matches
  const cleanContent = content.replace(/\/\/.*/g, '');

  const staticPattern = /(?:import\s+(?:[^'"]*?\s+from\s+)?|import\s*)['"](\.[^'"]+)['"]/g;
  let match;
  while ((match = staticPattern.exec(cleanContent)) !== null) {
    imports.push({ specifier: match[1], line: content.substring(0, match.index).split('\n').length });
  }

  const dynamicPattern = /import\(\s*['"](\.[^'"]+)['"]\s*\)/g;
  while ((match = dynamicPattern.exec(cleanContent)) !== null) {
    imports.push({ specifier: match[1], line: content.substring(0, match.index).split('\n').length });
  }

  const requirePattern = /require\(\s*['"](\.[^'"]+)['"]\s*\)/g;
  while ((match = requirePattern.exec(cleanContent)) !== null) {
    imports.push({ specifier: match[1], line: content.substring(0, match.index).split('\n').length });
  }

  return imports;
}

export function resolveImport(fromFile, specifier) {
  const fromDir = dirname(fromFile);
  const target = resolve(fromDir, specifier);

  // Exact match
  if (existsSync(target) && statSync(target).isFile()) return true;

  // Try extensions and index files
  for (const ext of RESOLVE_EXTS) {
    if (existsSync(target + ext)) return true;
  }

  return false;
}

export function runImportAudit(cwd) {
  const files = walk(cwd);
  const missing = [];

  for (const file of files) {
    const content = readFileSync(file, 'utf8');
    const imports = extractLocalImports(file, content);

    for (const imp of imports) {
      // Skip template literal interpolations and escaped path strings
      if (imp.specifier.includes('$') || imp.specifier.includes('\\') || imp.specifier.includes('{')) continue;
      if (!resolveImport(file, imp.specifier)) {
        missing.push({
          file: file.replace(cwd, '.').replace(/\\/g, '/'),
          specifier: imp.specifier,
          line: imp.line,
        });
      }
    }
  }

  return {
    scannedCount: files.length,
    missing,
    ok: missing.length === 0
  };
}
