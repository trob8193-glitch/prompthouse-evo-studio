import { FastifyInstance } from "fastify";
import { nanoid } from "nanoid";
import { db } from "../db.js";
import { sanitizePayload } from "../core/sanitizer.js";

export async function promptBridgeRoutes(app: FastifyInstance) {
  app.post("/v1/promptbridge/events", async (request, reply) => {
    const body = request.body as any;
    if (!body.source || !body.eventType || !body.payload) {
      return reply.code(400).send({ ok: false, error: "source, eventType, and payload are required" });
    }
    const id = body.eventId || `evt_${nanoid()}`;
    const createdAt = body.createdAt || new Date().toISOString();
    const sanitized = sanitizePayload(body.payload);
    db.prepare(`INSERT INTO promptbridge_events (id, source, event_type, workspace_id, project_id, user_id, url, title, payload_json, training_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(id, body.source, body.eventType, body.workspaceId || null, body.projectId || null, body.userId || null, body.url || null, body.title || null, JSON.stringify(sanitized.payload), JSON.stringify(body.training || { captureEnabled: false }), createdAt);
    return { ok: true, eventId: id, sanitized: { secretsRemoved: sanitized.secretsRemoved } };
  });

  app.get("/v1/promptbridge/events", async () => {
    const events = db.prepare(`SELECT * FROM promptbridge_events ORDER BY created_at DESC LIMIT 100`).all();
    return { ok: true, events };
  });
}
