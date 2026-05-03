chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "PH_EVO_POST_EVENT") {
    fetch("http://127.0.0.1:4317/v1/promptbridge/events", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(message.event)
    })
      .then((res) => res.json())
      .then((data) => sendResponse({ ok: true, data }))
      .catch((error) => sendResponse({ ok: false, error: String(error) }));
    return true;
  }

  if (message?.type === "PH_EVO_GET_HEALTH") {
    fetch("http://127.0.0.1:4317/health")
      .then((res) => res.json())
      .then((data) => sendResponse({ ok: true, data }))
      .catch((error) => sendResponse({ ok: false, error: String(error) }));
    return true;
  }

  return false;
});
