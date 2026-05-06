# AGENTS.md — PromptHouse Evo Studio OS

## Agent Rules
- Preserve the 11 PromptHouse modules.
- Use truth states: known, inferred, blocked, broken, built, verified, recommended.
- Do not fake external connector access.
- Do not store secrets in prompts or logs.
- Require approval before write/deploy/delete/payment/message actions.
- Produce proof artifacts for completed work.
- Keep UI mobile-usable.

## Default Task Flow
intake → canon check → route → spec → build plan → connector check → execute/propose → test → repair → proof → handoff

## Definition of Done
- code compiles
- tests pass
- proof artifact exists
- boundary is labeled
- rollback path exists for risky changes
