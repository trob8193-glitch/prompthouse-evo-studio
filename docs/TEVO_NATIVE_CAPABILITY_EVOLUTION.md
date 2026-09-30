# TEVO Native Capability Evolution

TEVO's evolutionary system is native to the studio. It does not require GitHub, Antigravity, or another IDE at runtime.

## Native subsystems
- Capability Registry: first-class inventory and lifecycle state.
- Capability Graph: lineage, dependencies, parents, descendants and proof history.
- Experiment Engine: executes real commands and records stdout, stderr, exit code and hashes.
- Evolution Engine: candidate construction, mutation, composition and fusion.
- Model Fabric: local-model registry, routing metadata and training lineage.
- Training Fabric: PyTorch and LoRA jobs are represented as real executable workloads. No fake training receipts are accepted.
- User Adaptation: user-specific observations remain isolated from global capability promotion until independently proven.
- Proof Fabric: hashes receipts and exposes only observed evidence.
- Promotion Engine: verified receipts are required before a candidate becomes promoted.

## Trust boundary
The trust core controls permissions, evidence validity, promotion rules and rollback. Evolutionary components can evolve, but they cannot silently redefine the trust boundary.

## User evolution
Personal adaptation is separate from global evolution. A private observation can change that user's routing or workflow profile without becoming a global capability. Generalization requires an independently reproducible benchmark and proof receipt.

## Training integration
A real PyTorch or LoRA workload can be invoked by setting TEVO_EXPERIMENT_COMMAND to the real training entrypoint and TEVO_EXPERIMENT_ARGS to JSON arguments. The resulting process output and exit status are recorded. Dataset hashes, model/checkpoint hashes and evaluation receipts should be included by the training pipeline before promotion.

## Required lifecycle
OBSERVE -> IDENTIFY GAP -> PROPOSE -> CONSTRUCT -> EXPERIMENT -> MEASURE -> BASELINE COMPARE -> VERIFY -> PROVE -> PROMOTE -> OBSERVE.

No number in the valuation model is considered proof until its underlying receipt exists.
