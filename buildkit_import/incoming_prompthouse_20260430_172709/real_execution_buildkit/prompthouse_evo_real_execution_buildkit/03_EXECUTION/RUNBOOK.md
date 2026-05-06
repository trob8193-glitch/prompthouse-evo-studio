# Real Execution Runbook

## Backend

```bash
cd scaffolds/promptends_promptlink_backend
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
cp .env.example .env
uvicorn app.main:app --reload
pytest
```

## Configure APIs

Edit `.env`:

```text
OPENAI_API_KEY=sk-...
GITHUB_TOKEN=github_pat_...
```

## Test handshakes

```bash
curl -X POST http://localhost:8000/link/connectors/openai/handshake
curl -X POST http://localhost:8000/link/connectors/github/handshake
```

## Invoke OpenAI through PromptLink

```bash
curl -X POST http://localhost:8000/link/connectors/openai/invoke \
  -H 'Content-Type: application/json' \
  -d '{
    "workspaceId":"w1",
    "projectId":"p1",
    "action":"responses.create",
    "input":{"model":"gpt-4o-mini","prompt":"Return one sentence."},
    "proofRequired":true,
    "dryRun":false
  }'
```

## Flutter

```bash
cd scaffolds/promptshell_flutter
flutter create .
flutter pub get
flutter run -d chrome --dart-define=PROMPTENDS_BASE_URL=http://localhost:8000
```
