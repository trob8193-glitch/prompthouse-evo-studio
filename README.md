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
- live-run and local-spec flows remain available, but they do not claim provider-backed completion without provider receipts

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

## Proof-Gated Architecture

This studio implements a proof-gated backend layer that separates local readiness from provider-backed execution. All proof gates are read-only and can be inspected without credentials.

### Proof Routes

Provider, security, and diagnostics surfaces:

- `GET /api/provider-gates/status` — credential presence (redacted, never raw keys)
- `GET /api/provider-receipts` — provider interaction receipts
- `GET /api/provider/status` — alias for provider gate status
- `GET /api/security/audit` — static security analysis report
- `GET /api/security/routes` — extracted route definitions
- `GET /api/security/mutations` — ungated mutation route audit
- `GET /api/diagnostics/routes` — route coverage classification
- `GET /api/diagnostics/imports` — import resolution audit
- `GET /api/diagnostics/css-vars` — CSS variable coverage audit
- `GET /api/diagnostics/worktree` — directory structure verification

### Proof Center

The **Proof Center** (`Operations > Proof Center` in sidebar) is a centralized dashboard that displays:

- Route diagnostics and coverage
- Security audit results
- Provider gate status and receipts
- Owner approval envelopes for deploy, commerce, and self-implementation actions

### Owner Approval Scopes

| Scope | Action |
|---|---|
| `deploy` | Push builds to external hosts (requires `VERCEL_TOKEN`) |
| `commerce` | Mutate live billing objects (requires `STRIPE_SECRET_KEY`) |
| `mutation` | Write to protected resources |
| `self_implementation` | Allow studio to modify its own source files |

Approval envelopes are created locally via explicit UI click. An approval envelope does **not** equal provider success. Provider execution still requires real credentials and provider response.

### Deployed Frontend

When deployed, the frontend needs `VITE_BRIDGE_URL` set to point to the bridge server. Without it, proof panels will show bridge offline state (which is accurate, not faked).

## Truth States

All system components report using these canonical truth states:

| State | Meaning |
|---|---|
| `BUILT` | Local implementation exists |
| `VERIFIED` | Runtime proof exists (local tests pass, audits green) |
| `BLOCKED` | Action intentionally cannot complete yet |
| `PROVEN` | Provider-backed receipt confirms real execution |
| `LOCAL_ONLY` | Feature works locally, not connected to external service |
| `PROVIDER_GATED` | Feature requires external provider credentials |
| `NEEDS_CREDENTIALS` | API keys not configured |
| `NEEDS_OWNER_APPROVAL` | Explicit owner approval envelope required |
| `ERROR` | Runtime error or bridge communication failure |
| `UNKNOWN` | State cannot be determined |

## Full Verification

Complete verification command:

```powershell
npm run verify:studio
```

This runs in order: syntax check, import audit, CSS audit, test suite, production build.

For the full proof report:

```powershell
npm run proof:report
```

This generates `.prompthouse-data/proof-report.json` and `.prompthouse-data/proof-report.md` with pass/fail status, route coverage, security audit summary, and provider gate status.

## Deployment Readiness

Local proof does not equal production deployment. The **Deployment Center** (`Operations > Deployment Center`) provides pre-flight readiness checks, deployment receipts, and owner-approved deploy actions.

### Pre-Deploy Checklist

Before any deployment attempt:

```powershell
npm run verify:studio
npm run proof:report
npm run deployment:readiness
```

### Requirements for Real Deployment

| Requirement | Details |
|---|---|
| `VITE_BRIDGE_URL` | Deployed frontend must point to a reachable bridge URL |
| `CORS_ORIGINS` | Must include the deployed frontend origin |
| `VERCEL_TOKEN` | Required for Vercel preview/production deploys |
| `VERCEL_PROJECT_ID` | Required for Vercel integration |
| Owner Approval | Explicit `deploy` scope approval envelope required |
| Proof Report | Must exist and show `VERIFIED` state |

### Preview vs Production Deploy

- **Preview deploy**: Requires `VERCEL_TOKEN` + owner approval with scope `deploy`. Creates a temporary deployment URL.
- **Production deploy**: Requires all of the above **plus** `DEPLOY_ALLOW_PRODUCTION=true`. Disabled by default.
- **Both**: Create deployment receipts. Success receipts only appear with real provider response and deployment URL.

### Deployment Receipts

All deployment attempts (successful, blocked, or failed) are logged to `.prompthouse-data/deployment_receipts.jsonl`. Receipts include:

- Action type (readiness_check, preview_deploy, production_deploy, blocked)
- Provider and truth state
- Request/response hashes (never raw secrets)
- Deployment URL (only when real)

### Safety Guarantees

- No auto-deploy from any GET route
- No deploy without explicit POST + owner approval envelope
- No secrets in deployment receipts or readiness reports
- No `PROVEN` truth state without real provider response
- No production deploy unless `DEPLOY_ALLOW_PRODUCTION=true`


