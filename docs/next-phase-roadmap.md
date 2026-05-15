# PH EVO STUDIO — Next Phase Roadmap

Phase 15 Complete. The following phases are safe next steps.
Each phase is additive-only. No existing system should be deleted or disabled.

---

## Phase 16A: Public Preview Access Decision

**Purpose:** Decide whether the Vercel preview deployment should be publicly accessible or remain behind Vercel Authentication.

**Background:** The current preview URL (`https://ph-evo-studio-preview-proof-4d0433hcl-trob8193-8783s-projects.vercel.app`) returns `HTTP 401 Unauthorized` because Vercel Authentication is enabled. This is a security feature, not a bug. Phase 16A resolves whether to keep it or open it.

**Required Credentials:**
- `VERCEL_TOKEN` (already configured)
- Vercel dashboard access

**Option A — Keep Vercel Authentication:**
- Use authenticated smoke strategy (browser session or Vercel CLI token)
- Update `BrowserPreviewVerificationPanel` checklist with auth note
- Classify smoke as `SECURITY_GATE_VERIFIED` permanently

**Option B — Disable Vercel Authentication:**
- Disable in Vercel dashboard under Project Settings → Deployment Protection
- Re-run smoke check: `node scripts/preview-smoke-check.mjs <url>`
- Expect `HTTP 200` and studio shell markers
- Update truth state to `PROVEN`

**Risks:**
- Disabling Vercel Authentication exposes preview to the public internet
- If disabled, ensure no sensitive data is accessible on the preview URL

**Blockers:** None — owner decision required

**Commands:**
```
node scripts/preview-smoke-check.mjs <preview-url>
npm run handover:report
```

**No-fake-success rule:** Do not claim `PROVEN` until smoke check returns non-401 with expected markers.

---

## Phase 16B: Stripe Test Checkout Browser Run

**Purpose:** Complete an actual Stripe test checkout session in a real browser to achieve `PROVEN` status for the Stripe test rail.

**Required Credentials:**
- `STRIPE_SECRET_KEY=sk_test_...` (already configured)
- Owner approval (scope: `commerce`)

**Risks:**
- Test cards only — no real charges
- Verifying session completion requires Stripe dashboard access
- Live key must never be used in this phase

**Blockers:** None — Stripe test key is configured

**Workflow:**
1. Start bridge: `npm run bridge`
2. Start frontend: `npm run dev`
3. Open Deployment Center → Stripe Test Checkout Flow
4. Grant owner approval (scope: `commerce`)
5. Create test checkout session
6. Open returned Stripe URL in browser
7. Use test card: `4242 4242 4242 4242`, any future expiry, any CVC
8. Complete checkout
9. Verify session receipt in Deployment Center

**Commands:**
```
npm run dev:all
# Open browser → Deployment Center → Stripe Test Checkout Flow
```

**No-fake-success rule:** Receipt must show real Stripe session ID, not a simulated one.

---

## Phase 16C: AI Provider Minimal Probe

**Purpose:** Run a tiny owner-approved probe to OpenAI and/or Gemini to generate a real provider receipt and elevate the rail from `PROVIDER_GATED` to `PROVEN`.

**Required Credentials:**
- `OPENAI_API_KEY` and/or `GEMINI_API_KEY`
- Owner approval (scope: `provider_probe`)
- Cost firewall must be active

**Risks:**
- Will spend API tokens — review model/token cost before approving
- Do not run large prompts — use a minimal ping-style probe
- Receipt must be generated before claiming `PROVEN`

**Blockers:** Owner must explicitly approve — no autonomous token spending

**Workflow:**
1. Open Proof Center → AI Provider Proof Panel
2. Review cost estimate
3. Grant owner approval (scope: `provider_probe`)
4. Run probe
5. Verify receipt in Proof Center

**No-fake-success rule:** Provider receipt required. `PROVIDER_GATED` → `PROVEN` only with real receipt.

---

## Phase 16D: Production Domain + CORS Setup

**Purpose:** Configure the production domain, bridge URL, and CORS policy before any production deploy.

**Required Credentials:**
- Domain registrar/DNS access
- Vercel dashboard access
- Production hosting environment

**Tasks:**
1. Register or point custom domain to Vercel
2. Configure `CORS_ORIGINS` in Vercel env to include production domain
3. Configure `BRIDGE_PORT` and public bridge URL in Vercel env
4. Verify all env variables are set in Vercel dashboard (not in committed `.env`)
5. Confirm SSL certificate is provisioned
6. Run deployment readiness against production env

**Risks:**
- CORS misconfiguration blocks bridge API calls from frontend
- Missing env vars cause runtime errors in production
- Do not hardcode production secrets in any committed file

**Blockers:**
- Domain must be configured before testing production CORS
- All production env vars must be set before Phase 16E

**Commands:**
```
npm run deployment:readiness
npm run handover:report
```

**No-fake-success rule:** CORS must be verified with a real browser request, not assumed.

---

## Phase 16E: Production Deploy Approval Phase

**Purpose:** Execute the first real production deployment after all pre-requisites are complete.

> ⚠️ This is the only phase where `DEPLOY_ALLOW_PRODUCTION=true` is authorized.
> It must be set in the **hosting environment only**, never in `.env` or committed code.

**Required Credentials:**
- `VERCEL_TOKEN`
- Owner approval (scope: `deploy`, production)
- All Phase 16D pre-requisites complete
- All final-launch-checklist.md items checked

**Tasks:**
1. Verify all items in `docs/final-launch-checklist.md` are complete
2. Set `DEPLOY_ALLOW_PRODUCTION=true` in Vercel dashboard env (NOT in `.env`)
3. Create production owner approval envelope
4. Trigger production deploy via Deployment Center
5. Verify production receipt is generated
6. Run post-production smoke test against production URL
7. Verify browser experience on production domain
8. Update truth state ledger to reflect production `PROVEN` state

**Risks:**
- Any misconfiguration in production env causes public-facing errors
- Do not set `DEPLOY_ALLOW_PRODUCTION=true` in `.env` or any committed file
- Production deploy is irreversible without a rollback plan

**Commands:**
```
npm run deployment:readiness
# Vercel dashboard: set DEPLOY_ALLOW_PRODUCTION=true
# Deployment Center: Grant approval → Deploy
node scripts/preview-smoke-check.mjs https://<your-production-domain>
npm run handover:report
```

**No-fake-success rule:** Production receipt required. Do not claim production-ready without receipt.

---

## Phase 16F: Markdown/Docs Hygiene Pass

**Purpose:** Fix markdown lint warnings in `docs/` and `.ai/` folders additively. No file deletion.

**Required Credentials:** None

**Tasks:**
1. Run `npm run docs:warnings` to generate warning report
2. Review `.prompthouse-data/markdown-warning-report.md`
3. Fix each warning by editing the file — do not delete
4. Re-run `npm run docs:warnings` to confirm warnings resolved
5. Commit with message: `phase-16f docs hygiene formatting pass`

**Risks:**
- Deleting files to clear warnings is forbidden
- Formatting changes must not alter documented facts
- Do not remove risk register entries, truth states, or receipts

**Blockers:** None — docs hygiene is always safe

**Commands:**
```
npm run docs:warnings
# Edit files to fix warnings
npm run docs:warnings
git add docs/
git commit -m "phase-16f docs hygiene formatting pass"
```

**No-fake-success rule:** Do not claim docs are warning-free unless `npm run docs:warnings` confirms it.

---

*This roadmap is additive. All future phases build on the sovereign foundation established in Phase 15.*
*No existing system should be deleted, disabled, or weakened in any future phase.*
