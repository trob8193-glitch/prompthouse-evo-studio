/**
 * PH EVO STUDIO — CHROME EXTENSION POPUP SCRIPT
 */

let activeBot = { id: '', sys: '' };
let messages = [];

// ─── Tab Switching ─────────────────────────────────────────────
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');
  });
});

// ─── Bot Selection ─────────────────────────────────────────────
document.querySelectorAll('.bot-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.bot-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeBot = { id: btn.dataset.botId, sys: btn.dataset.sys };
  });
});

// ─── Status Probe ─────────────────────────────────────────────
function probe() {
  chrome.runtime.sendMessage({ type: 'PROBE' }, res => {
    const badge = document.getElementById('status-badge');
    if (res?.success && res.bridge) {
      badge.textContent = `✅ ${res.bridge.replace('http://', '')}`;
      badge.className = 'badge online';
    } else {
      badge.textContent = '❌ Offline';
      badge.className = 'badge offline';
    }
  });
}
probe();

// ─── Chat ─────────────────────────────────────────────────────
const messagesEl = document.getElementById('messages');
const input = document.getElementById('msg-input');
const sendBtn = document.getElementById('send-btn');

function appendMsg(role, content, meta = '') {
  const div = document.createElement('div');
  div.className = `msg ${role}`;
  div.textContent = content;
  if (meta) {
    const m = document.createElement('div');
    m.className = 'msg-meta';
    m.textContent = meta;
    div.appendChild(m);
  }
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function send() {
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  sendBtn.disabled = true;
  sendBtn.textContent = '⏳';

  messages.push({ role: 'user', content: text });
  appendMsg('user', text);

  chrome.runtime.sendMessage({
    type: 'CHAT',
    messages: messages.slice(-10),
    systemPrompt: activeBot.sys,
    botId: activeBot.id,
  }, res => {
    sendBtn.disabled = false;
    sendBtn.textContent = '➤';
    if (res?.success) {
      messages.push({ role: 'assistant', content: res.message });
      const meta = `via ${res.transport || 'unknown'}${res.model ? ` · ${res.model}` : ''}`;
      appendMsg('bot', res.message, meta);
    } else {
      appendMsg('system', `⚠️ Error: ${res?.error || 'Unknown error'}`);
    }
  });
}

sendBtn.addEventListener('click', send);
input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } });

// ─── Training Tab ─────────────────────────────────────────────
function loadTrainingStats() {
  chrome.runtime.sendMessage({ type: 'GET_TRAINING_STATS' }, res => {
    if (!res) return;
    document.getElementById('stat-total').textContent = res.total;
    document.getElementById('stat-queue').textContent = res.queued;
    document.getElementById('stat-captures').textContent = res.captures;
  });
}
loadTrainingStats();

// Training toggle
const toggle = document.getElementById('training-toggle');
chrome.storage.local.get('trainingEnabled', ({ trainingEnabled = true }) => { toggle.checked = trainingEnabled; });
toggle.addEventListener('change', () => chrome.storage.local.set({ trainingEnabled: toggle.checked }));

// Export
document.getElementById('export-btn').addEventListener('click', () => {
  chrome.runtime.sendMessage({ type: 'EXPORT_TRAINING' }, res => {
    if (!res?.data) return;
    const jsonl = res.data.map(ex => JSON.stringify({
      messages: [
        { role: 'system', content: ex.systemPrompt || 'You are PH Evo Studio — a sovereign-grade AI assistant.' },
        { role: 'user', content: ex.input },
        { role: 'assistant', content: ex.output },
      ]
    })).join('\n');
    const blob = new Blob([jsonl], { type: 'application/jsonl' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `evo_training_ext_${Date.now()}.jsonl`; a.click();
    URL.revokeObjectURL(url);
  });
});

// Push to bridge
document.getElementById('push-btn').addEventListener('click', () => {
  chrome.runtime.sendMessage({ type: 'PUSH_TRAINING' }, res => {
    if (res?.success) {
      appendMsg('system', `🧠 Pushed ${res.pushed} examples to Evo Bridge.`);
      loadTrainingStats();
    } else {
      appendMsg('system', `⚠️ Push failed: ${res?.error}`);
    }
  });
});

// Sync offline
document.getElementById('sync-btn').addEventListener('click', () => {
  chrome.runtime.sendMessage({ type: 'SYNC_OFFLINE' }, res => {
    appendMsg('system', `📤 Synced ${res?.synced || 0} queued messages.`);
    loadTrainingStats();
  });
});

// ─── Connections Tab ───────────────────────────────────────────
function renderConnections() {
  chrome.storage.local.get('customEndpoints', ({ customEndpoints = [] }) => {
    const list = document.getElementById('custom-ep-list');
    list.innerHTML = '';
    customEndpoints.forEach(ep => {
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;justify-content:space-between;align-items:center;background:#111827;border-radius:8px;padding:6px 10px;font-size:11px;color:#94a3b8;';
      row.innerHTML = `<span>${ep.label} — ${ep.url}</span>`;
      const rm = document.createElement('button');
      rm.textContent = 'Remove';
      rm.style.cssText = 'font-size:10px;color:#f87171;background:none;border:none;cursor:pointer;';
      rm.onclick = () => {
        const updated = customEndpoints.filter(e => e.url !== ep.url);
        chrome.storage.local.set({ customEndpoints: updated }, renderConnections);
      };
      row.appendChild(rm);
      list.appendChild(row);
    });
  });
}
renderConnections();

// Connection status list
const connList = document.getElementById('connection-list');
const PROBES = [
  { label: 'Local Bridge :3001', url: 'http://127.0.0.1:3001/status' },
  { label: 'Local Bridge :3002', url: 'http://127.0.0.1:3002/status' },
  { label: 'Ollama :11434', url: 'http://localhost:11434/api/tags' },
  { label: 'Studio UI :5173', url: 'http://localhost:5173' },
];
PROBES.forEach(async ({ label, url }) => {
  const row = document.createElement('div');
  row.style.cssText = 'display:flex;justify-content:space-between;align-items:center;font-size:11px;padding:4px 0;';
  row.innerHTML = `<span style="color:#64748b">${label}</span><span style="color:#334155">⏳</span>`;
  connList.appendChild(row);
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(2000) });
    row.querySelector('span:last-child').textContent = res.ok ? '✅ Online' : '❌ Error';
    row.querySelector('span:last-child').style.color = res.ok ? '#4ade80' : '#f87171';
  } catch {
    row.querySelector('span:last-child').textContent = '❌ Offline';
    row.querySelector('span:last-child').style.color = '#f87171';
  }
});

// Add endpoint
document.getElementById('add-ep-btn').addEventListener('click', () => {
  const url = document.getElementById('ep-url').value.trim();
  const label = document.getElementById('ep-label').value.trim() || url;
  const apiKey = document.getElementById('ep-apikey').value.trim();
  if (!url) return;
  chrome.storage.local.get('customEndpoints', ({ customEndpoints = [] }) => {
    customEndpoints.push({ url, label, apiKey: apiKey || undefined, addedAt: Date.now() });
    chrome.storage.local.set({ customEndpoints }, () => {
      document.getElementById('ep-url').value = '';
      document.getElementById('ep-label').value = '';
      document.getElementById('ep-apikey').value = '';
      renderConnections();
    });
  });
});
