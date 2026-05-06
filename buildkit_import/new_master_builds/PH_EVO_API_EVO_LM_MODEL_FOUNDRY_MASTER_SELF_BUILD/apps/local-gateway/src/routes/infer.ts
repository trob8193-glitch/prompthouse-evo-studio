import { FastifyInstance } from "fastify";

export async function inferRoutes(app: FastifyInstance) {
  app.post("/v1/infer/chat", async (request) => {
    const body = request.body as any;
    const localUrl = process.env.PH_EVO_LOCAL_MODEL_URL;

    if (!localUrl) {
      return {
        ok: true,
        model: body.model || "evo-lm-local-v0",
        output: "PH Evo API received this inference request, but no Evo LM model endpoint is configured. Set PH_EVO_LOCAL_MODEL_URL to route to a local/open-weight model endpoint.",
        truthState: {
          phEvoApiRunning: true,
          evoLmModelConnected: false,
          trainingOccurred: false,
          requiresModelEndpoint: true
        }
      };
    }

    const res = await fetch(localUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    return { ok: true, routedTo: localUrl, raw: data };
  });
}
