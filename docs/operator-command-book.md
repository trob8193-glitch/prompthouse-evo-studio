# PH EVO STUDIO — Operator Command Book

> This command book documents every safe, verified command for operating PromptHouse Evo Studio.
> No secrets. No fake success. Production deploy remains blocked until Phase 16E.

---

## A. Local Development Commands

| Command | Purpose |
|:---|:---|
| `npm run dev` | Start the Vite frontend dev server (HMR enabled) |
| `npm run bridge` | Start the PromptBridge backend server (`promptbridge-server.js`) |
| `npm run dev:all` | Start frontend + bridge concurrently |
| `npm run build` | Compile production frontend bundle to `dist/` |
| `npm test` | Run the full Vitest test suite |

**Notes:**
- Frontend runs on port `5173` by default.
- Bridge runs on port `3001` by default (configurable via `BRIDGE_PORT` in `.env`).
- `.env` must exist locally and **must never be committed**.

---

## B. Verification Commands

| Command | Purpose |
|:---|:---|
| `npm run audit:imports` | Verify all local JS/JSX imports resolve correctly |
| `npm run audit:css` | Verify all CSS variable references are defined |
| `npm run verify:studio` | Full gauntlet: syntax + imports + CSS + tests + build |
| `npm run proof:report` | Generate proof report in `.prompthouse-data/` |
| `npm run deployment:readiness` | Classify deployment readiness; generate readiness report |
| `npm run simulate:local-production` | Full local production simulation (no external calls) |
| `npm run handover:report` | Generate sovereign handover report (JSON + Markdown) |
| `npm run docs:warnings` | Scan docs for markdown lint warnings (non-blocking) |

**Run order for clean validation:**
```
npm run audit:imports
npm run audit:css
npm test
npm run build
npm run verify:studio
npm run deployment:readiness
npm run simulate:local-production
npm run handover:report
```

---

## C. Preview Deploy Workflow

> ⚠️ Production deploy is **BLOCKED**. Only preview deployments are permitted.

### Pre-requisites
1. `VERCEL_TOKEN` must be set in `.env` (starts with `vcp_`).
2. `DEPLOY_ALLOW_PRODUCTION=false` must remain set.
3. Owner approval is required before any deploy action.

### Workflow
1. Open the **Deployment Center** in the Studio UI.
2. Open the **Vercel Preview Deploy Panel**.
3. Click **Grant Owner Approval** (scope: `deploy`).
4. Click **Run Vercel Preview Deploy Proof**.
5. Wait for the deployment receipt to appear.
6. Note the `deploymentUrl`, `deploymentId`, and `receiptId`.
7. Run the smoke check: `node scripts/preview-smoke-check.mjs <url>`
   - If `401 Unauthorized` is returned: **this is expected** when Vercel Authentication is enabled.
   - Classify as: `SECURITY_GATE_VERIFIED — PUBLIC_SMOKE_BLOCKED_BY_AUTH`.
   - This is **not** an application failure.
8. Verify the deployment visually in a browser if authenticated access is available.

### Commands
```
npm run deployment:readiness
# From UI: Owner Approve → Deploy
node scripts/preview-smoke-check.mjs https://<your-preview-url>.vercel.app
npm run handover:report
```

---

## D. Stripe Test Checkout Workflow

> ⚠️ Live billing is **BLOCKED**. Test mode only.

### Pre-requisites
- `STRIPE_SECRET_KEY` must start with `sk_test_` in `.env`.
- Owner approval (scope: `commerce`) is required.

### Workflow
1. Open the **Deployment Center** → **Stripe Test Checkout Flow** panel.
2. Confirm "Stripe Test Mode Active" is shown.
3. Click **Grant Owner Approval** (scope: `commerce`).
4. Click **Create Stripe Test Checkout Session**.
5. Open the returned Stripe-hosted checkout URL.
6. Use Stripe test card: `4242 4242 4242 4242` (any future expiry, any CVC).
7. Complete the checkout and verify the receipt appears.

**Live keys (`sk_live_`) are blocked by the rail and will not proceed.**

---

## E. AI Provider Workflow

> ⚠️ AI calls require explicit owner approval and will spend tokens.

### Rules
- OpenAI and Gemini keys belong in `.env` or your hosting environment.
- Keys **must never be committed to Git**.
- Provider probes require an owner approval envelope (scope: `provider_probe`).
- No autonomous token spending — all AI actions are gated.
- A provider receipt must be generated before claiming provider success.

### Workflow
1. Set `OPENAI_API_KEY` and/or `GEMINI_API_KEY` in `.env`.
2. Open **Proof Center** → **AI Provider Proof Panel**.
3. Grant owner approval (scope: `provider_probe`).
4. Run the probe — a receipt will be generated.
5. Only after a receipt exists is the rail classified as `PROVEN`.

---

## F. Git Safety Rules

| Rule | Why |
|:---|:---|
| `.env` must **never** be staged or committed | Contains secrets — gitignored by design |
| Secrets must **never** be printed to console | Prevents accidental exposure in logs/CI |
| Receipts redact sensitive values | Receipt JSON only stores hashed/redacted data |
| `DEPLOY_ALLOW_PRODUCTION` must remain `false` | Prevents accidental production deploy |
| Use `git status --short` before every commit | Verify `.env` is not staged |
| Use `git diff --cached` to audit staged content | Confirm no raw secrets |

### Safe commit workflow
```powershell
git status --short                    # Confirm .env not staged
git diff --cached | Select-String "sk_|vcp_|AIza|JWT_SECRET="  # Confirm no secrets
npm run verify:studio                 # All checks pass
git commit -m "your message"
git status --short                    # Confirm clean
```

---

*This command book was generated as part of Phase 15: Sovereign Handover & Final Hardening.*
*No systems were removed or disabled. All existing commands remain functional.*
