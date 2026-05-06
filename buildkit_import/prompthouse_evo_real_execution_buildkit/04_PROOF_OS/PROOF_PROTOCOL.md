# Proof OS Protocol

Every build claim must create or reference proof.

## ProofCard fields

- id
- workspaceId
- projectId
- claim
- truthState
- evidence
- owner
- failureCondition
- rollbackPlan

## Completion downgrade

- verified without test evidence becomes built.
- built without artifact becomes recommended.
- any crashed feature becomes broken.
- any missing secret becomes blocked.
