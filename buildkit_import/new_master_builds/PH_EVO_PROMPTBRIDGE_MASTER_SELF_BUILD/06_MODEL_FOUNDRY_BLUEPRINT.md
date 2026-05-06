# PH Evo Model Foundry Blueprint

## Purpose

Turn approved PH Evo usage into real datasets, evals, adapters, registry entries, and model versions.

## Inputs

- PromptHouse canon
- PH Evo role names
- firing orders
- prompt syntax
- canon packet syntax
- browser-action packets
- JSON/Markdown
- Flutter/Dart
- TypeScript
- Python
- user-approved PromptLink data
- accepted outputs
- rejected outputs
- user edits
- proof results

## Outputs

- SFT JSONL
- preference pairs JSONL
- eval cases JSONL
- model registry entries
- training job manifests
- LoRA/adapter training runs when hardware exists

## Special tokens

```text
<PH_CANON>
<PH_ROLE>
<PH_PACKET>
<PH_FIRE_ORDER>
<PH_TRUTH>
<PH_BLOCKED>
<PH_VERIFIED>
<PH_BROWSER_ACTION>
<PH_RISK>
<PH_EVAL>
<PH_PRODUCT_FORGE>
<PH_MEMORY>
<PH_TRAINING_EVENT>
```

## Evals

- canon consistency
- truth boundary
- fake execution blocking
- browser automation safety
- PromptLink dataset eligibility
- PH Evo cast routing
- coding ability
- Flutter ability
- VS Code workflow ability
- monetization/product forge ability
- refusal/risk packet quality
