chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    evoDomBridgeInstalledAt: new Date().toISOString(),
    evoDomBridgeMode: 'approval-gated',
  });
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === 'EVO_DOM_BRIDGE_STATUS') {
    sendResponse({
      success: true,
      mode: 'approval-gated',
      capabilities: ['active_tab_snapshot', 'interactive_element_highlight', 'receipt_forwarding'],
      checkedAt: new Date().toISOString(),
    });
    return true;
  }
  return false;
});
