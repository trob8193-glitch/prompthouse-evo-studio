import fs from 'fs';
import path from 'path';

/**
 * Parses local import statements from a given JavaScript/TypeScript file content.
 */
function parseLocalImports(content) {
  const localImports = [];
  // Match ES6 imports: import ... from '[local-file]' or require('[local-file]')
  const importRegex = /import\s+(?:[^"']+\s+from\s+)?["'](\.[^"']+)["']/g;
  const requireRegex = /require\(\s*["'](\.[^"']+)["']\s*\)/g;
  const dynamicRegex = /import\(\s*["'](\.[^"']+)["']\s*\)/g;

  let match;
  while ((match = importRegex.exec(content)) !== null) localImports.push(match[1]);
  while ((match = requireRegex.exec(content)) !== null) localImports.push(match[1]);
  while ((match = dynamicRegex.exec(content)) !== null) localImports.push(match[1]);

  return [...new Set(localImports)];
}

/**
 * Tries to resolve a relative import path to an absolute file path.
 */
function resolveImportPath(baseDir, relativePath) {
  const fullPath = path.resolve(baseDir, relativePath);
  
  // Explicit exact match
  if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) return fullPath;

  // Try appending extensions
  const extensions = ['.js', '.jsx', '.ts', '.tsx', '.cjs', '.mjs'];
  for (const ext of extensions) {
    if (fs.existsSync(fullPath + ext) && fs.statSync(fullPath + ext).isFile()) {
      return fullPath + ext;
    }
  }

  // Try appending /index.js etc
  for (const ext of extensions) {
    const indexFile = path.join(fullPath, `index${ext}`);
    if (fs.existsSync(indexFile) && fs.statSync(indexFile).isFile()) {
      return indexFile;
    }
  }

  return null;
}

/**
 * Resolves the AST context for a target file by recursively loading local dependencies.
 * @param {string} targetFile Absolute path to the main target file
 * @param {string} rootDir Workspace root directory
 * @param {number} maxDepth Maximum recursion depth (0 = no dependencies, 1 = direct imports)
 * @returns {string} The full stringified context
 */
export function resolveASTContext(targetFile, rootDir, maxDepth = 1) {
  const visited = new Set();
  const contextBlocks = [];

  function traverse(filePath, depth) {
    if (visited.has(filePath)) return;
    visited.add(filePath);

    if (!fs.existsSync(filePath)) return;
    
    const relativeName = path.relative(rootDir, filePath).replace(/\\/g, '/');
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Add context block
    contextBlocks.push(`// --- [${relativeName}] ---\n${content}\n// ---`);

    if (depth >= maxDepth) return;

    const baseDir = path.dirname(filePath);
    const localImports = parseLocalImports(content);

    for (const relImport of localImports) {
      const resolved = resolveImportPath(baseDir, relImport);
      if (resolved) {
        traverse(resolved, depth + 1);
      }
    }
  }

  traverse(targetFile, 0);

  // If we only have the target file, we just return its block without AST chunking formatting if desired,
  // but keeping it formatted is fine.
  return contextBlocks.join('\n\n');
}
