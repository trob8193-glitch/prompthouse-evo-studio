import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

// Color helpers
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const CYAN = '\x1b[36m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

function getFiles(dir, extensions) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(filePath, extensions));
    } else if (extensions.includes(path.extname(file))) {
      results.push(filePath);
    }
  }
  return results;
}

// Allowed dependencies from package.json
const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const nodeBuiltins = [
  'path', 'fs', 'url', 'child_process', 'crypto', 'os', 'http', 'https', 'stream', 'util', 'events', 'assert',
  'dgram', 'net', 'dns', 'querystring', 'readline', 'zlib', 'tls', 'cluster', 'vm', 'worker_threads', 'sqlite3', 'fs/promises'
];
const allowedDeps = new Set([
  ...Object.keys(packageJson.dependencies || {}),
  ...Object.keys(packageJson.devDependencies || {}),
  ...nodeBuiltins
]);

async function runImportsAudit() {
  console.log(`\n${BOLD}🔗 [IMPORTS_AUDIT] Initializing Advanced Principal Imports Gate...${RESET}`);
  console.log('══════════════════════════════════════════════════════════════');

  const scanDirs = ['src', 'generated_apis', 'scripts', 'server'];
  let allSourceFiles = [];
  scanDirs.forEach(dir => {
    const fullPath = path.join(root, dir);
    allSourceFiles = allSourceFiles.concat(getFiles(fullPath, ['.js', '.jsx', '.mjs']));
  });

  console.log(`📡 Scanning ${CYAN}${allSourceFiles.length}${RESET} files in [src, generated_apis, scripts, server]...`);

  const importRegex = /import\s+(?:[\w\s{},*]+|['"][\w\s{},*]+['"]\s+as\s+[\w\s{},*]+)?\s*from\s+['"]([^'"]+)['"]/g;
  const requireRegex = /require\(\s*['"]([^'"]+)['"]\s*\)/g;

  const violations = [];

  for (const file of allSourceFiles) {
    const relativePath = path.relative(root, file);
    
    // Determine if file is a frontend React/UI component or page file
    const isFrontendFile = 
      relativePath.endsWith('.jsx') || 
      (relativePath.startsWith('src') && 
       !relativePath.startsWith(path.join('src', 'core')) &&
       !relativePath.includes('_logic.js') &&
       !relativePath.includes('mobile-engine.js') &&
       !relativePath.includes('native-') &&
       !relativePath.includes('ghost_') &&
       !relativePath.includes('sovereign_ledger') &&
       !relativePath.includes('reality_synthesis') &&
       !relativePath.includes('recursive_swarm') &&
       !relativePath.includes('singularity_core') &&
       !relativePath.includes('studio_diagnostics') &&
       !relativePath.includes('temporal_foresight') &&
       !relativePath.includes('terminal_logic') &&
       !relativePath.includes('truth_auditor') &&
       !relativePath.includes('bridge-contract-ledger.js') &&
       !relativePath.includes('src' + path.sep + 'diagnostics') &&
       !relativePath.includes('src/diagnostics'));

    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');

    lines.forEach((line, lineNum) => {
      let match;
      
      // Check import
      while ((match = importRegex.exec(line)) !== null) {
        verifyImport(match[1], relativePath, lineNum + 1, line.trim(), file, isFrontendFile);
      }

      // Check require
      while ((match = requireRegex.exec(line)) !== null) {
        verifyImport(match[1], relativePath, lineNum + 1, line.trim(), file, isFrontendFile);
      }
    });
  }

  function verifyImport(importPath, fileRelative, lineNo, rawLine, absoluteFile, isFrontendFile) {
    // Handle node: imports
    if (importPath.startsWith('node:')) {
      const inner = importPath.substring(5);
      if (!nodeBuiltins.includes(inner)) {
        violations.push({
          type: 'MISSING_DEPENDENCY',
          importPath,
          file: fileRelative,
          line: lineNo,
          rawLine,
          message: `Built-in Node module "${inner}" is not recognized.`
        });
      }
      // If a frontend file imports node: built-ins, block it!
      if (isFrontendFile) {
        violations.push({
          type: 'UNSAFE_FRONTEND_NODE_IMPORT',
          importPath,
          file: fileRelative,
          line: lineNo,
          rawLine,
          message: `Frontend files cannot import Node-only module "${importPath}".`
        });
      }
      return;
    }

    // 1. Unsafe Node core modules in frontend files
    if (isFrontendFile) {
      const unsafeBuiltins = ['fs', 'child_process', 'crypto', 'net', 'dgram', 'tls', 'cluster'];
      if (unsafeBuiltins.includes(importPath) || (importPath === 'path' && !fileRelative.includes('saasOrchestrator'))) {
        violations.push({
          type: 'UNSAFE_FRONTEND_NODE_IMPORT',
          importPath,
          file: fileRelative,
          line: lineNo,
          rawLine,
          message: `Frontend files cannot import Node-only module "${importPath}".`
        });
        return;
      }

      // Specifically block frontend files from importing server-only theme memory
      if (importPath.includes('ThemeMemory') || importPath.includes('theme-evolution/ThemeMemory')) {
        violations.push({
          type: 'SERVER_ONLY_THEME_MEMORY_IMPORT',
          importPath,
          file: fileRelative,
          line: lineNo,
          rawLine,
          message: `Frontend files cannot import server-only ThemeMemory module. Use api fetch routes instead.`
        });
        return;
      }
    }

    // 2. Resolve external dependencies
    if (!importPath.startsWith('.') && !importPath.startsWith('/') && !path.isAbsolute(importPath)) {
      let mainPkg = importPath.split('/')[0];
      if (mainPkg.startsWith('@') && importPath.split('/').length > 1) {
        mainPkg = importPath.split('/').slice(0, 2).join('/');
      }
      if (!allowedDeps.has(mainPkg)) {
        // Exclude optional stubs/shims in demo or test code
        const isOptional = 
          fileRelative.includes('mobile-engine.js') || 
          fileRelative.includes('self-build-manifests.js') ||
          fileRelative.includes('ai_context_pack') ||
          fileRelative.includes('ai_review_');
        if (!isOptional) {
          violations.push({
            type: 'MISSING_DEPENDENCY',
            importPath,
            file: fileRelative,
            line: lineNo,
            rawLine,
            message: `Package "${mainPkg}" is imported but not declared in package.json.`
          });
        }
      }
      return;
    }

    // 3. Resolve local relative imports
    const fileDir = path.dirname(absoluteFile);
    let resolved = false;

    const candidatePaths = [
      path.resolve(fileDir, importPath),
      path.resolve(fileDir, importPath + '.js'),
      path.resolve(fileDir, importPath + '.jsx'),
      path.resolve(fileDir, importPath + '.mjs'),
      path.resolve(fileDir, importPath, 'index.js'),
      path.resolve(fileDir, importPath, 'index.jsx')
    ];

    for (const p of candidatePaths) {
      if (fs.existsSync(p) && fs.statSync(p).isFile()) {
        resolved = true;
        break;
      }
    }

    if (!resolved) {
      const isOptional = 
        fileRelative.includes('self-build-manifests.js') ||
        fileRelative.includes('ai_context_pack') ||
        fileRelative.includes('ai_review_');
      if (!isOptional) {
        violations.push({
          type: 'UNRESOLVED_RELATIVE_IMPORT',
          importPath,
          file: fileRelative,
          line: lineNo,
          rawLine,
          message: `Local path "${importPath}" cannot be resolved to any existing file.`
        });
      }
    }
  }

  // Print summary & exit
  console.log('══════════════════════════════════════════════════════════════');

  if (violations.length === 0) {
    console.log(`\n${GREEN}✅ [PASS] Imports & Dependency Security Audit completed successfully! Zero violations detected.${RESET}\n`);
    process.exit(0);
  } else {
    console.log(`\n${RED}⚠️  [FAIL] Imports Security Audit detected ${violations.length} critical violation(s):${RESET}`);
    violations.forEach((v, i) => {
      console.log(`   ${BOLD}[${i + 1}] ${RED}${v.type}${RESET}`);
      console.log(`       📍 Location: ${CYAN}${v.file}:${v.line}${RESET}`);
      console.log(`       💡 Context:  "${YELLOW}${v.rawLine}${RESET}"`);
      console.log(`       📢 Details:  ${v.message}`);
    });
    console.log(`\n${YELLOW}Correction Action Required. Fix the violations above and rerun.${RESET}\n`);
    process.exit(1);
  }
}

runImportsAudit();
