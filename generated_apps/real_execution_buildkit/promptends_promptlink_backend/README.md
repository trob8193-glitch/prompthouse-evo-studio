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
curl http://localhost:8000/health
curl http://localhost:8000/api/evo-capabilities
curl http://localhost:8000/api/live-readiness
```

## Configure real APIs

Set server-side secrets in `.env`:

```text
OPENAI_API_KEY=...
GITHUB_TOKEN=...
STRIPE_SECRET_KEY=...
VERCEL_TOKEN=...
JWT_SECRET=...
PH_EVO_MASTER_KEY=...
```

Device proof is separate from credentials. After a real Flutter run against this
backend, set `PROMPTSHELL_DEVICE_ID` and `PROMPTSHELL_DEVICE_PROOF` so
`/api/live-readiness` can report `DEVICE_RUNTIME_PROVEN`.
