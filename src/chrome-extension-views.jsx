import React, { useMemo, useState } from 'react';
import { writeToLocalDisk, downloadFile } from './autonomous-builder.js';

const DEFAULT_EXTENSION = {
  name: 'prompthouse_evo_chrome_extension',
  title: 'PromptHouse Evo',
  description: 'Dark autonomous Chrome extension for capturing page context and routing it into PromptHouse Evo Studio.',
  bridgeUrl: 'http://127.0.0.1:3001',
};

function cleanName(value) {
  return (value || DEFAULT_EXTENSION.name).trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '_').replace(/^_+|_+$/g, '') || DEFAULT_EXTENSION.name;
}

export function buildChromeExtensionFiles(config) {
  const appName = cleanName(config.name);
  const title = config.title?.trim() || DEFAULT_EXTENSION.title;
  const description = config.description?.trim() || DEFAULT_EXTENSION.description;
  const bridgeUrl = (config.bridgeUrl || DEFAULT_EXTENSION.bridgeUrl).replace(/\/+$/, '');

  return {
    name: appName,
    files: {
      'manifest.json': JSON.stringify({
        manifest_version: 3,
        name: title,
        version: '0.1.0',
        description,
        action: {
          default_title: title,
          default_popup: 'popup.html',
        },
        background: {
          service_worker: 'service_worker.js',
          type: 'module',
        },
        options_page: 'options.html',
        side_panel: {
          default_path: 'sidepanel.html',
        },
        permissions: ['activeTab', 'contextMenus', 'scripting', 'sidePanel', 'storage'],
        host_permissions: ['<all_urls>', `${bridgeUrl}/*`],
        content_scripts: [
          {
            matches: ['<all_urls>'],
            js: ['content_script.js'],
            css: ['content.css'],
            run_at: 'document_idle',
          },
        ],
      }, null, 2),
      'popup.html': `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <link rel="stylesheet" href="ui.css" />
  </head>
  <body>
    <main class="shell popup-shell">
      <section class="hero">
        <div class="mark">PH</div>
        <div>
          <h1>${title}</h1>
          <p>S+++++ autonomous capture deck</p>
        </div>
      </section>
      <div class="status-row">
        <span id="bridge-dot" class="dot pending"></span>
        <span id="bridge-status">Checking local bridge...</span>
      </div>
      <label>
        Mission
        <textarea id="mission" placeholder="What should PromptHouse build from this page?"></textarea>
      </label>
      <div class="button-row">
        <button id="capture-page">Capture Page</button>
        <button id="capture-selection" class="secondary">Use Selection</button>
      </div>
      <button id="open-side-panel" class="wide">Open Side Panel</button>
      <pre id="output">Ready.</pre>
    </main>
    <script src="popup.js" type="module"></script>
  </body>
</html>`,
      'popup.js': `const bridgeUrl = '${bridgeUrl}';
const output = document.querySelector('#output');
const mission = document.querySelector('#mission');
const bridgeStatus = document.querySelector('#bridge-status');
const bridgeDot = document.querySelector('#bridge-dot');

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

function setOutput(value) {
  output.textContent = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
}

async function checkBridge() {
  try {
    const response = await fetch(bridgeUrl + '/status');
    const body = await response.json();
    bridgeDot.className = response.ok ? 'dot ok' : 'dot bad';
    bridgeStatus.textContent = response.ok ? 'Bridge active' : 'Bridge unavailable';
    return body;
  } catch (error) {
    bridgeDot.className = 'dot bad';
    bridgeStatus.textContent = 'Bridge offline';
    return { success: false, error: error.message };
  }
}

async function capturePage() {
  const tab = await getActiveTab();
  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => ({
      title: document.title,
      url: location.href,
      selection: String(getSelection()),
      text: document.body.innerText.slice(0, 12000),
    }),
  });
  const packet = {
    truthState: 'known',
    mode: 'S+++++ autonomous',
    mission: mission.value.trim(),
    capturedAt: new Date().toISOString(),
    page: result,
  };
  await chrome.storage.local.set({ lastPromptHouseCapture: packet });
  setOutput(packet);
}

async function captureSelection() {
  const tab = await getActiveTab();
  const response = await chrome.tabs.sendMessage(tab.id, { type: 'PH_GET_SELECTION' }).catch((error) => ({ error: error.message }));
  const packet = {
    truthState: response?.selection ? 'known' : 'blocked',
    mode: 'S+++++ autonomous',
    mission: mission.value.trim(),
    capturedAt: new Date().toISOString(),
    page: { title: tab.title, url: tab.url, selection: response?.selection || '' },
  };
  await chrome.storage.local.set({ lastPromptHouseCapture: packet });
  setOutput(packet);
}

document.querySelector('#capture-page').addEventListener('click', capturePage);
document.querySelector('#capture-selection').addEventListener('click', captureSelection);
document.querySelector('#open-side-panel').addEventListener('click', async () => {
  const tab = await getActiveTab();
  await chrome.sidePanel.open({ tabId: tab.id });
});

chrome.storage.local.get(['promptHouseMission']).then(({ promptHouseMission }) => {
  mission.value = promptHouseMission || '';
});
mission.addEventListener('input', () => chrome.storage.local.set({ promptHouseMission: mission.value }));
checkBridge();
setInterval(checkBridge, 5000);`,
      'content_script.js': `chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'PH_GET_SELECTION') {
    sendResponse({ selection: String(getSelection()).trim(), url: location.href, title: document.title });
  }
});

let badge;
document.addEventListener('selectionchange', () => {
  const text = String(getSelection()).trim();
  if (!text) {
    badge?.remove();
    badge = null;
    return;
  }
  if (!badge) {
    badge = document.createElement('button');
    badge.className = 'ph-evo-selection-badge';
    badge.textContent = 'PH';
    badge.title = 'PromptHouse Evo selection captured';
    badge.addEventListener('click', async () => {
      await chrome.storage.local.set({
        lastPromptHouseCapture: {
          truthState: 'known',
          mode: 'S+++++ autonomous',
          capturedAt: new Date().toISOString(),
          page: { title: document.title, url: location.href, selection: String(getSelection()).trim() },
        },
      });
      badge.textContent = 'OK';
      setTimeout(() => { if (badge) badge.textContent = 'PH'; }, 900);
    });
    document.documentElement.appendChild(badge);
  }
});`,
      'content.css': `.ph-evo-selection-badge {
  position: fixed;
  right: 18px;
  bottom: 18px;
  width: 42px;
  height: 42px;
  border: 1px solid rgba(34, 211, 238, 0.75);
  border-radius: 999px;
  z-index: 2147483647;
  background: radial-gradient(circle at 30% 20%, #22d3ee, #8b5cf6 42%, #050507 78%);
  color: white;
  font: 800 12px system-ui, sans-serif;
  box-shadow: 0 0 18px rgba(34, 211, 238, 0.6), 0 0 42px rgba(139, 92, 246, 0.3);
  cursor: pointer;
}`,
      'service_worker.js': `chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'promptHouseCaptureSelection',
    title: 'Capture selection with PromptHouse Evo',
    contexts: ['selection'],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== 'promptHouseCaptureSelection') return;
  await chrome.storage.local.set({
    lastPromptHouseCapture: {
      truthState: 'known',
      mode: 'S+++++ autonomous',
      capturedAt: new Date().toISOString(),
      page: { title: tab?.title || '', url: tab?.url || '', selection: info.selectionText || '' },
    },
  });
});`,
      'sidepanel.html': `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title} Side Panel</title>
    <link rel="stylesheet" href="ui.css" />
  </head>
  <body>
    <main class="shell side-shell">
      <section class="hero">
        <div class="mark">PH</div>
        <div>
          <h1>Autonomous Context</h1>
          <p>Latest captured page packet</p>
        </div>
      </section>
      <pre id="capture">No capture yet.</pre>
      <button id="copy">Copy Packet</button>
    </main>
    <script src="sidepanel.js" type="module"></script>
  </body>
</html>`,
      'sidepanel.js': `const capture = document.querySelector('#capture');
let current = null;

async function render() {
  const result = await chrome.storage.local.get(['lastPromptHouseCapture']);
  current = result.lastPromptHouseCapture || null;
  capture.textContent = current ? JSON.stringify(current, null, 2) : 'No capture yet.';
}

document.querySelector('#copy').addEventListener('click', async () => {
  await navigator.clipboard.writeText(current ? JSON.stringify(current, null, 2) : '');
});

chrome.storage.onChanged.addListener(render);
render();`,
      'options.html': `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title} Options</title>
    <link rel="stylesheet" href="ui.css" />
  </head>
  <body>
    <main class="shell">
      <h1>PromptHouse Evo Options</h1>
      <label>
        Default mission
        <textarea id="mission"></textarea>
      </label>
      <button id="save">Save</button>
      <pre id="state">Ready.</pre>
    </main>
    <script src="options.js" type="module"></script>
  </body>
</html>`,
      'options.js': `const mission = document.querySelector('#mission');
const state = document.querySelector('#state');
chrome.storage.local.get(['promptHouseMission']).then(({ promptHouseMission }) => {
  mission.value = promptHouseMission || '';
});
document.querySelector('#save').addEventListener('click', async () => {
  await chrome.storage.local.set({ promptHouseMission: mission.value });
  state.textContent = 'Saved ' + new Date().toLocaleString();
});`,
      'ui.css': `:root {
  color-scheme: dark;
  --bg: #050507;
  --panel: #10101a;
  --panel2: #181826;
  --text: #f0f0ff;
  --dim: #9b9bb8;
  --cyan: #22d3ee;
  --violet: #8b5cf6;
  --pink: #ec4899;
  --gold: #f5c842;
}

* { box-sizing: border-box; }
body {
  margin: 0;
  min-width: 360px;
  background:
    radial-gradient(circle at 20% 0%, rgba(34,211,238,.18), transparent 34%),
    radial-gradient(circle at 90% 20%, rgba(236,72,153,.18), transparent 28%),
    var(--bg);
  color: var(--text);
  font: 13px/1.5 Inter, ui-sans-serif, system-ui, sans-serif;
}
.shell { padding: 16px; }
.popup-shell { width: 380px; }
.side-shell { min-width: 300px; }
.hero { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
.mark {
  width: 42px; height: 42px; display: grid; place-items: center;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--cyan), var(--violet), var(--pink));
  box-shadow: 0 0 20px rgba(34,211,238,.45), 0 0 40px rgba(139,92,246,.25);
  font-weight: 900;
}
h1 { font-size: 16px; margin: 0; }
p { margin: 2px 0 0; color: var(--dim); font-size: 11px; text-transform: uppercase; letter-spacing: .08em; }
label { display: grid; gap: 6px; color: var(--dim); font-size: 11px; text-transform: uppercase; letter-spacing: .08em; }
textarea, pre {
  width: 100%;
  min-height: 96px;
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 10px;
  background: rgba(8,8,13,.92);
  color: var(--text);
  padding: 10px;
  resize: vertical;
  white-space: pre-wrap;
  word-break: break-word;
}
pre { max-height: 260px; overflow: auto; text-transform: none; letter-spacing: 0; }
.button-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 10px 0; }
button {
  border: 1px solid rgba(34,211,238,.35);
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(34,211,238,.95), rgba(139,92,246,.95));
  color: white;
  font-weight: 800;
  padding: 10px 12px;
  cursor: pointer;
  box-shadow: 0 0 16px rgba(34,211,238,.18);
}
button.secondary { background: var(--panel2); }
button.wide { width: 100%; margin-bottom: 10px; }
.status-row { display: flex; align-items: center; gap: 8px; padding: 9px 10px; margin-bottom: 12px; border-radius: 10px; background: rgba(255,255,255,.04); }
.dot { width: 9px; height: 9px; border-radius: 999px; background: var(--gold); box-shadow: 0 0 10px var(--gold); }
.dot.ok { background: #4ade80; box-shadow: 0 0 10px #4ade80; }
.dot.bad { background: #f87171; box-shadow: 0 0 10px #f87171; }
@keyframes hue-cycle {
  0% { filter: hue-rotate(0deg); }
  50% { filter: hue-rotate(110deg); }
  100% { filter: hue-rotate(360deg); }
}
.mark, button { animation: hue-cycle 7s ease-in-out infinite; }`,
      'README.md': `# ${title}

Manifest V3 Chrome extension generated by PromptHouse Evo Studio.

## Load in Chrome

1. Open chrome://extensions
2. Enable Developer mode
3. Click "Load unpacked"
4. Select this folder

## What it does

- Captures current page text and metadata.
- Captures selected text through popup, side panel, and context menu.
- Stores the latest capture in chrome.storage.local.
- Checks the local PromptHouse bridge at ${bridgeUrl}.
- Keeps a dark theme with changing autonomous glows.

Truth state: built. Live store publishing and Chrome Web Store packaging still require your account, icons, privacy policy, and review assets.
`,
    },
  };
}

