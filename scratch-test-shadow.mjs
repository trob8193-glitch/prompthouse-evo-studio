import { SHADOW_FORGE } from './src/core/autonomy/ShadowForge.js';
import fs from 'fs';

async function test() {
  const ghostCode = `/* EVO MUTATION */ .interstitial-wrapper { margin: 16px 0; }`;
  const result = await SHADOW_FORGE.shadowBuild('evo_css_12345678', ghostCode);
  console.log('Result:', result);
}

test();
