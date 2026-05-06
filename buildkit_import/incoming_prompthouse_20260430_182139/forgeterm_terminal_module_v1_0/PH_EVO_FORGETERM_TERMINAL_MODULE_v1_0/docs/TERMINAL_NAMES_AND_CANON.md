# ForgeTerm Canon Names

## Module Name
**ForgeTerm Pane**

## Subsystem Names
- **ForgeTTY** — the terminal emulation layer
- **ShellBridge** — the backend bridge that runs real commands
- **VirtualShell** — safe browser-only demo command runner
- **SovereignGate** — approval gate for risky commands
- **BoundaryFilter** — command risk classifier
- **LedgerTrace** — proof receipt logger
- **HeartbeatPTY** — connection/health monitor
- **PromptLinkExec** — future bridge from Evo LM to external execution providers
- **CommandSigil** — saved command template
- **ProofEcho** — terminal output attached to Proof Deck

## Kid-simple explanation
The terminal pane is like a walkie-talkie.

The browser side is the microphone.
The backend side is the person who can actually touch the computer.

If you only have the browser, it can pretend or run safe studio commands.
If you want real commands, you need a backend shell bridge.

## PromptHouse build flow
User command
→ ForgeTerm Pane
→ BoundaryFilter
→ SovereignGate if risky
→ ShellBridge or VirtualShell
→ LedgerTrace proof receipt
→ Proof Deck
→ repair if failed

## Terminal modes
### Virtual Mode
Safe for UI demos. Runs commands like:
- help
- ph status
- ph bots
- ph proof
- ph build forgerail
- ph builder new-agent

### PTY Mode
Connects to backend WebSocket and runs a real shell process.
Use only inside a sandbox, local dev machine, remote container, or trusted server.
