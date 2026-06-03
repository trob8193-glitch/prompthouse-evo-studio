import fs from 'fs';
import path from 'path';
import { calculateAdapterHealth } from './AdapterHealthEngine.js';
import { writeMemory } from '../memory/MemoryGraph.js';
import { emitDaemonEvent } from '../daemons/DaemonBus.js';

const FALLBACKS = Object.freeze({
  ollama: ['openai', 'filesystem', 'git'],
  openai: ['ollama', 'filesystem', 'git'],
  vscode: ['cursor', 'filesystem', 'git'],
  cursor: ['vscode', 'filesystem', 'git'],
  vercel: ['filesystem', 'git'],
  stripe: ['openai', 'filesystem'],
  filesystem: ['git'],
  git: ['filesystem']
});

function failoverRoot(rootDir) {
  const dir = path.join(rootDir, '.evo-layer', 'adapter-failover');
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function writeReceipt(rootDir, receipt) {
  const file = path.join(failoverRoot(rootDir), `${receipt.id}.json`);
  fs.writeFileSync(file, JSON.stringify(receipt, null, 2));
  return file;
}

export function getAdapterFailoverChain({ rootDir = process.cwd(), adapter }) {
  const health = calculateAdapterHealth({ rootDir });
  const byName = Object.fromEntries((health.adapters || []).map(item => [item.name, item]));
  const chain = [adapter, ...(FALLBACKS[adapter] || [])]
    .filter(Boolean)
    .map(name => byName[name] || { name, health: 'UNKNOWN', trustScore: 0, status: 'missing' })
    .sort((a, b) => Number(b.trustScore || 0) - Number(a.trustScore || 0));

  return {
    truthState: 'ADAPTER_FAILOVER_CHAIN_CREATED',
    requestedAdapter: adapter,
    selected: chain.find(item => item.health !== 'WEAK' && item.status !== 'missing') || chain[0] || null,
    chain,
    generatedAt: new Date().toISOString()
  };
}

export function createAdapterFailoverPlan({ rootDir = process.cwd() } = {}) {
  const health = calculateAdapterHealth({ rootDir });
  const weakAdapters = (health.adapters || []).filter(adapter => adapter.health === 'WEAK');
  const plans = weakAdapters.map(adapter => getAdapterFailoverChain({ rootDir, adapter: adapter.name }));
  const plan = {
    id: `adapter_failover_plan_${Date.now()}`,
    truthState: 'ADAPTER_FAILOVER_PLAN_CREATED',
    weakAdapterCount: weakAdapters.length,
    plans,
    createdAt: new Date().toISOString()
  };
  plan.file = writeReceipt(rootDir, plan);
  writeMemory({ rootDir, type: 'adapter_failover_plan', data: plan });
  emitDaemonEvent({ rootDir, daemonId: 'adapter-failover-runtime', event: 'adapter_failover_plan_created', payload: plan });
  return plan;
}
