# PromptHouse Evo Studio

The central hub for the PromptHouse Sovereign Finality architecture.
This repository contains the studio user interface, the bridge server, and the autonomous daemons that govern self-evolution.

## Getting Started

### 1. Environment
Copy `.env.example` to `.env` and fill in your keys. Do not commit `.env`!

```bash
cp .env.example .env
```

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
