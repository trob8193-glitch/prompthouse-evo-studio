# Sovereign OpenAI Collaboration Bridge

This bridge enables a high-density, local-first collaboration loop between the **PH Evo Studio (Antigravity)** and the **OpenAI API**. 

It packages your project state into a safe context packet, redacts secrets, and receives senior architecture reviews to guide the next production pass.

## 🚀 How it Works

1. **Pack**: Run `npm run ai:pack` to scan the project and create `.ai/snapshots/context-pack.json`.
2. **Review**: Run `npm run ai:review` to send the packet to OpenAI.
3. **Execute**: Antigravity reads `.ai/outbox/antigravity-next-pass.md` and executes the next mission.

## 🛠️ Setup

1. **API Key**: Set your `OPENAI_API_KEY` in your environment.
2. **Dependencies**: Run `npm install` (requires `openai`).
3. **Model**: (Optional) Set `OPENAI_MODEL` (e.g., `gpt-4-turbo`). Defaults to `gpt-5.1` (fallback).

## 🔒 Safety & Exclusions

- **Secrets**: `.env`, `.key`, `.pem`, and other sensitive files are automatically excluded.
- **Redaction**: Common secret patterns (API keys, tokens) are redacted from file contents before packaging.
- **Git**: The context pack and temporary snapshots are ignored by Git.

## 📁 Structure

- `.ai/inbox/`: Paste current tasks and terminal errors here.
- `.ai/outbox/`: Find architecture reviews and next-pass prompts here.
- `.ai/config/`: Configure file extensions and scan roots.

---
**WARNING**: Review the generated `.ai/snapshots/context-summary.md` before running a review if your project contains highly sensitive intellectual property.
