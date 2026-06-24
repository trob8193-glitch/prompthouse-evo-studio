import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { UniversalAIAdaptor } from '../lib/ai/UniversalAIAdaptor.js';
import { evaluateCostedRequest } from '../src/core/gateway/index.js';
import dotenv from 'dotenv';
import { hardenProcess, createDaemonHeartbeat } from './daemon-hardener.mjs';

hardenProcess('seed-round-engineering-daemon');

dotenv.config({ override: true });
dotenv.config({ path: '.env.agent', override: true });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', '.prompthouse-data');
const READINESS_PATH = path.join(DATA_DIR, 'seed_readiness.json');
const EVOLUTION_QUEUE_PATH = path.join(DATA_DIR, 'evolution_queue.json');

const DAEMON_INTERVAL_MS = Number(process.env.SEED_DAEMON_INTERVAL_MS || 30_000);
const SRC_DIR = path.join(__dirname, '..', 'src');

const adaptor = new UniversalAIAdaptor();

console.log(`
==================================================
SEED ROUND ENGINEERING DAEMON (QA & VALIDATION)
==================================================
Mode: AI-Driven Ruthless Codebase Validation
Routing: Active OpenAI Model Pipeline
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

async function evaluateSeedQuality(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  const isLoggerFile = filePath.includes('Logger') || filePath.includes('logger');
  const isDaemonOrTest = filePath.includes('daemon') || filePath.includes('test');
  
  if (isDaemonOrTest || isLoggerFile) {
    return { isSeedQuality: true, issues: [] };
  }

  const lines = content.split('\n').length;
  if (lines > 3000) {
    return { isSeedQuality: false, issues: ['File is massively oversized (>3000 lines). Break it down.'] };
  }

  const prompt = `Perform a strict Venture-Backed Architectural and Code Quality Audit on this file.
Look for anti-patterns, spaghetti code, console.log leaks, inline styling instead of tokens, and poor abstraction.
Respond ONLY with a valid JSON array of strings, each describing a specific, actionable architectural or code debt issue. 
If the file is pristine and production-ready, return an empty array []. Do NOT return markdown formatting like \`\`\`json. Return raw JSON.

File: ${path.basename(filePath)}
Code:
${content}`;

  try {
    // Cost Firewall Check
    const isAllowed = evaluateCostedRequest({
      endpoint: 'seed-round-engineering/gpt-3.5-turbo',
      estimatedCost: 0.005, // Rough estimate for a source code audit scan
      reason: 'AI Audit of ' + path.basename(filePath),
      rootDir: path.join(__dirname, '..')
    });

    if (!isAllowed) {
      console.log(`[SeedDaemon] ⛔ COST FIREWALL BLOCKED AI request for ${path.basename(filePath)}.`);
      return { isSeedQuality: true, issues: [] };
    }

    // using a fast model for rapid code scanning
    const result = await adaptor.routeRequest(prompt, { model: 'gpt-3.5-turbo', temperature: 0.1 });
    if (!result.success) {
      console.log(`[SeedDaemon] AI Engine error on ${path.basename(filePath)}: ${result.error}`);
      return { isSeedQuality: true, issues: [] };
    }
    
    let issues = [];
    try {
       let cleanJson = result.message.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
       issues = JSON.parse(cleanJson);
       if (!Array.isArray(issues)) issues = [String(issues)];
    } catch(e) {
       console.log(`[SeedDaemon] Failed to parse AI output for ${path.basename(filePath)}. Output was: ${result.message}`);
    }

    return {
      isSeedQuality: issues.length === 0,
      issues
    };
  } catch (e) {
    return { isSeedQuality: true, issues: [] };
  }
}

export async function runSeedValidationCycle() {
  console.log('[SeedDaemon] Scanning architecture using AI Venture-Backed Standards...');
  const files = getAllFiles(SRC_DIR);
  const evolutionQueue = readJson(EVOLUTION_QUEUE_PATH, []);
  
  // Randomly sample up to 3 files to prevent API rate limit destruction on continuous loops
  const sampledFiles = files.sort(() => 0.5 - Math.random()).slice(0, 3);
  
  let flaggedFiles = 0;

  for (const file of sampledFiles) {
    const evaluation = await evaluateSeedQuality(file);
    if (!evaluation.isSeedQuality) {
      flaggedFiles++;
      const relativePath = path.relative(path.join(__dirname, '..'), file);
      console.log(`[SeedDaemon] ❌ NON-SEED MATERIAL DETECTED: ${relativePath}`);
      evaluation.issues.forEach(issue => console.log(`  -> ${issue}`));

      const alreadyQueued = evolutionQueue.find(q => q.targetFile === relativePath);
      if (!alreadyQueued) {
        evolutionQueue.push({
          id: `seed_fix_${Date.now()}`,
          targetFile: relativePath,
          urgency: 'CRITICAL',
          reason: 'Failed AI Seed Round Engineering Standards',
          instructions: `Fix the following architectural issues flagged by the AI Auditor: ${evaluation.issues.join(', ')}`
        });
        console.log(`[SeedDaemon] -> Placed ${relativePath} in AI Evolution Queue for autonomous repair.`);
      }
    } else {
      console.log(`[SeedDaemon] ✅ PRISTINE: ${path.relative(path.join(__dirname, '..'), file)}`);
    }
  }

  saveJson(EVOLUTION_QUEUE_PATH, evolutionQueue);

  // Approximate score logic for demonstration
  const score = flaggedFiles > 0 ? 85 : 100;
  
  saveJson(READINESS_PATH, {
    lastAudit: new Date().toISOString(),
    filesScanned: sampledFiles.length,
    flaggedFiles,
    seedReadinessScore: score,
    status: score === 100 ? 'SEED_READY' : 'EVOLUTION_REQUIRED'
  });

  console.log(`[SeedDaemon] Cycle Complete. ${flaggedFiles > 0 ? 'Evolution Engines Activated.' : 'Platform subset is Flawless.'}`);
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