export function ChromeExtensionView() {
  const [config, setConfig] = useState(DEFAULT_EXTENSION);
  const [selectedFile, setSelectedFile] = useState('manifest.json');
  const [status, setStatus] = useState('');
  const extension = useMemo(() => buildChromeExtensionFiles(config), [config]);
  const files = Object.keys(extension.files);

  const update = (key, value) => setConfig((current) => ({ ...current, [key]: value }));

  const writeExtension = async () => {
    setStatus('Writing extension to generated_apps...');
    try {
      const result = await writeToLocalDisk(extension);
      setStatus(result.message || `Wrote generated_apps/${extension.name}`);
    } catch (error) {
      setStatus(error.message);
    }
  };

  const downloadCurrent = () => {
    downloadFile(selectedFile, extension.files[selectedFile]);
  };

  return (
    <div className="flex-col animate-in">
      <div className="flex-between">
        <div>
          <div className="page-title">Chrome Extension Builder</div>
          <div className="page-subtitle">Manifest V3 extension shell for autonomous page capture, side panel review, and local bridge routing.</div>
        </div>
        <span className="badge badge-pink">S+++++ ONLY</span>
      </div>

      <div className="grid-builder">
        <div className="flex-col">
          <div className="card omnipotent-panel">
            <div className="card-header">
              <div className="card-title">Extension Settings</div>
              <div className="card-desc">Dark theme, animated glows, local-first capture. No external service is required.</div>
            </div>
            <div className="card-body flex-col">
              <div className="field">
                <label className="field-label">Folder Name</label>
                <input className="field-input" value={config.name} onChange={(event) => update('name', event.target.value)} />
              </div>
              <div className="field">
                <label className="field-label">Extension Title</label>
                <input className="field-input" value={config.title} onChange={(event) => update('title', event.target.value)} />
              </div>
              <div className="field">
                <label className="field-label">Description</label>
                <textarea className="field-textarea" value={config.description} onChange={(event) => update('description', event.target.value)} />
              </div>
              <div className="field">
                <label className="field-label">Local Bridge URL</label>
                <input className="field-input" value={config.bridgeUrl} onChange={(event) => update('bridgeUrl', event.target.value)} />
              </div>
              <div className="flex-row gap-8">
                <button className="btn btn-primary" onClick={writeExtension}>Write Extension to Disk</button>
                <button className="btn btn-secondary" onClick={() => navigator.clipboard.writeText(`generated_apps/${extension.name}`)}>Copy Load Path</button>
              </div>
              {status && <div className="prompt-block" style={{ minHeight: 'unset', maxHeight: 80 }}>{status}</div>}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">Chrome Load Steps</div>
            </div>
            <div className="card-body">
              <div className="prompt-block">
{`1. Click "Write Extension to Disk".
2. Open chrome://extensions.
3. Enable Developer mode.
4. Click "Load unpacked".
5. Select generated_apps/${extension.name}.
6. Pin the extension and use Capture Page or Use Selection.`}
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="flex-between">
              <div>
                <div className="card-title">Extension Files</div>
                <div className="card-desc">{files.length} files generated for a real unpacked Chrome extension.</div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={downloadCurrent}>Save Current File</button>
            </div>
          </div>
          <div className="card-body" style={{ display: 'grid', gridTemplateColumns: '210px 1fr', gap: 16 }}>
            <div className="flex-col" style={{ gap: 5 }}>
              {files.map((file) => (
                <button key={file} className={`nav-item ${selectedFile === file ? 'active' : ''}`} onClick={() => setSelectedFile(file)}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{file}</span>
                </button>
              ))}
            </div>
            <div>
              <div className="prompt-block" style={{ maxHeight: 620, fontSize: 11 }}>
                {extension.files[selectedFile]}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
