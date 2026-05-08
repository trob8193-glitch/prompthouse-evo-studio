/**
 * PH EVO STUDIO — UNIVERSAL CHAT TRANSPORT (ENTERPRISE PRODUCTION)
 * ═══════════════════════════════════════════════════════════════
 * Tries connections in priority order:
 *   1. Local Bridge (localhost:3001)
 *   2. Custom IP/URL (user-defined)
 *   3. WiFi mDNS discovery (poll known LAN addresses)
 *   4. Bluetooth (Web Bluetooth API — requires user gesture)
 *   5. Offline Queue (IndexedDB — syncs when reconnected)
 *
 * All messages are also captured as training data for Evo LM.
 */

import { addTrainingExample } from './evo-training-collector.js';

const DB_NAME = 'ph_evo_offline_queue';
const DB_VERSION = 1;
const STORE_NAME = 'messages';

// ─── IndexedDB Offline Queue ───────────────────────────────────
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        store.createIndex('status', 'status', { unique: false });
      }
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = () => reject(req.error);
  });
}

async function enqueueOfflineMessage(payload) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.add({ ...payload, status: 'pending', queuedAt: Date.now() });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getPendingMessages() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const idx = store.index('status');
    const req = idx.getAll('pending');
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function markMessageSent(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const getReq = store.get(id);
    getReq.onsuccess = () => {
      const record = getReq.result;
      if (record) {
        record.status = 'sent';
        record.sentAt = Date.now();
        const putReq = store.put(record);
        putReq.onsuccess = () => resolve();
        putReq.onerror = () => reject(putReq.error);
      } else resolve();
    };
    getReq.onerror = () => reject(getReq.error);
  });
}

// ─── Transport Strategies ──────────────────────────────────────

// Strategy 1: Local HTTP Bridge
async function tryLocalBridge(messages, systemPrompt, customUrl) {
  const url = customUrl || localStorage.getItem('ph_evo_bridge_url') || 'http://127.0.0.1:3001';
  const res = await fetch(`${url}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, systemPrompt }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Bridge HTTP ${res.status}`);
  const data = await res.json();
  return { message: data.message || '', transport: 'local_bridge', url };
}

// Strategy 2: Custom IP/URL
async function tryCustomEndpoint(messages, systemPrompt) {
  const stored = JSON.parse(localStorage.getItem('ph_evo_custom_endpoints') || '[]');
  const errors = [];
  for (const endpoint of stored) {
    try {
      const res = await fetch(`${endpoint.url}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(endpoint.apiKey ? { 'Authorization': `Bearer ${endpoint.apiKey}` } : {}),
        },
        body: JSON.stringify({ messages, systemPrompt }),
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return { message: data.message || data.choices?.[0]?.message?.content || '', transport: 'custom_endpoint', url: endpoint.url };
    } catch (err) {
      errors.push(`${endpoint.url}: ${err.message}`);
    }
  }
  throw new Error(`All custom endpoints failed: ${errors.join('; ')}`);
}

// Strategy 3: Evo LM — Local inference via Ollama or bridge /api/evo-lm
async function tryEvoLM(messages, systemPrompt) {
  // 3a. Try Ollama directly (localhost:11434)
  const ollamaModels = ['evo-lm', 'llama3', 'mistral', 'phi3', 'gemma'];
  for (const model of ollamaModels) {
    try {
      const ollamaMessages = systemPrompt
        ? [{ role: 'system', content: systemPrompt }, ...messages]
        : messages;
      const res = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, messages: ollamaMessages, stream: false }),
        signal: AbortSignal.timeout(30000),
      });
      if (!res.ok) continue;
      const data = await res.json();
      const content = data.message?.content || data.response || '';
      if (content) return { message: content, transport: 'evo_lm_ollama', model };
    } catch { continue; }
  }

  // 3b. Try bridge /api/evo-lm endpoint (bridge may proxy to a local model)
  const bridgeUrl = localStorage.getItem('ph_evo_bridge_url') || 'http://127.0.0.1:3001';
  try {
    const res = await fetch(`${bridgeUrl}/api/evo-lm/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, systemPrompt }),
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) throw new Error(`EvoLM bridge returned ${res.status}`);
    const data = await res.json();
    return { message: data.message || '', transport: 'evo_lm_bridge' };
  } catch (err) {
    throw new Error(`Evo LM unavailable: ${err.message}`);
  }
}


