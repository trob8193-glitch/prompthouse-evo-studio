#!/usr/bin/env node
import { fileURLToPath } from 'url';
import path from 'path';
import { EvoGitLedger } from '../src/core/evo-llm/EvoGitLedger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const args = process.argv.slice(2);
const ledger = new EvoGitLedger(rootDir);

if (args.includes('--log')) {
  console.log('\x1b[35m[Evo Git] Immutable AI Ledger History\x1b[0m');
  const commits = ledger.getLedgerLog();
  if (commits.length === 0) {
    console.log('No AI commits found in the immutable ledger.');
  } else {
    commits.forEach(c => {
      console.log(`\x1b[33mcommit ${c.commitId}\x1b[0m`);
      console.log(`Author: ${c.author}`);
      console.log(`Date:   ${c.timestamp}`);
      console.log(`Target: ${c.targetFile}`);
      console.log(`Pre:    ${c.preHash}`);
      console.log(`Post:   ${c.postHash}`);
      console.log(`\n    ${c.intention}\n`);
    });
  }
  process.exit(0);
}

if (args.includes('--verify')) {
  console.log('\x1b[36m[Evo Git] Cryptographically verifying AI ledger state...\x1b[0m');
  const result = ledger.verifyLedgerIntegrity();
  if (result.intact) {
    console.log(`\x1b[32m✅ INTEGRITY INTACT: ${result.fileCount} tracked files perfectly match their last AI commit hashes.\x1b[0m`);
  } else {
    console.log(`\x1b[31m🚨 INTEGRITY BROKEN: Changes were made outside the Evo Autonomous Loop.\x1b[0m`);
    result.failures.forEach(f => {
      console.log(`  -> ${f.file} (${f.state})`);
      console.log(`     Expected: ${f.expectedHash}`);
      console.log(`     Current:  ${f.currentHash || 'MISSING'}`);
    });
  }
  process.exit(result.intact ? 0 : 1);
}

console.log(`
Usage:
  node scripts/evo_git.mjs [options]

Options:
  --log        View the append-only, tamper-proof AI commit history
  --verify     Cryptographically verify if files were changed outside the Evo Loop
`);
