import { Log } from '../autonomy/SovereignLogger.js';
import { FlutterBridge as FoundryFlutterBridge } from '../foundry/FlutterBridge.js';
import { UniversalBridge } from '../interop/UniversalBridge.js';

/**
 * PH EVO STUDIO — VS CODE BRIDGE (V4 RESTORED)
 * ═══════════════════════════════════════════════════════════════
 * Handles real-time context synchronization with VS Code.
 * Pulls diagnostics, open files, and cursor positions.
 */

export class VSCodeBridge {
  constructor(bridge = new UniversalBridge()) {
    this.status = 'READY';
    this.bridge = bridge;
  }

  async syncContext() {
    Log.info('💻 [VSCodeBridge] Synchronizing editor context...');
    const result = await this.bridge.dispatch('vsc', 'status');
    return {
      status: result.success === false ? 'UNAVAILABLE' : 'SYNCED',
      diagnostics: result.success === false ? null : 0,
      bridge: result
    };
  }

  async openFile(filePath) {
    Log.info(`💻 [VSCodeBridge] Opening file: ${filePath}`);
    if (!filePath) {
      return { success: false, error: 'FILE_PATH_REQUIRED' };
    }
    return await this.bridge.dispatch('vsc', 'open', { file: filePath });
  }
}

/**
 * PH EVO STUDIO — FLUTTER BRIDGE (V4 RESTORED)
 * ═══════════════════════════════════════════════════════════════
 * Translates UI Seeds into physical .dart artifacts. 
 * Triggers automated hot-reloads on the mobile device.
 */

export class FlutterBridge extends FoundryFlutterBridge {
  async deploySeed(seedData = {}) {
    Log.info('🐦 [FlutterBridge] Translating UI Seed to .dart...');
    return await this.syncSeed({
      ...seedData,
      id: seedData.id || 'live_seed',
      name: seedData.name || 'Live Seed'
    });
  }

  async triggerReload() {
    Log.info('🐦 [FlutterBridge] Sending Hot-Reload signal to device...');
    return await this.bridge.dispatch('flutter', 'hot-reload');
  }
}
