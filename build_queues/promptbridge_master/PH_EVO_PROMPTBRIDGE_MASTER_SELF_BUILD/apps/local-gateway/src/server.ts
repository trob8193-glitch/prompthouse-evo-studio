import Fastify from "fastify";
import cors from "@fastify/cors";
import "./db.js";
import { promptBridgeRoutes } from "./routes/promptbridge.js";
import { memoryRoutes } from "./routes/memory.js";
import { trainingRoutes } from "./routes/training.js";
import { realityRoutes } from "./routes/reality.js";
import { proofRoutes } from "./routes/proof.js";
import { inferRoutes } from "./routes/infer.js";

const app = Fastify({ logger: true });
await app.register(cors, { origin: true });

await app.register(promptBridgeRoutes);
await app.register(memoryRoutes);
await app.register(trainingRoutes);
await app.register(realityRoutes);
await app.register(proofRoutes);
await app.register(inferRoutes);

app.get("/health", async () => ({ ok: true, service: "ph-evo-local-gateway", time: new Date().toISOString() }));

await app.listen({ port: 4317, host: "127.0.0.1" });