async function tryWifiDiscovery(messages, systemPrompt) {
  const knownPorts = [3001, 3002, 8080, 11434]; // 11434 = Ollama
  const hostname = window.location.hostname;
  const baseSubnet = hostname !== 'localhost' && hostname !== '127.0.0.1'
    ? hostname.split('.').slice(0, 3).join('.')
    : null;

  if (!baseSubnet) throw new Error('WiFi discovery requires non-localhost origin');

  // Try the 10 most common LAN IPs on common ports
  const candidates = [];
  for (let i = 1; i <= 10; i++) {
    for (const port of knownPorts) {
      candidates.push(`http://${baseSubnet}.${i}:${port}`);
    }
  }

  const attempts = candidates.map(async (base) => {
    try {
      const res = await fetch(`${base}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, systemPrompt }),
        signal: AbortSignal.timeout(3000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return { message: data.message || '', transport: 'wifi_lan', url: base };
    } catch { return null; }
  });

  const results = await Promise.allSettled(attempts);
  const success = results.find(r => r.status === 'fulfilled' && r.value !== null);
  if (success) return success.value;
  throw new Error('WiFi LAN discovery found no reachable Studio bridge');
}

// Strategy 4: Bluetooth (Web Bluetooth API)
// Communicates with a BLE GATT service on a device running the bridge
async function tryBluetooth(messages, systemPrompt) {
  if (!navigator.bluetooth) throw new Error('Web Bluetooth not supported in this browser');

  const SERVICE_UUID = '12345678-1234-5678-1234-56789abcdef0';
  const CHAR_TX_UUID = '12345678-1234-5678-1234-56789abcdef1'; // write
  const CHAR_RX_UUID = '12345678-1234-5678-1234-56789abcdef2'; // notify

  const device = await navigator.bluetooth.requestDevice({
    filters: [{ services: [SERVICE_UUID] }],
    optionalServices: [SERVICE_UUID],
  });

  const server = await device.gatt.connect();
  const service = await server.getPrimaryService(SERVICE_UUID);
  const txChar = await service.getCharacteristic(CHAR_TX_UUID);
  const rxChar = await service.getCharacteristic(CHAR_RX_UUID);

  return new Promise(async (resolve, reject) => {
    const timeout = setTimeout(() => {
      device.gatt.disconnect();
      reject(new Error('Bluetooth response timeout'));
    }, 15000);

    await rxChar.startNotifications();
    rxChar.addEventListener('characteristicvaluechanged', (e) => {
      clearTimeout(timeout);
      const decoder = new TextDecoder();
      const text = decoder.decode(e.target.value);
      device.gatt.disconnect();
      try {
        const data = JSON.parse(text);
        resolve({ message: data.message || text, transport: 'bluetooth', device: device.name });
      } catch {
        resolve({ message: text, transport: 'bluetooth', device: device.name });
      }
    });

    const encoder = new TextEncoder();
    const payload = JSON.stringify({ messages, systemPrompt });
    // BLE max packet is 512 bytes — chunk if needed
    const chunks = Math.ceil(payload.length / 512);
    for (let i = 0; i < chunks; i++) {
      const chunk = encoder.encode(payload.slice(i * 512, (i + 1) * 512));
      await txChar.writeValue(chunk);
    }
  });
}

// Strategy 5: Offline queue — store and return placeholder
async function queueOffline(messages, systemPrompt) {
  const id = await enqueueOfflineMessage({ messages, systemPrompt });
  return {
    message: `⏳ You are offline. Your message has been queued (ID: ${id}) and will be sent automatically when the Studio reconnects.`,
    transport: 'offline_queue',
    queued: true,
    queueId: id,
  };
}

// ─── Main Universal Send ───────────────────────────────────────
/**
 * Send a chat message using the best available transport.
 * Falls through strategies in priority order.
 *
 * @param {Array} messages - [{role, content}]
 * @param {string} systemPrompt
 * @param {object} options - { preferTransport, customUrl, allowBluetooth, captureTraining }
 * @returns {Promise<{message, transport, url?, device?, queued?}>}
 */
export async function universalSend(messages, systemPrompt = '', options = {}) {
  const {
    preferTransport = 'auto',
    customUrl = null,
    allowBluetooth = false,
    captureTraining = true,
  } = options;

  const strategies = [];

  if (preferTransport === 'bluetooth') {
    strategies.push(['bluetooth', () => tryBluetooth(messages, systemPrompt)]);
  } else {
    strategies.push(
      ['local_bridge', () => tryLocalBridge(messages, systemPrompt, customUrl)],
      ['evo_lm', () => tryEvoLM(messages, systemPrompt)],
      ['custom_endpoint', () => tryCustomEndpoint(messages, systemPrompt)],
      ['wifi_lan', () => tryWifiDiscovery(messages, systemPrompt)],
    );
    if (allowBluetooth) {
      strategies.push(['bluetooth', () => tryBluetooth(messages, systemPrompt)]);
    }
  }

  let lastError = null;
  for (const [name, fn] of strategies) {
    try {
      const result = await fn();
      if (result?.message) {
        // Capture training data
        if (captureTraining) {
          const userMsg = messages.filter(m => m.role === 'user').pop();
          if (userMsg) {
            addTrainingExample({
              input: userMsg.content,
              output: result.message,
              transport: result.transport,
              systemPrompt,
            });
          }
        }
        return result;
      }
    } catch (err) {
      lastError = err;
      console.warn(`[Transport:${name}] Failed:`, err.message);
    }
  }

  // All transports failed — queue offline
  const result = await queueOffline(messages, systemPrompt);
  return result;
}

// ─── Offline Sync (call this when connection is detected) ───────
export async function syncOfflineQueue(options = {}) {
  const pending = await getPendingMessages();
  if (pending.length === 0) return { synced: 0, failed: 0 };

  let synced = 0;
  let failed = 0;

  for (const item of pending) {
    try {
      const result = await universalSend(item.messages, item.systemPrompt, {
        ...options,
        captureTraining: false, // Already captured when originally sent
      });
      if (!result.queued) {
        await markMessageSent(item.id);
        synced++;
      }
    } catch {
      failed++;
    }
  }

  return { synced, failed, total: pending.length };
}

// ─── Connection Probe ──────────────────────────────────────────
export async function probeAllTransports() {
  const results = {};

  // Local bridge
  try {
    const res = await fetch('http://127.0.0.1:3001/status', { signal: AbortSignal.timeout(2000) });
    results.local_bridge = { online: res.ok, url: 'http://127.0.0.1:3001' };
  } catch { results.local_bridge = { online: false }; }

  // Alt port
  try {
    const res = await fetch('http://127.0.0.1:3002/status', { signal: AbortSignal.timeout(2000) });
    results.local_bridge_alt = { online: res.ok, url: 'http://127.0.0.1:3002' };
  } catch { results.local_bridge_alt = { online: false }; }

  // Custom endpoints
  const endpoints = JSON.parse(localStorage.getItem('ph_evo_custom_endpoints') || '[]');
  for (const ep of endpoints) {
    try {
      const res = await fetch(`${ep.url}/status`, { signal: AbortSignal.timeout(3000) });
      results[`custom_${ep.url}`] = { online: res.ok, url: ep.url };
    } catch { results[`custom_${ep.url}`] = { online: false, url: ep.url }; }
  }

  // Bluetooth API availability
  results.bluetooth = { online: !!navigator.bluetooth, note: 'Requires user gesture to connect' };

  // Offline queue count
  try {
    const pending = await getPendingMessages();
    results.offline_queue = { online: true, pending: pending.length };
  } catch { results.offline_queue = { online: false, pending: 0 }; }

  return results;
}

// ─── Endpoint Management ──────────────────────────────────────
export function getCustomEndpoints() {
  return JSON.parse(localStorage.getItem('ph_evo_custom_endpoints') || '[]');
}

export function addCustomEndpoint(endpoint) {
  // endpoint: { url, label, apiKey?, type: 'ip'|'url'|'wifi'|'evo' }
  const endpoints = getCustomEndpoints();
  const existing = endpoints.findIndex(e => e.url === endpoint.url);
  if (existing >= 0) endpoints[existing] = { ...endpoints[existing], ...endpoint };
  else endpoints.push({ ...endpoint, addedAt: Date.now() });
  localStorage.setItem('ph_evo_custom_endpoints', JSON.stringify(endpoints));
  return endpoints;
}

export function removeCustomEndpoint(url) {
  const endpoints = getCustomEndpoints().filter(e => e.url !== url);
  localStorage.setItem('ph_evo_custom_endpoints', JSON.stringify(endpoints));
  return endpoints;
}
