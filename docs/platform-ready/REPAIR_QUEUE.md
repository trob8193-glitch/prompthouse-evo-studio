# Platform Sentinel Repair Queue

Generated: 2026-06-26T14:42:19.440Z
Verdict: PLATFORM_READY
Score: 100

## Repairs


## Online Blockers

1. **P1** Evo API remote connectivity check
   - Provider: evo
   - Reasons: Failed to connect to Evo API URL (https://api.evo.prompthouse.dev/v1/chat/completions)
   - Route: POST /api/connectors/evo/probe
   - Proof: npm run proof:connectors:live
   - Next: Verify network connection to https://api.evo.prompthouse.dev/v1/chat/completions and ensure the endpoint is active.
