const start = Date.now();
fetch('http://127.0.0.1:3001/status').then(r => console.log('Latency:', Date.now() - start + 'ms'));