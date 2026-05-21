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

async function runCssAudit() {
  console.log(`\n${BOLD}🎨 [CSS_VARS_AUDIT] Initializing CSS Variables & Theme Integrity Scan...${RESET}`);
  console.log('══════════════════════════════════════════════════════════════');

  const srcDir = path.join(root, 'src');
  if (!fs.existsSync(srcDir)) {
    console.error(`${RED}Error: src/ directory not found.${RESET}`);
    process.exit(1);
  }

  // 1. Gather all CSS files and extract defined variables
  const cssFiles = getFiles(srcDir, ['.css']);
  const definedVars = new Set();
  const varDefLocations = {};
  const violations = [];

  // Match variable definitions like: --name: value; or --name  :value
  const varDefRegex = /(--[a-zA-Z0-9_-]+)\s*:/g;

  for (const file of cssFiles) {
    const relativePath = path.relative(root, file);
    const content = fs.readFileSync(file, 'utf8');
    let match;
    while ((match = varDefRegex.exec(content)) !== null) {
      const varName = match[1];
      definedVars.add(varName);
      if (!varDefLocations[varName]) {
        varDefLocations[varName] = [];
      }
      varDefLocations[varName].push(relativePath);

      // Validate theme/runtime naming conventions:
      // Typically should be lowercase and separate words with hyphens, e.g., --evo-color-primary, --space-12
      // Let's flag any variables containing uppercase letters as a styling convention violation
      if (/[A-Z]/.test(varName)) {
        violations.push({
          type: 'NAMING_CONVENTION_VIOLATION',
          detail: `Variable "${varName}" contains uppercase characters. Use kebab-case for CSS properties.`,
          file: relativePath,
          line: getLineNumber(content, match.index),
          context: varName
        });
      }
    }
  }

  console.log(`✨ Collected ${CYAN}${definedVars.size}${RESET} defined CSS variables across ${CYAN}${cssFiles.length}${RESET} CSS files.`);

  // 2. Scan JSX, JS, and CSS files for var(--...) usages and broken var() references
  const scanFiles = getFiles(srcDir, ['.css', '.js', '.jsx']);
  
  // Regex to look for var( something )
  // We want to catch:
  // - Valid usages: var(--my-var)
  // - Broken usages: var(something) without --, var(), var(--), or unmatched parentheses
  const generalVarRegex = /var\([^)]*\)?/g;

  for (const file of scanFiles) {
    const relativePath = path.relative(root, file);
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');

    lines.forEach((line, lineNum) => {
      // Look for unbalanced var(
      const openVarCount = (line.match(/var\(/g) || []).length;
      const closeVarCount = (line.match(/var\([^)]*\)/g) || []).length;
      if (openVarCount > closeVarCount) {
        violations.push({
          type: 'BROKEN_VAR_REFERENCE',
          detail: `Unbalanced or unclosed "var(" structure.`,
          file: relativePath,
          line: lineNum + 1,
          context: line.trim()
        });
      }

      let match;
      const lineVarRegex = /var\(([^)]*)\)/g;
      while ((match = lineVarRegex.exec(line)) !== null) {
        const inner = match[1].trim();

        // Check if empty or only spaces
        if (!inner || inner === '--') {
          violations.push({
            type: 'BROKEN_VAR_REFERENCE',
            detail: `Empty or incomplete "var(${inner})" usage.`,
            file: relativePath,
            line: lineNum + 1,
            context: line.trim()
          });
          continue;
        }

        // Must start with --
        if (!inner.startsWith('--')) {
          violations.push({
            type: 'BROKEN_VAR_REFERENCE',
            detail: `CSS variable "${inner}" in var() must start with "--".`,
            file: relativePath,
            line: lineNum + 1,
            context: line.trim()
          });
          continue;
        }

        // Split by comma in case of fallback, e.g. var(--primary-color, #fff)
        const varName = inner.split(',')[0].trim();

        // Check defined
        if (!definedVars.has(varName)) {
          // Allow some well-known Tailwind/standard browser/external custom vars if any,
          // but let's be strict or verify if they are defined.
          // Let's check if they exist in definedVars.
          violations.push({
            type: 'UNRESOLVED_CSS_VARIABLE',
            detail: `CSS custom property "${varName}" is used but never defined in any CSS file.`,
            file: relativePath,
            line: lineNum + 1,
            context: line.trim()
          });
        }
      }
    });
  }

  // Helper to find line number from index
  function getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
  }

  // 3. Print Summary
  console.log('══════════════════════════════════════════════════════════════');
  
  if (violations.length === 0) {
    console.log(`\n${GREEN}✅ [PASS] CSS Variables Audit completed. All custom properties are valid and resolved!${RESET}\n`);
    process.exit(0);
  } else {
    console.log(`\n${RED}⚠️  [FAIL] CSS Variables Audit found ${violations.length} violation(s):${RESET}`);
    violations.forEach((v, i) => {
      console.log(`   ${BOLD}[${i + 1}] ${RED}${v.type}${RESET}`);
      console.log(`       📍 Location: ${CYAN}${v.file}:${v.line}${RESET}`);
      console.log(`       💡 Context:  "${YELLOW}${v.context}${RESET}"`);
      console.log(`       📢 Details:  ${v.detail}`);
    });
    console.log(`\n${YELLOW}Correction Action Required. Fix the violations above and rerun.${RESET}\n`);
    process.exit(1);
  }
}

runCssAudit();
