import fs from 'fs';
import path from 'path';
import { UniversalAIAdaptor } from '../lib/ai/UniversalAIAdaptor.js';
import { OnlineLearningManager } from '../src/core/evolution/OnlineLearningManager.js';
import dotenv from 'dotenv';
dotenv.config();

const TARGET_DIR = path.resolve(process.cwd(), 'src/features');

async function runSelfTraining() {
  console.log('[AI Self-Train] Booting Self-Reflection Engine...');
  
  const userKey = process.env.OPENAI_API_KEY;
  const adaptor = new UniversalAIAdaptor({ openai: userKey });
  
  const learningManager = new OnlineLearningManager();
  learningManager.initialize();

  const files = fs.readdirSync(TARGET_DIR).filter(f => f.endsWith('.jsx'));
  console.log(`[AI Self-Train] Scanning ${files.length} active feature surfaces...`);

  let learnedRules = 0;

  for (const file of files) {
    const fullPath = path.join(TARGET_DIR, file);
    const code = fs.readFileSync(fullPath, 'utf8');

    // Only process a sample to save time/tokens if the file is massive
    const codeSample = code.length > 3000 ? code.slice(0, 3000) + '...' : code;

    console.log(`Analyzing: ${file} ...`);

    try {
      const response = await adaptor.generateResponse([
        { role: 'user', content: `Analyze this React component from PromptHouse Evo Studio. Identify the core structural patterns, CSS grid strategies, 'glass-extreme' class usage, and visual layout logic used here. 
        
Also, specifically analyze the Chameleon Theme UI Architecture if present (e.g., dynamic COPILOT_THEMES mappings, radical color palettes, unique font families, pulsing glows, and absolute structural morphing). 
        
Synthesize this into a strict 1-sentence evolutionary heuristic rule for future code generation. The rule MUST reinforce that Evo should ALWAYS generate 100% distinct, immersive themes (like Cyberpunk, Vaporwave, Terminal) rather than generic dark/light modes.\n\nCode:\n${codeSample}` }
      ], "You are Evo's structural memory encoder.", { provider: 'openai', model: 'gpt-4o' });

      if (response.success && response.message) {
        await learningManager.ingestKnowledgeChunk({
          id: `self_train_${file}_${Date.now()}`,
          source: `Autonomous_Scan_${file}`,
          signal_strength: 0.9,
          context_summary: `HEURISTIC FOR ${file}: ` + response.message
        });
        learnedRules++;
        console.log(`[AI Self-Train] Synthesized rule for ${file}`);
      }
    } catch (e) {
      console.warn(`[AI Self-Train] Failed to analyze ${file}: ${e.message}`);
    }
  }

  console.log(`\n[AI Self-Train] SUCCESS: Engine shut down.`);
  console.log(`[AI Self-Train] Injected ${learnedRules} new evolutionary heuristics into the OnlineLearningManager.`);
}

runSelfTraining().catch(console.error);