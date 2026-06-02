# PH Evo PromptBridge System Blueprint

## Definition

**PromptBridge** is the communication and routing layer between PH Evo surfaces.

It connects:

```text
PH Evo Bridge Browser Extension
PH Evo Memory Box
PH Evo API Gateway
PH Evo Model Endpoint
PH Evo PromptLink
VS Code Extension
Flutter SDK
Training Vein
Proof Console
Reality Twin
Model Foundry
```

## Core flow

```text
User action
  → PromptBridge Event
  → Consent Gate
  → Boundary Sanitizer
  → Reality Twin Ledger
  → Memory Box / RAG / Model / Training / Proof Route
  → UI state update
```

## Main products

### PH Evo Bridge Browser Extension
Visible cockpit with panels:
1. Home Deck
2. Live Command Graph
3. Chat Capture
4. Prompt Library
5. Bot Cast
6. Firing Orders
7. Canon Vault
8. Reality Twin
9. Proof Console
10. Connectors
11. Image Canon
12. Exports
13. Memory Box
14. Automation Studio
15. Training Vein
16. Model Foundry
17. Prompt DNA Compiler
18. Commerce Launch Deck
19. Settings

### PH Evo Memory Box
Local-first memory node:
- local SQLite vault
- user consent settings
- memory scope policy
- secret sanitizer
- local export
- optional sync/contribution later

### PH Evo Gateway API
Routes:
- `/v1/promptbridge/events`
- `/v1/memory/write`
- `/v1/memory/query`
- `/v1/training/capture`
- `/v1/training/datasets/export`
- `/v1/reality/claims`
- `/v1/proof/evidence`
- `/v1/infer/chat`

### Training Vein
Turns approved use into training signals:
- user prompts
- accepted outputs
- rejected outputs
- user edits
- proof results
- test results
- code diffs
- workflow traces

### Model Foundry
Turns approved data into:
- SFT JSONL
- preference pairs
- eval cases
- model registry entries
- optional LoRA jobs

## Hard boundary

The browser extension does not own the browser. It only operates on approved pages and actions. It captures only when the user clicks capture, or when a user-enabled workflow explicitly runs.
