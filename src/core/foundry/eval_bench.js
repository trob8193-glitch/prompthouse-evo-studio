// src/core/foundry/eval_bench.js
// Minimal evaluation bench utilities (no synthetic scoring).

export async function benchmarkChat({
  bridgeUrl = 'http://127.0.0.1:3001',
  messages = [{ role: 'user', content: 'ping' }],
  systemPrompt = '',
}) {
  const startedAt = Date.now();
  const res = await fetch(`${bridgeUrl}/api/evo-lm/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, systemPrompt }),
  });
  const data = await res.json().catch(() => ({}));
  const endedAt = Date.now();

  if (!res.ok) {
    const msg = data?.error || res.statusText || 'chat failed';
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }

  return {
    ok: true,
    transport: data.transport || 'unknown',
    model: data.model || null,
    latency_ms: endedAt - startedAt,
    message_len: String(data.message || '').length,
    at: new Date(startedAt).toISOString(),
  };
}

