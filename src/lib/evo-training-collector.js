/**
 * PH EVO STUDIO — EVO LM TRAINING COLLECTOR (ENTERPRISE PRODUCTION)
 * ═══════════════════════════════════════════════════════════════
 * Captures every AI interaction as a training example for Evo LM.
 * Data is stored locally in IndexedDB and can be exported or synced
 * to the bridge for global training. Consent-gated.
 *
 * Training data format: JSONL (one example per line)
 * Schema: { input, output, systemPrompt, transport, source, timestamp }
 */

const DB_NAME = 'ph_evo_training';
const DB_VERSION = 1;
const STORE_EXAMPLES = 'examples';
const STORE_SESSIONS = 'sessions';

function openTrainingDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_EXAMPLES)) {
        const ex = db.createObjectStore(STORE_EXAMPLES, { keyPath: 'id', autoIncrement: true });
        ex.createIndex('source', 'source', { unique: false });
        ex.createIndex('timestamp', 'timestamp', { unique: false });
        ex.createIndex('exported', 'exported', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_SESSIONS)) {
        db.createObjectStore(STORE_SESSIONS, { keyPath: 'id', autoIncrement: true });
      }
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = () => reject(req.error);
  });
}

// ─── Check Consent ────────────────────────────────────────────
export function isTrainingEnabled() {
  return localStorage.getItem('ph_evo_training_consent') === 'true';
}

export function setTrainingConsent(enabled) {
  localStorage.setItem('ph_evo_training_consent', enabled ? 'true' : 'false');
}

// ─── Capture Example ──────────────────────────────────────────
export async function addTrainingExample({ input, output, systemPrompt = '', transport = 'unknown', source = 'studio_chat', metadata = {} }) {
  if (!isTrainingEnabled()) return null;
  if (!input || !output) return null;

  // Redact secrets from training data
  const clean = (text) => text
    .replace(/sk-[A-Za-z0-9_-]{20,}/g, '[REDACTED_KEY]')
    .replace(/ph_evo_[A-Za-z0-9]+/g, '[REDACTED_EVO_KEY]')
    .replace(/Bearer\s+\S{20,}/g, '[REDACTED_BEARER]')
    .replace(/password\s*[:=]\s*\S+/gi, 'password=[REDACTED]');

  const example = {
    input: clean(input),
    output: clean(output),
    systemPrompt: clean(systemPrompt),
    transport,
    source, // 'studio_chat' | 'browser_extension' | 'desktop_extension' | 'bot_duel' | 'forge'
    exported: false,
    timestamp: Date.now(),
    metadata,
  };

  try {
    const db = await openTrainingDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_EXAMPLES, 'readwrite');
      const store = tx.objectStore(STORE_EXAMPLES);
      const req = store.add(example);
      req.onsuccess = () => resolve({ ...example, id: req.result });
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[Training] Failed to save example:', err.message);
    return null;
  }
}

// ─── Get Examples ─────────────────────────────────────────────
export async function getAllTrainingExamples({ limit = 500, source = null } = {}) {
  const db = await openTrainingDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_EXAMPLES, 'readonly');
    const store = tx.objectStore(STORE_EXAMPLES);
    const req = store.getAll();
    req.onsuccess = () => {
      let results = req.result;
      if (source) results = results.filter(r => r.source === source);
      results.sort((a, b) => b.timestamp - a.timestamp);
      resolve(results.slice(0, limit));
    };
    req.onerror = () => reject(req.error);
  });
}

export async function getTrainingStats() {
  const db = await openTrainingDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_EXAMPLES, 'readonly');
    const store = tx.objectStore(STORE_EXAMPLES);
    const req = store.getAll();
    req.onsuccess = () => {
      const all = req.result;
      const bySource = {};
      all.forEach(e => {
        bySource[e.source] = (bySource[e.source] || 0) + 1;
      });
      resolve({
        total: all.length,
        exported: all.filter(e => e.exported).length,
        pending: all.filter(e => !e.exported).length,
        bySource,
      });
    };
    req.onerror = () => reject(req.error);
  });
}

// ─── Export as JSONL ──────────────────────────────────────────
export async function exportTrainingJSONL() {
  const examples = await getAllTrainingExamples({ limit: 10000 });
  // OpenAI fine-tuning format
  const jsonl = examples.map(ex => JSON.stringify({
    messages: [
      { role: 'system', content: ex.systemPrompt || 'You are PH Evo Studio — a sovereign-grade AI assistant.' },
      { role: 'user', content: ex.input },
      { role: 'assistant', content: ex.output },
    ]
  })).join('\n');

  const blob = new Blob([jsonl], { type: 'application/jsonl' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `evo_training_${Date.now()}.jsonl`;
  a.click();
  URL.revokeObjectURL(url);

  return { exported: examples.length };
}

// ─── Push to Bridge for Global Training ───────────────────────
export async function pushTrainingToBridge(bridgeUrl = 'http://127.0.0.1:3001') {
  const pending = await getAllTrainingExamples({ limit: 1000 });
  const unexported = pending.filter(e => !e.exported);
  if (unexported.length === 0) return { pushed: 0 };

  try {
    const res = await fetch(`${bridgeUrl}/api/training/ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ examples: unexported }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`Bridge returned ${res.status}`);
    const data = await res.json();

    // Mark as exported
    const db = await openTrainingDB();
    const tx = db.transaction(STORE_EXAMPLES, 'readwrite');
    const store = tx.objectStore(STORE_EXAMPLES);
    for (const ex of unexported) {
      const getReq = store.get(ex.id);
      getReq.onsuccess = () => {
        const r = getReq.result;
        if (r) { r.exported = true; store.put(r); }
      };
    }

    return { pushed: unexported.length, bridgeResponse: data };
  } catch (err) {
    throw new Error(`Training push failed: ${err.message}`);
  }
}

// ─── Clear ────────────────────────────────────────────────────
export async function clearTrainingData() {
  const db = await openTrainingDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_EXAMPLES, 'readwrite');
    const store = tx.objectStore(STORE_EXAMPLES);
    const req = store.clear();
    req.onsuccess = () => resolve({ cleared: true });
    req.onerror = () => reject(req.error);
  });
}
