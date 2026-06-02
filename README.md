# PromptHouse Evo Studio

The central hub for the PromptHouse Sovereign Finality architecture.
This repository contains the studio user interface, the bridge server, and the autonomous daemons that govern self-evolution.

## Getting Started

## Launch Readiness & Verification
This repository is currently in **Launch Readiness** mode. You can verify the system's integrity using the automated proof script:

```bash
npm run launch:proof
```

### Key Documentation
- [Launch Readiness Guide](./docs/LAUNCH_READINESS_GUIDE.md) — Setup and verification path.
- [Five-Minute Demo Workflow](./docs/DEMO_WORKFLOW.md) — Flagship demo loop.
- [Pilot Roadmap](./docs/PILOT_ROADMAP.md) — Future milestones and criteria.

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

### 1. Environment
Copy `.env.example` to `.env` and fill in your keys. Do not commit `.env`!

```bash
cp .env.example .env

### 2. Install Dependencies
```bash
npm install
```

### 3. Run the Studio (Local Development)
Start the complete stack (React UI + Bridge Server + Daemons):

```bash
npm run dev:all
```
*Note: The frontend runs on `http://localhost:5173` and the Bridge API runs on `http://127.0.0.1:3001`.*

## Project Structure

- `src/` — React UI and core engines
  - `src/core/` — The physics, autonomy, and logic modules
  - `src/features/` — High-level dashboard views
  - `src/components/` — Shared React components
  - `src/server/` — Express backend modular routes
- `promptbridge-server.js` — The monolith core (being modularized)
- `scripts/` — Autonomous background daemons (NightForge, Self-Invention)
- `tests/` — Vitest unit and integration suites

## Testing
We use `vitest` for the testing suite.

```bash
npm run test
```

## Security Notice
This is a production-grade enterprise system. 
- Ensure `.env` is never committed.
- Keep `JWT_SECRET` and `PH_EVO_MASTER_KEY` highly secure.
- Ensure `CrashProofEngine` wraps all daemon intervals to prevent silent failures.
