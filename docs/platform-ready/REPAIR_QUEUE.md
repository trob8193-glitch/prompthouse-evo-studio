# Platform Sentinel Repair Queue

Generated: 2026-06-10T04:05:03.835Z
Verdict: PROVIDER_GATED
Score: 95

## Repairs


## Online Blockers

1. **P1** Stripe live revenue mode
   - Provider: stripe
   - Reasons: STRIPE_SECRET_KEY must start with sk_live_
   - Route: POST /api/commerce/checkout
   - Proof: npm run proof:providers:live
   - Next: Use a live Stripe key only when ready for real customer payments and keep commerce owner approval required.
2. **P0** Vercel live connector proof
   - Provider: vercel
   - Reasons: VERCEL_TOKEN missing
   - Route: POST /api/connectors/vercel-1/probe
   - Proof: npm run proof:connectors:live
   - Next: Add VERCEL_TOKEN and run a deploy-approved Vercel connector proof.
3. **P0** Vercel preview deployment
   - Provider: vercel
   - Reasons: VERCEL_TOKEN missing
   - Route: POST /api/vercel/preview-deploy
   - Proof: npm run proof:providers:live
   - Next: Add VERCEL_TOKEN before requesting a preview deployment.
4. **P0** Vercel production deployment
   - Provider: vercel
   - Reasons: VERCEL_TOKEN missing
   - Route: POST /api/deployment/vercel/preview
   - Proof: npm run platform:strict
   - Next: Add VERCEL_TOKEN and set DEPLOY_ALLOW_PRODUCTION=true only when production deploys are owner-approved.
5. **P2** GitHub live connector proof
   - Provider: github
   - Reasons: GITHUB_TOKEN missing
   - Route: POST /api/connectors/github-1/probe
   - Proof: npm run proof:connectors:live
   - Next: Add GITHUB_TOKEN if you want GitHub provider proof instead of local Git contract checks.
