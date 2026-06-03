import fs from 'fs';
import path from 'path';
import { queryMemory } from '../memory/MemoryQueryEngine.js';
import { getAdapterStatus } from './AdapterBus.js';
import { writeMemory } from '../memory/MemoryGraph.js';
import { emitDaemonEvent } from '../daemons/DaemonBus.js';

function healthRoot(rootDir) {
  const dir = path.join(rootDir, '.evo-layer', 'adapter-health');
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function healthFile(rootDir) {
  return path.join(healthRoot(rootDir), 'adapter-health.json');
}

export function calculateAdapterHealth({ rootDir = process.cwd() } = {}) {
  const adapters = getAdapterStatus({ rootDir });
  const executions = queryMemory({ rootDir, type: 'execution_result', limit: 1000 });

  const rows = adapters.map(adapter => {
    const adapterExecutions = executions.filter(row => row.data?.adapter === adapter.name);
    const successes = adapterExecutions.filter(row => row.data?.status === 'SUCCESS').length;
    const failures = adapterExecutions.filter(row => row.data?.status === 'FAILED').length;
    const blocked = adapterExecutions.filter(row => row.data?.status === 'BLOCKED').length;
    const durations = adapterExecutions
      .map(row => Number(row.data?.adapterResult?.durationMs || 0))
      .filter(ms => Number.isFinite(ms));
    const avgDurationMs = durations.length ? Math.round(durations.reduce((sum, ms) => sum + ms, 0) / durations.length) : null;
    const total = successes + failures + blocked;
    const successRate = total ? Math.round((successes / total) * 100) : null;
    let trustScore = adapter.status === 'missing' ? 0 : 70;
    if (successRate !== null) trustScore = Math.round((trustScore + successRate) / 2);
    if (failures > successes && total > 0) trustScore -= 20;
    if (blocked > 0) trustScore -= 10;
    trustScore = Math.max(0, Math.min(100, trustScore));

    return {
      name: adapter.name,
      status: adapter.status,
      lastSeen: adapter.lastSeen,
      totalExecutions: total,
      successes,
      failures,
      blocked,
      successRate,
      avgDurationMs,
      trustScore,
      health: trustScore >= 80 ? 'STRONG' : trustScore >= 55 ? 'WATCH' : 'WEAK'
    };
  });

  const report = {
    truthState: 'ADAPTER_HEALTH_REPORT_CREATED',
    adapters: rows,
    strongest: [...rows].sort((a, b) => b.trustScore - a.trustScore)[0] || null,
    weakest: [...rows].sort((a, b) => a.trustScore - b.trustScore)[0] || null,
    generatedAt: new Date().toISOString()
  };

  fs.writeFileSync(healthFile(rootDir), JSON.stringify(report, null, 2));
  writeMemory({ rootDir, type: 'adapter_health_report', data: report });
  emitDaemonEvent({ rootDir, daemonId: 'adapter-health-engine', event: 'adapter_health_report_created', payload: report });
  return report;
}

export function getAdapterHealthReport({ rootDir = process.cwd() } = {}) {
  const file = healthFile(rootDir);
  if (!fs.existsSync(file)) return calculateAdapterHealth({ rootDir });
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}
