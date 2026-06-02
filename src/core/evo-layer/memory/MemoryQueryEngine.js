import { readMemory, getMemoryGraph } from './MemoryGraph.js';

export function queryMemory({ rootDir = process.cwd(), type = null, text = null, since = null, limit = 100 } = {}) {
  let rows = readMemory({ rootDir });
  if (type) rows = rows.filter(row => row.type === type);
  if (text) {
    const needle = String(text).toLowerCase();
    rows = rows.filter(row => JSON.stringify(row).toLowerCase().includes(needle));
  }
  if (since) {
    const from = new Date(since).getTime();
    rows = rows.filter(row => new Date(row.createdAt).getTime() >= from);
  }
  return rows.slice(-limit);
}

export function traceExecution({ rootDir = process.cwd(), taskId = null, adapter = null } = {}) {
  return queryMemory({ rootDir, type: 'execution_result', limit: 500 }).filter(row => {
    const data = row.data || {};
    if (taskId && data.task !== taskId && data.id !== taskId) return false;
    if (adapter && data.adapter !== adapter) return false;
    return true;
  });
}

export function inferMemoryHealth({ rootDir = process.cwd() } = {}) {
  const graph = getMemoryGraph({ rootDir });
  const executions = queryMemory({ rootDir, type: 'execution_result', limit: 500 });
  const failures = executions.filter(row => row.data?.status === 'FAILED');
  const successes = executions.filter(row => row.data?.status === 'SUCCESS');
  const adapterFailures = failures.reduce((acc, row) => {
    const key = row.data?.adapter || 'unknown';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  return {
    nodes: graph.nodes.length,
    edges: graph.edges.length,
    executions: executions.length,
    successes: successes.length,
    failures: failures.length,
    adapterFailures,
    risk: failures.length > successes.length ? 'ELEVATED' : failures.length ? 'WATCH' : 'LOW',
    generatedAt: new Date().toISOString()
  };
}
