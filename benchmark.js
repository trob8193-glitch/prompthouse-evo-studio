const start = Date.now();
fetch('http://localhost:3001/status').then(r => console.log('Latency:', Date.now() - start + 'ms'));