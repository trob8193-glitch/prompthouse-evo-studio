import { FastifyInstance } from "fastify";

export async function inferRoutes(app: FastifyInstance) {
  app.post("/v1/infer/chat", async (request) => {
    const body = request.body as any;
    const model = body.model || "ph-evo-local";
    const provider = body.provider || "not_configured";

    if (provider !== "ollama") {
      return {
        ok: true,
        model,
        provider,
        output: "PH Evo local gateway received the request. A real model provider is not configured for this route yet.",
        truthState: {
          implemented: true,
          modelConnected: false,
          humanRequired: "Set provider to 'ollama' and run a local Ollama model, or add another provider connector."
        }
      };
    }

    const response = await fetch("http://127.0.0.1:11434/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ model, messages: body.messages || [], stream: false })
    });

    if (!response.ok) {
      return { ok: false, error: "Ollama route failed", status: response.status };
    }

    const data = await response.json() as any;
    return { ok: true, provider: "ollama", model, output: data.message?.content || "", raw: data };
  });
}
