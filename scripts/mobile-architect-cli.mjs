import { MobileEngine } from '../src/mobile-engine.js';
import { UniversalAIAdaptor } from '../lib/ai/UniversalAIAdaptor.js';
import dotenv from 'dotenv';
import path from 'path';

import { Log } from '../src/core/autonomy/SovereignLogger.js';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const feature = process.argv[2] || 'Home';
const arch = process.argv[3] || 'clean_riverpod';

Log.info(`\x1b[36m[Mobile Architect]\x1b[0m Synthesizing mobile architecture...`);
Log.info(`  -> Feature: ${feature}`);
Log.info(`  -> Architecture: ${arch}`);

async function run() {
  const userConfig = {
    openai: process.env.OPENAI_API_KEY || '',
    anthropic: process.env.ANTHROPIC_API_KEY || '',
    gemini: process.env.GEMINI_API_KEY || ''
  };
  const aiAdaptor = new UniversalAIAdaptor(userConfig);
  const engine = new MobileEngine(aiAdaptor);
  const result = await engine.execute({ feature, arch });
  
  if (result.success) {
    Log.info(`\x1b[32m[SUCCESS]\x1b[0m ${result.result}`);
  } else {
    Log.error(`\x1b[31m[ERROR]\x1b[0m Synthesis failed: ${result.error}`);
    process.exit(1);
  }
}

run().catch(err => {
  Log.error(`\x1b[31m[FATAL]\x1b[0m ${err.message}`);
  process.exit(1);
});
