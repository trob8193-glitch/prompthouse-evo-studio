/**
 * EVO BRIDGE — POPUP.JS v3.0
 * ═══════════════════════════════════════════════════════════════
 * Full wiring: every button, mode, and capability tile is live.
 * Connects to PromptBridge (localhost:3001) and OpenAI API.
 * Self-evolution loop: reads NightForge state, shows upgrade banner.
 */

const BRIDGE = 'http://localhost:3001';
let currentMode = 'capture';
let activeTab = null;
let bridgeOnline = false;

// ─── HELPERS ────────────────────────────────────────────────────
function log(msg, type = 'ok') {
  const console = document.getElementById('console');
  const line = document.createElement('div');
  line.className = `log-line ${type}`;
  line.textContent = `> ${new Date().toLocaleTimeString()} ${msg}`;
  console.appendChild(line);
  console.scrollTop = console.scrollHeight;
  document.getElementById('footer-log').textContent = msg;
}

function setStatus(online) {
  const el = document.getElementById('status');
  bridgeOnline = online;
  if (online) { el.textContent = 'LIVE'; el.className = 'status-pill live'; }
  else { el.textContent = 'OFFLINE'; el.className = 'status-pill offline'; }
}

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function sendToContent(msg) {
  if (!activeTab) return;
  try { await chrome.tabs.sendMessage(activeTab.id, msg); } catch (_) {}
}

// ─── BRIDGE CONNECTION CHECK ────────────────────────────────────
async function checkBridge() {
  try {
    const res = await fetch(`${BRIDGE}/status`, { signal: AbortSignal.timeout(3000) });
    const data = await res.json();
    setStatus(true);
    document.getElementById('val-bridge').textContent = 'LIVE';
    document.getElementById('val-iq').textContent = data.studio_iq
      ? `${(data.studio_iq / 1000000).toFixed(2)}M`
      : data.iq || '—';
    document.getElementById('val-cycle').textContent = data.cycle || data.total_paragrams || '—';
    log('[BRIDGE] Connected. Sovereign systems nominal.', 'ok');
    return data;
  } catch (e) {
    setStatus(false);
    document.getElementById('val-bridge').textContent = 'DOWN';
    log('[BRIDGE] Offline — check localhost:3001', 'err');
    return null;
  }
}

// ─── UPGRADE BANNER LOGIC ───────────────────────────────────────
async function checkUpgrade() {
  try {
    const stored = await chrome.storage.local.get(['upgradeReady', 'studioIQ']);
    if (stored.upgradeReady) {
      document.getElementById('upgrade-banner').classList.add('visible');
      document.body.classList.add('upgrade-ready');
      log('[NIGHTFORGE] Structural upgrade staged. Click APPLY NOW.', 'warn');
    }
    // Also hit the bridge directly
    const res = await fetch(`${BRIDGE}/api/build-review-gate`, { signal: AbortSignal.timeout(3000) });
    const data = await res.json();
    if (data?.proposed_upgrades?.length > 0) {
      document.getElementById('upgrade-banner').classList.add('visible');
      document.body.classList.add('upgrade-ready');
    }
  } catch (_) {}
}

// ─── MODE SELECTOR ──────────────────────────────────────────────
document.querySelectorAll('.mode-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentMode = btn.dataset.mode;

    const labels = {
      capture: '📡 CAPTURE CONTEXT TO STUDIO',
      inject:  '⚡ INJECT BEST PROMPT',
      audit:   '🔍 RUN SURFACE AUDIT',
      repair:  '🔧 TRIGGER SELF-REPAIR',
      train:   '🌱 SEED PAGE TO EVO TREE',
      proof:   '✅ SEND TO PROOF CONSOLE',
      twin:    '👁️ OPEN REALITY TWIN',
      chat:    '🧠 OPEN SENTIENT CHAT',
      deploy:  '🚀 TRIGGER DEPLOY PIPELINE',
      evolve:  '🔺 RUN SELF-EVOLUTION CYCLE'
    };
    document.getElementById('btn-primary-action').textContent = labels[currentMode] || '📡 EXECUTE';
    log(`Mode: ${currentMode.toUpperCase()}`, 'info');
  });
});

// ─── CAPABILITY TILES ───────────────────────────────────────────
document.querySelectorAll('.cap-tile').forEach(tile => {
  tile.addEventListener('click', () => {
    tile.classList.toggle('active');
    log(`Cap: ${tile.dataset.cap} ${tile.classList.contains('active') ? 'ON' : 'OFF'}`, 'info');
  });
});

// ─── PRIMARY BUTTON ─────────────────────────────────────────────
document.getElementById('btn-primary-action').addEventListener('click', async () => {
  const prompt = document.getElementById('prompt-input').value.trim();
  activeTab = await getActiveTab();

  const actions = {
    capture: captureContext,
    inject:  injectPrompt,
    audit:   runSurfaceAudit,
    repair:  triggerRepair,
    train:   seedToEvo,
    proof:   sendToProof,
    twin:    openTwin,
    chat:    openChat,
    deploy:  triggerDeploy,
    evolve:  runSelfEvolve
  };

  if (actions[currentMode]) await actions[currentMode](prompt);
});

