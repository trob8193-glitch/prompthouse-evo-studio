const bridgeUrl = process.env.PH_EVO_BRIDGE_URL || 'http://127.0.0.1:3001';

async function post(path, body) {
  const response = await fetch(`${bridgeUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return {
    ok: response.ok,
    status: response.status,
    data: await response.json().catch(() => null),
  };
}

async function main() {
  const runId = `intensive_evolution_${Date.now()}`;
  const capture = await post('/api/training-capture', {
    id: runId,
    event: 'intensive_evolution_safe_cycle',
    text: 'Safe intensive evolution cycle: train local memory, activate runtime, and run proof gates without deploy, delete, secret exposure, or live commerce.',
    source: 'scripts/run_intensive_evolution.js',
    truth_state: 'built',
  });
  const runtime = await post('/api/evo-runtime/activate', { runId, source: 'safe_intensive_evolution_script' });
  const selfCycle = await post('/api/self-implementation/cycle', {
    applyFixes: false,
    runTests: true,
    runBuild: true,
    source: 'safe_intensive_evolution_script',
    runId,
  });

  
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

