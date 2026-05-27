#!/usr/bin/env node

/**
 * Verify PromptHouse Evo Agent Setup
 * Run: node verify-agent-setup.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CHECKS = [
  {
    name: 'OPENAI_API_KEY in .env',
    check: () => {
      const env = fs.readFileSync('.env', 'utf8');
      return env.includes('OPENAI_API_KEY=sk-');
    }
  },
  {
    name: 'openai-agent-modern.js exists',
    check: () => fs.existsSync('openai-agent-modern.js')
  },
  {
    name: 'agent-runtime.js exists',
    check: () => fs.existsSync('agent-runtime.js')
  },
  {
    name: 'agent-integration.js exists',
    check: () => fs.existsSync('agent-integration.js')
  },
  {
    name: 'integrate-agent.js exists',
    check: () => fs.existsSync('integrate-agent.js')
  },
  {
    name: 'npm scripts configured',
    check: () => {
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      return pkg.scripts['create:agent'] && pkg.scripts['agent:repl'];
    }
  },
  {
    name: '@openai/agents package installed',
    check: () => {
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      return pkg.dependencies['@openai/agents'] || pkg.devDependencies['@openai/agents'];
    }
  },
  {
    name: 'Documentation files created',
    check: () => {
      return fs.existsSync('SETUP_OPENAI_AGENT.md') &&
             fs.existsSync('QUICKSTART_AGENT.md') &&
             fs.existsSync('AGENT_QUICK_REFERENCE.md') &&
             fs.existsSync('AGENT_SETUP_COMPLETE.md');
    }
  }
];

console.log('\n🔍 PromptHouse Evo Agent Setup Verification\n');
console.log('═'.repeat(50) + '\n');

let passed = 0;
let failed = 0;

CHECKS.forEach((check, i) => {
  try {
    const result = check.check();
    if (result) {
      console.log(`✅ ${i + 1}. ${check.name}`);
      passed++;
    } else {
      console.log(`❌ ${i + 1}. ${check.name}`);
      failed++;
    }
  } catch (err) {
    console.log(`⚠️  ${i + 1}. ${check.name} (${err.message})`);
    failed++;
  }
});

console.log('\n' + '═'.repeat(50));
console.log(`\nResults: ${passed} passed, ${failed} failed\n`);

if (failed === 0) {
  console.log('🚀 All checks passed! Ready to create the agent.\n');
  console.log('Next steps:');
  console.log('  1. npm run create:agent');
  console.log('  2. npm run test:agent');
  console.log('  3. npm run agent:repl\n');
  process.exit(0);
} else {
  console.log('⚠️  Some checks failed. Review above and try again.\n');
  process.exit(1);
}