// ─── BUTTON WIRING ──────────────────────────────────────────────
document.getElementById('btn-inject').addEventListener('click', async () => {
  activeTab = await getActiveTab(); await injectPrompt();
});
document.getElementById('btn-bug').addEventListener('click', async () => {
  activeTab = await getActiveTab(); await runBugSniper();
});
document.getElementById('btn-chat').addEventListener('click', async () => {
  activeTab = await getActiveTab(); await openChat();
});
document.getElementById('btn-train').addEventListener('click', async () => {
  activeTab = await getActiveTab(); await seedToEvo(document.getElementById('prompt-input').value);
});
document.getElementById('btn-proof').addEventListener('click', async () => {
  activeTab = await getActiveTab(); await sendToProof(document.getElementById('prompt-input').value);
});
document.getElementById('btn-twin').addEventListener('click', async () => {
  activeTab = await getActiveTab(); await openTwin();
});
document.getElementById('btn-summarize').addEventListener('click', async () => {
  activeTab = await getActiveTab(); await summarizePage();
});
document.getElementById('btn-open-studio').addEventListener('click', () => {
  chrome.tabs.create({ url: 'http://localhost:5173' });
});
document.getElementById('btn-self-evolve').addEventListener('click', async () => {
  await runSelfEvolve();
});
document.getElementById('btn-apply-upgrade').addEventListener('click', async () => {
  await applyUpgrade();
});

// ─── ACTION IMPLEMENTATIONS ─────────────────────────────────────
async function captureContext(extra = '') {
  log('[DOM] Capturing page context...', 'info');
  try {
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: activeTab.id },
      func: () => ({
        url: location.href, title: document.title,
        text: document.body?.innerText?.slice(0, 12000),
        html: document.documentElement?.outerHTML?.slice(0, 6000),
        errors: window.__evoErrors || [],
        forms: Array.from(document.forms).map(f => f.id || f.name),
        links: Array.from(document.querySelectorAll('a')).slice(0,30).map(a => a.href)
      })
    });
    await fetch(`${BRIDGE}/api/browser-bridge/worktwin-capture`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...result.result, extra, capturedAt: new Date().toISOString() })
    });
    log('[DOM] Context captured ✓', 'ok');
    await sendToContent({ type: 'EVO_TOAST', msg: '📡 Captured to Evo Studio', color: '#10b981' });
  } catch (e) { log(`[ERROR] ${e.message}`, 'err'); }
}

async function injectPrompt(extra = '') {
  log('[INJECT] Fetching best prompt...', 'info');
  try {
    const res = await fetch(`${BRIDGE}/api/browser-bridge/promptbase`);
    const prompts = await res.json();
    const best = (prompts || []).filter(p => p.status === 'pending').sort((a,b) => (b.score||0)-(a.score||0))[0];
    const toInject = extra || best?.prompt || document.getElementById('prompt-input').value;
    if (!toInject) { log('[INJECT] No prompt available', 'warn'); return; }
    await chrome.scripting.executeScript({
      target: { tabId: activeTab.id },
      func: (p) => {
        const el = document.activeElement || document.querySelector('textarea,[contenteditable="true"],input:not([type="hidden"])');
        if (!el) return;
        if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') el.value = p;
        else el.innerText = p;
        ['input','change'].forEach(ev => el.dispatchEvent(new Event(ev, { bubbles: true })));
      },
      args: [toInject]
    });
    log('[INJECT] Prompt injected ✓', 'ok');
    await sendToContent({ type: 'EVO_TOAST', msg: '⚡ Prompt injected', color: '#6366f1' });
  } catch (e) { log(`[ERROR] ${e.message}`, 'err'); }
}

async function runSurfaceAudit() {
  log('[AUDIT] Running surface audit...', 'info');
  try {
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: activeTab.id },
      func: () => ({
        brokenImages: Array.from(document.images).filter(i => !i.complete || !i.naturalWidth).length,
        brokenLinks: Array.from(document.querySelectorAll('a[href=""]')).length,
        consoleErrors: window.__evoErrors?.length || 0,
        inputsWithoutLabels: Array.from(document.querySelectorAll('input:not([aria-label]):not([id])')).length,
        accessibility: { images: Array.from(document.images).filter(i => !i.alt).length }
      })
    });
    log(`[AUDIT] Done. Errors: ${result.result.consoleErrors}`, result.result.consoleErrors ? 'warn' : 'ok');
    await fetch(`${BRIDGE}/api/test/audit/result`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...result.result, url: activeTab?.url, ts: new Date().toISOString() })
    });
  } catch (e) { log(`[AUDIT ERROR] ${e.message}`, 'err'); }
}

