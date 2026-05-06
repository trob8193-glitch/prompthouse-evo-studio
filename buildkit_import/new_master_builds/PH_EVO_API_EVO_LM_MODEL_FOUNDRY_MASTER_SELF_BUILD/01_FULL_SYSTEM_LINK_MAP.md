# Full Link Map

## Components

| Component | What it is | What it owns |
|---|---|---|
| PH Evo Bridge Browser Extension | Browser cockpit | Chat capture, prompt library, UI, safe automation, PromptBridge client |
| PromptBridge | Event protocol/routing contract | Events, source labels, training policy, memory/proof packets |
| PH Evo API / Sovereign Gateway | Backend gateway/control plane | Auth, scopes, billing, model routing, memory, training events, proof, connectors |
| Evo LM | Trainable model family | Base, adapters, checkpoints, tokenizer, model behavior |
| PH Evo Memory Box | Local-first memory node | Private device memory, sync rules, local vector memory, consent state |
| PH Evo Model Foundry | Training factory | Dataset builder, sanitizer, LoRA, tiny base pretraining, evals, registry |
| Training Vein | Training capture layer | Approved events from every PH Evo API surface |
| Proof Console | Evidence system | Tests, claims, launch readiness, model eval proof |
| Reality Twin | Truth ledger | promised/built/blocked/verified/human-required state |
| Product Commerce Core | Monetization layer | plans, billing, entitlements, API access |
| External AI Router | Optional fallback/comparison | external provider routing, never core ownership |

## Main request path

```text
Browser Extension / Studio / VS Code / Flutter
  → PromptBridge event
  → PH Evo API
  → Auth, scope, entitlement, consent
  → Memory query through Memory Box/cloud memory
  → Model Invocation Gate
  → Evo LM endpoint
  → Output
  → Proof Console evidence
  → Reality Twin state update
  → Training Vein if allowed
```

## Main training path without OpenAI

```text
PH Evo usage
  → user prompt / output / edit / accepted final / rejected output / test result
  → PromptBridge event
  → PH Evo API Training Vein
  → Consent Gate
  → Boundary Sanitizer
  → Rights and provenance filter
  → Dataset Forge
  → SFT JSONL / preference pairs / eval cases / RAG memory
  → Local or free training job
  → Evo LM adapter/checkpoint
  → Proof Console Eval Bench
  → Versioned Model Registry
  → Crown Deployment Sequencer
  → PH Evo API serves new Evo LM version
```

## User-specific vs global behavior

- Same PH Evo API can serve every user.
- Same Evo LM core model family can serve every user.
- Each user gets separate memory, scopes, tools, consent, plan, and workspace context.
- Global learning only receives approved, sanitized, rights-cleared generalized examples.
- Private user data never becomes another user’s memory.
