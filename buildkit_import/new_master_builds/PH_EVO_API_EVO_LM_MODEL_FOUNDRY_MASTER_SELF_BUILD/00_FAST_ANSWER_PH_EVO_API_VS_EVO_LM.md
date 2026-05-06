# Is PH Evo API the model, or is Evo LM the model?

## Clean answer

**Evo LM is the trainable model.**

**PH Evo API is not the model.** It is the native gateway and control plane that connects everything to Evo LM.

## Relationship

```text
User / Studio / Browser Extension / VS Code / Flutter / External App
        ↓
PH Evo API / Sovereign Gateway
        ↓
Model Invocation Gate
        ↓
Evo LM model endpoint
        ↓
Response back through PH Evo API
        ↓
PromptBridge event + memory + proof + optional training capture
```

## What gets trained?

The trainable object is one or more of these:

1. **Evo LM adapter**: LoRA/QLoRA adapter trained on PH Evo data.
2. **Evo LM fine-tuned checkpoint**: merged or served with base model.
3. **Evo LM small base model**: trained from scratch later, starting tiny.
4. **Evo LM workspace adapter**: private adapter for a business/team/user workspace.
5. **Evo LM eval/routing policy**: not weights, but trainable/improvable operating logic.

## What does PH Evo API train?

PH Evo API does not train by itself. It **captures approved learning signals** through the Training Vein and sends them to Model Foundry.

```text
PH Evo API call
→ Training Vein event
→ consent and rights check
→ sanitizer
→ dataset builder
→ eval builder
→ training job
→ Evo LM adapter/checkpoint
→ model registry
→ deployment sequencer
→ PH Evo API serves upgraded Evo LM
```

## Final wording

Use this sentence:

**PH Evo API is the gateway. Evo LM is the model. Model Foundry trains Evo LM using approved PromptBridge, Memory Box, user, studio, and API events without requiring OpenAI.**
