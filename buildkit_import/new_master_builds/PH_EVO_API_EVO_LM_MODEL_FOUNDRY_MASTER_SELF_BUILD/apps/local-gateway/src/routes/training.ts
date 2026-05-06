import { FastifyInstance } from "fastify";
import { nanoid } from "nanoid";
import { db } from "../db.js";
import { sanitizePayload } from "../core/sanitizer.js";

function isAllowedPolicy(training: any) {
  return Boolean(training && training.captureEnabled && (training.allowedForFinetune || training.allowedForPreferenceTraining));
}

export async function trainingRoutes(app: FastifyInstance) {
  app.post("/v1/training/capture", async (request, reply) => {
    const body = request.body as any;
    if (!isAllowedPolicy(body.training)) {
      return reply.code(403).send({ ok: false, error: "Training capture blocked. captureEnabled and allowed training route are required." });
    }
    const sanitized = sanitizePayload(body.payload || {});
    const id = `train_${nanoid()}`;
    db.prepare(`INSERT INTO training_items (id, source_event_id, item_type, content_json, status, created_at) VALUES (?, ?, ?, ?, ?, ?)`)
      .run(id, body.sourceEventId || null, body.itemType || "sft_candidate", JSON.stringify(sanitized.payload), body.training.requiresReview ? "review_required" : "approved", new Date().toISOString());
    return { ok: true, trainingItemId: id, status: body.training.requiresReview ? "review_required" : "approved", sanitized: { secretsRemoved: sanitized.secretsRemoved } };
  });

  app.get("/v1/training/items", async () => {
    const items = db.prepare(`SELECT * FROM training_items ORDER BY created_at DESC LIMIT 100`).all();
    return { ok: true, items };
  });
}
