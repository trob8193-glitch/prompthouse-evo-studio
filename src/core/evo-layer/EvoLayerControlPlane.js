import { createEvoGitSnapshot } from '../egit/EvoGitSnapshot.js';
import { checkLocalToolAdapters } from '../egit/EvoGitAdapters.js';
import { checkApiAdapters } from '../egit/EvoGitApiAdapters.js';
import { summarizeToolReadiness } from '../egit/EvoGitRegistry.js';
import { listDaemonReceipts } from '../egit/EvoGitDaemonReceipts.js';
import { createEvoLayerManifest } from './EvoLayerManifest.js';

export function runEvoLayerStatus({ rootDir = process.cwd(), includeManifest = true } = {}) {
  const local = checkLocalToolAdapters({ rootDir });
  const api = checkApiAdapters({ rootDir });
  const manifest = includeManifest ? createEvoLayerManifest({ rootDir, label: 'status_manifest' }) : null;
  return {
    success: true,
    name: 'Evo Layer',
    truthState: 'EVO_LAYER_STATUS_RECORDED',
    manifest,
    adapterReceipts: {
      local: local.map(item => item.id),
      api: api.map(item => item.id)
    },
    readiness: summarizeToolReadiness({ rootDir }),
    daemonReceipts: listDaemonReceipts({ rootDir, limit: 25 }),
    checkedAt: new Date().toISOString()
  };
}

export function runEvoLayerSnapshot({ rootDir = process.cwd(), label = 'evo_layer_snapshot' } = {}) {
  const manifest = createEvoLayerManifest({ rootDir, label: `${label}_manifest` });
  const snapshot = createEvoGitSnapshot({ rootDir, label, includeAdapters: true });
  return {
    success: true,
    name: 'Evo Layer',
    truthState: 'EVO_LAYER_SNAPSHOT_RECORDED',
    manifest,
    snapshot,
    createdAt: new Date().toISOString()
  };
}

export function runEvoLayerX10({ rootDir = process.cwd() } = {}) {
  const status = runEvoLayerStatus({ rootDir, includeManifest: true });
  const snapshot = runEvoLayerSnapshot({ rootDir, label: 'evo_layer_x10_snapshot' });
  return {
    success: true,
    name: 'Evo Layer',
    upgrade: 'x10',
    truthState: 'EVO_LAYER_X10_RECORDED',
    status,
    snapshot,
    rules: [
      'Do not replace Git; supervise Git with studio receipts.',
      'Do not claim daemon work without daemon receipts.',
      'Do not claim API execution without provider or credential receipts.',
      'Preserve egit commands as backward-compatible aliases.',
      'Use Evo Layer as the public product name.'
    ],
    createdAt: new Date().toISOString()
  };
}
