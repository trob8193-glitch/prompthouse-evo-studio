# Stripe Test Checkout Browser Run

This document describes the procedure for manually verifying the Stripe Checkout flow in **Test Mode**.

## Prerequisites
1. `STRIPE_SECRET_KEY` must start with `sk_test_`.
2. `DEPLOY_ALLOW_PRODUCTION` must be `false`.
3. Studio Bridge must be running (`npm run bridge`).

## Manual Verification Procedure

### 1. Create a Test Session
- Navigate to the **Proof Center** or **Deployment Center**.
- Locate the **Stripe Test Checkout Flow** panel.
- Grant **Commerce Approval** (local execution envelope).
- Click **Create Stripe Test Checkout Session**.

### 2. Record the Run
- Once the session is created, click **Record Browser Verification Run**.
- This creates a tracking ID (`SBR-XXXXX`).

### 3. Perform the Checkout
- Click **Open Stripe Checkout**.
- Verify that the Stripe Checkout page loads in a new tab.
- Verify the header says **TEST MODE**.
- Use a [Stripe Test Card](https://stripe.com/docs/testing#cards) (e.g., `4242 4242 4242 4242`).
- Complete the payment.

### 4. Record Results
- Return to the Studio.
- Click the appropriate verification step button:
    - **Page Rendered Success**: If the checkout page loaded correctly.
    - **Test Payment Completed**: If the payment was successful.
- Add notes if necessary.

### 5. Generate Proof
- Run the report script:
  ```bash
  npm run stripe:test-checkout-report
  ```
- This generates `docs/stripe-test-checkout-verification-report.md`.

## Security Notes
- **NEVER** use live cards.
- **NEVER** use `sk_live_` keys.
- All data is stored locally in `.prompthouse-data/`.
