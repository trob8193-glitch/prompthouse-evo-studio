import { spawn } from 'child_process';
import { generateSpatialMap } from './spatial-mapper.mjs';
import fs from 'fs';

async function runEvolution() {
  console.log('\n\x1b[35m=============================================\x1b[0m');
  console.log('\x1b[35m🧬 [EVOLUTION DAEMON] Awakening...\x1b[0m');
  console.log('\x1b[35m=============================================\x1b[0m\n');

  // Step 1: Spatial Map of current UI
  await generateSpatialMap();
  
  if (!fs.existsSync('spatial_screenshot.png')) {
    console.error('❌ [EVOLUTION DAEMON] Spatial map failed to generate. Aborting evolution.');
    return;
  }

  // Step 2: Trigger the Hybrid Vision AI
  console.log('\n🤖 \x1b[36m[EVOLUTION DAEMON] Feeding spatial data to Hybrid Vision AI...\x1b[0m');
  const prompt = `This is a spatial map of our current UI. The cyan boxes show exact bounding client rects. 
Analyze the visual hierarchy, white space, and alignment. How can we make this layout look 10% more premium and 'Apple-like'? 
If an asset is missing, use the 'generateAsset' concept to call the local Stable Diffusion node. 
Provide ONE immediate CSS or React component change I should make.`;
  
  const agentProc = spawn('node', ['agent-runtime.js', prompt, 'spatial_screenshot.png'], { stdio: 'inherit' });
  
  agentProc.on('close', async (code) => {
    console.log(`\n✅ \x1b[32m[EVOLUTION DAEMON] AI evolution round complete.\x1b[0m`);
    console.log('💤 [EVOLUTION DAEMON] Returning to slumber. The studio is evolving.');
  });
}

// Run immediately if called directly
if (process.argv[1] && process.argv[1].endsWith('evolution-daemon.mjs')) {
  runEvolution();
}
