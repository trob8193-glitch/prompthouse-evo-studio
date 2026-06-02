"""
Evo LM LoRA/QLoRA training entrypoint.

This script is intentionally dependency-based and honest:
- It requires transformers, datasets, peft, trl, accelerate, and torch.
- It requires a local/open-weight base model path or model ID that you have rights to use.
- It does not call OpenAI.

Example:
python train_lora_qlora.py --base_model ./models/base --train_jsonl data/sft.sanitized.jsonl --out_dir registry/evo-lm-sft-adapter-v1
"""
import argparse

parser = argparse.ArgumentParser()
parser.add_argument("--base_model", required=True)
parser.add_argument("--train_jsonl", required=True)
parser.add_argument("--out_dir", required=True)
parser.add_argument("--max_steps", type=int, default=100)
parser.add_argument("--learning_rate", type=float, default=2e-4)
args = parser.parse_args()

try:
    from datasets import load_dataset
    from transformers import AutoModelForCausalLM, AutoTokenizer, TrainingArguments
    from peft import LoraConfig
    from trl import SFTTrainer
except Exception as e:
    raise SystemExit(f"Missing training dependencies. Install transformers datasets peft trl accelerate torch. Error: {e}")

model = AutoModelForCausalLM.from_pretrained(args.base_model)
tokenizer = AutoTokenizer.from_pretrained(args.base_model)
if tokenizer.pad_token is None:
    tokenizer.pad_token = tokenizer.eos_token

dataset = load_dataset("json", data_files=args.train_jsonl, split="train")

peft_config = LoraConfig(
    r=16,
    lora_alpha=32,
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM"
)

training_args = TrainingArguments(
    output_dir=args.out_dir,
    max_steps=args.max_steps,
    per_device_train_batch_size=1,
    gradient_accumulation_steps=4,
    learning_rate=args.learning_rate,
    logging_steps=10,
    save_steps=50,
    report_to=[]
)

trainer = SFTTrainer(
    model=model,
    tokenizer=tokenizer,
    train_dataset=dataset,
    peft_config=peft_config,
    args=training_args
)
trainer.train()
trainer.save_model(args.out_dir)
print({"ok": True, "adapter_dir": args.out_dir})
