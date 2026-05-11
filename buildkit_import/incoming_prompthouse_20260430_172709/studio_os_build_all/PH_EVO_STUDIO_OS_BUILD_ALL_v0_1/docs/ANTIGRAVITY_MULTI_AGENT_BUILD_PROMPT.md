# Antigravity Multi-Agent Build Prompt

## Mission
Build PromptHouse Evo Studio OS from this repo scaffold into a production-ready MVP.

## Agent Split

### Agent 1 — Frontend Shell
Owns:
- `app/page.tsx`
- `components/studio/*`
- responsive dashboard
- screen navigation
- mobile approval queue

Deliver:
- polished UI
- screenshots
- accessibility check notes

### Agent 2 — Studio Core
Owns:
- `lib/studio/types.ts`
- `lib/studio/pipeline.ts`
- mission lifecycle
- prompt-to-app transforms
- truth-state validation

Deliver:
- working domain services
- unit tests

### Agent 3 — Connector Broker
Owns:
- connector contracts
- `/api/connectors/live-run`
- approval queue
- OpenAPI importer stub
- MCP server design stub

Deliver:
- live-run only connector flows
- approval gates for writes
- audit log model

### Agent 4 — QA and Proof
Owns:
- Vitest tests
- QA report generation
- proof artifact model
- deployment gates

Deliver:
- tests passing
- proof deck UI
- ship gate cannot pass without proof

### Agent 5 — Product Docs
Owns:
- README
- install docs
- valuation note
- user guide
- live validation checklist

Deliver:
- founder-ready docs
- demo script

## Required Build Flow
intake → canon check → route → spec → build plan → connector check → execute/propose → test → repair → proof → handoff

## Non-Negotiable Boundaries
- Do not fake connector access.
- Do not store secrets in prompts.
- Do not mark deployment shipped without proof.
- Default connector actions to live-run.
- Approval required for writes, deploys, deletes, payments, external messages, and database mutations.

## Acceptance Criteria
1. `npm run build` passes.
2. `npm test` passes.
3. All ten studio surfaces render.
4. Rough idea generates VibeSpec → PromptSpec → AppSpec → AgentTasks.
5. Connector live-run returns approval request for risky actions.
6. Ship gate fails without proof artifacts.
7. Mobile viewport remains usable.
8. README explains setup and boundaries.
