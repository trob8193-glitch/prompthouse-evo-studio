# PH EVO STUDIO — FIVE-MINUTE DEMO WORKFLOW

This document outlines a concise flagship demo loop to prove the product's core value proposition without requiring private credentials.

## Step 1: Launch the Environment (1 Minute)

Start the studio in demo-safe mode:

```bash
# Start bridge and frontend
npm run dev:all
```

Navigate to `http://localhost:5173` and click **"ENTER DEMO MODE"** on the Auth Sentry screen.

## Step 2: Verification Cockpit (1 Minute)

Navigate to the **Launch Proof** tab. This view demonstrates:

- **Live Audit Results:** Shows that the code is self-auditing.
- **Route Contract Parity:** Proves that documentation and code are in sync.
- **Build Status:** Confirms the current environment is production-ready.

## Step 3: Sovereign Terminal (1 Minute)

Open the **Witness Console** and run a safe `evo` command:

```bash
evo scan
```

This demonstrates the studio's ability to probe the local subnet and identify active services (Bridge, Ollama, etc.) without external API calls.

## Step 4: Feature Foundry (1 Minute)

Navigate to the **Feature Foundry** and view the **Module Maturity Dashboard**. This shows:

- **Maturity Scores:** How "complete" each module is based on tests and coverage.
- **Self-Implementation Policy:** The rules governing how the studio builds itself.

## Step 5: Truth Spine Status (1 Minute)

Check the **Proof Center** to see the aggregate "Truth Score" of the entire project. This score represents the overall confidence in the system's operational reality.

---

**Outcome:** The reviewer sees a fully functional, self-verifying studio shell that is ready for production credentials.
