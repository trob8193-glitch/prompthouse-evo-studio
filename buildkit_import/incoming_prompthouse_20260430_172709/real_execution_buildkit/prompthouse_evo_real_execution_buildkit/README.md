# PromptHouse Evo Real Execution BuildKit

**No mock mode. No dummy data. No fake completion.**

This package gives an AI builder exact instructions and starter real-logic code for:

- **PromptShell** — Flutter / VS Code operator app shell.
- **PromptEnds** — backend API proxy and execution plane.
- **PromptLink** — internal API handshake gateway that talks to other APIs.
- **Manifest-to-Proof Engine** — seed intent → real persisted artifacts/proof records.
- **Proof OS** — truth states, proof cards, artifact vault, audit logs, rollback fields.

## What is real in this ZIP

- Real backend scaffold with FastAPI.
- Real SQLite persistence, created on startup.
- Real PromptLink connector registry.
- Real connector handshake logic.
- Real OpenAI Responses API invocation through server-side key.
- Real GitHub REST API invocation through server-side token.
- Real generic REST invocation through registered connector manifests.
- Real audit/proof record persistence.
- Real Flutter client screens that call PromptEnds endpoints.
- Real no-bullshit build prompts for all 50 features.

## What is not falsely claimed

This is not deployed. It is not production-ready until you run it, configure secrets, test it, secure it, and deploy it.

Production-ready requires:
- live backend deployment
- auth provider
- database hardening
- secret manager
- CI tests
- runtime verification
- observability
- rollback
- proof cards showing evidence

## Start

Backend:

```bash
cd scaffolds/promptends_promptlink_backend
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
cp .env.example .env
uvicorn app.main:app --reload
```

Frontend:

```bash
cd scaffolds/promptshell_flutter
flutter create .
flutter pub get
flutter run -d chrome --dart-define=PROMPTENDS_BASE_URL=http://localhost:8000
```

## Core slogan

AI studios generate. PromptHouse proves.
