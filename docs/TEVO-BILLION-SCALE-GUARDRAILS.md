# TEVO Billion-Scale Product Guardrails

## Product thesis
TEVO must become a general-purpose autonomous software production environment, not merely an AI chat interface or code editor.

## Non-negotiable proof gates

A capability is **production-ready** only when TEVO can:
1. execute it against a real project;
2. produce machine-readable evidence;
3. compare the result to a baseline;
4. preserve provenance;
5. recover or rollback when practical;
6. detect regressions;
7. convert regressions into future defenses;
8. repeat the cycle.

## Moat-building systems

### 1. Agent execution kernel
Unified tool router for files, shell, git, package managers, browsers, test runners, 3D tools, model providers, and deployment targets.

### 2. Evidence graph
Every action, observation, artifact, test, metric, model/version, prompt/context source, approval, rollback, and promotion receives an immutable event ID and provenance chain.

### 3. Evaluation laboratory
Before/after benchmark suites for code quality, correctness, runtime performance, security, UX, 3D asset validity, build reliability, cost, latency, and user-task completion.

### 4. Evolution controller
Generates candidate improvements, runs them in isolated workspaces, evaluates them against baselines, and promotes only verified candidates.

### 5. Recovery system
Snapshots, git checkpoints, isolated branches/worktrees where available, failure classification, rollback, repair, and post-recovery verification.

### 6. Learning system
Separates:
- user preference memory,
- project knowledge,
- verified engineering lessons,
- regression defenses,
- model-training datasets.

Never silently train on unverified outcomes.

### 7. Model router
Local-first and cloud model routing based on task, capability, latency, cost, privacy, context, and measured success rate. Model changes themselves are evaluated and reversible.

### 8. User adaptation
Each user gets an explicit adaptive profile with provenance, confidence, decay, correction, and opt-out controls. Preferences must never silently override project requirements.

### 9. 3D production pipeline
Natural language → scene plan → geometry → materials → rigging/animation → validation → visual inspection → repair → export → runtime verification.

### 10. Application factory
Natural language → specification → architecture → implementation → dependency resolution → tests → security checks → packaging → deployment → monitoring → evolution.

## Billion-scale validation metrics

Track these as real measurements, not marketing claims:
- autonomous task completion rate;
- human intervention rate;
- first-pass build success;
- regression rate;
- recovery success rate;
- verified improvement per evolution cycle;
- median time from request to working artifact;
- cost per successful task;
- model routing efficiency;
- user retention;
- project retention;
- deployment success;
- production incident rate;
- reusable verified lessons;
- percentage of autonomous actions with provenance.

## Business moat

The product becomes strategically valuable when its evidence graph, verified lessons, evaluation corpus, user adaptations, agent execution reliability, and cross-project learning create a compounding advantage that is difficult to reproduce by simply adding another LLM to an editor.

## Anti-hype rule

Never label TEVO "self-improving", "self-training", "autonomous", "production-ready", or "enterprise-ready" based solely on architecture. Each claim requires an associated receipt and measurable evidence.
