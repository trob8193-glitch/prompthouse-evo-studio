# PH Evo API + Evo LM + PromptBridge + Model Foundry Master Self-Build

This pack answers the core ownership question:

**PH Evo API is not the model.**

- **Evo LM** is the model family/checkpoints/adapters that get trained.
- **PH Evo API** is the gateway that serves Evo LM, routes requests, controls memory, captures training events, checks billing/entitlements, and logs proof.
- **PromptBridge** is the event protocol that connects browser, studio, VS Code, Flutter, Memory Box, API, and training.
- **Memory Box** is the local-first per-user memory node.
- **Model Foundry** is the training, dataset, eval, registry, and deployment system.
- **Training Vein** is the capture layer attached to every approved PH Evo API surface.

## Build truth

This is a real blueprint and starter build pack. It is not a claim that your production system is already trained, deployed, audited, enterprise-certified, or market-proven.

The included code is a local-first scaffold and can be run/developed. The model itself is trained by the Model Foundry pipeline using open-weight/local/free routes or later paid GPU routes. OpenAI is optional and not required for the native training loop.

## First local run target

1. Start the local gateway.
2. Load the browser extension.
3. Capture a PromptBridge event.
4. Store private memory.
5. Export approved JSONL.
6. Run sanitizer/eval scripts.
7. Connect a local model endpoint when ready.

No fake green checks. Every component must move through designed → implemented → running → tested → verified.
