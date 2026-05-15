# Stripe Test Checkout Flow

PromptHouse Evo Studio implements a safe execution rail for Stripe Test Checkout Sessions.

- Test checkout sessions require a configured `STRIPE_SECRET_KEY` starting with `sk_test_` in `.env`.
- Live keys (`sk_live_`) are explicitly blocked to prevent accidental billing.
- Creating a checkout session requires explicit owner approval (scope: `commerce`).
- Creating a session generates a `provider-receipt` with the session ID and URL.
- The studio does not automatically redirect to Stripe; it provides a link to the checkout page.
- No customers or subscriptions are created in this phase.
- Stripe Test card numbers (e.g., `4242 4242 4242 4242`) should be used for testing on the Stripe-hosted page.
- Never commit `.env` or expose your Stripe secret key in logs or chat.
