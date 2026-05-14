// Browser-safe transport client.
// All provider calls must go through PromptBridge (never ship provider keys to the browser).

const LS_ENDPOINTS = 'ph_evo_custom_endpoints_v1';
const LS_OFFLINE_QUEUE = 'ph_evo_offline_queue_v1';

const DEFAULT_BRIDGE = 'http://127.0.0.1:3001';

function readJson(key, fallback) {
  try {
    if (typeof localStorage === 'undefined') return fallback;
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

function normalizeBaseUrl(url) {
  const u = String(url || '').trim().replace(/\/+$/, '');
  return u || null;
}

async function fetchJson(url, options = {}, timeoutMs = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const msg = (data && (data.error || data.message)) || res.statusText || 'Request failed';
      const err = new Error(msg);
      err.status = res.status;
      throw err;
    }
    return data;
  } finally {
    clearTimeout(timer);
  }
}

export function getCustomEndpoints() {
  const eps = readJson(LS_ENDPOINTS, []);
  if (!Array.isArray(eps)) return [];
  return eps
    .map((e) => ({ url: normalizeBaseUrl(e?.url || e), label: e?.label }))
    .filter((e) => e.url);
}

export function addCustomEndpoint(endpoint) {
  const url = normalizeBaseUrl(endpoint?.url || endpoint);
  if (!url) return;
  const label = endpoint?.label ? String(endpoint.label) : undefined;
  const existing = getCustomEndpoints();
  if (existing.some((e) => e.url === url)) return;
  existing.push({ url, label });
  writeJson(LS_ENDPOINTS, existing);
}

export function removeCustomEndpoint(url) {
  const u = normalizeBaseUrl(url);
  const existing = getCustomEndpoints().filter((e) => e.url !== u);
  writeJson(LS_ENDPOINTS, existing);
}

export async function probeAllTransports() {
  const endpoints = [{ url: DEFAULT_BRIDGE, label: 'Local PromptBridge' }, ...getCustomEndpoints()];
  const results = {};
  await Promise.all(endpoints.map(async (ep) => {
    try {
      const data = await fetchJson(`${ep.url}/status`, {}, 3000);
      results[ep.url] = { ok: true, status: data?.status || 'ok', bridge: data?.bridge || null };
    } catch (e) {
      results[ep.url] = { ok: false, error: e.message };
    }
  }));
  return results;
}

function enqueueOffline(entry) {
  const q = readJson(LS_OFFLINE_QUEUE, []);
  const next = Array.isArray(q) ? q : [];
  next.push(entry);
  writeJson(LS_OFFLINE_QUEUE, next.slice(-200));
}

export async function syncOfflineQueue(options = {}) {
  const q = readJson(LS_OFFLINE_QUEUE, []);
  const queue = Array.isArray(q) ? q : [];
  if (queue.length === 0) return { total: 0, synced: 0, failed: 0 };

  let synced = 0;
  let failed = 0;
  const remaining = [];
  for (const item of queue) {
    try {
      await fetchJson(`${DEFAULT_BRIDGE}/api/evo-lm/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: item.messages || [], systemPrompt: item.systemPrompt || '' }),
      }, 20000);
      synced += 1;
    } catch {
      failed += 1;
      remaining.push(item);
    }
  }

  writeJson(LS_OFFLINE_QUEUE, remaining);
  return { total: queue.length, synced, failed };
}

export async function universalSend(messages, systemPrompt = '', options = {}) {
  const preferTransport = options.preferTransport || 'auto';
  const customUrl = normalizeBaseUrl(options.customUrl);

  const targets = [];
  if (customUrl) targets.push({ url: customUrl, transport: 'custom_bridge' });
  targets.push({ url: DEFAULT_BRIDGE, transport: 'local_bridge' });
  for (const ep of getCustomEndpoints()) targets.push({ url: ep.url, transport: 'custom_bridge' });

  // De-dupe order-preserving.
  const seen = new Set();
  const uniqueTargets = targets.filter((t) => {
    if (seen.has(t.url)) return false;
    seen.add(t.url);
    return true;
  });

  // preferTransport is currently informational; calls always go through a bridge.
  const payload = { messages, systemPrompt, preferTransport };
  for (const t of uniqueTargets) {
    try {
      const data = await fetchJson(`${t.url}/api/evo-lm/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }, 30000);
      return {
        message: data?.message ?? '',
        transport: data?.transport ?? t.transport,
        model: data?.model ?? null,
        queued: false,
      };
    } catch (e) {
      continue;
    }
  }

  // If everything failed, queue offline (client-side) so the user doesn't lose the message.
  enqueueOffline({ ts: Date.now(), messages, systemPrompt });
  return {
    message: 'All bridges unavailable. Message queued offline.',
    transport: 'offline_queue',
    model: null,
    queued: true,
  };
}

