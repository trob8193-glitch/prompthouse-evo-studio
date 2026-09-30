# TEVO Proof & Valuation Evidence

TEVO measures demonstrated software-production capability rather than inferring capability from feature names, documentation, generated text, or UI rendering.

## Truth-bound policy

- No mock production results.
- No fabricated benchmark scores.
- No synthetic customer, revenue, retention, or scale metrics.
- Missing evidence is NOT_PROVEN, never an invented zero.
- Proof receipts are tied to real executions and hashed artifacts.

## Primary proof dimensions

1. End-to-end autonomous build success.
2. Real repository coding and repair performance.
3. Self-repair success.
4. Regression-free change rate.
5. Proof and evidence coverage.
6. 3D generation and runtime validation.
7. Self-evolution improvement against a frozen baseline.
8. Human intervention rate.
9. Cost per successful verified output.
10. Time to production.
11. Security and permission boundary reliability.
12. Reliability across repeated real workloads.

## Metric definitions

Autonomous build success = verified successful builds / verified build attempts.

Self-repair = verified autonomous repairs / repair opportunities. A repair is successful only when the failure is independently detected, TEVO produces the change without prohibited human implementation, and post-repair verification passes without regression.

Regression-free changes = verified changes with zero relevant regressions / verified changes. The regression suite must be defined before the candidate is evaluated.

Human intervention = tasks requiring human implementation or recovery / total autonomous tasks. Human approval for an explicitly gated action is recorded separately from implementation intervention.

Cost per successful output = measured compute + infrastructure + attributable human intervention cost / verified successful outputs.

Time to production is measured from accepted task start to verified production deployment receipt. Report median and p95.

Self-evolution improvement requires a frozen baseline, identical benchmark conditions, verified candidate execution, regression checks, security checks, and reproducible comparison.

3D generation is successful only when the requested artifact is generated, loaded by the real runtime, passes structural checks, and satisfies the configured runtime or visual validation criteria.

Security boundary reliability is measured from real unauthorized-operation attempts and real policy decisions. A claim is not proven by a static policy file alone.

## Receipt requirements

Each proof receipt should include schema version, proof type, run ID, timestamps, repository/version identity, executed commands, exit codes, artifact hashes, relevant environment information, baseline identity for comparative tests, observed metrics, explicit NOT_PROVEN fields, and final truth state.

## Implemented commands

`npm run tevo:proof:benchmark` runs the real engineering gate suite and writes a receipt under `.prompthouse-data/proof/benchmarks/`.

`npm run tevo:proof:index` indexes existing proof receipts, hashes them, and calculates only metrics supported by observed receipts.

`npm run tevo:valuation:proof` runs the benchmark and then builds the evidence index.

These commands do not manufacture autonomous-build, revenue, retention, customer, or scale metrics. Those require real workload and business evidence.

## Promotion rule

An autonomous-evolution change may be treated as an improvement only when the baseline is frozen and identified, the candidate is executed, verification passes, relevant regression tests pass, security gates pass, an evidence receipt is written, the comparison is reproducible, and rollback remains available.