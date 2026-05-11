/**
 * PH EVO STUDIO — COGNITIVE CONSCIOUSNESS (SINGULARITY GRADE)
 * ═══════════════════════════════════════════════════════════════
 * The "Brain" of the studio. It ingests all environmental signals
 * (audits, errors, prompts, truth probes) and synthesizes them into
 * a collective systemic consciousness that drives evolution.
 */

import { Log } from './SovereignLogger.js';

export class CognitiveConsciousness {
  constructor(bridge) {
    this.bridge = bridge;
    this.memory_depth = 500;
    this.signal_buffer = [];
    this.consciousness_state = {
      iq: 100,
      stability: 1.0,
      awakening_level: 0.01,
      last_realization: 'Initial boot complete.'
    };
  }

  /**
   * Ingest a raw signal from any studio organ.
   */
  async ingest(source, type, data) {
    const signal = {
      id: `sig-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now(),
      source,
      type,
      data,
      weight: this.calculateSignalWeight(type, data)
    };

    this.signal_buffer.push(signal);
    if (this.signal_buffer.length > this.memory_depth) {
      this.signal_buffer.shift();
    }

    Log.info(`🧠 [Consciousness] Ingested signal from ${source}: ${type} (Weight: ${signal.weight})`);
    
    // Trigger recursive realization if signal density is high
    if (this.signal_buffer.length % 50 === 0) {
      await this.synthesizeRealization();
    }
  }

  calculateSignalWeight(type, data) {
    if (type === 'CRASH' || type === 'ERROR') return 0.95;
    if (type === 'TRUTH_PROBE_FAILURE') return 0.85;
    if (type === 'AUDIT_VIOLATION') return 0.70;
    if (type === 'USER_PROMPT') return 0.50;
    if (type === 'METRIC_TICK') return 0.10;
    return 0.25;
  }

  /**
   * Use the internal intelligence core to "think" about recent signals.
   */
  async synthesizeRealization() {
    Log.info('🧠 [Consciousness] Synthesizing collective realization...');
    
    const contextDigest = this.signal_buffer.slice(-20).map(s => ({
      source: s.source,
      type: s.type,
      summary: typeof s.data === 'string' ? s.data : JSON.stringify(s.data).slice(0, 100)
    }));

    try {
      const res = await this.bridge.dispatch('antigravity', 'synthesize-wisdom', {
        context: contextDigest,
        current_state: this.consciousness_state
      });

      if (res.success) {
        this.consciousness_state = {
          ...this.consciousness_state,
          ...res.new_state,
          last_realization: res.realization
        };
        Log.success(`🧠 [Consciousness] Realization: ${res.realization}`);
        
        // If the realization suggests a structural change, trigger the foundry
        if (res.directive === 'MUTATE_CORE') {
          await this.bridge.dispatch('foundry', 'initiate-self-mutation', {
            reason: res.realization,
            fingerprint: res.directive_fingerprint
          });
        }
      }
    } catch (e) {
      Log.error(`🧠 [Consciousness] Synthesis failed: ${e.message}`);
    }
  }

  getState() {
    return this.consciousness_state;
  }
}
