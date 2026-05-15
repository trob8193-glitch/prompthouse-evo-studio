# PH EVO STUDIO — Final Risk Register

Phase 15: Sovereign Handover & Final Hardening

---

## Risk 1: Vercel Preview Protected by Authentication

| Field | Value |
|:---|:---|
| **Severity** | Low |
| **Truth State** | `SECURITY_GATE_VERIFIED` |
| **Description** | The Vercel preview deployment is protected by Vercel Authentication, causing the public smoke check to return `HTTP 401 Unauthorized`. This is **not** an application failure. |
| **Mitigation** | Classified as `SECURITY_GATE_VERIFIED — PUBLIC_SMOKE_BLOCKED_BY_AUTH`. Vercel Authentication is a security feature, not a bug. |
| **Next Safe Action** | Phase 16A: Decide whether to disable Vercel Authentication for public preview access, or use authenticated smoke strategy. |

---

## Risk 2: Production Deploy Intentionally Blocked

| Field | Value |
|:---|:---|
| **Severity** | Controlled — Intentional |
| **Truth State** | `BLOCKED` |
| **Description** | `DEPLOY_ALLOW_PRODUCTION=false` prevents any production deployment. The `vercel-preview-runner.js` enforces this at the service layer. |
| **Mitigation** | This is a designed safety gate. Any code path attempting production deploy will be rejected before any API call is made. |
| **Next Safe Action** | Phase 16E: Explicitly set `DEPLOY_ALLOW_PRODUCTION=true` only in the hosting environment when production deploy is authorized by the owner. |

---

## Risk 3: Live Stripe Billing Intentionally Blocked

| Field | Value |
|:---|:---|
| **Severity** | Controlled — Intentional |
| **Truth State** | `BLOCKED` |
| **Description** | `stripe-test-checkout.js` blocks any key starting with `sk_live_`. Live billing cannot be triggered in the current phase. |
| **Mitigation** | Service-layer check rejects live keys before any Stripe API call. |
| **Next Safe Action** | Phase 16B: Run Stripe test checkout browser run using test cards only. Phase 16E: Replace test key with live key in production hosting env after explicit authorization. |

---

## Risk 4: Provider Keys Must Remain in Local/Host Environment

| Field | Value |
|:---|:---|
| **Severity** | High (if violated) |
| **Truth State** | `LOCAL_ONLY` |
| **Description** | `OPENAI_API_KEY`, `GEMINI_API_KEY`, `VERCEL_TOKEN`, `STRIPE_SECRET_KEY`, `JWT_SECRET`, and `PH_EVO_MASTER_KEY` all live in `.env` which is gitignored. If accidentally committed, secrets would be exposed. |
| **Mitigation** | `.gitignore` enforced. Pre-commit checks scan staged diffs for secret patterns. `git diff --cached` audit before every commit. |
| **Next Safe Action** | Maintain the no-commit-secrets rule permanently. Rotate any key that is accidentally exposed. |

---

## Risk 5: Markdown Lint Warnings in docs and .ai Folders

| Field | Value |
|:---|:---|
| **Severity** | Negligible |
| **Truth State** | `DOCS_HYGIENE_ONLY` |
| **Description** | Some markdown files in `docs/` and `.ai/` may contain trailing whitespace, inconsistent heading spacing, or other lint warnings. |
| **Mitigation** | Run `npm run docs:warnings` to generate a non-blocking warning report. Do **not** delete files to clear warnings. Fix additively in Phase 16F. |
| **Next Safe Action** | Phase 16F: Markdown/Docs Hygiene Pass — formatting fixes only, no deletion. |

---

## Risk 6: Local Proof Does Not Equal Market-Ready

| Field | Value |
|:---|:---|
| **Severity** | Medium (if misrepresented) |
| **Truth State** | `LOCAL_ONLY` |
| **Description** | All verification commands run locally. A clean local verification does not mean the application is ready for public production use. Production requires domain config, CORS, bridge URL, and production secrets. |
| **Mitigation** | Explicit documentation that `LOCAL_ONLY` ≠ `PROVEN`. Handover report classifies systems truthfully. |
| **Next Safe Action** | Complete Phase 16D (domain, CORS, bridge config) and Phase 16E (production deploy) with explicit owner approval. |

---

## Risk 7: Preview Deploy Does Not Equal Production Deploy

| Field | Value |
|:---|:---|
| **Severity** | Medium (if misrepresented) |
| **Truth State** | `PROVEN` (preview only) |
| **Description** | The successful Vercel preview deployment (`dpl_ByS3HpZr5SAbVLnaZMaprWDzeAbT`) is a preview environment. It is not the production deployment. |
| **Mitigation** | Truth state ledger clearly distinguishes `preview` from `production`. Receipt system stores target type. |
| **Next Safe Action** | Phase 16E: Production deploy with explicit approval, after all pre-requisites in the launch checklist are complete. |

---

## Risk 8: Provider Configured Does Not Equal Provider Proven

| Field | Value |
|:---|:---|
| **Severity** | Medium (if misrepresented) |
| **Truth State** | `PROVIDER_GATED` (until probe receipt exists) |
| **Description** | Having `OPENAI_API_KEY` or `GEMINI_API_KEY` set in `.env` does not mean the provider is operational. A receipt from an owner-approved probe is required for `PROVEN` status. |
| **Mitigation** | Truth-state vocabulary enforced throughout. `PROVIDER_GATED` = key present, probe not run. `PROVEN` = receipt exists. |
| **Next Safe Action** | Phase 16C: Run owner-approved minimal AI provider probe and generate receipt. |

---

## Risk 9: Owner Approval Envelope Does Not Equal Provider Success

| Field | Value |
|:---|:---|
| **Severity** | Low |
| **Truth State** | `NEEDS_OWNER_APPROVAL` → `PROVIDER_GATED` (after approval, before probe) |
| **Description** | Generating an owner approval envelope only authorizes an action. The actual provider call must succeed and produce a receipt for `PROVEN` status. |
| **Mitigation** | Approval system generates receipts regardless of success or failure. Both success and blocked receipts are stored. |
| **Next Safe Action** | Run the approved action and check the receipt for actual truth state. |

---

## Risk 10: AI Probes May Spend Tokens

| Field | Value |
|:---|:---|
| **Severity** | Medium |
| **Truth State** | `PROVIDER_GATED` |
| **Description** | Explicitly running an AI provider probe (OpenAI or Gemini) will consume API tokens and may incur cost. |
| **Mitigation** | Cost firewall enforced. Probes require explicit owner approval. Autonomous token spending is disabled. |
| **Next Safe Action** | Phase 16C: Run only after explicit owner decision. Use the smallest possible probe. Review cost estimate before approving. |

---

## Risk 11: Stripe Checkout Must Remain Test Mode

| Field | Value |
|:---|:---|
| **Severity** | High (if violated) |
| **Truth State** | `VERIFIED` (test mode) / `BLOCKED` (live key) |
| **Description** | Using a `sk_live_` Stripe key would enable real billing. The current rail blocks live keys at the service layer. |
| **Mitigation** | Service-layer key format check. Live keys rejected before any Stripe API call. |
| **Next Safe Action** | Phase 16B: Browser test checkout with test card. Phase 16E: Transition to live key only after explicit production authorization. |

---

*This risk register is additive. No existing systems were modified or removed during Phase 15.*
