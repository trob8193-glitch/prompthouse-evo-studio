# Release Checklist

Use this before calling PromptHouse Evo Studio `proof-gated launch ready`.

## Runtime Gates

- `node --check promptbridge-server.js` passes
- `npm test` passes
- `npm run build` passes
- frontend starts
- bridge starts
- `/status` responds
- `/api/release-spine/status` responds
- `/api/studio-os/inspector` responds

## Worktree Gates

- `/api/generated-artifact-registry` reports `unknown: 0`
- imported trees remain preserved
- generated trees remain preserved
- no release claim is made while unknown dirty paths remain
- `WORKTREE_INVENTORY.md` reflects the current handling rules

## Route Contract Gates

- `/api/bridge-contract-ledger` reports `notImplemented: 0`
- supported routes do not fall through to accidental `404`
- dormant routes are explicitly classified as `deprecated` or `blocked`
- known unsupported routes return structured `501` contract responses with guidance

## Build Review Gates

- `/api/build-review-gate` is `verified` or `reviewed`
- oversized JS chunks are either eliminated or explicitly dispositioned in `BUILD_REVIEW_GATE.md`
- any remaining build warnings are documented with rationale and owner sign-off

## Source Truth Gates

- `/api/project-handshake` responds
- duplicate source imports are reused, not duplicated
- unreadable or login-gated sources never claim complete coverage
- readable sources expose `readabilityState`, `coveragePercent`, `claimCount`, `duplicateFree`, and `evidenceRequired`
- local build packet DOCX import is visible through `/api/prompt-os/packet`

## Owner Approval Gates

- production deploy refuses execution without:
  - `ownerApproval.granted === true`
  - `scope === "deploy"`
  - `VERCEL_TOKEN`
- live commerce refuses execution without:
  - `ownerApproval.granted === true`
  - `scope === "commerce"`
  - `STRIPE_SECRET_KEY`
- dry-run and local-spec flows never masquerade as provider-verified execution

## Self-Implementation Gates

- `GET /api/self-implementation/status` performs no repo or brain mutation
- `POST /api/self-implementation/cycle` is verification-only unless `applyFixes: true`
- verify-only cycles do not update `.sovereign-brain.json`
- production deploy and live commerce remain `gated` until approval and provider proof exist

## Operator Visibility Gates

- release spine exposes `promised`, `built`, `blocked`, and `proven`
- inspector exposes worktree, route parity, build review, and prompt packet state
- README documents approval rules, truth boundaries, and packet import behavior

## Non-Release States

Do not ship under any of these conditions:

- tests failing
- unknown worktree entries
- route ledger drift
- unread build warning story
- live actions executing without approval
- unreadable project source claiming full coverage
- self-implementation health checks mutating local state implicitly
