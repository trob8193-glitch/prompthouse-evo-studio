# ShellBridge PTY Backend

## What this is
A backend WebSocket server that connects the browser terminal UI to a real shell.

## Why this exists
The browser terminal component can capture keys and render output. It cannot directly execute host OS commands on its own. Real command execution must happen on a backend, sandbox, remote container, desktop wrapper, or trusted agent.

## Install
```bash
npm install ws node-pty
npm install -D tsx @types/node
```

## Run
```bash
npx tsx server/evo-pty-server.ts
```

## Connect
```tsx
<EvoTermPane mode="pty" websocketUrl="ws://localhost:8787/pty" />
```

## Security boundary
Do not expose this server publicly without authentication, authorization, sandboxing, command policy, network isolation, logging, and rollback controls.
