# Training Evo LM Without OpenAI

## Direct answer

Yes, Evo LM can be trained without OpenAI.

OpenAI is not required for:

- collecting PH Evo training data
- building datasets
- running local RAG
- training LoRA/QLoRA adapters
- training tiny from-scratch base models
- running local model inference
- serving through PH Evo API
- evaluating and registering model versions

## OpenAI-free training inputs

1. Your PromptHouse files.
2. Your prompts.
3. User-approved PromptLink data.
4. Accepted outputs.
5. Rejected outputs.
6. User edits.
7. Button clicks and workflow traces.
8. Proof and test results.
9. Public domain text.
10. Permissively licensed code/text.
11. Documentation you have rights to use.
12. Synthetic PH Evo examples from your studio laws.
13. Product workflows from consenting users.
14. PH Evo API usage events with training policy enabled.
15. Memory Box approved contribution events.

## OpenAI-free training outputs

- RAG memory updates.
- SFT JSONL.
- Preference pairs.
- Eval cases.
- LoRA adapters.
- Tiny base model checkpoints.
- Tokenizer versions.
- Model cards.
- Registry records.

## Training route A: RAG learning

```text
approved memory
→ local vector index
→ retrieval during inference
→ no weight training required
```

This is the fastest and cheapest learning route.

## Training route B: LoRA / QLoRA

```text
approved events
→ sanitizer
→ SFT JSONL
→ train adapter on open-weight model
→ eval
→ deploy adapter through Evo LM endpoint
```

This is the first real behavior-training route.

## Training route C: Preference tuning

```text
prompt + accepted output + rejected output
→ preference pair
→ train preference model or preference adapter
→ eval
```

This teaches Evo LM which PH Evo outputs are better.

## Training route D: Tiny base from scratch

```text
owned/licensed corpus
→ PH Evo tokenizer
→ random initialized transformer
→ next-token pretraining
→ checkpoint
→ instruction tuning
→ eval
```

This proves base-model ownership. Start tiny.

## Training route E: Free Foundry Mode

```text
local Memory Box
→ local dataset builder
→ local evals
→ free notebook training export
→ adapter/checkpoint import
```

This keeps early cost at zero cash, aside from local electricity and user-owned hardware.
