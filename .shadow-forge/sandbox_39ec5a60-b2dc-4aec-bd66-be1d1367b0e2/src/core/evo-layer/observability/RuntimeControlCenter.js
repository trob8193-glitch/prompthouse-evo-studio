import { runEvoLayerStatus } from '../EvoLayerControlPlane.js';
import { getSchedulerReport } from '../scheduler/TaskScheduler.js';
import { getMemoryGraph } from '../memory/MemoryGraph.js';
import { getAdapterStatus } from '../adapters/AdapterBus.js';
import { listHandshakes } from '../handshakes/HandshakeRegistry.js';
import { listDaemonEvents } from '../daemons/DaemonBus.js';

export function getRuntimeControlCenterStatus({ rootDir = process.cwd() } = {}) {
  const scheduler = getSchedulerReport({ rootDir });
  const memory = getMemoryGraph({ rootDir });
  const adapters = getAdapterStatus({ rootDir });
  const handshakes = listHandshakes({ rootDir });
  const daemonEvents = listDaemonEvents({ rootDir });

  return {
    name: 'Evo Runtime Control Center',
    truthState: 'RUNTIME_CONTROL_CENTER_STATUS_RECORDED',
    layer: runEvoLayerStatus({ rootDir, includeManifest: false }),
    scheduler,
    memory: {
      nodeCount: memory.nodes.length,
      edgeCount: memory.edges.length,
      preview: memory.nodes.slice(-15)
    },
    adapters,
    handshakes: handshakes.slice(-25),
    daemonEvents: daemonEvents.slice(-50),
    health: deriveRuntimeHealth({ scheduler, memory, adapters, handshakes, daemonEvents }),
    generatedAt: new Date().toISOString()
  };
}

export function deriveRuntimeHealth({ scheduler, memory, adapters, handshakes, daemonEvents }) {
  const missingAdapters = adapters.filter(adapter => adapter.status === 'missing').length;
  const queued = scheduler.byState?.QUEUED || 0;
  const failed = scheduler.byState?.FAILED || 0;
  const memoryNodes = memory.nodes.length;
  const recentEvents = daemonEvents.length;

  let score = 100;
  score -= Math.min(25, missingAdapters * 3);
  score -= Math.min(20, failed * 4);
  score -= queued > 20 ? 10 : 0;
  score -= memoryNodes === 0 ? 10 : 0;
  score -= recentEvents === 0 ? 5 : 0;

  return {
    score: Math.max(0, score),
    status: score >= 85 ? 'HEALTHY' : score >= 65 ? 'NEEDS_ATTENTION' : 'UNSTABLE',
    signals: {
      missingAdapters,
      queuedTasks: queued,
      failedTasks: failed,
      memoryNodes,
      handshakes: handshakes.length,
      daemonEvents: recentEvents
    }
  };
}
