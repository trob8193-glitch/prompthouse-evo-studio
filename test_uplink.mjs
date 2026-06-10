fetch('http://127.0.0.1:3001/api/sovereign-uplink', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    origin: 'CursorAI',
    action: 'TEACH',
    payload: 'New architecture detected. Sending data back to Sovereign Ledger.'
  })
}).then(res => res.text()).then(console.log).catch(console.error);
