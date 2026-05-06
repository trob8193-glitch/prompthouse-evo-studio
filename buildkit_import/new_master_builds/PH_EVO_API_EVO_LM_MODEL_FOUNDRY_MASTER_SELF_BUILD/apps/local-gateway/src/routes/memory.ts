import { FastifyInstance } from "fastify";
import { nanoid } from "nanoid";
import { db } from "../db.js";
import { sanitizePayload } from "../core/sanitizer.js";

export async function memoryRoutes(app: FastifyInstance) {
  app.post("/v1/memory/write", async (request, reply) => {
    const body = request.body as any;
    if (!body.memoryType || !body.content) return reply.code(400).send({ ok: false, error: "memoryType and content are required" });
    const sanitized = sanitizePayload(body.content);
    const id = `mem_${nanoid()}`;
    db.prepare(`INSERT INTO memory_objects (id, privacy_scope, memory_type, content_json, allowed_for_training, created_at) VALUES (?, ?, ?, ?, ?, ?)`)
      .run(id, body.privacyScope || "private_device", body.memoryType, JSON.stringify(sanitized.payload), body.allowedForTraining ? 1 : 0, new Date().toISOString());
    return { ok: true, memoryId: id, sanitized: { secretsRemoved: sanitized.secretsRemoved } };
  });

  app.post("/v1/memory/query", async (request) => {
    const body = request.body as any;
    const q = String(body.query || "").toLowerCase();
    const rows = db.prepare(`SELECT * FROM memory_objects ORDER BY created_at DESC LIMIT 500`).all() as any[];
    const results = rows.filter(r => r.content_json.toLowerCase().includes(q) || r.memory_type.toLowerCase().includes(q)).slice(0, 25);
    return { ok: true, results };
  });
}
