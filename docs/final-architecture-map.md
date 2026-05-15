# PH EVO STUDIO — Final Architecture Map

Phase 15: Sovereign Handover & Final Hardening

> This document maps the **current additive architecture** of the studio.
> All layers are additive. No system was deleted or replaced.

---

## Frontend Layer (`src/`)

### Application Shell
- **`src/main.jsx`** — React entry point, mounts `<App />`
- **`src/App.jsx`** — Root component, router, sidebar/header composition
- **`index.html`** — Vite HTML entry, SEO meta tags
- **`src/index.css`** — Global design system tokens, CSS variables, utility classes

### Navigation
- **`src/components/Sidebar.jsx`** — Left navigation with view routing
- **`src/components/Header.jsx`** — Top bar with studio state
- Navigation contract: all views registered in a central nav config, tested via `navigation-contract.test.jsx`

### Views (Features)
| View | Purpose |
|:---|:---|
| `src/features/ProofCenterView.jsx` | Provider proof, security audit, diagnostics, owner approval demos |
| `src/features/DeploymentCenterView.jsx` | Deployment readiness, receipts, preview deploy, Stripe, handover |
| `src/features/GeneratorView.jsx` | App generation workflow |
| `src/features/FoundryView.jsx` | Prompt/foundry management |
| `src/features/SettingsView.jsx` | Studio configuration |
| `src/features/SovereignChat.jsx` | AI chat interface |
| `src/features/RareCapabilities.jsx` | Advanced/experimental capabilities |

### Proof & Verification Components
| Component | Purpose |
|:---|:---|
| `TruthBadge.jsx` | Visual truth-state badge (renders label + tone) |
| `OwnerApprovalPanel.jsx` | Owner approval envelope UI (scoped, timestamped) |
| `DeploymentReadinessPanel.jsx` | Shows readiness classification + blockers |
| `DeploymentReceiptsPanel.jsx` | Lists immutable deployment receipts |
| `DeploymentControlPanel.jsx` | Owner-gated deploy action trigger |
| `EnvironmentStatusPanel.jsx` | Shows env key configuration status (redacted) |
| `ProviderCredentialChecklistPanel.jsx` | Checklist of all provider credential states |
| `AiProviderProofPanel.jsx` | AI provider probe UI (owner-gated) |
| `StripeProofPanel.jsx` | Stripe key status and mode display |
| `StripeTestCheckoutPanel.jsx` | Stripe test checkout session creator (owner-gated) |
| `VercelPreviewDeployPanel.jsx` | Vercel preview deploy trigger + receipt display |
| `BrowserPreviewVerificationPanel.jsx` | Manual browser verification checklist |
| `HandoverStatusPanel.jsx` | Phase 15 — handover report status + next actions |
| `ProviderStatusPanel.jsx` | Overall provider health summary |
| `SecurityAuditPanel.jsx` | Security audit results display |
| `RouteDiagnosticsPanel.jsx` | Route registry diagnostic display |

### Frontend Services (`src/services/`)
| Service | Purpose |
|:---|:---|
| `deployment-client.js` | Bridge calls for deployment readiness + receipts |
| `vercel-client.js` | Legacy Vercel status bridge calls |
| `vercel-preview-client.js` | Vercel preview deploy trigger + receipt fetch |
| `stripe-checkout-client.js` | Stripe test checkout session creation |
| `handover-client.js` | Phase 15 — handover status + report fetch |
| `owner-approval-client.js` | Owner approval envelope creation |
| `environment-client.js` | Env status bridge calls |

### Constants & Config
- `src/constants/truth-states.js` — Canonical truth-state vocabulary, labels, tones
- `src/config/bridge-config.js` — Bridge URL configuration + `safeFetchBridge` helper
- `src/owner-approval.js` — Frontend approval validation helpers

---

## Backend Layer (`server/` + `promptbridge-server.js`)

### Entrypoint
- **`promptbridge-server.js`** — Primary bridge server. 4700+ lines. Preserves all original functionality. Additively imports modular route registry.

