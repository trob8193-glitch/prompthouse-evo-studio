/**
 * EVO BRIDGE — BACKGROUND SERVICE WORKER v3.0
 * ═══════════════════════════════════════════════════════════════
 * The sovereign brain of the extension. Runs 24/7 in the background.
 * Handles: Self-evolution loop, NightForge sync, alarm scheduling,
 * context menu wiring, badge state, and cross-tab messaging.
 */

const BRIDGE = 'http://127.0.0.1:3001';
let upgradeReady = false;
let studioIQ = 0;
let evolutionCycle = 0;

// ─── SELF-EVOLUTION ALARM ───────────────────────────────────────
chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create('evo-heartbeat', { periodInMinutes: 1 });
  chrome.alarms.create('nightforge-sync', { periodInMinutes: 60 });
  chrome.alarms.create('upgrade-check', { periodInMinutes: 5 });
  setupContextMenus();
  console.log('[EVO BRIDGE] Installed. Sovereign evolution loop armed.');
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'evo-heartbeat') await heartbeat();
  if (alarm.name === 'nightforge-sync') await nightforgeSync();
  if (alarm.name === 'upgrade-check') await checkUpgradeReady();
});

// ─── HEARTBEAT: Polls bridge status every 1 min ─────────────────
async function heartbeat() {
  try {
    const res = await fetch(`${BRIDGE}/api/evo-runtime/status`, { signal: AbortSignal.timeout(5000) });
    const data = await res.json();
    studioIQ = data.studio_iq || studioIQ;
    evolutionCycle = data.cycle || evolutionCycle;

    // Update badge
    const iq = studioIQ >= 1000000 ? `${(studioIQ/1000000).toFixed(1)}M` : `${Math.round(studioIQ/1000)}K`;
    chrome.action.setBadgeText({ text: upgradeReady ? '🔺' : 'LIVE' });
    chrome.action.setBadgeBackgroundColor({ color: upgradeReady ? '#6366f1' : '#10b981' });

    // Notify all content scripts
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      try {
        chrome.tabs.sendMessage(tab.id, { type: 'BRIDGE_STATUS', online: true, iq: studioIQ, upgradeReady });
      } catch (_) {}
    }
  } catch (e) {
    chrome.action.setBadgeText({ text: 'OFF' });
    chrome.action.setBadgeBackgroundColor({ color: '#ef4444' });
  }
}

// ─── NIGHTFORGE SYNC: Pulls evolution proposals from bridge ─────
async function nightforgeSync() {
  try {
    const res = await fetch(`${BRIDGE}/api/build-review-gate`, { signal: AbortSignal.timeout(8000) });
    const data = await res.json();
    if (data?.proposed_upgrades?.length > 0) {
      upgradeReady = true;
      chrome.notifications.create('upgrade-ready', {
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: '🔺 EVO STUDIO UPGRADE READY',
        message: `NightForge has staged ${data.proposed_upgrades.length} structural upgrades. Open Evo Bridge to apply.`,
        priority: 2
      });
    }
  } catch (_) {}
}

// ─── UPGRADE CHECK: Checks Sovereign IQ threshold ───────────────
async function checkUpgradeReady() {
  try {
    const res = await fetch(`${BRIDGE}/api/sovereign/reload-brain`, { signal: AbortSignal.timeout(5000) });
    const brain = await res.json();
    if (brain?.studio_iq > 1200000) {
      upgradeReady = true;
      chrome.storage.local.set({ upgradeReady: true, studioIQ: brain.studio_iq });
    }
  } catch (_) {}
}

// ─── CONTEXT MENUS ──────────────────────────────────────────────
function setupContextMenus() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({ id: 'evo-root', title: '🧠 Evo Studio', contexts: ['all'] });
    chrome.contextMenus.create({ id: 'evo-capture', parentId: 'evo-root', title: '📡 Capture to Studio', contexts: ['all'] });
    chrome.contextMenus.create({ id: 'evo-inject', parentId: 'evo-root', title: '⚡ Inject Best Prompt', contexts: ['editable'] });
    chrome.contextMenus.create({ id: 'evo-snipe-bug', parentId: 'evo-root', title: '🎯 Bug Sniper on Selection', contexts: ['selection'] });
    chrome.contextMenus.create({ id: 'evo-summarize', parentId: 'evo-root', title: '📋 Summarize & Store', contexts: ['selection', 'page'] });
    chrome.contextMenus.create({ id: 'evo-prove', parentId: 'evo-root', title: '✅ Send to Proof Console', contexts: ['selection'] });
    chrome.contextMenus.create({ id: 'evo-train', parentId: 'evo-root', title: '🌱 Seed to Evo Tree', contexts: ['selection', 'page'] });
    chrome.contextMenus.create({ id: 'evo-twin', parentId: 'evo-root', title: '👁️ Open Reality Twin', contexts: ['page'] });
    chrome.contextMenus.create({ id: 'evo-upgrade', parentId: 'evo-root', title: '🔺 Apply Studio Upgrade', contexts: ['all'] });
  });
}

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const text = info.selectionText || '';
  const url = tab?.url || '';

  const actions = {
    'evo-capture': () => capturePageToStudio(tab),
    'evo-inject': () => injectBestPrompt(tab),
    'evo-snipe-bug': () => bugSniperOnSelection(text, url, tab),
    'evo-summarize': () => summarizeAndStore(text || url, tab),
    'evo-prove': () => sendToProofConsole(text, tab),
    'evo-train': () => seedToEvoTree(text || url, tab),
    'evo-twin': () => openRealityTwin(tab),
    'evo-upgrade': () => applyStudioUpgrade(tab)
  };

  if (actions[info.menuItemId]) await actions[info.menuItemId]();
});

