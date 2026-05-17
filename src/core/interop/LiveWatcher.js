/**
 * PH EVO STUDIO — LIVE WORKSPACE WATCHER
 * ═══════════════════════════════════════════════════════════════
 * This module listens for physical file system events and routes 
 * them to the Universal Bridge for instant tool synchronization.
 */

import fs from 'fs';
import path from 'path';
import { Log } from '../autonomy/SovereignLogger.js';
import { UniversalBridge } from './UniversalBridge.js';

export class LiveWatcher {
  constructor() {
    this.bridge = new UniversalBridge();
    this.watchedDirs = [path.join(process.cwd(), 'src')];
  }

  /**
   * Start watching the workspace.
   */
  start() {
    Log.info('👁️ [LiveWatcher] Initializing Workspace Watcher...');
    
    this.watchedDirs.forEach(dir => {
      fs.watch(dir, { recursive: true }, (eventType, filename) => {
        if (filename && eventType === 'change') {
          this.handleEvent(filename);
        }
      });
    });

    Log.success('👁️ [LiveWatcher] Watching all production channels.');
  }

  async handleEvent(filename) {
    Log.info(`👁️ [LiveWatcher] Hot-Link detected event in: ${filename}`);
    
    // PHYSICAL PUSH: Route changes instantly to tool bridges
    if (filename.endsWith('.dart')) {
      await this.bridge.dispatch('flutter', 'sync-and-reload', { file: filename });
    }
    
    if (filename.match(/\.(js|jsx|ts|tsx)$/)) {
      await this.bridge.dispatch('vsc', 'push-context', { file: filename });
      await this.bridge.dispatch('git', 'stage', { file: filename });
    }

    Log.success(`👁️ [LiveWatcher] Hot-Link: ${filename} is now synchronized across all platforms.`);
  }

  /**
   * Physically audit the local network for compatible 'Sovereign' nodes.
   */
  async performGridAudit() {
    Log.info('📡 [LiveWatcher] Probing Local Subnet for Physical Devices...');
    
    return new Promise((resolve) => {
      import('child_process').then(({ exec }) => {
        exec('arp -a', (error, stdout) => {
          if (error) {
            Log.error('📡 [LiveWatcher] Failed to probe network.');
            return resolve([]);
          }

          const lines = stdout.split('\n');
          const results = [];

          lines.forEach(line => {
            const match = line.match(/(\d+\.\d+\.\d+\.\d+)\s+([a-fA-F0-9-]+)\s+(dynamic|static)/);
            if (match) {
              results.push({
                ip: match[1],
                mac: match[2],
                type: 'NETWORK_DEVICE',
                status: 'DETECTED'
              });
            }
          });

          Log.success(`📡 [LiveWatcher] Grid Audit Complete. ${results.length} Physical Devices Identified.`);
          resolve(results);
        });
      });
    });
  }
}

export const LIVE_WATCHER = new LiveWatcher();
