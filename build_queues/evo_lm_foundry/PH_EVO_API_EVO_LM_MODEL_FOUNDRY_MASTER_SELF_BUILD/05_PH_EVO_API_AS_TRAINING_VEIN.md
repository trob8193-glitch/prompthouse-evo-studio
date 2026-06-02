# PH Evo API as Training Vein

## Rule

Wherever PH Evo API is used, it can produce training signals, but only through explicit training policy.

## Default

```json
{
  "training": {
    "capture_enabled": false
  }
}
```

Training is off by default.

## Training policy block

```json
{
  "training": {
    "capture_enabled": true,
    "allowed_for_memory": true,
    "allowed_for_finetune": true,
    "allowed_for_preference_training": true,
    "requires_review": true,
    "consent_id": "consent_123",
    "source_rights": "user_owned",
    "data_class": "accepted_output"
  }
}
```

## Training event pipeline

```text
API request/response
→ Training Vein wrapper
→ Consent Gate
→ Rights/provenance filter
→ Boundary Sanitizer
→ Quality scorer
→ Dataset router
→ Dataset Forge
```

## What API usage can train

| API surface | Training value |
|---|---|
| /v1/infer/chat | prompts, outputs, accepted/rejected responses |
| /v1/rag/query | retrieval success/failure |
| /v1/promptlink/events | workflow traces, edits, tool context |
| /v1/memory/write | user-approved memory objects |
| /v1/proof/evidence | verified/failed proof states |
| /v1/reality/claims | truth-state transitions |
| /v1/connectors/execute | tool usage patterns |
| /v1/training/feedback | explicit preference examples |

## Do not train on

- passwords
- API keys
- session tokens
- private messages without consent
- payment details
- secret project files without permission
- raw third-party AI output when provider rights are unclear
- copyrighted scraped content
- anything captured silently
