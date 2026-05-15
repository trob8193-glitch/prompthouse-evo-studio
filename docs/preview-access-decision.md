# Preview Access Decision

This document explains the logic and decisions regarding Vercel Preview URL access states in Phase 16A.

## The 401 Unauthorized Condition

During Phase 15 verification, smoke checks of the Vercel Preview deployment returned an `HTTP 401 Unauthorized` status.

### Why did this happen?
This is caused by **Vercel Authentication**. Vercel by default protects preview deployments with a login gate to prevent unauthorized public access to in-progress work.

### Why it is NOT an app failure
The 401 status indicates that the web server is reachable and active, but is enforcing a security gate. If the app were failing to start or crashing, we would expect 5xx errors or connection timeouts. Therefore, 401 is a **valid security gate** and proof of deployment life.

## Access Mode Classifications

The `preview-access-decision` service classifies the state into several modes:

- **AUTH_PROTECTED**: Reachable but gated by Vercel Auth (HTTP 401).
- **PUBLIC_ACCESSIBLE**: Fully reachable without auth (HTTP 200).
- **NEEDS_MANUAL_BROWSER_CHECK**: Deployment exists but smoke test result is missing.
- **BLOCKED**: Other HTTP errors (e.g., 403, 404, 500).
- **UNKNOWN**: No deployment receipt or unrecognizable state.

## Options for Public Preview

The studio provides the following paths:

1. **Keep Authentication Enabled (Recommended)**
   - Maintains the Vercel security gate.
   - Requires developers to be logged into Vercel to see the preview.
   - Safest for sensitive codebases.

2. **Manual Browser Verification**
   - The user opens the preview URL in their browser.
   - Logs into Vercel.
   - Confirms the app is rendering correctly.

3. **Explicit Public Preview (Phase 16B/C)**
   - Only if the owner explicitly chooses to expose the preview to the public.
   - Requires disabling Vercel Authentication in the Vercel project settings.
   - **Risk:** Exposes the deployment URL to anyone with the link.

## Future Strategies

- **Authenticated Smoke Strategy**: We may implement a bypass token or header-based authentication in future phases to allow the studio's automated smoke check to "see through" the Vercel Auth gate without making the URL public.
