#!/usr/bin/env node
import { fileURLToPath } from 'url';
import path from 'path';
import { getAppIntelligenceStatus, getAppIntelligenceContract, ingestAppIntelligenceSource } from '../src/core/evo-llm/EvoAppIntelligenceBridge.js';
import { EvoIntelligenceTetherCore } from '../src/core/evo-llm/EvoIntelligenceTetherCore.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const args = process.argv.slice(2);

async function run() {
  if (args.includes('--status')) {
    const status = getAppIntelligenceStatus({ rootDir });
    console.log(JSON.stringify(status, null, 2));
    process.exit(0);
  }

  if (args.includes('--contract')) {
    const contract = getAppIntelligenceContract();
    console.log(JSON.stringify(contract, null, 2));
    process.exit(0);
  }

  if (args.includes('--cycle-test')) {
    console.log('[Evo] Booting full Tether Core cycle...');
    const tether = new EvoIntelligenceTetherCore(rootDir);
    const result = await tether.cycleAppIntelligenceSource({
      sourceType: 'user-observation',
      summary: 'CLI triggered test of App Intelligence',
      uiPattern: 'CLI-Test-Pattern',
      appDomain: 'Studio-CLI',
      featureTarget: 'Test-Execution'
    });
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  }

  console.log(`
Usage:
  node scripts/evo_app_intelligence.mjs [options]

Options:
  --status        View App Intelligence readiness and metrics
  --contract      View App Intelligence API contract
  --cycle-test    Run a full tether integration test cycle
  `);
}

run().catch(console.error);
