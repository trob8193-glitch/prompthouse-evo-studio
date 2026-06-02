# User + Studio Training Loop

## Same API, separate user memory

Every user can use the same PH Evo API and same Evo LM model family. Their experience is separated by:

- user ID
- workspace ID
- plan/entitlements
- Memory Box mode
- RAG context
- consent settings
- tools enabled
- training mode
- project canon

## Training modes

| Mode | Behavior |
|---|---|
| Off | Nothing saved for training |
| Memory Only | Saved to private/project memory only |
| Approval Mode | User approves examples for training |
| Auto-Capture Safe Mode | Captures metadata/finals where policy allows |
| Studio Builder Mode | Full workflow capture with review |
| Enterprise Private | No global training, workspace-private only |
| Global Contribution | Approved sanitized data can improve global Evo LM |

## Local/private/global flow

```text
private user event
→ Memory Box private store
→ optional user sync
→ optional workspace share
→ optional sanitized global contribution
→ optional model training item
```

## What becomes global

Only generalized, sanitized, rights-cleared patterns:

- prompt patterns
- code repair patterns
- safe browser workflows
- Flutter component patterns
- product forge examples
- risk/refusal examples
- eval cases
- proof patterns

Raw desktop memory does not become global memory.
