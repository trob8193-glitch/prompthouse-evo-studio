<<<<<<< HEAD
import { bridgeClient } from './services/bridge-client.js';

=======
const BRIDGE_URL = 'http://127.0.0.1:3001';
>>>>>>> main
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
<<<<<<< HEAD
  const result = await bridgeClient.getEvolutionProfile(clientId);
  if (!result.ok) throw new Error(result.error || `Evolution profile failed (${result.status})`);
  return result.data;
=======
  const response = await fetch(`${BRIDGE_URL}/api/evolution/profile?clientId=${encodeURIComponent(clientId)}`, {
    signal: AbortSignal.timeout(4000)
  });
  if (!response.ok) throw new Error(`Evolution profile failed (${response.status})`);
  return response.json();
>>>>>>> main
}

export async function sendEvolutionSignal({
  clientId,
  page = 'dashboard',
  action = 'view',
  intensity = 0.55,
  complexity = 0.5
}) {
<<<<<<< HEAD
  const result = await bridgeClient.sendEvolutionSignal({
    clientId,
    page,
    action,
    intensity,
    complexity
  });
  if (!result.ok) throw new Error(result.error || `Evolution signal failed (${result.status})`);
  return result.data;
=======
  const response = await fetch(`${BRIDGE_URL}/api/evolution/signal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clientId,
      page,
      action,
      intensity,
      complexity
    }),
    signal: AbortSignal.timeout(4000)
  });
  if (!response.ok) throw new Error(`Evolution signal failed (${response.status})`);
  return response.json();
>>>>>>> main
}
