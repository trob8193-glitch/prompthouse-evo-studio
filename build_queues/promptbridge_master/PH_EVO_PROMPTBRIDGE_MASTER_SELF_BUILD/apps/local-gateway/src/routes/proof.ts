import { FastifyInstance } from "fastify";
import { nanoid } from "nanoid";
import { db } from "../db.js";

export async function proofRoutes(app: FastifyInstance) {
  app.post("/v1/proof/evidence", async (request, reply) => {
    const body = request.body as any;
    if (!body.evidenceType || !body.evidence) return reply.code(400).send({ ok: false, error: "evidenceType and evidence are required" });
    const id = `proof_${nanoid()}`;
    db.prepare(`INSERT INTO proof_evidence (id, evidence_type, evidence_json, score, created_at) VALUES (?, ?, ?, ?, ?)`)
      .run(id, body.evidenceType, JSON.stringify(body.evidence), typeof body.score === "number" ? body.score : null, new Date().toISOString());
    return { ok: true, proofId: id };
  });

  app.get("/v1/proof/evidence", async () => {
    return { ok: true, evidence: db.prepare(`SELECT * FROM proof_evidence ORDER BY created_at DESC LIMIT 100`).all() };
  });
}
