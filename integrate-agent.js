/**
 * INTEGRATION INSTRUCTION FOR promptbridge-server.js
 * 
 * Add this to the top of promptbridge-server.js (after other imports):
 */

/*
// ─── INTEGRATION: Add this import ───
import { setupAgentRoutes } from './agent-integration.js';

// ─── INTEGRATION: Add this after app.use(express.json...) ───
// Around line 1615-1620 in promptbridge-server.js:
setupAgentRoutes(app);

// ─── The agent routes will then be available: ───
// GET  /api/agent/health
// POST /api/agent/chat
// GET  /api/agent/thread
// POST /api/agent/reset
// GET  /api/agent/history
*/

// AUTO-PATCH: Run this to add the integration automatically:
// node integrate-agent.js

import fs from 'fs';
import path from 'path';

const BRIDGE_SERVER_PATH = './promptbridge-server.js';
const INTEGRATION_IMPORT = "import { setupAgentRoutes } from './agent-integration.js';";
const INTEGRATION_SETUP = 'setupAgentRoutes(app);';

function integrateAgent() {
  console.log('🔧 [Agent Integration] Starting automatic integration...\n');

  // Read the current bridge server
  let content = fs.readFileSync(BRIDGE_SERVER_PATH, 'utf8');

  // 1. Check if already integrated
  if (content.includes('setupAgentRoutes')) {
    console.log('✅ Agent routes already integrated. Skipping.\n');
    return;
  }

  // 2. Add import at the top (after existing imports)
  if (!content.includes(INTEGRATION_IMPORT)) {
    const importInsertPoint = content.lastIndexOf("import") + content.slice(content.lastIndexOf("import")).indexOf('\n');
    content = content.slice(0, importInsertPoint + 1) + `\n${INTEGRATION_IMPORT}\n` + content.slice(importInsertPoint + 1);
    console.log('✅ Added import statement');
  }

  // 3. Add setupAgentRoutes call after app.use(express.json...)
  const jsonLineIndex = content.indexOf("app.use(express.json");
  if (jsonLineIndex > -1) {
    const lineEnd = content.indexOf('\n', jsonLineIndex);
    content = content.slice(0, lineEnd + 1) + `\n// ─── OpenAI Agent Routes ──────────────────────\n${INTEGRATION_SETUP}\n` + content.slice(lineEnd + 1);
    console.log('✅ Added setupAgentRoutes() call');
  }

  // 4. Write back
  fs.writeFileSync(BRIDGE_SERVER_PATH, content, 'utf8');
  console.log('\n✅ Integration complete!\n');
  console.log('📋 Next steps:');
  console.log('   1. Run: npm run create:agent');
  console.log('   2. Run: npm run dev:all');
  console.log('   3. Test: curl http://127.0.0.1:3001/api/agent/health\n');
}

// Run integration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  integrateAgent();
}

export { integrateAgent };
