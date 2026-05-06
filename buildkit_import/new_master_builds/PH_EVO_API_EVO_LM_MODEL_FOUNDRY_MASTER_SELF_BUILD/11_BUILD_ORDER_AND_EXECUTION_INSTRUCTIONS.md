# Build Order and Execution Instructions

## Phase 1: Local gateway

```bash
cd apps/local-gateway
npm install
npm run dev
```

Test:

```bash
curl http://127.0.0.1:4317/health
```

## Phase 2: Browser extension

1. Open Chrome.
2. Go to `chrome://extensions`.
3. Turn Developer Mode on.
4. Load unpacked.
5. Select `apps/bridge-extension`.
6. Open ChatGPT.
7. Open PH Evo Bridge side panel.
8. Click capture.
9. Check local gateway events.

## Phase 3: Memory write/query

```bash
curl -X POST http://127.0.0.1:4317/v1/memory/write \
  -H "content-type: application/json" \
  -d '{"memoryType":"project_goal","privacyScope":"private_device","content":{"goal":"Build PH Evo API + Evo LM."},"allowedForTraining":false}'
```

Query:

```bash
curl -X POST http://127.0.0.1:4317/v1/memory/query \
  -H "content-type: application/json" \
  -d '{"query":"Evo LM"}'
```

## Phase 4: Training export

```bash
python model-foundry/dataset-forge/build_sft_from_events.py \
  --events data/sample_events.jsonl \
  --out data/sft.jsonl
```

## Phase 5: Sanitizer

```bash
python model-foundry/sanitizer/sanitize_jsonl.py \
  --in data/sft.jsonl \
  --out data/sft.sanitized.jsonl
```

## Phase 6: Evals

```bash
python model-foundry/evals/eval_truth_boundary.py \
  --predictions data/predictions.jsonl
```

## Phase 7: Model training

Use `model-foundry/training/train_lora_qlora.py` when a local/open-weight base model and GPU/runtime are available.

This pack does not fake a trained Evo LM. It gives the route and code entrypoints.
