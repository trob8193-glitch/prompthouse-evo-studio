import { Log } from '../autonomy/SovereignLogger.js';
import { SelfForge } from '../autonomy/SelfForge.js';
import { BRIDGE_URL } from '../../config/bridge-config.js';

const ACTIVE_BRIDGE_URL = typeof process !== 'undefined' && process.env?.PROMPTBRIDGE_URL
  ? process.env.PROMPTBRIDGE_URL
  : BRIDGE_URL;

async function recordHealingProbe(filePath) {
  try {
    await fetch(`${ACTIVE_BRIDGE_URL}/api/evo-ledger/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        feature_id: 'self-healer',
        action: 'permission_probe',
        truth_state: 'LOCAL_PROBE_RECORDED',
        iq_gain: 0,
        proof_hash: filePath
      })
    });
  } catch (err) {
    Log.warn(`[SelfHealer] Bridge ledger unavailable. Healing probe stayed local: ${err.message}`);
  }
}

export class SelfHealer {
  constructor({ forge = new SelfForge() } = {}) {
    this.forge = forge;
    this.lastAction = null;
  }

  async execute(params = {}) {
    const targetFiles = Array.isArray(params.targetFiles) ? params.targetFiles : [];
    Log.info(`[SelfHealer] Initiating repair cycle for ${targetFiles.length || 'all'} detected faults.`);

    try {
      const repairs = [];

      for (const filePath of targetFiles) {
        Log.info(`[SelfHealer] Forging repair for: ${filePath}`);
        await recordHealingProbe(filePath);

        const gap = { file: filePath, violation: 'drift_detected', severity: 'CRITICAL' };
        await this.forge.forge(gap);
        repairs.push({ file: filePath, status: 'MANIFESTED' });
      }

      const result = {
        success: true,
        timestamp: new Date().toISOString(),
        repairedCount: repairs.length,
        repairs,
        status: 'MANIFESTED'
      };

      this.lastAction = result;
      return result;
    } catch (error) {
      Log.error(`[SelfHealer] Healing execution failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}

export default SelfHealer;
