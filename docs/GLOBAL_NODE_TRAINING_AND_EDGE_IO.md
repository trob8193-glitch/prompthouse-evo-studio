# PromptHouse Global Node Training and Edge I/O

## What Is Built

PromptHouse Evo Studio supports two training paths:

- Private BYOK provider training: a user can provide a provider key for their own copy. The key is used only for that request and is not written into plan, run, receipt, or packet files.
- Global node contribution: every downloaded copy can create a redacted contribution packet for the shared PromptHouse Evo training corpus.

Global contribution is not automatic. It requires opt-in, data-rights confirmation, a signed packet, and a configured hub endpoint.

Node identity, outbox packets, and receipts live under `.evo-llm/` on each installed copy and are intentionally not committed, so every downloaded Studio copy gets its own local node identity.

## Global Hub Gates

Set these only on copies allowed to submit to your hosted global hub:

```env
GLOBAL_EVO_CONTRIBUTION_OPT_IN=true
GLOBAL_EVO_DATA_RIGHTS_CONFIRMED=true
GLOBAL_EVO_NODE_SIGNING_SECRET=change-me-per-node-or-install
GLOBAL_EVO_HUB_URL=https://your-hub.example.com
GLOBAL_EVO_HUB_TOKEN=your-node-token
```

Run:

```bash
npm run evo:global-node
node scripts/evo_global_node.mjs package --global-opt-in --data-rights-confirmed --include-examples
npm run evo:global-submit
```

The submit command posts to:

```txt
POST {GLOBAL_EVO_HUB_URL}/api/evo-global/contributions
```

The payload is signed with `GLOBAL_EVO_NODE_SIGNING_SECRET`. Hub tokens are not persisted.

## Private User Keys

Private provider training can use a transient key:

```txt
POST /api/evo-llm/plan
POST /api/evo-llm/approve
POST /api/evo-llm/run
```

For provider runs, pass `providerApiKey`, `allowProviderTraining: true`, and `maxTrainingBudgetUsd`. The key is used for the provider call only and is not stored.

## Edge I/O Audit

The master audit includes:

- Wi-Fi/network interfaces
- Bluetooth
- barcode and QR scanning
- invisible signals, ultrasonic waves, and audio beacon channels
- NFC
- serial, USB, and HID devices
- local process input/output
- Evo API and global node hub readiness

Run:

```bash
npm run audit:edge-io
npm run reality:audit
```

Hardware and browser capabilities are permission-gated. The studio reports them as available only when the runtime actually exposes them; otherwise they remain provider/permission-gated.
