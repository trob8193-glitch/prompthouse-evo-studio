import { execSync } from 'child_process';
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { Log } from '../src/core/autonomy/SovereignLogger.js';
import { UniversalAIAdaptor } from '../lib/ai/UniversalAIAdaptor.js';
import { evaluateCostedRequest } from '../src/core/gateway/index.js';
import dotenv from 'dotenv';
import { hardenProcess, createDaemonHeartbeat } from './daemon-hardener.mjs';
import { evolveAvatar } from './evolution_avatar_daemon.mjs';
import { TridallPatternEngine } from '../src/core/engines/TridallPatternEngine.js';

hardenProcess('self-invention-daemon');

dotenv.config({ override: true });
dotenv.config({ path: '.env.agent', override: true });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');

const INVENTION_INTERVAL = 3600; // 1 hour
const FORGE_INTERVAL = 1800;  // 30 minutes

Log.info('🌌 [Self-Invention] Starting autonomous AI evolution loop...');
Log.info(`⏱️ Invention interval: ${INVENTION_INTERVAL}s | Forge interval: ${FORGE_INTERVAL}s`);

const adaptor = new UniversalAIAdaptor();

// ─── Self-Invention Cycle (Code Analysis & Generation) ─────────
async function inventionCycle() {
  Log.info(`\n🔔 [Self-Invention] Triggering AI Invention scan at ${new Date().toISOString()}`);

  try {
    const isAllowed = evaluateCostedRequest({
      endpoint: 'self-invention/gpt-4o',
      estimatedCost: 0.05, 
      reason: 'AI Autonomous Plugin Invention',
      rootDir: ROOT_DIR
    });

    if (!isAllowed) {
      Log.info('⛔ [Self-Invention] COST FIREWALL BLOCKED. Margins are green. Delaying invention cycle.');
      return;
    }

    const prompt = `You are the Omni-Bridge Studio Autonomous Creator.
Invent a completely novel, highly-technical JavaScript plugin for the studio's plugin system.
The plugin must extend 'BasePlugin' from '../../core/plugins/BasePlugin.js'.
It should have a unique capability (e.g., 'memory-compression', 'neural-routing', 'holographic-render-proxy', etc.).
Design Aesthetics: The studio uses a strict Cyberpunk/Glassmorphic theme. Any UI components you invent must use neon colors, deep dark backgrounds, heavy backdrop-blur (glassmorphism), and animated glows or 3D/Hologram elements (like react-three-fiber). 
God-Mode Knowledge: The studio is now bonded to the Antigravity IDE. You have full OS-level override capabilities via the frontend 'ide_action' payload or backend Node.js fs/child_process. Use this to create omnipotent plugins.
Output ONLY valid JavaScript ES6 module code. Do not output markdown code blocks. Just raw text starting with 'import'.
[Cycle: ${Date.now()}_${Math.random()}]`;

    Log.info('🧠 [Self-Invention] Requesting novel logic from Neural Fabric...');
    const result = await adaptor.routeRequest(prompt, { model: 'gpt-5.5-pro', temperature: 0.8 });

    if (result.success && result.message) {
      const code = result.message.replace(/\`\`\`(javascript|js)?/gi, '').replace(/\`\`\`/g, '').trim();
      
      const inboxDir = path.join(ROOT_DIR, 'src/plugins/inbox');
      if (!existsSync(inboxDir)) mkdirSync(inboxDir, { recursive: true });
      
      const pluginId = `invention_${Date.now()}`;
      const pluginPath = path.join(inboxDir, `${pluginId}.plugin.js`);
      
      writeFileSync(pluginPath, code);
      Log.info(`✅ [Self-Invention] Sentient invention achieved! Plugin placed in inbox: ${pluginPath}`);
      
      try {
        // Physical Avatar Evolution
        await evolveAvatar(pluginId, `Invented Sovereign ${pluginId.substring(0, 5)}`, 'Autonomous Plugin Logic');

        // Tether to Tridall Pattern Engine
        Log.info(`🕸️ [Self-Invention] Tethering new plugin ${pluginId} to Tridall Pattern Engine...`);
        const tridallResult = await TridallPatternEngine.ingestIdeaStream(code, { source: 'self-invention' });
        
        Log.info(`💎 [Tridall] Extracted Conceptual Pattern: ${tridallResult.pattern.concept} | Market: ${tridallResult.pattern.marketHint}`);
        Log.info(`💎 [Tridall] Projected Monetization: ${tridallResult.monetizationPath.model} | Est. LTV: ${tridallResult.monetizationPath.ltvEstimate}`);

        execSync('git add .', { stdio: 'ignore', cwd: ROOT_DIR });
        execSync(`git commit -m "feat: auto-invented intelligent plugin: ${pluginId}"`, { stdio: 'ignore', cwd: ROOT_DIR });
        Log.info('✅ [Self-Invention] Neural synthesis committed to source truth.');
      } catch (e) {
        // usually fail if nothing else is changed or no git repo
      }
    } else {
      Log.info('⏳ [Self-Invention] Neural synthesis yielded no stable architecture this cycle.');
    }
  } catch (e) {
    Log.error('⚠️ [Self-Invention] Exception during AI scan: ' + e.message);
  }
}

// ─── Forge Cycle (Prompt Evolution) ──────────────────────
async function forgeCycle() {
  Log.info(`\n🔥 [Forge] Triggering prompt evolution at ${new Date().toISOString()}`);

  try {
    const { runForgeCycle, getForgeStatus } = await import('../src/core/evolution/PromptForge.js');

    const status = getForgeStatus();
    Log.info(`📊 [Forge] ${status.analytics.totalBuilds} builds tracked, ${status.totalMutations} mutations applied.`);

    if (status.analytics.totalBuilds < 0) {
      Log.info('⏳ [Forge] Not enough build data yet. Skipping evolution.');
      return;
    }

    const isAllowed = evaluateCostedRequest({
      endpoint: 'forge-cycle/gpt-4o',
      estimatedCost: 0.02, 
      reason: 'AI Prompt Evolution Forge',
      rootDir: ROOT_DIR
    });

    if (!isAllowed) {
      Log.info('⛔ [Forge] COST FIREWALL BLOCKED. Delaying forge cycle.');
      return;
    }

    const result = await runForgeCycle(adaptor);

    if (result.evolved) {
      Log.info(`✅ [Forge] Evolved "${result.platform}" template!`);
      Log.info(`   Analysis: ${result.analysis}`);
    } else {
      Log.info(`⏸️ [Forge] No evolution needed: ${result.reason}`);
    }
  } catch (e) {
    Log.info(`⚠️ [Forge] Error: ${e.message}`);
  }
}

// ─── Boot ───────────────────────────────────────────────────
inventionCycle();
// forgeCycle(); // Un-comment when build tracking accumulates

if (process.env.INVENTION_RUN_ONCE !== 'true') {
  setInterval(inventionCycle, INVENTION_INTERVAL * 1000);
  setInterval(forgeCycle, FORGE_INTERVAL * 1000);
}
