# AI Self-Training Report
Generated: 2026-05-25T05:40:13.681Z
Bridge: http://127.0.0.1:3001
Training capture: training_1779687584151
Model: gpt-4o

## Review Snapshot
# Singularity Offline Heuristic Review
**Status**: OFFLINE MODE (Fallback)
**System IQ Score**: 90/100
**Files Scanned**: 25

## Executive Summary
The studio is running in offline mode. This review was generated via local heuristic analysis. The system analyzed file complexity, placeholder density, and structural integrity.

## Detected Issues
- **[HIGH]** docs/knowledge/evolution_and_optimization.md: Detected 2 placeholder markers.
- **[HIGH]** docs/knowledge/session_evolution.md: Detected 1 placeholder markers.
- **[HIGH]** docs/knowledge/phase_15_blueprint.md: Detected 2 placeholder markers.

# Repair Checklist
- [ ] Resolve Placeholder in `docs/knowledge/evolution_and_optimization.md`
- [ ] Resolve Placeholder in `docs/knowledge/session_evolution.md`
- [ ] Resolve Placeholder in `docs/knowledge/phase_15_blueprint.md`
- [ ] Complete the remaining 7 evolution missions when API quota resets.

# Exact Antigravity Execution Prompt
The studio is in stable offline mode with a logic density score of 90/100. 
Execute the repair checklist to resolve detected placeholders and maintain the Singularity baseline.
If online quota is available, switch to Cloud Core for deep architectural synthesis.

## Next-Pass Summary
The studio is in stable offline mode with a logic density score of 90/100. 
Execute the repair checklist to resolve detected placeholders and maintain the Singularity baseline.
If online quota is available, switch to Cloud Core for deep architectural synthesis.

