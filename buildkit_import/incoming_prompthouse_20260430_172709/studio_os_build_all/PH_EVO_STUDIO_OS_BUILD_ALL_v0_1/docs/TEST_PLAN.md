# PromptHouse Evo Studio OS — Test Plan

## Unit Tests
- VibeSpec generation
- PromptSpec compilation
- AppSpec generation
- Connector approval rules
- Deployment gate blocking
- Review packet generation

## UI Smoke Tests
- Mission Control renders active mission
- Vibe Fast Lane renders Style DNA
- Prompt Forge shows compiled prompt
- App Forge shows screens and data model
- Bridge Hub shows connector risk and approval
- Proof Deck blocks ship status without artifacts

## Boundary Tests
1. Unpermissioned external write returns approval required.
2. Destructive action is blocked by default.
3. API secrets are never logged or returned.
4. Deployment cannot be marked shipped without proof.
5. PromptHouse modules remain intact.

## Live Validation
After deployment:
1. Create a mission.
2. Generate VibeSpec.
3. Generate PromptSpec.
4. Generate AppSpec.
5. Dry-run GitHub connector.
6. Confirm approval is required.
7. Add proof artifact.
8. Recheck ship gate.
