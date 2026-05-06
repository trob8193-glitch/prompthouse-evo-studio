import { FastifyInstance } from "fastify";
import { nanoid } from "nanoid";
import { db } from "../db.js";
import { sanitizePayload } from "../core/sanitizer.js";
import { canEnterTraining, reviewStatus } from "../core/consent.js";

export async function promptBridgeRoutes(app: FastifyInstance) {
  app.post("/v1/promptbridge/events", async (request, reply) => {
    const body = request.body as any;
    if (!body.source || !body.eventType || !body.payload) {
      return reply.code(400).send({ ok: false, error: "source, eventType, and payload are required" });
    }

    const eventId = body.eventId || `evt_${nanoid()}`;
    const createdAt = body.createdAt || new Date().toISOString();
    const sanitized = sanitizePayload(body.payload);
    const training = body.training || { captureEnabled: false };
    const sanitizerReport = { secretsRemoved: sanitized.secretsRemoved };

    db.prepare(`
      INSERT INTO promptbridge_events (
        id, source, event_type, workspace_id, project_id, user_id, url, title,
        payload_json, training_json, sanitizer_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      eventId,
      body.source,
      body.eventType,
      body.workspaceId || null,
      body.projectId || null,
      body.userId || null,
      body.url || null,
      body.title || null,
      JSON.stringify(sanitized.payload),
      JSON.stringify(training),
      JSON.stringify(sanitizerReport),
      createdAt
    );

    if (canEnterTraining(training)) {
      const payload = sanitized.payload as any;
      db.prepare(`
        INSERT INTO training_items (
          id, source_event_id, item_type, prompt, chosen, rejected, metadata_json, review_status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        `train_${nanoid()}`,
        eventId,
        training.dataClass || "training_candidate",
        payload.userPrompt || payload.prompt || null,
        payload.acceptedFinal || payload.chosen || payload.output || null,
        payload.rejected || null,
        JSON.stringify({ source: body.source, eventType: body.eventType, sanitizerReport }),
        reviewStatus(training),
        createdAt
      );
    }

    return { ok: true, eventId, sanitized: sanitizerReport, trainingAccepted: canEnterTraining(training) };
  });

  app.get("/v1/promptbridge/events", async () => {
    const rows = db.prepare(`SELECT * FROM promptbridge_events ORDER BY created_at DESC LIMIT 100`).all();
    return { ok: true, events: rows };
  });
}
