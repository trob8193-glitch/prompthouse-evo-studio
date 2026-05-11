# PromptLink Real Internal API Build Prompt

Build PromptLink as the internal PromptHouse API handshake gateway.

## Purpose

PromptLink lets PromptHouse talk to other APIs safely and provably.

## Required behavior

- Register connector manifests.
- Validate connector capabilities.
- Confirm required secret exists server-side.
- Enforce allowed actions.
- Support live-run policy check.
- Invoke real external API only when configured.
- Persist audit log.
- Persist proof card for success/failure.
- Normalize response.
- Never expose secrets.

## Connector types

1. OpenAI Responses API
2. GitHub REST API
3. Generic REST JSON API

## Required endpoints

```text
GET    /link/health
POST   /link/connectors/register
GET    /link/connectors
GET    /link/connectors/{connector_id}
POST   /link/connectors/{connector_id}/handshake
POST   /link/connectors/{connector_id}/invoke
GET    /link/audit
GET    /link/proof
```

## Connector invoke truth states

- verified: real request succeeded
- blocked: missing secret or disallowed action
- broken: request failed
- built: registered/configured but not invoked
