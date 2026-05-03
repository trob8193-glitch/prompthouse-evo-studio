const bridgeUrl = 'http://localhost:3001';
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
setInterval(checkBridge, 5000);