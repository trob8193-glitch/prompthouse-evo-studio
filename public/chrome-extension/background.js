/**
 * PH EVO STUDIO — CHROME EXTENSION BACKGROUND SERVICE WORKER
 * ═══════════════════════════════════════════════════════════════
 * Handles: context menus, message routing, training capture,
 * connection probing, and bridge communication.
 */

const BRIDGE_URLS = [
  'http://127.0.0.1:3001',
  'http://127.0.0.1:3002',
];
const OLLAMA_URL = 'http://localhost:11434';

// ─── State ────────────────────────────────────────────────────
let activeBridgeUrl = null;
let trainingEnabled = true;

// ─── Find Active Bridge ────────────────────────────────────────
async function findActiveBridge() {
  for (const url of BRIDGE_URLS) {
    try {
      const res = await fetch(`${url}/status`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) { activeBridgeUrl = url; return url; }
    } catch { continue; }
  }
  // Try custom endpoints from storage
  const { customEndpoints = [] } = await chrome.storage.local.get('customEndpoints');
  for (const ep of customEndpoints) {
    try {
      const res = await fetch(`${ep.url}/status`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) { activeBridgeUrl = ep.url; return ep.url; }
    } catch { continue; }
  }
  return null;
}

// ─── Send Chat Message ────────────────────────────────────────
async function sendChatMessage(messages, systemPrompt = '', botId = null) {
  // Try local bridge first
  const bridge = await findActiveBridge();
  if (bridge) {
    try {
      const res = await fetch(`${bridge}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, systemPrompt, botId }),
        signal: AbortSignal.timeout(30000),
      });
      if (res.ok) {
        const data = await res.json();
        const result = { message: data.message || '', transport: 'local_bridge', url: bridge };
        await captureTraining(messages, result.message, systemPrompt, 'browser_extension');
        return result;
      }
    } catch { /* fall through */ }
  }

  // Try Evo LM via Ollama
  const ollamaModels = ['evo-lm', 'llama3', 'mistral', 'phi3'];
  for (const model of ollamaModels) {
    try {
      const ollamaMessages = systemPrompt
        ? [{ role: 'system', content: systemPrompt }, ...messages]
        : messages;
      const res = await fetch(`${OLLAMA_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, messages: ollamaMessages, stream: false }),
        signal: AbortSignal.timeout(30000),
      });
      if (res.ok) {
        const data = await res.json();
        const content = data.message?.content || data.response || '';
        if (content) {
          await captureTraining(messages, content, systemPrompt, 'browser_extension_evo_lm');
          return { message: content, transport: 'evo_lm_ollama', model };
        }
      }
    } catch { continue; }
  }

  // Queue offline in extension storage
  const { offlineQueue = [] } = await chrome.storage.local.get('offlineQueue');
  offlineQueue.push({ messages, systemPrompt, botId, queuedAt: Date.now() });
  await chrome.storage.local.set({ offlineQueue });
  return { message: '⏳ Offline — message queued. Will send when bridge reconnects.', transport: 'offline_queue', queued: true };
}

// ─── Training Capture ─────────────────────────────────────────
async function captureTraining(messages, response, systemPrompt, source) {
  const { trainingEnabled: enabled = true } = await chrome.storage.local.get('trainingEnabled');
  if (!enabled) return;

  const userMsg = messages.filter(m => m.role === 'user').pop();
  if (!userMsg || !response) return;

  // Redact secrets
  const redact = t => t
    .replace(/sk-[A-Za-z0-9_-]{20,}/g, '[REDACTED]')
    .replace(/ph_evo_[A-Za-z0-9]+/g, '[REDACTED]')
    .replace(/Bearer\s+\S{20,}/g, '[REDACTED]');

  const example = {
    input: redact(userMsg.content),
    output: redact(response),
    systemPrompt: redact(systemPrompt || ''),
    source,
    timestamp: Date.now(),
  };

  const { trainingData = [] } = await chrome.storage.local.get('trainingData');
  trainingData.push(example);
  // Keep last 2000 examples in extension storage
  await chrome.storage.local.set({ trainingData: trainingData.slice(-2000) });
}