async function runBugSniper() {
  log('[BUG] Sniping bugs...', 'warn');
  try {
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: activeTab.id },
      func: () => ({ errors: window.__evoErrors || [], url: location.href, title: document.title })
    });
    const res = await fetch(`${BRIDGE}/api/repair`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...result.result, source: 'bug-sniper', useAI: true })
    });
    const data = await res.json();
    log(`[BUG] Diagnosis: ${data.diagnosis || 'Report sent to studio'}`, 'warn');
    await sendToContent({ type: 'BUG_SNIPER_RESULT', result: data });
  } catch (e) { log(`[BUG ERROR] ${e.message}`, 'err'); }
}

async function seedToEvo(text = '') {
  const corpus = text || document.getElementById('prompt-input').value || activeTab?.url;
  log('[TREE] Seeding to Evo Tree...', 'info');
  try {
    await fetch(`${BRIDGE}/api/studio-os/foundry/train`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ corpus, source: 'extension-seed', url: activeTab?.url, ts: new Date().toISOString() })
    });
    log('[TREE] Seeded ✓', 'ok');
    await sendToContent({ type: 'EVO_TOAST', msg: '🌱 Seeded to Evo Tree', color: '#a855f7' });
  } catch (e) { log(`[SEED ERROR] ${e.message}`, 'err'); }
}

async function sendToProof(text = '') {
  const claim = text || document.getElementById('prompt-input').value;
  log('[PROOF] Sending to Proof Console...', 'info');
  try {
    await fetch(`${BRIDGE}/api/browser-bridge/proof`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ claim, url: activeTab?.url, evidenceType: 'extension', ts: new Date().toISOString() })
    });
    log('[PROOF] Sent ✓', 'ok');
  } catch (e) { log(`[PROOF ERROR] ${e.message}`, 'err'); }
}

async function openTwin() {
  log('[TWIN] Opening Reality Twin...', 'info');
  chrome.windows.create({ url: `http://localhost:5173/os/reality-twin?url=${encodeURIComponent(activeTab?.url || '')}`, type: 'popup', width: 1400, height: 900 });
}

async function openChat() {
  log('[CHAT] Opening Sentient Chat...', 'info');
  await sendToContent({ type: 'OPEN_SENTIENT_CHAT' });
}

async function summarizePage() {
  log('[SUMMARY] Summarizing page...', 'info');
  try {
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: activeTab.id },
      func: () => document.body?.innerText?.slice(0, 8000)
    });
    await fetch(`${BRIDGE}/api/browser-bridge/forgecapsule`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: result.result, url: activeTab?.url, action: 'summarize', ts: new Date().toISOString() })
    });
    log('[SUMMARY] Stored to Evo Brain ✓', 'ok');
  } catch (e) { log(`[SUMMARY ERROR] ${e.message}`, 'err'); }
}

async function triggerRepair(extra = '') {
  log('[REPAIR] Triggering self-repair...', 'warn');
  try {
    await fetch(`${BRIDGE}/api/repair`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ context: extra, url: activeTab?.url, source: 'manual-repair' })
    });
    log('[REPAIR] Self-repair triggered ✓', 'ok');
  } catch (e) { log(`[REPAIR ERROR] ${e.message}`, 'err'); }
}

async function triggerDeploy() {
  log('[DEPLOY] Triggering deploy pipeline...', 'warn');
  try {
    await fetch(`${BRIDGE}/api/deploy`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ trigger: 'extension-manual', ts: new Date().toISOString() }) });
    log('[DEPLOY] Pipeline triggered ✓', 'ok');
  } catch (e) { log(`[DEPLOY ERROR] ${e.message}`, 'err'); }
}

async function runSelfEvolve() {
  log('[EVOLVE] Running self-evolution cycle...', 'warn');
  try {
    await fetch(`${BRIDGE}/api/self-implementation/cycle`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trigger: 'extension-evolve', ts: new Date().toISOString() })
    });
    log('[EVOLVE] Evolution cycle initiated ✓', 'ok');
    await sendToContent({ type: 'EVO_TOAST', msg: '🔺 Self-evolution cycle running', color: '#6366f1' });
  } catch (e) { log(`[EVOLVE ERROR] ${e.message}`, 'err'); }
}

async function applyUpgrade() {
  log('[UPGRADE] Applying studio upgrade...', 'warn');
  try {
    await fetch(`${BRIDGE}/api/self-implementation/activate`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trigger: 'upgrade-button', ts: new Date().toISOString() })
    });
    await chrome.storage.local.set({ upgradeReady: false });
    document.getElementById('upgrade-banner').classList.remove('visible');
    document.body.classList.remove('upgrade-ready');
    log('[UPGRADE] Applied. Reload studio to see changes ✓', 'ok');
  } catch (e) { log(`[UPGRADE ERROR] ${e.message}`, 'err'); }
}

// ─── BOOT ───────────────────────────────────────────────────────
async function boot() {
  activeTab = await getActiveTab();
  await checkBridge();
  await checkUpgrade();
}

boot();
