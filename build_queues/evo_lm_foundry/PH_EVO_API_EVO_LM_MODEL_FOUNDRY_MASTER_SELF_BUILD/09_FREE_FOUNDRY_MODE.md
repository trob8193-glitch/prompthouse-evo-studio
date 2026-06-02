# Free Foundry Mode

## Goal

Build and train without required paid API bills.

## Uses

- local Memory Box
- SQLite
- local vector index
- local model runner
- local dataset builder
- local eval runner
- free notebook exports
- opt-in user compute contribution

## Free-first stack

```text
Browser Extension
→ Local Gateway on 127.0.0.1
→ Memory Box SQLite
→ Local model endpoint when available
→ Dataset exporter
→ Free notebook training packet
→ Import trained adapter/checkpoint
```

## What free can do well

- capture training events
- build datasets
- local RAG memory
- small evals
- local inference with small models
- small LoRA experiments
- free notebook training attempts

## What free cannot honestly promise

- unlimited public inference
- large 7B+ training from scratch
- enterprise uptime
- high traffic API
- large private GPU jobs

## Rule

Do not remove paid/cloud-ready architecture. Add Free Foundry Mode as a local-first lane.
