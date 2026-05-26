# Platform Ready Contract

PromptHouse Evo Studio may only claim `PLATFORM_READY` when Platform Sentinel reports zero critical blockers, all critical modules pass, required scripts exist, required docs exist, route/API surfaces are present, and build/test/audit gates pass.

## Allowed truth labels

- BUILT
- VERIFIED
- PROVEN
- BLOCKED
- FAILED
- PROVIDER_GATED
- OWNER_APPROVAL_REQUIRED
- NEEDS_REPAIR
- READY_FOR_PILOT
- PLATFORM_READY

## Block rule

Fake release language is blocked unless supported by receipts. Live deploy, live commerce, paid provider calls, and destructive changes remain provider-gated or owner-approval-gated until credentials and explicit approval are present.
