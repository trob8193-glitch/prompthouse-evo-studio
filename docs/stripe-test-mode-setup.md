# Stripe Test-Mode Setup

PromptHouse Evo Studio enforces safe test-mode billing execution during all local proof and development phases.

> [!WARNING]
> **LIVE BILLING IS BLOCKED**
> During this local phase, you are explicitly prohibited from using live Stripe keys (`sk_live_`).

## 1. Using a Test Key

Your Stripe environment must be configured with a Test Secret Key, which always starts with `sk_test_`.

Add this to your local `.env`:
```env
STRIPE_SECRET_KEY=sk_test_your_test_key_here
```

> [!CAUTION]
> **NEVER PASTE KEYS INTO CHAT.**
> **NEVER COMMIT `.env`.**

## 2. Account Probing

The **Stripe Test Account Probe** is a safe, non-mutating network call that retrieves your test account metadata to prove your key is valid over the network.

- It **does not** create charges.
- It **does not** create customers.
- It **does not** create checkout sessions.

Because it reaches out to the Stripe API, it is guarded by **Owner Approval (Commerce Scope)**. You must explicitly grant the envelope in the UI before you can click "Run Test Account Probe."

## 3. Truth States

- **VERIFIED:** You are using a valid `sk_test_` key and your local mode is safe.
- **BLOCKED:** You attempted to use an `sk_live_` key during a local phase, or your key format is completely unknown.
- **PROVIDER_GATED:** You do not have a Stripe key configured at all. (The studio will still run normally).

Live billing features and real credit card charging will only be unlocked during the explicit production rollout phase, which requires `DEPLOY_ALLOW_PRODUCTION=true` and explicit live envelopes.
