# Enterprise Proof and No-Fake Claims

## State labels

Every module and claim must be labeled:

```text
designed
implemented
running
tested
verified
blocked
human_required
```

## Model promotion gates

A model cannot be marked deployed or production-ready unless:

1. Dataset version is recorded.
2. Training job logs are stored.
3. Eval suite passes thresholds.
4. Model registry entry exists.
5. Rollback target exists.
6. PH Evo API can route to it.
7. Proof Console has evidence.

## Browser extension proof gates

- Extension loads unpacked.
- Side panel opens.
- Chat capture works only with user action.
- Event reaches local gateway.
- Event is stored.
- Training capture defaults off.
- No automation action runs without approval.

## Memory proof gates

- Local memory writes.
- Memory query works.
- Consent state persists.
- Secret sanitizer blocks test secrets.
- User can delete/export memory.
- Global contribution requires approval.

## API proof gates

- Health route works.
- Auth/API key works when enabled.
- Scopes enforced.
- Training policy block respected.
- Audit logs written.
- Inference route routes honestly.
