import { FastifyInstance } from "fastify";
import { nanoid } from "nanoid";
import { db } from "../db.js";

const allowedStates = new Set(["planned", "implemented", "running", "tested", "verified", "blocked", "human_required"]);

export async function realityRoutes(app: FastifyInstance) {
  app.post("/v1/reality/claims", async (request, reply) => {
    const body = request.body as any;
    if (!body.claimText) return reply.code(400).send({ ok: false, error: "claimText is required" });
    const state = body.state || "planned";
    if (!allowedStates.has(state)) return reply.code(400).send({ ok: false, error: "invalid state" });
    const id = `claim_${nanoid()}`;
    db.prepare(`INSERT INTO reality_claims (id, project_id, claim_text, state, evidence_json, created_at) VALUES (?, ?, ?, ?, ?, ?)`)
      .run(id, body.projectId || null, body.claimText, state, JSON.stringify(body.evidence || null), new Date().toISOString());
    return { ok: true, claimId: id, state };
  });

  app.get("/v1/reality/claims", async () => {
    return { ok: true, claims: db.prepare(`SELECT * FROM reality_claims ORDER BY created_at DESC LIMIT 100`).all() };
  });
}
