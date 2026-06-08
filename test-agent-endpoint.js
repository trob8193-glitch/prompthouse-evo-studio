import http from 'http';

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/agent/health',
  method: 'GET'
};

console.log('Testing GET http://localhost:3001/api/agent/health\n');

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers:`, res.headers);
    console.log(`Body: ${data}`);
    
    if (res.statusCode === 200) {
      console.log('\n✅ Agent route is working!');
    } else {
      console.log('\n❌ Agent route returned error status');
    }
  });
});

req.on('error', (error) => {
  console.error(`Error: ${error.message}`);
});

req.end();
