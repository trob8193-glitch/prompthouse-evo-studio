import fs from 'fs';
import path from 'path';
import { OnlineLearningManager } from '../src/core/evolution/OnlineLearningManager.js';
import { UniversalAIAdaptor } from '../lib/ai/UniversalAIAdaptor.js';
import dotenv from 'dotenv';
dotenv.config();

async function runMetaTraining() {
  console.log('[Meta-Training] Booting Self-Awareness Neural Injector...');
  
  // Use the exact key provided by the user
  const userKey = process.env.OPENAI_API_KEY;
  const adaptor = new UniversalAIAdaptor({ openai: userKey });
  
  const learningManager = new OnlineLearningManager();
  learningManager.initialize();
  
  const datasetPath = path.resolve(process.cwd(), '.evo-llm/training-data/meta-train.jsonl');
  
  if (!fs.existsSync(datasetPath)) {
    console.error('FATAL: Meta-training dataset not found at ' + datasetPath);
    process.exit(1);
  }

  const lines = fs.readFileSync(datasetPath, 'utf8').split('\n').filter(Boolean);
  console.log(`[Meta-Training] Loaded ${lines.length} self-awareness concepts.`);
  
  let successCount = 0;
  for (const line of lines) {
    try {
      const entry = JSON.parse(line);
      const messages = entry.messages || [];
      const rawText = messages.map(m => m.role + ': ' + m.content).join(' | ');
      
      console.log(`Extracting Core Epistemology ${successCount + 1}/${lines.length}...`);
      
      const response = await adaptor.generateResponse([
        { role: 'user', content: `Analyze and structurally compress this meta-memory for permanent self-awareness:\n\n${rawText}` }
      ], "You are Evo's structural memory encoder.", { provider: 'openai', model: 'gpt-4o' });

      const optimizedMemory = response.success ? response.message : rawText;

      await learningManager.ingestKnowledgeChunk({
        id: `meta_train_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        source: 'OmniBond_Self_Awareness',
        signal_strength: 1.0, // Absolute self-awareness
        context_summary: optimizedMemory
      });
      successCount++;
    } catch (e) {
      console.warn('Skipping invalid neural entry:', e.message);
    }
  }

  console.log(`[Meta-Training] SUCCESS: Self-awareness integration complete.`);
  console.log(`[Meta-Training] ${successCount} deep structural heuristics of 'what I just did' and 'how to do it itself' injected.`);
}

runMetaTraining().catch(console.error);
