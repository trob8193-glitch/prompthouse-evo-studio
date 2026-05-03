const http = require('http');

async function testEndpoint(path, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(body) }));
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function verify() {
  console.log('--- PH EVO BROWSER BRIDGE HANDSHAKE VERIFICATION ---');
  
  try {
    const pbResult = await testEndpoint('/api/browser-bridge/promptbase', { 
      url: 'https://github.com/openai/openai-python',
      title: 'OpenAI Python SDK',
      selection: 'import openai'
    });
    console.log('[PROMPTBASE] Status:', pbResult.status, 'Proof:', pbResult.body.proof_file);

    const fcResult = await testEndpoint('/api/browser-bridge/forgecapsule', {
      name: 'Test Capsule',
      context: 'Testing bridge integration'
    });
    console.log('[FORGECAPSULE] Status:', fcResult.status, 'Proof:', fcResult.body.proof_file);

    const prResult = await testEndpoint('/api/browser-bridge/proof', {
      missionId: 'M-123',
      result: 'Bridge handshake verified'
    });
    console.log('[PROOF] Status:', prResult.status, 'Proof:', prResult.body.proof_file);

    console.log('--- VERIFICATION COMPLETE ---');
  } catch (e) {
    console.error('Verification failed:', e.message);
  }
}

verify();
