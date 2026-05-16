import { Log } from './core/autonomy/SovereignLogger.js';

const BRIDGE_URL = 'http://127.0.0.1:3001';

async function callNightforge(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const res = await fetch(`${BRIDGE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await res.json().catch(() => null);
  if (!res.ok) {
    const error = payload?.error || payload?.message || `Request failed (${res.status})`;
    throw new Error(error);
  }
  return payload;
}

export class Nightforge {
  async execute(params = {}) {
    Log.info('[NightForge] Executing real daemon cycle...');
    const result = await runNightForgeCycle(params);
    return { success: true, timestamp: new Date().toISOString(), result };
  }

  async getStatus() {
    const status = await getNightForgeStatus();
    return status.state;
  }
}

export async function getNightForgeStatus() {
  return callNightforge('/api/nightforge/status');
}

export async function getNightForgeMetrics() {
  return callNightforge('/api/nightforge/metrics');
}

export async function getNightForgeSettings() {
  return callNightforge('/api/nightforge/settings');
}

export async function updateNightForgeSettings(partial = {}) {
  return callNightforge('/api/nightforge/settings', {
    method: 'POST',
    body: partial,
  });
}

export async function runNightForgeCycle(params = {}) {
  const {
    objective,
    orgId = 'org_test',
    includeProviders = ['evo_lm', 'openai', 'gemini'],
    forceThreeProviderTeam = false,
    train = true,
    useLiveStudio = true,
    mode = 'cost_guarded',
    scanLimit = 60,
  } = params || {};

  const payload = await callNightforge('/api/nightforge/cycle', {
    method: 'POST',
    body: {
      objective,
      orgId,
      includeProviders,
      forceThreeProviderTeam,
      train,
      useLiveStudio,
      mode,
      scanLimit,
    },
  });

  return payload.result;
}

export async function stopNightForge() {
  return callNightforge('/api/nightforge/daemon/stop', {
    method: 'POST',
    body: {},
  });
}

export async function startNightForge(params = {}) {
  const {
    intervalMinutes = 360,
    orgId = 'org_test',
    includeProviders = ['evo_lm', 'openai', 'gemini'],
    forceThreeProviderTeam = false,
    train = true,
    useLiveStudio = true,
    mode = 'cost_guarded',
    runNow = true,
  } = params || {};

  return callNightforge('/api/nightforge/daemon/start', {
    method: 'POST',
    body: {
      intervalMinutes,
      orgId,
      includeProviders,
      forceThreeProviderTeam,
      train,
      useLiveStudio,
      mode,
      runNow,
    },
  });
}
