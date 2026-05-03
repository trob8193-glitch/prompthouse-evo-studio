chrome.runtime.onInstalled.addListener(() => {
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
});