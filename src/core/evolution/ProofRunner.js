import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { Log } from '../autonomy/SovereignLogger.js';

export async function runProofCommands({ workspaceDir, commands, receiptDir }) {
  fs.mkdirSync(receiptDir, { recursive: true });
  
  let passed = true;
  const results = [];

  for (const cmd of commands) {
    try {
      Log.info(`\x1b[36m[ProofRunner] Running: ${cmd}\x1b[0m`);
      const output = execSync(cmd, { cwd: workspaceDir, encoding: 'utf-8', stdio: 'pipe' });
      results.push({ cmd, success: true, output });
    } catch (e) {
      Log.error(`\x1b[31m[ProofRunner] Failed: ${cmd}\x1b[0m`);
      results.push({ cmd, success: false, error: e.message, output: e.stdout || e.stderr });
      passed = false;
      break; // Stop on first failure
    }
  }

  const receiptPath = path.join(receiptDir, `proof-${Date.now()}.json`);
  fs.writeFileSync(receiptPath, JSON.stringify({ passed, results, timestamp: new Date().toISOString() }, null, 2));

  return { passed, receiptPath, results };
}
