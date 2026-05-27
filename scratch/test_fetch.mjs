import fetch from 'node-fetch';
async function run() {
  const res = await fetch('http://127.0.0.1:3001/api/intelligence/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ module: 'Terminal', action: 'run', payload: { command: 'evo info' } })
  });
  console.log('Status:', res.status, res.statusText);
  console.log(await res.text());
}
run();
