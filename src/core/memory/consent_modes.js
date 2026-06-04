/**
 * ConsentModes — Manages user consent levels for data collection and AI training
 * Status: ACTIVE
 *
 * Modes:
 *   STRICT    — No data leaves local device. All telemetry and training disabled.
 *   ANONYMOUS — Aggregated, anonymised telemetry only. No PII or prompt content shared.
 *   FULL      — Full consent for model-training feedback loops and analytics.
 */

const VALID_MODES = ['STRICT', 'ANONYMOUS', 'FULL'];

const DATA_PERMISSIONS = {
  STRICT: {
    telemetry: false,
    promptCapture: false,
    modelTraining: false,
    usageAnalytics: false,
    errorReporting: false
  },
  ANONYMOUS: {
    telemetry: true,
    promptCapture: false,
    modelTraining: false,
    usageAnalytics: true,
    errorReporting: true
  },
  FULL: {
    telemetry: true,
    promptCapture: true,
    modelTraining: true,
    usageAnalytics: true,
    errorReporting: true
  }
};

export class ConsentModes {
  constructor(initialMode = 'STRICT') {
    this.name = 'ConsentModes';
    this.description = 'Manages user consent levels for data collection and AI training';
    this.status = 'ACTIVE';
    this.mode = VALID_MODES.includes(initialMode) ? initialMode : 'STRICT';
    this.history = [{ mode: this.mode, changedAt: new Date().toISOString() }];
  }

  setConsentMode(mode) {
    if (!VALID_MODES.includes(mode)) {
      return { success: false, reason: `Invalid mode: ${mode}. Valid modes: ${VALID_MODES.join(', ')}` };
    }
    this.mode = mode;
    this.history.push({ mode, changedAt: new Date().toISOString() });
    return { success: true, mode };
  }

  getConsentMode() {
    return this.mode;
  }

  canCollect(dataType) {
    const perms = DATA_PERMISSIONS[this.mode];
    if (!perms) return false;
    return perms[dataType] === true;
  }

  getPermissions() {
    return { ...DATA_PERMISSIONS[this.mode] };
  }

  getHistory() {
    return this.history;
  }

  getStatus() {
    return {
      id: this.name,
      grade: 'A',
      state: this.status,
      resonance: 100,
      description: this.description,
      currentMode: this.mode
    };
  }
}

