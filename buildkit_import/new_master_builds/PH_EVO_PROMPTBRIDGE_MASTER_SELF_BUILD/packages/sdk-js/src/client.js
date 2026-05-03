export class PHEvoClient {
  constructor({ baseUrl = "http://127.0.0.1:4317", apiKey = null } = {}) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.apiKey = apiKey;
  }

  async request(path, body) {
    const headers = { "content-type": "application/json" };
    if (this.apiKey) headers.authorization = `Bearer ${this.apiKey}`;
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(`PH Evo API error ${res.status}`);
    return res.json();
  }

  captureEvent(event) {
    return this.request("/v1/promptbridge/events", event);
  }

  writeMemory(memory) {
    return this.request("/v1/memory/write", memory);
  }

  inferChat(payload) {
    return this.request("/v1/infer/chat", payload);
  }

  captureTraining(item) {
    return this.request("/v1/training/capture", item);
  }
}
