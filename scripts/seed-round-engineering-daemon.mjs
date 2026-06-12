import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', '.prompthouse-data');
const READINESS_PATH = path.join(DATA_DIR, 'seed_readiness.json');
const EVOLUTION_QUEUE_PATH = path.join(DATA_DIR, 'evolution_queue.json');

const DAEMON_INTERVAL_MS = Number(process.env.SEED_DAEMON_INTERVAL_MS || 30_000);
const SRC_DIR = path.join(__dirname, '..', 'src');

console.log(`
==================================================
SEED ROUND ENGINEERING DAEMON (QA & VALIDATION)
==================================================
Mode: Ruthless Codebase & Architecture Validation
Mission: Ensure 100% Venture-Backed Technical Quality
==================================================
`);

function readJson(filepath, fallback) {
  if (!fs.existsSync(filepath)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(filepath, 'utf8'));
  } catch {
    return fallback;
  }
}

function saveJson(filepath, data) {
  fs.mkdirSync(path.dirname(filepath), { recursive: true });
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
}

// Recursively get all JS/JSX files
function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file.endsWith('.js') || file.endsWith('.jsx')) {
        arrayOfFiles.push(path.join(dirPath, file));
      }
    }
  });
  return arrayOfFiles;
}

function evaluateSeedQuality(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];

  // Rule 1: No raw console.logs in production-tier files
  // Exclusions: daemon scripts, test files, and the logger utility itself
  const isLoggerFile = filePath.includes('Logger') || filePath.includes('logger');
  const isDaemonOrTest = filePath.includes('daemon') || filePath.includes('test');
  if (content.match(/console\.log\(/g) && !isDaemonOrTest && !isLoggerFile) {
    issues.push('Contains lingering console.log statements (Unprofessional for production).');
  }

  // Rule 2: Files that are too large (Spaghetti Code risk)
  const lines = content.split('\n').length;
  if (lines > 500) {
    issues.push(`File is overly massive (${lines} lines). Requires immediate modularization.`);
  }

  // Rule 3: Detect inline generic styling (should use design system)
  if (content.match(/style=\{\{/g) && content.match(/color: '(red|blue|green)'/g)) {
    issues.push('Uses generic inline CSS colors instead of the Unreal Engine aesthetics design system.');
  }

  return {
    isSeedQuality: issues.length === 0,
    issues
  };
}

export async function runSeedValidationCycle() {
  console.log('[SeedDaemon] Scanning architecture for Venture-Backed Quality Standards...');
  const files = getAllFiles(SRC_DIR);
  const evolutionQueue = readJson(EVOLUTION_QUEUE_PATH, []);
  let passedFiles = 0;
  let flaggedFiles = 0;

  for (const file of files) {
    const evaluation = evaluateSeedQuality(file);
    if (!evaluation.isSeedQuality) {
      flaggedFiles++;
      const relativePath = path.relative(path.join(__dirname, '..'), file);
      console.log(`[SeedDaemon] ❌ NON-SEED MATERIAL DETECTED: ${relativePath}`);
      evaluation.issues.forEach(issue => console.log(`  -> ${issue}`));

      // Auto-trigger the Self-Evolution Engine to fix it
      const alreadyQueued = evolutionQueue.find(q => q.targetFile === relativePath);
      if (!alreadyQueued) {
        evolutionQueue.push({
          id: `seed_fix_${Date.now()}`,
          targetFile: relativePath,
          urgency: 'CRITICAL',
          reason: 'Failed Seed Round Engineering Standards',
          instructions: `Fix the following architectural issues: ${evaluation.issues.join(', ')}`
        });
        console.log(`[SeedDaemon] -> Placed ${relativePath} in Evolution Queue for autonomous repair.`);
      }
    } else {
      passedFiles++;
    }
  }

  saveJson(EVOLUTION_QUEUE_PATH, evolutionQueue);

  const totalFiles = files.length;
  const score = Math.max(0, Math.floor((passedFiles / totalFiles) * 100));
  
  saveJson(READINESS_PATH, {
    lastAudit: new Date().toISOString(),
    filesScanned: totalFiles,
    passedFiles,
    flaggedFiles,
    seedReadinessScore: score,
    status: score === 100 ? 'SEED_READY' : 'EVOLUTION_REQUIRED'
  });

  console.log(`[SeedDaemon] Cycle Complete. Seed Readiness Score: ${score}/100. ${flaggedFiles > 0 ? 'Evolution Engines Activated.' : 'Platform is Flawless.'}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runSeedValidationCycle().catch((error) => {
    console.error('[SeedDaemon] Cycle failed:', error.message);
    process.exitCode = 1;
  });
  
  if (process.env.SEED_DAEMON_RUN_ONCE !== 'true') {
    setInterval(() => {
      runSeedValidationCycle().catch((error) => console.error('[SeedDaemon] Cycle failed:', error.message));
    }, DAEMON_INTERVAL_MS);
  }
}
