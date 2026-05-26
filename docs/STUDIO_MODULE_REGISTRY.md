# PromptHouse Evo Studio Module Registry

This document is the human-readable roadmap for the studio modules, engines, routes, proof commands, and remaining implementation gaps. It pairs with the Module Maturity Engine and PR proof gates.

## Current source branch

`feature/nuclear-static-audit-gates`

## Proof rule

A module is not considered production-complete until it satisfies the 14-point checklist:

1. Route exists
2. UI page exists
3. Page loads without crash guard
4. Buttons do real actions
5. Actions call real APIs/services
6. APIs return real data
7. Data is persisted if needed
8. Errors are handled clearly
9. Tests cover the module
10. Build gate exists
11. Audit gate exists
12. No fake/dummy/pending language
13. Proof receipt is generated
14. User can understand success/failure

## Highest-priority modules

| Module | UI entry | API routes | Proof commands | Remaining work |
|---|---|---|---|---|
| Self-Evolution Engine | Proof Console → Self-Evolution | `/api/self-evolution/*` | `npm run evolve:status`, `npm run evolve:proof` | Browser proof, diff viewer, risk score UI, branch/PR automation, merge blockers |
| Cost Firewall V2 | Proof Console → Cost Firewall | `/api/cost-firewall/*` | `npm run cost:check`, `npm run cost:summary`, `npm run cost:claims`, `npm run cost:cache` | More real receipts, plan-level budgets, Stripe/customer plan integration, production alerts |
| Theme Evolution Engine | Proof Console → Theme Evolution | `/api/theme-evolution/*` | `npm run audit:css`, `npm run build` | Browser proof, visual proof receipt, theme diff viewer, approved gallery |
| Module Maturity Engine | Proof Console → Module Maturity | `/api/module-maturity/*` | `npm run maturity:check`, `npm run maturity:receipt`, `npm run maturity:strict` | Local proof, false-positive tuning, coverage expansion |
| Nuclear Static Audit Gates | CLI / CI | none | `npm run audit:imports`, `npm run audit:css`, `npm run verify:studio` | CI proof, false-positive tuning, developer docs |

## Secondary module map

| Module | UI entry | Remaining work |
|---|---|---|
| Proof Console | Main Navigation → Proof Console | Browser proof, route-level smoke test, tab state persistence |
| Forge Labs | Main Navigation → Forge Labs | API contracts per forge action, artifact receipts, tab smoke tests |
| Mobile Simulator Hub | Forge Labs → Mobile Simulator Hub | Browser proof, screenshot capture, device matrix coverage |
| Prompt Registry | Main Navigation → Prompt Registry | Versioned prompt export, import validation, prompt test harness |
| AI Generator Hub | Main Navigation → AI Generator Hub | Real provider proof, output artifact pipeline, Cost Firewall integration |
| Evo Model Foundry | Main Navigation → Evo Model Foundry | Training data pipeline, evaluation harness, model card receipts |
| Commerce Core | Main Navigation → Commerce Core | Stripe end-to-end proof, order persistence, refund/dispute flows, admin dashboard |
| Deployment Center | Execution Queue / Deploy Rail | Vercel binding, deployment logs panel, rollback receipts, required CI checks |
| Settings & API Credentials | Main Navigation → Settings | Secret validation route, provider health test, masked credential policy |
| Live Inspector & Diagnostics | Main Navigation → Live Inspector | Unified health endpoint, request trace viewer, error drill-down |
| Sovereign Control | Main Navigation → Sovereign Control | Truth labels for symbolic systems, real action boundaries, governance receipts |

## Remote proof gates added

GitHub Actions workflow:

`/.github/workflows/studio-proof.yml`

Runs:

```bash
npm ci
node --check promptbridge-server.js
node --check generated_apis/*.js
node --check src/core/maturity/ModuleMaturityEngine.js
node --check scripts/module_maturity_check.mjs
npm run audit:imports
npm run audit:css
npm run verify:studio
npm run maturity:check
npm run cost:check
npm run cost:check:paid
npm run cost:summary
npm run cost:claims
npm run cost:cache
npm run evolve:status
npm test
npm run build
```

## Manual local proof when IDE access returns

```bash
git fetch origin
git checkout feature/nuclear-static-audit-gates
git pull origin feature/nuclear-static-audit-gates
npm install
npm run audit:imports
npm run audit:css
npm run verify:studio
npm run maturity:check
npm run maturity:receipt
npm run cost:check
npm run cost:summary
npm run cost:claims
npm run cost:cache
npm run evolve:status
npm run evolve:proof
npm test
npm run build
npm run dev:all
```

Manual URLs:

```txt
http://127.0.0.1:3001/api/self-evolution/status
http://127.0.0.1:3001/api/cost-firewall/status
http://127.0.0.1:3001/api/theme-evolution/status
http://127.0.0.1:3001/api/module-maturity/status
http://127.0.0.1:5173
```

## Merge rule

Do not merge PR #3 until:

- GitHub Actions proof passes
- local audit/test/build passes
- API routes return JSON locally
- Proof Console tabs load without crashing
- Mobile Simulator Hub loads without crashing
- Module Maturity Engine produces a receipt
