import { bridgeClient } from './services/bridge-client.js';

const CLIENT_ID_KEY = 'ph_evo_client_id';

function fallbackId() {
  return `client_${Date.now().toString(36)}_${(Date.now() % 1000000).toString(36)}`;
}

export function getEvolutionClientId() {
  try {
    const existing = localStorage.getItem(CLIENT_ID_KEY);
    if (existing) return existing;
    const next = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : fallbackId();
    localStorage.setItem(CLIENT_ID_KEY, next);
    return next;
  } catch {
    return fallbackId();
  }
}

export function applyEvolutionVariables(cssVariables = {}, layoutHints = {}) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  Object.entries(cssVariables || {}).forEach(([key, value]) => {
    if (!key || typeof value === 'undefined' || value === null) return;
    root.style.setProperty(key, String(value));
  });

  if (layoutHints?.motionMode) {
    root.setAttribute('data-evo-motion', String(layoutHints.motionMode));
  }
}

export async function fetchEvolutionProfile(clientId) {
  const result = await bridgeClient.getEvolutionProfile(clientId);
  if (!result.ok) throw new Error(result.error || `Evolution profile failed (${result.status})`);
  return result.data;
}

export async function sendEvolutionSignal({
  clientId,
  page = 'dashboard',
  action = 'view',
  intensity = 0.55,
  complexity = 0.5
}) {
  const result = await bridgeClient.sendEvolutionSignal({
    clientId,
    page,
    action,
    intensity,
    complexity
  });
  if (!result.ok) throw new Error(result.error || `Evolution signal failed (${result.status})`);
  return result.data;
}
