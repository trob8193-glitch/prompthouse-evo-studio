# Provider Credential Setup

PromptHouse Evo Studio integrates natively with external providers like OpenAI, Gemini, Stripe, and Vercel.

**However, the core studio OS functions locally and does not require provider keys to run, develop, or verify the codebase.**

When you are ready to enable live generation, live billing, or live deployment, follow these safe credential injection steps.

> [!CAUTION]
> **NEVER PASTE SECRETS INTO CHAT.**
> Do not paste your API keys into the AI conversation window. The studio will never ask you for them in chat.

> [!WARNING]
> **NEVER COMMIT `.env`.**
> Your `.env` file is explicitly ignored by git. Keep it that way. Never commit secrets to version control.

## 1. Local Setup (`.env`)

In the root of your project, create or update the `.env` file:

```env
# Required Authentication Secrets (Must be 24+ chars)
JWT_SECRET=your_very_long_random_hex_string_here
PH_EVO_MASTER_KEY=another_very_long_random_hex_string_here

# Required Configurations
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
VITE_BRIDGE_URL=http://127.0.0.1:3001
DEPLOY_TARGET=local
DEPLOY_ALLOW_PRODUCTION=false

# Optional Provider Credentials (Add these when ready)
OPENAI_API_KEY=sk-proj-...
GEMINI_API_KEY=AIzaSy...
STRIPE_SECRET_KEY=sk_test_...
VERCEL_TOKEN=your_vercel_token...
```

> [!NOTE]
> Keep `DEPLOY_ALLOW_PRODUCTION=false` until you are explicitly running the production deployment phase.

## 2. Vercel Hosting Setup

When deploying to Vercel, you must manually enter these same variables into the Vercel Project Settings > Environment Variables dashboard.

Do not upload your `.env` file. Do not rely on `.env.example`.

## 3. Verifying the Setup

You can safely verify your credential status without exposing secrets or spending API credits:

### Check Readiness
```bash
npm run deployment:readiness
```

### Run Full Simulation
```bash
npm run simulate:local-production
```

These commands will output a truth state (`VERIFIED`, `PROVIDER_GATED`, `LOCAL_ONLY`, or `NEEDS_CREDENTIALS`) and tell you exactly which keys are missing without ever printing the values of the keys that are present.