## Implementation Result
{
  "success": false,
  "state": {
    "schemaVersion": 1,
    "active": true,
    "mode": "controlled_local",
    "summary": {
      "status": "ready",
      "active": 11,
      "gated": 2,
      "missing": 0,
      "total": 13,
      "activationPercent": 85
    },
    "capabilities": [
      {
        "id": "promptbridge_health",
        "label": "PromptBridge health",
        "kind": "local_bridge",
        "files": [
          "promptbridge-server.js"
        ],
        "endpoints": [
          "GET /status"
        ],
        "status": "active",
        "autoActivatable": true,
        "missing": []
      },
      {
        "id": "self_maintenance",
        "label": "Self maintenance scan",
        "kind": "local_engine",
        "files": [
          "src/core/automation/self_maintenance.js"
        ],
        "status": "active",
        "autoActivatable": true,
        "missing": []
      },
      {
        "id": "self_healer",
        "label": "Self healer module",
        "kind": "local_engine",
        "files": [
          "src/core/automation/SelfHealer.js"
        ],
        "status": "active",
        "autoActivatable": true,
        "missing": []
      },
      {
        "id": "shadow_runner",
        "label": "Shadow run simulator",
        "kind": "local_engine",
        "files": [
          "src/core/automation/ShadowRunner.js"
        ],
        "status": "active",
        "autoActivatable": true,
        "missing": []
      },
      {
        "id": "async_queue",
        "label": "Async task queue",
        "kind": "local_engine",
        "files": [
          "src/core/automation/AsyncQueue.js"
        ],
        "status": "active",
        "autoActivatable": true,
        "missing": []
      },
      {
        "id": "autonomous_builder",
        "label": "Autonomous app builder",
        "kind": "local_builder",
        "files": [
          "src/autonomous-builder.js",
          "src/autonomous-views.jsx"
        ],
        "endpoints": [
          "POST /build"
        ],
        "status": "active",
        "autoActivatable": true,
        "missing": []
      },
      {
        "id": "nightforge",
        "label": "NightForge proposal cycle",
        "kind": "local_builder",
        "files": [
          "src/nightforge.js"
        ],
        "status": "active",
        "autoActivatable": true,
        "missing": []
      },
      {
        "id": "proof_receipts",
        "label": "Proof receipt ledger",
        "kind": "local_store",
        "endpoints": [
          "GET /api/browser-bridge/proof",
          "POST /api/browser-bridge/proof"
        ],
        "status": "active",
        "autoActivatable": true,
        "missing": []
      },
      {
        "id": "test_runner",
        "label": "Local test runner",
        "kind": "verification",
        "files": [
          "package.json",
          "tests/past-mvp.test.js"
        ],
        "status": "active",
        "autoActivatable": true,
        "missing": []
      },
      {
        "id": "project_handshake",
        "label": "Project source handshake",
        "kind": "verification",
        "files": [
          "src/project-handshake.js"
        ],
        "endpoints": [
          "GET /api/project-handshake",
          "POST /api/project-handshake"
        ],
        "status": "active",
        "autoActivatable": true,
        "missing": []
      },
      {
        "id": "buildkit",
        "label": "BuildKit importer",
        "kind": "local_builder",
        "endpoints": [
          "GET /buildkit/manifest",
          "POST /buildkit/materialize"
        ],
        "status": "active",
        "autoActivatable": true,
        "missing": []
      },
      {
        "id": "production_deploy",
        "label": "Production deploy rail",
        "kind": "external_gated",
        "env": [
          "VERCEL_TOKEN"
        ],
        "ownerApprovalRequired": true,
        "status": "gated",
        "autoActivatable": false,
        "missing": [
          "VERCEL_TOKEN",
          "owner_approval"
        ]
      },
      {
        "id": "live_commerce",
        "label": "Live commerce rail",
        "kind": "external_gated",
        "env": [
          "STRIPE_SECRET_KEY"
        ],
        "ownerApprovalRequired": true,
        "status": "gated",
        "autoActivatable": false,
        "missing": [
          "STRIPE_SECRET_KEY",
          "owner_approval"
        ]
      }
    ],
    "policies": {
      "noDelete": true,
      "noSilentDeploy": true,
      "noSecretExposure": true,
      "ownerApprovalForExternalActions": true,
      "proofRequiredForCompleteClaim": true
    },
    "activatedAt": "2026-05-03T12:28:06.116Z",
    "lastUpdatedAt": "2026-05-25T05:40:13.666Z",
    "lastCycle": {
      "id": "self_cycle_1779687613665",
      "status": "broken",
      "applyFixes": true,
      "runTests": true,
      "runBuild": true,
      "durationMs": 29330,
      "maintenance": {
        "success": true,
        "issuesFixed": 0,
        "issuesDetected": 48,
        "gapCount": 161,
        "applied": true,
        "recorded": true,
        "newIQ": 207,
        "cycle": 57,
        "mutated": true,
        "writes": [
          "C:\\Users\\Noname\\.gemini\\antigravity-ide\\scratch\\prompthouse-evo-studio\\.sovereign-brain.json",
          "C:\\Users\\Noname\\.gemini\\antigravity-ide\\scratch\\prompthouse-evo-studio\\src\\engine.js",
          "C:\\Users\\Noname\\.gemini\\antigravity-ide\\scratch\\prompthouse-evo-studio\\src\\index.css"
        ]
      },
      "commands": [
        {
          "success": true,
          "command": "node --check promptbridge-server.js",
          "durationMs": 120
        },
        {
          "success": false,
          "command": "npm test",
          "durationMs": 16757
        },
        {
          "success": true,
          "command": "npm run build",
          "durationMs": 12216
        }
      ],
      "completedAt": "2026-05-25T05:40:13.665Z",
      "mutated": true,
      "writes": [
        "C:\\Users\\Noname\\.gemini\\antigravity-ide\\scratch\\prompthouse-evo-studio\\.sovereign-brain.json",
        "C:\\Users\\Noname\\.gemini\\antigravity-ide\\scratch\\prompthouse-evo-studio\\src\\engine.js",
        "C:\\Users\\Noname\\.gemini\\antigravity-ide\\scratch\\prompthouse-evo-studio\\src\\index.css"
      ]
    },
    "truth_state": "built"
  },
  "cycle": {
    "id": "self_cycle_1779687613665",
    "status": "broken",
    "applyFixes": true,
    "runTests": true,
    "runBuild": true,
    "durationMs": 29330,
    "maintenance": {
      "success": true,
      "issuesFixed": 0,
      "issuesDetected": 48,
      "gapCount": 161,
      "applied": true,
      "recorded": true,
      "newIQ": 207,
      "cycle": 57,
      "mutated": true,
      "writes": [
        "C:\\Users\\Noname\\.gemini\\antigravity-ide\\scratch\\prompthouse-evo-studio\\.sovereign-brain.json",
        "C:\\Users\\Noname\\.gemini\\antigravity-ide\\scratch\\prompthouse-evo-studio\\src\\engine.js",
        "C:\\Users\\Noname\\.gemini\\antigravity-ide\\scratch\\prompthouse-evo-studio\\src\\index.css"
      ]
    },
    "commands": [
      {
        "success": true,
        "command": "node --check promptbridge-server.js",
        "durationMs": 120
      },
      {
        "success": false,
        "command": "npm test",
        "durationMs": 16757
      },
      {
        "success": true,
        "command": "npm run build",
        "durationMs": 12216
      }
    ],
    "completedAt": "2026-05-25T05:40:13.665Z",
    "mutated": true,
    "writes": [
      "C:\\Users\\Noname\\.gemini\\antigravity-ide\\scratch\\prompthouse-evo-studio\\.sovereign-brain.json",
      "C:\\Users\\Noname\\.gemini\\antigravity-ide\\scratch\\prompthouse-evo-studio\\src\\engine.js",
      "C:\\Users\\Noname\\.gemini\\antigravity-ide\\scratch\\prompthouse-evo-studio\\src\\index.css"
    ]
  },
  "receipt": {
    "id": "receipt_self_cycle_1779687613673",
    "missionId": "self_implementation",
    "action": "self_implementation:cycle",
    "status": "broken",
    "evidenceType": "self_implementation_cycle",
    "evidenceUri": "/api/self-implementation/status",
    "applyFixes": true,
    "syntaxCheck": true,
    "testsPassed": false,
    "buildPassed": true,
    "durationMs": 29330,
    "noDeletePolicy": true,
    "mutated": true,
    "timestamp": "2026-05-25T05:40:13.673Z"
  },
  "persisted": true,
  "fileMutationApplied": true,
  "mutationMode": "apply_fixes"
}