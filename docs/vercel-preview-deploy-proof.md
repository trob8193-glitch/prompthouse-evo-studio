# Vercel Preview Deploy Proof

PromptHouse Evo Studio implements a safe execution rail for Vercel Preview Deployments.

- Vercel deployments are gated by the presence of a `VERCEL_TOKEN`.
- Place `VERCEL_TOKEN` safely in your local `.env`. Never commit it.
- Never paste the token into chat.
- Preview deployments require explicit owner approval (scope: `deploy`).
- Production deployments (`DEPLOY_ALLOW_PRODUCTION=true`) remain hard-blocked during local proof phases.
- Real preview deployments require a fully wired Vercel adapter; otherwise, the request will truthfully return a `PROVIDER_GATED` receipt indicating that the real provider call is suspended in the local sandbox.
- Success is never claimed unless a real Vercel deployment URL and ID are returned.
