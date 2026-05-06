# Connector Security Model

## Rule
The studio handshakes with systems through permissioned surfaces. It does not connect to anything by force.

## Connector Types
- OAuth
- API key
- OpenAPI
- MCP
- webhook
- CLI
- file
- browser
- database
- human handoff

## Handshake Flow
discover → authenticate → scope → dry-run → user approve → execute → capture proof → rollback path → log

## Approval Required For
- writes
- deploys
- deletes
- payments
- external messages
- database mutations
- destructive shell commands
- production config changes

## Secret Safety
- Store secrets in environment variables or a real secret manager.
- Never print secrets in prompt output.
- Never store secrets in screenshots or logs.
- Redact tokens from error reports.

## Default Mode
Dry-run only until the connector is configured and the user approves write capability.
