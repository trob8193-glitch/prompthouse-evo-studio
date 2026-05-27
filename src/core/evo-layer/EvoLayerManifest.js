import fs from 'fs';
import path from 'path';
import { ensureEgitDirs } from '../egit/EvoGitPaths.js';
import { writeEvoObject } from '../egit/EvoGitObjectStore.js';

export const EVO_LAYER_VERSION = '1.0.0-x10';

export const EVO_LAYER_CAPABILITIES = Object.freeze([
  'source_control_overlay',
  'content_addressed_objects',
  'studio_snapshots',
  'build_artifact_tracking',
  'adapter_readiness_receipts',
  'api_credential_readiness',
  'ollama_local_tool_readiness',
  'daemon_receipts',
  'handoff_receipts',
  'proof_gate_receipts',
  'release_claim_guardrails',
  'backward_egit_compatibility'
]);

export function createEvoLayerManifest({ rootDir = process.cwd(), label = 'evo_layer_manifest' } = {}) {
  const paths = ensureEgitDirs(rootDir);
  const manifest = {
    id: `evo_layer_manifest_${Date.now()}`,
    name: 'Evo Layer',
    formerName: 'Evo Git',
    version: EVO_LAYER_VERSION,
    label,
    truthState: 'EVO_LAYER_MANIFEST_CREATED',
    compatibility: {
      egitAliasPreserved: true,
      storageRoot: paths.root,
      cliAlias: 'scripts/evo-layer.mjs -> scripts/evo-git.mjs'
    },
    capabilities: EVO_LAYER_CAPABILITIES,
    layers: [
      { id: 'layer_01_source', name: 'Source Layer', role: 'Git state and repo snapshot awareness' },
      { id: 'layer_02_objects', name: 'Object Layer', role: 'Content-addressed Evo objects' },
      { id: 'layer_03_adapters', name: 'Adapter Layer', role: 'Ollama, APIs, IDE, and local tool readiness' },
      { id: 'layer_04_daemons', name: 'Daemon Layer', role: 'Receipt-backed daemon observations and cycles' },
      { id: 'layer_05_artifacts', name: 'Artifact Layer', role: 'Generated apps, build queues, imports, and temp prompt surfaces' },
      { id: 'layer_06_proof', name: 'Proof Layer', role: 'Test, build, maturity, platform, and claim receipts' },
      { id: 'layer_07_release', name: 'Release Layer', role: 'Deploy, commerce, external provider gating and claims' }
    ],
    createdAt: new Date().toISOString()
  };
  const object = writeEvoObject({ rootDir, type: 'evo_layer_manifest', payload: manifest });
  manifest.objectId = object.objectId;
  const file = path.join(paths.root, 'evo_layer_manifest.json');
  fs.writeFileSync(file, JSON.stringify(manifest, null, 2), 'utf8');
  return manifest;
}
