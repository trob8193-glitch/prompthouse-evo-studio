import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const fakePatterns = [
  { pattern: /\bmockData\b/i, label: 'mockData variable' },
  { pattern: /throw new Error\(['"]Not implemented['"]\)/i, label: 'Not Implemented stub' },
];

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    for (const { pattern, label } of fakePatterns) {
      pattern.lastIndex = 0;
      if (pattern.test(content)) {
        return { isClean: false, reason: `Detected: ${label}` };
      }
    }
    
    return { isClean: true };
  } catch (err) {
    return { isClean: false, reason: err.message };
  }
}

function invokeRepairAgent(filePath, reason) {
  return new Promise((resolve) => {
    console.log(`\x1b[31m[CRUCIBLE TARGET] Imperfection detected in ${path.basename(filePath)}: ${reason}\x1b[0m`);
    console.log(`\x1b[33m[CRUCIBLE TARGET] Spawning autonomous repair agent for: ${filePath}\x1b[0m`);
    
    const prompt = `CRITICAL REPAIR: The file ${filePath} failed the Crucible audit because: ${reason}. Rewrite this file to remove all stubs, mocks, and placeholders. Implement the REAL logic.`;
    
    const repairProc = spawn('node', ['agent-runtime.js', prompt], { cwd: rootDir, stdio: 'inherit' });
    
    repairProc.on('close', (code) => {
      console.log(`\x1b[32m[CRUCIBLE TARGET] Repair agent completed self-implementation for ${path.basename(filePath)}.\x1b[0m`);
      resolve();
    });
  });
}

async function runTargets() {
  const targets = process.argv.slice(2);
  
  if (targets.length === 0) {
    console.log('Usage: node crucible-target.mjs <file1> <file2>');
    process.exit(1);
  }

  console.log('\x1b[35m[CRUCIBLE TARGET] Ignited. Targeting specified files for perfection...\x1b[0m');

  for (const target of targets) {
    const filePath = path.resolve(rootDir, target);
    if (!fs.existsSync(filePath)) {
      console.log(`\x1b[31m❌ File not found: ${filePath}\x1b[0m`);
      continue;
    }

    const scanResult = scanFile(filePath);
    
    if (!scanResult.isClean) {
      await invokeRepairAgent(filePath, scanResult.reason);
    } else {
      console.log(`\x1b[32m✅ [CRUCIBLE TARGET] ${target} is perfectly forged.\x1b[0m`);
    }
  }
}

runTargets();
