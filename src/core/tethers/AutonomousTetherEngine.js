import { getEvoWiFiStatus } from '../signals/EvoWiFi.js';
import { getMegaTether } from './MegaTetherCore.js';

export class AutonomousTetherEngine {
  constructor(rootDir = process.cwd()) {
    this.rootDir = rootDir;
    this.intervalId = null;
    this.isChecking = false;
    this.lastState = 'unknown';
  }

  startMonitoring(intervalMs = 10000) {
    if (this.intervalId) return;
    console.log('[Tether Engine] Starting continuous signal monitoring...');
    this.intervalId = setInterval(() => this.checkPulse(), intervalMs);
    // Initial check immediately
    this.checkPulse();
  }

  stopMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('[Tether Engine] Monitoring stopped.');
    }
  }

  async checkPulse() {
    if (this.isChecking) return;
    this.isChecking = true;

    try {
      const status = await getEvoWiFiStatus(this.rootDir);
      
      const currentState = status.promptBridgeReachable ? 'online' : 'offline';
      
      if (this.lastState !== currentState) {
        if (this.lastState !== 'unknown') {
          console.log(`[Tether Engine] State transition detected: ${this.lastState} -> ${currentState}`);
        }
        this.lastState = currentState;

        const tether = getMegaTether();
        if (tether) {
          await tether.broadcast('tether_engine', 'network_status_change', {
            previousState: this.lastState,
            currentState,
            status
          });
        }
      }

      if (currentState === 'offline') {
        await this.handleOfflineState(status);
      }
    } catch (err) {
      console.error('[Tether Engine] Pulse check failed:', err.message);
    } finally {
      this.isChecking = false;
    }
  }

  async handleOfflineState(status) {
    // Attempt basic recovery / logging
    // For now, we queue the routing state and broadcast it to MegaTether.
    const tether = getMegaTether();
    if (tether) {
      await tether.broadcast('tether_engine', 'recovery_attempt', {
        action: 'queue_all_tasks',
        reason: 'Bridge is offline. Autonomous recovery shifting to offline queue.',
        timestamp: new Date().toISOString()
      });
    }
    console.log('[Tether Engine] Shifting to offline-queue mode. Receipts will be logged.');
  }
}

// Singleton export
let globalEngine = null;

export function initializeAutonomousTetherEngine(rootDir = process.cwd()) {
  if (!globalEngine) {
    globalEngine = new AutonomousTetherEngine(rootDir);
    globalEngine.startMonitoring();
  }
  return globalEngine;
}
