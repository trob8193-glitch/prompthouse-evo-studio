import { initializeMegaTether } from '../src/core/tethers/MegaTetherCore.js';
import { Log } from '../src/core/autonomy/SovereignLogger.js';
import fs from 'fs';
import path from 'path';

// Mock DB and IntelligenceCore just to initialize the tether for an override broadcast
const mockDb = {};
const mockIntel = {};

async function runOverride() {
  Log.info('\x1b[36m[Antigravity] Initializing MegaTether for Override Broadcast...\x1b[0m');
  const tether = initializeMegaTether(mockDb, mockIntel);

  Log.info('\x1b[35m[Antigravity] Injecting manual SINGULARITY_OVERRIDE signal...\x1b[0m');
  
  await tether.broadcast('antigravity_cli', 'SINGULARITY_OVERRIDE', {
    action: 'REBOOT_ENGINE',
    fallbackModel: 'gemini-1.5-pro',
    bypassOllama: true,
    reason: 'Developer Manual Intervention - Ollama Crash Detected'
  });

  Log.success('\x1b[32m[Antigravity] Signal dispatched. Clearing blocked state files...\x1b[0m');

  const singularityStateFile = path.join(process.cwd(), '.prompthouse-data', 'daemons', 'singularity_state.json');
  if (fs.existsSync(singularityStateFile)) {
    try {
      const state = JSON.parse(fs.readFileSync(singularityStateFile, 'utf8'));
      state.halted = false;
      state.active = true;
      state.lastError = null;
      fs.writeFileSync(singularityStateFile, JSON.stringify(state, null, 2), 'utf8');
      Log.success('\x1b[32m[Antigravity] Singularity state file unblocked.\x1b[0m');
    } catch (e) {
      Log.error('\x1b[31m[Antigravity] Failed to clear singularity state: ' + e.message + '\x1b[0m');
    }
  }

  Log.success('\x1b[32m[Antigravity] Override Complete. Singularity engine rebooting on Gemini/OpenAI cloud fallback.\x1b[0m');
  process.exit(0);
}

runOverride();
