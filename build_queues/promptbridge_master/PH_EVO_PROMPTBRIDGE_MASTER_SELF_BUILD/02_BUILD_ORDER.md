# PH Evo PromptBridge Build Order

## Phase 0: Local Proof Foundation

- Run local gateway.
- Create SQLite database.
- Expose `/health`.
- Store PromptBridge events.
- Store private memory.

## Phase 1: Browser Bridge

- Load extension unpacked.
- Open side panel.
- Capture visible ChatGPT text by button.
- Send event to local gateway.
- Show capture result in UI.

## Phase 2: Reality + Proof

- Add Reality Twin states.
- Add proof evidence capture.
- Display proof/reality in extension.

## Phase 3: Training Vein

- Add training capture route.
- Training defaults to off.
- Approved examples export to JSONL.
- Rejected outputs export to preference pairs.

## Phase 4: Memory Box

- Local memory modes.
- Scope rules.
- Export/delete/pause memory.
- Optional local vector search later.

## Phase 5: Model Connection

- Add local Ollama or OpenAI-compatible local model connector.
- If not connected, return honest blocked state.
- Never fake model output.

## Phase 6: PromptLink Expansion

- VS Code extension.
- Flutter SDK.
- External client SDK.

## Phase 7: Model Foundry

- Build datasets.
- Run evals.
- Optional LoRA training.
- Register model versions.

## Phase 8: Productization

- Auth.
- API keys.
- Billing/entitlements.
- Public developer API.
- Enterprise private mode.
