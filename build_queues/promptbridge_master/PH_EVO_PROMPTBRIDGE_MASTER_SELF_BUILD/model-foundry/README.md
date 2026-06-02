# PH Evo Model Foundry

This folder converts approved PromptBridge events into training datasets, preference pairs, evals, and model registry entries.

## Safe order

1. Export approved data from gateway.
2. Sanitize again.
3. Build JSONL.
4. Run evals.
5. Run LoRA training only when dependencies/hardware exist.
6. Register model version only after eval pass.
