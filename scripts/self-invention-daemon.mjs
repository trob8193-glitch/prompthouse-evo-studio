import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config({ override: true });

const BRIDGE_URL = process.env.BRIDGE_URL || 'http://127.0.0.1:3001';
const INTERVAL_MINUTES = 5; // Defaulting to rapid prototyping (5 minutes)
const INTERVAL_MS = INTERVAL_MINUTES * 60 * 1000;

async function requestPromptCompile(prompt) {
  const res = await fetch(`${BRIDGE_URL}/v1/prompts/compile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: prompt }],
      options: { temperature: 0.7 }
    })
  });
  if (!res.ok) throw new Error(`Compile failed: ${res.statusText}`);
  const data = await res.json();
  return data.text || data.result?.text || '';
}

async function runInventionCycle() {
  console.log(`\n🌌 [Self-Invention] Initiating AI Invention Cycle at ${new Date().toISOString()}`);
  
  // 1. Identify Need
  const needPrompt = `
You are the Sovereign Self-Invention Engine. 
Identify ONE new terminal or IDE slash-command that would improve a developer's workflow.
Return ONLY the command name (e.g., "auto-deploy" or "scan-deep" or "optimize-css").
`;
  
  let toolName = await requestPromptCompile(needPrompt);
  toolName = toolName.trim().replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
  
  if (!toolName || toolName.length < 3) {
    console.log(`⚠️ [Self-Invention] AI failed to propose a valid tool name.`);
    return;
  }
  
  console.log(`💡 [Self-Invention] AI Proposed new tool: ${toolName}`);

  // 2. Propose & Implement
  const codePrompt = `
Write a Node.js ESM module for a new CLI/IDE tool called "${toolName}".
The module MUST export a default class with an 'async execute(args, session)' method.
It must return an object: { success: boolean, output: string }.
Do not use markdown blocks, return pure JS code.

Example structure:
export default class {
  async execute(args, session) {
    return { success: true, output: "Execution result" };
  }
}
`;

  let code = await requestPromptCompile(codePrompt);
  code = code.replace(/```javascript/gi, '').replace(/```js/gi, '').replace(/```/g, '').trim();

  if (!code.includes('export default class') && !code.includes('execute(')) {
    console.log(`⚠️ [Self-Invention] AI generated invalid code for ${toolName}. Skipping.`);
    return;
  }

  // 3. Verify & Write
  const toolPath = path.join(process.cwd(), 'src/invented_tools', `${toolName}.js`);
  fs.writeFileSync(toolPath, code, 'utf8');
  
  // Update registry
  const registryPath = path.join(process.cwd(), 'src/invented_tools/registry.json');
  let registry = { tools: {} };
  if (fs.existsSync(registryPath)) {
    registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
  }
  registry.tools[toolName] = { file: `src/invented_tools/${toolName}.js`, timestamp: new Date().toISOString() };
  fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2), 'utf8');

  console.log(`✅ [Self-Invention] Tool '${toolName}' written to ${toolPath} and registered!`);
}

console.log('🌌 [Self-Invention] Starting Autonomous Invention Daemon...');
console.log(`🌉 Bridge: ${BRIDGE_URL}`);
console.log(`⏱️ Interval: ${INTERVAL_MINUTES} minute(s)`);

runInventionCycle().catch(e => console.error(`❌ [Self-Invention] Cycle error: ${e.message}`));

setInterval(() => {
  runInventionCycle().catch(e => console.error(`❌ [Self-Invention] Cycle error: ${e.message}`));
}, INTERVAL_MS);
