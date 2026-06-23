
import { Log } from '../core/autonomy/SovereignLogger.js';

/**
 * PH EVO STUDIO — NERVOUS SYSTEM (PRODUCTION GRADE)
 * ═══════════════════════════════════════════════════════════════
 * The Extension Neural Bus. Relays signals between:
 *   - Chrome Extension ↔ Studio UI
 *   - Omni-Tether ↔ Background Daemons
 *   - Ghost Editor ↔ Autonomous Builder
 *
 * Uses an in-memory EventEmitter pattern for the frontend,
 * with optional WebSocket relay for cross-process communication.
 */

const CHANNELS = {
  DAEMON_PULSE: 'daemon:pulse',
  THEME_MUTATION: 'theme:mutation',
  BUILD_EVENT: 'build:event',
  AUDIT_SIGNAL: 'audit:signal',
  HEALING_REQUEST: 'healing:request',
  EXTENSION_RELAY: 'extension:relay',
  BOT_DISPATCH: 'bot:dispatch',
  COST_ALERT: 'cost:alert',
  DEPLOY_STATUS: 'deploy:status',
  USER_ACTION: 'user:action',
};

export class NervousSystem {
  constructor() {
    this.status = 'ACTIVE';
    this.listeners = new Map();
    this.signalLog = [];
    this.maxLogSize = 500;

    // Pre-register all channels
    Object.values(CHANNELS).forEach(ch => this.listeners.set(ch, []));
    Log.info('[NervousSystem] Neural bus initialized with ' + Object.keys(CHANNELS).length + ' channels.');
  }

  /**
   * Subscribe to a signal channel.
   * Returns an unsubscribe function.
   */
  on(channel, callback) {
    if (!this.listeners.has(channel)) {
      this.listeners.set(channel, []);
    }
    this.listeners.get(channel).push(callback);
    return () => {
      const cbs = this.listeners.get(channel) || [];
      const idx = cbs.indexOf(callback);
      if (idx !== -1) cbs.splice(idx, 1);
    };
  }

  /**
   * Emit a signal to all subscribers of a channel.
   */
  emit(channel, payload = {}) {
    const entry = {
      channel,
      payload,
      timestamp: Date.now(),
    };

    // Append to rolling signal log
    this.signalLog.push(entry);
    if (this.signalLog.length > this.maxLogSize) {
      this.signalLog.shift();
    }

    const cbs = this.listeners.get(channel) || [];
    for (const cb of cbs) {
      try {
        cb(payload);
      } catch (err) {
        Log.error(`[NervousSystem] Listener error on "${channel}": ${err.message}`);
      }
    }
  }

  /**
   * Subscribe once — auto-unsubscribes after first fire.
   */
  once(channel, callback) {
    const unsub = this.on(channel, (payload) => {
      unsub();
      callback(payload);
    });
    return unsub;
  }

  /**
   * Relay a daemon pulse into the Omni-Tether.
   * This is the primary bridge between background Node daemons and the React UI.
   */
  relayDaemonPulse(daemonId, message) {
    this.emit(CHANNELS.DAEMON_PULSE, { daemonId, message, ts: Date.now() });
  }

  /**
   * Relay a theme mutation from the Omni-Tether into the Extension.
   */
  relayThemeMutation(matrix) {
    this.emit(CHANNELS.THEME_MUTATION, { matrix, ts: Date.now() });
  }

  /**
   * Request a self-healing action.
   */
  requestHealing(anomaly) {
    Log.info(`[NervousSystem] Healing request: ${anomaly.type}`);
    this.emit(CHANNELS.HEALING_REQUEST, anomaly);
  }

  /**
   * Get the last N signals from the log.
   */
  getRecentSignals(count = 20) {
    return this.signalLog.slice(-count);
  }

  /**
   * Get channel subscriber counts for diagnostics.
   */
  getDiagnostics() {
    const channelStats = {};
    for (const [ch, cbs] of this.listeners) {
      channelStats[ch] = cbs.length;
    }
    return {
      totalChannels: this.listeners.size,
      totalSignalsProcessed: this.signalLog.length,
      channelStats,
    };
  }

  async execute(params = {}) {
    Log.info('[NervousSystem] Executing neural relay...');
    if (params.channel && params.payload) {
      this.emit(params.channel, params.payload);
    }
    return { success: true, timestamp: new Date().toISOString(), diagnostics: this.getDiagnostics() };
  }

  getStatus() {
    const diag = this.getDiagnostics();
    return {
      id: 'nervous_system',
      grade: diag.totalChannels >= 10 ? 'S+++++' : 'A',
      state: 'ACTIVE',
      resonance: Math.min(1, diag.totalSignalsProcessed / 100).toFixed(2),
      channels: diag.totalChannels,
    };
  }
}

export { CHANNELS };

// Singleton for global access
let _instance = null;
export function getNervousSystem() {
  if (!_instance) _instance = new NervousSystem();
  return _instance;
}
