# Preview Deploy Browser Verification

PromptHouse Evo Studio implements a safe, additive verification rail for Vercel Preview Deployments and Browser-facing truth-states.

## 1. Vercel Preview Only
- All deployment actions in this phase are restricted to **Preview Deployments**.
- Production deployment is explicitly **BLOCKED** (`DEPLOY_ALLOW_PRODUCTION=false`).
- A valid `VERCEL_TOKEN` (starts with `vcp_`) must be configured in the local `.env`.
- Every deployment request requires an **Owner Approval Envelope** (scope: `deploy`).

## 2. Browser Verification Checklist
The studio includes a `BrowserPreviewVerificationPanel` for manual verification of the frontend state once deployed.
- Verify the Preview URL is reachable.
- Confirm the App Shell and all proof panels render correctly.
- Ensure no raw secrets (API keys/tokens) are exposed in the UI.
- Validate that production and live billing states are shown as blocked.

## 3. Stripe Test Mode
- Stripe checkout sessions are restricted to **Test Mode** (`sk_test_`).
- Live billing is explicitly **BLOCKED**.
- Checkout sessions require owner approval (scope: `commerce`).
- Use Stripe test card numbers (e.g., `4242 4242 4242 4242`) on the Stripe-hosted checkout page.

## 4. Verification & Proof
- Each successful preview deployment generates a **Deployment Receipt**.
- The `preview:smoke` script (`scripts/preview-smoke-check.mjs`) can be used to programmatically verify that a preview URL is reachable and contains the Studio markers.
- Final Truth States:
  - `VERIFIED`: Token/approval exists.
  - `PROVEN`: Deployment receipt exists + Smoke check passed.
  - `LOCAL_ONLY`: Manual checks required or simulation mode.

## 5. Security Mandate
- **NEVER** commit `.env` or staged secrets.
- **NEVER** set `DEPLOY_ALLOW_PRODUCTION=true` during this phase.
- **NEVER** use `sk_live_` keys.
