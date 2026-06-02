"""
Real LoRA/QLoRA training entrypoint.

This script requires external dependencies and appropriate hardware:
  pip install transformers datasets peft trl accelerate bitsandbytes

It does not fake training. If dependencies are missing, it exits with an explicit error.
"""
import argparse


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--base_model", required=True)
    parser.add_argument("--dataset", required=True)
    parser.add_argument("--output_dir", required=True)
    parser.add_argument("--max_steps", type=int, default=100)
    args = parser.parse_args()

    try:
        from datasets import load_dataset
        from transformers import AutoModelForCausalLM, AutoTokenizer, TrainingArguments
        from peft import LoraConfig
        from trl import SFTTrainer
    except Exception as exc:
        raise SystemExit(
            "Missing training dependencies. Install: pip install transformers datasets peft trl accelerate bitsandbytes\n"
            f"Original error: {exc}"
        )

    dataset = load_dataset("json", data_files=args.dataset, split="train")
    tokenizer = AutoTokenizer.from_pretrained(args.base_model, use_fast=True)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    model = AutoModelForCausalLM.from_pretrained(args.base_model, device_map="auto")
    peft_config = LoraConfig(r=16, lora_alpha=32, lora_dropout=0.05, task_type="CAUSAL_LM")
    training_args = TrainingArguments(
        output_dir=args.output_dir,
        max_steps=args.max_steps,
        per_device_train_batch_size=1,
        gradient_accumulation_steps=4,
        logging_steps=5,
        save_steps=50,
        learning_rate=2e-4,
        fp16=True,
        report_to=[]
    )
    trainer = SFTTrainer(
        model=model,
        tokenizer=tokenizer,
        train_dataset=dataset,
        peft_config=peft_config,
        args=training_args,
    )
    trainer.train()
    trainer.save_model(args.output_dir)
    print({"ok": True, "output_dir": args.output_dir})

if __name__ == "__main__":
    main()
