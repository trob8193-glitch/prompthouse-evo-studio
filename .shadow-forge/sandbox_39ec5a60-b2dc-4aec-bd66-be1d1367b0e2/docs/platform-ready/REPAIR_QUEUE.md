# Platform Sentinel Repair Queue

Generated: 2026-06-12T08:35:30.731Z
Verdict: BLOCKED
Score: 86

## Repairs

1. **P0** Raw un-redacted credential detected: sk-proj-...
   - Detail: SETUP_OPENAI_AGENT.md

## Online Blockers

1. **P1** Stripe live revenue mode
   - Provider: stripe
   - Reasons: STRIPE*SECRET_KEY must start with sk_live*
   - Route: POST /api/commerce/checkout
   - Proof: npm run proof:providers:live
   - Next: Use a live Stripe key only when ready for real customer payments and keep commerce owner approval required.
2. **P1** Evo API remote connectivity check
   - Provider: evo
   - Reasons: Failed to connect to Evo API URL (<https://api.evo.prompthouse.dev/v1/chat/completions>)
   - Route: POST /api/connectors/evo/probe
   - Proof: npm run proof:connectors:live
   - Next: Verify network connection to <https://api.evo.prompthouse.dev/v1/chat/completions> and ensure the endpoint is active.
