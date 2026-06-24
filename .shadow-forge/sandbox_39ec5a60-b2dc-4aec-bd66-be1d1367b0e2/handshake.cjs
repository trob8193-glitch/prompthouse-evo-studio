const http = require('http');

const data = JSON.stringify({
  messages: [{ role: 'user', content: "[HANDSHAKE] Browser Bridge connected. Awaiting instructions for SelfBuild activation." }],
  systemPrompt: "You are the PH Evo Studio Operator. Handle handshakes and trigger SelfBuild processes."
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/chat',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('Response:', body);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
