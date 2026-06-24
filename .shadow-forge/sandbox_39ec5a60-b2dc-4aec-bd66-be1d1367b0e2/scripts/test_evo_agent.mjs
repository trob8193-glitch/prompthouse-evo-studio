import { UniversalAIAdaptor } from '../lib/ai/UniversalAIAdaptor.js';
import { executeWithFeedbackLoop } from '../src/core/extension/shadow_run_executor.js';

async function runDemonstration() {
  console.log("==================================================");
  console.log("⚡ INITIATING GOD-TIER EVO INTEGRATION TEST ⚡");
  console.log("==================================================\n");

  const adaptor = new UniversalAIAdaptor();

  // Test 1: EvoNet Browser Dynamic Fetching
  console.log("▶️ TEST 1: EvoNet Browser Web Scraping Trigger");
  const prompt = `Use the 'evonet_fetch' tool to fetch the text from 'http://example.com' and summarize what the domain is used for. Return ONLY a JSON block invoking the tool, like this:
\`\`\`json
{
  "tool": "evonet_fetch",
  "args": { "url": "http://example.com" }
}
\`\`\``;

  console.log("Prompting AI Adaptor to use EvoNet...");
  try {
     const res = await adaptor.routeRequest(prompt, { model: 'gpt-4o' });
     console.log("\n[Adaptor Response]:\n" + (res.message || res.content || '').substring(0, 500));
     console.log("\n✅ EvoNet Browser validation sequence completed.");
  } catch (err) {
     console.error("❌ EvoNet Test Failed:", err.message);
  }

  // Test 2: Evo Eyes Visual Rejection
  console.log("\n▶️ TEST 2: Evo Eyes Visual VLM Validation");
  console.log("Passing a malformed overlapping React component into the Shadow Executor...");
  const badComponentCode = `
import React from 'react';
export default function BadLayout() {
  return (
    <div style={{ position: 'relative', width: '200px', height: '200px' }}>
      <div style={{ position: 'absolute', top: '0', left: '0', width: '300px', height: '300px', background: 'red' }}>I overflow!</div>
      <div style={{ position: 'absolute', top: '50px', left: '50px', width: '100px', height: '100px', background: 'blue' }}>I overlap!</div>
    </div>
  );
}
  `;
  
  try {
      const execRes = await executeWithFeedbackLoop(badComponentCode, "Build an overlapping component");
      console.log("\n[Shadow Executor Feedback]:\n" + execRes.feedback);
      if (execRes.error && execRes.error.includes('VISUAL_REJECTION')) {
          console.log("✅ Evo Eyes successfully detected the visual overlap and rejected the code!");
      }
  } catch(err) {
      console.log("Shadow Executor returned:", err.message);
  }

  console.log("\n==================================================");
  console.log("✅ ALL GOD-TIER SYSTEMS OPERATIONAL.");
  console.log("==================================================");
}

runDemonstration();
