# Enterprise Proof Checklist

Do not claim enterprise readiness until this checklist has evidence.

## Local Gateway

- [ ] `npm install` succeeds.
- [ ] `npm run dev` starts server.
- [ ] `/health` returns `ok: true`.
- [ ] SQLite database created.
- [ ] PromptBridge event insert works.
- [ ] Memory write route works.
- [ ] Training capture route defaults safely.
- [ ] Sanitizer removes test secrets.
- [ ] Proof evidence route works.
- [ ] Reality claim route works.

## Browser Extension

- [ ] Loads unpacked in Chrome/Chromium.
- [ ] Side panel opens.
- [ ] Status bar shows gateway state.
- [ ] Capture button requires user action.
- [ ] Capture sends event to local gateway.
- [ ] UI shows returned event ID.
- [ ] Training capture defaults off.
- [ ] No silent page scraping.

## Memory Box

- [ ] Local-only mode exists.
- [ ] User can export memory.
- [ ] User can delete memory.
- [ ] User can pause capture.
- [ ] Private memory is not global by default.

## Model Foundry

- [ ] Dataset export produces valid JSONL.
- [ ] Preference pair export produces valid JSONL.
- [ ] Eval runner can score examples.
- [ ] Registry records dataset/model/eval versions.
- [ ] No model promoted without eval pass.

## Automation

- [ ] Approval gate exists.
- [ ] Action plan shown before execution.
- [ ] High-risk actions blocked until approval.
- [ ] Replay/audit log generated.

## Security and Privacy

- [ ] API keys are never logged.
- [ ] Password/token patterns are sanitized.
- [ ] Consent profile is stored.
- [ ] Training route checks consent.
- [ ] Third-party AI output is labeled as review-required.
