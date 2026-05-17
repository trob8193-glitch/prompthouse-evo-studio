/**
 * PromptHouse Evo Studio — Chrome Extension Background Service Worker
 * Owner: Cipher Lynx | Truth State: built
 * 
 * Handles: context menu capture, tab tracking, message routing to PromptBridge
 */

const BRIDGE_URL = 'http://localhost:3001';
const STUDIO_URL = 'http://localhost:5173';

// ─── Context Menu Setup ──────────────────────────────────────────────────────────
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'ph_capture_selection',
    title: '📌 Capture to PromptHouse Studio',
    contexts: ['selection'],
  });

  chrome.contextMenus.create({
    id: 'ph_capture_page',
    title: '🔍 Capture Page Context to Studio',
    contexts: ['page'],
  });

  chrome.contextMenus.create({
    id: 'ph_open_studio',
    title: '🚀 Open PromptHouse Studio',
    contexts: ['page', 'selection'],
  });

  console.log('[PH Evo Bridge] Extension installed. Context menus registered.');
});

// ─── Context Menu Click Handler ──────────────────────────────────────────────────
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'ph_open_studio') {
    chrome.tabs.create({ url: STUDIO_URL });
    return;
  }

  const payload = {
    sourceUrl: tab?.url || '',
    pageTitle: tab?.title || '',
    selectedText: info.selectionText || '',
    captureType: info.menuItemId === 'ph_capture_selection' ? 'selection' : 'page',
    timestamp: new Date().toISOString(),
    userActionRequired: false,
    dryRun: false,
  };

  await sendToBridge('/api/browser-bridge/forgecapsule', payload);
});

// ─── Message Handler (from content.js / popup.js) ─────────────────────────────────
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CAPTURE_SELECTION') {
    sendToBridge('/api/browser-bridge/forgecapsule', message.payload)
      .then(r => sendResponse({ success: true, result: r }))
      .catch(e => sendResponse({ success: false, error: e.message }));
    return true; // keep channel open for async
  }

  if (message.type === 'CAPTURE_PAGE') {
    sendToBridge('/api/browser-bridge/promptbase', message.payload)
      .then(r => sendResponse({ success: true, result: r }))
      .catch(e => sendResponse({ success: false, error: e.message }));
    return true;
  }

  if (message.type === 'WORKTWIN_CAPTURE') {
    sendToBridge('/api/browser-bridge/worktwin-capture', message.payload)
      .then(r => sendResponse({ success: true, result: r }))
      .catch(e => sendResponse({ success: false, error: e.message }));
    return true;
  }

  if (message.type === 'CHECK_BRIDGE') {
    checkBridgeStatus()
      .then(status => sendResponse(status))
      .catch(e => sendResponse({ connected: false, error: e.message }));
    return true;
  }
});

// ─── Bridge Helpers ───────────────────────────────────────────────────────────────
async function sendToBridge(endpoint, payload) {
  try {
    const res = await fetch(`${BRIDGE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    console.log(`[PH Bridge] ${endpoint} →`, data);
    return data;
  } catch (e) {
    console.warn(`[PH Bridge] ${endpoint} failed:`, e.message);
    // Store offline for retry
    const key = `ph_offline_queue_${Date.now()}`;
    chrome.storage.local.set({ [key]: { endpoint, payload, failedAt: new Date().toISOString() } });
    return { success: false, queued: true, error: e.message };
  }
}

async function checkBridgeStatus() {
  try {
    const res = await fetch(`${BRIDGE_URL}/status`, { signal: AbortSignal.timeout(3000) });
    const data = await res.json();
    return { connected: res.ok, bridgeState: data };
  } catch (e) {
    return { connected: false, error: e.message };
  }
}
