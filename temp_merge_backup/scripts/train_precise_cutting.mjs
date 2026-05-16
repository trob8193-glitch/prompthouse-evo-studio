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

  console.log(`📡 [Train] Requesting high-density Precise Cutting knowledge from OpenAI (${model})...`);

  const prompt = `
You are the Cloud Core of the PromptHouse Evo Studio. 
The user wants to train the studio on "precise cutting, editing, and automated 5 pen etch a sketching".
Generate a massive, high-density, production-grade guide covering:
1. **Precise Cutting & Editing**: Algorithms for vector path manipulation, precise coordinate control, and edge-detection for graphics or physical plotters.
2. **Automated 5 Pen Etch a Sketching**: Path planning for multi-pen (5-axis or 5-tool) systems, avoiding collisions, optimizing draw order, and simulating complex Etch-a-Sketch style continuous line art.
3. **Control Logic**: How an AI should generate machine-code or high-precision control instructions (like G-code or SVGs) for such tasks.
4. **How to Evolve Them**: Principles of improving path efficiency and fidelity autonomously.

Format the output as a clean Markdown file with a professional, sovereign tone.
Include code snippets (e.g., in Python or JS for path algorithms) where relevant.
`;

  try {
    const response = await client.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: 'You are a master robotics engineer and computational geometry expert.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 4000 // Large response
    });

    const content = response.choices[0].message.content;
    const outputPath = path.join(root, 'docs/knowledge/precise_cutting.md');
    
    // Ensure directory exists
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    
    fs.writeFileSync(outputPath, content, 'utf8');
    console.log(`✅ [Train] Knowledge file created at: ${outputPath}`);
    
  } catch (err) {
    console.error('❌ [Train] Error:', err.message);
  }
}

train();
