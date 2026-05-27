# PromptHouse Evo Studio

PromptHouse Evo Studio is a local-first React/Vite studio shell plus an Express bridge. This checkout is now wired around a truth spine: worktree classification, route contract parity, build review, project-source coverage, and explicit approval rails for live deploy and commerce.

The target term for this repo is `proof-gated launch ready`, not `market ready`. Local proof can be verified here. External production actions stay gated until credentials, owner approval, and provider receipts exist.

## Runtime

- Frontend: `npm run dev`
- Bridge: `npm run bridge`
- Both: `npm run dev:all`
- Build: `npm run build`
- Tests: `npm test`

Bridge default URL: `http://localhost:3001`  
Frontend default URL: `http://localhost:5173`

## Truth Spine Surfaces

Operator and release status live here:

- `/api/generated-artifact-registry`
- `/api/bridge-contract-ledger`
- `/api/build-review-gate`
- `/api/release-spine/status`
- `/api/project-handshake`
- `/api/project-handshake/coverage`
- `/api/prompt-os/packet`
- `/api/self-implementation/status`
- `/api/self-implementation/cycle`
- `/api/studio-os/inspector`

These surfaces distinguish:

- `promised`
- `built`
- `blocked`
- `proven`

## Owner Approval Rail

Live deploy and live commerce are blocked by default. They require an explicit approval envelope plus real provider credentials.

Approval shape:

```json
{
  "ownerApproval": {
    "granted": true,
    "grantedAt": "2026-05-03T15:44:00.000Z",
    "actor": "studio_owner",
    "scope": "deploy",
    "receiptId": "deploy_receipt_001"
  }
}
```

Rules:

- `POST /api/deploy` requires `ownerApproval` for scope `deploy` and `VERCEL_TOKEN`
- live commerce execution requires `ownerApproval` for scope `commerce` and `STRIPE_SECRET_KEY`
- dry-run and local-spec flows remain available, but they do not claim provider-backed completion

## Project Source Truth

Project-source truth accepts:

- URL handshakes
- pasted/exported source text
- local build packet DOCX imports

Default local build packet:

`C:/Users/Noname/Downloads/Prompt_House_Evo_Native_AI_Chat_Prompt_OS_Build_Packet.docx`

The DOCX import path is additive and duplicate-aware. It is stored as `sourceType: local_build_packet_docx` and contributes canonical claims, mission phases, prompt cells, and preserved surface mappings.

Private ChatGPT project links are treated honestly:

- readable content: coverage can be computed
- login-gated or unreadable content: `coveragePercent` must remain `0`
- duplicate imports reuse the same source record instead of creating copies

## Self-Implementation Boundary

Self-implementation is split into read-only health and explicit mutation:

- `GET /api/self-implementation/status` is read-only
- `POST /api/self-implementation/cycle` is verification-only by default
- `applyFixes: true` is the only mutating cycle mode

Production deploy and live commerce remain gated even when self-implementation is active.

## Local Data and Artifacts

Bridge-backed local state is stored under:

```text
.prompthouse-data/
```

Important files:

- `.prompthouse-data/project_handshakes.json`
- `.prompthouse-data/self_implementation_state.json`
- `.prompthouse-data/self_implementation_cycles.json`

Generated and imported artifacts are preserved in place:

- `generated_apps/`
- `buildkit_import/`
- `build_queues/`
- `temp_prompts/`

The no-delete rule applies to imported/generated trees during release hardening. They are classified and gated, not removed.

## Environment

Common external keys:

```text
OPENAI_API_KEY=
STRIPE_SECRET_KEY=
VERCEL_TOKEN=
JWT_SECRET=
```

Without these keys, the studio can still run and prove local behavior, but it cannot truthfully claim live deploy or live billing execution.

## Verification

Minimum proof loop:

```powershell
node --check promptbridge-server.js
npm test
npm run build
```

Recommended runtime checks:

```text
http://localhost:3001/status
http://localhost:3001/api/release-spine/status
http://localhost:3001/api/project-handshake
http://localhost:3001/api/prompt-os/packet
http://localhost:3001/api/self-implementation/status
http://localhost:3001/api/studio-os/inspector
```

## Release Claim Language

Use these terms precisely:

- `built`: local implementation exists
- `verified`: runtime proof exists
- `blocked`: action intentionally cannot complete yet
- `proof-gated launch ready`: local product loop is proven, while external provider actions remain gated by approval or credentials

Do not call this repo `100% market ready` from UI labels alone.