// ─── Context Menus ────────────────────────────────────────────
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({ id: 'send_to_studio', title: '🚀 Send to PH Evo Studio', contexts: ['selection', 'page'] });
  chrome.contextMenus.create({ id: 'ask_bot_evo', title: '🦁 Ask Evo (Master)', contexts: ['selection'] });
  chrome.contextMenus.create({ id: 'ask_bot_dev', title: '🐆 Ask Dev (Code Builder)', contexts: ['selection'] });
  chrome.contextMenus.create({ id: 'ask_bot_verifier', title: '🦉 Ask Verifier (Proof Checker)', contexts: ['selection'] });
  chrome.contextMenus.create({ id: 'capture_training', title: '🧠 Capture as Training Data', contexts: ['selection'] });
  chrome.contextMenus.create({ id: 'sep1', type: 'separator', contexts: ['selection'] });
  chrome.contextMenus.create({ id: 'open_panel', title: '📱 Open PH Evo Side Panel', contexts: ['page', 'selection'] });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const text = info.selectionText || '';

  if (info.menuItemId === 'capture_training') {
    // Store as a raw capture for later annotation
    const { captures = [] } = await chrome.storage.local.get('captures');
    captures.push({ text, url: info.pageUrl, capturedAt: Date.now() });
    await chrome.storage.local.set({ captures: captures.slice(-500) });
    chrome.notifications.create({ type: 'basic', iconUrl: 'icons/icon48.png', title: 'PH Evo', message: `Captured: "${text.slice(0, 60)}..."` });
    return;
  }

  if (info.menuItemId === 'send_to_studio') {
    // Send captured context to bridge
    const bridge = activeBridgeUrl || await findActiveBridge();
    if (bridge) {
      await fetch(`${bridge}/api/capture`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, url: info.pageUrl, tabTitle: tab?.title, source: 'chrome_extension' }),
      }).catch(() => {});
    }
    chrome.notifications.create({ type: 'basic', iconUrl: 'icons/icon48.png', title: 'PH Evo', message: 'Context sent to Studio.' });
    return;
  }

  if (info.menuItemId === 'open_panel') {
    chrome.sidePanel.open({ tabId: tab.id });
    return;
  }

  // Bot-specific ask
  const botMap = {
    ask_bot_evo:      { id: 'evo',      name: 'Evo',      prompt: 'You are Evo (Lion), the master orchestrator of PH Evo Studio. Respond with sovereign authority.' },
    ask_bot_dev:      { id: 'dev',      name: 'Dev',      prompt: 'You are Dev (Leopard), the code builder of PH Evo Studio. Provide clean, production-ready code.' },
    ask_bot_verifier: { id: 'verifier', name: 'Verifier', prompt: 'You are Verifier (Owl), the proof checker. Analyze and validate the following with precision.' },
  };

  const bot = botMap[info.menuItemId];
  if (bot && text) {
    const result = await sendChatMessage(
      [{ role: 'user', content: text }],
      bot.prompt,
      bot.id
    );
    // Store the response so popup can display it
    const { recentResponse = [] } = await chrome.storage.local.get('recentResponse');
    recentResponse.unshift({ bot: bot.name, input: text, output: result.message, transport: result.transport, timestamp: Date.now() });
    await chrome.storage.local.set({ recentResponse: recentResponse.slice(0, 20) });
    chrome.notifications.create({ type: 'basic', iconUrl: 'icons/icon48.png', title: `${bot.name} responded`, message: result.message.slice(0, 100) });
  }
});

// ─── Message Handler (from popup, content, panel) ─────────────
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'CHAT') {
    sendChatMessage(msg.messages, msg.systemPrompt, msg.botId)
      .then(result => sendResponse({ success: true, ...result }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true; // keep channel open
  }

  if (msg.type === 'PROBE') {
    findActiveBridge()
      .then(url => sendResponse({ success: true, bridge: url, hasOllama: !!OLLAMA_URL }))
      .catch(() => sendResponse({ success: false }));
    return true;
  }

  if (msg.type === 'GET_TRAINING_STATS') {
    chrome.storage.local.get(['trainingData', 'captures', 'offlineQueue'])
      .then(({ trainingData = [], captures = [], offlineQueue = [] }) => {
        sendResponse({ total: trainingData.length, captures: captures.length, queued: offlineQueue.length });
      });
    return true;
  }

  if (msg.type === 'EXPORT_TRAINING') {
    chrome.storage.local.get('trainingData')
      .then(({ trainingData = [] }) => sendResponse({ data: trainingData }));
    return true;
  }

  if (msg.type === 'PUSH_TRAINING') {
    chrome.storage.local.get(['trainingData', 'trainingEnabled'])
      .then(async ({ trainingData = [] }) => {
        const bridge = activeBridgeUrl || await findActiveBridge();
        if (!bridge) { sendResponse({ success: false, error: 'No bridge' }); return; }
        try {
          const res = await fetch(`${bridge}/api/training/ingest`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ examples: trainingData, source: 'browser_extension' }),
          });
          if (res.ok) {
            sendResponse({ success: true, pushed: trainingData.length });
          } else {
            sendResponse({ success: false, error: `HTTP ${res.status}` });
          }
        } catch (err) {
          sendResponse({ success: false, error: err.message });
        }
      });
    return true;
  }

  if (msg.type === 'SYNC_OFFLINE') {
    chrome.storage.local.get('offlineQueue')
      .then(async ({ offlineQueue = [] }) => {
        let synced = 0;
        const remaining = [];
        for (const item of offlineQueue) {
          try {
            const result = await sendChatMessage(item.messages, item.systemPrompt, item.botId);
            if (!result.queued) { synced++; } else { remaining.push(item); }
          } catch { remaining.push(item); }
        }
        await chrome.storage.local.set({ offlineQueue: remaining });
        sendResponse({ synced, remaining: remaining.length });
      });
    return true;
  }
});

// ─── Periodic offline sync ─────────────────────────────────────
chrome.alarms.create('offline_sync', { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'offline_sync') {
    const { offlineQueue = [] } = await chrome.storage.local.get('offlineQueue');
    if (offlineQueue.length === 0) return;
    const bridge = await findActiveBridge();
    if (!bridge) return;
    const remaining = [];
    for (const item of offlineQueue) {
      try {
        const result = await sendChatMessage(item.messages, item.systemPrompt, item.botId);
        if (result.queued) remaining.push(item);
      } catch { remaining.push(item); }
    }
    if (remaining.length < offlineQueue.length) {
      await chrome.storage.local.set({ offlineQueue: remaining });
    }
  }
});
