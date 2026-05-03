export async function promptBridgeCall(request, options = {}) {
  const baseUrl = options.baseUrl ?? "http://localhost:3001";
  const headers = { "Content-Type": "application/json" };
  if (options.token) headers.Authorization = `Bearer ${options.token}`;

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/api/promptlink/live-preview`, {
    method: "POST",
    headers,
    body: JSON.stringify(request)
  });

  const text = await response.text();
  let data;

  try {
    data = JSON.parse(text);
  } catch {
    data = { status: "blocked", message: "PromptBridge returned non-JSON.", boundary: text };
  }

  if (!response.ok) {
    return { status: "blocked", message: `HTTP ${response.status}`, boundary: JSON.stringify(data) };
  }

  return data;
}

export function createProofReceipt(action, draftId) {
  return {
    receipt_id: `liveforge_${Date.now()}`,
    source: "PromptHouse Evo LiveForge Preview",
    action,
    draft_id: draftId,
    status: "built",
    timestamp: new Date().toISOString(),
    boundary: "Preview receipt only. Runtime/build/deploy proof requires local execution."
  };
}
