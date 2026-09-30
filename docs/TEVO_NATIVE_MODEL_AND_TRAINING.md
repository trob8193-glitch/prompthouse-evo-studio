# Native Model and Training Fabric

TEVO treats local LLMs, model adapters, PyTorch jobs and LoRA jobs as native evolutionary resources.

A model record must include identity, provider, version and provenance. Training is an actual process invocation, not a simulated result. The process exit code, stdout, stderr, timing and receipt hash are retained.

Recommended real workload chain:
1. Dataset is versioned and hashed.
2. Training or LoRA process runs through TEVO's execution fabric.
3. Checkpoint is hashed.
4. Independent evaluation runs against a frozen baseline.
5. Regression, cost and resource checks run.
6. Proof receipt is created.
7. Promotion is permitted only when the receipt is verified.

Split-tether integration should call the same experiment interface rather than bypassing proof. The tether is an execution transport; TEVO remains the authority for provenance, measurement and promotion.
