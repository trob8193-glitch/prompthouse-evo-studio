import { FastifyInstance } from "fastify";
import { nanoid } from "nanoid";
import { db } from "../db.js";
import { sanitizePayload } from "../core/sanitizer.js";

export async function trainingRoutes(app: FastifyInstance) {
  app.post("/v1/training/capture", async (request, reply) => {
    const body = request.body as any;
    if (!body.itemType) return reply.code(400).send({ ok: false, error: "itemType is required" });

    const sanitized = sanitizePayload(body);
    const clean = sanitized.payload as any;
    const id = `train_${nanoid()}`;

    db.prepare(`
      INSERT INTO training_items (id, source_event_id, item_type, prompt, chosen, rejected, metadata_json, review_status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      clean.sourceEventId || null,
      clean.itemType,
      clean.prompt || null,
      clean.chosen || clean.acceptedFinal || null,
      clean.rejected || null,
      JSON.stringify(clean.metadata || { sanitizer: { secretsRemoved: sanitized.secretsRemoved } }),
      clean.reviewStatus || "review_required",
      new Date().toISOString()
    );

    return { ok: true, trainingItemId: id, sanitized: { secretsRemoved: sanitized.secretsRemoved } };
  });

  app.get("/v1/training/export/sft", async () => {
    const rows = db.prepare(`SELECT * FROM training_items WHERE chosen IS NOT NULL ORDER BY created_at ASC`).all() as any[];
    const jsonl = rows.map((row) => JSON.stringify({
      messages: [
        { role: "system", content: "You are PH Evo Studio Model. Preserve truth, canon, consent, proof, and build discipline." },
        { role: "user", content: row.prompt || "PH Evo training event" },
        { role: "assistant", content: row.chosen }
      ],
      metadata: JSON.parse(row.metadata_json || "{}")
    })).join("\n");
    return { ok: true, format: "jsonl", lineCount: rows.length, jsonl };
  });

  app.get("/v1/training/export/preferences", async () => {
    const rows = db.prepare(`SELECT * FROM training_items WHERE chosen IS NOT NULL AND rejected IS NOT NULL ORDER BY created_at ASC`).all() as any[];
    const jsonl = rows.map((row) => JSON.stringify({
      prompt: row.prompt || "PH Evo preference event",
      chosen: row.chosen,
      rejected: row.rejected,
      metadata: JSON.parse(row.metadata_json || "{}")
    })).join("\n");
    return { ok: true, format: "jsonl", lineCount: rows.length, jsonl };
  });
}
