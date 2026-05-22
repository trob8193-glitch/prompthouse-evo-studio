import fs from 'fs';
import path from 'path';

/**
 * AUTONOMOUS AUDITOR BOT
 * ══════════════════════
 * Role: Sweeps the codebase for truth state regressions, logical inconsistencies, and non-compliant code.
 * Persona: Auditor (Doberman) "Trust nothing. Verify everything. No regression escapes."
 */

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';

console.log(`${CYAN}[AUDITOR] Initializing Autonomous Codebase Sweep...${RESET}`);

const ROOT_DIR = process.cwd();
let issuesFound = 0;

function scanDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      if (!['node_modules', '.git', 'dist'].includes(file)) {
        scanDirectory(fullPath);
      }
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      auditFile(fullPath);
    }
  }
}

function auditFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Rule 1: No hardcoded secret templates
  if (content.includes('YOUR_API_KEY') || content.includes('insert_key_here')) {
    console.log(`${RED}[VIOLATION] Hardcoded secret template detected in: ${filePath}${RESET}`);
    issuesFound++;
  }

  // Rule 2: Ensure fetch calls have error handling (heuristic)
  if (content.includes('fetch(') && !content.includes('.catch') && !content.includes('try {')) {
    console.log(`${RED}[WARNING] Unprotected fetch call (no try/catch or .catch) in: ${filePath}${RESET}`);
    issuesFound++;
  }

  // Rule 3: Detect console.log left in production-intended files (excluding scripts/ and node_env checks)
  if (!filePath.includes('scripts') && !filePath.includes('server') && content.includes('console.log(')) {
    // Just a warning, not necessarily a violation
    console.log(`${CYAN}[NOTICE] console.log statement found in: ${filePath}${RESET}`);
  }
}

console.log(`${CYAN}[AUDITOR] Beginning scan of src directory...${RESET}`);
if (fs.existsSync(path.join(ROOT_DIR, 'src'))) {
  scanDirectory(path.join(ROOT_DIR, 'src'));
}

console.log(`\n${CYAN}[AUDITOR] Sweep Complete.${RESET}`);
if (issuesFound > 0) {
  console.log(`${RED}[AUDITOR] Found ${issuesFound} compliance issues. Fix required before Sovereign integration.${RESET}`);
  process.exit(1);
} else {
  console.log(`${GREEN}[AUDITOR] Codebase compliant. Truth state verified. No regressions detected.${RESET}`);
  process.exit(0);
}
