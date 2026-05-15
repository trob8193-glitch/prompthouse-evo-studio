# AI Provider Proof Setup

PromptHouse Evo Studio implements a safe execution rail for AI providers (OpenAI, Gemini).

- Provide keys via `OPENAI_API_KEY` and `GEMINI_API_KEY`.
- Never paste keys into chat.
- Never commit `.env` or write real keys to `.env.example`.
- Missing keys will label the provider truth state as `PROVIDER_GATED`.
- Configured keys remain unproven until an explicit owner-approved probe is successfully completed.
- Probes require an explicit owner approval envelope and use the minimum possible token limits.
- The system will not auto-run probes or spend tokens autonomously.