### Route Registry (`server/route-registry.js`)
- `createRouteRegistry()` — Creates dependency-free route registry
- `registerRoute()` — Registers route metadata
- `createRegisteredRouteMiddleware()` — Inline registration + diagnostic tagging

### Core Route Modules (`server/routes/`)
| Module | Routes |
|:---|:---|
| `health.routes.js` | `GET /api/health` |
| `provider.routes.js` | `GET /api/provider/status`, `POST /api/provider/probe` |
| `security-audit.routes.js` | `GET /api/security/audit` |
| `env-validation.routes.js` | `GET /api/env/status` |
| `deployment-control.routes.js` | `GET /api/deployment/readiness` |
| `vercel-preview-deploy.routes.js` | `POST /api/vercel/preview-deploy` |
| `deployment-receipt-verifier.routes.js` | `GET /api/deployment/preview/latest` |
| `stripe-test-checkout.routes.js` | `POST /api/stripe/test-checkout/session` |
| `handover.routes.js` | `GET /api/handover/status`, `GET /api/handover/report` |
| `index.js` | Registers all modules additively via `registerCoreRoutes()` |

### Core Services (`server/services/`)
| Service | Purpose |
|:---|:---|
| `owner-approval-service.js` | Validates owner approval envelopes |
| `provider-gates.js` | Checks env key presence, redacts secrets |
| `provider-receipts.js` | Creates provider proof receipts |
| `deployment-receipts.js` | Append-only JSONL receipt ledger |
| `deployment-receipt-verifier.js` | Classifies truth states for receipts |
| `vercel-readiness.js` | Classifies Vercel token status |
| `vercel-preview-runner.js` | Orchestrates real Vercel API preview deploys |
| `stripe-test-checkout.js` | Stripe test checkout session creation |
| `truth-labels.js` | Canonical `TRUTH_STATES` constants (backend) |
| `security-classifier.js` | Classifies route security requirements |

### Middleware (`server/middleware/`)
| Middleware | Purpose |
|:---|:---|
| `security-gates.js` | `requireDeployApproval`, `requireCommerceApproval`, etc. |

---

## Data Layer (`.prompthouse-data/`)

| File | Contents |
|:---|:---|
| `deployment_receipts.jsonl` | Append-only log of all deploy attempts (success + blocked) |
| `deployment-readiness-report.json/md` | Latest readiness classification |
| `local-production-sim-report.json/md` | Latest local production simulation |
| `proof-report.json/md` | Latest proof report |
| `handover-report.json/md` | Phase 15 sovereign handover report |
| `markdown-warning-report.json/md` | Docs hygiene warning report |

### Provider Receipts
- `provider-receipts/` — Individual JSON files for each provider interaction attempt

---

## Preserved Systems (No-Delete Rule)

All of the following are preserved and untouched through Phase 15:

- `generated_apps/` — All generated SaaS applications
- `browser_bridge_receipts/` — All browser bridge receipt files
- `.sovereign-shards/` — All sovereign shard JSON files
- `.ai/` — All AI inbox/outbox/prompt files
- `src/core/` — All core autonomy engines
- `lib/` — All foundry, commerce, terminal, deployment libs
- `src/LiveSeed.dart` — Preserved as-is

---

## Architecture Principles

1. **Additive-only**: New functionality wraps or extends existing systems. Nothing is replaced.
2. **Route modularity**: All new routes are registered via the route registry, not hardcoded into the bridge server.
3. **Truth-state propagation**: Every system reports its truth state through `TruthBadge` and the receipt system.
4. **Owner approval gating**: All external API actions require an explicit approval envelope.
5. **No-secret policy**: Secrets never leave `.env`. Receipts contain only hashed/redacted values.
6. **Receipt auditability**: Every action — success or failure — generates an immutable receipt.

---

*Generated as part of Phase 15: Sovereign Handover & Final Hardening.*
