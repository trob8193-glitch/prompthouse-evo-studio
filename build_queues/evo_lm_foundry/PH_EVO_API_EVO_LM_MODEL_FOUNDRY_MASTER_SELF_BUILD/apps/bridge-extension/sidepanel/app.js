const out = document.getElementById("out");
function show(x) { out.textContent = typeof x === "string" ? x : JSON.stringify(x, null, 2); }

document.getElementById("health").onclick = async () => {
  const res = await fetch("http://127.0.0.1:4317/health");
  show(await res.json());
};

document.getElementById("capture").onclick = async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return show("No active tab.");
  const page = await chrome.tabs.sendMessage(tab.id, { type: "PH_EVO_GET_VISIBLE_TEXT" });
  const event = {
    eventId: `evt_${crypto.randomUUID()}`,
    source: "bridge_extension",
    eventType: "capture",
    url: page.url,
    title: page.title,
    payload: { visibleText: page.text },
    training: { captureEnabled: false, allowedForMemory: true, allowedForFinetune: false, allowedForPreferenceTraining: false, requiresReview: true, sourceRights: "user_owned", dataClass: "prompt" },
    createdAt: new Date().toISOString()
  };
  const result = await chrome.runtime.sendMessage({ type: "PH_EVO_SEND_EVENT", event });
  show(result);
};
