# PH Evo Local Gateway

This is the cost-free local PH Evo API starter. It uses Fastify and SQLite.

## Run

```bash
npm install
npm run dev
```

Health check:

```bash
curl http://127.0.0.1:4317/health
```

## Routes

- `POST /v1/promptbridge/events`
- `GET /v1/promptbridge/events`
- `POST /v1/memory/write`
- `POST /v1/memory/query`
- `POST /v1/training/capture`
- `GET /v1/training/export/sft`
- `GET /v1/training/export/preferences`
- `POST /v1/reality/claims`
- `GET /v1/reality/claims`
- `POST /v1/proof/evidence`
- `GET /v1/proof/evidence`
- `POST /v1/infer/chat`

The infer route is honest: it does not fake a model if no local model connector is configured.
