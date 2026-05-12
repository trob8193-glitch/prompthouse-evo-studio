# EVOGENAGE — OMEGA DEPLOYMENT MANIFEST
# ═══════════════════════════════════════════════════════════════
# STATUS: OMEGA FINALITY (PRODUCTION READY)
# ═══════════════════════════════════════════════════════════════

## 1. ARCHITECTURAL SUMMARY
EVOGENAGE is a sovereign-grade generative visual studio and autonomous UI evolution engine. It is built as a high-fidelity monorepo with strict separation between API, Web, and Shared modules.

- **Foundry Core**: Node.js / TypeScript / Express
- **Visual Interface**: React / Vite / Tailwind
- **Truth Ledger**: PostgreSQL / Prisma
- **Economic Barrier**: Stripe / CreditLedgerService
- **Intelligence Engine**: PromptForge Visual Compiler / Diffusion-Aware Cost Estimator
- **Security Shield**: Nuclear Rate Limiter / Sovereign Audit Service

## 2. PRODUCTION INJECTION (REQUIRED)
To transition from "Foundry Warm-up" to "Live Synthesis", the following physical credentials must be injected into `evogenage/apps/api/.env`:

| Key | Description |
| :--- | :--- |
| `DATABASE_URL` | Production PostgreSQL Connection String |
| `REPLICATE_API_TOKEN` | Token for Replicate Diffusion Provider |
| `STRIPE_SECRET_KEY` | Secret Key for Physical Credit Billing |
| `STRIPE_WEBHOOK_SECRET` | Secret for Validating Payment Grants |
| `AUTH_SECRET` | 32-Char Secret for Session Signing |
| `JWT_SECRET` | 32-Char Secret for RBAC Token Generation |

## 3. SCALING THE FOUNDRY
- **Database**: Run `npx prisma migrate deploy` to manifest the Sovereign Schema.
- **API**: Deploy `apps/api` to a secure cloud runtime (e.g., AWS, Render).
- **Frontend**: Build `apps/web` via `npm run build` and deploy to a global CDN.
- **Worker**: The `GenerationWorker` can be run as a separate background process for high-throughput scaling.

## 4. SOVEREIGN PROTOCOLS
- **No Mocks**: Every generation job requires physical credits and a valid provider handshake.
- **Safety Gating**: The `SafetyFilter` blocks all copyright and brand-unsafe latent drift.
- **Audit Logging**: Every sensitive action is physically logged for forensic truth.

═══════════════════════════════════════════════════════════════
"THE CHAOS HAS BEEN DENOISED. THE FOUNDRY IS OPERATIONAL."
═══════════════════════════════════════════════════════════════