// ─── COMMANDS (Keyboard Shortcuts) ──────────────────────────────
chrome.commands.onCommand.addListener(async (command) => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (command === 'capture-context') await capturePageToStudio(tab);
  if (command === 'inject-prompt') await injectBestPrompt(tab);
  if (command === 'open-sentient-chat') await openSentientChat(tab);
  if (command === 'bug-sniper') await bugSniperOnSelection('', tab?.url, tab);
});

// ─── ACTION HANDLERS ────────────────────────────────────────────
async function capturePageToStudio(tab) {
  try {
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => ({
        url: location.href,
        title: document.title,
        text: document.body?.innerText?.slice(0, 15000),
        html: document.documentElement?.outerHTML?.slice(0, 8000),
        meta: Array.from(document.querySelectorAll('meta')).map(m => ({ name: m.name || m.getAttribute('property'), content: m.content })),
        links: Array.from(document.querySelectorAll('a[href]')).slice(0, 50).map(a => ({ text: a.innerText, href: a.href })),
        inputs: Array.from(document.querySelectorAll('input,textarea')).slice(0, 20).map(i => ({ type: i.type, name: i.name, id: i.id })),
        errors: window.__evoErrors || []
      })
    });
    await fetch(`${BRIDGE}/api/browser-bridge/worktwin-capture`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...result.result, capturedAt: new Date().toISOString(), source: 'evo-bridge-v3' })
    });
    chrome.tabs.sendMessage(tab.id, { type: 'EVO_TOAST', msg: '📡 Context captured to Evo Studio', color: '#10b981' });
  } catch (e) { console.error('[EVO] Capture failed:', e); }
}

async function injectBestPrompt(tab) {
  try {
    const res = await fetch(`${BRIDGE}/api/browser-bridge/promptbase`);
    const prompts = await res.json();
    const best = prompts.filter(p => p.status === 'pending').sort((a, b) => (b.score || 0) - (a.score || 0))[0];
    if (!best) return;
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (prompt) => {
        const el = document.activeElement || document.querySelector('textarea,[contenteditable="true"],input[type="text"]');
        if (!el) return;
        if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') el.value = prompt;
        else el.innerText = prompt;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      },
      args: [best.prompt]
    });
    chrome.tabs.sendMessage(tab.id, { type: 'EVO_TOAST', msg: '⚡ Best prompt injected', color: '#6366f1' });
  } catch (e) { console.error('[EVO] Inject failed:', e); }
}

async function bugSniperOnSelection(text, url, tab) {
  try {
    const res = await fetch(`${BRIDGE}/api/repair`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ context: text, url, source: 'bug-sniper', useAI: true })
    });
    const data = await res.json();
    chrome.tabs.sendMessage(tab.id, { type: 'BUG_SNIPER_RESULT', result: data });
    chrome.tabs.sendMessage(tab.id, { type: 'EVO_TOAST', msg: `🎯 Bug Sniper: ${data.diagnosis || 'Analysis sent to studio'}`, color: '#f59e0b' });
  } catch (e) { console.error('[EVO] Bug sniper failed:', e); }
}

async function summarizeAndStore(text, tab) {
  try {
    await fetch(`${BRIDGE}/api/browser-bridge/forgecapsule`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: text, url: tab?.url, action: 'summarize', timestamp: new Date().toISOString() })
    });
    chrome.tabs.sendMessage(tab.id, { type: 'EVO_TOAST', msg: '📋 Summarized & stored to Evo Brain', color: '#10b981' });
  } catch (e) {}
}

async function sendToProofConsole(text, tab) {
  try {
    await fetch(`${BRIDGE}/api/browser-bridge/proof`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ claim: text, url: tab?.url, evidenceType: 'browser_selection', timestamp: new Date().toISOString() })
    });
    chrome.tabs.sendMessage(tab.id, { type: 'EVO_TOAST', msg: '✅ Sent to Proof Console', color: '#22d3ee' });
  } catch (e) {}
}

async function seedToEvoTree(text, tab) {
  try {
    await fetch(`${BRIDGE}/api/studio-os/foundry/train`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ corpus: text, source: 'browser-capture', url: tab?.url, timestamp: new Date().toISOString() })
    });
    chrome.tabs.sendMessage(tab.id, { type: 'EVO_TOAST', msg: '🌱 Seeded to Evo Tree', color: '#a855f7' });
  } catch (e) {}
}

async function openRealityTwin(tab) {
  chrome.windows.create({ url: `http://localhost:5173/os/reality-twin?url=${encodeURIComponent(tab?.url)}`, type: 'popup', width: 1200, height: 800 });
}

async function openSentientChat(tab) {
  chrome.tabs.sendMessage(tab.id, { type: 'OPEN_SENTIENT_CHAT' });
}

async function applyStudioUpgrade(tab) {
  try {
    await fetch(`${BRIDGE}/api/self-implementation/cycle`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ trigger: 'user-manual' }) });
    upgradeReady = false;
    chrome.storage.local.set({ upgradeReady: false });
    chrome.tabs.sendMessage(tab.id, { type: 'EVO_TOAST', msg: '🔺 Studio upgrade applied! Reload to see changes.', color: '#6366f1' });
  } catch (e) {}
}

// Boot heartbeat immediately
heartbeat();
