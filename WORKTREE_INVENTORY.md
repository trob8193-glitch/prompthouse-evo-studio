# Worktree Inventory

Snapshot basis: `git status --short --untracked-files=all`

Current classified snapshot:

- total dirty entries: `736`
- source: `133`
- generated: `189`
- imported: `414`
- build: `0`
- proof: `0`
- unknown: `0`

This repo is intentionally not a clean tiny app tree. It contains active source, imported snapshots, generated artifacts, and proof/runtime outputs. The release rule is classification, not deletion.

## Classification Rules

- `source`
  - app code, tests, public assets, root docs, config, bridge files
- `generated`
  - generated apps, extension builds, scratch outputs, temp prompt packs
- `imported`
  - `buildkit_import/`, zip extractions, imported upstream packets and snapshots
- `build`
  - `dist/`, `node_modules/`, cache outputs
- `proof`
  - `.prompthouse-data/`, proof receipts, build queues, local runtime ledgers
- `unknown`
  - anything not matching a rule above

## Handling Rules

- Do not delete imported or generated trees as part of release hardening.
- Unknown entries block clean release claims until classified.
- Root docs and gate files are treated as `source`.
- Browser captures, prompt packs, and import snapshots stay preserved for auditability.

## Main Dirty Roots

- `src/`
- `tests/`
- `public/`
- `buildkit_import/`
- `generated_apps/`
- `temp_prompts/`
- `.prompthouse-data/`

## Release Rule

`/api/generated-artifact-registry` must report `unknown: 0` before the repo can claim a clean classified release surface.
