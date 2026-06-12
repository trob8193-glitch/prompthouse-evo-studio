const result = await fetch('http://localhost:3001/api/agent/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'sentinel audit ai', botId: 'evo' })
});
const data = await result.json();
console.log(JSON.stringify(data, null, 2));
