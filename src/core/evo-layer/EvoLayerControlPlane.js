import { createEvoGitSnapshot } from '../egit/EvoGitSnapshot.js';
import { checkLocalToolAdapters } from '../egit/EvoGitAdapters.js';
import { checkApiAdapters } from '../egit/EvoGitApiAdapters.js';
import { summarizeToolReadiness } from '../egit/EvoGitRegistry.js';
import { listDaemonReceipts } from '../egit/EvoGitDaemonReceipts.js';
import { createEvoLayerManifest } from './EvoLayerManifest.js';
import { getAdapterStatus } from './adapters/AdapterBus.js';
import { listHandshakes } from './handshakes/HandshakeRegistry.js';
import { listDaemonEvents } from './daemons/DaemonBus.js';

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
      legacyLocal: local.map(item => item.id),
      legacyApi: api.map(item => item.id),
      evoLayerAdapters: getAdapterStatus({ rootDir })
    },
    readiness: summarizeToolReadiness({ rootDir }),
    daemonReceipts: listDaemonReceipts({ rootDir, limit: 25 }),
    evoLayer: {
      handshakes: listHandshakes({ rootDir }),
      daemonEvents: listDaemonEvents({ rootDir })
    },
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
      'AdapterBus introduces real adapter registry.',
      'HandshakeRegistry introduces inter-system negotiation layer.',
      'DaemonBus introduces event-level daemon communication.',
      'Evo Layer now sits above Evo Git as a control plane.',
      'No subsystem may claim execution without emitting receipts or events.'
    ],
    createdAt: new Date().toISOString()
  };
}