chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
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
});