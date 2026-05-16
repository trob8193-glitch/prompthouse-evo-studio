import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config({ override: true });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

async function train() {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || 'gpt-4o';

  if (!apiKey) {
    console.error('❌ OPENAI_API_KEY missing in .env');
    process.exit(1);
  }

  const client = new OpenAI({ apiKey });

  console.log(`📡 [Train] Requesting high-density LLM Training knowledge from OpenAI (${model})...`);

  const prompt = `
You are the Cloud Core of the PromptHouse Evo Studio. 
The user wants to train the studio on "advanced LLM model training local and with API".
Generate a massive, high-density, production-grade guide covering:
1. **Advanced LLM Model Training**: Principles of fine-tuning, LoRA (Low-Rank Adaptation), and prompt engineering for complex reasoning.
2. **Local Training & Inference**: How to run local models (e.g., via WebGPU, Ollama, or custom runtimes) and perform small-scale heuristic training or RAG (Retrieval-Augmented Generation) locally.
3. **API-Based Training**: How to use high-tier cloud models (OpenAI, Gemini) to process large codebase corpora, generate synthetic training data, and guide self-evolution loops.
4. **Hybrid Orchestration**: Strategies for seamlessly switching between Local Core and Cloud Core based on cost, latency, and task complexity (the Dual-Core architecture).

Format the output as a clean Markdown file with a professional, sovereign tone.
Include code snippets and architecture concepts where relevant.
`;

  try {
    const response = await client.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: 'You are a master AI research scientist and machine learning engineer.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 4000 // Large response
    });

    const content = response.choices[0].message.content;
    const outputPath = path.join(root, 'docs/knowledge/llm_model_training.md');
    
    // Ensure directory exists
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    
    fs.writeFileSync(outputPath, content, 'utf8');
    console.log(`✅ [Train] Knowledge file created at: ${outputPath}`);
    
  } catch (err) {
    console.error('❌ [Train] Error:', err.message);
  }
}

train();
