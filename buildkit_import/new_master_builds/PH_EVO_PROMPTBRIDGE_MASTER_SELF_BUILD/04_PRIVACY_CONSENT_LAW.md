# PH Evo Privacy and Consent Law

## Default states

```text
Memory mode: local only
Training capture: off
Global contribution: off
Desktop indexing: off
Automation level: manual
External AI fallback: off
```

## Data can enter training only when

1. The user opted in.
2. The source rights are known.
3. The content passed sanitizer.
4. Secrets and private tokens are removed.
5. The item is labeled.
6. The quality score is acceptable.
7. The user/workspace policy allows it.

## Never train on

- passwords
- API keys
- private tokens
- payment data
- private messages without explicit consent
- scraped copyrighted page content
- raw third-party AI output with unclear terms
- private repo code without permission
- hidden capture

## Memory scopes

```text
private_device
private_user_sync
workspace_shared
global_pattern_candidate
training_candidate
blocked
```
