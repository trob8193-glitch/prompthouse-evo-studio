import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { Log } from '../src/core/autonomy/SovereignLogger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');

const INVENTION_INTERVAL = 3600; // 1 hour
const FORGE_INTERVAL = 1800;  // 30 minutes

Log.info('🌌 [Self-Invention] Starting autonomous evolution loop...');
Log.info(`⏱️ Invention interval: ${INVENTION_INTERVAL}s | Forge interval: ${FORGE_INTERVAL}s`);

// ─── Self-Invention Cycle (Code Analysis) ───────────────────
async function inventionCycle() {
  Log.info(`\n🔔 [Self-Invention] Triggering code scan at ${new Date().toISOString()}`);

  try {
    const result = execSync('python scripts/analyze_tools.py', { encoding: 'utf-8', timeout: 30000, cwd: ROOT_DIR }).trim();

    if (result && result !== 'none') {
      Log.info(`✅ [Self-Invention] Improvements found: ${result}`);
      try {
        execSync('git add .', { stdio: 'ignore', cwd: ROOT_DIR });
        execSync(`git commit -m "feat: auto-invented improvements: ${result}"`, { stdio: 'ignore', cwd: ROOT_DIR });
        Log.info('✅ [Self-Invention] Committed locally.');
      } catch (e) {
        Log.info('⚠️ [Self-Invention] Nothing to commit.');
      }
    } else {
      Log.info('⏳ [Self-Invention] No improvements needed at this time.');
    }
  } catch (e) {
    Log.info('⚠️ [Self-Invention] Analyzer unavailable, skipping cycle.');
  }
}

// ─── Forge Cycle (Prompt Evolution) ──────────────────────
async function forgeCycle() {
  Log.info(`\n🔥 [Forge] Triggering prompt evolution at ${new Date().toISOString()}`);

  try {
    // Dynamic import to get the latest version of the modules
    const { runForgeCycle, getForgeStatus } = await import(
      '../src/core/evolution/PromptForge.js'
    );
    const { UniversalAIAdaptor } = await import(
      '../lib/ai/UniversalAIAdaptor.js'
    );

    // Load API keys from .env
    const dotenv = await import('dotenv');
    dotenv.config({ path: path.join(ROOT_DIR, '.env') });

    const adaptor = new UniversalAIAdaptor({
      openai: process.env.OPENAI_API_KEY || '',
      gemini: process.env.GEMINI_API_KEY || ''
    });

    // Check status first
    const status = getForgeStatus();
    Log.info(`📊 [Forge] ${status.analytics.totalBuilds} builds tracked, ${status.totalMutations} mutations applied.`);

    if (status.analytics.totalBuilds < 3) {
      Log.info('⏳ [Forge] Not enough build data yet. Skipping evolution.');
      return;
    }

    // Run evolution cycle
    const result = await runForgeCycle(adaptor);

    if (result.evolved) {
      Log.info(`✅ [Forge] Evolved "${result.platform}" template!`);
      Log.info(`   Analysis: ${result.analysis}`);
      Log.info(`   Changes: ${result.changes?.join(', ')}`);
      Log.info(`   Previous rate: ${result.previousRate}%`);
    } else {
      Log.info(`⏸️ [Forge] No evolution needed: ${result.reason}`);
    }
  } catch (e) {
    Log.info(`⚠️ [Forge] Error: ${e.message}`);
  }
}

// ─── Boot ───────────────────────────────────────────────────
inventionCycle();
forgeCycle();

// setInterval(inventionCycle, INVENTION_INTERVAL * 1000);
// setInterval(forgeCycle, FORGE_INTERVAL * 1000);
