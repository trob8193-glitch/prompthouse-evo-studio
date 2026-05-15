# PH EVO STUDIO — Final Launch Checklist

> This checklist must be completed in order before any production launch.
> All items must be checked manually. No fake checks. No automation bypass.

---

## Section 1: Local Proof Complete

- [ ] `node --check promptbridge-server.js` → no syntax errors
- [ ] `npm run audit:imports` → all imports resolve
- [ ] `npm run audit:css` → all CSS variables defined
- [ ] `npm test` → all tests pass (currently: 330 passed)
- [ ] `npm run build` → production bundle builds cleanly
- [ ] `npm run verify:studio` → 5/5 verification steps pass
- [ ] `npm run proof:report` → proof report generated in `.prompthouse-data/`
- [ ] `npm run simulate:local-production` → `LOCAL_ONLY`, production correctly `BLOCKED`
- [ ] `npm run handover:report` → handover report generated

---

## Section 2: Environment Safety

- [ ] `.env` exists locally and contains all required keys
- [ ] `.env` is listed in `.gitignore` and is **not staged**
- [ ] `.env.example` contains only placeholder values — no real keys
- [ ] `JWT_SECRET` is configured in `.env` (strong random value)
- [ ] `PH_EVO_MASTER_KEY` is configured in `.env`
- [ ] No secrets appear in `git diff --cached`
- [ ] No secrets appear in any committed file
- [ ] `DEPLOY_ALLOW_PRODUCTION=false` in `.env`

---

## Section 3: Provider Gates

- [ ] `STRIPE_SECRET_KEY` starts with `sk_test_` (test mode only)
- [ ] `VERCEL_TOKEN` is configured (starts with `vcp_`)
- [ ] `OPENAI_API_KEY` is configured **or** provider rail is acknowledged as `PROVIDER_GATED`
- [ ] `GEMINI_API_KEY` is configured **or** provider rail is acknowledged as `PROVIDER_GATED`
- [ ] No live Stripe key (`sk_live_`) is present in `.env`

---

## Section 4: Deployment Proof

- [ ] At least one successful Vercel preview deployment receipt exists
- [ ] Preview `deploymentUrl` is recorded in handover report
- [ ] Preview `deploymentId` is recorded in handover report
- [ ] Preview `receiptId` is recorded in handover report
- [ ] Smoke check result is recorded (HTTP 401 → `SECURITY_GATE_VERIFIED` if Vercel Auth enabled)
- [ ] If smoke check returned 401: classified as auth gate, **not** app failure

---

## Section 5: Production Blockers (All must remain TRUE)

- [ ] `DEPLOY_ALLOW_PRODUCTION=false`
- [ ] Production deploy is blocked at service layer (`vercel-preview-runner.js`)
- [ ] Live billing is blocked at service layer (`stripe-test-checkout.js`)
- [ ] Live Stripe key (`sk_live_`) is rejected by the checkout rail
- [ ] No "market-ready" claim exists anywhere in docs or UI
- [ ] No production deployment receipt exists (confirms no accidental prod deploy)

---

## Section 6: Before Production Launch (Future Phase 16E)

The following must be completed **before** any production deployment is authorized.
These are **not complete** in the current phase.

- [ ] Set all production environment variables in hosting provider (Vercel env UI or equivalent)
- [ ] Verify CORS is configured for the production domain
- [ ] Configure the public bridge URL (production backend address)
- [ ] Configure production custom domain and DNS
- [ ] Decide whether Vercel Authentication remains enabled (affects public smoke check)
- [ ] Run real browser verification against the production preview
- [ ] Run Stripe test checkout in production preview environment
- [ ] Create a production owner approval envelope (scope: `deploy`, explicit)
- [ ] Set `DEPLOY_ALLOW_PRODUCTION=true` **only** in the hosting environment — not in `.env`
- [ ] Run production deploy and generate production deployment receipt
- [ ] Run post-production smoke test and verify
- [ ] Only then declare production launch ready

---

*Generated as part of Phase 15: Sovereign Handover & Final Hardening.*
*This checklist is additive. No existing systems were removed.*
