# PromptLink Protocol

PromptLink lets Evo LM connect to external providers and agents through permissioned adapters.

Handshake:
discover → authenticate → scope → live-run → budget check → approval check → execute → proof receipt → redaction → fallback/repair

Provider classes:
OpenAI/ChatGPT-class, Claude-class, Gemini-class, Codex-like coding agent, image generator, video generator, local coding agent, repo/CI agent, browser/device QA agent, MCP server, OpenAPI service.

Boundary:
PromptLink uses user-provided credentials and official or user-authorized interfaces only.
