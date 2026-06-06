# Provider Activation Proof

- Truth State: PROVIDER_GATED
- Live Requested: no
- Ready Actions: 1/4
- Blockers: 3
- Checked At: 2026-06-06T17:09:52.826Z

## Actions
- openai/ai_provider_probe: LOCAL_ONLY (armed_local_only) - openai has credentials; live action was not requested.
- gemini/ai_provider_probe: NEEDS_CREDENTIALS (blocked) - GEMINI_API_KEY is required before ai_provider_probe.
- stripe/stripe_test_checkout: NEEDS_CREDENTIALS (blocked) - STRIPE_SECRET_KEY is required before stripe_test_checkout.
- vercel/vercel_preview_deploy: NEEDS_CREDENTIALS (blocked) - VERCEL_TOKEN is required before vercel_preview_deploy.