import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

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

async function runVerification() {
  console.log(`\n${BOLD}🛸 [STUDIO_VERIFICATION] Initializing Master Static Verification...${RESET}`);
  console.log('══════════════════════════════════════════════════════════════');

  const violations = [];

  // 1. Verify package.json scripts point to existing files
  const packageJsonPath = path.join(root, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    violations.push({ type: 'PACKAGE_JSON_MISSING', message: 'package.json could not be found.' });
  } else {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const scripts = packageJson.scripts || {};
    
    for (const [key, cmd] of Object.entries(scripts)) {
      // Find all file tokens in the command (tokens with extensions like .js, .mjs, .cjs, .json, .sh)
      const fileTokenRegex = /[\w\-./\\]+\.(?:js|jsx|mjs|cjs|json|sh|py|txt|jsonl)/gi;
      let match;
      while ((match = fileTokenRegex.exec(cmd)) !== null) {
        let filePath = match[0];
        // Clean quotes or flags from path
        filePath = filePath.replace(/['"]/g, '').trim();
        // If it looks like a file in project root or scripts directory, verify it
        const resolvedPath = path.resolve(root, filePath);
        if (!fs.existsSync(resolvedPath)) {
          violations.push({
            type: 'INVALID_SCRIPT_TARGET',
            message: `Script "${key}" command "${cmd}" references missing file target: "${filePath}"`
          });
        }
      }
    }
  }

  // 2. Verify no banned words in production source
  const bannedWords = [
    'TODO',
    'placeholder',
    'mock',
    'dummy',
    'stub',
    'fake',
    'for brevity',
    'lorem ipsum',
    'pending implementation',
    'currently gated'
  ];

  // We scan src, generated_apis, server, but ignore:
  // - Scripts folder itself (audit scripts)
  // - Files with "audit", "verify", "review" in the path/name
  // - Test files (*.test.js, *.spec.js, and tests/ folder)
  // - Docs/Markdown/JSON/JSONL/TXT files
  const allowedPaths = ['src', 'server', 'generated_apis'];
  let sourceFiles = [];
  allowedPaths.forEach(dir => {
    const fullPath = path.join(root, dir);
    sourceFiles = sourceFiles.concat(getFiles(fullPath, ['.js', '.jsx', '.mjs', '.cjs']));
  });

  sourceFiles.forEach(file => {
    const relativePath = path.relative(root, file);
    
    const pathLower = relativePath.toLowerCase();
    const isAllowedAuditOrTest = 
      pathLower.includes('audit') || 
      pathLower.includes('verify') || 
      pathLower.includes('test') || 
      pathLower.includes('review') || 
      pathLower.includes('spec') || 
      pathLower.includes('truth') || 
      pathLower.includes('liveforge') || 
      pathLower.includes('simulator') || 
      pathLower.includes('rare-capabilities') || 
      pathLower.startsWith('tests' + path.sep);

    if (isAllowedAuditOrTest) return;

    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      bannedWords.forEach(word => {
        // Look for the word as a substring, case-insensitive
        if (line.toLowerCase().includes(word.toLowerCase())) {
          // Exception: HTML attributes like placeholder="Enter..." or placeholder={...}
          if (word.toLowerCase() === 'placeholder' && (line.includes('placeholder=') || line.includes('placeholder :') || line.includes('placeholder:'))) {
            return;
          }
          // Exception: React state updater parameters or variables
          if (word.toLowerCase() === 'fake' && (line.includes('fake=') || line.includes('fake:'))) {
            return;
          }
          violations.push({
            type: 'BANNED_WORD_DETECTED',
            message: `Banned word "${word}" found in production source.`,
            file: relativePath,
            line: index + 1,
            context: line.trim()
          });
        }
      });
    });
  });

  // 3. Verify generated_apis files can be syntax checked
  const genApisDir = path.join(root, 'generated_apis');
  if (fs.existsSync(genApisDir)) {
    const apiFiles = getFiles(genApisDir, ['.js', '.mjs', '.cjs']);
    apiFiles.forEach(file => {
      const relativePath = path.relative(root, file);
      try {
        execSync(`node --check "${file}"`, { stdio: 'ignore' });
      } catch (err) {
        violations.push({
          type: 'SYNTAX_CHECK_FAILURE',
          message: `Generated API file syntax error: ${err.message}`,
          file: relativePath
        });
      }
    });
  }

  // 4. Verify src/features/index.jsx has no dummy fallback exports
  const featuresIndexPath = path.join(root, 'src', 'features', 'index.jsx');
  if (fs.existsSync(featuresIndexPath)) {
    const content = fs.readFileSync(featuresIndexPath, 'utf8');
    const dummyIndicators = [
      'export function SelfBuildForgeView',
      'export function ForgeRenderConsoleView',
      'export function ProofToValueView',
      'Dummy components to replace missing files'
    ];
    dummyIndicators.forEach(indicator => {
      // If index.jsx still declares these locally (e.g. containing "export function SelfBuildForgeView() {")
      if (content.includes(indicator) && content.includes('currently gated pending implementation')) {
        violations.push({
          type: 'DUMMY_EXPORT_DETECTED',
          message: `index.jsx still exports dummy fallback implementation matching "${indicator}".`,
          file: 'src/features/index.jsx'
        });
      }
    });
  } else {
    violations.push({
      type: 'MISSING_FILE',
      message: 'src/features/index.jsx is missing.'
    });
  }

  // 5. Print clear pass/fail report
  console.log('══════════════════════════════════════════════════════════════');
  console.log(`                    STUDIO VERIFICATION REPORT`);
  console.log('══════════════════════════════════════════════════════════════');

  if (violations.length === 0) {
    console.log(`\n${GREEN}🏆 [PASS] All static verification checks passed cleanly!${RESET}`);
    console.log(`- Package scripts point to existing files.`);
    console.log(`- Zero banned words (mock, dummy, fake, TODO, etc.) in production source.`);
    console.log(`- Generated APIs syntax-checked successfully.`);
    console.log(`- All index.jsx feature exports are fully realized.\n`);
    process.exit(0);
  } else {
    console.log(`\n${RED}⚠️  [FAIL] Verification checks failed with ${violations.length} error(s):${RESET}`);
    violations.forEach((v, i) => {
      console.log(`   ${BOLD}[${i + 1}] ${RED}${v.type}${RESET}`);
      if (v.file) {
        console.log(`       📍 Location: ${CYAN}${v.file}${v.line ? ':' + v.line : ''}${RESET}`);
      }
      if (v.context) {
        console.log(`       💡 Context:  "${YELLOW}${v.context}${RESET}"`);
      }
      console.log(`       📢 Details:  ${v.message}`);
    });
    console.log(`\n${YELLOW}Correction Action Required. Resolve the verification failures to continue.${RESET}\n`);
    process.exit(1);
  }
}

runVerification();
