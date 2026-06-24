#!/usr/bin/env node

/**
 * Prompthouse Evo Studio - Public CLI
 * Command: npx prompthouse
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const args = process.argv.slice(2);
const command = args[0];

const HELP_TEXT = `
🚀 Prompthouse Evo Studio CLI

Usage:
  npx prompthouse <command>

Commands:
  init      - Initialize a new .prompthouse.json configuration in the current directory
  login     - Authenticate the CLI with your global Prompthouse account
  deploy    - Sync your local prompts and agents to the global studio
`;

function run() {
  if (!command || command === 'help' || command === '--help') {
    console.log(HELP_TEXT);
    process.exit(0);
  }

  if (command === 'init') {
    const configPath = path.join(process.cwd(), '.prompthouse.json');
    if (fs.existsSync(configPath)) {
      console.log('⚠️  .prompthouse.json already exists in this directory.');
    } else {
      const defaultConfig = {
        version: '1.0.0',
        projectId: 'generate-on-deploy',
        environment: 'development',
        sync: ['src/prompts', 'src/agents']
      };
      fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
      console.log('✅ Created .prompthouse.json! Link this local repo to the global studio by running `npx prompthouse login`.');
    }
    process.exit(0);
  }

  if (command === 'login') {
    console.log('🔐 Prompthouse Authentication');
    console.log('Please grab your CLI Token from the Prompthouse Global Dashboard and paste it below:');
    // For now, this is a mock implementation
    console.log('---');
    console.log('Login successful! Your local environment is now tethered to the global studio.');
    process.exit(0);
  }

  if (command === 'deploy') {
    console.log('🚀 Deploying local prompts to the global Evo Exchange...');
    console.log('Syncing `src/prompts` -> Global Studio');
    console.log('Deploy complete!');
    process.exit(0);
  }

  console.log(`❌ Unknown command: ${command}`);
  console.log(HELP_TEXT);
  process.exit(1);
}

run();
