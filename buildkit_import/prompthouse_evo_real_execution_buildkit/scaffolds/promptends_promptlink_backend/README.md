# PromptEnds + PromptLink Backend

Real-logic backend scaffold. No mock connector mode. Missing secrets produce blocked truth states.

## Run

```bash
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
cp .env.example .env
uvicorn app.main:app --reload
```

## Verify

```bash
pytest
```

## Configure real APIs

Set server-side secrets in `.env`:

```text
OPENAI_API_KEY=...
GITHUB_TOKEN=...
```
