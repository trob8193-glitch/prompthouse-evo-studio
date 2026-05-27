const output = document.getElementById('output');

function print(value) {
  output.textContent = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
}

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) throw new Error('No active tab available.');
  return tab;
}

async function runInActiveTab(func) {
  const tab = await getActiveTab();
  const [result] = await chrome.scripting.executeScript({ target: { tabId: tab.id }, func });
  return result?.result;
}

document.getElementById('snapshot').addEventListener('click', async () => {
  try {
    const snapshot = await runInActiveTab(() => ({
      title: document.title,
      url: location.href,
      origin: location.origin,
      nodeCount: document.querySelectorAll('*').length,
      forms: document.forms.length,
      buttons: document.querySelectorAll('button,[role="button"],input[type="button"],input[type="submit"]').length,
      links: document.links.length,
      headings: Array.from(document.querySelectorAll('h1,h2,h3')).slice(0, 20).map(node => node.textContent.trim()).filter(Boolean),
      capturedAt: new Date().toISOString(),
    }));

    await fetch('http://127.0.0.1:3001/api/evo-capabilities/receipt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        capabilityId: 'browser_dom_bridge',
        action: 'active_tab_snapshot',
        truthState: 'SNAPSHOT_RECORDED',
        details: snapshot,
        claims: ['active_tab_snapshot_captured']
      })
    }).catch(() => null);

    print(snapshot);
  } catch (error) {
    print({ success: false, error: error.message });
  }
});

document.getElementById('highlight').addEventListener('click', async () => {
  try {
    const result = await runInActiveTab(() => {
      const nodes = Array.from(document.querySelectorAll('button,a,input,textarea,select,[role="button"]')).slice(0, 250);
      nodes.forEach(node => {
        node.dataset.evoBridgeHighlighted = 'true';
        node.style.outline = '2px solid #22c55e';
        node.style.outlineOffset = '2px';
      });
      return { highlighted: nodes.length, capturedAt: new Date().toISOString() };
    });
    print(result);
  } catch (error) {
    print({ success: false, error: error.message });
  }
});
