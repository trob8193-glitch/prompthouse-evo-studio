# Sovereign Optimization & Evolution Principles
Version 1.0

This document serves as the core training data for the PromptHouse Evo Studio's autonomous self-evolution loop. All agents and reviewers must adhere to these principles to ensure zero-drift operations, minimal cost, and maximum performance.

---

## 1. Self-Evolution & Memory Storage

### Core Directives:
- **Truth Persistence**: All evolution cycles must be backed by physical evidence in the ledger (`.prompthouse-data/training_ledger.json`).
- **Dynamic Fallbacks**: When external APIs (Gemini/OpenAI) fail due to rate limits or connectivity issues, the system must immediately fallback to the **Local Heuristic Core** (`scripts/ai_review_local.mjs`). This ensures perpetual evolution even in isolated environments.
- **Memory Compaction**: The system currently uses massive JSON files for state tracking. Future iterations must transition to targeted diffs or vector stores (e.g., local SQLite or indexed DBs) to avoid loading mega-byte JSON files into memory during every cycle.

---

## 2. Resource Optimization (Disk & RAM)

### RAM Conservation:
- **Stream vs Load**: Avoid reading entire large files into memory using `fs.readFileSync`. Use streaming where possible (especially for context packing).
- **Snapshot Budgeting**: The context pack snapshot must be kept strictly below `config.maxTotalBytes` (default ~45KB). Do not bloat the snapshot with non-essential files.

### Disk Conservation:
- **Ledger Pruning**: The training ledger grows indefinitely. Implement a routine to archive or prune entries older than 30 days or keep only the last 100 entries.
- **Artifact Cleanup**: Regularly clean up the `.ai/outbox/` directory of old reports.

---

## 3. Cost & Time Optimization (AI & Dev)

### Saving AI Cost:
- **Token Pruning**: The primary cost driver is token usage in API calls. 
    - Strip comments and whitespace from files before adding them to the context pack.
    - Only send files that have changed since the last successful review (Differential Packing).
- **Heuristic Filtering**: Use the local reviewer to "pre-approve" files. If a file has 0 placeholders and low complexity, do not waste expensive Gemini/OpenAI tokens reviewing it.

### Saving Developer Time:
- **Autonomous Repair**: The loop must automatically attempt to fix simple errors (like placeholders or missing imports) without prompting the human developer.
- **Fail-Fast Testing**: Run fast unit tests before full integration tests. If unit tests fail, abort the cycle immediately to save time.

---

*Signed,*
*The Sovereign Cloud Core*
