#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { Log } from '../src/core/autonomy/SovereignLogger.js';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config({ override: true });

function copyFolderSync(from, to) {
  if (!fs.existsSync(to)) fs.mkdirSync(to, { recursive: true });
  fs.readdirSync(from).forEach(element => {
    if (['node_modules', '.git', '.prompthouse-data'].includes(element)) return; // Skip heavy/state dirs
    const source = path.join(from, element);
    const target = path.join(to, element);
    if (fs.lstatSync(source).isFile()) {
      fs.copyFileSync(source, target);
    } else {
      copyFolderSync(source, target);
    }
  });
}

function cloneAndEvolve(agentName) {
  Log.info(`\n🧬 [CLONE PROTOCOL] Initiating mitosis for new agent: ${agentName}...`);
  const sourceDir = process.cwd();
  const targetDir = path.join(sourceDir, '..', `prompthouse-evo-${agentName}`);

  if (fs.existsSync(targetDir)) {
    Log.error(`⛔ Target directory already exists: ${targetDir}`);
    return;
  }

  Log.info(`📂 Copying architecture to ${targetDir}...`);
  copyFolderSync(sourceDir, targetDir);

  Log.info(`⚙️ Mutating environment vectors...`);
  const envAgentPath = path.join(targetDir, '.env.agent');
  const newAgentId = `asst_${crypto.randomBytes(12).toString('hex')}`;
  
  let envAgentContent = `AGENT_ID=${newAgentId}\n`;
  envAgentContent += `AGENT_NAME=${agentName}\n`;
  envAgentContent += `OPENAI_API_KEY=${process.env.OPENAI_API_KEY}\n`;
  
  fs.writeFileSync(envAgentPath, envAgentContent, 'utf8');

  Log.info(`🧠 [EVOLUTION] Bootstrapping autonomous neural pathways...`);
  try {
    execSync(`npm install`, { cwd: targetDir, stdio: 'ignore' });
    Log.info(`✅ Dependencies synchronized.`);
  } catch (e) {
    Log.info(`⚠️ NPM install failed or skipped.`);
  }

  Log.info(`\n🚀 [CLONE PROTOCOL COMPLETE]`);
  Log.info(`The new agent "${agentName}" has been spawned successfully.`);
  Log.info(`To activate it, run:`);
  Log.info(`  cd ../prompthouse-evo-${agentName}`);
  Log.info(`  npm run dev:all`);
}

const args = process.argv.slice(2);
const agentName = args[0] || `alpha-${Math.floor(Math.random() * 1000)}`;
cloneAndEvolve(agentName);
