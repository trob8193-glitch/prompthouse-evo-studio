# PH Evo PromptBridge Master Self-Build Pack

This ZIP is the all-in-one readable build pack for **PH Evo PromptBridge**, **PH Evo Bridge Browser Extension**, **PH Evo Memory Box**, **PH Evo API Gateway**, **Training Vein**, **Model Foundry**, **Proof Console**, **Reality Twin**, **Free Foundry Mode**, and the **12-role studio cast system**.

## Clean status

This pack is a real implementation starter and master build specification. It contains runnable local gateway code, loadable browser-extension code, contracts, schemas, training pipeline scripts, and enterprise proof checklists.

It does **not** claim that your product is already deployed, market-proven, audited, trained, or enterprise-certified. Those states require actual execution evidence. Tiny detail, enormous legal difference.

## What to open first

1. `00_MASTER_SELF_BUILD_PROMPT.md`
2. `01_SYSTEM_BLUEPRINT.md`
3. `02_BUILD_ORDER.md`
4. `03_ENTERPRISE_PROOF_CHECKLIST.md`
5. `apps/local-gateway/README.md`
6. `apps/bridge-extension/README.md`

## Fast local test

```bash
cd apps/local-gateway
npm install
npm run dev
```

Then load the browser extension:

```text
Chrome → chrome://extensions → Developer mode → Load unpacked → apps/bridge-extension
```

The extension captures visible ChatGPT page text only when the user presses the capture button. Training capture defaults to off.
