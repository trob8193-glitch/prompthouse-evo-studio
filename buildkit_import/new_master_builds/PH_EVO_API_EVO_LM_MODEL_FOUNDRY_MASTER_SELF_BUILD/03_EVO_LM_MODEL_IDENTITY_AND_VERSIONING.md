# Evo LM Identity and Versioning

## Definition

**Evo LM** is the PH Evo model family. It can begin as an open-weight model plus PH Evo adapters, then later include tiny PH-trained base models and eventually larger owned checkpoints.

## Version ladder

| Version | Meaning |
|---|---|
| evo-lm-local-v0 | local model connector test, not trained |
| evo-lm-sft-adapter-v1 | first LoRA/QLoRA trained on PH Evo SFT data |
| evo-lm-preference-v1 | preference-tuned using accepted/rejected examples |
| evo-lm-workspace-adapter-v1 | private workspace adapter |
| evo-lm-base-125m-v0 | tiny base model trained from scratch to prove pipeline |
| evo-lm-base-350m-v1 | stronger from-scratch experiment |
| evo-lm-production-v1 | model version that passed eval gates and deployment checks |

## Model version record

```json
{
  "model_id": "evo-lm-sft-adapter-v1",
  "model_family": "evo-lm",
  "model_type": "lora_adapter",
  "base_model": "open_weight_model_name_here",
  "dataset_version": "ph-evo-sft-1.0.0",
  "tokenizer_version": "ph-evo-tokenizer-1.0.0",
  "eval_run_id": "eval_001",
  "deployment_state": "not_deployed",
  "rollback_target": "evo-lm-local-v0",
  "truth_state": "designed"
}
```

Use the `truth_state` field honestly. Do not call a model production if it has not passed evals and serving tests.
