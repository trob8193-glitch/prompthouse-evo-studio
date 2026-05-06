# PH Evo ForgeTerm Terminal Module v1.0

Built: 2026-04-30

## Mission
Add a PromptHouse-native embedded terminal pane to the React studio UI.

## Canon Name
**ForgeTerm Pane**

## What it is
ForgeTerm Pane is a PromptHouse Evo Studio terminal/shell widget for React.

It has two modes:

1. **Virtual Mode** — runs safe fake/studio commands directly in the browser for demos and onboarding.
2. **PTY Mode** — connects to a backend WebSocket PTY server that runs a real shell in a controlled sandbox.

## No-bullshit boundary
A normal browser cannot directly execute your computer's real shell commands by itself. The UI can capture commands, but real shell execution must happen through a backend, sandbox, desktop wrapper, container, WebContainer-style runtime, or remote agent. This package includes the UI and a backend PTY server scaffold.

## Files
- `src/components/forgerail/EvoTermPane.tsx` — embedded terminal pane component
- `src/lib/forgerail/evoTerminalTypes.ts` — terminal types
- `src/lib/forgerail/evoTerminalPolicy.ts` — command safety and approval rules
- `src/lib/forgerail/proofReceipts.ts` — Proof Deck receipt helpers
- `server/evo-pty-server.ts` — WebSocket PTY server scaffold
- `recipes/evo_terminal.agent.yaml` — PromptHouse agent recipe
- `docs/TERMINAL_NAMES_AND_CANON.md` — canon names and architecture

## Install dependencies
```bash
npm install @xterm/xterm @xterm/addon-fit
npm install -D @types/node
npm install ws node-pty
npm install -D tsx
```

## React use
```tsx
import { EvoTermPane } from "./src/components/forgerail/EvoTermPane";

export default function StudioTerminal() {
  return (
    <EvoTermPane
      mode="virtual"
      title="ForgeTerm Pane"
      projectName="PromptHouse Evo Studio"
    />
  );
}
```

## Real shell use
Start backend:
```bash
npx tsx server/evo-pty-server.ts
```

Then:
```tsx
<EvoTermPane mode="pty" websocketUrl="ws://localhost:8787/pty" />
```

## Proof rule
No command is marked verified until it produces a Proof Deck receipt.
