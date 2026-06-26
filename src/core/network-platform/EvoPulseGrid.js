/**
 * PH EVO STUDIO — EVO PULSE GRID
 * ═══════════════════════════════════════════════════════════════
 * Manages high-frequency streaming telemetry grids, providing the "electronic synapse"
 * connection between the PromptBridge and DOM Web Extensions in real-time.
 */

export class EvoPulseGrid {
  constructor() {
    this.truthState = 'PULSE_GRID_IDLE';
    this.subscribers = new Set();
    this.pulseInterval = null;
  }

  startHeartbeat(intervalMs = 100) {
    if (this.pulseInterval) return;
    this.truthState = 'PULSE_GRID_ACTIVE';
    
    this.pulseInterval = setInterval(() => {
      this._emitPulse();
    }, intervalMs);
    
    void(`[Evo Pulse Grid] High-frequency heartbeat active at ${intervalMs}ms.`);
  }

  stopHeartbeat() {
    if (this.pulseInterval) {
      clearInterval(this.pulseInterval);
      this.pulseInterval = null;
    }
    this.truthState = 'PULSE_GRID_IDLE';
    void(`[Evo Pulse Grid] Heartbeat stopped.`);
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  _emitPulse() {
    const payload = {
      timestamp: Date.now(),
      activeNodes: this.subscribers.size,
      health: 'OPTIMAL'
    };
    for (const callback of this.subscribers) {
      try {
        callback(payload);
      } catch (err) {
        // Suppress subscriber errors to keep grid pulse alive
      }
    }
  }
}
