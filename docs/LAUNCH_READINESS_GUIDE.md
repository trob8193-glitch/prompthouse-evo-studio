# PH EVO STUDIO — LAUNCH READINESS GUIDE

This guide details the proof-backed setup, verification path, gates, and pilot readiness criteria for PromptHouse Evo Studio.

## 1. Proof-Backed Setup

The studio is designed to be "proof-gated," meaning functionality is only enabled when its underlying implementation has been verified.

- **Dependency Integrity:** All dependencies must be audited and free of critical vulnerabilities.
- **Route Contract:** Documented API endpoints must match actual server implementations.
- **Truth Spine:** The core engines (Audit, Forge, Maintenance) must be reachable and functional.

## 2. Verification Path

To verify the studio's readiness, run the automated proof script:

```bash
npm run launch:proof
```

This script executes the following checks:

1.  **Security Audit:** Runs `npm audit` to ensure a clean baseline.
2.  **Syntax Check:** Verifies code integrity across the repository.
3.  **Route Discovery:** Scans the bridge for concrete Express route registrations.
4.  **Test Suite:** Executes core functional and integration tests.
5.  **Production Build:** Confirms the Vite frontend builds successfully.

## 3. Launch Gates

| Gate           | Description                              | Status      |
| :------------- | :--------------------------------------- | :---------- |
| **Security**   | 0 High/Critical vulnerabilities          | ✅ Verified |
| **Integrity**  | All tests passing, build successful      | ✅ Verified |
| **Demo**       | Safe local-first demo routes active      | ✅ Active   |
| **Commerce**   | Gated until owner approval & credentials | 🔒 Gated    |
| **Deployment** | Vercel integration ready for production  | 🔒 Gated    |

## 4. Pilot Readiness Criteria

The studio is considered "Pilot Ready" when a reviewer can:

1.  Access the dashboard without private credentials (via Demo Mode).
2.  Run the Launch Proof UI to see real-time verification status.
3.  Execute a "Five-Minute Demo Loop" as documented in `DEMO_WORKFLOW.md`.
