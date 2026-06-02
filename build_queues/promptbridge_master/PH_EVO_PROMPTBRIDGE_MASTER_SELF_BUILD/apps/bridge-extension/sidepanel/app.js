const gatewayOrb = document.getElementById("gatewayOrb");
const gatewayText = document.getElementById("gatewayText");
const apiStatus = document.getElementById("apiStatus");
const captureResult = document.getElementById("captureResult");
const timeline = document.getElementById("timeline");
const inspectorText = document.getElementById("inspectorText");

function addTimeline(text) {
  const el = document.createElement("div");
  el.className = "event";
  el.textContent = `${new Date().toLocaleTimeString()} · ${text}`;
  timeline.prepend(el);
}

function setGateway(ok, text) {
  gatewayOrb.className = `orb ${ok ? "live" : "blocked"}`;
  gatewayText.textContent = text;
  apiStatus.textContent = text;
}

async function checkHealth() {
  const res = await chrome.runtime.sendMessage({ type: "PH_EVO_GET_HEALTH" });
  setGateway(Boolean(res?.ok), res?.ok ? "Gateway: live" : "Gateway: offline");
  addTimeline(res?.ok ? "Local gateway health OK" : "Local gateway offline");
}

for (const button of document.querySelectorAll(".rail button")) {
  button.addEventListener("click", () => {
    document.querySelectorAll(".rail button").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
    button.classList.add("active");
    document.getElementById(`screen-${button.dataset.screen}`).classList.add("active");
    inspectorText.textContent = `Screen active: ${button.dataset.screen}`;
  });
}

document.getElementById("captureChat").addEventListener("click", async () => {
  captureResult.textContent = "Capturing active tab...";
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    captureResult.textContent = "No active tab found.";
    return;
  }

  const page = await chrome.tabs.sendMessage(tab.id, { type: "PH_EVO_GET_VISIBLE_CHAT" });
  const event = {
    eventId: `evt_${crypto.randomUUID()}`,
    source: "bridge_extension",
    eventType: "capture",
    url: page.url,
    title: page.title,
    payload: { visibleText: page.text },
    training: {
      captureEnabled: false,
      allowedForMemory: true,
      allowedForFinetune: false,
      allowedForPreferenceTraining: false,
      requiresReview: true,
      sourceRights: "user_owned",
      dataClass: "prompt"
    },
    createdAt: new Date().toISOString()
  };

  const result = await chrome.runtime.sendMessage({ type: "PH_EVO_POST_EVENT", event });
  captureResult.textContent = JSON.stringify(result, null, 2);
  inspectorText.textContent = result?.ok ? `Captured event ${result.data.eventId}` : "Capture failed";
  addTimeline(result?.ok ? `Captured event ${result.data.eventId}` : "Capture failed");
});

checkHealth();
setInterval(checkHealth, 15000);
