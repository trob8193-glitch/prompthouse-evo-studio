# Model Foundry Master Blueprint

## Native organs

1. **Corpus Vault**: stores owned/allowed data.
2. **Dev Language Grammar Forge**: stores PH Evo language patterns.
3. **Tokenizer Forge**: trains tokenizer/special tokens.
4. **PromptLink Dataset Forge**: turns events into SFT/preference/evals.
5. **Boundary Sanitizer**: removes blocked data.
6. **Synthetic Studio Pattern Engine**: generates examples from studio laws.
7. **Execution Kernel Training Orchestrator**: queues/runs training.
8. **Sovereign GPU Runtime**: local/free/cloud GPU execution surface.
9. **Proof Console Eval Bench**: validates model behavior.
10. **Versioned Model Registry**: stores model lineage.
11. **Crown Deployment Sequencer**: promotes/rolls back model versions.

## Dataset routes

| Route | Input | Output |
|---|---|---|
| RAG | approved memory/docs | vector memory |
| SFT | prompt + ideal answer | train.jsonl |
| Preference | prompt + chosen + rejected | preference.jsonl |
| Eval | edge cases/proof tests | eval.jsonl |
| Synthetic | PH Evo laws/patterns | synthetic training data |

## Core folders

```text
model-foundry/
  corpus-vault/
  tokenizer-forge/
  sanitizer/
  dataset-forge/
  training/
  evals/
  registry/
  deployment/
```
