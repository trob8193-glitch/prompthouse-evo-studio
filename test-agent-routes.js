import express from 'express';
import { setupAgentRoutes } from './agent-integration.js';

const app = express();
app.use(express.json());

console.log('Before setupAgentRoutes');
try {
  setupAgentRoutes(app);
  console.log('After setupAgentRoutes - success');
} catch (err) {
  console.error('Error in setupAgentRoutes:', err.message);
}

// Start a test server
const server = app.listen(3333, '127.0.0.1', () => {
  console.log('\n✅ Test server started on http://127.0.0.1:3333');
  console.log('Testing /api/agent/health...\n');

  // Test the health endpoint
  import('http').then(({ get }) => {
    get('http://127.0.0.1:3333/api/agent/health', (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        console.log('Response:', data);
        server.close();
      });
    }).on('error', (err) => {
      console.error('Request error:', err.message);
      server.close();
    });
  });
});

