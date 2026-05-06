# PromptHouse Evo Studio OS — Build All v0.1

Built: 2026-04-30

## What this is
A web-first, mobile-ready starter repo for PromptHouse Evo Studio OS: an autonomous smart prompt-engineering and prompt-to-app studio for vibe coders, AI coders, and engineering teams.

## What is included
- Next.js + TypeScript app scaffold
- Mission Control
- Vibe Fast Lane
- Prompt Forge
- App Forge
- AI Coder Console
- Prompt Intelligence Lab
- QA Autopilot
- Bridge Hub
- Proof Deck
- Review & Ship Deck
- Universal Handshake connector schema
- PromptHouse logic kernel
- Prompt-to-app stub pipeline
- approval gate system
- test checklist
- Antigravity multi-agent build prompt
- valuation memo

## Truth boundary
This is a starter repo/build packet. It is not a deployed SaaS product. Real external connectors require credentials, OAuth/API permissions, MCP/OpenAPI adapters, and security review. Do not put secrets in prompts or logs.

## Install
```bash
npm install
npm run dev
```

## Recommended next implementation path
1. Run this repo in Antigravity or Cursor.
2. Ask agents to implement screens one by one from `docs/ANTIGRAVITY_MULTI_AGENT_BUILD_PROMPT.md`.
3. Add Supabase auth/database.
4. Implement connector registry with read-only dry-run first.
5. Add approval queue before any write/deploy/delete action.
6. Run tests from `docs/TEST_PLAN.md`.

## Status labels
- built: scaffold/package exists
- verified: file/package text-audit passed
- blocked: live deployment and real connector actions until installed and configured
